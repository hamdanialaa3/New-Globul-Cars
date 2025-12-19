/**
 * Super Admin Operations
 * عمليات خدمة الإدارة الفائقة
 */

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import {
  RealTimeAnalytics,
  UserActivity,
  ContentModeration,
  UserGrowthData,
  CarListingsData,
  AdminActionLog,
  FlaggedContent,
  BannedUser,
  DeletedContent
} from './super-admin-types';
import {
  SUPER_ADMIN_COLLECTIONS,
  QUERY_LIMITS,
  DEFAULT_ANALYTICS,
  DEFAULT_CONTENT_MODERATION,
  ADMIN_ACTIONS,
  CONTENT_TYPES,
  FLAG_STATUSES,
  REVENUE_PARAMS,
  ERROR_MESSAGES
} from './super-admin-data';

/**
 * Super Admin Operations Class
 * فئة عمليات خدمة الإدارة الفائقة
 */
export class SuperAdminOperations {
  /**
   * Fetch users data from Firebase
   * جلب بيانات المستخدمين من Firebase
   */
  static async fetchUsersData() {
    try {
      const usersSnapshot = await getDocs(collection(db, SUPER_ADMIN_COLLECTIONS.USERS));
      return usersSnapshot;
    } catch (error) {
      serviceLogger.error('Error fetching users data', error as Error);
      throw error;
    }
  }

  /**
   * Fetch cars data from all collections
   * جلب بيانات السيارات من جميع المجموعات
   */
  static async fetchCarsData() {
    try {
      // Note: queryAllCollections is assumed to be imported from another service
      // For now, we'll use a placeholder - this needs to be implemented
      const carsSnapshot = await getDocs(collection(db, SUPER_ADMIN_COLLECTIONS.CARS));
      return carsSnapshot;
    } catch (error) {
      serviceLogger.error('Error fetching cars data', error as Error);
      throw error;
    }
  }

  /**
   * Fetch messages data
   * جلب بيانات الرسائل
   */
  static async fetchMessagesData() {
    try {
      const messagesSnapshot = await getDocs(collection(db, SUPER_ADMIN_COLLECTIONS.MESSAGES));
      return messagesSnapshot;
    } catch (error) {
      serviceLogger.error('Error fetching messages data', error as Error);
      throw error;
    }
  }

  /**
   * Fetch analytics/views data
   * جلب بيانات التحليلات والمشاهدات
   */
  static async fetchAnalyticsData() {
    try {
      const analyticsSnapshot = await getDocs(collection(db, SUPER_ADMIN_COLLECTIONS.ANALYTICS));
      return analyticsSnapshot;
    } catch (error) {
      serviceLogger.error('Error fetching analytics data', error as Error);
      throw error;
    }
  }

  /**
   * Calculate active users (last 24 hours)
   * حساب المستخدمين النشطين (آخر 24 ساعة)
   */
  static calculateActiveUsers(usersSnapshot: any): number {
    const activeUsers = usersSnapshot.docs.filter((doc: any) => {
      const data = doc.data();
      const lastLogin = data.lastLogin?.toDate();
      return lastLogin && (Date.now() - lastLogin.getTime()) < 24 * 60 * 60 * 1000;
    }).length;
    return activeUsers;
  }

  /**
   * Calculate active cars
   * حساب السيارات النشطة
   */
  static calculateActiveCars(carsSnapshot: any): number {
    const activeCars = carsSnapshot.docs.filter((doc: any) =>
      doc.data().isActive === true
    ).length;
    return activeCars;
  }

  /**
   * Calculate total views
   * حساب إجمالي المشاهدات
   */
  static calculateTotalViews(analyticsSnapshot: any): number {
    const totalViews = analyticsSnapshot.docs.reduce((sum: number, doc: any) =>
      sum + (doc.data().views || 0), 0
    );
    return totalViews;
  }

  /**
   * Analyze geographic distribution
   * تحليل التوزيع الجغرافي
   */
  static analyzeGeographicDistribution(usersSnapshot: any) {
    const countries = new Map<string, number>();
    const cities = new Map<string, number>();

    usersSnapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      if (data.location?.country) {
        countries.set(data.location.country, (countries.get(data.location.country) || 0) + 1);
      }
      if (data.location?.city) {
        cities.set(data.location.city, (cities.get(data.location.city) || 0) + 1);
      }
    });

    const topCountries = Array.from(countries.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, QUERY_LIMITS.TOP_COUNTRIES);

    const topCities = Array.from(cities.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, QUERY_LIMITS.TOP_CITIES);

    return { topCountries, topCities };
  }

  /**
   * Get user growth data (last 30 days)
   * الحصول على بيانات نمو المستخدمين (آخر 30 يوم)
   */
  static async getUserGrowthData(): Promise<UserGrowthData[]> {
    try {
      // Implementation for user growth analysis
      // This would typically query user creation dates
      const growthData: UserGrowthData[] = [];
      // Placeholder implementation
      return growthData;
    } catch (error) {
      serviceLogger.error('Error getting user growth data', error as Error);
      return [];
    }
  }

  /**
   * Get car listings data
   * الحصول على بيانات قوائم السيارات
   */
  static async getCarListingsData(): Promise<CarListingsData[]> {
    try {
      // Implementation for car listings analysis
      const listingsData: CarListingsData[] = [];
      // Placeholder implementation
      return listingsData;
    } catch (error) {
      serviceLogger.error('Error getting car listings data', error as Error);
      return [];
    }
  }

  /**
   * Calculate revenue
   * حساب الإيرادات
   */
  static async calculateRevenue(): Promise<number> {
    try {
      // Implementation for revenue calculation
      // This would typically sum up transaction amounts
      return 0;
    } catch (error) {
      serviceLogger.error('Error calculating revenue', error as Error);
      return 0;
    }
  }

  /**
   * Get user activity data
   * الحصول على بيانات نشاط المستخدمين
   */
  static async getUserActivity(): Promise<UserActivity[]> {
    try {
      const usersSnapshot = await getDocs(
        query(
          collection(db, SUPER_ADMIN_COLLECTIONS.USERS),
          orderBy('lastLogin', 'desc'),
          limit(QUERY_LIMITS.USER_ACTIVITY)
        )
      );

      return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || 'Unknown',
          lastLogin: data.lastLogin?.toDate() || new Date(),
          loginCount: data.loginCount || 0,
          location: `${data.location?.city || 'Unknown'}, ${data.location?.region || 'Unknown'}`,
          device: data.device || 'Unknown',
          browser: data.browser || 'Unknown',
          isOnline: data.isOnline || false,
          lastActivity: data.lastActivity?.toDate() || new Date()
        };
      });
    } catch (error) {
      serviceLogger.error('Error fetching user activity', error as Error);
      throw error;
    }
  }

  /**
   * Ban user
   * حظر مستخدم
   */
  static async banUser(userId: string, reason: string, adminEmail: string): Promise<void> {
    try {
      const userRef = doc(db, SUPER_ADMIN_COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        isBanned: true,
        banReason: reason,
        bannedAt: serverTimestamp(),
        bannedBy: adminEmail
      });

      await this.logAdminAction(ADMIN_ACTIONS.BAN_USER, { userId, reason }, adminEmail);
    } catch (error) {
      serviceLogger.error('Error banning user', error as Error, { userId, reason });
      throw error;
    }
  }

  /**
   * Unban user
   * إلغاء حظر مستخدم
   */
  static async unbanUser(userId: string, adminEmail: string): Promise<void> {
    try {
      const userRef = doc(db, SUPER_ADMIN_COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null
      });

      await this.logAdminAction(ADMIN_ACTIONS.UNBAN_USER, { userId }, adminEmail);
    } catch (error) {
      serviceLogger.error('Error unbanning user', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Delete user completely
   * حذف مستخدم بالكامل
   */
  static async deleteUser(userId: string, adminEmail: string): Promise<void> {
    if (!userId) {
      serviceLogger.warn('[SuperAdminOperations] deleteUser called with null/undefined userId');
      throw new Error(ERROR_MESSAGES.INVALID_USER_ID);
    }

    try {
      const batch = writeBatch(db);

      // Delete user data
      batch.delete(doc(db, SUPER_ADMIN_COLLECTIONS.USERS, userId));

      // Delete user's cars (placeholder - needs queryAllCollections)
      // const carsSnapshot = await getDocs(queryAllCollections(where('sellerId', '==', userId)));
      // carsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Delete user's messages
      const messagesSnapshot = await getDocs(
        query(collection(db, SUPER_ADMIN_COLLECTIONS.MESSAGES), where('senderId', '==', userId))
      );
      messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
      await this.logAdminAction(ADMIN_ACTIONS.DELETE_USER, { userId }, adminEmail);
    } catch (error) {
      serviceLogger.error('Error deleting user', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Delete car
   * حذف سيارة
   */
  static async deleteCar(carId: string, reason: string, adminEmail: string): Promise<void> {
    try {
      await deleteDoc(doc(db, SUPER_ADMIN_COLLECTIONS.CARS, carId));
      await this.logAdminAction(ADMIN_ACTIONS.DELETE_CAR, { carId, reason }, adminEmail);
    } catch (error) {
      serviceLogger.error('Error deleting car', error as Error, { carId, reason });
      throw error;
    }
  }

  /**
   * Flag content
   * الإبلاغ عن محتوى
   */
  static async flagContent(
    contentId: string,
    type: string,
    reason: string,
    adminEmail: string
  ): Promise<void> {
    try {
      const flagRef = doc(collection(db, SUPER_ADMIN_COLLECTIONS.FLAGGED_CONTENT));
      await updateDoc(flagRef, {
        contentId,
        type,
        reason,
        flaggedBy: adminEmail,
        flaggedAt: serverTimestamp(),
        status: FLAG_STATUSES.PENDING
      });
    } catch (error) {
      serviceLogger.error('Error flagging content', error as Error, { contentId, type, reason });
      throw error;
    }
  }

  /**
   * Get content moderation data
   * الحصول على بيانات الإشراف على المحتوى
   */
  static async getContentModeration(): Promise<ContentModeration> {
    try {
      // Placeholder implementation - needs queryAllCollections
      const [pendingReviews, bannedUsers, deletedContent, flaggedMessages] = await Promise.all([
        // queryAllCollections(where('isReported', '==', true)),
        getDocs(query(collection(db, SUPER_ADMIN_COLLECTIONS.REVIEWS), where('status', '==', 'pending'))),
        getDocs(query(collection(db, SUPER_ADMIN_COLLECTIONS.USERS), where('isBanned', '==', true))),
        getDocs(collection(db, SUPER_ADMIN_COLLECTIONS.DELETED_CONTENT)),
        getDocs(query(collection(db, SUPER_ADMIN_COLLECTIONS.MESSAGES), where('isFlagged', '==', true)))
      ]);

      return {
        reportedCars: 0, // Placeholder
        pendingReviews: pendingReviews.size,
        bannedUsers: bannedUsers.size,
        deletedContent: deletedContent.size,
        flaggedMessages: flaggedMessages.size
      };
    } catch (error) {
      serviceLogger.error('Error fetching content moderation data', error as Error);
      return DEFAULT_CONTENT_MODERATION;
    }
  }

  /**
   * Log admin action
   * تسجيل عمل إداري
   */
  static async logAdminAction(action: string, details: any, adminEmail: string): Promise<void> {
    try {
      const logRef = doc(collection(db, SUPER_ADMIN_COLLECTIONS.ADMIN_LOGS));
      await updateDoc(logRef, {
        action,
        details,
        adminEmail,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error logging admin action', error as Error, { action, details });
    }
  }

  /**
   * Get mock analytics for fallback
   * الحصول على تحليلات وهمية للرجوع إليها
   */
  static getMockAnalytics(): RealTimeAnalytics {
    return DEFAULT_ANALYTICS;
  }
}