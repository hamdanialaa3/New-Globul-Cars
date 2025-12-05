/**
 * Car Story Service
 * Manages user's car story and experience
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import type { CarStory } from '../../types/profile-enhancements.types';

export class CarStoryService {
  private static instance: CarStoryService;
  private readonly collectionName = 'carStories';

  private constructor() {}

  public static getInstance(): CarStoryService {
    if (!CarStoryService.instance) {
      CarStoryService.instance = new CarStoryService();
    }
    return CarStoryService.instance;
  }

  /**
   * Get user's car story
   */
  async getCarStory(userId: string): Promise<CarStory | null> {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        return null;
      }

      const storyRef = doc(db, this.collectionName, userId);
      const storySnap = await getDoc(storyRef);

      if (!storySnap.exists()) {
        return null;
      }

      const data = storySnap.data();
      if (!data) {
        return null;
      }

      return data as CarStory;
    } catch (error) {
      serviceLogger.error('Error getting car story:', error);
      // Return null instead of throwing
      return null;
    }
  }

  /**
   * Create or update car story
   */
  async saveCarStory(
    userId: string,
    storyData: Partial<Omit<CarStory, 'userId' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, userId);
      const existingStory = await this.getCarStory(userId);

      const story: CarStory = {
        userId,
        story: storyData.story || existingStory?.story || '',
        yearsOfExperience: storyData.yearsOfExperience ?? existingStory?.yearsOfExperience,
        favoriteBrands: storyData.favoriteBrands ?? existingStory?.favoriteBrands,
        favoriteModels: storyData.favoriteModels ?? existingStory?.favoriteModels,
        specialties: storyData.specialties ?? existingStory?.specialties,
        updatedAt: serverTimestamp() as any
      };

      await setDoc(storyRef, story, { merge: true });
      serviceLogger.info(`Car story saved for user: ${userId}`);
    } catch (error) {
      serviceLogger.error('Error saving car story:', error);
      throw error;
    }
  }

  /**
   * Update only the story text
   */
  async updateStoryText(userId: string, story: string): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, userId);
      await updateDoc(storyRef, {
        story,
        updatedAt: serverTimestamp()
      });
      serviceLogger.info(`Car story text updated for user: ${userId}`);
    } catch (error) {
      serviceLogger.error('Error updating story text:', error);
      throw error;
    }
  }

  /**
   * Update years of experience
   */
  async updateYearsOfExperience(userId: string, years: number): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, userId);
      await updateDoc(storyRef, {
        yearsOfExperience: years,
        updatedAt: serverTimestamp()
      });
      serviceLogger.info(`Years of experience updated for user: ${userId}`);
    } catch (error) {
      serviceLogger.error('Error updating years of experience:', error);
      throw error;
    }
  }

  /**
   * Update favorite brands
   */
  async updateFavoriteBrands(userId: string, brands: string[]): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, userId);
      await updateDoc(storyRef, {
        favoriteBrands: brands,
        updatedAt: serverTimestamp()
      });
      serviceLogger.info(`Favorite brands updated for user: ${userId}`);
    } catch (error) {
      serviceLogger.error('Error updating favorite brands:', error);
      throw error;
    }
  }

  /**
   * Update specialties
   */
  async updateSpecialties(userId: string, specialties: string[]): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, userId);
      await updateDoc(storyRef, {
        specialties,
        updatedAt: serverTimestamp()
      });
      serviceLogger.info(`Specialties updated for user: ${userId}`);
    } catch (error) {
      serviceLogger.error('Error updating specialties:', error);
      throw error;
    }
  }
}

export const carStoryService = CarStoryService.getInstance();

