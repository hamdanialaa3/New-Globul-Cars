// src/services/profile/trust-score-service.ts
// Trust Score Service - نظام درجة الثقة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';

// ==================== ENUMS & INTERFACES ====================

export enum TrustLevel {
  UNVERIFIED = 'unverified',     // 0-20 points
  BASIC = 'basic',                // 21-40 points
  TRUSTED = 'trusted',            // 41-60 points
  VERIFIED = 'verified',          // 61-80 points
  PREMIUM = 'premium'             // 81-100 points
}

export interface Badge {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  earnedAt: Date;
  type: 'verification' | 'achievement' | 'milestone';
}

export interface VerificationStatus {
  email: { verified: boolean; verifiedAt?: Date };
  phone: { verified: boolean; verifiedAt?: Date };
  identity: { verified: boolean; verifiedAt?: Date };
  business: { verified: boolean; verifiedAt?: Date };
  trustScore: number;
  level: TrustLevel;
  badges: Badge[];
}

// ==================== BADGE DEFINITIONS ====================

const BADGE_DEFINITIONS: { [key: string]: Omit<Badge, 'earnedAt'> } = {
  EMAIL_VERIFIED: {
    id: 'EMAIL_VERIFIED',
    name: 'Потвърден имейл',
    nameEn: 'Email Verified',
    icon: '✉️',
    type: 'verification'
  },
  PHONE_VERIFIED: {
    id: 'PHONE_VERIFIED',
    name: 'Потвърден телефон',
    nameEn: 'Phone Verified',
    icon: '📱',
    type: 'verification'
  },
  ID_VERIFIED: {
    id: 'ID_VERIFIED',
    name: 'Потвърдена самоличност',
    nameEn: 'ID Verified',
    icon: '🆔',
    type: 'verification'
  },
  TOP_SELLER: {
    id: 'TOP_SELLER',
    name: 'Топ Продавач',
    nameEn: 'Top Seller',
    icon: '⭐',
    type: 'achievement'
  },
  QUICK_RESPONDER: {
    id: 'QUICK_RESPONDER',
    name: 'Бърз Отговор',
    nameEn: 'Quick Responder',
    icon: '⚡',
    type: 'achievement'
  },
  FIVE_STAR: {
    id: 'FIVE_STAR',
    name: '5-Звезден',
    nameEn: '5-Star Seller',
    icon: '🌟',
    type: 'achievement'
  }
};

// ==================== SERVICE CLASS ====================

export class TrustScoreService {
  private static instance: TrustScoreService;

  private constructor() {}

  public static getInstance(): TrustScoreService {
    if (!TrustScoreService.instance) {
      TrustScoreService.instance = new TrustScoreService();
    }
    return TrustScoreService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Calculate user trust score (0-100)
   * حساب درجة ثقة المستخدم
   */
  async calculateTrustScore(userId: string): Promise<number> {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const user = userDoc.data();
      let score = 0;

      // Email verified: +10 points
      if (user.verification?.email?.verified) score += 10;

      // Phone verified: +15 points
      if (user.verification?.phone?.verified) score += 15;

      // ID verified: +25 points
      if (user.verification?.identity?.verified) score += 25;

      // Business verified: +20 points
      if (user.verification?.business?.verified) score += 20;

      // Profile completion: +10 points
      score += this.calculateProfileScore(user);

      // Reviews: +15 points max
      score += this.calculateReviewScore(user);

      // Activity: +5 points
      score += this.calculateActivityScore(user);

      // Cap at 100
      score = Math.min(score, 100);

      // Update in Firestore
      await this.updateTrustScore(userId, score);

      serviceLogger.info('Trust score calculated', { userId, score });
      return score;

    } catch (error) {
      serviceLogger.error('Error calculating trust score', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Award badge to user
   * منح شارة للمستخدم
   */
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      const badge = this.createBadge(badgeId);
      const currentBadges = await this.getUserBadges(userId);

      // Check if already has badge
      if (currentBadges.some(b => b.id === badgeId)) {
        serviceLogger.debug('User already has badge', { userId, badgeId });
        return;
      }

      // Add new badge
      await updateDoc(doc(db, 'users', userId), {
        'verification.badges': [...currentBadges, badge],
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('Badge awarded', { userId, badgeId, badgeName: badge.name });
    } catch (error) {
      serviceLogger.error('Error awarding badge', error as Error, { userId, badgeId });
      throw error;
    }
  }

  /**
   * Get trust level name
   * الحصول على اسم مستوى الثقة
   */
  getTrustLevelName(level: TrustLevel, language: 'bg' | 'en' = 'bg'): string {
    const names = {
      [TrustLevel.UNVERIFIED]: {
        bg: 'Непотвърден',
        en: 'Unverified'
      },
      [TrustLevel.BASIC]: {
        bg: 'Основен',
        en: 'Basic'
      },
      [TrustLevel.TRUSTED]: {
        bg: 'Доверен',
        en: 'Trusted'
      },
      [TrustLevel.VERIFIED]: {
        bg: 'Потвърден',
        en: 'Verified'
      },
      [TrustLevel.PREMIUM]: {
        bg: 'Премиум',
        en: 'Premium'
      }
    };

    return names[level][language];
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Calculate profile completion score
   * حساب نقاط اكتمال البروفايل
   */
  private calculateProfileScore(user: any): number {
    let completed = 0;
    const total = 10;

    if (user.displayName) completed++;
    if (user.email) completed++;
    if (user.phoneNumber) completed++;
    if (user.bio) completed++;
    if (user.profileImage) completed++;
    if (user.coverImage) completed++;
    if (user.verification?.email?.verified) completed++;
    if (user.verification?.phone?.verified) completed++;
    if (user.stats?.carsListed > 0) completed++;
    if (user.reviews?.total > 0) completed++;

    return Math.floor((completed / total) * 10);
  }

  /**
   * Calculate review score
   * حساب نقاط التقييمات
   */
  private calculateReviewScore(user: any): number {
    if (!user.reviews?.average || !user.reviews?.total) return 0;

    // Need at least 3 reviews
    if (user.reviews.total < 3) return 0;

    // Calculate based on average (max 15 points)
    return Math.floor((user.reviews.average / 5) * 15);
  }

  /**
   * Calculate activity score
   * حساب نقاط النشاط
   */
  private calculateActivityScore(user: any): number {
    if (!user.stats?.lastActive) return 0;

    const lastActive = user.stats.lastActive.toDate?.() || new Date(user.stats.lastActive);
    const daysSinceActive = Math.floor(
      (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Active in last 7 days: +5 points
    return daysSinceActive <= 7 ? 5 : 0;
  }

  /**
   * Get trust level from score
   * الحصول على مستوى الثقة من النقاط
   */
  private getTrustLevel(score: number): TrustLevel {
    if (score >= 81) return TrustLevel.PREMIUM;
    if (score >= 61) return TrustLevel.VERIFIED;
    if (score >= 41) return TrustLevel.TRUSTED;
    if (score >= 21) return TrustLevel.BASIC;
    return TrustLevel.UNVERIFIED;
  }

  /**
   * Update trust score in Firestore
   * تحديث درجة الثقة في Firestore
   */
  private async updateTrustScore(userId: string, score: number): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      'verification.trustScore': score,
      'verification.level': this.getTrustLevel(score),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Get user badges
   * الحصول على شارات المستخدم
   */
  private async getUserBadges(userId: string): Promise<Badge[]> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.data()?.verification?.badges || [];
  }

  /**
   * Create badge object
   * إنشاء كائن الشارة
   */
  private createBadge(badgeId: string): Badge {
    const definition = BADGE_DEFINITIONS[badgeId];
    if (!definition) {
      throw new Error(`Badge not found: ${badgeId}`);
    }

    return {
      ...definition,
      earnedAt: new Date()
    };
  }
}

// Export singleton instance
export const trustScoreService = TrustScoreService.getInstance();

// Export types and enums
export { BADGE_DEFINITIONS };
