/**
 * Image Upload Service for Cars
 * Handles uploading and deleting car images
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';

class ImageUploadService {
  /**
   * Upload images for a car listing
   */
  async uploadImages(carId: string, images: File[]): Promise<string[]> {
    try {
      const uploadPromises = images.map(async (image, index) => {
        const imageRef = ref(storage, `cars/${carId}/${Date.now()}_${index}_${image.name}`);
        await uploadBytes(imageRef, image);
        return await getDownloadURL(imageRef);
      });

      const urls = await Promise.all(uploadPromises);
      serviceLogger.info('Images uploaded successfully', { carId, count: urls.length });
      return urls;
    } catch (error) {
      serviceLogger.error('Failed to upload images', error as Error, { carId });
      throw new Error('Failed to upload images');
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

