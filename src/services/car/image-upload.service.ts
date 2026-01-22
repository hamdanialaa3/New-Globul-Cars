/**
 * Image Upload Service for Cars
 * Handles uploading and deleting car images
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

class ImageUploadService {
  /**
   * Upload images for a car listing
   * ✅ FIX: Better error handling and validation
   * ✅ SEO: Smart Naming for images
   */
  async uploadImages(
    carId: string,
    images: File[],
    carDetails?: { make: string; model: string; year: number; city?: string }
  ): Promise<string[]> {
    if (!carId) {
      throw new Error('Car ID is required');
    }

    if (!images || images.length === 0) {
      serviceLogger.warn('No images provided for upload', { carId });
      return [];
    }

    // ✅ Validate all files before uploading
    const validImages: File[] = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image) {
        serviceLogger.warn(`Image at index ${i} is null or undefined`, { carId });
        continue;
      }

      if (!(image instanceof File)) {
        serviceLogger.warn(`Image at index ${i} is not a File object`, { carId, type: typeof image });
        continue;
      }

      if (!image.type.startsWith('image/')) {
        serviceLogger.warn(`File at index ${i} is not an image`, { carId, type: image.type, name: image.name });
        continue;
      }

      // Check file size (max 10MB per image)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (image.size > maxSize) {
        serviceLogger.warn(`Image at index ${i} is too large`, { carId, size: image.size, maxSize, name: image.name });
        continue;
      }

      validImages.push(image);
    }

    if (validImages.length === 0) {
      throw new Error('No valid images to upload. Please check that all files are valid image files (max 10MB each).');
    }

    if (validImages.length < images.length) {
      serviceLogger.warn('Some images were filtered out', {
        carId,
        originalCount: images.length,
        validCount: validImages.length
      });
    }

    try {

      // ✅ Use same path structure as SellWorkflowService for consistency
      const uploadPromises = validImages.map(async (image, index) => {
        try {
          const timestamp = Date.now();

          // ✅ SEO: Smart Naming
          let fileName = '';
          const extension = image.name.split('.').pop() || 'jpg';

          if (carDetails) {
            const make = carDetails.make.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const model = carDetails.model.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const city = (carDetails.city || 'bulgaria').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            // Pattern: make-model-year-city-index.ext
            fileName = `${make}-${model}-${carDetails.year}-${city}-${String(index + 1).padStart(2, '0')}.${extension}`;
          } else {
            // Fallback
            fileName = `${timestamp}_${index}_${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          }

          const imagePath = `cars/${carId}/images/${fileName}`;
          const imageRef = ref(storage, imagePath);

          serviceLogger.info(`📤 Uploading image ${index + 1}/${validImages.length}`, {
            name: image.name,
            size: image.size,
            type: image.type,
            path: imagePath
          });

          const snapshot = await uploadBytes(imageRef, image);
          const downloadUrl = await getDownloadURL(snapshot.ref);

          return downloadUrl;
        } catch (uploadError) {
          serviceLogger.error(`❌ Failed to upload image ${index + 1}`, uploadError as Error);
          serviceLogger.error(`Failed to upload image ${index + 1}`, uploadError as Error, {
            carId,
            imageName: image.name,
            imageSize: image.size,
            imageType: image.type
          });
          throw uploadError;
        }
      });

      const urls = await Promise.all(uploadPromises);
      serviceLogger.info('Images uploaded successfully', { carId, count: urls.length });
      return urls;
    } catch (error) {
      const errorMessage = error instanceof Error ? (error as Error).message : 'Unknown error';
      const errorDetails = error instanceof Error ? error.stack : String(error);
      serviceLogger.error('❌ Failed to upload images', new Error(errorMessage), { details: errorDetails, carId });
      serviceLogger.error('Failed to upload images', error as Error, { carId, imageCount: validImages.length });
      throw new Error(`Failed to upload images: ${errorMessage}`);
    }
  }

  /**
   * Delete images from Firebase Storage
   */
  async deleteImages(carId: string, imageUrls: string[]): Promise<void> {
    try {
      const deletePromises = imageUrls.map(async (url) => {
        try {
          // Extract path from URL or use full URL
          const imageRef = ref(storage, url);
          await deleteObject(imageRef);
        } catch (error) {
          // If delete fails, log but don't throw (image might already be deleted)
          serviceLogger.warn('Failed to delete image', error as Error, { carId, url });
        }
      });

      await Promise.allSettled(deletePromises);
      serviceLogger.info('Images deleted', { carId, count: imageUrls.length });
    } catch (error) {
      serviceLogger.error('Failed to delete images', error as Error, { carId });
      throw new Error('Failed to delete images');
    }
  }
}

export const imageUploadService = new ImageUploadService();

