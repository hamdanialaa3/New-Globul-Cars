/**
 * IMAGE STORAGE CONFIGURATION
 * تكوين تخزين الصور
 */

/**
 * IndexedDB Configuration
 * تكوين IndexedDB
 */
export const DB_CONFIG = {
  DB_NAME: 'globul_workflow_images_db',
  DB_VERSION: 1,
  STORE_NAME: 'images',
  KEY: 'workflow_images'
};

/**
 * Image Processing Configuration
 * تكوين معالجة الصور
 */
export const IMAGE_CONFIG = {
  THUMBNAIL_SIZE: 200,      // pixels
  THUMBNAIL_QUALITY: 0.7,   // 0-1 scale
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB per image
  MAX_IMAGES: 20,           // maximum images per workflow
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

/**
 * Error Messages
 * رسائل الأخطاء
 */
export const ERROR_MESSAGES = {
  NOT_IMAGE: 'File must be an image',
  FILE_TOO_LARGE: (sizeMB: number) => `File too large (max 10MB). Current: ${sizeMB}MB`,
  MAX_IMAGES_EXCEEDED: (max: number) => `Maximum ${max} images allowed`,
  INVALID_INDEX: 'Invalid image index',
  CANVAS_ERROR: 'Failed to get canvas context',
  IMAGE_LOAD_ERROR: 'Failed to load image',
  THUMBNAIL_ERROR: 'Failed to generate thumbnail',
  DB_ERROR: (operation: string) => `Failed to ${operation}`,
  STORAGE_ERROR: 'Error getting storage estimate'
};

/**
 * Success Messages
 * رسائل النجاح
 */
export const SUCCESS_MESSAGES = {
  IMAGES_SAVED: 'Images saved successfully to IndexedDB',
  IMAGES_LOADED: 'Images loaded from IndexedDB',
  IMAGES_CLEARED: 'Images cleared from IndexedDB',
  STORAGE_INFO: 'Storage information retrieved'
};

/**
 * Default Storage Estimate
 * تقدير التخزين الافتراضي
 */
export const DEFAULT_STORAGE_ESTIMATE = {
  usage: 0,
  quota: 0,
  percentage: 0
};

/**
 * Default Storage Info
 * معلومات التخزين الافتراضية
 */
export const DEFAULT_STORAGE_INFO = {
  count: 0,
  timestamp: null
};

/**
 * Thumbnail Generation Options
 * خيارات توليد الصورة المصغرة
 */
export const THUMBNAIL_OPTIONS = {
  FORMAT: 'image/jpeg',
  QUALITY: IMAGE_CONFIG.THUMBNAIL_QUALITY,
  MAX_DIMENSION: IMAGE_CONFIG.THUMBNAIL_SIZE
};

/**
 * IndexedDB Transaction Types
 * أنواع معاملات IndexedDB
 */
export const TRANSACTION_TYPES = {
  READONLY: 'readonly' as const,
  READWRITE: 'readwrite' as const
};
