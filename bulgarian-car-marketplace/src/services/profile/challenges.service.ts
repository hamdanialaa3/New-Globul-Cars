/**
 * Monthly Challenges Service
 * Manages monthly challenges and user progress
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import type {
  MonthlyChallenge,
  UserChallengeProgress,
  ChallengeType
} from '../../types/profile-enhancements.types';

export class ChallengesService {
  private static instance: ChallengesService;
  private readonly challengesCollection = 'monthlyChallenges';
  private readonly progressCollection = 'userChallengeProgress';

  private constructor() {}

  public static getInstance(): ChallengesService {
    if (!ChallengesService.instance) {
      ChallengesService.instance = new ChallengesService();
    }
    return ChallengesService.instance;
  }

  /**
   * Get active challenges for current month
   */
  async getActiveChallenges(): Promise<MonthlyChallenge[]> {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const q = query(
        collection(db, this.challengesCollection),
        where('month', '==', currentMonth),
        where('year', '==', currentYear),
        where('isActive', '==', true),
        orderBy('startDate', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MonthlyChallenge));
    } catch (error) {
      serviceLogger.error('Error getting active challenges:', error);
      return [];
    }
  }

  /**
   * Get user's challenge progress
   */
  async getUserProgress(
    userId: string,
    challengeId?: string
  ): Promise<UserChallengeProgress[]> {
    try {
      if (!userId) return [];

      let q = query(
        collection(db, this.progressCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (challengeId) {
        q = query(q, where('challengeId', '==', challengeId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserChallengeProgress));
    } catch (error) {
      serviceLogger.error('Error getting user progress:', error);
      return [];
    }
  }

  /**
   * Get or create user progress for a challenge
   */
  async getOrCreateProgress(
    userId: string,
    challengeId: string
  ): Promise<UserChallengeProgress> {
    try {
      if (!userId || !challengeId) {
        throw new Error('Invalid userId or challengeId');
      }

      const progressList = await this.getUserProgress(userId, challengeId);
      if (progressList.length > 0) {
        return progressList[0];
      }

      // Create new progress
      const progressRef = doc(collection(db, this.progressCollection));
      const progress: UserChallengeProgress = {
        id: progressRef.id,
        userId,
        challengeId,
        currentProgress: 0,
        isCompleted: false,
        claimedReward: false,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      };

      await setDoc(progressRef, progress);
      return progress;
    } catch (error) {
      serviceLogger.error('Error getting or creating progress:', error);
      throw error;
    }
  }

  /**
   * Update challenge progress
   */
  async updateProgress(
    userId: string,
    challengeId: string,
    increment: number = 1
  ): Promise<{ progress: UserChallengeProgress; completed: boolean }> {
    try {
      const progress = await this.getOrCreateProgress(userId, challengeId);
      const challenge = await this.getChallenge(challengeId);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      const newProgress = progress.currentProgress + increment;
      const isCompleted = newProgress >= challenge.target && !progress.isCompleted;

      const progressRef = doc(db, this.progressCollection, progress.id);
      await updateDoc(progressRef, {
        currentProgress: Math.min(newProgress, challenge.target),
        isCompleted: isCompleted || progress.isCompleted,
        completedAt: isCompleted ? serverTimestamp() : progress.completedAt,
        updatedAt: serverTimestamp()
      });

      const updatedProgress: UserChallengeProgress = {
        ...progress,
        currentProgress: Math.min(newProgress, challenge.target),
        isCompleted: isCompleted || progress.isCompleted,
        completedAt: isCompleted ? (serverTimestamp() as any) : progress.completedAt
      };

      return {
        progress: updatedProgress,
        completed: isCompleted
      };
    } catch (error) {
      serviceLogger.error('Error updating progress:', error);
      throw error;
    }
  }

  /**
   * Claim challenge reward
   */
  async claimReward(userId: string, challengeId: string): Promise<void> {
    try {
      const progressList = await this.getUserProgress(userId, challengeId);
      if (progressList.length === 0) {
        throw new Error('Progress not found');
      }

      const progress = progressList[0];
      if (!progress.isCompleted) {
        throw new Error('Challenge not completed');
      }

      if (progress.claimedReward) {
        throw new Error('Reward already claimed');
      }

      const progressRef = doc(db, this.progressCollection, progress.id);
      await updateDoc(progressRef, {
        claimedReward: true,
        updatedAt: serverTimestamp()
      });

      // Award points if reward includes points
      const challenge = await this.getChallenge(challengeId);
      if (challenge?.reward.points) {
        const { pointsAutomationService } = await import('./points-automation.service');
        // Note: This would need a new activity type for challenge rewards
        // For now, we'll just log it
        serviceLogger.info(`Reward claimed: ${challenge.reward.points} points for challenge ${challengeId}`);
      }
    } catch (error) {
      serviceLogger.error('Error claiming reward:', error);
      throw error;
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(challengeId: string): Promise<MonthlyChallenge | null> {
    try {
      if (!challengeId) return null;

      const challengeRef = doc(db, this.challengesCollection, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        return null;
      }

      return {
        id: challengeSnap.id,
        ...challengeSnap.data()
      } as MonthlyChallenge;
    } catch (error) {
      serviceLogger.error('Error getting challenge:', error);
      return null;
    }
  }

  /**
   * Get user's active challenges with progress
   */
  async getUserActiveChallenges(userId: string): Promise<
    Array<{
      challenge: MonthlyChallenge;
      progress: UserChallengeProgress | null;
    }>
  > {
    try {
      const activeChallenges = await this.getActiveChallenges();
      const userProgress = await this.getUserProgress(userId);

      return activeChallenges.map(challenge => {
        const progress = userProgress.find(p => p.challengeId === challenge.id) || null;
        return {
          challenge,
          progress
        };
      });
    } catch (error) {
      serviceLogger.error('Error getting user active challenges:', error);
      return [];
    }
  }
}

export const challengesService = ChallengesService.getInstance();

