/**
 * GOOGLE MAPS CONFIGURATION
 * تكوين خدمات خرائط جوجل
 */

/**
 * Google Maps API key from environment
 * مفتاح واجهة برمجة التطبيقات من البيئة
 */
const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_BROWSER_KEY;
if (!mapApiKey) {
  throw new Error('❌ CRITICAL: VITE_GOOGLE_MAPS_API_KEY not set in environment');
}
export const GOOGLE_MAPS_API_KEY = mapApiKey;

/**
 * Places service configuration
 * تكوين خدمة الأماكن
 */
export const PLACES_CONFIG = {
  DEFAULT_COUNTRY: 'bg',
  PLACE_TYPES: ['(cities)'],
  SEARCH_RADIUS: 12000, // meters - slightly reduced for performance
  MAX_PAGES: 1 // limit pagination to reduce latency & quota use
};

/**
 * Distance Matrix configuration
 * تكوين Distance Matrix
 */
export const DISTANCE_MATRIX_CONFIG = {
  TRAVEL_MODE: 'DRIVING',
  UNIT_SYSTEM: 'METRIC',
  TIMEOUT_MS: 10000
};

/**
 * Geolocation configuration
 * تكوين Geolocation
 */
export const GEOLOCATION_CONFIG = {
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT_MS: 5000,
  MAXIMUM_AGE_MS: 0
};

/**
 * Static map configuration
 * تكوين الخريطة الثابتة
 */
export const STATIC_MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 400,
  MAP_TYPE: 'roadmap'
};

/**
 * API endpoints
 * نقاط نهاية واجهة برمجة التطبيقات
 */
export const API_ENDPOINTS = {
  TIME_ZONE: 'https://maps.googleapis.com/maps/api/timezone/json',
  DIRECTIONS: 'https://www.google.com/maps/dir/',
  MAPS_EMBED: 'https://www.google.com/maps/embed/v1/place'
};

/**
 * Pagination delay (required by Places API)
 * تأخير الترقيم (مطلوب بواسطة Places API)
 */
export const PAGINATION_DELAY_MS = 800;

/**
 * Format templates (Bulgarian/English)
 * قوالب التنسيق (بلغاري/إنجليزي)
 */
export const FORMAT_TEMPLATES = {
  DISTANCE: {
    BG_METERS: (m: number) => `${Math.round(m)} м`,
    EN_METERS: (m: number) => `${Math.round(m)} m`,
    BG_KM: (km: number) => `${km.toFixed(1)} км`,
    EN_KM: (km: number) => `${km.toFixed(1)} km`
  },
  DURATION: {
    BG_FULL: (h: number, m: number) => `${h} ч ${m} мин`,
    EN_FULL: (h: number, m: number) => `${h}h ${m}m`,
    BG_MINUTES: (m: number) => `${m} мин`,
    EN_MINUTES: (m: number) => `${m} min`
  }
};

/**
 * Locale for time formatting
 * اللغة للتنسيق الزمني
 */
export const TIME_LOCALE = {
  BG: 'bg-BG',
  EN: 'en-US'
};

/**
 * Error messages
 * رسائل الأخطاء
 */
export const ERROR_MESSAGES = {
  GEOLOCATION_NOT_SUPPORTED: 'Geolocation is not supported by the browser',
  GEOCODER_NOT_INITIALIZED: 'Geocoder not initialized',
  SERVICE_NOT_INITIALIZED: 'Google Maps service not initialized',
  API_ERROR: 'Google Maps API error'
};

/**
 * Validation settings
 * إعدادات التحقق
 */
export const VALIDATION = {
  MIN_INPUT_LENGTH: 2,
  VALID_COUNTRY_CODES: ['bg', 'en'],
  VALID_ZOOM_LEVELS: { min: 1, max: 21 }
};
