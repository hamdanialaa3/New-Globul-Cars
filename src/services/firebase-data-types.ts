/**
 * FIREBASE DATA TYPES
 * أنواع بيانات Firebase
 */

/**
 * User activity data
 * بيانات نشاط المستخدم
 */
export interface UserActivity {
  uid: string;
  email: string | null;
  displayName: string | null;
  lastLogin: Date;
  loginCount: number;
  location: string;
  device: string;
  browser: string;
  isOnline: boolean;
  lastActivity: Date;
  stats: UserStats;
}

/**
 * User statistics
 * إحصائيات المستخدم
 */
export interface UserStats {
  carsListed: number;
  carsSold: number;
  totalViews: number;
}

/**
 * Real-time analytics data
 * بيانات التحليلات في الوقت الفعلي
 */
export interface RealTimeAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalCars: number;
  activeCars: number;
  totalMessages: number;
  totalViews: number;
  revenue: number;
  lastUpdated: Date;
}

/**
 * Real-time update data
 * بيانات التحديث في الوقت الفعلي
 */
export interface RealTimeUpdate {
  users: unknown[];
  timestamp: Date;
}

/**
 * Firebase console URLs
 * روابط وحدة تحكم Firebase
 */
export interface FirebaseConsoleUrls {
  authentication: string;
  firestore: string;
}

/**
 * Analytics callback type
 * نوع دالة رد النداء للتحليلات
 */
export type AnalyticsCallback = (data: unknown) => void;

/**
 * Unsubscribe function type
 * نوع دالة إلغاء الاشتراك
 */
export type UnsubscribeFunction = () => void;
