// Post Scoring Service - AI-Powered Post Ranking
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Max 300 lines per file (project constitution)

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { Post } from '../posts.service';
import { PostScore, ScoreBreakdown, getAgeInHours } from '../../../types/social-feed.types';

class PostScoringService {
  private readonly CACHE_TTL = 300000; // 5 minutes
  private scoreCache = new Map<string, { score: PostScore; cachedAt: number }>();

  // Main scoring function (0-100 points)
  async calculatePostScore(postId: string): Promise<PostScore> {
    // Check cache first
    const cached = this.scoreCache.get(postId);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
      return cached.score;
    }

    try {
      const post = await this.getPost(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const [engagement, author, reports] = await Promise.all([
        this.getEngagement(postId),
        this.getAuthor(post.authorId),
        this.getReportsCount(postId)
      ]);

      const breakdown: ScoreBreakdown = {
        reactions: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        views: 0,
        mediaBonus: 0,
        carReferenceBonus: 0,
        hashtagBonus: 0,
        trustScoreBonus: 0,
        verifiedBonus: 0
      };

      const engagementScore = this.calculateEngagementScore(engagement, breakdown);
      const recencyScore = this.calculateRecencyScore(post.createdAt);
      const qualityScore = this.calculateQualityScore(post, reports, breakdown);
      const authorScore = this.calculateAuthorScore(author, breakdown);

      const totalScore = Math.min(
        engagementScore + recencyScore + qualityScore + authorScore,
        100
      );

      const score: PostScore = {
        totalScore,
        engagementScore,
        recencyScore,
        qualityScore,
        authorScore,
        breakdown,
        calculatedAt: Date.now()
      };

      // Cache the result
      this.scoreCache.set(postId, { score, cachedAt: Date.now() });

      // Save to Firestore for persistence
      await this.saveScore(postId, score);

      return score;
    } catch (error) {
      console.error('Error calculating post score:', error);
      throw error;
    }
  }

  // 1. Engagement Score (0-40 points)
  private calculateEngagementScore(
    engagement: any,
    breakdown: ScoreBreakdown
  ): number {
    const weights = {
      reaction: 1,
      comment: 3,
      share: 5,
      save: 4,
      view: 0.01
    };

    breakdown.reactions = (engagement.reactions || engagement.likes || 0) * weights.reaction;
    breakdown.comments = (engagement.comments || 0) * weights.comment;
    breakdown.shares = (engagement.shares || 0) * weights.share;
    breakdown.saves = (engagement.saves || 0) * weights.save;
    breakdown.views = (engagement.views || 0) * weights.view;

    const rawScore = 
      breakdown.reactions +
      breakdown.comments +
      breakdown.shares +
      breakdown.saves +
      breakdown.views;

    return Math.min(rawScore / 10, 40);
  }

  // 2. Recency Score (0-20 points)
  private calculateRecencyScore(createdAt: Timestamp): number {
    const ageHours = getAgeInHours(createdAt);

    if (ageHours < 1) return 20;
    if (ageHours < 3) return 18;
    if (ageHours < 6) return 15;
    if (ageHours < 12) return 12;
    if (ageHours < 24) return 8;
    if (ageHours < 72) return 4;
    return 1;
  }

  // 3. Quality Score (0-20 points)
  private calculateQualityScore(
    post: Post,
    reports: number,
    breakdown: ScoreBreakdown
  ): number {
    let score = 0;

    // Media bonus
    if (post.content.media?.type === 'image') {
      breakdown.mediaBonus = 5;
      score += 5;
    } else if (post.content.media?.type === 'video') {
      breakdown.mediaBonus = 7;
      score += 7;
    }

    // Car reference bonus
    if (post.content.carReference) {
      breakdown.carReferenceBonus = 5;
      score += 5;
    }

    // Text quality
    if (post.content.text.length > 200) {
      score += 3;
    }

    // Hashtags
    if (post.content.hashtags && post.content.hashtags.length > 0) {
      breakdown.hashtagBonus = 2;
      score += 2;
    }

    // No spam reports
    if (reports === 0) {
      score += 3;
    } else {
      score -= reports * 2;
    }

    return Math.max(0, Math.min(score, 20));
  }

  // 4. Author Score (0-20 points)
  private calculateAuthorScore(
    author: any,
    breakdown: ScoreBreakdown
  ): number {
    let score = 0;

    // Trust score (0-10 points)
    const trustBonus = Math.min((author.trustScore || 0) / 10, 10);
    breakdown.trustScoreBonus = trustBonus;
    score += trustBonus;

    // Followers count (0-5 points)
    const followersBonus = Math.min((author.stats?.followers || 0) / 100, 5);
    score += followersBonus;

    // Verified account
    if (author.isVerified) {
      breakdown.verifiedBonus = 5;
      score += 5;
    }

    // Profile type
    if (author.profileType === 'company') {
      score += 3;
    } else if (author.profileType === 'dealer') {
      score += 2;
    }

    return Math.min(score, 20);
  }

  // Helper: Get post
  private async getPost(postId: string): Promise<Post | null> {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (!postDoc.exists()) return null;
    return { id: postDoc.id, ...postDoc.data() } as Post;
  }

  // Helper: Get engagement
  private async getEngagement(postId: string) {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    return postDoc.data()?.engagement || {
      views: 0,
      likes: 0,
      reactions: 0,
      comments: 0,
      shares: 0,
      saves: 0
    };
  }

  // Helper: Get author
  private async getAuthor(authorId: string) {
    const userDoc = await getDoc(doc(db, 'users', authorId));
    return userDoc.data() || {
      trustScore: 0,
      isVerified: false,
      profileType: 'private',
      stats: { followers: 0 }
    };
  }

  // Helper: Get reports count
  private async getReportsCount(postId: string): Promise<number> {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('postId', '==', postId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(reportsQuery);
    return snapshot.size;
  }

  // Save score to Firestore
  private async saveScore(postId: string, score: PostScore): Promise<void> {
    await setDoc(doc(db, 'postScores', postId), {
      ...score,
      breakdown: {
        reactions: score.breakdown.reactions,
        comments: score.breakdown.comments,
        shares: score.breakdown.shares,
        saves: score.breakdown.saves,
        views: score.breakdown.views,
        mediaBonus: score.breakdown.mediaBonus,
        carReferenceBonus: score.breakdown.carReferenceBonus,
        hashtagBonus: score.breakdown.hashtagBonus,
        trustScoreBonus: score.breakdown.trustScoreBonus,
        verifiedBonus: score.breakdown.verifiedBonus
      },
      updatedAt: Timestamp.now()
    });
  }

  // Get cached score from Firestore
  async getCachedScore(postId: string): Promise<PostScore | null> {
    const scoreDoc = await getDoc(doc(db, 'postScores', postId));
    if (!scoreDoc.exists()) return null;

    const data = scoreDoc.data();
    const ageMinutes = (Date.now() - data.calculatedAt) / 60000;

    // Recalculate if older than 15 minutes
    if (ageMinutes > 15) {
      return null;
    }

    return data as PostScore;
  }

  // Batch score calculation
  async calculateBatchScores(postIds: string[]): Promise<Map<string, PostScore>> {
    const scores = new Map<string, PostScore>();
    
    await Promise.all(
      postIds.map(async (postId) => {
        try {
          const score = await this.calculatePostScore(postId);
          scores.set(postId, score);
        } catch (error) {
          console.error(`Failed to score post ${postId}:`, error);
        }
      })
    );

    return scores;
  }

  // Clear cache
  clearCache(): void {
    this.scoreCache.clear();
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [postId, cached] of this.scoreCache.entries()) {
      if (now - cached.cachedAt > this.CACHE_TTL) {
        this.scoreCache.delete(postId);
      }
    }
  }
}

export default new PostScoringService();

