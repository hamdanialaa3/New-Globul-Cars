/**
 * Points & Levels Service
 * Manages user points, levels, and achievements
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import type {
  UserPoints,
  UserLevel,
  PointsActivity,
  LevelConfig
} from '../../types/profile-enhancements.types';

// Level configurations
const LEVEL_CONFIGS: Record<UserLevel, LevelConfig> = {
  beginner: {
    level: 'beginner',
    minPoints: 0,
    maxPoints: 100,
    labelBG: 'Начинаещ',
    labelEN: 'Beginner',
    badgeColor: '#94a3b8',
    benefits: []
  },
  intermediate: {
    level: 'intermediate',
    minPoints: 100,
    maxPoints: 500,
    labelBG: 'Среден',
    labelEN: 'Intermediate',
    badgeColor: '#3b82f6',
    benefits: []
  },
  advanced: {
    level: 'advanced',
    minPoints: 500,
    maxPoints: 1500,
    labelBG: 'Напреднал',
    labelEN: 'Advanced',
    badgeColor: '#8b5cf6',
    benefits: []
  },
  expert: {
    level: 'expert',
    minPoints: 1500,
    maxPoints: 5000,
    labelBG: 'Експерт',
    labelEN: 'Expert',
    badgeColor: '#f59e0b',
    benefits: []
  },
  maestro: {
    level: 'maestro',
    minPoints: 5000,
    maxPoints: Infinity,
    labelBG: 'Маестро',
    labelEN: 'Maestro',
    badgeColor: '#ef4444',
    benefits: []
  }
};

// Points for each activity type
const ACTIVITY_POINTS: Record<string, number> = {
  listing_created: 10,
  listing_sold: 50,
  positive_review: 20,
  profile_completed: 15,
  verification_completed: 25,
  first_sale: 100,
  milestone_100_listings: 200,
  daily_login: 5,
  referral: 30,
  social_share: 10
};

export class PointsLevelsService {
  private static instance: PointsLevelsService;
  private readonly collectionName = 'userPoints';

  private constructor() {}

  public static getInstance(): PointsLevelsService {
    if (!PointsLevelsService.instance) {
      PointsLevelsService.instance = new PointsLevelsService();
    }
    return PointsLevelsService.instance;
  }

  /**
   * Initialize user points (if not exists)
   */
  async initializeUserPoints(userId: string): Promise<UserPoints> {
    try {
      const pointsRef = doc(db, this.collectionName, userId);
      const pointsSnap = await getDoc(pointsRef);

      if (pointsSnap.exists()) {
        return pointsSnap.data() as UserPoints;
      }

      const defaultPoints: UserPoints = {
        userId,
        totalPoints: 0,
        currentLevel: 'beginner',
        pointsToNextLevel: 100,
        activities: [],
        updatedAt: serverTimestamp() as any
      };

      await setDoc(pointsRef, defaultPoints);
      return defaultPoints;
    } catch (error) {
      serviceLogger.error('Error initializing user points:', error);
      throw error;
    }
  }

  /**
   * Get user points
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        return null;
      }

      const pointsRef = doc(db, this.collectionName, userId);
      const pointsSnap = await getDoc(pointsRef);

      if (!pointsSnap.exists()) {
        return await this.initializeUserPoints(userId);
      }

      const data = pointsSnap.data();
      if (!data) {
        return null;
      }

      return data as UserPoints;
    } catch (error) {
      serviceLogger.error('Error getting user points:', error);
      // Return null instead of throwing to prevent UI crashes
      return null;
    }
  }

  /**
   * Calculate level based on points
   */
  private calculateLevel(totalPoints: number): UserLevel {
    if (totalPoints >= 5000) return 'maestro';
    if (totalPoints >= 1500) return 'expert';
    if (totalPoints >= 500) return 'advanced';
    if (totalPoints >= 100) return 'intermediate';
    return 'beginner';
  }

  /**
   * Calculate points to next level
   */
  private calculatePointsToNextLevel(totalPoints: number, level: UserLevel): number {
    const config = LEVEL_CONFIGS[level];
    if (config.maxPoints === Infinity) {
      return 0; // Max level reached
    }
    return Math.max(0, config.maxPoints - totalPoints);
  }

  /**
   * Add points for an activity
   */
  async addPoints(
    userId: string,
    activityType: PointsActivity['activityType'],
    description?: string
  ): Promise<{ newPoints: number; newLevel: UserLevel; leveledUp: boolean }> {
    try {
      const points = ACTIVITY_POINTS[activityType];
      if (!points) {
        throw new Error(`Unknown activity type: ${activityType}`);
      }

      // Get current points
      const currentPoints = await this.getUserPoints(userId);
      if (!currentPoints) {
        throw new Error('User points not initialized');
      }

      const oldLevel = currentPoints.currentLevel;
      const newTotalPoints = currentPoints.totalPoints + points;
      const newLevel = this.calculateLevel(newTotalPoints);
      const pointsToNextLevel = this.calculatePointsToNextLevel(newTotalPoints, newLevel);
      const leveledUp = oldLevel !== newLevel;

      // Create activity record
      const activity: PointsActivity = {
        id: `${Date.now()}-${Math.random()}`,
        userId,
        activityType,
        points,
        description: description || this.getActivityDescription(activityType),
        createdAt: serverTimestamp() as any
      };

      // Update points
      const pointsRef = doc(db, this.collectionName, userId);
      await updateDoc(pointsRef, {
        totalPoints: newTotalPoints,
        currentLevel: newLevel,
        pointsToNextLevel,
        activities: arrayUnion(activity),
        lastActivityAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      serviceLogger.info(
        `Points added: ${points} for ${activityType} to user ${userId}. Total: ${newTotalPoints}, Level: ${newLevel}`
      );

      if (leveledUp) {
        serviceLogger.info(`User ${userId} leveled up from ${oldLevel} to ${newLevel}`);
      }

      return {
        newPoints: newTotalPoints,
        newLevel,
        leveledUp
      };
    } catch (error) {
      serviceLogger.error('Error adding points:', error);
      throw error;
    }
  }

  /**
   * Get activity description
   */
  private getActivityDescription(activityType: string): string {
    const descriptions: Record<string, { bg: string; en: string }> = {
      listing_created: { bg: 'Създадена обява', en: 'Listing Created' },
      listing_sold: { bg: 'Продадена кола', en: 'Car Sold' },
      positive_review: { bg: 'Положителна рецензия', en: 'Positive Review' },
      profile_completed: { bg: 'Завършен профил', en: 'Profile Completed' },
      verification_completed: { bg: 'Завършена верификация', en: 'Verification Completed' },
      first_sale: { bg: 'Първа продажба', en: 'First Sale' },
      milestone_100_listings: { bg: '100 обяви', en: '100 Listings' },
      daily_login: { bg: 'Дневен вход', en: 'Daily Login' },
      referral: { bg: 'Препоръка', en: 'Referral' },
      social_share: { bg: 'Споделяне', en: 'Social Share' }
    };

    const desc = descriptions[activityType];
    return desc ? desc.en : 'Activity';
  }

  /**
   * Get level configuration
   */
  getLevelConfig(level: UserLevel): LevelConfig {
    return LEVEL_CONFIGS[level];
  }

  /**
   * Get all level configurations
   */
  getAllLevelConfigs(): LevelConfig[] {
    return Object.values(LEVEL_CONFIGS);
  }

  /**
   * Get points for activity type
   */
  getActivityPoints(activityType: string): number {
    return ACTIVITY_POINTS[activityType] || 0;
  }
}

export const pointsLevelsService = PointsLevelsService.getInstance();

