// Hybrid Recommender - Combines Collaborative + Content-Based
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { Post } from '../posts.service';
import collaborativeFilteringService from './collaborative-filtering.service';
import contentFilteringService from './content-filtering.service';
import postScoringService from '../algorithms/post-scoring.service';
import personalizationService from '../algorithms/personalization.service';
import { RecommendationResult, deduplicatePosts } from '@globul-cars/core/typessocial-feed.types';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';

class HybridRecommenderService {
  // Main hybrid recommendation function
  async getHybridRecommendations(
    userId: string,
    limitCount: number = 20
  ): Promise<Post[]> {
    try {
      const [collaborative, contentBased, trending, fresh] = await Promise.all([
        // Collaborative filtering (40%)
        collaborativeFilteringService.recommendFromSimilarUsers(userId, 20),
        
        // Content-based filtering (30%)
        contentFilteringService.recommendSimilarContent(userId, 15),
        
        // Trending posts (20%)
        this.getTrendingPosts(10),
        
        // Fresh content (10%)
        this.getFreshPosts(5)
      ]);

      // Combine with weights
      const combined = [
        ...this.applyWeight(collaborative, 0.4),
        ...this.applyWeight(contentBased, 0.3),
        ...trending.map(post => ({
          post,
          score: 0.2,
          reason: 'trending',
          confidence: 0.8,
          source: 'hybrid' as const
        })),
        ...fresh.map(post => ({
          post,
          score: 0.1,
          reason: 'fresh_content',
          confidence: 0.5,
          source: 'hybrid' as const
        }))
      ];

      // Deduplicate
      const unique = this.deduplicateRecommendations(combined);

      // Re-rank by final score
      const reranked = await this.rerankByFinalScore(unique, userId);

      return reranked.slice(0, limitCount);
    } catch (error) {
      console.error('Error in hybrid recommendations:', error);
      return [];
    }
  }

  // Apply weight to recommendations
  private applyWeight(
    recs: RecommendationResult[],
    weight: number
  ): RecommendationResult[] {
    return recs.map(rec => ({
      ...rec,
      score: rec.score * weight
    }));
  }

  // Get trending posts
  private async getTrendingPosts(limitCount: number): Promise<Post[]> {
    const oneDayAgo = Date.now() - 86400000;

    const postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'active'),
      where('createdAt', '>', oneDayAgo),
      orderBy('createdAt', 'desc'),
      limit(limitCount * 3)
    );

    const snapshot = await getDocs(postsQuery);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));

    return posts
      .sort((a, b) => {
        const rateA = this.calculateEngagementRate(a);
        const rateB = this.calculateEngagementRate(b);
        return rateB - rateA;
      })
      .slice(0, limitCount);
  }

  // Get fresh posts
  private async getFreshPosts(limitCount: number): Promise<Post[]> {
    const postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
  }

  // Re-rank by combining all scores
  private async rerankByFinalScore(
    recs: RecommendationResult[],
    userId: string
  ): Promise<Post[]> {
    const scored = await Promise.all(
      recs.map(async rec => {
        const baseScore = await postScoringService.getCachedScore(rec.post.id) ||
          await postScoringService.calculatePostScore(rec.post.id);

        const personalizedScore = await personalizationService.personalizeScore(
          rec.post,
          userId,
          baseScore
        );

        const finalScore = 
          personalizedScore.totalScore * 0.6 +
          rec.score * 100 * 0.4;

        return {
          post: rec.post,
          finalScore
        };
      })
    );

    return scored
      .sort((a, b) => b.finalScore - a.finalScore)
      .map(s => s.post);
  }

  // Calculate engagement rate
  private calculateEngagementRate(post: Post): number {
    const total =
      (post.engagement.likes || 0) +
      (post.engagement.comments || 0) * 3 +
      (post.engagement.shares || 0) * 5 +
      (post.engagement.saves || 0) * 4;

    return total / Math.max(post.engagement.views || 1, 1);
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

export default new HybridRecommenderService();

