// src/services/reviews/rating-service.ts
// Rating Service - خدمة التقييمات بالنجوم
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

// ==================== INTERFACES ====================

export interface RatingData {
  sellerId: string;
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface RatingLevel {
  level: 'excellent' | 'good' | 'average' | 'poor' | 'very_poor' | 'no_rating';
  color: string;
  label_bg: string;
  label_en: string;
}

// ==================== SERVICE CLASS ====================

export class RatingService {
  private static instance: RatingService;

  private constructor() {}

  public static getInstance(): RatingService {
    if (!RatingService.instance) {
      RatingService.instance = new RatingService();
    }
    return RatingService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Get rating level info
   * الحصول على معلومات مستوى التقييم
   */
  getRatingLevel(rating: number): RatingLevel {
    if (rating === 0) {
      return {
        level: 'no_rating',
        color: '#999',
        label_bg: 'Без рейтинг',
        label_en: 'No Rating'
      };
    } else if (rating >= 4.5) {
      return {
        level: 'excellent',
        color: '#4caf50',
        label_bg: 'Отличен',
        label_en: 'Excellent'
      };
    } else if (rating >= 3.5) {
      return {
        level: 'good',
        color: '#8bc34a',
        label_bg: 'Добър',
        label_en: 'Good'
      };
    } else if (rating >= 2.5) {
      return {
        level: 'average',
        color: '#ff9800',
        label_bg: 'Среден',
        label_en: 'Average'
      };
    } else if (rating >= 1.5) {
      return {
        level: 'poor',
        color: '#ff5722',
        label_bg: 'Слаб',
        label_en: 'Poor'
      };
    } else {
      return {
        level: 'very_poor',
        color: '#f44336',
        label_bg: 'Много слаб',
        label_en: 'Very Poor'
      };
    }
  }

  /**
   * Calculate rating percentage for progress bar
   * حساب نسبة التقييم لشريط التقدم
   */
  getRatingPercentage(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  /**
   * Get star icons array for display
   * الحصول على مصفوفة النجوم للعرض
   */
  getStarDisplay(rating: number): { full: number; half: boolean; empty: number } {
    const full = Math.floor(rating);
    const decimal = rating - full;
    const half = decimal >= 0.25 && decimal < 0.75;
    const empty = 5 - full - (half ? 1 : 0);

    return { full, half, empty };
  }

  /**
   * Format rating for display
   * تنسيق التقييم للعرض
   */
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  /**
   * Calculate trust score impact from ratings
   * حساب تأثير التقييمات على درجة الثقة
   */
  calculateTrustImpact(stats: RatingData): number {
    if (stats.totalRatings === 0) return 0;

    // More reviews = more trust
    const volumeBonus = Math.min(stats.totalRatings * 0.5, 10);
    
    // Higher rating = more trust
    const ratingBonus = stats.averageRating * 2;

    // Penalty for low ratings
    const lowRatingPenalty = (stats.ratingBreakdown[1] + stats.ratingBreakdown[2]) * -0.5;

    return Math.max(0, Math.min(25, volumeBonus + ratingBonus + lowRatingPenalty));
  }

  /**
   * Get rating summary text
   * الحصول على نص ملخص التقييم
   */
  getRatingSummary(rating: number, totalReviews: number, language: 'bg' | 'en'): string {
    const level = this.getRatingLevel(rating);
    const label = language === 'bg' ? level.label_bg : level.label_en;

    if (totalReviews === 0) {
      return language === 'bg' 
        ? 'Все още няма отзиви'
        : 'No reviews yet';
    }

    const reviewText = language === 'bg'
      ? `${totalReviews} ${totalReviews === 1 ? 'отзив' : 'отзива'}`
      : `${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`;

    return `${label} • ${this.formatRating(rating)} ⭐ • ${reviewText}`;
  }

  /**
   * Check if seller qualifies for rating badge
   * التحقق إذا كان البائع يستحق شارة التقييم
   */
  async checkRatingBadges(sellerId: string): Promise<string[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', sellerId));
      
      if (!userDoc.exists()) return [];

      const data = userDoc.data();
      const rating = data?.stats?.averageRating || 0;
      const reviews = data?.stats?.totalReviews || 0;

      const badges: string[] = [];

      // 5-Star Seller: 4.8+ rating with 10+ reviews
      if (rating >= 4.8 && reviews >= 10) {
        badges.push('5_STAR_SELLER');
      }

      // Top Rated: 4.5+ rating with 25+ reviews
      if (rating >= 4.5 && reviews >= 25) {
        badges.push('TOP_RATED');
      }

      return badges;
    } catch (error) {
      console.error('❌ Error checking rating badges:', error);
      return [];
    }
  }

  /**
   * Get recommended sellers based on rating
   * الحصول على البائعين الموصى بهم بناءً على التقييم
   */
  isRecommendedSeller(rating: number, totalReviews: number): boolean {
    return rating >= 4.0 && totalReviews >= 5;
  }
}

// Export singleton instance
export const ratingService = RatingService.getInstance();
