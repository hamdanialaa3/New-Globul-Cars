/**
 * FIREBASE DATA OPERATIONS
 * عمليات بيانات Firebase
 */

import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, functions } from '../firebase/firebase-config';
import { httpsCallable } from 'firebase/functions';
import { advancedUserManagementService } from './advanced-user-management-service';
import { serviceLogger } from './logger-service';
import { countAllVehicles, queryAllCollections } from './search/multi-collection-helper';
import {
  UserActivity,
  RealTimeAnalytics,
  RealTimeUpdate,
  AnalyticsCallback,
  UnsubscribeFunction
} from './firebase-data-types';
import { AdvancedUser } from './advanced-user-management-types';
import {
  COLLECTIONS,
  TIME_CONSTANTS,
  COMMISSION_RATE,
  FALLBACK_USER_ACTIVITY,
  DEFAULT_ANALYTICS,
  IGNORED_ERROR_CODES
} from './firebase-data-config';
// Import updated parameters for consistent revenue logic
import { REVENUE_PARAMS } from './super-admin-data';

/**
 * Get real users count from Firebase Authentication via Advanced User Management
 */
export async function getRealUsersCount(): Promise<number> {
  try {
    const stats = await advancedUserManagementService.getSystemStats();
    return stats.totalUsers;
  } catch (error) {
    serviceLogger.error('Error getting users count', error as Error);
    return 0;
  }
}

/**
 * Get real active users count via Advanced User Management
 */
export async function getRealActiveUsersCount(): Promise<number> {
  try {
    const stats = await advancedUserManagementService.getSystemStats();
    return stats.activeUsers;
  } catch (error) {
    serviceLogger.error('Error getting active users count', error as Error);
    return 0;
  }
}

/**
 * Get real cars count from Firebase - ALL COLLECTIONS
 * الحصول على عدد السيارات الحقيقي من Firebase - جميع المجموعات
 */
export async function getRealCarsCount(): Promise<number> {
  try {
    const count = await countAllVehicles();
    serviceLogger.info('Total vehicles count across all collections', { count });
    return count;
  } catch (error) {
    serviceLogger.error('Error getting cars count', error as Error);
    throw error;
  }
}

/**
 * Get real active cars count - ALL COLLECTIONS
 * الحصول على عدد السيارات النشطة الحقيقي - جميع المجموعات
 */
export async function getRealActiveCarsCount(): Promise<number> {
  try {
    const activeCars = await queryAllCollections(
      where('isActive', '==', true)
    );

    serviceLogger.info('Active vehicles count across all collections', { count: activeCars.length });
    return activeCars.length;
  } catch (error) {
    serviceLogger.error('Error getting active cars count', error as Error);
    throw error;
  }
}

/**
 * Get real messages count from Firebase
 * الحصول على عدد الرسائل الحقيقي من Firebase
 */
export async function getRealMessagesCount(): Promise<number> {
  try {
    const messagesSnapshot = await getDocs(collection(db, COLLECTIONS.MESSAGES));
    return messagesSnapshot.docs.length;
  } catch (error: unknown) {
    // Silently fail for permission errors (non-critical data)
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError?.code && !IGNORED_ERROR_CODES.includes(firebaseError.code)) {
      serviceLogger.error('Error getting messages count', error instanceof Error ? error : new Error(String(error)));
    }
    return 0;
  }
}

/**
 * Get real views count from Firebase
 * الحصول على عدد المشاهدات الحقيقي من Firebase
 */
export async function getRealViewsCount(): Promise<number> {
  try {
    const viewsSnapshot = await getDocs(collection(db, COLLECTIONS.VIEWS));
    return viewsSnapshot.docs.length;
  } catch (error: unknown) {
    // Silently fail for permission errors (non-critical data)
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError?.code && !IGNORED_ERROR_CODES.includes(firebaseError.code)) {
      serviceLogger.error('Error getting views count', error instanceof Error ? error : new Error(String(error)));
    }
    return 0;
  }
}

/**
 * Get real revenue from Firebase
 * الحصول على الإيرادات الحقيقية من Firebase
 */
export async function getRealRevenue(): Promise<number> {
  try {
    // queryAllCollections returns an array, NOT a snapshot with .docs
    const allCars = await queryAllCollections();
    let totalRevenue = 0;

    allCars.forEach((car: any) => {
      // 1. Commission from sold cars
      if (car.isSold && car.price) {
        totalRevenue += car.price * COMMISSION_RATE;
      }

      // 2. Fees from active promotions (Strict Fix)
      if (car.isActive) {
        if (car.isFeatured) {
          totalRevenue += REVENUE_PARAMS.FEATURED_LISTING_FEE;
        }
        if (car.isUrgent) {
          totalRevenue += REVENUE_PARAMS.PREMIUM_LISTING_FEE;
        }
      }
    });

    return totalRevenue;
  } catch (error) {
    serviceLogger.error('Error getting revenue', error as Error);
    throw error;
  }
}

/**
 * Get real user activity data
 * الحصول على بيانات نشاط المستخدم الحقيقي
 */
export async function getRealUserActivity(): Promise<UserActivity[]> {
  try {
    serviceLogger.debug('Fetching real user activity');

    // Use the new Advanced User Management Service
    const realUsers = await advancedUserManagementService.getUsers();

    return realUsers.map((user: AdvancedUser) => ({
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(0),
      loginCount: 0,
      location: `${user.preferences?.language === 'bg' ? 'Bulgaria' : 'Global'}`,
      device: 'Desktop',
      browser: 'Chrome',
      isOnline: user.status === 'active',
      lastActivity: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      stats: {
        carsListed: 0,
        carsSold: 0,
        totalViews: 0
      }
    }));

  } catch (error) {
    serviceLogger.error('Error getting user activity', error as Error);
    return FALLBACK_USER_ACTIVITY;
  }
}

/**
 * Get real analytics via callable function or client aggregation
 * الحصول على التحليلات الحقيقية عبر دالة قابلة للاستدعاء أو التجميع من جانب العميل
 */
export async function getRealAnalytics(): Promise<RealTimeAnalytics> {
  // 1) Try callable function (admin-safe, fastest, bypasses rules)
  try {
    const getAnalytics = httpsCallable(functions, 'getSuperAdminAnalytics');
    const res = await getAnalytics({});
    if (res && (res as any).data) {
      const data: Record<string, unknown> = (res as any).data;
      return {
        ...data,
        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated as string | number | Date) : new Date(),
      } as RealTimeAnalytics;
    }
  } catch (fnErr) {
    serviceLogger.warn('Callable getSuperAdminAnalytics failed; falling back to client aggregation');
  }

  // 2) Fallback: aggregate via direct reads
  try {
    const [
      totalUsers,
      activeUsers,
      totalCars,
      activeCars,
      totalMessages,
      totalViews,
      revenue
    ] = await Promise.all([
      getRealUsersCount(),
      getRealActiveUsersCount(),
      getRealCarsCount(),
      getRealActiveCarsCount(),
      getRealMessagesCount(),
      getRealViewsCount(),
      getRealRevenue()
    ]);

    return {
      totalUsers,
      activeUsers,
      totalCars,
      activeCars,
      totalMessages,
      totalViews,
      revenue,
      lastUpdated: new Date()
    };
  } catch (error) {
    serviceLogger.error('Error getting analytics', error as Error);
    return DEFAULT_ANALYTICS;
  }
}

/**
 * Subscribe to real-time updates
 * الاشتراك في التحديثات في الوقت الفعلي
 */
export function subscribeToRealTimeUpdates(callback: AnalyticsCallback): UnsubscribeFunction {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTIONS.USERS),
    (snapshot) => {
      const users = snapshot.docs.map((doc: any) => doc.data());
      const data: RealTimeUpdate = {
        users,
        timestamp: new Date()
      };
      callback(data);
    }
  );

  return unsubscribe;
}
