// src/services/social/posts-feed.service.ts
// Posts Feed Service - Feed generation with ranking algorithm
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { Post } from './posts.service';
import { logger } from '../logger-service';

class PostsFeedService {
  
  async getFeedPosts(
    userId: string,
    limitCount: number = 20
  ): Promise<Post[]> {
    try {
      const followingIds = await this.getFollowingIds(userId);
      
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'published'),
        where('visibility', 'in', ['public', 'followers']),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      let posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      
      posts = this.rankPosts(posts, followingIds, userId);
      
      return posts;
    } catch (error) {
      logger.error('Error getting feed posts', error as Error, { userId, limitCount });
      return [];
    }
  }
  
  private rankPosts(posts: Post[], followingIds: string[], userId: string): Post[] {
    return posts.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      if (followingIds.includes(a.authorId)) scoreA += 100;
      if (followingIds.includes(b.authorId)) scoreB += 100;
      
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const ageA = now - (a.createdAt?.toMillis?.() || now);
      const ageB = now - (b.createdAt?.toMillis?.() || now);
      
      if (ageA < dayInMs) scoreA += 50;
      if (ageB < dayInMs) scoreB += 50;
      
      scoreA += (a.engagement?.likes || 0) * 1;
      scoreA += (a.engagement?.comments || 0) * 2;
      scoreA += (a.engagement?.shares || 0) * 3;
      scoreA += (a.engagement?.saves || 0) * 5;
      
      scoreB += (b.engagement?.likes || 0) * 1;
      scoreB += (b.engagement?.comments || 0) * 2;
      scoreB += (b.engagement?.shares || 0) * 3;
      scoreB += (b.engagement?.saves || 0) * 5;
      
      return scoreB - scoreA;
    });
  }
  
  private async getFollowingIds(userId: string): Promise<string[]> {
    try {
      // ✅ FIX: Use follows collection instead of subcollection
      const followingSnapshot = await getDocs(
        query(
          collection(db, 'follows'),
          where('followerId', '==', userId)
        )
      );
      return followingSnapshot.docs.map(doc => doc.data().followingId || doc.id);
    } catch (error) {
      logger.error('Error getting following', error as Error, { userId });
      return [];
    }
  }
  
  async getPublicFeed(limitCount: number = 20): Promise<Post[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      logger.error('Error getting public feed', error as Error, { limitCount });
      return [];
    }
  }
}

export const postsFeedService = new PostsFeedService();

