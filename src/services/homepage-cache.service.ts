// Homepage Cache Service - Aggressive Caching for Performance
// خدمة التخزين المؤقت للصفحة الرئيسية - للأداء العالي
// ⚡ Caches all homepage data for 5 minutes

import { logger } from './logger-service';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class HomePageCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data or execute fetcher
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    // Return cached if valid
    if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
      logger.debug(`Cache HIT: ${key}`, {
        age: Math.round((Date.now() - cached.timestamp) / 1000)
      });
      return cached.data;
    }

    // Fetch fresh data
    logger.debug(`Cache MISS: ${key} - Fetching fresh data`);
    const data = await fetcher();
    
    // Store in cache
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    });

    return data;
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    logger.info(`Cache invalidated`, { key });
  }

  /**
   * Invalidate all cache
   */
  invalidateAll(): void {
    this.cache.clear();
    logger.info('All cache cleared');
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: Math.round((now - value.timestamp) / 1000),
      expiresIn: Math.round((value.expiresIn - (now - value.timestamp)) / 1000),
      isValid: now - value.timestamp < value.expiresIn
    }));

    return {
      totalEntries: this.cache.size,
      validEntries: entries.filter(e => e.isValid).length,
      expiredEntries: entries.filter(e => !e.isValid).length,
      entries
    };
  }

  /**
   * Preload critical data (optional)
   */
  async preload(loaders: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>) {
    logger.info('Preloading cache...', { count: loaders.length });
    const promises = loaders.map(({ key, fetcher, ttl }) => 
      this.getOrFetch(key, fetcher, ttl)
    );
    await Promise.all(promises);
    logger.info('Preload complete');
  }
}

export const homePageCache = new HomePageCacheService();

// Cache keys
export const CACHE_KEYS = {
  SMART_FEED: (userId: string, mode: string, page: number) => `smart_feed_${userId}_${mode}_${page}`,
  COMMUNITY_FEED: (page: number) => `community_feed_${page}`,
  FEATURED_CARS: (limit: number) => `featured_cars_${limit}`,
  STATS: 'homepage_stats',
  POPULAR_BRANDS: 'popular_brands',
  CITY_CARS: 'city_cars',
  IMAGE_GALLERY: 'image_gallery',
  FEATURES: 'features'
};

