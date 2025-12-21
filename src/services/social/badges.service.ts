/**
 * Badges Service - Gamification and achievement system
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== BADGE DEFINITIONS ====================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'selling' | 'buying' | 'community' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  reward: {
    points: number;
    features?: string[];
  };
}

export const BADGE_DEFINITIONS: Badge[] = [
  // SOCIAL BADGES
  {
    id: 'first_post',
    name: 'First Steps',
    description: 'Create your first post',
    icon: '📝',
    category: 'social',
    tier: 'bronze',
    requirement: 1,
    reward: { points: 10 }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Reach 100 followers',
    icon: '🦋',
    category: 'social',
    tier: 'gold',
    requirement: 100,
    reward: { points: 100 }
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Reach 1000 followers',
    icon: '⭐',
    category: 'social',
    tier: 'platinum',
    requirement: 1000,
    reward: { points: 500, features: ['verified_badge'] }
  },
  
  // SELLING BADGES
  {
    id: 'first_listing',
    name: 'First Sale',
    description: 'Create your first car listing',
    icon: '🚗',
    category: 'selling',
    tier: 'bronze',
    requirement: 1,
    reward: { points: 20 }
  },
  {
    id: 'trusted_seller',
    name: 'Trusted Seller',
    description: 'Complete 10 sales',
    icon: '🏆',
    category: 'selling',
    tier: 'gold',
    requirement: 10,
    reward: { points: 200 }
  },
  {
    id: 'mega_dealer',
    name: 'Mega Dealer',
    description: 'Complete 100 sales',
    icon: '💎',
    category: 'selling',
    tier: 'platinum',
    requirement: 100,
    reward: { points: 1000, features: ['priority_listings'] }
  },
  
  // COMMUNITY BADGES
  {
    id: 'helpful_hand',
    name: 'Helpful Hand',
    description: 'Get 50 likes on your comments',
    icon: '🤝',
    category: 'community',
    tier: 'silver',
    requirement: 50,
    reward: { points: 50 }
  },
  {
    id: 'expert_advisor',
    name: 'Expert Advisor',
    description: 'Provide 20 consultations',
    icon: '🎓',
    category: 'community',
    tier: 'gold',
    requirement: 20,
    reward: { points: 150 }
  },
  {
    id: 'event_organizer',
    name: 'Event Organizer',
    description: 'Organize 5 successful events',
    icon: '🎪',
    category: 'community',
    tier: 'gold',
    requirement: 5,
    reward: { points: 200 }
  },
  
  // SPECIAL BADGES
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join during beta phase',
    icon: '🚀',
    category: 'special',
    tier: 'platinum',
    requirement: 1,
    reward: { points: 500 }
  },
  {
    id: 'verified_pro',
    name: 'Verified Professional',
    description: 'Complete identity verification',
    icon: '✓',
    category: 'special',
    tier: 'gold',
    requirement: 1,
    reward: { points: 100, features: ['verified_badge'] }
  },
  {
    id: 'car_enthusiast',
    name: 'Car Enthusiast',
    description: 'View 500 car listings',
    icon: '❤️',
    category: 'special',
    tier: 'silver',
    requirement: 500,
    reward: { points: 75 }
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Create 30 stories',
    icon: '📸',
    category: 'social',
    tier: 'silver',
    requirement: 30,
    reward: { points: 60 }
  },
  {
    id: 'chat_master',
    name: 'Chat Master',
    description: 'Send 1000 messages',
    icon: '💬',
    category: 'social',
    tier: 'gold',
    requirement: 1000,
    reward: { points: 150 }
  },
  {
    id: 'perfect_rating',
    name: 'Perfect Rating',
    description: 'Maintain 5.0 rating with 20+ reviews',
    icon: '⭐',
    category: 'selling',
    tier: 'platinum',
    requirement: 20,
    reward: { points: 300, features: ['priority_support'] }
  }
];

// ==================== INTERFACES ====================

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  unlockedAt: Date;
  progress?: number;
}

export interface UserProgression {
  userId: string;
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  badges: UserBadge[];
  achievements: string[];
  rank: string;
}

// ==================== SERVICE CLASS ====================

class BadgesService {
  /**
   * Check and award badges to user based on their activity
   */
  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];
      
      const userData = userDoc.data();
      const stats = userData.stats || {};
      
      const existingBadges = await this.getUserBadges(userId);
      const existingBadgeIds = existingBadges.map(b => b.badgeId);
      
      const newBadges: UserBadge[] = [];
      
      for (const badge of BADGE_DEFINITIONS) {
        if (existingBadgeIds.includes(badge.id)) continue;
        
        if (this.checkBadgeRequirement(badge, stats, userData)) {
          const awardedBadge = await this.awardBadge(userId, badge);
          if (awardedBadge) {
            newBadges.push(awardedBadge);
          }
        }
      }
      
      return newBadges;
    } catch (error) {
      logger.error('[BADGES] Error checking badges:', error);
      return [];
    }
  }

  /**
   * Get all badges for a user
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const badgesSnapshot = await getDocs(
        query(
          collection(db, 'userBadges'),
          where('userId', '==', userId)
        )
      );
      
      return badgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        unlockedAt: doc.data().unlockedAt.toDate()
      } as UserBadge));
    } catch (error) {
      logger.error('[BADGES] Error getting user badges:', error);
      return [];
    }
  }

  /**
   * Get user progression and level
   */
  async getUserProgression(userId: string): Promise<UserProgression> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const totalPoints = userData.gamification?.totalPoints || 0;
      
      const level = this.calculateLevel(totalPoints);
      const pointsToNextLevel = this.getPointsToNextLevel(level, totalPoints);
      
      const badges = await this.getUserBadges(userId);
      const achievements = userData.gamification?.achievements || [];
      const rank = this.calculateRank(totalPoints, badges.length);
      
      return {
        userId,
        level,
        totalPoints,
        pointsToNextLevel,
        badges,
        achievements,
        rank
      };
    } catch (error) {
      logger.error('Error getting user progression', error as Error, { userId });
      throw error;
    }
  }

  // ==================== PRIVATE HELPERS ====================

  private checkBadgeRequirement(badge: Badge, stats: any, userData: any): boolean {
    switch (badge.id) {
      case 'first_post':
        return (stats.posts || 0) >= 1;
      case 'social_butterfly':
        return (stats.followers || 0) >= 100;
      case 'influencer':
        return (stats.followers || 0) >= 1000;
      case 'first_listing':
        return (stats.carListings || 0) >= 1;
      case 'trusted_seller':
        return (stats.carsSold || 0) >= 10;
      case 'mega_dealer':
        return (stats.carsSold || 0) >= 100;
      case 'helpful_hand':
        return (stats.commentLikes || 0) >= 50;
      case 'expert_advisor':
        return (stats.consultations || 0) >= 20;
      case 'event_organizer':
        return (stats.eventsOrganized || 0) >= 5;
      case 'verified_pro':
        return userData.isVerified === true;
      case 'car_enthusiast':
        return (stats.carViews || 0) >= 500;
      case 'storyteller':
        return (stats.stories || 0) >= 30;
      case 'chat_master':
        return (stats.messagesSent || 0) >= 1000;
      case 'perfect_rating':
        return (userData.rating || 0) === 5.0 && (stats.reviews || 0) >= 20;
      default:
        return false;
    }
  }

  private async awardBadge(userId: string, badge: Badge): Promise<UserBadge | null> {
    try {
      const badgeRef = await addDoc(collection(db, 'userBadges'), {
        userId,
        badgeId: badge.id,
        badge,
        unlockedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'users', userId), {
        'gamification.totalPoints': increment(badge.reward.points),
        'gamification.badges': increment(1),
        'lastActivity': serverTimestamp()
      });
      
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'badge_unlocked',
        badge,
        isRead: false,
        createdAt: serverTimestamp()
      });
      
      const badgeDoc = await getDoc(badgeRef);
      return {
        id: badgeDoc.id,
        ...badgeDoc.data(),
        unlockedAt: new Date()
      } as UserBadge;
    } catch (error) {
      logger.error('Error awarding badge', error as Error, { userId, badgeId: badge.id });
      return null;
    }
  }

  private calculateLevel(totalPoints: number): number {
    // Level = sqrt(totalPoints / 100)
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }

  private getPointsToNextLevel(currentLevel: number, currentPoints: number): number {
    const nextLevel = currentLevel + 1;
    const pointsForNextLevel = Math.pow(nextLevel - 1, 2) * 100;
    return pointsForNextLevel - currentPoints;
  }

  private calculateRank(totalPoints: number, badgeCount: number): string {
    const score = totalPoints + (badgeCount * 50);
    
    if (score >= 10000) return '💎 Diamond';
    if (score >= 5000) return '🏆 Platinum';
    if (score >= 2500) return '🥇 Gold';
    if (score >= 1000) return '🥈 Silver';
    if (score >= 500) return '🥉 Bronze';
    return '🌱 Beginner';
  }
}

export const badgesService = new BadgesService();
