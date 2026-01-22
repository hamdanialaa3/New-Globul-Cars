/**
 * Analytics Operations
 * عمليات التحليلات
 *
 * This module contains all core business logic operations for the analytics system.
 * يحتوي هذا الوحدة على جميع عمليات منطق الأعمال الأساسية لنظام التحليلات.
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { countAllVehicles, queryAllCollections } from './search/multi-collection-helper';
import {
  RealTimeAnalytics,
  UserActivity,
  ContentModeration,
  SystemPerformance,
  AnalyticsResult
} from './analytics-types';
import {
  COLLECTIONS,
  QUERY_LIMITS,
  TIME_PERIODS,
  DEFAULT_ANALYTICS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from './analytics-data';

/**
 * Analytics Operations Class
 * فئة عمليات التحليلات
 */
export class AnalyticsOperations {
  /**
   * Fetch users data from Firebase
   * جلب بيانات المستخدمين من Firebase
   */
  static async fetchUsersData(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      serviceLogger.warn('Failed to fetch users data', { error });
      return [];
    }
  }

  /**
   * Fetch cars data from Firebase
   * جلب بيانات السيارات من Firebase
   */
  static async fetchCarsData(): Promise<any[]> {
    try {
      return await countAllVehicles();
    } catch (error) {
      serviceLogger.warn('Failed to fetch cars data', { error });
      return [];
    }
  }

  /**
   * Fetch messages data from Firebase
   * جلب بيانات الرسائل من Firebase
   */
  static async fetchMessagesData(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.MESSAGES));
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      serviceLogger.warn('Failed to fetch messages data', { error });
      return [];
    }
  }

  /**
   * Fetch views data from Firebase
   * جلب بيانات المشاهدات من Firebase
   */
  static async fetchViewsData(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.VIEWS));
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      serviceLogger.warn('Failed to fetch views data', { error });
      return [];
    }
  }

  /**
   * Fetch user activity data from Firebase
   * جلب بيانات نشاط المستخدمين من Firebase
   */
  static async fetchUserActivityData(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.USER_ACTIVITY));
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      serviceLogger.warn('Failed to fetch user activity data', { error });
      return [];
    }
  }

  /**
   * Calculate user growth over time
   * حساب نمو المستخدمين مع الوقت
   */
  static calculateUserGrowth(users: any[]): { date: string; count: number }[] {
    const growth: { [key: string]: number } = {};
    const now = new Date();

    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt.seconds * 1000);
        const dateKey = date.toISOString().split('T')[0];
        growth[dateKey] = (growth[dateKey] || 0) + 1;
      }
    });

    // Generate last 30 days
    const result: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        count: growth[dateKey] || 0
      });
    }

    return result;
  }

  /**
   * Calculate car listings growth over time
   * حساب نمو قوائم السيارات مع الوقت
   */
  static calculateCarListingsGrowth(cars: any[]): { date: string; count: number }[] {
    const growth: { [key: string]: number } = {};
    const now = new Date();

    cars.forEach(car => {
      if (car.createdAt) {
        const date = new Date(car.createdAt.seconds * 1000);
        const dateKey = date.toISOString().split('T')[0];
        growth[dateKey] = (growth[dateKey] || 0) + 1;
      }
    });

    // Generate last 30 days
    const result: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        count: growth[dateKey] || 0
      });
    }

    return result;
  }

  /**
   * Calculate traffic sources
   * حساب مصادر الزيارات
   */
  static calculateTrafficSources(userActivity: any[]): { [key: string]: number } {
    const sources: { [key: string]: number } = {};
    userActivity.forEach(activity => {
      if (activity.trafficSource) {
        sources[activity.trafficSource] = (sources[activity.trafficSource] || 0) + 1;
      }
    });
    return sources;
  }

  /**
   * Calculate geographic distribution
   * حساب التوزيع الجغرافي
   */
  static calculateGeoDistribution(users: any[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    users.forEach(user => {
      const location = user.locationData?.cityName || user.location?.city || 'Unknown';
      distribution[location] = (distribution[location] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Calculate device usage
   * حساب استخدام الأجهزة
   */
  static calculateDeviceUsage(userActivity: any[]): { [key: string]: number } {
    const devices: { [key: string]: number } = {};
    userActivity.forEach(activity => {
      if (activity.device) {
        devices[activity.device] = (devices[activity.device] || 0) + 1;
      }
    });
    return devices;
  }

  /**
   * Calculate page views
   * حساب مشاهدات الصفحات
   */
  static calculatePageViews(views: any[]): { [key: string]: number } {
    const pages: { [key: string]: number } = {};
    views.forEach(view => {
      if (view.page) {
        pages[view.page] = (pages[view.page] || 0) + 1;
      }
    });
    return pages;
  }

  /**
   * Get top countries
   * الحصول على أكثر الدول
   */
  static getTopCountries(users: any[], limit: number = QUERY_LIMITS.TOP_COUNTRIES): { country: string; count: number }[] {
    const countryCounts: { [key: string]: number } = {};
    users.forEach(user => {
      const country = user.location?.country || 'Bulgaria';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    return Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get top cities
   * الحصول على أكثر المدن
   */
  static getTopCities(users: any[], limit: number = QUERY_LIMITS.TOP_CITIES): { city: string; count: number }[] {
    const cityCounts: { [key: string]: number } = {};
    users.forEach(user => {
      const city = user.locationData?.cityName || user.location?.city || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    return Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Calculate revenue from sold cars
   * حساب الإيرادات من السيارات المباعة
   */
  static calculateRevenue(cars: any[]): number {
    return cars
      .filter((car: any) => car.status === 'sold' && car.price)
      .reduce((sum, car) => sum + (car.price || 0), 0);
  }

  /**
   * Get user activity data
   * الحصول على بيانات نشاط المستخدمين
   */
  static async getUserActivity(): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        orderBy('lastLogin', 'desc'),
        limit(QUERY_LIMITS.USER_ACTIVITY)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => {
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
    } catch (error) {
      serviceLogger.error('Error getting user activity', error as Error);
      return [];
    }
  }

  /**
   * Get content moderation data
   * الحصول على بيانات إدارة المحتوى
   */
  static async getContentModeration(): Promise<ContentModeration> {
    try {
      const [
        reportedCarsSnapshot,
        pendingReviewsSnapshot,
        bannedUsersSnapshot,
        deletedContentSnapshot,
        flaggedMessagesSnapshot
      ] = await Promise.all([
        queryAllCollections(where('isReported', '==', true)).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, COLLECTIONS.REVIEWS), where('status', '==', 'pending'))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, COLLECTIONS.USERS), where('status', '==', 'banned'))).catch(() => ({ docs: [] })),
        queryAllCollections(where('isDeleted', '==', true)).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, COLLECTIONS.MESSAGES), where('isFlagged', '==', true))).catch(() => ({ docs: [] }))
      ]);

      return {
        reportedCars: reportedCarsSnapshot.docs?.length || 0,
        pendingReviews: pendingReviewsSnapshot.docs.length,
        bannedUsers: bannedUsersSnapshot.docs.length,
        deletedContent: deletedContentSnapshot.docs?.length || 0,
        flaggedMessages: flaggedMessagesSnapshot.docs.length
      };
    } catch (error) {
      serviceLogger.error('Error getting content moderation data', error as Error);
      return {
        reportedCars: 0,
        pendingReviews: 0,
        bannedUsers: 0,
        deletedContent: 0,
        flaggedMessages: 0
      };
    }
  }

  /**
   * Get system performance data
   * الحصول على بيانات أداء النظام
   */
  static async getSystemPerformance(): Promise<SystemPerformance[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.SYSTEM_PERFORMANCE),
          orderBy('timestamp', 'desc'),
          limit(100)
        )
      );

      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          timestamp: data.timestamp?.toDate() || new Date(),
          responseTime: data.responseTime || 0,
          memoryUsage: data.memoryUsage || 0,
          cpuUsage: data.cpuUsage || 0,
          activeConnections: data.activeConnections || 0,
          errorRate: data.errorRate || 0
        };
      });
    } catch (error) {
      serviceLogger.error('Error getting system performance data', error as Error);
      return [];
    }
  }

  /**
   * Get mock analytics for fallback
   * الحصول على تحليلات وهمية للنسخ الاحتياطي
   */
  static getMockAnalytics(): RealTimeAnalytics {
    serviceLogger.info('Returning default analytics fallback (no mock inflation)');
    return {
      ...DEFAULT_ANALYTICS,
      lastUpdated: new Date()
    };
  }

  /**
   * Get mock user activity for fallback
   * الحصول على نشاط مستخدمين وهمي للنسخ الاحتياطي
   */
  static getMockUserActivity(): UserActivity[] {
    return [
      {
        uid: 'mock-user-1',
        email: 'user1@example.com',
        displayName: 'John Doe',
        lastLogin: new Date(),
        loginCount: 25,
        location: 'Sofia, Bulgaria',
        device: 'desktop',
        browser: 'chrome',
        isOnline: true,
        lastActivity: new Date()
      }
    ];
  }
}