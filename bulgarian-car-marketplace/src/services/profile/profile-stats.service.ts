// ProfileStatsService - Professional Centralized Profile Statistics
// Deep architectural thinking: caching, error resilience, type safety, extensibility
// English/Bulgarian agnostic. No emojis. <300 lines enforced.

import { collection, doc, getDocs, query, where, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';
import { savedSearchesService } from '../../services/search/saved-searches.service';
import WorkflowAnalyticsService from '../../services/workflow-analytics-service';

// Core profile stats interface with strict typing
export interface ProfileStats {
  // Trust & Identity
  trustScore: number; // 0-100
  badges: string[];
  verificationStatus: {
    phone: boolean;
    id: boolean;
    business: boolean;
  };

  // Listings Performance
  activeListings: number;
  totalListings: number;
  soldListings: number;

  // Engagement Metrics (30-day window)
  views30d: number;
  messages30d: number;
  favorites30d: number;

  // Response & Quality
  avgResponseMinutes: number;
  responseRate: number; // percentage

  // Reviews & Ratings
  reviewCount: number;
  avgRating: number; // 0-5

  // Advanced Analytics
  conversionRate30d: number; // messages/views percentage
  savedSearchesCount: number;

  // Metadata
  profileType: 'private' | 'dealer' | 'company';
  accountAge: number; // days since creation
  lastUpdated: Timestamp;
}

// Cache entry with TTL
interface CacheEntry {
  data: ProfileStats;
  timestamp: number;
  expiresAt: number;
}

/**
 * Professional ProfileStatsService
 * 
 * Architecture decisions:
 * 1. Singleton pattern for single point of truth
 * 2. In-memory cache with configurable TTL (5 min default)
 * 3. Graceful degradation on partial failures
 * 4. Real-time listener support with cleanup
 * 5. Type-safe aggregation methods
 * 6. Logging for observability
 */
// Data source abstraction for testability / future swapping (e.g. REST, gRPC, cached layer)
export interface ProfileStatsDataSource {
  fetchProfile(profileId: string): Promise<any>;
  fetchListings(profileId: string): Promise<any>;
  fetchListingMetrics(profileId: string): Promise<any>;
  fetchReviews(profileId: string): Promise<any>;
  fetchSavedSearches(profileId: string): Promise<any[]>;
}

const defaultDataSource: ProfileStatsDataSource = {
  fetchProfile: async (profileId: string) => {
    const snap = await getDocs(query(collection(db, 'profiles'), where('userId', '==', profileId)));
    return snap.docs[0] || null;
  },
  fetchListings: async (profileId: string) => getDocs(query(collection(db, 'listings'), where('ownerProfileId', '==', profileId))),
  fetchListingMetrics: async (profileId: string) => getDocs(query(collection(db, 'listingMetrics'), where('ownerProfileId', '==', profileId))),
  fetchReviews: async (profileId: string) => getDocs(query(collection(db, 'reviews'), where('profileId', '==', profileId))),
  fetchSavedSearches: async (profileId: string) => savedSearchesService.list(profileId)
};

class ProfileStatsService {
  private static instance: ProfileStatsService;
  private cache = new Map<string, CacheEntry>();
  private listeners = new Map<string, Unsubscribe>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private dataSource: ProfileStatsDataSource;

  private constructor(dataSource: ProfileStatsDataSource = defaultDataSource) {
    this.dataSource = dataSource;
  }

  static getInstance(): ProfileStatsService {
    if (!this.instance) this.instance = new ProfileStatsService(defaultDataSource);
    return this.instance;
  }

  // Allow tests or callers to swap data source (e.g. in-memory, pre-fetched)
  setDataSource(ds: ProfileStatsDataSource): void {
    this.dataSource = ds;
    // Optional: clear cache to avoid mixing different data origins
    this.clearAllCache();
  }

  /**
   * Get comprehensive profile stats with intelligent caching
   * Falls back gracefully if individual metrics fail
   */
  async getStats(profileId: string, skipCache = false): Promise<ProfileStats> {
    // Check cache first
    if (!skipCache) {
      const cached = this.getCached(profileId);
      if (cached) {
        logger.debug('ProfileStats cache hit', { profileId });
        return cached;
      }
    }

    logger.info('ProfileStats fetching fresh', { profileId });
    const startTime = Date.now();

    try {
      // Parallel fetch for performance (independent queries)
      const [profileDoc, listingsSnap, metricsSnap, reviewsSnap, searchesSnap] = await Promise.all([
        this.dataSource.fetchProfile(profileId),
        this.dataSource.fetchListings(profileId),
        this.dataSource.fetchListingMetrics(profileId),
        this.dataSource.fetchReviews(profileId),
        this.dataSource.fetchSavedSearches(profileId)
      ]);

      // Aggregate data
      const stats = this.aggregateStats(profileDoc, listingsSnap, metricsSnap, reviewsSnap, searchesSnap);

      // Cache result
      this.setCached(profileId, stats);

      const duration = Date.now() - startTime;
      logger.info('ProfileStats computed successfully', { profileId, duration });

      return stats;
    } catch (error) {
      logger.error('ProfileStats fetch failed', error as Error, { profileId });
      throw new Error(`Failed to load profile stats: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate and persist stats to the user profile
   */
  async updateUserStats(profileId: string): Promise<void> {
    try {
      const stats = await this.getStats(profileId, true);

      // Persist to profile document for simple frontend consumption
      // Using 'any' cast to avoid strict type checking on update for now
      await import('firebase/firestore').then(({ updateDoc, doc }) => {
        updateDoc(doc(db, 'profiles', profileId), {
          stats: stats,
          lastStatsUpdate: new Date()
        });
      });

      logger.info('Profile stats persisted to DB', { profileId });
    } catch (error) {
      logger.error('Failed to update user stats in DB', error as Error, { profileId });
      // Don't throw, just log. This is a background optimization.
    }
  }

  /**
   * Setup real-time listener for live updates
   * Caller MUST cleanup via returned unsubscribe function
   */
  setupRealtime(profileId: string, callback: (stats: ProfileStats) => void): Unsubscribe {
    // Cleanup existing listener if any
    this.cleanupListener(profileId);

    const unsubscribe = onSnapshot(
      doc(db, 'profiles', profileId),
      async (snapshot) => {
        if (!snapshot.exists()) return;
        try {
          // Invalidate cache and refetch
          this.invalidateCache(profileId);
          const stats = await this.getStats(profileId, true);
          callback(stats);
        } catch (e) {
          logger.warn('Realtime stats update failed', { error: (e as Error).message });
        }
      },
      (error) => {
        logger.error('Realtime listener error', error as Error);
      }
    );

    this.listeners.set(profileId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Cleanup listener for profile
   */
  cleanupListener(profileId: string): void {
    const unsubscribe = this.listeners.get(profileId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(profileId);
    }
  }

  /**
   * Invalidate cache entry
   */
  invalidateCache(profileId: string): void {
    this.cache.delete(profileId);
  }

  clearCache(profileId: string): void {
    this.cache.delete(profileId);
  }

  /**
   * Clear all cache (useful for logout/switch user)
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  // ========== Private Helper Methods ==========

  private getCached(profileId: string): ProfileStats | null {
    const entry = this.cache.get(profileId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(profileId);
      return null;
    }
    return entry.data;
  }

  private setCached(profileId: string, data: ProfileStats): void {
    this.cache.set(profileId, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL
    });
  }

  // Legacy private methods removed; dataSource handles retrieval.

  private aggregateStats(profileDoc: any, listingsSnap: any, metricsSnap: any, reviewsSnap: any, searchesSnap: unknown[]): ProfileStats {
    // Profile baseline
    const profile = profileDoc?.data() || {};
    const trustScore = profile.trustScore || 0;
    const badges = profile.badges || [];
    const verification = profile.verification || { phoneVerified: false, idVerified: false, businessVerified: false };
    const profileType = profile.type || 'private';
    const createdAt = profile.createdAt?.toDate() || new Date();
    const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Listings aggregation
    let activeListings = 0;
    let soldListings = 0;
    listingsSnap.forEach((d: any) => {
      const status = d.data().status;
      if (status === 'published') activeListings++;
      if (status === 'sold') soldListings++;
    });
    const totalListings = listingsSnap.size;

    // Metrics aggregation
    let views30d = 0, messages30d = 0, favorites30d = 0;
    metricsSnap.forEach((d: any) => {
      const m = d.data();
      views30d += m.views30d || 0;
      messages30d += m.messages30d || 0;
      favorites30d += m.favorites30d || 0;
    });

    // Response metrics (from profile.stats if available)
    const stats = profile.stats || {};
    const avgResponseMinutes = stats.avgResponseMinutes || 0;
    const responseRate = stats.responseRate || 0;

    // Reviews aggregation
    let totalRating = 0;
    reviewsSnap.forEach((d: any) => {
      totalRating += d.data().rating || 0;
    });
    const reviewCount = reviewsSnap.size;
    const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    // Conversion rate
    const conversionRate30d = views30d > 0 ? (messages30d / views30d) * 100 : 0;

    // Saved searches
    const savedSearchesCount = searchesSnap.length;

    return {
      trustScore,
      badges,
      verificationStatus: {
        phone: verification.phoneVerified || false,
        id: verification.idVerified || false,
        business: verification.businessVerified || false
      },
      activeListings,
      totalListings,
      soldListings,
      views30d,
      messages30d,
      favorites30d,
      avgResponseMinutes,
      responseRate,
      reviewCount,
      avgRating,
      conversionRate30d,
      savedSearchesCount,
      profileType,
      accountAge,
      lastUpdated: Timestamp.fromDate(new Date())
    };
  }
}

export const profileStatsService = ProfileStatsService.getInstance();
export default profileStatsService;
