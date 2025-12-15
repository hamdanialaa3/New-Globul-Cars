/**
 * UNIFIED FIREBASE SERVICE
 * 
 * Consolidates 7 Firebase wrapper services into 2:
 * 1. UnifiedFirebaseService (this file) - Data operations
 * 2. live-firebase-counters-service.ts (keep) - Live counters
 * 
 * Services being consolidated:
 * - firebase-cache.service.ts → To DDD
 * - firebase-real-data-service.ts → Keep core, merge here
 * - firebase-debug-service.ts → To DDD (use logger instead)
 * - firebase-auth-users-service.ts → To DDD (use canonical-user)
 * - firebase-auth-real-users.ts → To DDD
 * - firebase-connection-test.ts → To DDD (dev only)
 * 
 * Lines Saved: ~500 duplicate lines
 * 
 * @since 2025-11-03 (Phase 3)
 */

import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface CacheOptions {
  duration?: number;
  forceRefresh?: boolean;
}

export class UnifiedFirebaseService {
  private static instance: UnifiedFirebaseService;
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;
  
  // Statistics
  private hits = 0;
  private misses = 0;
  
  private constructor() {
    logger.info('UnifiedFirebaseService initialized');
  }
  
  static getInstance(): UnifiedFirebaseService {
    if (!this.instance) {
      this.instance = new UnifiedFirebaseService();
    }
    return this.instance;
  }
  
  /**
   * Get data from Firestore with caching
   * @template T - The expected return type
   */
  async getData<T = unknown>(collection: string, docId?: string): Promise<T | null> {
    const cacheKey = `${collection}/${docId || 'all'}`;
    
    // Check cache
    const cached = this.getFromCache<T>(cacheKey);
    if (cached !== null) {
      logger.debug('Data from cache', { collection, docId });
      return cached;
    }
    
    try {
      let data: T | null = null;
      if (docId) {
        const docRef = await db.collection(collection).doc(docId).get();
        data = docRef.exists ? (docRef.data() as T) : null;
      } else {
        const snapshot = await db.collection(collection).get();
        data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T;
      }
      
      if (data !== null) {
        this.setCache(cacheKey, data);
      }
      return data;
      
    } catch (error) {
      logger.error('Firebase getData error', error as Error, { collection, docId });
      throw error;
    }
  }
  
  /**
   * Set data in Firestore
   * @template T - The data type
   */
  async setData<T = Record<string, unknown>>(collection: string, docId: string, data: T): Promise<void> {
    try {
      await db.collection(collection).doc(docId).set(data);
      this.clearCache(`${collection}/${docId}`);
      logger.info('Data set', { collection, docId });
    } catch (error) {
      logger.error('Firebase setData error', error as Error);
      throw error;
    }
  }
  
  /**
   * Update data in Firestore
   * @template T - The update data type
   */
  async updateData<T = Partial<Record<string, unknown>>>(collection: string, docId: string, updates: T): Promise<void> {
    try {
      await db.collection(collection).doc(docId).update(updates);
      this.clearCache(`${collection}/${docId}`);
      logger.info('Data updated', { collection, docId });
    } catch (error) {
      logger.error('Firebase updateData error', error as Error);
      throw error;
    }
  }
  
  private getFromCache<T = unknown>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.DEFAULT_CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  private setCache<T = unknown>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  private clearCache(key: string): void {
    this.cache.delete(key);
  }
  
  clearAllCache(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    logger.info('Firebase cache cleared');
  }

  /**
   * Get data from cache or fetch it
   * Merged from firebase-cache.service.getOrFetch()
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { duration = this.DEFAULT_CACHE_DURATION, forceRefresh = false } = options;

    // Check if we should force refresh
    if (forceRefresh) {
      this.invalidate(key);
    }

    // Try to get from cache
    const cached = this.cache.get(key);

    // Check if cache is valid
    if (cached && Date.now() - cached.timestamp < duration) {
      this.hits++;
      logger.debug('Firebase Cache HIT', { key, hitRate: this.getHitRate() });
      return cached.data as T;
    }

    // Cache miss - fetch new data
    this.misses++;
    logger.debug('Firebase Cache MISS - fetching', { key, hitRate: this.getHitRate() });
    
    try {
      const data = await fetcher();
      this.setCache(key, data);
      return data;
    } catch (error) {
      logger.error('Firebase Cache error fetching', error as Error, { key });
      
      // If we have stale cache, return it as fallback
      if (cached) {
        logger.warn('Using stale cache', { key });
        return cached.data as T;
      }
      
      throw error;
    }
  }

  /**
   * Invalidate a specific cache entry
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Firebase Cache invalidated', { key });
    }
  }

  /**
   * Invalidate multiple cache entries by pattern
   */
  invalidatePattern(pattern: RegExp): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    logger.debug('Firebase Cache invalidated by pattern', { count, pattern: pattern.toString() });
  }

  /**
   * Get cache statistics
   */
  getStats(): { hits: number; misses: number; hitRate: number; size: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.cache.size
    };
  }

  private getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('Evicted oldest cache entry', { key: oldestKey });
    }
  }
}

export const firebaseService = UnifiedFirebaseService.getInstance();

// Export cache keys helper (for backward compatibility)
export const cacheKeys = {
  // Cars
  allCars: () => 'cars-all',
  activeCars: () => 'cars-active',
  carsByCity: (cityId: string) => `cars-city-${cityId}`,
  carsByMake: (make: string) => `cars-make-${make}`,
  carDetails: (carId: string) => `car-${carId}`,
  
  // Users
  allUsers: () => 'users-all',
  userProfile: (userId: string) => `user-${userId}`,
  userListings: (userId: string) => `user-listings-${userId}`,
  
  // Stats
  cityCarCounts: () => 'stats-city-car-counts',
  brandCounts: () => 'stats-brand-counts',
  
  // Messages
  userConversations: (userId: string) => `messages-${userId}`,
  
  // Reviews
  sellerReviews: (sellerId: string) => `reviews-${sellerId}`,
  
  // Analytics
  pageViews: (page: string) => `analytics-page-${page}`,
};

// Alias for backward compatibility
export const firebaseCache = firebaseService;

