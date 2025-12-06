/**
 * Image Storage Service using IndexedDB
 * Solves localStorage quota issues with large image files (up to 20 images)
 * Auto-generates thumbnails for performance
 * 
 * Architecture:
 * - Database: 'globul_workflow_images_db'
 * - Store: 'images' (key: 'workflow_images')
 * - Auto-thumbnail generation (200x200px at 0.7 quality)
 * - Max file size: 10MB per image
 * - Max images: 20
 * 
 * @file ImageStorageService.ts
 */

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

  /**
   * Initialize IndexedDB database
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });
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
   */
  async saveImages(files: File[]): Promise<void> {
    if (files.length > this.MAX_IMAGES) {
      throw new Error(`Maximum ${this.MAX_IMAGES} images allowed`);
    }

    // Validate all files
    files.forEach(file => this.validateImage(file));

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

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(imageData, this.KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save images'));
    });
  }

  /**
   * Get all stored images
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
          resolve(data?.files || []);
        };

        request.onerror = () => reject(new Error('Failed to get images'));
      });
    } catch (error) {
      console.error('Error getting images:', error);
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
      console.error('Error getting thumbnails:', error);
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
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(this.KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to clear images'));
      });
    } catch (error) {
      console.error('Error clearing images:', error);
    }
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
      console.error('Error getting storage info:', error);
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
}

// Export singleton instance
export const ImageStorageService = new ImageStorage();
