/**
 * Analytics Service
 * خدمة التحليلات
 *
 * This module provides the main orchestrator for the analytics system using the singleton pattern.
 * يوفر هذا الوحدة المنسق الرئيسي لنظام التحليلات باستخدام نمط الـ singleton.
 */

import { onSnapshot, doc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { AnalyticsOperations } from './analytics-operations';
import { firebaseRealDataService } from './firebase-real-data-service';
import {
  RealTimeAnalytics,
  UserActivity,
  ContentModeration,
  SystemPerformance,
  AnalyticsCache,
  AnalyticsState
} from './analytics-types';
import {
  CACHE_DURATION,
  COLLECTIONS,
  QUERY_LIMITS,
  TIME_PERIODS
} from './analytics-data';

/**
 * Real Time Analytics Service Class
 * فئة خدمة التحليلات في الوقت الفعلي
 */
class RealTimeAnalyticsService {
  private static instance: RealTimeAnalyticsService;
  private cache: AnalyticsCache;
  private listeners: Set<(analytics: RealTimeAnalytics) => void>;
  private subscriptions: Map<string, () => void>;

  private constructor() {
    this.cache = {
      data: null,
      expiry: 0
    };
    this.listeners = new Set();
    this.subscriptions = new Map();
  }

  /**
   * Get singleton instance
   * الحصول على مثيل singleton
   */
  static getInstance(): RealTimeAnalyticsService {
    if (!RealTimeAnalyticsService.instance) {
      RealTimeAnalyticsService.instance = new RealTimeAnalyticsService();
    }
    return RealTimeAnalyticsService.instance;
  }

  // ==================== ANALYTICS OPERATIONS ====================

  /**
   * Get real-time analytics with actual Firebase data
   * الحصول على التحليلات في الوقت الفعلي مع بيانات Firebase الحقيقية
   */
  async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    try {
      // Check cache first
      if (this.cache.data && Date.now() < this.cache.expiry) {
        return this.cache.data;
      }

      // Get all data from Firebase with error handling
      const [
        users,
        cars,
        messages,
        views,
        userActivity
      ] = await Promise.all([
        AnalyticsOperations.fetchUsersData(),
        AnalyticsOperations.fetchCarsData(),
        AnalyticsOperations.fetchMessagesData(),
        AnalyticsOperations.fetchViewsData(),
        AnalyticsOperations.fetchUserActivityData()
      ]);

      // Calculate today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate metrics
      const totalUsers = users.length;
      const activeUsers = users.filter((user: any) =>
        user.lastLogin && new Date(user.lastLogin.seconds * 1000) > new Date(Date.now() - TIME_PERIODS.ACTIVE_USER_THRESHOLD)
      ).length;

      const newUsersToday = users.filter((user: any) =>
        user.createdAt && new Date(user.createdAt.seconds * 1000) >= today
      ).length;

      const totalCars = cars.length;
      const activeCars = cars.filter((car: any) => car.isActive !== false).length;

      const carsListedToday = cars.filter((car: any) =>
        car.createdAt && new Date(car.createdAt.seconds * 1000) >= today
      ).length;

      const totalMessages = messages.length;
      const messagesSentToday = messages.filter(message =>
        message.createdAt && new Date(message.createdAt.seconds * 1000) >= today
      ).length;

      const totalViews = views.length;
      const viewsToday = views.filter(view =>
        view.timestamp && new Date(view.timestamp.seconds * 1000) >= today
      ).length;

      // Calculate revenue (from car sales)
      const revenue = AnalyticsOperations.calculateRevenue(cars);

      // Traffic sources analysis
      const trafficSources = AnalyticsOperations.calculateTrafficSources(userActivity);

      // Geographic distribution
      const geoDistribution = AnalyticsOperations.calculateGeoDistribution(users);

      // Device usage
      const deviceUsage = AnalyticsOperations.calculateDeviceUsage(userActivity);

      // Page views
      const pageViews = AnalyticsOperations.calculatePageViews(views);

      // Top countries and cities
      const topCountries = AnalyticsOperations.getTopCountries(users);
      const topCities = AnalyticsOperations.getTopCities(users);

      // User growth and car listings growth
      const userGrowth = AnalyticsOperations.calculateUserGrowth(users);
      const carListings = AnalyticsOperations.calculateCarListingsGrowth(cars);

      const analytics: RealTimeAnalytics = {
        totalUsers,
        activeUsers,
        newUsersToday,
        totalCars,
        activeCars,
        carsListedToday,
        totalMessages,
        messagesSentToday,
        totalViews,
        viewsToday,
        revenue,
        trafficSources,
        geoDistribution,
        deviceUsage,
        pageViews,
        topCountries,
        topCities,
        userGrowth,
        carListings,
        lastUpdated: new Date()
      };

      // Cache the results
      this.cache.data = analytics;
      this.cache.expiry = Date.now() + CACHE_DURATION;

      return analytics;
    } catch (error) {
      serviceLogger.error('Error getting real-time analytics', error as Error);
      try {
        // Fallback to server-side callable/client aggregation to avoid mock data
        const fallback = await firebaseRealDataService.getRealAnalytics();
        return fallback;
      } catch (fallbackError) {
        serviceLogger.error('Fallback analytics retrieval failed', fallbackError as Error);
        return AnalyticsOperations.getMockAnalytics();
      }
    }
  }

  // ==================== USER ACTIVITY ====================

  /**
   * Get real user activity
   * الحصول على نشاط المستخدمين الحقيقي
   */
  async getUserActivity(): Promise<UserActivity[]> {
    return AnalyticsOperations.getUserActivity();
  }

  // ==================== CONTENT MODERATION ====================

  /**
   * Get content moderation data
   * الحصول على بيانات إدارة المحتوى
   */
  async getContentModeration(): Promise<ContentModeration> {
    return AnalyticsOperations.getContentModeration();
  }

  // ==================== SYSTEM PERFORMANCE ====================

  /**
   * Get system performance metrics
   * الحصول على مقاييس أداء النظام
   */
  async getSystemPerformance(): Promise<SystemPerformance[]> {
    return AnalyticsOperations.getSystemPerformance();
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Subscribe to real-time analytics updates
   * الاشتراك في تحديثات التحليلات في الوقت الفعلي
   */
  subscribeToAnalytics(callback: (analytics: RealTimeAnalytics) => void): () => void {
    let isActive = true; // Prevent callback execution after unsubscribe

    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.USERS),
      async () => {
        if (!isActive) return; // Check before async operation
        try {
          const analytics = await this.getRealTimeAnalytics();
          if (!isActive) return; // Check after async operation
          callback(analytics);
        } catch (error) {
          serviceLogger.error('Error in analytics subscription', error as Error);
        }
      }
    );

    const subscriptionId = `analytics_${Date.now()}`;
    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      isActive = false; // Disable callback first
      unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  /**
   * Subscribe to user activity updates
   * الاشتراك في تحديثات نشاط المستخدمين
   */
  subscribeToUserActivity(callback: (activity: UserActivity[]) => void): () => void {
    let isActive = true; // Prevent callback execution after unsubscribe

    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.USERS),
      (snapshot) => {
        if (!isActive) return; // Check before processing

        const activity = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
            uid: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            lastLogin: data.lastLogin?.toDate() || new Date(),
            loginCount: data.loginCount || 0,
            location: `${data.location?.city || 'Unknown'}, ${data.location?.country || 'Bulgaria'}`,
            device: data.device || 'Unknown',
            browser: data.browser || 'Unknown',
            isOnline: data.isOnline || false,
            lastActivity: data.lastActivity?.toDate() || new Date()
          };
        });
        callback(activity);
      }
    );

    const subscriptionId = `userActivity_${Date.now()}`;
    this.subscriptions.set(subscriptionId, unsubscribe);

    return () => {
      isActive = false; // Disable callback first
      unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  // ==================== TRACKING METHODS ====================

  /**
   * Record page view
   * تسجيل مشاهدة الصفحة
   */
  async recordPageView(page: string, userId?: string): Promise<void> {
    try {
      const viewRef = doc(collection(db, COLLECTIONS.VIEWS));
      await setDoc(viewRef, {
        page,
        userId: userId || null,
        timestamp: serverTimestamp(),
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      serviceLogger.error('Error recording page view', error as Error, { page, userId });
    }
  }

  /**
   * Record user activity
   * تسجيل نشاط المستخدم
   */
  async recordUserActivity(
    userId: string,
    activity: string,
    details?: string
  ): Promise<void> {
    try {
      const activityRef = doc(collection(db, COLLECTIONS.USER_ACTIVITY));
      await setDoc(activityRef, {
        userId,
        activity,
        details,
        timestamp: serverTimestamp(),
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        device: this.getDeviceType(),
        browser: this.getBrowserName()
      });
    } catch (error) {
      serviceLogger.error('Error recording user activity', error as Error, { userId, activity });
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get client IP address
   * الحصول على عنوان IP للعميل
   */
  private getClientIP(): string {
    // In production, get from request headers
    return 'N/A';
  }

  /**
   * Get device type from user agent
   * الحصول على نوع الجهاز من user agent
   */
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'Mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  /**
   * Get browser name from user agent
   * الحصول على اسم المتصفح من user agent
   */
  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Clear all subscriptions
   * مسح جميع الاشتراكات
   */
  clearSubscriptions(): void {
    this.subscriptions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        serviceLogger.warn('Error clearing subscription', { error });
      }
    });
    this.subscriptions.clear();
  }
}

// ==================== EXPORTS ====================

export const realTimeAnalyticsService = RealTimeAnalyticsService.getInstance();

export default RealTimeAnalyticsService;