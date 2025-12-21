// Feed Algorithm Service - Smart Ranking Engine
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { Post } from '../posts.service';
import postScoringService from './post-scoring.service';
import personalizationService from './personalization.service';
import { ScoredPost, deduplicatePosts } from '../../../types/social-feed.types';
import { logger } from '../../logger-service';

class FeedAlgorithmService {
  // Main function: Get personalized feed
  async getPersonalizedFeed(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Post[]> {
    try {
      // 1. Get candidate posts (100 posts)
      const candidates = await this.getCandidatePosts(userId, 100);
      
      if (candidates.length === 0) {
        return [];
      }

      // 2. Calculate scores for all candidates
      const scored = await this.scoreAllPosts(candidates, userId);

      // 3. Rank by score
      const ranked = this.rankPosts(scored);

      // 4. Diversify results
      const diversified = await this.diversifyFeed(ranked, userId);

      // 5. Apply pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return diversified.slice(start, end);
    } catch (error) {
      logger.error('Error getting personalized feed', error as Error, { userId, page, pageSize });
      return [];
    }
  }

  // Get candidate posts from multiple sources
  private async getCandidatePosts(
    userId: string,
    totalLimit: number
  ): Promise<Post[]> {
    const user = await this.getUser(userId);
    
    const [followingPosts, trendingPosts, localPosts] = await Promise.all([
      // A. Following posts (50%)
      this.getFollowingPosts(userId, Math.floor(totalLimit * 0.5)),
      
      // B. Trending posts (30%)
      this.getTrendingPosts(Math.floor(totalLimit * 0.3)),
      
      // C. Local posts (20%)
      user?.location?.city 
        ? this.getLocalPosts(user.locationData?.cityName, Math.floor(totalLimit * 0.2))
        : []
    ]);

    const combined = [
      ...followingPosts,
      ...trendingPosts,
      ...localPosts
    ];

    return deduplicatePosts(combined);
  }

  // Get posts from users I follow
  private async getFollowingPosts(userId: string, limitCount: number): Promise<Post[]> {
    // Get following IDs
    const followsQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );
    const followsSnapshot = await getDocs(followsQuery);
    const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId);

    if (followingIds.length === 0) {
      return [];
    }

    // Get their posts (batch in groups of 10)
    const posts: Post[] = [];
    for (let i = 0; i < followingIds.length; i += 10) {
      const batch = followingIds.slice(i, i + 10);
      const postsQuery = query(
        collection(db, 'posts'),
        where('authorId', 'in', batch),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(postsQuery);
      posts.push(...snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Post)));
    }

    return posts.slice(0, limitCount);
  }

  // Get trending posts (high engagement recently)
  async getTrendingPosts(limitCount: number): Promise<Post[]> {
    const oneDayAgo = Timestamp.fromMillis(Date.now() - 86400000);
    
    const postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      where('visibility', '==', 'public'),
      where('createdAt', '>', oneDayAgo),
      orderBy('createdAt', 'desc'),
      limit(limitCount * 3) // Get more to filter
    );

    const snapshot = await getDocs(postsQuery);
    const posts = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Post));

    // Sort by engagement rate
    const sorted = posts.sort((a, b) => {
      const rateA = this.calculateEngagementRate(a);
      const rateB = this.calculateEngagementRate(b);
      return rateB - rateA;
    });

    return sorted.slice(0, limitCount);
  }

  // Get local posts (same city)
  private async getLocalPosts(city: string, limitCount: number): Promise<Post[]> {
    const postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      where('visibility', '==', 'public'),
      where('locationData.cityId', '==', city),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Post));
  }

  // Score all posts
  private async scoreAllPosts(
    posts: Post[],
    userId: string
  ): Promise<ScoredPost[]> {
    const scoredPosts = await Promise.all(
      posts.map(async (post, index) => {
        try {
          // Get base score
          let score = await postScoringService.getCachedScore(post.id);
          if (!score) {
            score = await postScoringService.calculatePostScore(post.id);
          }

          // Apply personalization
          const personalizedScore = await personalizationService.personalizeScore(
            post,
            userId,
            score
          );

          return {
            post,
            score: personalizedScore,
            rank: index
          };
        } catch (error) {
          logger.error('Error scoring post', error as Error, { postId: post.id, userId });
          return {
            post,
            score: {
              totalScore: 0,
              engagementScore: 0,
              recencyScore: 0,
              qualityScore: 0,
              authorScore: 0,
              breakdown: {} as any,
              calculatedAt: Date.now()
            },
            rank: index
          };
        }
      })
    );

    return scoredPosts;
  }

  // Rank posts by score
  private rankPosts(scoredPosts: ScoredPost[]): Post[] {
    return scoredPosts
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .map(sp => sp.post);
  }

  // Diversify feed (avoid repetition)
  private async diversifyFeed(
    rankedPosts: Post[],
    userId: string
  ): Promise<Post[]> {
    const diversified: Post[] = [];
    const typeCount = new Map<string, number>();
    const recentAuthors = new Set<string>();

    for (const post of rankedPosts) {
      // Skip if same author as last 2 posts
      if (diversified.length >= 2) {
        const last2 = diversified.slice(-2);
        if (last2.some(p => p.authorId === post.authorId)) {
          continue;
        }
      }

      // Limit same type to 2 consecutive
      const currentType = typeCount.get(post.type) || 0;
      if (currentType >= 2) {
        continue;
      }

      diversified.push(post);
      typeCount.set(post.type, currentType + 1);
      recentAuthors.add(post.authorId);

      // Reset counters every 5 posts
      if (diversified.length % 5 === 0) {
        typeCount.clear();
        recentAuthors.clear();
      }
    }

    return diversified;
  }

  // Calculate engagement rate
  private calculateEngagementRate(post: Post): number {
    const total = 
      (post.engagement.likes || 0) +
      (post.engagement.comments || 0) * 3 +
      (post.engagement.shares || 0) * 5 +
      (post.engagement.saves || 0) * 4;

    const views = post.engagement.views || 1;
    
    return total / views;
  }

  // Helper: Get user
  private async getUser(userId: string) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  }

  // Get feed for anonymous users
  async getPublicFeed(page: number = 1, pageSize: number = 10): Promise<Post[]> {
    const trending = await this.getTrendingPosts(pageSize * 3);
    
    const scored = await Promise.all(
      trending.map(async (post) => {
        const score = await postScoringService.calculatePostScore(post.id);
        return { post, score: score.totalScore };
      })
    );

    const sorted = scored.sort((a, b) => b.score - a.score);
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return sorted.slice(start, end).map(s => s.post);
  }

  // Get posts sorted by newest
  async getNewestPosts(page: number = 1, pageSize: number = 10): Promise<Post[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    } catch (error) {
      logger.error('Error getting newest posts:', error);
      return [];
    }
  }

  // Get posts sorted by most liked
  async getMostLikedPosts(limitCount: number = 10): Promise<Post[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        limit(100) // Get more to sort properly
      );

      const snapshot = await getDocs(postsQuery);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

      // Sort by likes
      return posts
        .sort((a, b) => (b.engagement.likes || 0) - (a.engagement.likes || 0))
        .slice(0, limitCount);
    } catch (error) {
      logger.error('Error getting most liked posts', error as Error, { limitCount });
      return [];
    }
  }

  // Get posts sorted by most comments
  async getMostCommentedPosts(limitCount: number = 10): Promise<Post[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        limit(100)
      );

      const snapshot = await getDocs(postsQuery);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

      // Sort by comments
      return posts
        .sort((a, b) => (b.engagement.comments || 0) - (a.engagement.comments || 0))
        .slice(0, limitCount);
    } catch (error) {
      logger.error('Error getting most commented posts', error as Error, { limitCount });
      return [];
    }
  }
}

export default new FeedAlgorithmService();

