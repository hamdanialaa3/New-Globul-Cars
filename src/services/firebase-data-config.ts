/**
 * FIREBASE DATA CONFIGURATION
 * تكوين بيانات Firebase
 */

/**
 * Firebase project ID
 * معرف مشروع Firebase
 */
export const FIREBASE_PROJECT_ID = 'studio-448742006-a3493';

/**
 * Firebase console URLs
 * روابط وحدة تحكم Firebase
 */
export const FIREBASE_CONSOLE_URLS = {
  AUTHENTICATION: `https://console.firebase.google.com/u/0/project/${FIREBASE_PROJECT_ID}/authentication/users`,
  FIRESTORE: `https://console.firebase.google.com/u/0/project/${FIREBASE_PROJECT_ID}/firestore/data`,
  FUNCTIONS: `https://console.firebase.google.com/u/0/project/${FIREBASE_PROJECT_ID}/functions`,
  STORAGE: `https://console.firebase.google.com/u/0/project/${FIREBASE_PROJECT_ID}/storage`
};

/**
 * Collection names
 * أسماء المجموعات
 */
export const COLLECTIONS = {
  USERS: 'users',
  MESSAGES: 'messages',
  VIEWS: 'views',
  ANALYTICS: 'analytics'
};

/**
 * Time constants
 * ثوابت الوقت
 */
export const TIME_CONSTANTS = {
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  TWO_HOURS_MS: 2 * 60 * 60 * 1000
};

/**
 * Commission rate
 * معدل العمولة
 */
export const COMMISSION_RATE = 0.05; // 5% commission

/**
 * Fallback user activity data
 * بيانات نشاط المستخدم الاحتياطية
 */
export const FALLBACK_USER_ACTIVITY = [
  {
    uid: 'firebase-auth-user-1',
    email: 'user1@example.com',
    displayName: 'John Smith',
    lastLogin: new Date(),
    loginCount: 15,
    location: 'Sofia, Bulgaria',
    device: 'Desktop',
    browser: 'Chrome',
    isOnline: true,
    lastActivity: new Date(),
    stats: { carsListed: 3, carsSold: 1, totalViews: 45 }
  },
  {
    uid: 'firebase-auth-user-2',
    email: 'user2@example.com',
    displayName: 'Maria Petrova',
    lastLogin: new Date(Date.now() - TIME_CONSTANTS.TWO_HOURS_MS),
    loginCount: 8,
    location: 'Plovdiv, Bulgaria',
    device: 'Mobile',
    browser: 'Safari',
    isOnline: false,
    lastActivity: new Date(Date.now() - TIME_CONSTANTS.TWO_HOURS_MS),
    stats: { carsListed: 7, carsSold: 3, totalViews: 89 }
  }
];

/**
 * Default analytics data
 * بيانات التحليلات الافتراضية
 */
export const DEFAULT_ANALYTICS = {
  totalUsers: 0,
  activeUsers: 0,
  totalCars: 0,
  activeCars: 0,
  totalMessages: 0,
  totalViews: 0,
  revenue: 0,
  lastUpdated: new Date()
};

/**
 * Error codes to ignore
 * رموز الأخطاء المراد تجاهلها
 */
export const IGNORED_ERROR_CODES = ['permission-denied'];
