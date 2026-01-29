// Social Feed System - Core Types & Interfaces
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Max file size: 300 lines (as per project constitution)

import { Timestamp } from 'firebase/firestore';

// Post Score Breakdown
export interface PostScore {
  totalScore: number;
  engagementScore: number;
  recencyScore: number;
  qualityScore: number;
  authorScore: number;
  personalizedBonus?: number;
  breakdown: ScoreBreakdown;
  calculatedAt: number;
}

export interface ScoreBreakdown {
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  mediaBonus: number;
  carReferenceBonus: number;
  hashtagBonus: number;
  trustScoreBonus: number;
  verifiedBonus: number;
}

// User Interests for Personalization
export interface UserInterests {
  carBrands: Map<string, number>;
  carTypes: Map<string, number>;
  priceRanges: Map<string, number>;
  locations: Map<string, number>;
  hashtags: Map<string, number>;
  authors: Map<string, number>;
  postTypes: Map<string, number>;
  updatedAt: number;
}

// Serializable version for Firestore
export interface UserInterestsData {
  carBrands: Record<string, number>;
  carTypes: Record<string, number>;
  priceRanges: Record<string, number>;
  locations: Record<string, number>;
  hashtags: Record<string, number>;
  authors: Record<string, number>;
  postTypes: Record<string, number>;
  updatedAt: number;
}

// Feed Item in personalized feed
export interface FeedItem {
  id: string;
  postId: string;
  score: number;
  addedAt: Timestamp;
  reason: 'following' | 'trending' | 'similar' | 'local' | 'recommended';
  reasonDetails?: {
    similarUsers?: string[];
    contentSimilarity?: number;
    trendingScore?: number;
  };
}

// User Action for tracking
export interface UserAction {
  userId: string;
  postId: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | 'support' | 
        'comment' | 'share' | 'save' | 'view' | 'skip' | 'hide';
  timestamp: number;
  metadata?: Record<string, any>;
}

// Scored Post (for ranking)
export interface ScoredPost {
  post: any; // Post type from posts.service.ts
  score: PostScore;
  rank: number;
}

// Feed Update Event
export interface FeedUpdate {
  type: 'new_post' | 'post_updated' | 'post_removed' | 'feed_refresh';
  postId?: string;
  post?: any;
  affectedUsers?: string[];
}

// Cache Entry
export interface CachedFeed {
  userId: string;
  posts: any[];
  scores: Map<string, PostScore>;
  cachedAt: number;
  expiresAt: number;
  version: number;
}

// Recommendation Result
export interface RecommendationResult {
  post: any;
  score: number;
  reason: string;
  confidence: number;
  source: 'collaborative' | 'content_based' | 'hybrid' | 'trending';
}

// Similar User
export interface SimilarUser {
  userId: string;
  similarity: number;
  commonInterests: string[];
  engagementOverlap: number;
}

// Content Features (for similarity calculation)
export interface ContentFeatures {
  carBrand: string;
  carModel: string;
  carType: string;
  priceRange: string;
  year: number;
  location: string;
  hashtags: Set<string>;
  type: string;
  hasMedia: number;
  mediaType: string;
  textLength: number;
  wordCount: number;
}

// Engagement Metrics
export interface EngagementMetrics {
  views: number;
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  viralVelocity: number;
}

// Feed Analytics
export interface FeedAnalytics {
  userId: string;
  sessionId: string;
  postsViewed: number;
  postsEngaged: number;
  averageTimePerPost: number;
  scrollDepth: number;
  exitPoint: string;
  sessionDuration: number;
  timestamp: number;
}

// A/B Test Variant
export interface ABTestVariant {
  variantId: string;
  name: string;
  algorithm: 'standard' | 'ml_enhanced' | 'hybrid';
  weight: number;
  metrics: {
    users: number;
    engagementRate: number;
    averageTimeOnFeed: number;
    retention: number;
  };
}

// Real-time Event
export interface RealtimeEvent {
  type: 'user.engagement' | 'content.created' | 'feed.updated' | 'score.changed';
  data: any;
  timestamp: number;
  source: string;
}

// Price Range Helper
export type PriceRange = 
  | '0-5k' 
  | '5k-10k' 
  | '10k-20k' 
  | '20k-30k' 
  | '30k-50k' 
  | '50k+';

// Helper function
export function getPriceRange(price?: number): PriceRange {
  if (!price) return '0-5k';
  if (price < 5000) return '0-5k';
  if (price < 10000) return '5k-10k';
  if (price < 20000) return '10k-20k';
  if (price < 30000) return '20k-30k';
  if (price < 50000) return '30k-50k';
  return '50k+';
}

// Convert Map to Record for Firestore
export function interestsToData(interests: UserInterests): UserInterestsData {
  return {
    carBrands: Object.fromEntries(interests.carBrands),
    carTypes: Object.fromEntries(interests.carTypes),
    priceRanges: Object.fromEntries(interests.priceRanges),
    locations: Object.fromEntries(interests.locations),
    hashtags: Object.fromEntries(interests.hashtags),
    authors: Object.fromEntries(interests.authors),
    postTypes: Object.fromEntries(interests.postTypes),
    updatedAt: interests.updatedAt
  };
}

// Convert Record to Map from Firestore
export function dataToInterests(data: UserInterestsData): UserInterests {
  return {
    carBrands: new Map(Object.entries(data.carBrands)),
    carTypes: new Map(Object.entries(data.carTypes)),
    priceRanges: new Map(Object.entries(data.priceRanges)),
    locations: new Map(Object.entries(data.locations)),
    hashtags: new Map(Object.entries(data.hashtags)),
    authors: new Map(Object.entries(data.authors)),
    postTypes: new Map(Object.entries(data.postTypes)),
    updatedAt: data.updatedAt
  };
}

// Deduplication helper
export function deduplicatePosts<T extends { id: string }>(posts: T[]): T[] {
  const seen = new Set<string>();
  return posts.filter(post => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
}

// Time helpers
export function getAgeInHours(timestamp: Timestamp | number): number {
  const time = typeof timestamp === 'number' 
    ? timestamp 
    : timestamp.toMillis();
  return (Date.now() - time) / 3600000;
}

export function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

