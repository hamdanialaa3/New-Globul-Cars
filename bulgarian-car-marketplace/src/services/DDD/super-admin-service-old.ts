/**
 * Super Admin Service
 * خدمة الإدارة الفائقة
 *
 * This module provides the main orchestrator for the super admin system using the singleton pattern.
 * يوفر هذا الوحدة المنسق الرئيسي لنظام الإدارة الفائقة باستخدام نمط الـ singleton.
 */

import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { SuperAdminOperations } from './super-admin-operations';
import {
  RealTimeAnalytics,
  UserActivity,
  ContentModeration,
  SuperAdminCache
} from './super-admin-types';
import {
  SUPER_ADMIN_CONSTANTS,
  CACHE_CONFIG,
  ERROR_MESSAGES
} from './super-admin-data';

/**
 * Super Admin Service Class
 * فئة خدمة الإدارة الفائقة
 */
class SuperAdminService {
  private static instance: SuperAdminService;
  private cache: SuperAdminCache;
  private subscriptions: Map<string, () => void>;

  private constructor() {
    this.cache = {
      analytics: null,
      expiry: 0
    };
    this.subscriptions = new Map();
  }

  /**
   * Get singleton instance
   * الحصول على مثيل singleton
   */
  static getInstance(): SuperAdminService {
    if (!SuperAdminService.instance) {
      SuperAdminService.instance = new SuperAdminService();
    }
    return SuperAdminService.instance;
  }

  // ==================== SUPER ADMIN VERIFICATION ====================

  /**
   * Check if user is super admin
   * التحقق من أن المستخدم إدارة فائقة
   */
  public isSuperAdmin(email: string): boolean {
    return email === SUPER_ADMIN_CONSTANTS.EMAIL;
  }

  // ==================== ANALYTICS OPERATIONS ====================

  /**
   * Get real-time analytics with actual Firebase data
   * الحصول على التحليلات في الوقت الفعلي مع بيانات Firebase الحقيقية
   */
  public async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    try {
      // Check cache first
      if (this.cache.analytics &&
          (Date.now() - this.cache.analytics.lastUpdated.getTime()) < CACHE_CONFIG.ANALYTICS_DURATION) {
        return this.cache.analytics;
      }

      // Get all data from Firebase with error handling
      const [
        usersSnapshot,
        carsSnapshot,
        messagesSnapshot,
        analyticsSnapshot
      ] = await Promise.all([
        SuperAdminOperations.fetchUsersData(),
        SuperAdminOperations.fetchCarsData(),
        SuperAdminOperations.fetchMessagesData(),
        SuperAdminOperations.fetchAnalyticsData()
      ]);

      // Calculate metrics
      const activeUsers = SuperAdminOperations.calculateActiveUsers(usersSnapshot);
      const activeCars = SuperAdminOperations.calculateActiveCars(carsSnapshot);
      const totalViews = SuperAdminOperations.calculateTotalViews(analyticsSnapshot);

      // Analyze geographic distribution
      const { topCountries, topCities } = SuperAdminOperations.analyzeGeographicDistribution(usersSnapshot);

      // Get growth data
      const userGrowth = await SuperAdminOperations.getUserGrowthData();
      const carListings = await SuperAdminOperations.getCarListingsData();

      // Calculate revenue
      const revenue = await SuperAdminOperations.calculateRevenue();

      const analytics: RealTimeAnalytics = {
        totalUsers: usersSnapshot.size,
        activeUsers,
        totalCars: carsSnapshot.size,
        activeCars,
        totalMessages: messagesSnapshot.size,
        totalViews,
        revenue,
        topCountries,
        topCities,
        userGrowth,
        carListings,
        lastUpdated: new Date()
      };

      // Cache the results
      this.cache.analytics = analytics;
      this.cache.expiry = Date.now() + CACHE_CONFIG.ANALYTICS_DURATION;

      return analytics;
    } catch (error) {
      serviceLogger.error('Error fetching real-time analytics', error as Error);
      // Return mock data if Firebase fails
      return SuperAdminOperations.getMockAnalytics();
    }
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get user activity data
   * الحصول على بيانات نشاط المستخدمين
   */
  public async getUserActivity(): Promise<UserActivity[]> {
    return SuperAdminOperations.getUserActivity();
  }

  /**
   * Ban user
   * حظر مستخدم
   */
  public async banUser(userId: string, reason: string): Promise<void> {
    return SuperAdminOperations.banUser(userId, reason, SUPER_ADMIN_CONSTANTS.EMAIL);
  }

  /**
   * Unban user
   * إلغاء حظر مستخدم
   */
  public async unbanUser(userId: string): Promise<void> {
    return SuperAdminOperations.unbanUser(userId, SUPER_ADMIN_CONSTANTS.EMAIL);
  }

  /**
   * Delete user completely
   * حذف مستخدم بالكامل
   */
  public async deleteUser(userId: string | null | undefined): Promise<void> {
    // Guard against null/undefined userId
    if (!userId) {
      serviceLogger.warn('[SuperAdminService] deleteUser called with null/undefined userId');
      throw new Error(ERROR_MESSAGES.INVALID_USER_ID);
    }

    return SuperAdminOperations.deleteUser(userId, SUPER_ADMIN_CONSTANTS.EMAIL);
  }

  // ==================== CONTENT MANAGEMENT ====================

  /**
   * Delete car
   * حذف سيارة
   */
  public async deleteCar(carId: string, reason: string): Promise<void> {
    return SuperAdminOperations.deleteCar(carId, reason, SUPER_ADMIN_CONSTANTS.EMAIL);
  }

  /**
   * Flag content
   * الإبلاغ عن محتوى
   */
  public async flagContent(contentId: string, type: string, reason: string): Promise<void> {
    return SuperAdminOperations.flagContent(contentId, type, reason, SUPER_ADMIN_CONSTANTS.EMAIL);
  }

  /**
   * Get content moderation data
   * الحصول على بيانات الإشراف على المحتوى
   */
  public async getContentModeration(): Promise<ContentModeration> {
    return SuperAdminOperations.getContentModeration();
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Subscribe to real-time analytics updates
   * الاشتراك في تحديثات التحليلات في الوقت الفعلي
   */
  public subscribeToRealTimeUpdates(callback: (data: RealTimeAnalytics) => void): () => void {
    const unsubscribe = onSnapshot(collection(db, 'analytics'), async (snapshot) => {
      try {
        const analytics = await this.getRealTimeAnalytics();
        callback(analytics);
      } catch (error) {
        serviceLogger.error('Error in analytics subscription', error as Error);
      }
    });

    const subscriptionId = `super_admin_analytics_${Date.now()}`;
    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear cache
   * مسح الكاش
   */
  public clearCache(): void {
    this.cache.analytics = null;
    this.cache.expiry = 0;
  }

  /**
   * Clear all subscriptions
   * مسح جميع الاشتراكات
   */
  public clearSubscriptions(): void {
    this.subscriptions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        serviceLogger.warn('Error clearing subscription', { error });
      }
    });
    this.subscriptions.clear();
  }

  /**
   * Get cache status
   * الحصول على حالة الكاش
   */
  public getCacheStatus(): { hasData: boolean; isExpired: boolean; expiryTime: number } {
    const now = Date.now();
    return {
      hasData: this.cache.analytics !== null,
      isExpired: now > this.cache.expiry,
      expiryTime: this.cache.expiry
    };
  }
}

// ==================== EXPORTS ====================

export const superAdminService = SuperAdminService.getInstance();

export default SuperAdminService;

