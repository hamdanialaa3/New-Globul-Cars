// Content-Based Filtering - Recommend Similar Posts
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// "Posts similar to what you liked"

import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { Post } from '../posts.service';
import { ContentFeatures, RecommendationResult, getPriceRange } from '../../../types/social-feed.types';

class ContentFilteringService {
  // Extract features from post
  extractFeatures(post: Post): ContentFeatures {
    return {
      carBrand: post.content.carReference?.brand || '',
      carModel: post.content.carReference?.model || '',
      carType: post.content.carReference?.type || '',
      priceRange: post.content.carReference?.price 
        ? getPriceRange(post.content.carReference.price)
        : '0-5k',
      year: post.content.carReference?.year || 0,
      location: post.location?.city || '',
      hashtags: new Set(post.content.hashtags || []),
      type: post.type,
      hasMedia: post.content.media ? 1 : 0,
      mediaType: post.content.media?.type || '',
      textLength: post.content.text.length,
      wordCount: post.content.text.split(/\s+/).length
    };
  }

  // Calculate content similarity (0-1)
  calculateSimilarity(post1: Post, post2: Post): number {
    const f1 = this.extractFeatures(post1);
    const f2 = this.extractFeatures(post2);
    
    let similarity = 0;

    // Car brand matching (weight 30%)
    if (f1.carBrand && f1.carBrand === f2.carBrand) {
      similarity += 0.3;
      
      // Model matching (bonus 10% if brand matches)
      if (f1.carModel === f2.carModel) {
        similarity += 0.1;
      }
    }

    // Location matching (weight 20%)
    if (f1.location && f1.location === f2.location) {
      similarity += 0.2;
    }

    // Post type matching (weight 15%)
    if (f1.type === f2.type) {
      similarity += 0.15;
    }

    // Hashtag overlap (weight 25%)
    const commonHashtags = [...f1.hashtags].filter(h => f2.hashtags.has(h));
    const hashtagSimilarity = commonHashtags.length / 
      Math.max(f1.hashtags.size, f2.hashtags.size, 1);
    similarity += hashtagSimilarity * 0.25;

    // Media type matching (weight 10%)
    if (f1.hasMedia === f2.hasMedia && f1.mediaType === f2.mediaType) {
      similarity += 0.1;
    }

    // Price range matching (bonus 5%)
    if (f1.carBrand && f1.priceRange === f2.priceRange) {
      similarity += 0.05;
    }

    return Math.min(similarity, 1);
  }

  // Recommend posts similar to user's liked posts
  async recommendSimilarContent(
    userId: string,
    limitCount: number = 20
  ): Promise<RecommendationResult[]> {
    try {
      const userLikedPosts = await this.getUserLikedPosts(userId, 30);
      
      if (userLikedPosts.length === 0) {
        return [];
      }

      const candidatePosts = await this.getCandidatePosts(userId, 200);
      const recommendations: RecommendationResult[] = [];

      for (const candidate of candidatePosts) {
        const similarities = userLikedPosts.map(liked =>
          this.calculateSimilarity(liked, candidate)
        );

        const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / 
          similarities.length;

        if (avgSimilarity > 0.3) {
          recommendations.push({
            post: candidate,
            score: avgSimilarity,
            reason: 'content_similarity',
            confidence: avgSimilarity,
            source: 'content_based'
          });
        }
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error in content-based filtering:', error);
      return [];
    }
  }

  // Get user's liked posts
  private async getUserLikedPosts(
    userId: string,
    limitCount: number
  ): Promise<Post[]> {
    const reactionsQuery = query(
      collection(db, 'reactions'),
      where('userId', '==', userId),
      where('type', 'in', ['like', 'love']),
      firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(reactionsQuery);
    const postIds = snapshot.docs.map(doc => doc.data().postId);

    const posts: Post[] = [];
    
    for (const postId of postIds) {
      try {
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
      } catch (error) {
        console.error(`Error fetching post ${postId}:`, error);
      }
    }

    return posts;
  }

  // Get candidate posts (exclude already engaged)
  private async getCandidatePosts(
    userId: string,
    limitCount: number
  ): Promise<Post[]> {
    const engagedIds = await this.getUserEngagedPostIds(userId);

    const postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount * 2)
    );

    const snapshot = await getDocs(postsQuery);
    const posts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Post))
      .filter(post => !engagedIds.has(post.id));

    return posts.slice(0, limitCount);
  }

  // Get IDs of posts user engaged with
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

  // Get active users
  private async getActiveUsers(limitCount: number) {
    const usersQuery = query(
      collection(db, 'users'),
      where('stats.posts', '>', 0),
      firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Get common keys between maps
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
}

export default new ContentFilteringService();

