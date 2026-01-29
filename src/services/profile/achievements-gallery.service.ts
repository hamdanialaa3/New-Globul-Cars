/**
 * Achievements Gallery Service
 * Manages user achievements and certificates
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
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import type {
  Achievement,
  AchievementBadge,
  AchievementCertificate
} from '../../types/profile-enhancements.types';

export class AchievementsGalleryService {
  private static instance: AchievementsGalleryService;
  private readonly achievementsCollection = 'achievements';
  private readonly certificatesCollection = 'achievementCertificates';
  private readonly storagePath = 'achievement-certificates';

  private constructor() {}

  public static getInstance(): AchievementsGalleryService {
    if (!AchievementsGalleryService.instance) {
      AchievementsGalleryService.instance = new AchievementsGalleryService();
    }
    return AchievementsGalleryService.instance;
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      if (!userId) return [];

      const q = query(
        collection(db, this.achievementsCollection),
        where('userId', '==', userId),
        orderBy('unlockedAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Achievement));
    } catch (error) {
      serviceLogger.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get public achievements for display
   */
  async getPublicAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievements = await this.getUserAchievements(userId);
      return achievements.filter(a => a.isPublic);
    } catch (error) {
      serviceLogger.error('Error getting public achievements:', error);
      return [];
    }
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(
    userId: string,
    achievementType: Achievement['type'],
    achievementData: {
      title: string;
      description: string;
      icon: string;
    }
  ): Promise<string> {
    try {
      if (!userId) {
        throw new Error('Invalid userId');
      }

      // Check if already unlocked
      const existing = await this.getUserAchievements(userId);
      if (existing.some(a => a.type === achievementType)) {
        return existing.find(a => a.type === achievementType)!.id;
      }

      const achievementRef = doc(collection(db, this.achievementsCollection));
      const achievement: Achievement = {
        id: achievementRef.id,
        userId,
        type: achievementType,
        title: achievementData.title,
        description: achievementData.description,
        icon: achievementData.icon,
        unlockedAt: serverTimestamp() as any,
        isPublic: true
      };

      await setDoc(achievementRef, achievement);
      serviceLogger.info(`Achievement unlocked: ${achievementType} for user ${userId}`);
      return achievementRef.id;
    } catch (error) {
      serviceLogger.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Get achievement badges (formatted for display)
   */
  async getAchievementBadges(userId: string): Promise<AchievementBadge[]> {
    try {
      const achievements = await this.getUserAchievements(userId);
      
      const badgeConfig: Record<Achievement['type'], {
        title: string;
        titleEN: string;
        description: string;
        descriptionEN: string;
        color: string;
        rarity: AchievementBadge['rarity'];
      }> = {
        first_sale: {
          title: 'Първа продажба',
          titleEN: 'First Sale',
          description: 'Направи първата си продажба',
          descriptionEN: 'Made your first sale',
          color: '#fbbf24',
          rarity: 'common'
        },
        first_listing: {
          title: 'Първа обява',
          titleEN: 'First Listing',
          description: 'Създай първата си обява',
          descriptionEN: 'Created your first listing',
          color: '#3b82f6',
          rarity: 'common'
        },
        hundred_listings: {
          title: '100 обяви',
          titleEN: '100 Listings',
          description: 'Създай 100 обяви',
          descriptionEN: 'Created 100 listings',
          color: '#8b5cf6',
          rarity: 'rare'
        },
        verified_seller: {
          title: 'Проверен продавач',
          titleEN: 'Verified Seller',
          description: 'Верифицирай профила си',
          descriptionEN: 'Verified your profile',
          color: '#22c55e',
          rarity: 'epic'
        },
        top_seller: {
          title: 'Топ продавач',
          titleEN: 'Top Seller',
          description: 'Бъди в топ 10 продавачи',
          descriptionEN: 'Be in top 10 sellers',
          color: '#ef4444',
          rarity: 'legendary'
        },
        community_contributor: {
          title: 'Принос към общността',
          titleEN: 'Community Contributor',
          description: 'Активен член на общността',
          descriptionEN: 'Active community member',
          color: '#06b6d4',
          rarity: 'rare'
        },
        early_adopter: {
          title: 'Ранен последовател',
          titleEN: 'Early Adopter',
          description: 'Присъедини се в ранните дни',
          descriptionEN: 'Joined in early days',
          color: '#f59e0b',
          rarity: 'epic'
        }
      };

      return achievements.map(achievement => {
        const config = badgeConfig[achievement.type];
        return {
          id: achievement.id,
          type: achievement.type,
          title: config?.title || achievement.title,
          titleEN: config?.titleEN || achievement.title,
          description: config?.description || achievement.description,
          descriptionEN: config?.descriptionEN || achievement.description,
          icon: achievement.icon,
          color: config?.color || '#64748b',
          rarity: config?.rarity || 'common',
          unlockedAt: achievement.unlockedAt,
          isPublic: achievement.isPublic
        } as AchievementBadge;
      });
    } catch (error) {
      serviceLogger.error('Error getting achievement badges:', error);
      return [];
    }
  }

  /**
   * Upload certificate
   */
  async uploadCertificate(
    userId: string,
    achievementType: Achievement['type'],
    certificateFile: File
  ): Promise<string> {
    try {
      const certificateRef = ref(
        storage,
        `${this.storagePath}/${userId}/${achievementType}_${Date.now()}.pdf`
      );
      await uploadBytes(certificateRef, certificateFile);
      return await getDownloadURL(certificateRef);
    } catch (error) {
      serviceLogger.error('Error uploading certificate:', error);
      throw error;
    }
  }

  /**
   * Create certificate
   */
  async createCertificate(
    userId: string,
    achievementType: Achievement['type'],
    certificateUrl: string,
    expiresAt?: Date
  ): Promise<string> {
    try {
      const certificateRef = doc(collection(db, this.certificatesCollection));
      const certificate: AchievementCertificate = {
        id: certificateRef.id,
        userId,
        achievementType,
        certificateUrl,
        issuedAt: serverTimestamp() as any,
        expiresAt: expiresAt ? (serverTimestamp() as any) : undefined,
        isVerified: false
      };

      await setDoc(certificateRef, certificate);
      return certificateRef.id;
    } catch (error) {
      serviceLogger.error('Error creating certificate:', error);
      throw error;
    }
  }

  /**
   * Get user certificates
   */
  async getUserCertificates(userId: string): Promise<AchievementCertificate[]> {
    try {
      if (!userId) return [];

      const q = query(
        collection(db, this.certificatesCollection),
        where('userId', '==', userId),
        orderBy('issuedAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as AchievementCertificate));
    } catch (error) {
      serviceLogger.error('Error getting certificates:', error);
      return [];
    }
  }

  /**
   * Update achievement visibility
   */
  async updateVisibility(achievementId: string, isPublic: boolean): Promise<void> {
    try {
      const achievementRef = doc(db, this.achievementsCollection, achievementId);
      await updateDoc(achievementRef, {
        isPublic,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error updating visibility:', error);
      throw error;
    }
  }
}

export const achievementsGalleryService = AchievementsGalleryService.getInstance();

