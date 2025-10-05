// src/services/profile/image-processing-service.ts
// Image Processing Service - معالجة الصور للبروفايل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '../../firebase/firebase-config';
import imageCompression from 'browser-image-compression';

// ==================== INTERFACES ====================

export interface ProfileImage {
  url: string;
  thumbnail: string;
  medium?: string;
  large?: string;
  uploadedAt: Date;
  isPublic: boolean;
  type: 'profile' | 'cover' | 'gallery';
}

export interface ImageVariants {
  thumbnail: File | Blob;
  medium: File | Blob;
  large: File | Blob;
}

// ==================== SERVICE CLASS ====================

export class ImageProcessingService {
  private static instance: ImageProcessingService;

  private constructor() {}

  public static getInstance(): ImageProcessingService {
    if (!ImageProcessingService.instance) {
      ImageProcessingService.instance = new ImageProcessingService();
    }
    return ImageProcessingService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Process profile image with Bulgarian standards
   * معالجة صورة البروفايل حسب المعايير البلغارية
   */
  async processProfileImage(file: File): Promise<ProfileImage> {
    // 1. Validate
    this.validateImage(file, 5 * 1024 * 1024); // 5MB max

    // 2. Create variants
    const variants = await this.createImageVariants(file);

    // 3. Generate ProfileImage object
    return {
      url: URL.createObjectURL(file), // Temporary, will be uploaded
      thumbnail: URL.createObjectURL(variants.thumbnail),
      medium: URL.createObjectURL(variants.medium),
      large: URL.createObjectURL(variants.large),
      uploadedAt: new Date(),
      isPublic: true,
      type: 'profile'
    };
  }

  /**
   * Process cover image (1200x400)
   * معالجة صورة الغلاف
   */
  async processCoverImage(file: File): Promise<ProfileImage> {
    // 1. Validate
    this.validateImage(file, 10 * 1024 * 1024); // 10MB max

    // 2. Optimize
    const optimized = await this.optimizeCoverImage(file);

    return {
      url: URL.createObjectURL(file),
      thumbnail: URL.createObjectURL(optimized),
      uploadedAt: new Date(),
      isPublic: true,
      type: 'cover'
    };
  }

  /**
   * Upload image to Firebase Storage
   * رفع الصورة إلى Firebase
   */
  async uploadImage(
    userId: string,
    file: File | Blob,
    path: string
  ): Promise<string> {
    const storageRef = ref(storage, `users/${userId}/${path}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    console.log(`✅ Image uploaded: ${path}`);
    return url;
  }

  /**
   * Delete image from storage
   * حذف صورة من التخزين
   */
  async deleteImage(userId: string, path: string): Promise<void> {
    try {
      const storageRef = ref(storage, `users/${userId}/${path}`);
      await deleteObject(storageRef);
      console.log(`✅ Image deleted: ${path}`);
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Upload all profile image variants
   * رفع جميع نسخ صورة البروفايل
   */
  async uploadProfileVariants(
    userId: string,
    original: File,
    variants: ImageVariants
  ): Promise<string[]> {
    const uploads = [
      this.uploadImage(userId, variants.thumbnail, 'profile/thumbnail.jpg'),
      this.uploadImage(userId, variants.medium, 'profile/medium.jpg'),
      this.uploadImage(userId, variants.large, 'profile/large.jpg'),
      this.uploadImage(userId, original, 'profile/original.jpg')
    ];

    return await Promise.all(uploads);
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Validate image file (simplified - any image, reasonable size)
   * التحقق من صحة ملف الصورة (مبسط)
   */
  private validateImage(file: File, maxSize: number): void {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > maxSize) {
      const maxMB = Math.floor(maxSize / (1024 * 1024));
      throw new Error(`Image must be under ${maxMB}MB`);
    }
    
    // No aspect ratio check - any rectangle image is OK!
    console.log('✓ Image validation passed');
  }

  /**
   * Create image variants (thumbnail, medium, large)
   * إنشاء نسخ مختلفة من الصورة
   */
  private async createImageVariants(file: File): Promise<ImageVariants> {
    const options = {
      maxSizeMB: 1,
      useWebWorker: true
    };

    // Thumbnail: 150x150
    const thumbnail = await imageCompression(file, {
      ...options,
      maxWidthOrHeight: 150
    });

    // Medium: 400x400
    const medium = await imageCompression(file, {
      ...options,
      maxWidthOrHeight: 400
    });

    // Large: 800x800
    const large = await imageCompression(file, {
      ...options,
      maxWidthOrHeight: 800
    });

    return { thumbnail, medium, large };
  }

  /**
   * Optimize cover image (1200x400)
   * تحسين صورة الغلاف
   */
  private async optimizeCoverImage(file: File): Promise<File> {
    return await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true
    });
  }
}

// Export singleton instance
export const imageProcessingService = ImageProcessingService.getInstance();
