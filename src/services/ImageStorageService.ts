/**
 * IMAGE STORAGE SERVICE
 * خدمة تخزين الصور
 *
 * Unified Image Storage using IndexedDB
 * Solves localStorage quota issues with large image files (up to 20 images)
 * Auto-generates thumbnails for performance
 * Includes queue management and operation locking
 *
 * Architecture:
 * - Database: 'globul_workflow_images_db'
 * - Store: 'images' (key: 'workflow_images')
 * - Auto-thumbnail generation (200x200px at 0.7 quality)
 * - Max file size: 10MB per image
 * - Max images: 20
 * - Queue management for concurrent operations
 *
 * @file ImageStorageService.ts
 */

import { serviceLogger } from './logger-service';
import { ImageData, StorageInfo, StorageEstimate, ValidationResult, OperationTask } from './image-storage-types';
import { IMAGE_CONFIG, DEFAULT_STORAGE_INFO, ERROR_MESSAGES } from './image-storage-config';
import {
  generateThumbnail,
  validateImage,
  restoreFileObjects,
  initDB,
  readFromDB,
  writeToDB,
  clearFromDB,
  getStorageEstimate
} from './image-storage-operations';

/**
 * Image Storage Service
 * خدمة تخزين الصور
 */
class ImageStorage {
  private db: IDBDatabase | null = null;
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static operationInProgress = false;
  private static operationQueue: OperationTask[] = [];

  /**
   * Execute operation with queue management
   * تنفيذ العملية مع إدارة قائمة الانتظار
   */
  private static async executeWithQueue<T>(operation: () => Promise<T>): Promise<T> {
    if (this.operationInProgress) {
      return new Promise((resolve, reject) => {
        this.operationQueue.push(async () => {
          try {
            const result = await operation();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    this.operationInProgress = true;
    try {
      const result = await operation();
      return result;
    } finally {
      this.operationInProgress = false;
      
      const next = this.operationQueue.shift();
      if (next) {
        next().catch(error => {
          serviceLogger.error('Error processing queued operation', error as Error);
        });
      }
    }
  }

  /**
   * Initialize IndexedDB database
   * تهيئة قاعدة بيانات IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    this.db = await initDB(ImageStorage.dbPromise);
    if (!ImageStorage.dbPromise) {
      ImageStorage.dbPromise = Promise.resolve(this.db);
    }
    return this.db;
  }

  /**
   * Save images to IndexedDB
   * حفظ الصور إلى IndexedDB
   */
  async saveImages(files: File[]): Promise<void> {
    return ImageStorage.executeWithQueue(async () => {
      try {
        if (files.length === 0) {
          await this.clearImages();
          return;
        }

        if (files.length > IMAGE_CONFIG.MAX_IMAGES) {
          throw new Error(ERROR_MESSAGES.MAX_IMAGES_EXCEEDED(IMAGE_CONFIG.MAX_IMAGES));
        }

        // Validate all files (async validation for deep checks)
        for (const file of files) {
          const result = await validateImage(file);
          if (!result.valid) {
            throw new Error(result.error);
          }
        }

        serviceLogger.info('Saving images to IndexedDB', { count: files.length });

        // Generate thumbnails
        const thumbnails = await Promise.all(
          files.map(file => generateThumbnail(file))
        );

        const imageData: ImageData = {
          files,
          thumbnails,
          timestamp: Date.now()
        };

        const db = await this.initDB();
        await writeToDB(db, imageData);

      } catch (error) {
        serviceLogger.error('Error saving images to IndexedDB', error as Error, {
          count: files.length
        });
        throw error;
      }
    });
  }

  /**
   * Get all stored images
   * الحصول على جميع الصور المخزنة
   */
  async getImages(): Promise<File[]> {
    try {
      const db = await this.initDB();
      const data = await readFromDB(db);

      if (!data || !data.files || data.files.length === 0) {
        serviceLogger.info('No images found in IndexedDB');
        return [];
      }

      // Restore File objects from storage
      const files = restoreFileObjects(data.files);
      serviceLogger.info('Images loaded from IndexedDB', { count: files.length });
      return files;

    } catch (error) {
      serviceLogger.error('Error getting images from IndexedDB', error as Error);
      return [];
    }
  }

  /**
   * Get image previews (thumbnails)
   * الحصول على معاينات الصور (الصور المصغرة)
   */
  async getImagePreviews(): Promise<Blob[]> {
    try {
      const db = await this.initDB();
      const data = await readFromDB(db);
      return data?.thumbnails || [];
    } catch (error) {
      serviceLogger.error('Error getting thumbnails', error as Error);
      return [];
    }
  }

  /**
   * Add more images to existing ones
   * إضافة المزيد من الصور إلى الصور الموجودة
   */
  async addImages(newFiles: File[]): Promise<void> {
    const existingFiles = await this.getImages();
    const totalFiles = [...existingFiles, ...newFiles];

    if (totalFiles.length > IMAGE_CONFIG.MAX_IMAGES) {
      throw new Error(ERROR_MESSAGES.MAX_IMAGES_EXCEEDED(IMAGE_CONFIG.MAX_IMAGES));
    }

    await this.saveImages(totalFiles);
  }

  /**
   * Remove image at specific index
   * إزالة صورة في فهرس معين
   */
  async removeImage(index: number): Promise<void> {
    const files = await this.getImages();
    
    if (index < 0 || index >= files.length) {
      throw new Error(ERROR_MESSAGES.INVALID_INDEX);
    }

    const updatedFiles = files.filter((_, i) => i !== index);
    
    if (updatedFiles.length === 0) {
      await this.clearImages();
    } else {
      await this.saveImages(updatedFiles);
    }
  }

  /**
   * Clear all stored images
   * مسح جميع الصور المخزنة
   */
  async clearImages(): Promise<void> {
    return ImageStorage.executeWithQueue(async () => {
      try {
        const db = await this.initDB();
        await clearFromDB(db);
      } catch (error) {
        serviceLogger.error('Error clearing images from IndexedDB', error as Error);
      }
    });
  }

  /**
   * Get storage usage info
   * الحصول على معلومات استخدام التخزين
   */
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const db = await this.initDB();
      const data = await readFromDB(db);
      return {
        count: data?.files.length || 0,
        timestamp: data?.timestamp || null
      };
    } catch (error) {
      return DEFAULT_STORAGE_INFO;
    }
  }

  /**
   * Check if storage has images
   * التحقق من وجود صور في التخزين
   */
  async hasImages(): Promise<boolean> {
    const info = await this.getStorageInfo();
    return info.count > 0;
  }

  /**
   * Get images count
   * الحصول على عدد الصور
   */
  async getImagesCount(): Promise<number> {
    const info = await this.getStorageInfo();
    return info.count;
  }

  /**
   * Get storage estimate (from navigator.storage API)
   * الحصول على تقدير التخزين (من واجهة برمجة التطبيقات navigator.storage)
   */
  async getStorageEstimate(): Promise<StorageEstimate> {
    return getStorageEstimate();
  }

  /**
   * Validate image file (static method)
   * التحقق من صحة ملف الصورة (طريقة ثابتة)
   */
  static async validateImage(file: File): Promise<ValidationResult> {
    return validateImage(file);
  }
}

// ==================== EXPORTS ====================

export const ImageStorageService = new ImageStorage();
export default ImageStorageService;

// Re-export types for convenience
export type {
  ImageData,
  StorageInfo,
  StorageEstimate,
  ValidationResult
} from './image-storage-types';
