// sell-workflow-images.ts - Image management for sell workflow
// Split from sellWorkflowService.ts to comply with 300-line limit

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../firebase/firebase-config';
import { logger } from './logger-service';
import { rateLimiter, RATE_LIMIT_CONFIGS } from './rate-limiting/rateLimiter.service';
import { WorkflowImageUpload } from './sell-workflow-types';

export class SellWorkflowImages {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly MAX_IMAGES = 20;

  /**
   * Upload single image to Firebase Storage
   */
  static async uploadImage(
    file: File,
    userId: string,
    workflowId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validate file
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Rate limiting check
      const rateLimitResult = rateLimiter.checkRateLimit(
        userId,
        RATE_LIMIT_CONFIGS.IMAGE_UPLOAD.action,
        RATE_LIMIT_CONFIGS.IMAGE_UPLOAD
      );

      if (!rateLimitResult.allowed) {
        const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
        return {
          success: false,
          error: `Too many uploads. Try again in ${retryAfter} seconds.`
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `workflow_${workflowId}_${timestamp}.${extension}`;

      // Create storage reference
      const storageRef = ref(storage, `workflow-images/${userId}/${filename}`);

      // Upload file
      const metadata = { customMetadata: { ownerId: auth.currentUser?.uid || 'unknown', uploadedAt: new Date().toISOString() } };
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      logger.info('Image uploaded successfully', {
        userId,
        workflowId,
        filename,
        size: file.size,
        url: downloadURL
      });

      return { success: true, url: downloadURL };
    } catch (error) {
      logger.error('Failed to upload image', error, { userId, workflowId, filename: file.name });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(
    files: File[],
    userId: string,
    workflowId: string
  ): Promise<WorkflowImageUpload[]> {
    const results: WorkflowImageUpload[] = [];

    // Limit concurrent uploads to 3
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map(async (file, index) => {
        const globalIndex = i + index;
        const preview = URL.createObjectURL(file);

        try {
          const result = await this.uploadImage(file, userId, workflowId);

          return {
            file,
            preview,
            uploaded: result.success,
            url: result.url,
            error: result.error
          };
        } catch (error) {
          return {
            file,
            preview,
            uploaded: false,
            error: (error as Error).message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const successful = results.filter(r => r.uploaded).length;
    const failed = results.length - successful;

    logger.info('Multiple images upload completed', {
      userId,
      workflowId,
      total: files.length,
      successful,
      failed
    });

    return results;
  }

  /**
   * Delete image from storage
   */
  static async deleteImage(
    imageUrl: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1].split('?')[0];

      // Create storage reference
      const storageRef = ref(storage, `workflow-images/${userId}/${filename}`);

      // Delete file
      await deleteObject(storageRef);

      logger.info('Image deleted successfully', { userId, filename });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete image', error, { userId, imageUrl });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Validate image file
   */
  private static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed: ${this.ALLOWED_TYPES.join(', ')}`
      };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Compress image before upload
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Return original if compression fails
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate image preview
   */
  static generatePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}