// src/services/search/browser-cache-strategy.service.ts
// Browser Cache Strategy - Advanced Client-Side Caching for Search
// استراتيجية Caching متقدمة للمتصفح
// Created: December 28, 2025

import { logger } from '@/services/logger-service';
import { CarListing } from '@/types/CarListing';

// ============================================================================
// TYPES
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  hits: number;
  size: number; // Approximate size in bytes
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number; // in bytes
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
}

export interface CacheConfig {
  maxSize?: number; // Max cache size in bytes
  defaultTTL?: number; // Default TTL in milliseconds
  enableCompression?: boolean;
  enablePersistence?: boolean; // Use localStorage/IndexedDB
}

// ============================================================================
// BROWSER CACHE STRATEGY SERVICE
// ============================================================================

class BrowserCacheStrategyService {
  private static instance: BrowserCacheStrategyService;

  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
  };

  // Configuration
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly ENABLE_COMPRESSION = false;
  private readonly ENABLE_PERSISTENCE = true;

  // Storage keys
  private readonly STORAGE_KEY_PREFIX = 'search_cache_';
  private readonly STATS_STORAGE_KEY = 'search_cache_stats';

  static getInstance(): BrowserCacheStrategyService {
    if (!this.instance) {
      this.instance = new BrowserCacheStrategyService();
      this.instance.loadFromStorage();
    }
    return this.instance;
  }

  /**
   * حفظ بيانات في الـ Cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.DEFAULT_TTL,
        hits: 0,
        size: this.estimateSize(data),
      };

      // Check if adding this entry would exceed max size
      const currentSize = this.getTotalSize();
      if (currentSize + entry.size > this.MAX_CACHE_SIZE) {
        this.evictLRU(entry.size);
      }

      this.cache.set(key, entry);

      // Persist to storage if enabled
      if (this.ENABLE_PERSISTENCE) {
        this.persistToStorage(key, entry);
      }

      logger.debug('Cache set', { key, size: entry.size, ttl: entry.ttl });
    } catch (error) {
      logger.error('Failed to set cache', error as Error);
    }
  }

  /**
   * جلب بيانات من الـ Cache
   */
  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.stats.misses++;
        logger.debug('Cache miss', { key });
        return null;
      }

      // Check if expired
      if (this.isExpired(entry)) {
        this.delete(key);
        this.stats.misses++;
        logger.debug('Cache expired', { key });
        return null;
      }

      // Update hits
      entry.hits++;
      this.stats.hits++;

      logger.debug('Cache hit', { key, hits: entry.hits });

      return entry.data as T;
    } catch (error) {
      logger.error('Failed to get from cache', error as Error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * حذف مفتاح من الـ Cache
   */
  delete(key: string): void {
    this.cache.delete(key);

    if (this.ENABLE_PERSISTENCE) {
      this.removeFromStorage(key);
    }

    logger.debug('Cache deleted', { key });
  }

  /**
   * مسح جميع الـ Cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };

    if (this.ENABLE_PERSISTENCE) {
      this.clearStorage();
    }

    logger.info('Cache cleared');
  }

  /**
   * التحقق من وجود مفتاح في الـ Cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * جلب أو تنفيذ (Get or Execute)
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      logger.info('Returning cached data', { key });
      return cached;
    }

    logger.info('Fetching fresh data', { key });
    const data = await fetchFn();
    this.set(key, data, ttl);

    return data;
  }

  /**
   * جلب إحصائيات الـ Cache
   */
  getStats(): CacheStats {
    const totalEntries = this.cache.size;
    const totalSize = this.getTotalSize();
    const totalRequests = this.stats.hits + this.stats.misses;

    return {
      totalEntries,
      totalSize,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
    };
  }

  /**
   * تحديث TTL لمفتاح موجود
   */
  updateTTL(key: string, newTTL: number): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.ttl = newTTL;
      entry.timestamp = Date.now(); // Reset timestamp
      this.cache.set(key, entry);
    }
  }

  /**
   * Pre-warm Cache (جلب بيانات مسبقاً)
   */
  async prewarmCache(
    keys: { key: string; fetchFn: () => Promise<any>; ttl?: number }[]
  ): Promise<void> {
    logger.info('Pre-warming cache', { keysCount: keys.length });

    const promises = keys.map(({ key, fetchFn, ttl }) =>
      this.getOrFetch(key, fetchFn, ttl).catch((error) => {
        logger.error(`Failed to pre-warm cache for ${key}`, error as Error);
      })
    );

    await Promise.all(promises);
    logger.info('Cache pre-warming completed');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * التحقق من انتهاء صلاحية الـ Entry
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * حساب الحجم التقريبي للبيانات
   */
  private estimateSize(data: any): number {
    try {
      const json = JSON.stringify(data);
      return new Blob([json]).size;
    } catch {
      return 1000; // Default estimate
    }
  }

  /**
   * حساب الحجم الكلي للـ Cache
   */
  private getTotalSize(): number {
    let total = 0;
    this.cache.forEach((entry) => {
      total += entry.size;
    });
    return total;
  }

  /**
   * طرد العناصر الأقل استخداماً (LRU Eviction)
   */
  private evictLRU(requiredSpace: number): void {
    logger.info('Running LRU eviction', { requiredSpace });

    // Sort by hits (ascending) then by timestamp (ascending)
    const entries = Array.from(this.cache.entries()).sort((a, b) => {
      if (a[1].hits !== b[1].hits) {
        return a[1].hits - b[1].hits;
      }
      return a[1].timestamp - b[1].timestamp;
    });

    let freedSpace = 0;

    for (const [key, entry] of entries) {
      if (freedSpace >= requiredSpace) break;

      this.delete(key);
      freedSpace += entry.size;
      logger.debug('Evicted cache entry', { key, size: entry.size });
    }

    logger.info('LRU eviction completed', { freedSpace });
  }

  /**
   * حفظ إلى localStorage
   */
  private persistToStorage(key: string, entry: CacheEntry<any>): void {
    try {
      const storageKey = this.STORAGE_KEY_PREFIX + key;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      logger.warn('Failed to persist to storage', { key });
    }
  }

  /**
   * جلب من localStorage
   */
  private loadFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(this.STORAGE_KEY_PREFIX)
      );

      for (const storageKey of keys) {
        const cacheKey = storageKey.replace(this.STORAGE_KEY_PREFIX, '');
        const entryJson = localStorage.getItem(storageKey);

        if (entryJson) {
          const entry = JSON.parse(entryJson);

          // Only load if not expired
          if (!this.isExpired(entry)) {
            this.cache.set(cacheKey, entry);
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      }

      logger.info('Loaded cache from storage', { entriesCount: this.cache.size });
    } catch (error) {
      logger.warn('Failed to load cache from storage');
    }
  }

  /**
   * حذف من localStorage
   */
  private removeFromStorage(key: string): void {
    try {
      const storageKey = this.STORAGE_KEY_PREFIX + key;
      localStorage.removeItem(storageKey);
    } catch (error) {
      logger.warn('Failed to remove from storage', { key });
    }
  }

  /**
   * مسح جميع الـ Cache من localStorage
   */
  private clearStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(this.STORAGE_KEY_PREFIX)
      );

      for (const key of keys) {
        localStorage.removeItem(key);
      }

      localStorage.removeItem(this.STATS_STORAGE_KEY);
      logger.info('Cleared cache from storage');
    } catch (error) {
      logger.warn('Failed to clear storage');
    }
  }

  /**
   * إنشاء مفتاح Cache من الفلاتر
   */
  createCacheKey(prefix: string, filters: Record<string, unknown>): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((acc, key) => {
        acc[key] = filters[key];
        return acc;
      }, {} as Record<string, unknown>);

    return `${prefix}_${JSON.stringify(sortedFilters)}`;
  }

  /**
   * تصدير الـ Cache (للتصحيح)
   */
  exportCache(): Record<string, any> {
    const exported: Record<string, any> = {};

    this.cache.forEach((value, key) => {
      exported[key] = {
        ...value,
        age: Date.now() - value.timestamp,
      };
    });

    return exported;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const browserCacheStrategy = BrowserCacheStrategyService.getInstance();
export default browserCacheStrategy;
