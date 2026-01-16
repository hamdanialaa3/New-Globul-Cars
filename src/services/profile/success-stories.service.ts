/**
 * Success Stories Service
 * Manages user success stories and achievements
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import type { SuccessStory } from '../../types/profile-enhancements.types';

export class SuccessStoriesService {
  private static instance: SuccessStoriesService;
  private readonly collectionName = 'successStories';
  private readonly storagePath = 'success-stories';

  private constructor() {}

  public static getInstance(): SuccessStoriesService {
    if (!SuccessStoriesService.instance) {
      SuccessStoriesService.instance = new SuccessStoriesService();
    }
    return SuccessStoriesService.instance;
  }

  /**
   * Upload story media (image/video) to Firebase Storage
   */
  async uploadStoryMedia(
    userId: string,
    file: File,
    storyId: string
  ): Promise<string> {
    try {
      if (!userId || !file || !storyId) {
        throw new Error('Invalid userId, file, or storyId');
      }

      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${storyId}_${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, `${this.storagePath}/${userId}/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      serviceLogger.info(`Story media uploaded: ${fileName} for user: ${userId}`);
      return downloadURL;
    } catch (error) {
      serviceLogger.error('Error uploading story media:', error);
      throw error;
    }
  }

  /**
   * Delete story media from Firebase Storage
   */
  async deleteStoryMedia(mediaUrl: string): Promise<void> {
    try {
      if (!mediaUrl || !mediaUrl.includes('firebasestorage.googleapis.com')) {
        return; // Not a Firebase Storage URL
      }

      const mediaRef = ref(storage, mediaUrl);
      await deleteObject(mediaRef);
      serviceLogger.info('Story media deleted from storage');
    } catch (error) {
      // Log but don't throw - media might already be deleted
      serviceLogger.warn('Could not delete story media:', error);
    }
  }

  /**
   * Create a new success story
   */
  async createStory(
    userId: string,
    storyData: Omit<SuccessStory, 'id' | 'userId' | 'createdAt'>
  ): Promise<string> {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId');
      }

      const storyRef = doc(collection(db, this.collectionName));
      
      // Ensure date is a Timestamp, not null
      const storyDate = storyData.date 
        ? (storyData.date instanceof Timestamp 
            ? storyData.date 
            : Timestamp.fromDate(storyData.date instanceof Date ? storyData.date : new Date(storyData.date)))
        : Timestamp.now();

      const story: SuccessStory = {
        id: storyRef.id,
        userId,
        ...storyData,
        date: storyDate,
        createdAt: serverTimestamp() as any
      };

      await setDoc(storyRef, story);
      serviceLogger.info(`Success story created: ${storyRef.id} for user: ${userId}`);
      return storyRef.id;
    } catch (error) {
      serviceLogger.error('Error creating success story:', error);
      throw error;
    }
  }

  /**
   * Get user's success stories
   */
  async getUserStories(
    userId: string,
    options?: {
      isPublic?: boolean;
      limitCount?: number;
      orderByField?: 'date' | 'createdAt';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<SuccessStory[]> {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        return [];
      }

      const {
        isPublic = true,
        limitCount = 10,
        orderByField = 'createdAt', // Use createdAt instead of date to avoid null issues
        orderDirection = 'desc'
      } = options || {};

      let q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      );

      if (isPublic !== undefined) {
        q = query(q, where('isPublic', '==', isPublic));
      }

      // Only order by if we have a valid field
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure date is a valid Timestamp
        let storyDate: Timestamp;
        if (data.date && data.date instanceof Timestamp) {
          storyDate = data.date;
        } else if (data.date && data.date.toDate) {
          storyDate = Timestamp.fromDate(data.date.toDate());
        } else if (data.createdAt && data.createdAt instanceof Timestamp) {
          storyDate = data.createdAt;
        } else if (data.createdAt && data.createdAt.toDate) {
          storyDate = Timestamp.fromDate(data.createdAt.toDate());
        } else {
          storyDate = Timestamp.now();
        }

        return {
          id: doc.id,
          ...data,
          date: storyDate
        } as SuccessStory;
      });
    } catch (error) {
      serviceLogger.error('Error getting user stories:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * Get a single success story
   */
  async getStory(storyId: string): Promise<SuccessStory | null> {
    try {
      const storyRef = doc(db, this.collectionName, storyId);
      const storySnap = await getDoc(storyRef);

      if (!storySnap.exists()) {
        return null;
      }

      return {
        id: storySnap.id,
        ...storySnap.data()
      } as SuccessStory;
    } catch (error) {
      serviceLogger.error('Error getting story:', error);
      throw error;
    }
  }

  /**
   * Update a success story
   */
  async updateStory(
    storyId: string,
    updates: Partial<Omit<SuccessStory, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, storyId);
      await updateDoc(storyRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      serviceLogger.info(`Success story updated: ${storyId}`);
    } catch (error) {
      serviceLogger.error('Error updating story:', error);
      throw error;
    }
  }

  /**
   * Delete a success story
   */
  async deleteStory(storyId: string): Promise<void> {
    try {
      // Get story data to delete media if exists
      const storyRef = doc(db, this.collectionName, storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (storyDoc.exists()) {
        const storyData = storyDoc.data() as SuccessStory & { mediaUrl?: string };
        
        // Delete media from storage if exists
        if (storyData.mediaUrl) {
          await this.deleteStoryMedia(storyData.mediaUrl);
        }
      }

      await deleteDoc(storyRef);
      serviceLogger.info(`Success story deleted: ${storyId}`);
    } catch (error) {
      serviceLogger.error('Error deleting story:', error);
      throw error;
    }
  }

  /**
   * Get public success stories (for display on profiles)
   */
  async getPublicStories(
    userId: string,
    limitCount: number = 6
  ): Promise<SuccessStory[]> {
    if (!userId) {
      return [];
    }
    return this.getUserStories(userId, {
      isPublic: true,
      limitCount,
      orderByField: 'createdAt', // Use createdAt to avoid null issues
      orderDirection: 'desc'
    });
  }

  /**
   * Get total sales count from success stories
   */
  async getTotalSales(userId: string): Promise<number> {
    try {
      const stories = await this.getUserStories(userId, {
        isPublic: true,
        limitCount: 100
      });

      return stories
        .filter(s => s.type === 'sale' && s.value)
        .reduce((total, story) => total + (story.value || 0), 0);
    } catch (error) {
      serviceLogger.error('Error calculating total sales:', error);
      return 0;
    }
  }
}

export const successStoriesService = SuccessStoriesService.getInstance();

