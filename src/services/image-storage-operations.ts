/**
 * IMAGE STORAGE OPERATIONS
 * عمليات تخزين الصور
 */

import { serviceLogger } from './logger-service';
import { ImageData, StorageInfo, StorageEstimate, ValidationResult } from './image-storage-types';
import {
  DB_CONFIG,
  IMAGE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THUMBNAIL_OPTIONS,
  TRANSACTION_TYPES,
  DEFAULT_STORAGE_ESTIMATE,
  DEFAULT_STORAGE_INFO
} from './image-storage-config';

/**
 * Generate thumbnail from image File
 * توليد صورة مصغرة من ملف الصورة
 */
export async function generateThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error(ERROR_MESSAGES.CANVAS_ERROR));
      return;
    }

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > IMAGE_CONFIG.THUMBNAIL_SIZE) {
          height = (height * IMAGE_CONFIG.THUMBNAIL_SIZE) / width;
          width = IMAGE_CONFIG.THUMBNAIL_SIZE;
        }
      } else {
        if (height > IMAGE_CONFIG.THUMBNAIL_SIZE) {
          width = (width * IMAGE_CONFIG.THUMBNAIL_SIZE) / height;
          height = IMAGE_CONFIG.THUMBNAIL_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(ERROR_MESSAGES.THUMBNAIL_ERROR));
          }
        },
        THUMBNAIL_OPTIONS.FORMAT,
        THUMBNAIL_OPTIONS.QUALITY
      );
    };

    img.onerror = () => {
      reject(new Error(ERROR_MESSAGES.IMAGE_LOAD_ERROR));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image file
 * التحقق من صحة ملف الصورة
 */
export function validateImage(file: File): ValidationResult {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: ERROR_MESSAGES.NOT_IMAGE };
  }
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE(parseFloat(sizeMB)) };
  }
  return { valid: true };
}

/**
 * Restore File objects from IndexedDB storage
 * استعادة كائنات File من تخزين IndexedDB
 */
export function restoreFileObjects(data: any[]): File[] {
  return data.map((file, index) => {
    // If it's already a File, return it
    if (file instanceof File) {
      return file;
    }
    
    // If it's a Blob, convert to File
    if (file instanceof Blob) {
      const fileName = `image_${index}_${Date.now()}.jpg`;
      return new File([file], fileName, { type: file.type || 'image/jpeg' });
    }
    
    // If it's a plain object (from structured clone), reconstruct File
    if (file && typeof file === 'object' && 'size' in file) {
      const blob = file as any;
      const fileName = blob.name || `image_${index}_${Date.now()}.jpg`;
      const fileType = blob.type || 'image/jpeg';
      return new File([blob], fileName, { 
        type: fileType, 
        lastModified: blob.lastModified || Date.now() 
      });
    }
    
    return null;
  }).filter((file): file is File => file !== null);
}

/**
 * Initialize IndexedDB database
 * تهيئة قاعدة بيانات IndexedDB
 */
export function initDB(dbPromise: Promise<IDBDatabase> | null): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.DB_NAME, DB_CONFIG.DB_VERSION);

    request.onerror = () => {
      const error = new Error(request.error?.message || 'Failed to open IndexedDB');
      serviceLogger.error('Failed to open IndexedDB', error);
      reject(error);
    };

    request.onsuccess = () => {
      const db = request.result;
      serviceLogger.info('IndexedDB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DB_CONFIG.STORE_NAME)) {
        db.createObjectStore(DB_CONFIG.STORE_NAME);
        serviceLogger.info('IndexedDB object store created');
      }
    };
  });
}

/**
 * Read images from IndexedDB
 * قراءة الصور من IndexedDB
 */
export async function readFromDB(db: IDBDatabase): Promise<ImageData | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_CONFIG.STORE_NAME], TRANSACTION_TYPES.READONLY);
    const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
    const request = store.get(DB_CONFIG.KEY);

    request.onsuccess = () => {
      resolve(request.result as ImageData | undefined);
    };

    request.onerror = () => {
      reject(new Error(ERROR_MESSAGES.DB_ERROR('read images')));
    };
  });
}

/**
 * Write images to IndexedDB
 * كتابة الصور إلى IndexedDB
 */
export async function writeToDB(db: IDBDatabase, imageData: ImageData): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_CONFIG.STORE_NAME], TRANSACTION_TYPES.READWRITE);
    const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
    const request = store.put(imageData, DB_CONFIG.KEY);

    request.onsuccess = () => {
      serviceLogger.info(SUCCESS_MESSAGES.IMAGES_SAVED, {
        count: imageData.files.length,
        totalSize: imageData.files.reduce((sum, f) => sum + f.size, 0)
      });
      resolve();
    };

    request.onerror = () => {
      serviceLogger.error('Failed to save images', new Error(request.error?.message || 'Unknown error'));
      reject(new Error(ERROR_MESSAGES.DB_ERROR('save images')));
    };
  });
}

/**
 * Clear images from IndexedDB
 * مسح الصور من IndexedDB
 */
export async function clearFromDB(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_CONFIG.STORE_NAME], TRANSACTION_TYPES.READWRITE);
    const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
    const request = store.delete(DB_CONFIG.KEY);

    request.onsuccess = () => {
      serviceLogger.info(SUCCESS_MESSAGES.IMAGES_CLEARED);
      resolve();
    };

    request.onerror = () => {
      serviceLogger.error('Error clearing images from IndexedDB', new Error(request.error?.message || 'Unknown error'));
      reject(new Error(ERROR_MESSAGES.DB_ERROR('clear images')));
    };
  });
}

/**
 * Get storage estimate from navigator.storage API
 * الحصول على تقدير التخزين من واجهة برمجة التطبيقات navigator.storage
 */
export async function getStorageEstimate(): Promise<StorageEstimate> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return { usage, quota, percentage };
    }

    return DEFAULT_STORAGE_ESTIMATE;
  } catch (error) {
    serviceLogger.error(ERROR_MESSAGES.STORAGE_ERROR, error as Error);
    return DEFAULT_STORAGE_ESTIMATE;
  }
}
