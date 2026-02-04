/**
 * 📷 Image Upload Service for Messaging
 * خدمة رفع الصور للرسائل
 * 
 * @description Handles image uploads to Firebase Storage for messaging
 * تتعامل مع رفع الصور إلى Firebase Storage للرسائل
 * 
 * @author Claude Sonnet 4.5
 * @date January 8, 2026
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { logger } from '@/services/logger-service';

/**
 * Image Upload Result
 */
export interface ImageUploadResult {
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  size: number;
}

/**
 * Image Upload Service
 */
class ImageUploadService {
  private static instance: ImageUploadService;
  private storage = getStorage();
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  private constructor() {
    logger.info('[ImageUpload] Service initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  /**
   * Validate image file
   * التحقق من صحة ملف الصورة
   */
  private validateImage(file: File): void {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`نوع الملف غير مدعوم. الأنواع المسموحة: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new Error(`حجم الصورة كبير جداً. الحد الأقصى: ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
    }
  }

  /**
   * Generate unique filename
   * توليد اسم ملف فريد
   */
  private generateFileName(userId: string, file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    return `messaging/${userId}/${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Create thumbnail from image
   * إنشاء صورة مصغرة
   */
  private async createThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calculate thumbnail dimensions (max 200px width)
        const maxWidth = 200;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        // Draw scaled image
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create thumbnail'));
          }
        }, 'image/jpeg', 0.7);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload image to Firebase Storage
   * رفع الصورة إلى Firebase Storage
   * 
   * @param file - Image file to upload
   * @param userId - User's Firebase UID
   * @param withThumbnail - Generate and upload thumbnail
   * @returns Upload result with URLs
   */
  async uploadImage(
    file: File,
    userId: string,
    withThumbnail: boolean = true
  ): Promise<ImageUploadResult> {
    try {
      // Validate image
      this.validateImage(file);

      // Generate filename
      const fileName = this.generateFileName(userId, file);
      const storageRef = ref(this.storage, fileName);

      // Upload full image
      logger.debug('[ImageUpload] Uploading image', { fileName, size: file.size });
        const metadata = { customMetadata: { ownerId: userId, uploadedAt: new Date().toISOString() } };
        const snapshot = await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(snapshot.ref);

      logger.info('[ImageUpload] Image uploaded successfully', { fileName, url });

      let thumbnailUrl: string | undefined;

      // Upload thumbnail if requested
      if (withThumbnail) {
        try {
          const thumbnail = await this.createThumbnail(file);
          const thumbnailFileName = fileName.replace(/\.([^.]+)$/, '_thumb.$1');
          const thumbnailRef = ref(this.storage, thumbnailFileName);
          
          const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnail);
          thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref);
          
          logger.debug('[ImageUpload] Thumbnail uploaded', { thumbnailUrl });
        } catch (err) {
          logger.warn('[ImageUpload] Failed to create thumbnail', { error: (err as Error).message });
          // Don't fail the entire upload if thumbnail fails
        }
      }

      return {
        url,
        thumbnailUrl: thumbnailUrl || url,
        fileName,
        size: file.size,
      };
    } catch (error) {
      logger.error('[ImageUpload] Upload failed', error as Error);
      throw error;
    }
  }

  /**
   * Delete image from Firebase Storage
   * حذف الصورة من Firebase Storage
   */
  async deleteImage(fileName: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, fileName);
      await deleteObject(storageRef);
      logger.info('[ImageUpload] Image deleted', { fileName });

      // Try to delete thumbnail
      try {
        const thumbnailFileName = fileName.replace(/\.([^.]+)$/, '_thumb.$1');
        const thumbnailRef = ref(this.storage, thumbnailFileName);
        await deleteObject(thumbnailRef);
      } catch {
        // Ignore if thumbnail doesn't exist
      }
    } catch (error) {
      logger.error('[ImageUpload] Delete failed', error as Error);
      throw error;
    }
  }

  /**
   * Validate and compress image before upload
   * التحقق وضغط الصورة قبل الرفع
   */
  async prepareImageForUpload(file: File): Promise<File> {
    // If image is already small enough, return as is
    if (file.size <= this.MAX_IMAGE_SIZE) {
      return file;
    }

    // TODO: Implement compression using canvas
    // For now, just validate and throw if too large
    this.validateImage(file);
    return file;
  }
}

// Export singleton instance
export const imageUploadService = ImageUploadService.getInstance();
export default imageUploadService;
