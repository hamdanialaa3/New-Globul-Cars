// Image Upload Service with Progress Tracking and Retry
// خدمة رفع الصور مع تتبع التقدم وإعادة المحاولة

import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { storage, auth } from '../firebase/firebase-config';
import imageCompression from 'browser-image-compression';
import { serviceLogger } from './logger-service';

export interface UploadProgress {
  fileName: string;
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'error';
  url?: string;
  error?: string;
}

export interface UploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (url: string) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export class ImageUploadService {
  private static uploadTasks: Map<string, UploadTask> = new Map();

  /**
   * Compress image before upload
   */
  static async compressImage(
    file: File,
    options: {
      maxSizeMB?: number;
      maxWidthOrHeight?: number;
    } = {}
  ): Promise<File> {
    const {
      maxSizeMB = 1,
      maxWidthOrHeight = 1920
    } = options;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true
      });

      const reduction = ((1 - compressed.size / file.size) * 100).toFixed(1);
      serviceLogger.info('Image compressed successfully', { fileName: file.name, reductionPercent: reduction });

      return compressed;
    } catch (error) {
      serviceLogger.warn('Compression failed, using original', { fileName: file.name, error: (error as Error).message });
      return file;
    }
  }

  /**
   * Upload single image with progress tracking and retry
   */
  static async uploadSingleImage(
    file: File,
    path: string,
    options: UploadOptions = {}
  ): Promise<string> {
    const {
      maxSizeMB = 1,
      maxWidthOrHeight = 1920,
      onProgress,
      onComplete,
      onError,
      maxRetries = 3
    } = options;

    // Compress image first
    const compressedFile = await this.compressImage(file, {
      maxSizeMB,
      maxWidthOrHeight
    });

    // Try upload with retry
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = await this.uploadWithProgress(
          compressedFile,
          path,
          onProgress
        );

        onComplete?.(url);
        return url;
      } catch (error) {
        serviceLogger.error('Upload attempt failed', error as Error, { fileName: file.name, attempt, maxRetries });

        if (attempt === maxRetries) {
          const finalError = new Error(
            `Failed to upload ${file.name} after ${maxRetries} attempts`
          );
          onError?.(finalError);
          throw finalError;
        }

        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        serviceLogger.info('Retrying upload', { fileName: file.name, attempt: attempt + 1, maxRetries });
      }
    }

    throw new Error('Upload failed');
  }

  /**
   * Upload with progress tracking
   */
  private static uploadWithProgress(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const metadata = { customMetadata: { ownerId: auth.currentUser?.uid || 'unknown', uploadType: 'general', uploadedAt: new Date().toISOString() } };
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      // Store task for potential cancellation
      this.uploadTasks.set(file.name, uploadTask);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress: UploadProgress = {
            fileName: file.name,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: 'running'
          };

          onProgress?.(progress);
        },
        (error) => {
          this.uploadTasks.delete(file.name);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            this.uploadTasks.delete(file.name);

            onProgress?.({
              fileName: file.name,
              bytesTransferred: uploadTask.snapshot.totalBytes,
              totalBytes: uploadTask.snapshot.totalBytes,
              progress: 100,
              state: 'success',
              url
            });

            resolve(url);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Upload multiple images in parallel with overall progress
   */
  static async uploadMultipleImages(
    files: File[],
    carId: string,
    onOverallProgress?: (current: number, total: number, progress: number) => void,
    onError?: (fileName: string, error: Error) => void
  ): Promise<string[]> {
    const urls: string[] = [];
    const errors: Array<{ fileName: string; error: Error }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const fileName = `${timestamp}_${i}_${file.name}`;
      const path = `cars/${carId}/images/${fileName}`;

      try {
        const url = await this.uploadSingleImage(
          file,
          path,
          {
            onProgress: (progress) => {
              // Calculate overall progress
              const completedImages = i;
              const currentImageProgress = progress.progress / 100;
              const overall = ((completedImages + currentImageProgress) / files.length) * 100;
              
              onOverallProgress?.(i + 1, files.length, overall);
            }
          }
        );

        urls.push(url);
      } catch (error) {
        const err = error as Error;
        errors.push({ fileName: file.name, error: err });
        onError?.(file.name, err);
      }
    }

    if (errors.length === files.length) {
      throw new Error(`All ${files.length} images failed to upload`);
    }

    if (errors.length > 0) {
      serviceLogger.warn('Some images failed to upload', { failedCount: errors.length, totalCount: files.length });
    }

    return urls;
  }

  /**
   * Cancel upload
   */
  static cancelUpload(fileName: string): void {
    const task = this.uploadTasks.get(fileName);
    if (task) {
      task.cancel();
      this.uploadTasks.delete(fileName);
      serviceLogger.info('Upload cancelled', { fileName });
    }
  }

  /**
   * Cancel all uploads
   */
  static cancelAllUploads(): void {
    this.uploadTasks.forEach((task, fileName) => {
      task.cancel();
      serviceLogger.info('Upload cancelled', { fileName });
    });
    this.uploadTasks.clear();
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): {
    valid: boolean;
    error?: string;
  } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'File is not an image'
      };
    }

    // Check file size (10 MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Image is too large (max 10 MB). Current: ${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
    }

    // Check file format
    const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid image format. Use JPG, PNG or WebP'
      };
    }

    return { valid: true };
  }

  /**
   * Estimate upload time (rough estimate)
   */
  static estimateUploadTime(
    totalBytes: number,
    uploadSpeedBytesPerSecond: number = 500000 // 500 KB/s default
  ): number {
    return Math.ceil(totalBytes / uploadSpeedBytesPerSecond);
  }
}

export default ImageUploadService;

