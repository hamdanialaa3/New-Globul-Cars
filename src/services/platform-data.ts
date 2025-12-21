/**
 * Platform Data
 * بيانات المنصة الموحدة
 */

import { UserBehavior, MarketTrend } from './platform-types';

/**
 * Service Names
 * أسماء الخدمات
 */
export const SERVICE_NAMES = {
  FIREBASE: 'firebase',
  GEMINI: 'gemini',
  ALGOLIA: 'algolia',
  STRIPE: 'stripe',
  IOT: 'iot',
  AWS: 'aws',
  REKOGNITION: 'rekognition',
  PERSONALIZE: 'personalize',
  COMPREHEND: 'comprehend',
  QUICKSIGHT: 'quicksight',
  KINESIS: 'kinesis',
  WAF: 'waf',
  MACIE: 'macie'
} as const;

/**
 * Event Names for Analytics
 * أسماء الأحداث للتحليلات
 */
export const EVENT_NAMES = {
  CAR_ANALYSIS_COMPLETE: 'car_analysis_complete',
  SEARCH_PERFORMED: 'search_performed',
  PAYMENT_INITIATED: 'payment_initiated',
  RECOMMENDATION_VIEWED: 'recommendation_viewed',
  SECURITY_SCAN_PERFORMED: 'security_scan_performed'
} as const;

/**
 * Market Analysis Thresholds
 * عتبات تحليل السوق
 */
export const MARKET_THRESHOLDS = {
  HIGH_DEMAND_SCORE: 70,
  RARE_COMPETITOR_COUNT: 10,
  MIN_CONFIDENCE: 50,
  MAX_CONFIDENCE: 100
} as const;

/**
 * Security Thresholds
 * عتبات الأمان
 */
export const SECURITY_THRESHOLDS = {
  SUSPICIOUS_SCORE: 75,
  HIGH_RISK_SCORE: 90,
  MAX_FAILED_ATTEMPTS: 5
} as const;

/**
 * Search Tags
 * علامات البحث
 */
export const SEARCH_TAGS = {
  HIGH_DEMAND: 'high-demand',
  RARE: 'rare',
  NEW_ARRIVAL: 'new-arrival',
  POPULAR: 'popular',
  VERIFIED: 'verified',
  PREMIUM: 'premium'
} as const;

/**
 * Default User Behavior
 * سلوك المستخدم الافتراضي
 */
export const DEFAULT_USER_BEHAVIOR: UserBehavior = {
  preferredBrands: [],
  priceRange: { min: 0, max: 100000 },
  searchHistory: []
};

/**
 * Default Market Trends
 * اتجاهات السوق الافتراضية
 */
export const DEFAULT_MARKET_TRENDS: MarketTrend[] = [
  { trend: 'Electric cars increasing', percentage: 15 },
  { trend: 'SUV demand high', percentage: 25 },
  { trend: 'Hybrid vehicles growing', percentage: 12 },
  { trend: 'Sedan popularity stable', percentage: 18 }
];

/**
 * Recommendation Reasons
 * أسباب التوصيات
 */
export const RECOMMENDATION_REASONS = {
  SEARCH_HISTORY: 'Based on your search history',
  POPULAR_IN_AREA: 'Popular in your area',
  PRICE_RANGE_MATCH: 'Price range match',
  SIMILAR_PURCHASES: 'Similar to your previous purchases',
  TRENDING: 'Currently trending',
  HIGHLY_RATED: 'Highly rated by users'
} as const;

/**
 * Payment Status
 * حالات الدفع
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

/**
 * Car Conditions
 * حالات السيارة
 */
export const CAR_CONDITIONS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  UNKNOWN: 'unknown'
} as const;

/**
 * IoT Telemetry Update Intervals
 * فترات تحديث بيانات IoT
 */
export const IOT_UPDATE_INTERVALS = {
  REALTIME: 1000, // 1 second
  FREQUENT: 5000, // 5 seconds
  NORMAL: 30000, // 30 seconds
  SLOW: 60000 // 1 minute
} as const;

/**
 * Bulgarian Market Brands
 * العلامات التجارية في السوق البلغاري
 */
export const BULGARIAN_POPULAR_BRANDS = [
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volkswagen',
  'Skoda',
  'Opel',
  'Ford',
  'Renault',
  'Peugeot',
  'Toyota'
] as const;

/**
 * Price Ranges (in BGN)
 * نطاقات الأسعار (بالليف البلغاري)
 */
export const PRICE_RANGES = {
  BUDGET: { min: 0, max: 5000 },
  LOW: { min: 5000, max: 10000 },
  MEDIUM: { min: 10000, max: 20000 },
  HIGH: { min: 20000, max: 40000 },
  PREMIUM: { min: 40000, max: 100000 },
  LUXURY: { min: 100000, max: Infinity }
} as const;

/**
 * Search Result Limits
 * حدود نتائج البحث
 */
export const SEARCH_LIMITS = {
  DEFAULT: 20,
  MAX: 100,
  RECOMMENDATIONS: 10
} as const;

/**
 * Error Messages
 * رسائل الخطأ
 */
export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'Platform service not initialized',
  ANALYSIS_FAILED: 'Failed to analyze car. Please try again.',
  SEARCH_FAILED: 'Search operation failed',
  PAYMENT_FAILED: 'Payment processing failed',
  SECURITY_SCAN_FAILED: 'Security scan failed',
  RECOMMENDATION_FAILED: 'Failed to get recommendations',
  NO_IMAGES: 'No images provided for analysis'
} as const;

/**
 * Success Messages
 * رسائل النجاح
 */
export const SUCCESS_MESSAGES = {
  ANALYSIS_COMPLETE: 'Car analysis completed successfully',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  SEARCH_COMPLETE: 'Search completed',
  RECOMMENDATION_GENERATED: 'Recommendations generated'
} as const;

/**
 * Service Endpoints (Environment Variables)
 * نقاط نهاية الخدمات (متغيرات البيئة)
 */
export const SERVICE_ENV_KEYS = {
  ALGOLIA_APP_ID: 'REACT_APP_ALGOLIA_APP_ID',
  ALGOLIA_API_KEY: 'REACT_APP_ALGOLIA_API_KEY',
  STRIPE_KEY: 'REACT_APP_STRIPE_PUBLISHABLE_KEY',
  IOT_ENDPOINT: 'REACT_APP_IOT_ENDPOINT',
  GEMINI_API_KEY: 'REACT_APP_GEMINI_API_KEY',
  AWS_REGION: 'REACT_APP_AWS_REGION'
} as const;