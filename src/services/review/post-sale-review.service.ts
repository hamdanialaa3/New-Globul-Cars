// src/services/review/post-sale-review.service.ts
// Post-Sale Review Service - خدمة التقييمات بعد البيع
// الهدف: نظام تقييمات إلزامي للمشترين والبائعين بعد إتمام الصفقة

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from '@/services/logger-service';
import { trustScoreService } from '@/services/profile/trust-score-service';

/**
 * Review Data Interface
 */
export interface PostSaleReview {
  id?: string;
  carId: string;
  sellerId: string;
  buyerId: string;
  rating: number; // 1-5
  reviewType: 'seller' | 'buyer';
  reviewerRole: 'buyer' | 'seller';
  comment?: string;
  aspectRatings: {
    communication: number; // 1-5
    accuracy: number; // مطابقة الوصف للواقع
    condition: number; // حالة السيارة
    fairness: number; // عدالة السعر
  };
  verified: boolean; // تم التحقق من الشراء
  helpful: number; // عدد من وجدوا التقييم مفيداً
  reportCount: number; // عدد البلاغات
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

/**
 * Review Incentive Interface
 */
interface ReviewIncentive {
  pointsAwarded: number;
  badgeUnlocked?: string;
  discountCoupon?: string;
}

/**
 * Post-Sale Review Service Class
 */
class PostSaleReviewService {
  private static instance: PostSaleReviewService;
  private readonly REVIEWS_COLLECTION = 'reviews';
  private readonly INCENTIVE_POINTS = 40; // نقاط المكافأة لترك تقييم

  private constructor() {}

  public static getInstance(): PostSaleReviewService {
    if (!PostSaleReviewService.instance) {
      PostSaleReviewService.instance = new PostSaleReviewService();
    }
    return PostSaleReviewService.instance;
  }

  // ==================== CREATE REVIEW ====================

  /**
   * Create a new review
   * إنشاء تقييم جديد بعد البيع
   */
  async createReview(reviewData: Omit<PostSaleReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    reviewId: string;
    incentive: ReviewIncentive;
  }> {
    try {
      // 1. Validate review eligibility
      await this.validateReviewEligibility(reviewData);

      // 2. Create review document
      const reviewDoc = {
        ...reviewData,
        verified: await this.verifySaleTransaction(reviewData.carId, reviewData.buyerId, reviewData.sellerId),
        helpful: 0,
        reportCount: 0,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.REVIEWS_COLLECTION), reviewDoc);

      // 3. Update user statistics
      await this.updateUserReviewStats(reviewData);

      // 4. Award incentive
      const incentive = await this.awardReviewIncentive(
        reviewData.reviewerRole === 'buyer' ? reviewData.buyerId : reviewData.sellerId
      );

      // 5. Update trust score
      await trustScoreService.calculateTrustScore(
        reviewData.reviewType === 'seller' ? reviewData.sellerId : reviewData.buyerId
      );

      serviceLogger.info('Review created successfully', { reviewId: docRef.id });

      return {
        reviewId: docRef.id,
        incentive
      };
    } catch (error) {
      serviceLogger.error('Error creating review', error as Error, { reviewData });
      throw error;
    }
  }

  // ==================== GET REVIEWS ====================

  /**
   * Get reviews for a user (seller or buyer)
   * الحصول على تقييمات مستخدم
   */
  async getUserReviews(userId: string, userType: 'seller' | 'buyer'): Promise<PostSaleReview[]> {
    try {
      const field = userType === 'seller' ? 'sellerId' : 'buyerId';
      
      const q = query(
        collection(db, this.REVIEWS_COLLECTION),
        where(field, '==', userId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PostSaleReview));
    } catch (error) {
      serviceLogger.error('Error fetching user reviews', error as Error, { userId, userType });
      return [];
    }
  }

  /**
   * Get average rating for user
   * الحصول على متوسط التقييم
   */
  async getUserAverageRating(userId: string, userType: 'seller' | 'buyer'): Promise<{
    overall: number;
    count: number;
    breakdown: {
      communication: number;
      accuracy: number;
      condition: number;
      fairness: number;
    };
  }> {
    try {
      const reviews = await this.getUserReviews(userId, userType);
      
      if (reviews.length === 0) {
        return {
          overall: 0,
          count: 0,
          breakdown: { communication: 0, accuracy: 0, condition: 0, fairness: 0 }
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const overall = totalRating / reviews.length;

      // Calculate aspect averages
      const breakdown = {
        communication: reviews.reduce((sum, r) => sum + r.aspectRatings.communication, 0) / reviews.length,
        accuracy: reviews.reduce((sum, r) => sum + r.aspectRatings.accuracy, 0) / reviews.length,
        condition: reviews.reduce((sum, r) => sum + r.aspectRatings.condition, 0) / reviews.length,
        fairness: reviews.reduce((sum, r) => sum + r.aspectRatings.fairness, 0) / reviews.length
      };

      return {
        overall: Math.round(overall * 10) / 10,
        count: reviews.length,
        breakdown
      };
    } catch (error) {
      serviceLogger.error('Error calculating average rating', error as Error, { userId, userType });
      return {
        overall: 0,
        count: 0,
        breakdown: { communication: 0, accuracy: 0, condition: 0, fairness: 0 }
      };
    }
  }

  // ==================== VALIDATION ====================

  /**
   * Validate review eligibility
   * التحقق من أهلية كتابة التقييم
   */
  private async validateReviewEligibility(reviewData: Omit<PostSaleReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    // 1. Check if user already reviewed this transaction
    const existingReview = await this.checkExistingReview(
      reviewData.carId,
      reviewData.reviewerRole === 'buyer' ? reviewData.buyerId : reviewData.sellerId
    );

    if (existingReview) {
      throw new Error('Review already exists for this transaction');
    }

    // 2. Validate rating range
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // 3. Validate aspect ratings
    const aspects = Object.values(reviewData.aspectRatings);
    if (aspects.some(rating => rating < 1 || rating > 5)) {
      throw new Error('All aspect ratings must be between 1 and 5');
    }
  }

  /**
   * Check if review already exists
   */
  private async checkExistingReview(carId: string, reviewerId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.REVIEWS_COLLECTION),
        where('carId', '==', carId),
        where('reviewerId', '==', reviewerId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify sale transaction
   * التحقق من صحة عملية البيع
   */
  private async verifySaleTransaction(
    carId: string,
    buyerId: string,
    sellerId: string
  ): Promise<boolean> {
    try {
      // Check if car was sold and buyers match
      const carRef = doc(db, 'cars', carId);
      const carSnap = await getDoc(carRef);

      if (!carSnap.exists()) return false;

      const carData = carSnap.data();
      return carData.isSold === true && carData.sellerId === sellerId;
    } catch (error) {
      return false;
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Update user review statistics
   */
  private async updateUserReviewStats(reviewData: Omit<PostSaleReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const userId = reviewData.reviewType === 'seller' ? reviewData.sellerId : reviewData.buyerId;
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        [`stats.reviewsReceived`]: increment(1),
        [`stats.totalRating`]: increment(reviewData.rating),
        'stats.lastReviewAt': serverTimestamp()
      });
    } catch (error) {
      serviceLogger.warn('Failed to update user review stats', { error, reviewData });
    }
  }

  // ==================== INCENTIVES ====================

  /**
   * Award incentive for leaving review
   * منح حافز لترك تقييم
   */
  private async awardReviewIncentive(userId: string): Promise<ReviewIncentive> {
    try {
      // Award points
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.points': increment(this.INCENTIVE_POINTS)
      });

      // Check for badge unlock (e.g., "مراجع موثوق" after 10 reviews)
      const userDoc = await getDoc(userRef);
      const reviewCount = userDoc.data()?.stats?.reviewsGiven || 0;

      let badge: string | undefined;
      if (reviewCount === 10) {
        badge = 'TRUSTED_REVIEWER';
        await trustScoreService.awardBadge(userId, badge);
      }

      return {
        pointsAwarded: this.INCENTIVE_POINTS,
        badgeUnlocked: badge
      };
    } catch (error) {
      serviceLogger.warn('Failed to award review incentive', { error, userId });
      return { pointsAwarded: 0 };
    }
  }

  // ==================== HELPFUL VOTES ====================

  /**
   * Mark review as helpful
   * تحديد التقييم كمفيد
   */
  async markReviewAsHelpful(reviewId: string, voterId: string): Promise<void> {
    try {
      const reviewRef = doc(db, this.REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        helpful: increment(1),
        [`helpfulVoters.${voterId}`]: true
      });
    } catch (error) {
      serviceLogger.error('Error marking review as helpful', error as Error, { reviewId, voterId });
      throw error;
    }
  }

  // ==================== REPORTING ====================

  /**
   * Report review as inappropriate
   * الإبلاغ عن تقييم غير لائق
   */
  async reportReview(reviewId: string, reporterId: string, reason: string): Promise<void> {
    try {
      const reviewRef = doc(db, this.REVIEWS_COLLECTION, reviewId);
      
      await updateDoc(reviewRef, {
        reportCount: increment(1),
        [`reports.${reporterId}`]: {
          reason,
          timestamp: serverTimestamp()
        }
      });

      // Auto-hide review if reports exceed threshold
      const reviewDoc = await getDoc(reviewRef);
      if (reviewDoc.data()?.reportCount >= 5) {
        await updateDoc(reviewRef, { status: 'rejected' });
      }
    } catch (error) {
      serviceLogger.error('Error reporting review', error as Error, { reviewId, reporterId });
      throw error;
    }
  }
}

export const postSaleReviewService = PostSaleReviewService.getInstance();
export default postSaleReviewService;
