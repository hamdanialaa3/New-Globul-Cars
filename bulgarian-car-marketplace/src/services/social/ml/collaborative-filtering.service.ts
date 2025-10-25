// Collaborative Filtering - ML Recommendation Algorithm
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// "Users similar to you liked this"

import {
  collection,
  query,
  where,
  getDocs,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { Post } from '../posts.service';
import { SimilarUser, RecommendationResult, deduplicatePosts } from '../../../types/social-feed.types';

class CollaborativeFilteringService {
  // Find similar users based on engagement patterns
  async findSimilarUsers(
    userId: string,
    limitCount: number = 20
  ): Promise<SimilarUser[]> {
    try {
      const userEngagements = await this.getUserEngagementVector(userId);
      
      if (userEngagements.size === 0) {
        return [];
      }

      const activeUsers = await this.getActiveUsers(500);
      const similarities: SimilarUser[] = [];

      for (const otherUser of activeUsers) {
        if (otherUser.id === userId) continue;

        const otherEngagements = await this.getUserEngagementVector(otherUser.id);
        
        if (otherEngagements.size < 3) continue;

        const similarity = this.calculateCosineSimilarity(
          userEngagements,
          otherEngagements
        );

        if (similarity > 0.1) {
          const common = this.getCommonKeys(userEngagements, otherEngagements);
          
          similarities.push({
            userId: otherUser.id,
            similarity,
            commonInterests: common,
            engagementOverlap: common.length
          });
        }
      }

      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }

  // Calculate cosine similarity between two vectors
  private calculateCosineSimilarity(
    vec1: Map<string, number>,
    vec2: Map<string, number>
  ): number {
    const allKeys = new Set([...vec1.keys(), ...vec2.keys()]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    allKeys.forEach(key => {
      const v1 = vec1.get(key) || 0;
      const v2 = vec2.get(key) || 0;
      
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Get user engagement vector (postId -> weight)
  private async getUserEngagementVector(
    userId: string
  ): Promise<Map<string, number>> {
    const vector = new Map<string, number>();

    try {
      const reactionsQuery = query(
        collection(db, 'reactions'),
        where('userId', '==', userId),
        firestoreLimit(100)
      );

      const reactionsSnapshot = await getDocs(reactionsQuery);
      
      reactionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const postId = data.postId;
        const weight = this.getReactionWeight(data.type);
        vector.set(postId, (vector.get(postId) || 0) + weight);
      });

      const commentsQuery = query(
        collection(db, 'comments'),
        where('authorId', '==', userId),
        firestoreLimit(50)
      );

      const commentsSnapshot = await getDocs(commentsQuery);
      
      commentsSnapshot.docs.forEach(doc => {
        const postId = doc.data().postId;
        vector.set(postId, (vector.get(postId) || 0) + 3);
      });

    } catch (error) {
      console.error('Error getting engagement vector:', error);
    }

    return vector;
  }

  // Get reaction weight
  private getReactionWeight(type: string): number {
    const weights: Record<string, number> = {
      like: 1,
      love: 2,
      haha: 1,
      wow: 1,
      sad: 1,
      angry: 0.5,
      support: 2
    };
    return weights[type] || 1;
  }

  // Get active users (users who engaged recently)
  private async getActiveUsers(limitCount: number) {
    const usersQuery = query(
      collection(db, 'users'),
      where('stats.posts', '>', 0),
      firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Get common keys between two maps
  private getCommonKeys(
    map1: Map<string, number>,
    map2: Map<string, number>
  ): string[] {
    const common: string[] = [];
    
    map1.forEach((_, key) => {
      if (map2.has(key)) {
        common.push(key);
      }
    });

    return common;
  }

  // Recommend posts based on similar users
  async recommendFromSimilarUsers(
    userId: string,
    limitCount: number = 20
  ): Promise<RecommendationResult[]> {
    const similarUsers = await this.findSimilarUsers(userId, 20);
    
    if (similarUsers.length === 0) {
      return [];
    }

    const recommendations: RecommendationResult[] = [];
    const userEngaged = await this.getUserEngagedPostIds(userId);

    for (const similar of similarUsers) {
      const theirLikedPosts = await this.getUserLikedPosts(similar.userId, 20);
      
      for (const post of theirLikedPosts) {
        if (userEngaged.has(post.id)) continue;

        recommendations.push({
          post,
          score: similar.similarity,
          reason: 'similar_users',
          confidence: similar.similarity,
          source: 'collaborative'
        });
      }
    }

    return this.deduplicateRecommendations(recommendations)
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount);
  }

  // Get posts user has engaged with
  private async getUserEngagedPostIds(userId: string): Promise<Set<string>> {
    const postIds = new Set<string>();

    const reactionsQuery = query(
      collection(db, 'reactions'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(reactionsQuery);
    snapshot.docs.forEach(doc => {
      postIds.add(doc.data().postId);
    });

    return postIds;
  }

  // Get user's liked posts
  private async getUserLikedPosts(
    userId: string,
    limitCount: number
  ): Promise<Post[]> {
    const reactionsQuery = query(
      collection(db, 'reactions'),
      where('userId', '==', userId),
      where('type', 'in', ['like', 'love', 'support']),
      firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(reactionsQuery);
    const postIds = snapshot.docs.map(doc => doc.data().postId);

    const posts: Post[] = [];
    
    for (const postId of postIds) {
      const postQuery = query(
        collection(db, 'posts'),
        where('__name__', '==', postId),
        where('status', '==', 'active')
      );
      
      const postSnapshot = await getDocs(postQuery);
      if (!postSnapshot.empty) {
        posts.push({ 
          id: postSnapshot.docs[0].id, 
          ...postSnapshot.docs[0].data() 
        } as Post);
      }
    }

    return posts;
  }

  // Deduplicate recommendations
  private deduplicateRecommendations(
    recs: RecommendationResult[]
  ): RecommendationResult[] {
    const seen = new Map<string, RecommendationResult>();
    
    recs.forEach(rec => {
      if (!seen.has(rec.post.id)) {
        seen.set(rec.post.id, rec);
      } else {
        const existing = seen.get(rec.post.id)!;
        if (rec.score > existing.score) {
          seen.set(rec.post.id, rec);
        }
      }
    });

    return Array.from(seen.values());
  }
}

export default new CollaborativeFilteringService();

