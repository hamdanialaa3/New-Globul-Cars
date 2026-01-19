/**
 * FIXES APPLIED:
 * - [Issue #4]: QuotaExceededError in IndexedDB - Added comprehensive quota handling
 * - [Issue #5]: Weak Image Validation - Added deep validation with file signatures
 * - [Issue #6]: Memory Leak in Thumbnails - Added URL.revokeObjectURL cleanup
 * - Changes:
 *   Issue #4:
 *     1. Added try-catch for QuotaExceededError in writeToDB
 *     2. Added bilingual error messages for storage issues
 *     3. Added compressAndRetry method with lower quality (0.5)
 *     4. Added detailed storage logging
 *   Issue #5:
 *     1. Added file signature validation (magic numbers)
 *     2. Added dimension validation (100x100 to 5000x5000)
 *     3. Added aspect ratio validation
 *     4. Added file extension vs MIME type matching
 *     5. Added detailed bilingual error messages
 *   Issue #6:
 *     1. Added URL.revokeObjectURL in img.onload
 *     2. Added URL.revokeObjectURL in img.onerror
 *     3. Memory properly released after thumbnail generation
 * - Tested: Quota exceeded scenarios, malicious file uploads, memory leak testing
 * 
 * الإصلاحات المطبقة:
 * - [المشكلة #4]: خطأ QuotaExceededError في IndexedDB
 * - [المشكلة #5]: التحقق الضعيف من الصور
 * - [المشكلة #6]: تسرب الذاكرة في الصور المصغرة
 */

/**
 * IMAGE STORAGE OPERATIONS
 * عمليات تخزين الصور
 */

import { serviceLogger } from './logger-service';
import { ImageData, StorageInfo, StorageEstimate, ValidationResult } from './image-storage-types';
import {
  DB_CONFIG,
  IMAGE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THUMBNAIL_OPTIONS,
  TRANSACTION_TYPES,
  DEFAULT_STORAGE_ESTIMATE,
  DEFAULT_STORAGE_INFO
} from './image-storage-config';

/**
 * ✅ FIXED Issue #5: File signature validation (magic numbers)
 * التحقق من توقيعات الملفات (الأرقام السحرية)
 * 
 * These are the first few bytes of each image format
 * These cannot be faked by changing file extension
 */
const ALLOWED_IMAGE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],           // JPEG starts with FFD8FF
  'image/png': [0x89, 0x50, 0x4E, 0x47],      // PNG starts with 89504E47
  'image/webp': [0x52, 0x49, 0x46, 0x46]      // WebP starts with RIFF
} as const;

/**
 * ✅ FIXED Issue #5: Dimension validation constants
 * ثوابت التحقق من الأبعاد
 */
const MAX_IMAGE_DIMENSION = 5000;  // Max 5000x5000 pixels
const MIN_IMAGE_DIMENSION = 100;   // Min 100x100 pixels
const MAX_ASPECT_RATIO = 5;        // Max 5:1 or 1:5 ratio
const MIN_ASPECT_RATIO = 1 / MAX_ASPECT_RATIO;

/**
 * ✅ FIXED Issue #4: Compression retry quality
 * جودة ضغط إعادة المحاولة
 */
const RETRY_COMPRESSION_QUALITY = 0.5; // Lower quality for retry (was 0.7)

/**
 * ✅ FIXED Issue #5: Read file signature (first bytes) for deep validation
 * قراءة توقيع الملف (البايتات الأولى) للتحقق العميق
 * 
 * @param file File to read
 * @param bytesToRead Number of bytes to read (default 4 for most formats)
 * @returns Array of bytes
 */
async function readFileSignature(file: File, bytesToRead: number = 4): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const slice = file.slice(0, bytesToRead);
    
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      resolve(Array.from(bytes));
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file signature'));
    };
    
    reader.readAsArrayBuffer(slice);
  });
}

/**
 * ✅ FIXED Issue #5: Verify file signature matches MIME type
 * التحقق من مطابقة توقيع الملف لنوع MIME
 * 
 * @param file File to verify
 * @returns true if signature matches MIME type
 */
async function verifyFileSignature(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const mimeType = file.type as keyof typeof ALLOWED_IMAGE_SIGNATURES;
    const expectedSignature = ALLOWED_IMAGE_SIGNATURES[mimeType];
    
    if (!expectedSignature) {
      return { 
        valid: false, 
        error: 'Unsupported image format. Only JPEG, PNG, and WebP are allowed.' 
      };
    }
    
    const actualSignature = await readFileSignature(file, expectedSignature.length);
    
    // Compare byte by byte
    const matches = expectedSignature.every((byte, index) => byte === actualSignature[index]);
    
    if (!matches) {
      serviceLogger.warn('File signature mismatch - possible file extension spoofing', {
        fileName: file.name,
        mimeType: file.type,
        expectedSignature: expectedSignature.map(b => b.toString(16)).join(' '),
        actualSignature: actualSignature.map(b => b.toString(16)).join(' ')
      });
      
      return { 
        valid: false, 
        error: 'File content does not match file type. This file may be corrupt or mislabeled.' 
      };
    }
    
    return { valid: true };
  } catch (error) {
    serviceLogger.error('Error verifying file signature', error as Error, { fileName: file.name });
    return { valid: false, error: 'Failed to verify file integrity' };
  }
}

/**
 * ✅ FIXED Issue #5: Load image to get dimensions
 * تحميل الصورة للحصول على الأبعاد
 * 
 * @param file Image file
 * @returns Image dimensions { width, height }
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl); // ✅ Clean up immediately
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl); // ✅ Clean up on error too
      reject(new Error('Failed to load image for dimension check'));
    };
    
    img.src = objectUrl;
  });
}

/**
 * ✅ FIXED Issue #5: Validate image dimensions and aspect ratio
 * التحقق من أبعاد الصورة ونسبة العرض إلى الارتفاع
 * 
 * @param width Image width
 * @param height Image height
 * @returns Validation result
 */
function validateDimensions(width: number, height: number): { valid: boolean; error?: string; warning?: string } {
  // Check minimum dimensions
  if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
    return {
      valid: false,
      error: `Image too small. Minimum ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION} pixels required. Current: ${width}x${height}`
    };
  }
  
  // Check maximum dimensions
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    return {
      valid: false,
      error: `Image too large. Maximum ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION} pixels allowed. Current: ${width}x${height}`
    };
  }
  
  // Check aspect ratio
  const aspectRatio = width / height;
  if (aspectRatio > MAX_ASPECT_RATIO || aspectRatio < MIN_ASPECT_RATIO) {
    return {
      valid: true, // Warning only, not blocking
      warning: `Unusual aspect ratio detected (${aspectRatio.toFixed(2)}:1). Image may appear distorted.`
    };
  }
  
  return { valid: true };
}

/**
 * ✅ FIXED Issue #5: Validate file extension matches MIME type
 * التحقق من مطابقة امتداد الملف لنوع MIME
 * 
 * @param file File to validate
 * @returns true if extension matches MIME type
 */
function validateFileExtension(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  const extensionMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif']
  };
  
  const expectedExtensions = extensionMap[mimeType];
  if (!expectedExtensions) {
    return { valid: false, error: 'Unsupported file type' };
  }
  
  const hasValidExtension = expectedExtensions.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `File extension does not match type. Expected ${expectedExtensions.join(' or ')}, got ${fileName.substring(fileName.lastIndexOf('.'))}`
    };
  }
  
  return { valid: true };
}

/**
 * Generate thumbnail from image File
 * توليد صورة مصغرة من ملف الصورة
 * 
 * ✅ FIXED Issue #6: Memory leak - Added URL.revokeObjectURL cleanup
 */
export async function generateThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error(ERROR_MESSAGES.CANVAS_ERROR));
      return;
    }

    // ✅ FIXED Issue #6: Create object URL for cleanup tracking
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // ✅ FIXED Issue #6: Revoke object URL to prevent memory leak
      // تحرير الذاكرة لمنع التسرب
      URL.revokeObjectURL(objectUrl);
      
      // Calculate dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > IMAGE_CONFIG.THUMBNAIL_SIZE) {
          height = (height * IMAGE_CONFIG.THUMBNAIL_SIZE) / width;
          width = IMAGE_CONFIG.THUMBNAIL_SIZE;
        }
      } else {
        if (height > IMAGE_CONFIG.THUMBNAIL_SIZE) {
          width = (width * IMAGE_CONFIG.THUMBNAIL_SIZE) / height;
          height = IMAGE_CONFIG.THUMBNAIL_SIZE;
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
            reject(new Error(ERROR_MESSAGES.THUMBNAIL_ERROR));
          }
        },
        THUMBNAIL_OPTIONS.FORMAT,
        THUMBNAIL_OPTIONS.QUALITY
      );
    };

    img.onerror = () => {
      // ✅ FIXED Issue #6: Revoke object URL even on error
      // تحرير الذاكرة حتى عند الخطأ
      URL.revokeObjectURL(objectUrl);
      reject(new Error(ERROR_MESSAGES.IMAGE_LOAD_ERROR));
    };

    img.src = objectUrl;
  });
}

/**
 * Validate image file
 * التحقق من صحة ملف الصورة
 * 
 * ✅ FIXED Issue #5: Deep validation with file signatures, dimensions, aspect ratio
 */
export async function validateImage(file: File): Promise<ValidationResult> {
  // Get browser language for bilingual messages
  const lang = navigator.language.startsWith('bg') ? 'bg' : 'en';
  
  // 1. Basic type check
  if (!file.type.startsWith('image/')) {
    return { 
      valid: false, 
      error: lang === 'bg' 
        ? 'Файлът трябва да бъде изображение' 
        : 'File must be an image' 
    };
  }
  
  // 2. File size check
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxMB = (IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
    return { 
      valid: false, 
      error: lang === 'bg'
        ? `Файлът е твърде голям (макс ${maxMB}MB). Текущ: ${sizeMB}MB`
        : `File too large (max ${maxMB}MB). Current: ${sizeMB}MB`
    };
  }
  
  // ✅ FIXED Issue #5: Validate file extension matches MIME type
  const extensionCheck = validateFileExtension(file);
  if (!extensionCheck.valid) {
    return {
      valid: false,
      error: lang === 'bg'
        ? `Разширението на файла не съвпада с типа: ${extensionCheck.error}`
        : extensionCheck.error
    };
  }
  
  // ✅ FIXED Issue #5: Deep validation - File signature check (magic numbers)
  // التحقق العميق - فحص توقيع الملف (الأرقام السحرية)
  const signatureCheck = await verifyFileSignature(file);
  if (!signatureCheck.valid) {
    serviceLogger.warn('File signature validation failed', {
      fileName: file.name,
      mimeType: file.type,
      error: signatureCheck.error
    });
    
    return {
      valid: false,
      error: lang === 'bg'
        ? 'Файлът е повреден или не е валидно изображение. Моля, опитайте с друг файл.'
        : 'File is corrupt or not a valid image. Please try another file.'
    };
  }
  
  // ✅ FIXED Issue #5: Dimension validation
  // التحقق من الأبعاد
  try {
    const { width, height } = await getImageDimensions(file);
    const dimensionCheck = validateDimensions(width, height);
    
    if (!dimensionCheck.valid) {
      return {
        valid: false,
        error: lang === 'bg'
          ? `Невалидни размери на изображението: ${dimensionCheck.error}`
          : dimensionCheck.error
      };
    }
    
    // Log warning if aspect ratio is unusual (but still allow)
    if (dimensionCheck.warning) {
      serviceLogger.warn('Unusual aspect ratio detected', {
        fileName: file.name,
        width,
        height,
        aspectRatio: (width / height).toFixed(2),
        warning: dimensionCheck.warning
      });
    }
    
    serviceLogger.info('Image validation passed', {
      fileName: file.name,
      size: file.size,
      dimensions: `${width}x${height}`,
      mimeType: file.type
    });
    
  } catch (error) {
    serviceLogger.error('Failed to validate image dimensions', error as Error, {
      fileName: file.name
    });
    
    return {
      valid: false,
      error: lang === 'bg'
        ? 'Неуспешно зареждане на изображението за проверка'
        : 'Failed to load image for validation'
    };
  }
  
  return { valid: true };
}

/**
 * Restore File objects from IndexedDB storage
 * استعادة كائنات File من تخزين IndexedDB
 */
export function restoreFileObjects(data: any[]): File[] {
  return data.map((file, index) => {
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
      return new File([blob], fileName, { 
        type: fileType, 
        lastModified: blob.lastModified || Date.now() 
      });
    }
    
    return null;
  }).filter((file): file is File => file !== null);
}

/**
 * Initialize IndexedDB database
 * تهيئة قاعدة بيانات IndexedDB
 */
export function initDB(dbPromise: Promise<IDBDatabase> | null): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.DB_NAME, DB_CONFIG.DB_VERSION);

    request.onerror = () => {
      const error = new Error(request.error?.message || 'Failed to open IndexedDB');
      serviceLogger.error('Failed to open IndexedDB', error);
      reject(error);
    };

    request.onsuccess = () => {
      const db = request.result;
      serviceLogger.info('IndexedDB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DB_CONFIG.STORE_NAME)) {
        db.createObjectStore(DB_CONFIG.STORE_NAME);
        serviceLogger.info('IndexedDB object store created');
      }
    };
  });
}

/**
 * Read images from IndexedDB
 * قراءة الصور من IndexedDB
 */
export async function readFromDB(db: IDBDatabase): Promise<ImageData | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_CONFIG.STORE_NAME], TRANSACTION_TYPES.READONLY);
    const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
    const request = store.get(DB_CONFIG.KEY);

    request.onsuccess = () => {
      resolve(request.result as ImageData | undefined);
    };

    request.onerror = () => {
      reject(new Error(ERROR_MESSAGES.DB_ERROR('read images')));
    };
  });
}

/**
 * ✅ FIXED Issue #4: Compress image with retry quality for quota recovery
 * ضغط الصورة بجودة أقل لاسترداد الحصة
 * 
 * @param file Original file
 * @param quality Compression quality (0-1)
 * @returns Compressed file
 */
export async function compressImageForRetry(file: File, quality: number = RETRY_COMPRESSION_QUALITY): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            serviceLogger.info('Image compressed for retry', {
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: (compressedFile.size / file.size * 100).toFixed(1) + '%',
              quality
            });
            
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = objectUrl;
  });
}

/**
 * Write images to IndexedDB
 * كتابة الصور إلى IndexedDB
 * 
 * ✅ FIXED Issue #4: Added QuotaExceededError handling with compression retry
 */
export async function writeToDB(db: IDBDatabase, imageData: ImageData): Promise<void> {
  const lang = navigator.language.startsWith('bg') ? 'bg' : 'en';
  
  // ✅ FIXED Issue #4: Calculate total size needed
  const totalSize = imageData.files.reduce((sum, f) => sum + f.size, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  
  return new Promise(async (resolve, reject) => {
    // ✅ FIXED Issue #4: Wrap in try-catch for QuotaExceededError
    try {
      const transaction = db.transaction([DB_CONFIG.STORE_NAME], TRANSACTION_TYPES.READWRITE);
      const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
      const request = store.put(imageData, DB_CONFIG.KEY);

      request.onsuccess = () => {
        serviceLogger.info(SUCCESS_MESSAGES.IMAGES_SAVED, {
          count: imageData.files.length,
          totalSize: totalSize,
          totalSizeMB
        });
        resolve();
      };

      request.onerror = async (event) => {
        const error = request.error;
        
        // ✅ FIXED Issue #4: Handle QuotaExceededError specifically
        // معالجة خطأ تجاوز الحصة
        if (error?.name === 'QuotaExceededError') {
          serviceLogger.warn('IndexedDB quota exceeded, attempting compression retry', {
            totalSize,
            totalSizeMB,
            imageCount: imageData.files.length
          });
          
          // Get storage estimate
          const estimate = await getStorageEstimate();
          const availableMB = ((estimate.quota - estimate.usage) / 1024 / 1024).toFixed(2);
          
          serviceLogger.info('Storage status', {
            usageMB: (estimate.usage / 1024 / 1024).toFixed(2),
            quotaMB: (estimate.quota / 1024 / 1024).toFixed(2),
            availableMB,
            usagePercentage: estimate.percentage.toFixed(1) + '%'
          });
          
          // Try to compress images and retry
          try {
            serviceLogger.info('Attempting to compress images for retry');
            
            const compressedFiles = await Promise.all(
              imageData.files.map(file => compressImageForRetry(file))
            );
            
            const compressedData: ImageData = {
              ...imageData,
              files: compressedFiles
            };
            
            const compressedSize = compressedFiles.reduce((sum, f) => sum + f.size, 0);
            const compressedSizeMB = (compressedSize / 1024 / 1024).toFixed(2);
            
            serviceLogger.info('Images compressed, retrying write', {
              originalSizeMB: totalSizeMB,
              compressedSizeMB,
              savings: ((totalSize - compressedSize) / 1024 / 1024).toFixed(2) + 'MB'
            });
            
            // Retry with compressed images
            const retryTransaction = db.transaction([DB_CONFIG.STORE_NAME], TRANSACTION_TYPES.READWRITE);
            const retryStore = retryTransaction.objectStore(DB_CONFIG.STORE_NAME);
            const retryRequest = retryStore.put(compressedData, DB_CONFIG.KEY);
            
            retryRequest.onsuccess = () => {
              serviceLogger.info('Compressed images saved successfully', {
                compressedSizeMB
              });
              resolve();
            };
            
            retryRequest.onerror = () => {
              // Still failed after compression
              const errorMessage = lang === 'bg'
                ? `Недостатъчно място за съхранение. Необходими: ${totalSizeMB}MB, Налични: ${availableMB}MB. Моля, изтрийте стари снимки или използвайте по-малко изображения.`
                : `Insufficient storage space. Required: ${totalSizeMB}MB, Available: ${availableMB}MB. Please delete old images or use fewer images.`;
              
              serviceLogger.error('Failed to save even after compression', retryRequest.error as Error, {
                requiredMB: totalSizeMB,
                availableMB
              });
              
              reject(new Error(errorMessage));
            };
            
          } catch (compressionError) {
            // Compression failed
            const errorMessage = lang === 'bg'
              ? `Грешка при компресиране на изображенията. Моля, използвайте по-малко или по-малки изображения.`
              : `Failed to compress images. Please use fewer or smaller images.`;
            
            serviceLogger.error('Image compression failed', compressionError as Error);
            reject(new Error(errorMessage));
          }
          
        } else {
          // Other errors
          serviceLogger.error('Failed to save images', error as Error);
          reject(new Error(ERROR_MESSAGES.DB_ERROR('save images')));
        }
      };
      
    } catch (error) {
      // Catch any synchronous errors
      serviceLogger.error('Unexpected error in writeToDB', error as Error);
      reject(error);
    }
  });
}

/**
 * Clear images from IndexedDB
 * مسح الصور من IndexedDB
 */
export async function clearFromDB(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_CONFIG.STORE_NAME], TRANSACTION_TYPES.READWRITE);
    const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
    const request = store.delete(DB_CONFIG.KEY);

    request.onsuccess = () => {
      serviceLogger.info(SUCCESS_MESSAGES.IMAGES_CLEARED);
      resolve();
    };

    request.onerror = () => {
      serviceLogger.error('Error clearing images from IndexedDB', new Error(request.error?.message || 'Unknown error'));
      reject(new Error(ERROR_MESSAGES.DB_ERROR('clear images')));
    };
  });
}

/**
 * Get storage estimate from navigator.storage API
 * الحصول على تقدير التخزين من واجهة برمجة التطبيقات navigator.storage
 */
export async function getStorageEstimate(): Promise<StorageEstimate> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return { usage, quota, percentage };
    }

    return DEFAULT_STORAGE_ESTIMATE;
  } catch (error) {
    serviceLogger.error(ERROR_MESSAGES.STORAGE_ERROR, error as Error);
    return DEFAULT_STORAGE_ESTIMATE;
  }
}
