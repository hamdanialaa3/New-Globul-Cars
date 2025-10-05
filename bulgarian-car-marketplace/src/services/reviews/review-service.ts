// src/services/reviews/review-service.ts
// Review Service - خدمة المراجعات والتقييمات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { trustScoreService } from '../profile/trust-score-service';

// ==================== INTERFACES ====================

export interface Review {
  id?: string;
  sellerId: string;
  buyerId: string;
  carId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  transactionType: 'purchase' | 'inquiry' | 'viewing';
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  notHelpful: number;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  moderatedAt?: Date;
  moderatedBy?: string;
  response?: {
    text: string;
    createdAt: Date;
    userId: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendationRate: number;
  verifiedPurchaseRate: number;
}

export interface SubmitReviewData {
  sellerId: string;
  buyerId: string;
  carId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  transactionType: 'purchase' | 'inquiry' | 'viewing';
  verifiedPurchase: boolean;
}

// ==================== SERVICE CLASS ====================

export class ReviewService {
  private static instance: ReviewService;
  private readonly COLLECTION = 'reviews';
  private readonly MAX_REVIEW_LENGTH = 1000;
  private readonly MIN_REVIEW_LENGTH = 50;

  private constructor() {}

  public static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Submit a new review
   * تقديم مراجعة جديدة
   */
  async submitReview(data: SubmitReviewData): Promise<{ success: boolean; message: string; reviewId?: string }> {
    try {
      // 1. Validate review
      const validation = this.validateReview(data);
      if (!validation.valid) {
        return { success: false, message: validation.message! };
      }

      // 2. Check if user already reviewed this seller
      const existing = await this.hasUserReviewedSeller(data.buyerId, data.sellerId);
      if (existing) {
        return {
          success: false,
          message: 'Вече сте написали отзив за този продавач / You already reviewed this seller'
        };
      }

      // 3. Create review
      const reviewData: Omit<Review, 'id'> = {
        ...data,
        status: 'pending',
        helpful: 0,
        notHelpful: 0,
        reportCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 4. Update seller stats
      await this.updateSellerStats(data.sellerId);

      // 5. Award badge if criteria met
      await trustScoreService.checkReviewBadges(data.sellerId);

      console.log('✅ Review submitted:', docRef.id);

      return {
        success: true,
        message: 'Отзивът е изпратен за одобрение / Review submitted for approval',
        reviewId: docRef.id
      };

    } catch (error: any) {
      console.error('❌ Submit review failed:', error);
      return {
        success: false,
        message: error.message || 'Грешка при изпращане / Submission failed'
      };
    }
  }

  /**
   * Get reviews for a seller
   * الحصول على مراجعات البائع
   */
  async getSellerReviews(sellerId: string, limitCount: number = 10): Promise<Review[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('sellerId', '==', sellerId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        moderatedAt: doc.data().moderatedAt?.toDate()
      } as Review));

    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      return [];
    }
  }

  /**
   * Get review statistics for a seller
   * الحصول على إحصائيات المراجعات للبائع
   */
  async getSellerReviewStats(sellerId: string): Promise<ReviewStats> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('sellerId', '==', sellerId),
        where('status', '==', 'approved')
      );

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => doc.data() as Review);

      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recommendationRate: 0,
          verifiedPurchaseRate: 0
        };
      }

      // Calculate stats
      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / totalReviews;

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      };

      const recommendCount = reviews.filter(r => r.wouldRecommend).length;
      const recommendationRate = (recommendCount / totalReviews) * 100;

      const verifiedCount = reviews.filter(r => r.verifiedPurchase).length;
      const verifiedPurchaseRate = (verifiedCount / totalReviews) * 100;

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        recommendationRate: Math.round(recommendationRate),
        verifiedPurchaseRate: Math.round(verifiedPurchaseRate)
      };

    } catch (error) {
      console.error('❌ Error calculating stats:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendationRate: 0,
        verifiedPurchaseRate: 0
      };
    }
  }

  /**
   * Mark review as helpful
   * وضع علامة مفيد على المراجعة
   */
  async markHelpful(reviewId: string, helpful: boolean): Promise<boolean> {
    try {
      const reviewRef = doc(db, this.COLLECTION, reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) return false;

      const data = reviewDoc.data();
      
      await updateDoc(reviewRef, {
        helpful: helpful ? (data.helpful || 0) + 1 : data.helpful || 0,
        notHelpful: !helpful ? (data.notHelpful || 0) + 1 : data.notHelpful || 0,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('❌ Error marking helpful:', error);
      return false;
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Validate review data
   * التحقق من بيانات المراجعة
   */
  private validateReview(data: SubmitReviewData): { valid: boolean; message?: string } {
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return { valid: false, message: 'Невалиден рейтинг / Invalid rating' };
    }

    if (!data.title || data.title.trim().length < 10) {
      return { valid: false, message: 'Заглавието трябва да е поне 10 символа / Title must be at least 10 characters' };
    }

    if (!data.comment || data.comment.trim().length < this.MIN_REVIEW_LENGTH) {
      return { valid: false, message: `Коментарът трябва да е поне ${this.MIN_REVIEW_LENGTH} символа / Comment must be at least ${this.MIN_REVIEW_LENGTH} characters` };
    }

    if (data.comment.length > this.MAX_REVIEW_LENGTH) {
      return { valid: false, message: `Коментарът не трябва да надвишава ${this.MAX_REVIEW_LENGTH} символа / Comment must not exceed ${this.MAX_REVIEW_LENGTH} characters` };
    }

    return { valid: true };
  }

  /**
   * Check if user already reviewed seller
   * التحقق إذا كان المستخدم قد راجع البائع من قبل
   */
  private async hasUserReviewedSeller(buyerId: string, sellerId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('buyerId', '==', buyerId),
        where('sellerId', '==', sellerId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ Error checking existing review:', error);
      return false;
    }
  }

  /**
   * Update seller review statistics
   * تحديث إحصائيات مراجعات البائع
   */
  private async updateSellerStats(sellerId: string): Promise<void> {
    try {
      const stats = await this.getSellerReviewStats(sellerId);
      
      await updateDoc(doc(db, 'users', sellerId), {
        'stats.totalReviews': stats.totalReviews,
        'stats.averageRating': stats.averageRating,
        'stats.recommendationRate': stats.recommendationRate,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Seller stats updated');
    } catch (error) {
      console.error('❌ Error updating seller stats:', error);
    }
  }
}

// Export singleton instance
export const reviewService = ReviewService.getInstance();
