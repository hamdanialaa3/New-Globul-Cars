/**
 * IMAGE STORAGE TYPES
 * أنواع تخزين الصور
 */

/**
 * Image data structure stored in IndexedDB
 * هيكل بيانات الصور المخزنة في IndexedDB
 */
export interface ImageData {
  files: File[];
  thumbnails: Blob[];
  timestamp: number;
}

/**
 * Storage information
 * معلومات التخزين
 */
export interface StorageInfo {
  count: number;
  timestamp: number | null;
}

/**
 * Storage estimate from navigator.storage API
 * تقدير التخزين من واجهة برمجة التطبيقات navigator.storage
 */
export interface StorageEstimate {
  usage: number;
  quota: number;
  percentage: number;
}

/**
 * Image validation result
 * نتيجة التحقق من صحة الصورة
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Operation queue item type
 * نوع عنصر قائمة الانتظار للعملية
 */
export type OperationTask = () => Promise<void>;

/**
 * IndexedDB Database configuration
 * تكوين قاعدة بيانات IndexedDB
 */
export interface DBConfig {
  dbName: string;
  dbVersion: number;
  storeName: string;
  key: string;
}
