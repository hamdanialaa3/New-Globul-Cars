// Image Compression Utility
// أداة ضغط الصور
import imageCompression from 'browser-image-compression';
import { logger } from '@/services/logger-service';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

/**
 * Compress a single image file
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const compressionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    logger.error('Image compression failed', error as Error);
    // Return original file if compression fails
    return file;
  }
};

/**
 * Compress multiple image files
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> => {
  try {
    const compressedFiles = await Promise.all(
      files.map(file => compressImage(file, options))
    );
    return compressedFiles;
  } catch (error) {
    logger.error('Batch image compression failed', error as Error);
    // Return original files if compression fails
    return files;
  }
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 10MB before compression)
  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Create preview URL for image
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revoke preview URL to free memory
 */
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};

