/**
 * Follow Service - User-to-User Following System
 * خدمة المتابعة - نظام المتابعة بين المستخدمين
 * 
 * Features:
 * - Follow/Unfollow users
 * - Check following status
 * - Get followers/following lists
 * - Real-time counter updates
 * 
 * Architecture:
 * - Composite keys prevent duplicates: `${followerId}_${followingId}`
 * - Atomic counter updates via Cloud Functions
 * - Optimistic UI support
 */

import { db } from '../../firebase/firebase-config';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  increment,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { logger } from '../logger-service';

interface FollowData {
  followerId: string;
  followingId: string;
  createdAt: Date | any;
  notificationsEnabled: boolean;
}

interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export class FollowService {
  private static instance: FollowService;

  static getInstance(): FollowService {
    if (!this.instance) {
      this.instance = new FollowService();
    }
    return this.instance;
  }

  /**
   * Follow a user
   * متابعة مستخدم
   * 
   * @param followerId - Current user ID (User 1)
   * @param followingId - Target user ID (User 80)
   * @returns Success status
   */
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      // Validation
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      // Create composite key (prevents duplicates)
      const followDocId = `${followerId}_${followingId}`;
      const followRef = doc(db, 'follows', followDocId);

      // Check if already following
      const existingFollow = await getDoc(followRef);
      if (existingFollow.exists()) {
        logger.warn('Already following user', { followerId, followingId });
        return true; // Already following
      }

      // Create follow document
      const followData: FollowData = {
        followerId,
        followingId,
        createdAt: serverTimestamp(),
        notificationsEnabled: true
      };

      await setDoc(followRef, followData);

      // Update counters (atomic operations)
      await this.updateFollowCounters(followerId, followingId, 'increment');

      logger.info('User followed successfully', { followerId, followingId });
      return true;

    } catch (error) {
      logger.error('Failed to follow user', error as Error, { followerId, followingId });
      throw error;
    }
  }

  /**
   * Unfollow a user
   * إلغاء متابعة مستخدم
   */
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const followDocId = `${followerId}_${followingId}`;
      const followRef = doc(db, 'follows', followDocId);

      // Check if follow exists
      const existingFollow = await getDoc(followRef);
      if (!existingFollow.exists()) {
        logger.warn('Not following user', { followerId, followingId });
        return false;
      }

      // Delete follow document
      await deleteDoc(followRef);

      // Update counters (atomic operations)
      await this.updateFollowCounters(followerId, followingId, 'decrement');

      logger.info('User unfollowed successfully', { followerId, followingId });
      return true;

    } catch (error) {
      logger.error('Failed to unfollow user', error as Error, { followerId, followingId });
      throw error;
    }
  }

  /**
   * Check if user is following another user
   * التحقق من حالة المتابعة
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const followDocId = `${followerId}_${followingId}`;
      const followRef = doc(db, 'follows', followDocId);
      const followDoc = await getDoc(followRef);
      
      return followDoc.exists();

    } catch (error) {
      logger.error('Failed to check following status', error as Error);
      return false;
    }
  }

  /**
   * Get user's followers (who follows this user)
   * الحصول على المتابعين
   */
  async getFollowers(userId: string, limit: number = 50): Promise<string[]> {
    try {
      const q = query(
        collection(db, 'follows'),
        where('followingId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const followers = snapshot.docs
        .map((doc: any) => doc.data().followerId)
        .slice(0, limit);

      return followers;

    } catch (error) {
      logger.error('Failed to get followers', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get users that this user follows
   * الحصول على من يتابعهم المستخدم
   */
  async getFollowing(userId: string, limit: number = 50): Promise<string[]> {
    try {
      const q = query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const following = snapshot.docs
        .map((doc: any) => doc.data().followingId)
        .slice(0, limit);

      return following;

    } catch (error) {
      logger.error('Failed to get following', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get follow statistics
   * إحصائيات المتابعة
   */
  async getFollowStats(userId: string): Promise<FollowStats> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { followersCount: 0, followingCount: 0 };
      }

      const userData = userDoc.data();
      return {
        followersCount: userData.followersCount || 0,
        followingCount: userData.followingCount || 0
      };

    } catch (error) {
      logger.error('Failed to get follow stats', error as Error, { userId });
      return { followersCount: 0, followingCount: 0 };
    }
  }

  /**
   * Update follow counters atomically
   * تحديث عدادات المتابعة
   * 
   * @private
   */
  private async updateFollowCounters(
    followerId: string,
    followingId: string,
    operation: 'increment' | 'decrement'
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const value = operation === 'increment' ? 1 : -1;

      // Update follower's "following" count
      const followerRef = doc(db, 'users', followerId);
      batch.update(followerRef, {
        followingCount: increment(value)
      });

      // Update following user's "followers" count
      const followingRef = doc(db, 'users', followingId);
      batch.update(followingRef, {
        followersCount: increment(value)
      });

      await batch.commit();

      logger.info('Follow counters updated', { 
        followerId, 
        followingId, 
        operation 
      });

    } catch (error) {
      logger.error('Failed to update follow counters', error as Error);
      // Don't throw - counters can be recalculated later
    }
  }

  /**
   * Toggle follow/unfollow (convenience method)
   * تبديل حالة المتابعة
   */
  async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    const isCurrentlyFollowing = await this.isFollowing(followerId, followingId);
    
    if (isCurrentlyFollowing) {
      await this.unfollowUser(followerId, followingId);
      return false; // Now not following
    } else {
      await this.followUser(followerId, followingId);
      return true; // Now following
    }
  }

  /**
   * Batch check multiple users
   * فحص متعدد للمتابعة
   */
  async checkMultipleFollowing(
    followerId: string,
    targetUserIds: string[]
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    try {
      const promises = targetUserIds.map(async (targetId) => {
        const isFollowing = await this.isFollowing(followerId, targetId);
        results.set(targetId, isFollowing);
      });

      await Promise.all(promises);
      return results;

    } catch (error) {
      logger.error('Failed batch following check', error as Error);
      return results;
    }
  }
}

export const followService = FollowService.getInstance();
