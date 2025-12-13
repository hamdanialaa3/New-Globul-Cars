/**
 * Unified Image Storage Service using IndexedDB
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
 * @since 2025-12 - Unified from image-storage.service.ts
 */

import { serviceLogger } from './logger-wrapper';

interface ImageData {
  files: File[];
  thumbnails: Blob[];
  timestamp: number;
}

class ImageStorage {
  private readonly DB_NAME = 'globul_workflow_images_db';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'images';
  private readonly KEY = 'workflow_images';
  private readonly THUMBNAIL_SIZE = 200;
  private readonly THUMBNAIL_QUALITY = 0.7;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_IMAGES = 20;

  private db: IDBDatabase | null = null;
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static operationInProgress = false;
  private static operationQueue: Array<() => Promise<void>> = [];

  /**
   * Execute operation with queue management
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
          serviceLogger.error('Error processing queued operation', error);
        });
      }
    }
  }

  /**
   * Initialize IndexedDB database
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (ImageStorage.dbPromise) {
      this.db = await ImageStorage.dbPromise;
      return this.db;
    }

    ImageStorage.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        serviceLogger.error('Failed to open IndexedDB', new Error(request.error?.message || 'Unknown error'));
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        serviceLogger.info('IndexedDB opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
          serviceLogger.info('IndexedDB object store created');
        }
      };
    });

    this.db = await ImageStorage.dbPromise;
    return this.db;
  }

  /**
   * Generate thumbnail from image File
   */
  private async generateThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > this.THUMBNAIL_SIZE) {
            height = (height * this.THUMBNAIL_SIZE) / width;
            width = this.THUMBNAIL_SIZE;
          }
        } else {
          if (height > this.THUMBNAIL_SIZE) {
            width = (width * this.THUMBNAIL_SIZE) / height;
            height = this.THUMBNAIL_SIZE;
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
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          this.THUMBNAIL_QUALITY
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate image file
   */
  private validateImage(file: File): void {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
  }

  /**
   * Save images to IndexedDB
   * Uses queue management to prevent concurrent operations
   */
  async saveImages(files: File[]): Promise<void> {
    return ImageStorage.executeWithQueue(async () => {
      try {
        if (files.length === 0) {
          await this.clearImages();
          return;
        }

        if (files.length > this.MAX_IMAGES) {
          throw new Error(`Maximum ${this.MAX_IMAGES} images allowed`);
        }

        // Validate all files
        files.forEach(file => this.validateImage(file));

        serviceLogger.info('Saving images to IndexedDB', { count: files.length });

        // Generate thumbnails
        const thumbnails = await Promise.all(
          files.map(file => this.generateThumbnail(file))
        );

        const imageData: ImageData = {
          files,
          thumbnails,
          timestamp: Date.now()
        };

        const db = await this.initDB();

        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          const request = store.put(imageData, this.KEY);

          request.onsuccess = () => {
            serviceLogger.info('Images saved successfully to IndexedDB', {
              count: files.length,
              totalSize: files.reduce((sum, f) => sum + f.size, 0)
            });
            resolve();
          };
          request.onerror = () => {
            serviceLogger.error('Failed to save images', new Error(request.error?.message || 'Unknown error'));
            reject(new Error('Failed to save images'));
          };
        });
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
   * ✅ FIX: Ensure File objects are properly restored from IndexedDB
   */
  async getImages(): Promise<File[]> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(this.KEY);

        request.onsuccess = () => {
          const data = request.result as ImageData | undefined;
          if (!data || !data.files || data.files.length === 0) {
            serviceLogger.info('No images found in IndexedDB');
            resolve([]);
            return;
          }

          // ✅ FIX: Ensure all items are File objects (IndexedDB may return Blob)
          const files = data.files.map((file, index) => {
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
              return new File([blob], fileName, { type: fileType, lastModified: blob.lastModified || Date.now() });
            }
            
            // Unexpected file type - skip it
            return null;
          }).filter((file): file is File => file !== null);

          serviceLogger.info('Images loaded from IndexedDB', { count: files.length });
          resolve(files);
        };

        request.onerror = () => {
          serviceLogger.error('Error loading images from IndexedDB', new Error(request.error?.message || 'Unknown error'));
          reject(new Error('Failed to get images'));
        };
      });
    } catch (error) {
      serviceLogger.error('Error getting images from IndexedDB', error as Error);
      return [];
    }
  }

  /**
   * Get image previews (thumbnails)
   */
  async getImagePreviews(): Promise<Blob[]> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(this.KEY);

        request.onsuccess = () => {
          const data = request.result as ImageData | undefined;
          resolve(data?.thumbnails || []);
        };

        request.onerror = () => reject(new Error('Failed to get thumbnails'));
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Add more images to existing ones
   */
  async addImages(newFiles: File[]): Promise<void> {
    const existingFiles = await this.getImages();
    const totalFiles = [...existingFiles, ...newFiles];

    if (totalFiles.length > this.MAX_IMAGES) {
      throw new Error(`Maximum ${this.MAX_IMAGES} images allowed`);
    }

    await this.saveImages(totalFiles);
  }

  /**
   * Remove image at specific index
   */
  async removeImage(index: number): Promise<void> {
    const files = await this.getImages();
    
    if (index < 0 || index >= files.length) {
      throw new Error('Invalid image index');
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
   */
  async clearImages(): Promise<void> {
    return ImageStorage.executeWithQueue(async () => {
      try {
        const db = await this.initDB();

        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction([this.STORE_NAME], 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          const request = store.delete(this.KEY);

          request.onsuccess = () => {
            serviceLogger.info('Images cleared from IndexedDB');
            resolve();
          };
          request.onerror = () => {
            serviceLogger.error('Error clearing images from IndexedDB', new Error(request.error?.message || 'Unknown error'));
            reject(new Error('Failed to clear images'));
          };
        });
      } catch (error) {
        serviceLogger.error('Error clearing images from IndexedDB', error as Error);
      }
    });
  }

  /**
   * Get storage usage info
   */
  async getStorageInfo(): Promise<{ count: number; timestamp: number | null }> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(this.KEY);

        request.onsuccess = () => {
          const data = request.result as ImageData | undefined;
          resolve({
            count: data?.files.length || 0,
            timestamp: data?.timestamp || null
          });
        };

        request.onerror = () => reject(new Error('Failed to get storage info'));
      });
    } catch (error) {
      return { count: 0, timestamp: null };
    }
  }

  /**
   * Check if storage has images
   */
  async hasImages(): Promise<boolean> {
    const info = await this.getStorageInfo();
    return info.count > 0;
  }

  /**
   * Get images count
   */
  async getImagesCount(): Promise<number> {
    const info = await this.getStorageInfo();
    return info.count;
  }

  /**
   * Get storage estimate (from navigator.storage API)
   */
  async getStorageEstimate(): Promise<{
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
}

// Export singleton instance
export const ImageStorageService = new ImageStorage();
export default ImageStorageService;
