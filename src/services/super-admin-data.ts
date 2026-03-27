/**
 * Super Admin Data
 * بيانات خدمة الإدارة الفائقة
 */

import {
  SuperAdminCache,
  SuperAdminUser,
  RealTimeAnalytics,
  UserActivity,
  ContentModeration
} from './super-admin-types';

/**
 * Super Admin Constants
 * ثوابت خدمة الإدارة الفائقة
 */
export const SUPER_ADMIN_CONSTANTS = {
  EMAIL: 'alaa.hamdani@yahoo.com',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  ACTIVE_USER_THRESHOLD: 24 * 60 * 60 * 1000, // 24 hours
  MAX_TOP_COUNTRIES: 10,
  MAX_TOP_CITIES: 10,
  MAX_USER_ACTIVITY: 100,
  REVENUE_MULTIPLIER: 1.0
} as const;

/**
 * Collections used by Super Admin Service
 * المجموعات المستخدمة في خدمة الإدارة الفائقة
 */
export const SUPER_ADMIN_COLLECTIONS = {
  USERS: 'users',
  CARS: 'cars',
  MESSAGES: 'messages',
  ANALYTICS: 'analytics',
  REVIEWS: 'reviews',
  FLAGGED_CONTENT: 'flagged_content',
  DELETED_CONTENT: 'deleted_content',
  ADMIN_LOGS: 'admin_logs'
} as const;

/**
 * Query Limits
 * حدود الاستعلامات
 */
export const QUERY_LIMITS = {
  USER_ACTIVITY: 100,
  TOP_COUNTRIES: 10,
  TOP_CITIES: 10,
  ADMIN_LOGS: 50
} as const;

/**
 * Default Analytics Data
 * البيانات التحليلية الافتراضية
 */
export const DEFAULT_ANALYTICS: RealTimeAnalytics = {
  totalUsers: 0,
  activeUsers: 0,
  totalCars: 0,
  activeCars: 0,
  totalMessages: 0,
  totalViews: 0,
  revenue: 0,
  topCountries: [],
  topCities: [],
  userGrowth: [],
  carListings: [],
  lastUpdated: new Date()
};

/**
 * Default Content Moderation Data
 * بيانات الإشراف على المحتوى الافتراضية
 */
export const DEFAULT_CONTENT_MODERATION: ContentModeration = {
  reportedCars: 0,
  pendingReviews: 0,
  bannedUsers: 0,
  deletedContent: 0,
  flaggedMessages: 0
};

/**
 * Admin Action Types
 * أنواع أعمال الإدارة
 */
export const ADMIN_ACTIONS = {
  BAN_USER: 'ban_user',
  UNBAN_USER: 'unban_user',
  DELETE_USER: 'delete_user',
  DELETE_CAR: 'delete_car',
  FLAG_CONTENT: 'flag_content',
  RESOLVE_FLAG: 'resolve_flag',
  SYSTEM_MAINTENANCE: 'system_maintenance'
} as const;

/**
 * Content Types for Flagging
 * أنواع المحتوى للإبلاغ عنه
 */
export const CONTENT_TYPES = {
  CAR: 'car',
  MESSAGE: 'message',
  REVIEW: 'review',
  USER_PROFILE: 'user_profile',
  IMAGE: 'image'
} as const;

/**
 * Flag Statuses
 * حالات الإبلاغ
 */
export const FLAG_STATUSES = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
} as const;

/**
 * Bulgarian Market Focus Cities
 * مدن السوق البلغاري المركزة
 */
export const BULGARIAN_FOCUS_CITIES = [
  'Sofia',
  'Plovdiv',
  'Varna',
  'Burgas',
  'Ruse',
  'Stara Zagora',
  'Pleven',
  'Sliven',
  'Dobrich',
  'Shumen'
] as const;

/**
 * Revenue Calculation Parameters
 * معلمات حساب الإيرادات
 */
export const REVENUE_PARAMS = {
  COMMISSION_RATE: 0.05, // 5% commission
  PREMIUM_LISTING_FEE: 50, // BGN
  FEATURED_LISTING_FEE: 25, // BGN
  CURRENCY: 'BGN'
} as const;

/**
 * Cache Configuration
 * إعدادات الكاش
 */
export const CACHE_CONFIG = {
  ANALYTICS_DURATION: 5 * 60 * 1000, // 5 minutes
  USER_ACTIVITY_DURATION: 2 * 60 * 1000, // 2 minutes
  CONTENT_MODERATION_DURATION: 1 * 60 * 1000 // 1 minute
} as const;

/**
 * Error Messages
 * رسائل الخطأ
 */
export const ERROR_MESSAGES = {
  INVALID_USER_ID: 'Invalid userId provided for deletion',
  USER_NOT_FOUND: 'User not found',
  CAR_NOT_FOUND: 'Car not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  DATABASE_ERROR: 'Database operation failed',
  CACHE_ERROR: 'Cache operation failed'
} as const;
