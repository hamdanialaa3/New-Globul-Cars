// src/services/social/posts-feed.service.ts
// Posts Feed Service - Feed generation with ranking algorithm
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { Post } from './posts.service';

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
      console.error('Error getting feed posts:', error);
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
      const followingSnapshot = await getDocs(
        collection(db, 'users', userId, 'following')
      );
      return followingSnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error getting following:', error);
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
      console.error('Error getting public feed:', error);
      return [];
    }
  }
}

export const postsFeedService = new PostsFeedService();

