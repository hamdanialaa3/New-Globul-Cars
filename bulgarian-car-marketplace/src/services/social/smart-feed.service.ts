/**
 * Smart Feed Service
 * Aggregates and ranks content from multiple sources for social feed
 * 
 * Content Sources:
 * - Posts (regular posts)
 * - Intro Videos (from profile enhancements)
 * - Success Stories (from profile enhancements)
 * - Achievements (from profile enhancements)
 * - Challenges (from profile enhancements)
 * - News/Articles (if exists)
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import { introVideoService } from '../profile/intro-video.service';
import { successStoriesService } from '../profile/success-stories.service';
import { achievementsGalleryService } from '../profile/achievements-gallery.service';
import { challengesService } from '../profile/challenges.service';
import type {
  IntroVideo,
  SuccessStory,
  Achievement
} from '../../types/profile-enhancements.types';

export type FeedItemType = 
  | 'post'
  | 'intro_video'
  | 'success_story'
  | 'achievement'
  | 'challenge'
  | 'news';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  userId: string;
  authorInfo: {
    displayName: string;
    profileImage?: string;
    profileType: string;
    isVerified: boolean;
  };
  content: {
    text?: string;
    media?: {
      type: string;
      urls: string[];
    };
    videoUrl?: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  metadata?: {
    points?: number;
    level?: string;
    rarity?: string;
    challengeType?: string;
    saleValue?: number;
  };
  createdAt: Timestamp | Date;
  score: number; // Smart ranking score
}

export class SmartFeedService {
  private static instance: SmartFeedService;

  private constructor() {}

  public static getInstance(): SmartFeedService {
    if (!SmartFeedService.instance) {
      SmartFeedService.instance = new SmartFeedService();
    }
    return SmartFeedService.instance;
  }

  /**
   * Get smart feed with all content types
   */
  async getSmartFeed(
    options: {
      limitCount?: number;
      userId?: string; // For personalized feed
    } = {}
  ): Promise<FeedItem[]> {
    try {
      const { limitCount = 50, userId } = options;

      // Fetch all content types in parallel
      const [
        posts,
        introVideos,
        successStories,
        achievements,
        challenges
      ] = await Promise.all([
        this.getPosts(limitCount),
        this.getIntroVideos(limitCount),
        this.getSuccessStories(limitCount),
        this.getAchievements(limitCount),
        this.getChallenges(limitCount)
      ]);

      // Combine all items
      const allItems: FeedItem[] = [
        ...posts,
        ...introVideos,
        ...successStories,
        ...achievements,
        ...challenges
      ];

      // Calculate smart scores
      const scoredItems = allItems.map(item => ({
        ...item,
        score: this.calculateSmartScore(item)
      }));

      // Sort by score (highest first)
      scoredItems.sort((a, b) => b.score - a.score);

      // Return limited results
      return scoredItems.slice(0, limitCount);
    } catch (error) {
      serviceLogger.error('Error getting smart feed:', error);
      return [];
    }
  }

  /**
   * Calculate smart ranking score
   * Factors:
   * - Recency (time decay)
   * - Engagement (likes, comments, shares)
   * - Views
   * - Content type priority
   * - User reputation (points, level, verified)
   */
  private calculateSmartScore(item: FeedItem): number {
    const now = Date.now();
    const createdAt = item.createdAt instanceof Timestamp 
      ? item.createdAt.toMillis() 
      : new Date(item.createdAt).getTime();
    
    const ageInHours = (now - createdAt) / (1000 * 60 * 60);
    
    // Recency score (decays over time)
    const recencyScore = Math.max(0, 100 - (ageInHours * 2)); // Decay 2 points per hour
    
    // Engagement score
    const engagementScore = 
      (item.engagement.likes * 2) +
      (item.engagement.comments * 3) +
      (item.engagement.shares * 4) +
      (item.engagement.views * 0.1);
    
    // Content type priority
    const typeMultiplier: Record<FeedItemType, number> = {
      'post': 1.0,
      'intro_video': 1.5, // Videos get higher priority
      'success_story': 1.3,
      'achievement': 1.2,
      'challenge': 1.1,
      'news': 1.4
    };
    
    // User reputation boost
    let reputationBoost = 1.0;
    if (item.authorInfo.isVerified) reputationBoost += 0.2;
    if (item.metadata?.points) {
      reputationBoost += Math.min(0.3, item.metadata.points / 10000);
    }
    if (item.metadata?.level === 'expert' || item.metadata?.level === 'maestro') {
      reputationBoost += 0.15;
    }
    
    // Rarity boost for achievements
    if (item.metadata?.rarity) {
      const rarityMultiplier: Record<string, number> = {
        'common': 1.0,
        'rare': 1.2,
        'epic': 1.5,
        'legendary': 2.0
      };
      reputationBoost *= rarityMultiplier[item.metadata.rarity] || 1.0;
    }
    
    // Final score
    const baseScore = recencyScore + (engagementScore * 0.5);
    const finalScore = baseScore * typeMultiplier[item.type] * reputationBoost;
    
    return Math.round(finalScore * 100) / 100; // Round to 2 decimals
  }

  /**
   * Get regular posts
   */
  private async getPosts(limitCount: number): Promise<FeedItem[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'post' as FeedItemType,
          userId: data.authorId || '',
          authorInfo: data.authorInfo || {
            displayName: 'Unknown',
            profileType: 'private',
            isVerified: false
          },
          content: {
            text: data.content?.text || '',
            media: data.content?.media
          },
          engagement: data.engagement || {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0
          },
          createdAt: data.createdAt || Timestamp.now(),
          score: 0
        } as FeedItem;
      });
    } catch (error) {
      serviceLogger.error('Error getting posts:', error);
      return [];
    }
  }

  /**
   * Get intro videos
   */
  private async getIntroVideos(limitCount: number): Promise<FeedItem[]> {
    try {
      // Get all users and their videos
      const usersQuery = query(
        collection(db, 'users'),
        limit(limitCount * 2) // Get more users to filter
      );

      const usersSnapshot = await getDocs(usersQuery);
      const videos: FeedItem[] = [];

      for (const userDoc of usersSnapshot.docs) {
        if (videos.length >= limitCount) break;

        const userId = userDoc.id;
        const userData = userDoc.data();
        const video = await introVideoService.getVideo(userId);

        if (video && video.isPublic) {
          videos.push({
            id: video.userId,
            type: 'intro_video' as FeedItemType,
            userId: video.userId,
            authorInfo: {
              displayName: userData.displayName || 'Unknown',
              profileImage: userData.photoURL,
              profileType: userData.profileType || 'private',
              isVerified: userData.isVerified || false
            },
            content: {
              videoUrl: video.videoUrl,
              thumbnailUrl: video.thumbnailUrl,
              text: `${userData.displayName || 'User'}'s introduction video`
            },
            engagement: {
              likes: 0,
              comments: 0,
              shares: 0,
              views: video.views || 0
            },
            createdAt: video.uploadedAt || Timestamp.now(),
            score: 0
          } as FeedItem);
        }
      }

      return videos;
    } catch (error) {
      serviceLogger.error('Error getting intro videos:', error);
      return [];
    }
  }

  /**
   * Get success stories
   */
  private async getSuccessStories(limitCount: number): Promise<FeedItem[]> {
    try {
      // Get public stories using query
      const storiesQuery = query(
        collection(db, 'successStories'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(storiesQuery);
      return snapshot.docs.map(doc => {
        const story = doc.data();
        return {
          id: doc.id,
          type: 'success_story' as FeedItemType,
          userId: story.userId || '',
          authorInfo: {
            displayName: 'User', // Will be enriched later
            profileType: 'private',
            isVerified: false
          },
          content: {
            title: story.title || '',
            description: story.description || '',
            text: story.description || ''
          },
          engagement: {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0
          },
          metadata: {
            saleValue: story.value
          },
          createdAt: story.date || story.createdAt || Timestamp.now(),
          score: 0
        } as FeedItem;
      });
    } catch (error) {
      serviceLogger.error('Error getting success stories:', error);
      return [];
    }
  }

  /**
   * Get achievements
   */
  private async getAchievements(limitCount: number): Promise<FeedItem[]> {
    try {
      const achievementsQuery = query(
        collection(db, 'achievements'),
        where('isPublic', '==', true),
        orderBy('unlockedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(achievementsQuery);
      const achievements: FeedItem[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data() as Achievement;
        const badges = await achievementsGalleryService.getAchievementBadges(data.userId);
        const badge = badges.find(b => b.id === data.id);

        if (badge) {
          achievements.push({
            id: data.id,
            type: 'achievement' as FeedItemType,
            userId: data.userId,
            authorInfo: {
              displayName: 'User', // Will be enriched
              profileType: 'private',
              isVerified: false
            },
            content: {
              title: badge.title,
              description: badge.description,
              text: `${badge.title}: ${badge.description}`
            },
            engagement: {
              likes: 0,
              comments: 0,
              shares: 0,
              views: 0
            },
            metadata: {
              rarity: badge.rarity
            },
            createdAt: data.unlockedAt || Timestamp.now(),
            score: 0
          } as FeedItem);
        }
      }

      return achievements;
    } catch (error) {
      serviceLogger.error('Error getting achievements:', error);
      return [];
    }
  }

  /**
   * Get challenges
   */
  private async getChallenges(limitCount: number): Promise<FeedItem[]> {
    try {
      const activeChallenges = await challengesService.getActiveChallenges();
      
      return activeChallenges.slice(0, limitCount).map(challenge => ({
        id: challenge.id,
        type: 'challenge' as FeedItemType,
        userId: 'system', // System-generated
        authorInfo: {
          displayName: 'Monthly Challenge',
          profileType: 'system',
          isVerified: true
        },
        content: {
          title: challenge.title,
          description: challenge.description,
          text: challenge.description
        },
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0
        },
        metadata: {
          challengeType: challenge.type,
          points: challenge.reward.points
        },
        createdAt: challenge.startDate || Timestamp.now(),
        score: 0
      } as FeedItem));
    } catch (error) {
      serviceLogger.error('Error getting challenges:', error);
      return [];
    }
  }

  /**
   * Enrich feed items with user data
   */
  async enrichFeedItems(items: FeedItem[]): Promise<FeedItem[]> {
    try {
      const userIds = [...new Set(items.map(item => item.userId))];
      const userDataMap = new Map<string, any>();

      // Fetch user data using doc()
      for (const userId of userIds) {
        if (userId === 'system') continue;
        
        try {
          const userDocRef = doc(db, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            userDataMap.set(userId, userDocSnap.data());
          }
        } catch (error) {
          // Skip if user not found
        }
      }

      // Enrich items
      return items.map(item => {
        if (item.userId === 'system') return item;
        
        const userData = userDataMap.get(item.userId);
        if (userData) {
          return {
            ...item,
            authorInfo: {
              displayName: userData.displayName || item.authorInfo.displayName,
              profileImage: userData.photoURL || item.authorInfo.profileImage,
              profileType: userData.profileType || item.authorInfo.profileType,
              isVerified: userData.isVerified || item.authorInfo.isVerified
            }
          };
        }
        return item;
      });
    } catch (error) {
      serviceLogger.error('Error enriching feed items:', error);
      return items;
    }
  }
}

export const smartFeedService = SmartFeedService.getInstance();

