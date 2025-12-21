/**
 * Profile Media Service
 * Phase 2B: Integration Services
 * 
 * Handles all media uploads for profiles (photos, documents, gallery).
 * Includes image optimization and validation.
 * 
 * File: src/services/profile/ProfileMediaService.ts
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { storage, db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import type { ProfileType } from '../../types/user/bulgarian-user.types';

export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  optimizeImage?: boolean;
  generateThumbnail?: boolean;
}

export class ProfileMediaService {
  private static readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  /**
   * Upload profile photo
   */
  static async uploadProfilePhoto(uid: string, file: File): Promise<string> {
    try {
      // Validate file
      this.validateFile(file, {
        maxSizeMB: 5,
        allowedTypes: this.ALLOWED_IMAGE_TYPES
      });

      // Optimize image if needed
      const optimizedFile = await this.optimizeImage(file);

      // Upload to storage
      const timestamp = Date.now();
      const fileName = `profile_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `users/${uid}/profile/${fileName}`);

      await uploadBytes(storageRef, optimizedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Update user document
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        photoURL: downloadURL,
        updatedAt: serverTimestamp()
      });

      logger.info('Profile photo uploaded', { uid, fileName });
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading profile photo', error as Error, { uid });
      throw new Error(`Failed to upload profile photo: ${(error as Error).message}`);
    }
  }

  /**
   * Upload cover image
   */
  static async uploadCoverImage(uid: string, file: File): Promise<string> {
    try {
      this.validateFile(file, {
        maxSizeMB: 10,
        allowedTypes: this.ALLOWED_IMAGE_TYPES
      });

      const optimizedFile = await this.optimizeImage(file, 1920, 400);

      const timestamp = Date.now();
      const fileName = `cover_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `users/${uid}/cover/${fileName}`);

      await uploadBytes(storageRef, optimizedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Update user document
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        coverImage: downloadURL,
        updatedAt: serverTimestamp()
      });

      logger.info('Cover image uploaded', { uid, fileName });
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading cover image', error as Error, { uid });
      throw new Error(`Failed to upload cover image: ${(error as Error).message}`);
    }
  }

  /**
   * Upload gallery image
   */
  static async uploadGalleryImage(
    uid: string,
    file: File,
    profileType: ProfileType
  ): Promise<string> {
    try {
      this.validateFile(file, {
        maxSizeMB: 5,
        allowedTypes: this.ALLOWED_IMAGE_TYPES
      });

      const optimizedFile = await this.optimizeImage(file);

      const timestamp = Date.now();
      const fileName = `gallery_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `users/${uid}/gallery/${fileName}`);

      await uploadBytes(storageRef, optimizedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Update based on profile type
      if (profileType === 'dealer') {
        const dealershipRef = doc(db, 'dealerships', uid);
        await updateDoc(dealershipRef, {
          'media.galleryImages': arrayUnion({
            url: downloadURL,
            uploadedAt: new Date(),
            category: 'other'
          }),
          updatedAt: serverTimestamp()
        });
      } else if (profileType === 'company') {
        const companyRef = doc(db, 'companies', uid);
        await updateDoc(companyRef, {
          'media.galleryImages': arrayUnion({
            url: downloadURL,
            uploadedAt: new Date(),
            category: 'other'
          }),
          updatedAt: serverTimestamp()
        });
      } else {
        // Private user - update user document
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          gallery: arrayUnion(downloadURL),
          updatedAt: serverTimestamp()
        });
      }

      logger.info('Gallery image uploaded', { uid, profileType, fileName });
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading gallery image', error as Error, { uid });
      throw new Error(`Failed to upload gallery image: ${(error as Error).message}`);
    }
  }

  /**
   * Delete gallery image
   */
  static async deleteGalleryImage(
    uid: string,
    imageUrl: string,
    profileType: ProfileType
  ): Promise<void> {
    try {
      // Delete from storage
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);

      // Update based on profile type
      if (profileType === 'dealer') {
        const dealershipRef = doc(db, 'dealerships', uid);
        const dealership = await getDoc(dealershipRef);
        const galleryImages = dealership.data()?.media?.galleryImages || [];
        const filtered = galleryImages.filter((img: any) => img.url !== imageUrl);

        await updateDoc(dealershipRef, {
          'media.galleryImages': filtered,
          updatedAt: serverTimestamp()
        });
      } else if (profileType === 'company') {
        const companyRef = doc(db, 'companies', uid);
        const company = await getDoc(companyRef);
        const galleryImages = company.data()?.media?.galleryImages || [];
        const filtered = galleryImages.filter((img: any) => img.url !== imageUrl);

        await updateDoc(companyRef, {
          'media.galleryImages': filtered,
          updatedAt: serverTimestamp()
        });
      } else {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          gallery: arrayRemove(imageUrl),
          updatedAt: serverTimestamp()
        });
      }

      logger.info('Gallery image deleted', { uid, imageUrl });
    } catch (error) {
      logger.error('Error deleting gallery image', error as Error, { uid, imageUrl });
      throw new Error(`Failed to delete gallery image: ${(error as Error).message}`);
    }
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File, options: UploadOptions): void {
    const maxSize = (options.maxSizeMB || 5) * 1024 * 1024;
    const allowedTypes = options.allowedTypes || this.ALLOWED_IMAGE_TYPES;

    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${options.maxSizeMB || 5}MB limit`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Optimize image before upload
   */
  private static async optimizeImage(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              resolve(optimizedFile);
            },
            'image/jpeg',
            0.85 // Quality
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
   * Get storage usage for user
   */
  static async getStorageUsage(uid: string): Promise<number> {
    try {
      const userFolderRef = ref(storage, `users/${uid}`);
      const fileList = await listAll(userFolderRef);

      let totalSize = 0;
      // Note: Firebase Storage doesn't provide file sizes directly
      // This is a simplified version
      logger.info('Storage usage check', { uid, fileCount: fileList.items.length });

      return totalSize;
    } catch (error) {
      logger.error('Error getting storage usage', error as Error, { uid });
      return 0;
    }
  }
}

export default ProfileMediaService;

