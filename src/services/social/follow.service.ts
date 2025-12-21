// src/services/social/follow.service.ts
// Follow System Service
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  updateDoc,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { rateLimiter, RATE_LIMIT_CONFIGS } from '../rate-limiting/rateLimiter.service';

interface FollowData {
  followedAt: Timestamp;
  userId: string;
}

interface FollowStats {
  followers: number;
  following: number;
  mutualFollows: number;
}

class FollowService {
  private static instance: FollowService;
  
  private constructor() {}
  
  static getInstance(): FollowService {
    if (!this.instance) {
      this.instance = new FollowService();
    }
    return this.instance;
  }

  /**
   * Follow a user
   * متابعة مستخدم
   */
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      // Rate limiting check
      const rateLimit = rateLimiter.checkRateLimit(
        followerId,
        'follow',
        RATE_LIMIT_CONFIGS.follow
      );

      if (!rateLimit.allowed) {
        serviceLogger.warn('Rate limit exceeded for follow', {
          followerId,
          followingId,
          resetTime: rateLimit.resetTime
        });
        throw new Error(
          `Rate limit exceeded. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds before following again.`
        );
      }

      // Prevent self-follow
      if (followerId === followingId) {
        serviceLogger.warn('Cannot follow yourself', { followerId });
        return false;
      }

      // Check if already following
      const isFollowing = await this.isFollowing(followerId, followingId);
      if (isFollowing) {
        serviceLogger.warn('Already following this user', { followerId, followingId });
        return false;
      }

      const batch = writeBatch(db);

      // Add to follower's following list
      const followingRef = doc(db, 'users', followerId, 'following', followingId);
      batch.set(followingRef, {
        followedAt: serverTimestamp(),
        userId: followingId
      });

      // Add to following's followers list
      const followerRef = doc(db, 'users', followingId, 'followers', followerId);
      batch.set(followerRef, {
        followedAt: serverTimestamp(),
        userId: followerId
      });

      // Update counters
      batch.update(doc(db, 'users', followerId), {
        'stats.following': increment(1)
      });
      batch.update(doc(db, 'users', followingId), {
        'stats.followers': increment(1)
      });

      await batch.commit();

      // Send notification
      await this.sendFollowNotification(followerId, followingId);

      serviceLogger.info('User followed', { followerId, followingId });

      return true;
    } catch (error) {
      serviceLogger.error('Follow user error', error as Error, { followerId, followingId });
      return false;
    }
  }

  /**
   * Unfollow a user
   * إلغاء متابعة مستخدم
   */
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      // Rate limiting check
      const rateLimit = rateLimiter.checkRateLimit(
        followerId,
        'unfollow',
        RATE_LIMIT_CONFIGS.unfollow
      );

      if (!rateLimit.allowed) {
        serviceLogger.warn('Rate limit exceeded for unfollow', {
          followerId,
          followingId,
          resetTime: rateLimit.resetTime
        });
        throw new Error(
          `Rate limit exceeded. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds before unfollowing again.`
        );
      }

      const batch = writeBatch(db);

      // Remove from follower's following list
      batch.delete(doc(db, 'users', followerId, 'following', followingId));

      // Remove from following's followers list
      batch.delete(doc(db, 'users', followingId, 'followers', followerId));

      // Update counters
      batch.update(doc(db, 'users', followerId), {
        'stats.following': increment(-1)
      });
      batch.update(doc(db, 'users', followingId), {
        'stats.followers': increment(-1)
      });

      await batch.commit();

      serviceLogger.info('User unfollowed', { followerId, followingId });

      return true;
    } catch (error) {
      serviceLogger.error('Unfollow user error', error as Error, { followerId, followingId });
      return false;
    }
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const followDoc = await getDoc(
        doc(db, 'users', followerId, 'following', followingId)
      );
      return followDoc.exists();
    } catch (error) {
      serviceLogger.error('Error checking follow status', error as Error, { followerId, followingId });
      return false;
    }
  }

  /**
   * Get followers list
   */
  async getFollowers(userId: string, limitCount: number = 50): Promise<string[]> {
    try {
      const followersQuery = query(
        collection(db, 'users', userId, 'followers'),
        orderBy('followedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(followersQuery);
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      serviceLogger.error('Error getting followers', error as Error, { userId, limitCount });
      return [];
    }
  }

  /**
   * Get following list
   */
  async getFollowing(userId: string, limitCount: number = 50): Promise<string[]> {
    try {
      const followingQuery = query(
        collection(db, 'users', userId, 'following'),
        orderBy('followedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(followingQuery);
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      serviceLogger.error('Error getting following', error as Error, { userId, limitCount });
      return [];
    }
  }

  /**
   * Get follow statistics
   */
  async getFollowStats(userId: string): Promise<FollowStats> {
    try {
      const [followers, following] = await Promise.all([
        this.getFollowers(userId, 1000),
        this.getFollowing(userId, 1000)
      ]);

      // Calculate mutual follows
      const followersSet = new Set(followers);
      const mutualFollows = following.filter(id => followersSet.has(id)).length;

      return {
        followers: followers.length,
        following: following.length,
        mutualFollows
      };
    } catch (error) {
      serviceLogger.error('Error getting follow stats', error as Error, { userId });
      return {
        followers: 0,
        following: 0,
        mutualFollows: 0
      };
    }
  }

  /**
   * Get mutual followers
   */
  async getMutualFollowers(userId1: string, userId2: string): Promise<string[]> {
    try {
      const [followers1, followers2] = await Promise.all([
        this.getFollowers(userId1, 1000),
        this.getFollowers(userId2, 1000)
      ]);

      const followers1Set = new Set(followers1);
      return followers2.filter(id => followers1Set.has(id));
    } catch (error) {
      serviceLogger.error('Error getting mutual followers', error as Error, { userId1, userId2 });
      return [];
    }
  }

  /**
   * Remove follower (block)
   */
  async removeFollower(userId: string, followerId: string): Promise<boolean> {
    try {
      const batch = writeBatch(db);

      // Remove from user's followers
      batch.delete(doc(db, 'users', userId, 'followers', followerId));

      // Remove from follower's following
      batch.delete(doc(db, 'users', followerId, 'following', userId));

      // Update counters
      batch.update(doc(db, 'users', userId), {
        'stats.followers': increment(-1)
      });
      batch.update(doc(db, 'users', followerId), {
        'stats.following': increment(-1)
      });

      await batch.commit();
      return true;
    } catch (error) {
      serviceLogger.error('Error removing follower', error as Error, { userId, followerId });
      return false;
    }
  }

  /**
   * Send follow notification
   */
  private async sendFollowNotification(followerId: string, followingId: string): Promise<void> {
    try {
      // Get follower info
      const followerDoc = await getDoc(doc(db, 'users', followerId));
      const followerData = followerDoc.data();

      await setDoc(doc(collection(db, 'notifications')), {
        userId: followingId,
        type: 'new_follower',
        title: 'Нов последовател / New Follower',
        message: `${followerData?.displayName || 'Someone'} started following you`,
        data: {
          followerId,
          followerName: followerData?.displayName,
          followerPhoto: followerData?.profileImage?.url
        },
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error sending notification', error as Error, { followerId, followingId });
    }
  }
}

export const followService = FollowService.getInstance();

