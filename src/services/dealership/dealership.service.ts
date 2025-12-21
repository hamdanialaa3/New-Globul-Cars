/**
 * Dealership Service
 * Handles dealership/showroom profile management for Bulgarian Car Marketplace
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import type { 
  DealershipInfo, 
  DealershipDocument, 
  DealershipMedia,
  PrivacySettings,
  WorkingHours,
  DealershipServices,
  DealershipCertifications
} from '../../types/dealership/dealership.types';
import { logger } from '../logger-service';

class DealershipService {
  /**
   * Create or update dealership profile
   */
  async saveDealershipInfo(
    userId: string, 
    dealershipData: Partial<DealershipInfo>
  ): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      
      // ✅ FIXED: Type-safe (removed 'any')
      const dataToSave: Partial<DealershipInfo> & { updatedAt: Timestamp; createdAt?: Timestamp } = {
        ...dealershipData,
        updatedAt: serverTimestamp()
      };
      
      // If new, add createdAt
      const existing = await getDoc(dealershipRef);
      if (!existing.exists()) {
        dataToSave.createdAt = serverTimestamp();
      }
      
      await setDoc(dealershipRef, dataToSave, { merge: true });
    } catch (error) {
      logger.error('Error saving dealership info', error as Error, { userId });
      throw new Error('Failed to save dealership information');
    }
  }

  /**
   * Get dealership profile
   */
  async getDealershipInfo(userId: string): Promise<DealershipInfo | null> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      const dealershipSnap = await getDoc(dealershipRef);
      
      if (!dealershipSnap.exists()) {
        return null;
      }
      
      const data = dealershipSnap.data();
      
      // Convert Timestamps to Dates
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        documents: data.documents?.map((docItem: DealershipDocument) => ({
          ...docItem,
          uploadedAt: docItem.uploadedAt?.toDate() || new Date(),
          verifiedAt: docItem.verifiedAt?.toDate()
        })) || [],
        galleryImages: data.galleryImages?.map((img: DealershipMedia) => ({
          ...img,
          uploadedAt: img.uploadedAt?.toDate() || new Date()
        })) || []
      } as DealershipInfo;
    } catch (error) {
      logger.error('Error getting dealership info', error as Error, { userId });
      return null;
    }
  }

  /**
   * Upload dealership document (business license, tax registration, etc.)
   */
  async uploadDocument(
    userId: string,
    file: File,
    documentType: DealershipDocument['type'],
    documentName: string
  ): Promise<DealershipDocument> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}_${documentType}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `dealerships/${userId}/documents/${filename}`);
      
      // Upload file
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      // Create document record
      const newDocument: DealershipDocument = {
        id: `${documentType}_${timestamp}`,
        type: documentType,
        name: documentName,
        url,
        uploadedAt: new Date(),
        verified: false
      };
      
      // Update dealership documents array
      const dealershipRef = doc(db, 'dealerships', userId);
      const dealershipSnap = await getDoc(dealershipRef);
      
      const existingDocuments = dealershipSnap.exists() 
        ? dealershipSnap.data().documents || [] 
        : [];
      
      await updateDoc(dealershipRef, {
        documents: [...existingDocuments, newDocument],
        updatedAt: serverTimestamp()
      });
      
      return newDocument;
    } catch (error) {
      logger.error('Error uploading document', error as Error, { userId, documentType, documentName });
      throw new Error('Failed to upload document');
    }
  }

  /**
   * Delete dealership document
   */
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      const dealershipSnap = await getDoc(dealershipRef);
      
      if (!dealershipSnap.exists()) {
        throw new Error('Dealership not found');
      }
      
      const documents = dealershipSnap.data().documents || [];
      const documentToDelete = documents.find((d: DealershipDocument) => d.id === documentId);
      
      if (!documentToDelete) {
        throw new Error('Document not found');
      }
      
      // Delete from Storage
      const storageUrl = documentToDelete.url;
      const storageRef = ref(storage, storageUrl);
      await deleteObject(storageRef);
      
      // Update Firestore
      const updatedDocuments = documents.filter((d: DealershipDocument) => d.id !== documentId);
      await updateDoc(dealershipRef, {
        documents: updatedDocuments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error deleting document', error as Error, { userId, documentId });
      throw new Error('Failed to delete document');
    }
  }

  /**
   * Upload dealership media (photos/videos)
   */
  async uploadMedia(
    userId: string,
    file: File,
    mediaType: DealershipMedia['type'],
    caption?: string
  ): Promise<DealershipMedia> {
    try {
      const timestamp = Date.now();
      const filename = `${userId}_${mediaType}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `dealerships/${userId}/media/${filename}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const newMedia: DealershipMedia = {
        id: `${mediaType}_${timestamp}`,
        type: mediaType,
        url,
        caption,
        uploadedAt: new Date()
      };
      
      const dealershipRef = doc(db, 'dealerships', userId);
      const dealershipSnap = await getDoc(dealershipRef);
      
      const existingMedia = dealershipSnap.exists() 
        ? dealershipSnap.data().galleryImages || [] 
        : [];
      
      await updateDoc(dealershipRef, {
        galleryImages: [...existingMedia, newMedia],
        updatedAt: serverTimestamp()
      });
      
      return newMedia;
    } catch (error) {
      logger.error('Error uploading media', error as Error, { userId, mediaType, caption });
      throw new Error('Failed to upload media');
    }
  }

  /**
   * Delete dealership media
   */
  async deleteMedia(userId: string, mediaId: string): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      const dealershipSnap = await getDoc(dealershipRef);
      
      if (!dealershipSnap.exists()) {
        throw new Error('Dealership not found');
      }
      
      const media = dealershipSnap.data().galleryImages || [];
      const mediaToDelete = media.find((m: DealershipMedia) => m.id === mediaId);
      
      if (!mediaToDelete) {
        throw new Error('Media not found');
      }
      
      // Delete from Storage
      const storageRef = ref(storage, mediaToDelete.url);
      await deleteObject(storageRef);
      
      // Update Firestore
      const updatedMedia = media.filter((m: DealershipMedia) => m.id !== mediaId);
      await updateDoc(dealershipRef, {
        galleryImages: updatedMedia,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error deleting media', error as Error, { userId, mediaId });
      throw new Error('Failed to delete media');
    }
  }

  /**
   * Update working hours
   */
  async updateWorkingHours(
    userId: string, 
    workingHours: WorkingHours
  ): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      await updateDoc(dealershipRef, {
        workingHours,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error updating working hours', error as Error, { userId });
      throw new Error('Failed to update working hours');
    }
  }

  /**
   * Update services
   */
  async updateServices(
    userId: string, 
    services: DealershipServices
  ): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      await updateDoc(dealershipRef, {
        services,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error updating services', error as Error, { userId });
      throw new Error('Failed to update services');
    }
  }

  /**
   * Update certifications
   */
  async updateCertifications(
    userId: string, 
    certifications: DealershipCertifications
  ): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      await updateDoc(dealershipRef, {
        certifications,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error updating certifications', error as Error, { userId });
      throw new Error('Failed to update certifications');
    }
  }

  /**
   * Save privacy settings
   */
  async savePrivacySettings(
    userId: string, 
    privacySettings: PrivacySettings
  ): Promise<void> {
    try {
      const privacyRef = doc(db, 'users', userId);
      await updateDoc(privacyRef, {
        privacySettings,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error saving privacy settings', error as Error, { userId });
      throw new Error('Failed to save privacy settings');
    }
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      return userSnap.data().privacySettings || null;
    } catch (error) {
      logger.error('Error getting privacy settings', error as Error, { userId });
      return null;
    }
  }

  /**
   * Update total cars count (called when user adds/removes cars)
   */
  async updateTotalCars(userId: string, count: number): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      await updateDoc(dealershipRef, {
        totalCarsAvailable: count,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error updating total cars', error as Error, { userId, count });
    }
  }

  /**
   * Verify dealership (admin only)
   */
  async verifyDealership(
    userId: string, 
    adminId: string
  ): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      await updateDoc(dealershipRef, {
        verified: true,
        verifiedAt: serverTimestamp(),
        verifiedBy: adminId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error verifying dealership', error as Error, { userId, adminId });
      throw new Error('Failed to verify dealership');
    }
  }

  /**
   * Verify document (admin only)
   */
  async verifyDocument(
    userId: string, 
    documentId: string, 
    adminId: string
  ): Promise<void> {
    try {
      const dealershipRef = doc(db, 'dealerships', userId);
      const dealershipSnap = await getDoc(dealershipRef);
      
      if (!dealershipSnap.exists()) {
        throw new Error('Dealership not found');
      }
      
      const documents = dealershipSnap.data().documents || [];
      const updatedDocuments = documents.map((doc: DealershipDocument) => {
        if (doc.id === documentId) {
          return {
            ...doc,
            verified: true,
            verifiedAt: new Date(),
            verifiedBy: adminId
          };
        }
        return doc;
      });
      
      await updateDoc(dealershipRef, {
        documents: updatedDocuments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error verifying document', error as Error, { userId, documentId, adminId });
      throw new Error('Failed to verify document');
    }
  }

  /**
   * Search dealerships by criteria
   */
  async searchDealerships(criteria: {
    city?: string;
    region?: string;
    verified?: boolean;
    featured?: boolean;
  }): Promise<DealershipInfo[]> {
    try {
      let q = collection(db, 'dealerships');
      const constraints = [];
      
      if (criteria.locationData?.cityName) {
        constraints.push(where('address.locationData?.cityName', '==', criteria.locationData?.cityName));
      }
      if (criteria.region) {
        constraints.push(where('address.region', '==', criteria.region));
      }
      if (criteria.verified !== undefined) {
        constraints.push(where('verified', '==', criteria.verified));
      }
      if (criteria.featured !== undefined) {
        constraints.push(where('featuredDealer', '==', criteria.featured));
      }
      
      const querySnapshot = await getDocs(query(q, ...constraints));
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as DealershipInfo));
    } catch (error) {
      logger.error('Error searching dealerships', error as Error, { criteria });
      return [];
    }
  }
}

export const dealershipService = new DealershipService();
