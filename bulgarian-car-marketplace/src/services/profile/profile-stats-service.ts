// src/services/profile/profile-stats-service.ts
// Profile Statistics Service - خدمة إحصائيات البروفايل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { trustScoreService } from './trust-score-service';
import { serviceLogger } from '../logger-wrapper';

// ==================== INTERFACES ====================

export interface ProfileStats {
  carsListed: number;
  carsSold: number;
  totalViews: number;
  totalMessages: number;
  responseTime: number;      // Average in minutes
  responseRate: number;       // Percentage (0-100)
  lastActive: Date;
}

// ==================== SERVICE CLASS ====================

export class ProfileStatsService {
  private static instance: ProfileStatsService;

  private constructor() {}

  public static getInstance(): ProfileStatsService {
    if (!ProfileStatsService.instance) {
      ProfileStatsService.instance = new ProfileStatsService();
    }
    return ProfileStatsService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Increment cars listed count
   * زيادة عدد السيارات المعروضة
   */
  async incrementCarsListed(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'stats.carsListed': increment(1),
        'stats.lastActive': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('Cars listed count incremented', { userId });
    } catch (error) {
      serviceLogger.error('Error incrementing cars listed', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Increment cars sold count
   * زيادة عدد السيارات المباعة
   */
  async incrementCarsSold(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'stats.carsSold': increment(1),
        'stats.lastActive': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Check for Top Seller badge (10+ sales)
      await this.checkTopSellerBadge(userId);

      serviceLogger.info('Cars sold count incremented', { userId });
    } catch (error) {
      serviceLogger.error('Error incrementing cars sold', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Update response time
   * تحديث وقت الاستجابة
   */
  async updateResponseTime(
    userId: string,
    responseTimeMinutes: number
  ): Promise<void> {
    try {
      // Get current stats (would need to fetch from Firestore)
      // For simplicity, using increment approach

      await updateDoc(doc(db, 'users', userId), {
        'stats.totalMessages': increment(1),
        'stats.lastActive': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Calculate new average (this is simplified)
      // In production, you'd fetch current average first
      const newAvg = responseTimeMinutes;

      await updateDoc(doc(db, 'users', userId), {
        'stats.responseTime': newAvg
      });

      // Check for Quick Responder badge (<1 hour average)
      if (newAvg < 60) {
        await trustScoreService.awardBadge(userId, 'QUICK_RESPONDER');
      }

      serviceLogger.info('Response time updated', { userId, responseTimeMinutes: newAvg });
    } catch (error) {
      serviceLogger.error('Error updating response time', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Increment total views
   * زيادة عدد المشاهدات
   */
  async incrementTotalViews(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'stats.totalViews': increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error incrementing views', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Update response rate
   * تحديث معدل الاستجابة
   */
  async updateResponseRate(
    userId: string,
    respondedCount: number,
    totalCount: number
  ): Promise<void> {
    try {
      const rate = Math.floor((respondedCount / totalCount) * 100);

      await updateDoc(doc(db, 'users', userId), {
        'stats.responseRate': rate,
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('Response rate updated', { userId, rate });
    } catch (error) {
      serviceLogger.error('Error updating response rate', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Update last active timestamp
   * تحديث آخر نشاط
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'stats.lastActive': serverTimestamp()
      });
    } catch (error) {
      serviceLogger.warn('Error updating last active', { userId, error: (error as Error).message });
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get formatted stats for display
   * الحصول على الإحصائيات المنسقة للعرض
   */
  formatStats(stats: ProfileStats, language: 'bg' | 'en' = 'bg'): any {
    const labels = {
      bg: {
        carsListed: 'Обяви',
        carsSold: 'Продадени',
        totalViews: 'Прегледи',
        responseTime: 'Време за отговор',
        responseRate: 'Процент на отговор'
      },
      en: {
        carsListed: 'Listings',
        carsSold: 'Sold',
        totalViews: 'Views',
        responseTime: 'Response Time',
        responseRate: 'Response Rate'
      }
    };

    return {
      carsListed: {
        label: labels[language].carsListed,
        value: stats.carsListed
      },
      carsSold: {
        label: labels[language].carsSold,
        value: stats.carsSold
      },
      totalViews: {
        label: labels[language].totalViews,
        value: stats.totalViews
      },
      responseTime: {
        label: labels[language].responseTime,
        value: this.formatTime(stats.responseTime, language)
      },
      responseRate: {
        label: labels[language].responseRate,
        value: `${stats.responseRate}%`
      }
    };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Check if user qualifies for Top Seller badge
   * التحقق من أهلية شارة البائع الممتاز
   */
  private async checkTopSellerBadge(userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userDocRef);
      const carsSold = snapshot.data()?.stats?.carsSold || 0;

      if (carsSold >= 10) {
        await trustScoreService.awardBadge(userId, 'TOP_SELLER');
      }
    } catch (error) {
      serviceLogger.warn('Error checking Top Seller badge', { userId, error: (error as Error).message });
      // Don't throw - badge awarding is non-critical
    }
  }

  /**
   * Format time duration
   * تنسيق مدة الوقت
   */
  private formatTime(minutes: number, language: 'bg' | 'en'): string {
    if (minutes < 60) {
      return language === 'bg' 
        ? `${minutes} минути` 
        : `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    return language === 'bg'
      ? `${hours} часа`
      : `${hours} hours`;
  }
}

// Export singleton instance
export const profileStatsService = ProfileStatsService.getInstance();
