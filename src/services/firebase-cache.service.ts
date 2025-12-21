// src/services/firebase-cache.service.ts
// Firebase Query Caching Service
// خدمة التخزين المؤقت لـ Firebase

import { serviceLogger } from './logger-service';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface CacheOptions {
  duration?: number; // in milliseconds
  forceRefresh?: boolean;
}

/**
 * Firebase Cache Service - Singleton Pattern
 * 
 * Provides intelligent caching for Firebase queries to reduce:
 * - API calls
 * - Data transfer
 * - Loading times
 * 
 * Features:
 * - TTL (Time To Live) based expiration
 * - Manual cache invalidation
 * - Memory management
 * - Cache statistics
 * 
 * Usage:
 * ```ts
 * import { firebaseCacheService } from '../services/firebase-cache.service';
 * 
 * const cars = await firebaseCacheService.getOrFetch(
 *   'cars-active',
 *   async () => {
 *     const snapshot = await getDocs(query(collection(db, 'cars')));
 *     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 *   },
 *   { duration: 5 * 60 * 1000 } // 5 minutes
 * );
 * ```
 */
class FirebaseCacheService {
  private static instance: FirebaseCacheService | null = null;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of cached entries
  
  // Statistics
  private hits = 0;
  private misses = 0;

  private constructor() {
    serviceLogger.debug('FirebaseCacheService initialized');
  }

  public static getInstance(): FirebaseCacheService {
    if (!FirebaseCacheService.instance) {
      FirebaseCacheService.instance = new FirebaseCacheService();
    }
    return FirebaseCacheService.instance;
  }

  /**
   * Get data from cache or fetch it
   * @param key Unique cache key
   * @param fetcher Async function to fetch data
   * @param options Cache options
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
      serviceLogger.debug('Firebase Cache HIT', { key, hitRate: this.getHitRate() });
      return cached.data as T;
    }

    // Cache miss - fetch new data
    this.misses++;
    serviceLogger.debug('Firebase Cache MISS - fetching', { key, hitRate: this.getHitRate() });
    
    try {
      const data = await fetcher();
      this.set(key, data);
      return data;
    } catch (error) {
      serviceLogger.error('Firebase Cache error fetching', error as Error, { key });
      
      // If we have stale cache, return it as fallback
      if (cached) {
        serviceLogger.warn('Using stale cache', { key });
        return cached.data as T;
      }
      
      throw error;
    }
  }

  /**
   * Set data in cache
   */
  private set<T>(key: string, data: T): void {
    // Enforce max cache size
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }

  /**
   * Invalidate a specific cache entry
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      serviceLogger.debug('Firebase Cache invalidated', { key });
    }
  }

  /**
   * Invalidate multiple cache entries by pattern
   * @param pattern Regex pattern to match keys
   */
  invalidatePattern(pattern: RegExp): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    serviceLogger.debug('Firebase Cache invalidated by pattern', { count, pattern: pattern.toString() });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    serviceLogger.debug('Firebase Cache cleared', { size });
  }

  /**
   * Evict oldest cache entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      serviceLogger.debug('Firebase Cache evicted oldest entry', { key: oldestKey });
    }
  }

  /**
   * Get cache hit rate percentage
   */
  private getHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 0;
    return Math.round((this.hits / total) * 100);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Prefetch data and store in cache
   * Useful for preloading data in the background
   */
  async prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
    try {
      const data = await fetcher();
      this.set(key, data);
      serviceLogger.debug('Firebase Cache prefetched', { key });
    } catch (error) {
      serviceLogger.error('Firebase Cache prefetch failed', error as Error, { key });
    }
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  has(key: string, maxAge = this.DEFAULT_CACHE_DURATION): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    return age < maxAge;
  }

  /**
   * Get raw cache entry (for debugging)
   */
  getRaw<T>(key: string): CacheEntry<T> | undefined {
    return this.cache.get(key);
  }
}

// Export singleton instance
export const firebaseCache = new FirebaseCacheService();

// Export helper functions for common Firebase queries
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

// Export singleton instance for easy access
export const firebaseCacheService = FirebaseCacheService.getInstance();

// Also export class for direct usage if needed
export { FirebaseCacheService };