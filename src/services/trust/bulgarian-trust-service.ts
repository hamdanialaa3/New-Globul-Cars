// src/services/trust/bulgarian-trust-service.ts
// Bulgarian Trust Service - خدمة الثقة البلغارية المحسّنة
// الهدف: نظام شامل للثقة مخصص للسوق البلغاري (Bulgarian Trust Matrix)
// الموقع: بلغاريا | اللغات: BG/EN

import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, query, where, orderBy, limit, getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import {
  TrustSystem,
  TrustBadge,
  BadgeType,
  ReviewSummary,
  Review,
  ResponseMetrics,
  EGN_EIK_Info,
  TrustCalculationInput,
  TrustLevel,
  TrustScoreResult
} from '../../types/trust.types';

// ==================== CONSTANTS ====================

const TRUST_SCORE_WEIGHTS = {
  VERIFICATION: {
    EMAIL: 10,
    PHONE: 15,
    ID_EGN: 25,
    BUSINESS_EIK: 20
  },
  PROFILE_COMPLETION: 10,
  REVIEWS: 15,
  ACTIVITY: 10,
  RESPONSE_METRICS: 15
};

const MAX_TRUST_SCORE = 100;

// ==================== SERVICE CLASS ====================

/**
 * Bulgarian Trust Service
 * خدمة شاملة لحساب وإدارة نظام الثقة البلغاري
 */
export class BulgarianTrustService {
  private static instance: BulgarianTrustService;

  private constructor() {}

  public static getInstance(): BulgarianTrustService {
    if (!BulgarianTrustService.instance) {
      BulgarianTrustService.instance = new BulgarianTrustService();
    }
    return BulgarianTrustService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Calculate comprehensive trust score with detailed breakdown
   * حساب درجة الثقة الشاملة مع التفاصيل
   */
  async calculateTrustScore(userId: string): Promise<TrustScoreResult> {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error(`User not found: ${userId}`);
      }

      const user = userDoc.data();
      const input = this.prepareCalculationInput(user);
      
      // Calculate score breakdown
      const breakdown = {
        verification: this.calculateVerificationScore(input),
        reviews: this.calculateReviewsScore(input),
        activity: this.calculateActivityScore(input),
        response: this.calculateResponseScore(input)
      };

      // Total score
      const score = Math.min(
        breakdown.verification + 
        breakdown.reviews + 
        breakdown.activity + 
        breakdown.response,
        MAX_TRUST_SCORE
      );

      // Determine level
      const level = this.getTrustLevel(score);

      // Suggest badges
      const suggestedBadges = this.suggestBadges(input, score);

      // Improvement suggestions
      const improvementSuggestions = this.generateImprovementSuggestions(input, breakdown);

      const result: TrustScoreResult = {
        score,
        level,
        breakdown,
        suggestedBadges,
        improvementSuggestions
      };

      // Update in Firestore
      await this.updateTrustSystem(userId, result);

      serviceLogger.info('Trust score calculated', { userId, score, level });
      return result;

    } catch (error) {
      serviceLogger.error('Error calculating trust score', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get complete trust system for user
   * الحصول على نظام الثقة الكامل للمستخدم
   */
  async getTrustSystem(userId: string): Promise<TrustSystem | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const user = userDoc.data();
      
      // Get badges
      const badges = this.extractBadges(user);
      
      // Get reviews summary
      const reviews = await this.getReviewsSummary(userId);
      
      // Get response metrics
      const responseMetrics = await this.getResponseMetrics(userId, user);
      
      // Get EGN/EIK info
      const egnEik = this.extractEGN_EIK(user);

      const trustSystem: TrustSystem = {
        sellerScore: user.trust?.score || user.verification?.trustScore || 0,
        verificationLevel: this.getVerificationLevel(user),
        badges,
        reviews,
        responseMetrics,
        egnEik,
        lastUpdated: user.trust?.lastUpdated || serverTimestamp() as Timestamp
      };

      return trustSystem;
    } catch (error) {
      serviceLogger.error('Error getting trust system', error as Error, { userId });
      return null;
    }
  }

  /**
   * Award badge to user
   * منح شارة للمستخدم
   */
  async awardBadge(userId: string, badgeType: BadgeType): Promise<void> {
    try {
      const badge: TrustBadge = {
        type: badgeType,
        verifiedAt: serverTimestamp() as Timestamp,
        nameBg: this.getBadgeNameBg(badgeType),
        nameEn: this.getBadgeNameEn(badgeType),
        priority: this.getBadgePriority(badgeType)
      };

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error(`User not found: ${userId}`);
      }

      const user = userDoc.data();
      const currentBadges = user.verification?.badges || [];
      
      // Check if already has this badge
      if (currentBadges.some((b: TrustBadge) => b.type === badgeType)) {
        serviceLogger.debug('User already has badge', { userId, badgeType });
        return;
      }

      // Add new badge
      await updateDoc(doc(db, 'users', userId), {
        'verification.badges': [...currentBadges, badge],
        'trust.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('Badge awarded', { userId, badgeType });
    } catch (error) {
      serviceLogger.error('Error awarding badge', error as Error, { userId, badgeType });
      throw error;
    }
  }

  /**
   * Verify EGN/EIK
   * التحقق من الرقم الوطني البلغاري
   */
  async verifyEGN_EIK(userId: string, number: string, type: 'EGN' | 'EIK'): Promise<void> {
    try {
      // Validate format
      if (!this.validateEGN_EIK(number, type)) {
        throw new Error(`Invalid ${type} format`);
      }

      const egnEikInfo: EGN_EIK_Info = {
        number,
        type,
        status: 'pending',
        documents: []
      };

      await updateDoc(doc(db, 'users', userId), {
        'trust.egnEik': egnEikInfo,
        'trust.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('EGN/EIK submitted for verification', { userId, type, number });
    } catch (error) {
      serviceLogger.error('Error verifying EGN/EIK', error as Error, { userId, number, type });
      throw error;
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Prepare calculation input from user data
   */
  private prepareCalculationInput(user: any): TrustCalculationInput {
    const accountAge = user.createdAt 
      ? Math.floor((Date.now() - user.createdAt.toMillis()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      emailVerified: user.verification?.email?.verified || false,
      phoneVerified: user.verification?.phone?.verified || false,
      idVerified: user.verification?.identity?.verified || false,
      businessVerified: user.verification?.business?.verified || false,
      profileCompletion: this.calculateProfileCompletion(user),
      reviewsCount: user.rating?.total || user.stats?.totalReviews || 0,
      reviewsAverage: user.rating?.average || user.stats?.averageRating || 0,
      carsListed: user.stats?.carsListed || 0,
      carsSold: user.stats?.carsSold || 0,
      responseRate: user.stats?.responseRate || 0,
      avgResponseTime: user.stats?.responseTime || 0,
      accountAge,
      profileType: user.profileType || 'private'
    };
  }

  /**
   * Calculate verification score
   */
  private calculateVerificationScore(input: TrustCalculationInput): number {
    let score = 0;

    if (input.emailVerified) score += TRUST_SCORE_WEIGHTS.VERIFICATION.EMAIL;
    if (input.phoneVerified) score += TRUST_SCORE_WEIGHTS.VERIFICATION.PHONE;
    if (input.idVerified) score += TRUST_SCORE_WEIGHTS.VERIFICATION.ID_EGN;
    if (input.businessVerified) score += TRUST_SCORE_WEIGHTS.VERIFICATION.BUSINESS_EIK;

    return Math.min(score, 70); // Cap at 70
  }

  /**
   * Calculate reviews score
   */
  private calculateReviewsScore(input: TrustCalculationInput): number {
    if (input.reviewsCount < 3) return 0;
    
    const averageMultiplier = input.reviewsAverage / 5;
    const countBonus = Math.min(input.reviewsCount / 20, 1); // Max bonus at 20 reviews
    
    return Math.floor(TRUST_SCORE_WEIGHTS.REVIEWS * averageMultiplier * (0.7 + 0.3 * countBonus));
  }

  /**
   * Calculate activity score
   */
  private calculateActivityScore(input: TrustCalculationInput): number {
    let score = 0;
    
    // Profile completion
    score += (input.profileCompletion / 100) * 5;
    
    // Listing activity
    if (input.carsListed > 0) score += 2;
    if (input.carsSold > 0) score += 2;
    
    // Account age bonus
    if (input.accountAge > 90) score += 1;
    
    return Math.min(score, TRUST_SCORE_WEIGHTS.ACTIVITY);
  }

  /**
   * Calculate response score
   */
  private calculateResponseScore(input: TrustCalculationInput): number {
    let score = 0;
    
    // Response rate
    score += (input.responseRate / 100) * 8;
    
    // Response time (faster = better)
    if (input.avgResponseTime > 0 && input.avgResponseTime < 60) {
      score += 7; // Responds within 1 hour
    } else if (input.avgResponseTime < 240) {
      score += 4; // Responds within 4 hours
    } else if (input.avgResponseTime < 1440) {
      score += 2; // Responds within 24 hours
    }
    
    return Math.min(score, TRUST_SCORE_WEIGHTS.RESPONSE_METRICS);
  }

  /**
   * Get trust level from score
   */
  private getTrustLevel(score: number): TrustLevel {
    if (score >= 81) return TrustLevel.PREMIUM;
    if (score >= 61) return TrustLevel.VERIFIED;
    if (score >= 41) return TrustLevel.TRUSTED;
    if (score >= 21) return TrustLevel.BASIC;
    return TrustLevel.UNVERIFIED;
  }

  /**
   * Suggest badges based on user data
   */
  private suggestBadges(input: TrustCalculationInput, score: number): BadgeType[] {
    const suggestions: BadgeType[] = [];

    if (input.phoneVerified) suggestions.push('phone');
    if (input.idVerified) suggestions.push('id');
    if (input.businessVerified) suggestions.push('business');
    if (score >= 70) suggestions.push('guaranteed_seller');
    if (input.avgResponseTime < 60 && input.responseRate > 80) suggestions.push('quick_responder');
    if (input.reviewsAverage >= 4.5 && input.reviewsCount >= 5) suggestions.push('top_rated');
    if (input.profileType === 'dealer' && score >= 80) suggestions.push('premium_dealer');

    return suggestions;
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovementSuggestions(
    input: TrustCalculationInput, 
    breakdown: TrustScoreResult['breakdown']
  ): string[] {
    const suggestions: string[] = [];

    if (!input.emailVerified) {
      suggestions.push('Verify your email for +10 points');
      suggestions.push('Потвърдете имейла си за +10 точки');
    }

    if (!input.phoneVerified) {
      suggestions.push('Verify your phone for +15 points');
      suggestions.push('Потвърдете телефона си за +15 точки');
    }

    if (!input.idVerified && input.profileType === 'private') {
      suggestions.push('Verify your identity (EGN) for +25 points');
      suggestions.push('Потвърдете самоличността си (EGN) за +25 точки');
    }

    if (input.reviewsCount < 3) {
      suggestions.push('Get 3+ reviews to improve your rating');
      suggestions.push('Получете 3+ отзива за подобряване на рейтинга');
    }

    if (input.responseRate < 80) {
      suggestions.push('Improve response rate for +7 points');
      suggestions.push('Подобрете скоростта на отговор за +7 точки');
    }

    return suggestions;
  }

  /**
   * Calculate profile completion percentage
   */
  private calculateProfileCompletion(user: any): number {
    let completed = 0;
    const fields = [
      user.displayName,
      user.email,
      user.phoneNumber,
      user.bio,
      user.profileImage,
      user.coverImage,
      user.verification?.email?.verified,
      user.verification?.phone?.verified,
      user.stats?.carsListed > 0
    ];

    completed = fields.filter(Boolean).length;
    return Math.floor((completed / fields.length) * 100);
  }

  /**
   * Extract badges from user data
   */
  private extractBadges(user: any): TrustBadge[] {
    return user.verification?.badges || [];
  }

  /**
   * Get reviews summary
   */
  private async getReviewsSummary(userId: string): Promise<ReviewSummary> {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('sellerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { count: 0, average: 0, recent: [] };
      }

      let total = 0;
      const recent: ReviewSummary['recent'] = [];

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const rating = Number(data.rating) || 0;
        total += rating;

        // Keep lightweight recent list (up to 10)
        recent.push({
          id: docSnap.id,
          rating,
          comment: data.comment || '',
          createdAt: data.createdAt,
          reviewerId: data.reviewerId || '',
          reviewerName: data.reviewerName || 'Anonymous'
        });
      });

      const count = snapshot.size;
      const average = Number((total / count).toFixed(2));

      return {
        count,
        average,
        recent
      };
    } catch (error) {
      serviceLogger.error('Error getting reviews summary', error as Error, { userId });
      return { count: 0, average: 0, recent: [] };
    }
  }

  /**
   * Get response metrics
   */
  private async getResponseMetrics(userId: string, user: any): Promise<ResponseMetrics> {
    return {
      avgResponseTime: user.stats?.responseTime || 0,
      responseRate: user.stats?.responseRate || 0,
      messagesReceived: user.stats?.totalMessages || 0,
      messagesResponded: Math.floor((user.stats?.totalMessages || 0) * (user.stats?.responseRate || 0) / 100),
      lastResponseAt: user.stats?.lastResponseAt
    };
  }

  /**
   * Extract EGN/EIK info
   */
  private extractEGN_EIK(user: any): EGN_EIK_Info | undefined {
    return user.trust?.egnEik;
  }

  /**
   * Get verification level
   */
  private getVerificationLevel(user: any): 'basic' | 'verified' | 'premium' {
    const score = user.trust?.score || user.verification?.trustScore || 0;
    if (score >= 70) return 'premium';
    if (score >= 40) return 'verified';
    return 'basic';
  }

  /**
   * Update trust system in Firestore
   */
  private async updateTrustSystem(userId: string, result: TrustScoreResult): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      'trust.score': result.score,
      'trust.level': result.level,
      'trust.lastUpdated': serverTimestamp(),
      'verification.trustScore': result.score,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Validate EGN/EIK format
   */
  private validateEGN_EIK(number: string, type: 'EGN' | 'EIK'): boolean {
    if (type === 'EGN') {
      // EGN: 10 digits
      return /^\d{10}$/.test(number);
    } else {
      // EIK: 9 or 13 digits
      return /^\d{9}$|^\d{13}$/.test(number);
    }
  }

  /**
   * Get badge name in Bulgarian
   */
  private getBadgeNameBg(type: BadgeType): string {
    const names: Record<BadgeType, string> = {
      phone: 'Потвърден телефон',
      id: 'Потвърдена самоличност',
      business: 'Потвърдена фирма',
      garage: 'Официален автосалон',
      premium_dealer: 'Премиум дилър',
      guaranteed_seller: 'Гарантиран Продавач',
      quick_responder: 'Бърз Отговор',
      top_rated: 'Най-високо оценен'
    };
    return names[type];
  }

  /**
   * Get badge name in English
   */
  private getBadgeNameEn(type: BadgeType): string {
    const names: Record<BadgeType, string> = {
      phone: 'Phone Verified',
      id: 'ID Verified',
      business: 'Business Verified',
      garage: 'Official Garage',
      premium_dealer: 'Premium Dealer',
      guaranteed_seller: 'Guaranteed Seller',
      quick_responder: 'Quick Responder',
      top_rated: 'Top Rated'
    };
    return names[type];
  }

  /**
   * Get badge priority (for display order)
   */
  private getBadgePriority(type: BadgeType): number {
    const priorities: Record<BadgeType, number> = {
      guaranteed_seller: 1,
      premium_dealer: 2,
      business: 3,
      id: 4,
      phone: 5,
      top_rated: 6,
      quick_responder: 7,
      garage: 8
    };
    return priorities[type] || 99;
  }
}

