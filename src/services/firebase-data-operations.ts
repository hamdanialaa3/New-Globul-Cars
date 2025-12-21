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
import { firebaseAuthUsersService } from './firebase-auth-users-service';
import { firebaseAuthRealUsers } from './firebase-auth-real-users';
import { serviceLogger } from './logger-service';
import { countAllVehicles, queryAllCollections } from './search/multi-collection-helper';
import {
  UserActivity,
  RealTimeAnalytics,
  RealTimeUpdate,
  AnalyticsCallback,
  UnsubscribeFunction
} from './firebase-data-types';
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
 * Get real users count from Firebase Authentication
 * الحصول على عدد المستخدمين الحقيقيين من Firebase Authentication
 */
export async function getRealUsersCount(): Promise<number> {
  try {
    serviceLogger.debug('Fetching REAL users count from Firebase Authentication');

    // Try to get from Firebase Auth first (the REAL source!)
    try {
      const authUsersCount = await firebaseAuthRealUsers.getRealAuthUsersCount();
      serviceLogger.info('REAL users from Firebase Auth', { count: authUsersCount });
      return authUsersCount;
    } catch (authError) {
      serviceLogger.warn('Could not get from Firebase Auth - falling back to Firestore');
    }

    // Fallback: Get from Firestore users collection
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const firestoreUsers = usersSnapshot.docs.length;

    serviceLogger.info('Firestore users found', { count: firestoreUsers });
    serviceLogger.warn('Note: This may be less than Firebase Auth users if sync not run');

    return firestoreUsers;
  } catch (error) {
    serviceLogger.error('Error getting users count', error as Error);
    return 0;
  }
}

/**
 * Get real active users count
 * الحصول على عدد المستخدمين النشطين الحقيقيين
 */
export async function getRealActiveUsersCount(): Promise<number> {
  try {
    // Try to get from Firebase Auth first
    try {
      const activeAuthUsers = await firebaseAuthRealUsers.getActiveAuthUsers();
      serviceLogger.info('Active users from Firebase Auth', { count: activeAuthUsers });
      return activeAuthUsers;
    } catch (authError) {
      serviceLogger.warn('Could not get active users from Auth - using Firestore');
    }

    // Fallback: Get from Firestore
    const now = new Date();
    const yesterday = new Date(now.getTime() - TIME_CONSTANTS.ONE_DAY_MS);

    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('lastLogin', '>=', yesterday)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.length;
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

    // Use the new Firebase Auth Users Service
    const realUsers = await firebaseAuthUsersService.getRealFirebaseUsers();

    return realUsers.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      location: `${user.location?.city || 'Unknown'}, ${user.location?.country || 'Bulgaria'}`,
      device: user.device,
      browser: user.browser,
      isOnline: user.isOnline,
      lastActivity: user.lastActivity,
      stats: user.stats
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
      const users = snapshot.docs.map(doc => doc.data());
      const data: RealTimeUpdate = {
        users,
        timestamp: new Date()
      };
      callback(data);
    }
  );

  return unsubscribe;
}
