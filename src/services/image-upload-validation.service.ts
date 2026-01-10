/**
 * Image Upload Validation Service
 * Handles file validation, compression, EXIF cleanup, and error detection
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import { logger } from '@/services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    originalSize: number;
    compressedSize?: number;
    dimensions?: { width: number; height: number };
    format: string;
    hasExif: boolean;
  };
}

export interface ImageUploadOptions {
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedFormats?: string[];
  autoCompress?: boolean;
  removeExif?: boolean;
  generateThumbnail?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
  maxSizeMB: 5,
  maxWidth: 4000,
  maxHeight: 4000,
  allowedFormats: ['image/webp', 'image/jpeg', 'image/png'],
  autoCompress: true,
  removeExif: true,
  generateThumbnail: true
};

// ============================================================================
// VALIDATION SERVICE
// ============================================================================

class ImageUploadValidationService {
  /**
   * Validate file before upload
   */
  async validateFile(
    file: File,
    options: ImageUploadOptions = {}
  ): Promise<ImageValidationResult> {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata = {
      originalSize: file.size,
      compressedSize: undefined as number | undefined,
      dimensions: undefined as { width: number; height: number } | undefined,
      format: file.type,
      hasExif: false
    };

    // 1. FILE TYPE VALIDATION
    if (!config.allowedFormats.includes(file.type)) {
      errors.push(
        `Invalid file format: ${file.type}. Allowed: ${config.allowedFormats.join(', ')}`
      );
    }

    // 2. FILE SIZE VALIDATION
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > config.maxSizeMB) {
      errors.push(
        `File too large: ${fileSizeMB.toFixed(2)}MB. Maximum: ${config.maxSizeMB}MB`
      );
    }

    // 3. FILE CORRUPTION CHECK
    const isCorrupted = await this.checkFileCorruption(file);
    if (isCorrupted) {
      errors.push('File appears to be corrupted. Please try another image');
    }

    // If critical errors, return early
    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        warnings,
        metadata
      };
    }

    // 4. GET IMAGE DIMENSIONS
    try {
      const dimensions = await this.getImageDimensions(file);
      metadata.dimensions = dimensions;

      if (dimensions.width > config.maxWidth || dimensions.height > config.maxHeight) {
        warnings.push(
          `Image dimensions (${dimensions.width}x${dimensions.height}) exceed recommended max (${config.maxWidth}x${config.maxHeight})`
        );
      }
    } catch (error) {
      errors.push('Could not read image dimensions');
      logger.error('Get image dimensions failed', error instanceof Error ? error : new Error(String(error)));
    }

    // 5. EXIF DATA CHECK
    try {
      metadata.hasExif = await this.hasExifData(file);
      if (metadata.hasExif && config.removeExif) {
        warnings.push('Image contains location data (EXIF). This will be removed for privacy');
      }
    } catch (error) {
      logger.warn('Could not detect EXIF data', { error: String(error) });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  /**
   * Compress image file
   */
  async compressImage(
    file: File,
    quality: number = 0.85,
    targetFormat: 'image/webp' | 'image/jpeg' = 'image/webp'
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large
          if (width > 4000 || height > 4000) {
            const scale = Math.min(4000 / width, 4000 / height);
            width = width * scale;
            height = height * scale;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression resulted in empty blob'));
                return;
              }

              const compressedFile = new File(
                [blob],
                file.name,
                { type: targetFormat }
              );

              resolve(compressedFile);
            },
            targetFormat,
            quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Remove EXIF data from image
   */
  async removeExifData(file: File): Promise<File> {
    // For now, we can achieve this by re-encoding the image
    // EXIF data is typically stripped when re-encoding
    return this.compressImage(file, 0.95, 'image/webp');
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(
    file: File,
    width: number = 200,
    height: number = 200
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.max(width / img.width, height / img.height);

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          const x = (width - img.width * scale) / 2;
          const y = (height - img.height * scale) / 2;

          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Thumbnail generation failed'));
                return;
              }

              const thumbnailFile = new File(
                [blob],
                `thumbnail_${file.name}`,
                { type: 'image/webp' }
              );

              resolve(thumbnailFile);
            },
            'image/webp',
            0.8
          );
        };

        img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Check if file is corrupted
   */
  private async checkFileCorruption(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => resolve(false); // Valid image
        img.onerror = () => resolve(true); // Corrupted
        img.src = reader.result as string;

        // Timeout after 5 seconds
        setTimeout(() => resolve(true), 5000);
      };

      reader.onerror = () => resolve(true);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Check if image has EXIF data
   */
  private async hasExifData(file: File): Promise<boolean> {
    // Simple check: look for EXIF marker in JPEG files
    if (file.type === 'image/jpeg') {
      const buffer = await file.arrayBuffer();
      const view = new Uint8Array(buffer);

      // JPEG EXIF marker (0xFFE1)
      for (let i = 0; i < view.length - 1; i++) {
        if (view[i] === 0xff && view[i + 1] === 0xe1) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Validate multiple files
   */
  async validateFiles(
    files: File[],
    options: ImageUploadOptions = {}
  ): Promise<Map<string, ImageValidationResult>> {
    const results = new Map<string, ImageValidationResult>();

    for (const file of files) {
      const result = await this.validateFile(file, options);
      results.set(file.name, result);
    }

    return results;
  }

  /**
   * Process image (validate, compress, remove EXIF, generate thumbnail)
   */
  async processImage(
    file: File,
    options: ImageUploadOptions = {}
  ): Promise<{
    original: File;
    processed: File;
    thumbnail?: File;
    validation: ImageValidationResult;
  }> {
    const config = { ...DEFAULT_OPTIONS, ...options };

    // Validate
    const validation = await this.validateFile(file, config);
    if (!validation.isValid) {
      throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
    }

    // Compress
    let processed = file;
    if (config.autoCompress) {
      processed = await this.compressImage(file);
    }

    // Remove EXIF
    if (config.removeExif && validation.metadata.hasExif) {
      processed = await this.removeExifData(processed);
    }

    // Generate thumbnail
    let thumbnail: File | undefined;
    if (config.generateThumbnail) {
      thumbnail = await this.generateThumbnail(file);
    }

    return {
      original: file,
      processed,
      thumbnail,
      validation
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const imageUploadValidation = new ImageUploadValidationService();

/**
 * USAGE EXAMPLES:
 * 
 * 1. SIMPLE VALIDATION:
 *    const result = await imageUploadValidation.validateFile(file);
 *    if (!result.isValid) {
 *      logger.error('Image validation failed', new Error('Invalid image'), { errors: result.errors });
 *    }
 * 
 * 2. WITH CUSTOM OPTIONS:
 *    const result = await imageUploadValidation.validateFile(file, {
 *      maxSizeMB: 3,
 *      allowedFormats: ['image/webp']
 *    });
 * 
 * 3. PROCESS COMPLETE:
 *    const processed = await imageUploadValidation.processImage(file);
 *    // processed.processed = compressed + no EXIF
 *    // processed.thumbnail = 200x200 preview
 * 
 * 4. MULTIPLE FILES:
 *    const results = await imageUploadValidation.validateFiles(
 *      Array.from(files),
 *      { maxSizeMB: 5 }
 *    );
 *    results.forEach((result, filename) => {
 *      logger.info(`Image validation result: ${filename}`, { isValid: result.isValid });
 *    });
 */
