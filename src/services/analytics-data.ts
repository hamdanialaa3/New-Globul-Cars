/**
 * Analytics Data
 *
 * This module contains all constants and configuration data for the analytics system.
 */

// Cache configuration
export const CACHE_DURATION = 30000; // 30 seconds
export const CACHE_KEY = 'realtime_analytics_cache';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CARS: 'cars',
  MESSAGES: 'messages',
  VIEWS: 'views',
  USER_ACTIVITY: 'userActivity',
  REPORTS: 'reports',
  REVIEWS: 'reviews',
  BANNED_USERS: 'bannedUsers',
  DELETED_CONTENT: 'deletedContent',
  FLAGGED_MESSAGES: 'flaggedMessages',
  SYSTEM_PERFORMANCE: 'systemPerformance'
} as const;

// Query limits
// حدود الاستعلامات
export const QUERY_LIMITS = {
  USERS: 1000,
  CARS: 1000,
  MESSAGES: 500,
  VIEWS: 500,
  USER_ACTIVITY: 100,
  TOP_COUNTRIES: 10,
  TOP_CITIES: 20,
  GROWTH_DAYS: 30,
  LISTINGS_DAYS: 30
} as const;

// Time periods
// الفترات الزمنية
export const TIME_PERIODS = {
  TODAY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
  MONTH: 30 * 24 * 60 * 60 * 1000, // 30 days
  ACTIVE_USER_THRESHOLD: 24 * 60 * 60 * 1000 // 24 hours for active users
} as const;

// Analytics categories
// فئات التحليلات
export const ANALYTICS_CATEGORIES = {
  TRAFFIC_SOURCES: [
    'direct',
    'google',
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'other'
  ],
  DEVICES: [
    'desktop',
    'mobile',
    'tablet'
  ],
  BROWSERS: [
    'chrome',
    'firefox',
    'safari',
    'edge',
    'opera',
    'other'
  ]
} as const;

// Performance thresholds
// عتبات الأداء
export const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME_WARNING: 2000, // 2 seconds
  RESPONSE_TIME_CRITICAL: 5000, // 5 seconds
  MEMORY_WARNING: 80, // 80%
  CPU_WARNING: 70, // 70%
  ERROR_RATE_WARNING: 5, // 5%
  ERROR_RATE_CRITICAL: 10 // 10%
} as const;

// Default analytics structure
// هيكل التحليلات الافتراضي
export const DEFAULT_ANALYTICS: RealTimeAnalytics = {
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  totalCars: 0,
  activeCars: 0,
  carsListedToday: 0,
  totalMessages: 0,
  messagesSentToday: 0,
  totalViews: 0,
  viewsToday: 0,
  revenue: 0,
  trafficSources: {},
  geoDistribution: {},
  deviceUsage: {},
  pageViews: {},
  topCountries: [],
  topCities: [],
  userGrowth: [],
  carListings: [],
  lastUpdated: new Date()
};

// Bulgarian market specific data
// بيانات السوق البلغاري
export const BULGARIAN_MARKET_DATA = {
  CURRENCY: 'BGN',
  TIMEZONE: 'Europe/Sofia',
  MAIN_CITIES: [
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
  ],
  POPULAR_BRANDS: [
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Volkswagen',
    'Opel',
    'Ford',
    'Toyota',
    'Honda',
    'Renault',
    'Peugeot'
  ]
};

// Error messages
// رسائل الخطأ
export const ERROR_MESSAGES = {
  CACHE_EXPIRED: 'Analytics cache expired',
  FIREBASE_ERROR: 'Failed to fetch data from Firebase',
  INVALID_DATA: 'Invalid analytics data received',
  SUBSCRIPTION_FAILED: 'Failed to subscribe to real-time updates',
  PERFORMANCE_DEGRADED: 'System performance degraded'
} as const;

// Success messages
// رسائل النجاح
export const SUCCESS_MESSAGES = {
  CACHE_UPDATED: 'Analytics cache updated successfully',
  DATA_FETCHED: 'Analytics data fetched from Firebase',
  SUBSCRIPTION_ACTIVE: 'Real-time subscription active',
  PERFORMANCE_NORMAL: 'System performance within normal parameters'
} as const;
