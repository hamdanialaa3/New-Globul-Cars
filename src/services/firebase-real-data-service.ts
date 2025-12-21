/**
 * FIREBASE REAL DATA SERVICE
 * خدمة بيانات Firebase الحقيقية
 *
 * للوحة تحكم Super Admin - بيانات حقيقية فقط
 */

import { 
  UserActivity, 
  RealTimeAnalytics,
  AnalyticsCallback,
  UnsubscribeFunction
} from './firebase-data-types';
import {
  FIREBASE_CONSOLE_URLS
} from './firebase-data-config';
import {
  getRealUsersCount,
  getRealActiveUsersCount,
  getRealCarsCount,
  getRealActiveCarsCount,
  getRealMessagesCount,
  getRealViewsCount,
  getRealRevenue,
  getRealUserActivity,
  getRealAnalytics,
  subscribeToRealTimeUpdates
} from './firebase-data-operations';

/**
 * Firebase Real Data Service for Super Admin Dashboard
 * خدمة بيانات Firebase الحقيقية للوحة تحكم Super Admin
 */
class FirebaseRealDataService {
  private static instance: FirebaseRealDataService;

  private constructor() {}

  /**
   * Get singleton instance
   * الحصول على مثيل singleton
   */
  public static getInstance(): FirebaseRealDataService {
    if (!FirebaseRealDataService.instance) {
      FirebaseRealDataService.instance = new FirebaseRealDataService();
    }
    return FirebaseRealDataService.instance;
  }

  /**
   * Get real users count from Firebase Authentication (NOT Firestore!)
   * الحصول على عدد المستخدمين الحقيقيين من Firebase Authentication
   */
  public async getRealUsersCount(): Promise<number> {
    return getRealUsersCount();
  }

  /**
   * Get real active users count
   * الحصول على عدد المستخدمين النشطين الحقيقيين
   */
  public async getRealActiveUsersCount(): Promise<number> {
    return getRealActiveUsersCount();
  }

  /**
   * Get real cars count from Firebase - ALL COLLECTIONS
   * الحصول على عدد السيارات الحقيقي من Firebase - جميع المجموعات
   */
  public async getRealCarsCount(): Promise<number> {
    return getRealCarsCount();
  }

  /**
   * Get real active cars count - ALL COLLECTIONS
   * الحصول على عدد السيارات النشطة الحقيقي - جميع المجموعات
   */
  public async getRealActiveCarsCount(): Promise<number> {
    return getRealActiveCarsCount();
  }

  /**
   * Get real messages count from Firebase
   * الحصول على عدد الرسائل الحقيقي من Firebase
   */
  public async getRealMessagesCount(): Promise<number> {
    return getRealMessagesCount();
  }

  /**
   * Get real views count from Firebase
   * الحصول على عدد المشاهدات الحقيقي من Firebase
   */
  public async getRealViewsCount(): Promise<number> {
    return getRealViewsCount();
  }

  /**
   * Get real revenue from Firebase
   * الحصول على الإيرادات الحقيقية من Firebase
   */
  public async getRealRevenue(): Promise<number> {
    return getRealRevenue();
  }

  /**
   * Get real user activity data
   * الحصول على بيانات نشاط المستخدم الحقيقي
   */
  public async getRealUserActivity(): Promise<UserActivity[]> {
    return getRealUserActivity();
  }

  /**
   * Prefer server-side computed analytics via callable; fallback to client aggregation
   * تفضيل التحليلات المحسوبة من جانب الخادم؛ التراجع إلى التجميع من جانب العميل
   */
  public async getRealAnalytics(): Promise<RealTimeAnalytics> {
    return getRealAnalytics();
  }

  /**
   * Subscribe to real-time updates
   * الاشتراك في التحديثات في الوقت الفعلي
   */
  public subscribeToRealTimeUpdates(callback: AnalyticsCallback): UnsubscribeFunction {
    return subscribeToRealTimeUpdates(callback);
  }

  /**
   * Get Firebase Console URL for user management
   * الحصول على رابط وحدة تحكم Firebase لإدارة المستخدمين
   */
  public getFirebaseConsoleUrl(): string {
    return FIREBASE_CONSOLE_URLS.AUTHENTICATION;
  }

  /**
   * Get Firebase Console URL for Firestore
   * الحصول على رابط وحدة تحكم Firebase لـ Firestore
   */
  public getFirestoreConsoleUrl(): string {
    return FIREBASE_CONSOLE_URLS.FIRESTORE;
  }
}

// ==================== EXPORTS ====================

export const firebaseRealDataService = FirebaseRealDataService.getInstance();
export default firebaseRealDataService;

// Re-export types for convenience
export type { 
  UserActivity, 
  RealTimeAnalytics, 
  UserStats 
} from './firebase-data-types';
