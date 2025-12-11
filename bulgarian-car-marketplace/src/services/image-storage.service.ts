// Image Storage Service using IndexedDB
// خدمة تخزين الصور باستخدام IndexedDB بدلاً من localStorage
// يحل مشكلة: localStorage quota exceeded (base64 overhead)

import { serviceLogger } from './logger-wrapper';

const DB_NAME = 'globul_workflow_images_db';
const STORE_NAME = 'images';
const DB_VERSION = 1;

export interface StoredImage {
  id: number;
  file: File;
  preview?: string; // Optional base64 preview for thumbnails
}

export class ImageStorageService {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static operationInProgress = false; // Prevent concurrent operations
  private static operationQueue: Array<() => Promise<void>> = []; // Queue for pending operations

  /**
   * Execute operation with queue management
   */
  private static async executeWithQueue<T>(operation: () => Promise<T>): Promise<T> {
    // If operation in progress, queue this one
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

    // Execute immediately
    this.operationInProgress = true;
    try {
      const result = await operation();
      return result;
    } finally {
      this.operationInProgress = false;
      
      // Process next in queue
      const next = this.operationQueue.shift();
      if (next) {
        next().catch(error => {
          serviceLogger.error('Error processing queued operation', error);
        });
      }
    }
  }

  /**
   * Open IndexedDB connection
   */
  private static async openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        serviceLogger.error('Failed to open IndexedDB', new Error(request.error?.message || 'Unknown error'));
        reject(request.error);
      };

      request.onsuccess = () => {
        serviceLogger.info('IndexedDB opened successfully');
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          serviceLogger.info('IndexedDB object store created');
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Save images to IndexedDB
   * Replaces all existing images
   */
  static async saveImages(files: File[]): Promise<void> {
    return this.executeWithQueue(async () => {
      try {
        if (files.length === 0) {
          await this.clearImages();
          return;
        }

        serviceLogger.info('Saving images to IndexedDB', { count: files.length });

        const db = await this.openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        // Clear existing images
        await store.clear();

        // Store new images
        const promises: Promise<void>[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Create thumbnail preview (max 200x200, low quality)
          const preview = await this.createThumbnail(file);

          const imageData: StoredImage = {
            id: i,
            file,
            preview,
          };

          promises.push(
            new Promise((resolve, reject) => {
              const request = store.put(imageData);
              request.onsuccess = () => resolve();
              request.onerror = () => reject(request.error);
            })
          );
        }

        await Promise.all(promises);

        serviceLogger.info('Images saved successfully to IndexedDB', {
          count: files.length,
          totalSize: files.reduce((sum, f) => sum + f.size, 0)
        });
      } catch (error) {
        serviceLogger.error('Error saving images to IndexedDB', error as Error, {
          count: files.length
        });
        throw new Error('Failed to save images');
      }
    });
  }

  /**
   * Get all images from IndexedDB
   */
  static async getImages(): Promise<File[]> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const items = request.result as StoredImage[];
          const files = items
            .sort((a, b) => a.id - b.id)
            .map(item => item.file);

          serviceLogger.info('Images loaded from IndexedDB', { count: files.length });
          resolve(files);
        };

        request.onerror = () => {
          serviceLogger.error('Error loading images from IndexedDB', new Error(request.error?.message || 'Unknown error'));
          reject(request.error);
        };
      });
    } catch (error) {
      serviceLogger.error('Error getting images from IndexedDB', error as Error);
      return [];
    }
  }

  /**
   * Get image previews (thumbnails) for fast rendering
   */
  static async getImagePreviews(): Promise<string[]> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const items = request.result as StoredImage[];
          const previews = items
            .sort((a, b) => a.id - b.id)
            .map(item => item.preview || '');

          resolve(previews);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      serviceLogger.error('Error getting image previews', error as Error);
      return [];
    }
  }

  /**
   * Get images count
   */
  static async getImagesCount(): Promise<number> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      serviceLogger.error('Error getting images count', error as Error);
      return 0;
    }
  }

  /**
   * Clear all images
   */
  static async clearImages(): Promise<void> {
    return this.executeWithQueue(async () => {
      try {
        const db = await this.openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        serviceLogger.info('Images cleared from IndexedDB');
      } catch (error) {
        serviceLogger.error('Error clearing images from IndexedDB', error as Error);
      }
    });
  }

  /**
   * Remove image by index
   */
  static async removeImage(index: number): Promise<void> {
    try {
      const images = await this.getImages();
      images.splice(index, 1);
      await this.saveImages(images);

      serviceLogger.info('Image removed', { index, remainingCount: images.length });
    } catch (error) {
      serviceLogger.error('Error removing image', error as Error, { index });
      throw new Error('Failed to remove image');
    }
  }

  /**
   * Add images (append to existing)
   */
  static async addImages(newFiles: File[]): Promise<void> {
    try {
      const existing = await this.getImages();
      const combined = [...existing, ...newFiles];

      // Limit to max 20 images
      const limited = combined.slice(0, 20);

      await this.saveImages(limited);

      serviceLogger.info('Images added', {
        added: newFiles.length,
        total: limited.length
      });
    } catch (error) {
      serviceLogger.error('Error adding images', error as Error, {
        count: newFiles.length
      });
      throw new Error('Failed to add images');
    }
  }

  /**
   * Create thumbnail preview (base64)
   * Max 200x200, quality 0.7
   */
  private static async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Calculate thumbnail size (max 200x200, maintain aspect ratio)
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 (JPEG, quality 0.7)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          resolve(thumbnail);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (max 10MB per image)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large (max 10MB). Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Get storage estimate
   */
  static async getStorageEstimate(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (usage / quota) * 100 : 0;

        return { usage, quota, percentage };
      }

      return { usage: 0, quota: 0, percentage: 0 };
    } catch (error) {
      serviceLogger.error('Error getting storage estimate', error as Error);
      return { usage: 0, quota: 0, percentage: 0 };
    }
  }
}

export default ImageStorageService;
