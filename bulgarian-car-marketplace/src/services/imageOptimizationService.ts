// Image Optimization Service
// خدمة تحسين وضغط الصور قبل الرفع
import { serviceLogger } from './logger-wrapper';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export class ImageOptimizationService {
  /**
   * Optimize and compress image
   */
  static async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img as any;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              // Create optimized file
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                { type: format }
              );

              serviceLogger.info('Image optimized', {
                originalSizeKB: Math.round(file.size / 1024),
                optimizedSizeKB: Math.round(optimizedFile.size / 1024),
                fileName: file.name
              });

              resolve(optimizedFile);
            },
            format,
            quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Optimize multiple images
   */
  static async optimizeImages(
    files: File[],
    options: ImageOptimizationOptions = {}
  ): Promise<File[]> {
    try {
      serviceLogger.info('Optimizing images', { count: files.length });

      const optimizedImages = await Promise.all(
        files.map(file => this.optimizeImage(file, options))
      );

      serviceLogger.info('All images optimized successfully', { count: files.length });
      return optimizedImages;
    } catch (error) {
      serviceLogger.error('Error optimizing images', error as Error, { count: files.length });
      throw error;
    }
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'File must be an image' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size must be less than 10MB' };
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      return { isValid: false, error: 'Unsupported image format' };
    }

    return { isValid: true };
  }

  /**
   * Validate multiple images
   */
  static validateImages(files: File[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check count
    if (files.length === 0) {
      errors.push('Please select at least one image');
    }

    if (files.length > 20) {
      errors.push('Maximum 20 images allowed');
    }

    // Validate each file
    files.forEach((file, index) => {
      const validation = this.validateImage(file);
      if (!validation.isValid && validation.error) {
        errors.push(`Image ${index + 1}: ${validation.error}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create thumbnail
   */
  static async createThumbnail(
    file: File,
    size: number = 200
  ): Promise<File> {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'image/jpeg'
    });
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert image to base64
   */
  static async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert base64 to File
   */
  static base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
}

export default ImageOptimizationService;


