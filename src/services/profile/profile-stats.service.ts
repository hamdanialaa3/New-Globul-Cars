// ProfileStatsService - Professional Centralized Profile Statistics
// Deep architectural thinking: caching, error resilience, type safety, extensibility
// English/Bulgarian agnostic. No emojis. <300 lines enforced.

import { collection, doc, getDocs, getDoc, query, where, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';
import { savedSearchesService } from '../../services/search/saved-searches.service';
import WorkflowAnalyticsService from '../../services/workflow-analytics-service';
// ✅ CRITICAL: Import vehicle collections for multi-collection support
import { VEHICLE_COLLECTIONS } from '../car/unified-car-types';

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

// ✅ CRITICAL FIX: Use correct Firestore structure and field names
const defaultDataSource: ProfileStatsDataSource = {
  // ✅ FIX: profiles collection uses document ID = userId (Firebase UID)
  // Use direct document access instead of query
  fetchProfile: async (profileId: string) => {
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', profileId));
      if (profileDoc.exists()) {
        return profileDoc;
      }
      // Fallback: Try users collection if profiles doesn't exist
      const userDoc = await getDoc(doc(db, 'users', profileId));
      return userDoc.exists() ? userDoc : null;
    } catch (error) {
      logger.warn('Failed to fetch profile', { profileId, error: (error as Error).message });
      return null;
    }
  },
  
  // ✅ FIX: Query ALL vehicle collections (passenger_cars, suvs, vans, etc.)
  // Use sellerId field (not ownerProfileId)
  fetchListings: async (profileId: string) => {
    try {
      const allListings: any[] = [];
      // Query all vehicle collections in parallel
      const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
        try {
          const q = query(
            collection(db, collectionName),
            where('sellerId', '==', profileId)
          );
          const snapshot = await getDocs(q);
          return snapshot.docs;
        } catch (error) {
          logger.warn(`Failed to query ${collectionName}`, { profileId, error: (error as Error).message });
          return [];
        }
      });
      const results = await Promise.all(queryPromises);
      results.forEach(docs => allListings.push(...docs));
      
      // Return as QuerySnapshot-like object
      return {
        forEach: (callback: (doc: any) => void) => {
          allListings.forEach(callback);
        },
        size: allListings.length,
        docs: allListings
      } as any;
    } catch (error) {
      logger.warn('Failed to fetch listings', { profileId, error: (error as Error).message });
      return { forEach: () => {}, size: 0, docs: [] } as any;
    }
  },
  
  // ✅ FIX: listingMetrics collection - handle gracefully if doesn't exist
  fetchListingMetrics: async (profileId: string) => {
    try {
      const q = query(
        collection(db, 'listingMetrics'),
        where('ownerProfileId', '==', profileId)
      );
      return await getDocs(q);
    } catch (error) {
      // ✅ GRACEFUL: Return empty if collection doesn't exist or permission denied
      logger.debug('listingMetrics not available', { profileId, error: (error as Error).message });
      return { forEach: () => {}, size: 0, docs: [] } as any;
    }
  },
  
  // ✅ FIX: Use listing_reviews collection (not reviews)
  fetchReviews: async (profileId: string) => {
    try {
      // Try listing_reviews first (correct collection name)
      const q = query(
        collection(db, 'listing_reviews'),
        where('profileId', '==', profileId)
      );
      return await getDocs(q);
    } catch (error) {
      // Fallback: Try reviews collection (legacy)
      try {
        const q = query(
          collection(db, 'reviews'),
          where('profileId', '==', profileId)
        );
        return await getDocs(q);
      } catch (fallbackError) {
        logger.debug('Reviews not available', { profileId, error: (error as Error).message });
        return { forEach: () => {}, size: 0, docs: [] } as any;
      }
    }
  },
  
  fetchSavedSearches: async (profileId: string) => {
    try {
      return await savedSearchesService.list(profileId);
    } catch (error) {
      logger.warn('Failed to fetch saved searches', { profileId, error: (error as Error).message });
      return [];
    }
  }
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
   * ✅ CRITICAL FIX: Include userId field for Firestore Security Rules
   */
  async updateUserStats(profileId: string): Promise<void> {
    try {
      const stats = await this.getStats(profileId, true);

      // ✅ CRITICAL FIX: Include userId field to satisfy Firestore Security Rules
      // Security Rules require: isOwner(resource.data.userId) || (request.resource.data.userId == request.auth.uid)
      // When using merge: true, we must ensure userId field exists in the update
      const { getAuth } = await import('firebase/auth');
      const { auth } = await import('../../firebase/firebase-config');
      const currentUser = getAuth(auth).currentUser;
      
      // ✅ FIX: Always include userId field for Security Rules
      // This ensures the rule: request.resource.data.userId == request.auth.uid passes
      const updateData: any = {
        userId: profileId, // ✅ CRITICAL: Always include userId for Security Rules
        stats: stats,
        lastStatsUpdate: Timestamp.fromDate(new Date())
      };
      
      // ✅ VALIDATION: Only allow update if current user matches profileId
      // This prevents permission errors when viewing other users' profiles
      if (!currentUser) {
        logger.debug('No authenticated user, skipping stats update', { profileId });
        return; // Don't throw, just return silently
      }
      
      if (currentUser.uid !== profileId) {
        logger.debug('Cannot update stats for other user (expected)', { 
          currentUserId: currentUser.uid, 
          profileId 
        });
        return; // Don't throw, just return silently - this is expected behavior
      }

      // Persist to profile document for simple frontend consumption
      // Using setDoc with merge: true to ensure document exists
      const { setDoc, doc } = await import('firebase/firestore');
      await setDoc(doc(db, 'profiles', profileId), updateData, { merge: true });

      logger.info('Profile stats persisted to DB', { profileId });
    } catch (error) {
      // ✅ GRACEFUL: Don't throw - this is a background optimization
      // Log error but don't break the UI
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
        logger.warn('Profile stats update permission denied (expected for other users)', { profileId });
      } else {
        logger.error('Failed to update user stats in DB', error as Error, { profileId });
      }
    }
  }

  /**
   * Setup real-time listener for live updates
   * Caller MUST cleanup via returned unsubscribe function
   */
  setupRealtime(profileId: string, callback: (stats: ProfileStats) => void): Unsubscribe {
    // Cleanup existing listener if any
    this.cleanupListener(profileId);

    // ✅ FIX: Use profiles collection with profileId as document ID
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
    // ✅ FIX: Support both profileType and type fields (profileType is canonical)
    const profileType = (profile.profileType || profile.type || 'private') as 'private' | 'dealer' | 'company';
    const createdAt = profile.createdAt?.toDate() || new Date();
    const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // ✅ FIX: Listings aggregation - handle both QuerySnapshot and custom object
    let activeListings = 0;
    let soldListings = 0;
    const listingsDocs = listingsSnap.docs || (listingsSnap.forEach ? [] : []);
    
    if (listingsSnap.forEach) {
      // QuerySnapshot-like object
      listingsSnap.forEach((d: any) => {
        const data = d.data ? d.data() : d;
        const status = data.status;
        const isActive = data.isActive !== false; // Default to true
        const isSold = data.isSold === true;
        
        if (status === 'published' || status === 'active' || isActive) {
          activeListings++;
        }
        if (status === 'sold' || isSold) {
          soldListings++;
        }
      });
    } else {
      // Array of docs
      listingsDocs.forEach((d: any) => {
        const data = d.data ? d.data() : d;
        const status = data.status;
        const isActive = data.isActive !== false;
        const isSold = data.isSold === true;
        
        if (status === 'published' || status === 'active' || isActive) {
          activeListings++;
        }
        if (status === 'sold' || isSold) {
          soldListings++;
        }
      });
    }
    const totalListings = listingsSnap.size || listingsDocs.length;

    // ✅ FIX: Metrics aggregation - handle gracefully if collection doesn't exist
    let views30d = 0, messages30d = 0, favorites30d = 0;
    if (metricsSnap && metricsSnap.forEach) {
      metricsSnap.forEach((d: any) => {
        const m = d.data ? d.data() : d;
        views30d += m.views30d || 0;
        messages30d += m.messages30d || 0;
        favorites30d += m.favorites30d || 0;
      });
    }

    // Response metrics (from profile.stats if available)
    const stats = profile.stats || {};
    const avgResponseMinutes = stats.avgResponseMinutes || 0;
    const responseRate = stats.responseRate || 0;

    // ✅ FIX: Reviews aggregation - handle gracefully if collection doesn't exist
    let totalRating = 0;
    let reviewCount = 0;
    if (reviewsSnap && reviewsSnap.forEach) {
      reviewsSnap.forEach((d: any) => {
        const data = d.data ? d.data() : d;
        totalRating += data.rating || 0;
        reviewCount++;
      });
    }
    reviewCount = reviewsSnap?.size || reviewCount;
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
