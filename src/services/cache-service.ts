// src/services/cache-service.ts
// Professional Cache Service for Koli One
// (Comment removed - was in Arabic)

import { serviceLogger } from './logger-service';

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  namespace?: string; // Cache namespace for isolation
  compression?: boolean; // Enable compression for large data
  persistence?: boolean; // Persist cache to localStorage
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated size in bytes
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  clears: number;
  evictions: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

/**
 * Professional Cache Service with LRU eviction and compression
 * Provides advanced caching with LRU eviction, TTL, compression, and persistence
 * 
 * Usage:
 * ```typescript
 * import { createCacheService } from '../services/cache-service';
 * 
 * const cache = createCacheService({
 *   ttl: 5 * 60 * 1000, // 5 minutes
 *   maxSize: 100,
 *   namespace: 'cars'
 * });
 * 
 * cache.set('car-123', carData);
 * const car = cache.get('car-123');
 * ```
 */
export class CacheService {
  private config: Required<CacheConfig>;
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = []; // For LRU eviction
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    this.config = {
      namespace: 'default',
      compression: false,
      persistence: false,
      ...config
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0,
      evictions: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRate: 0
    };

    // Load persisted cache if enabled
    if (this.config.persistence) {
      this.loadFromPersistence();
    }

    // Periodic cleanup
    this.cleanupInterval = setInterval(() => this.cleanup(), 30000); // Every 30 seconds

    // Save to persistence periodically if enabled
    if (this.config.persistence) {
      setInterval(() => this.saveToPersistence(), 60000); // Every minute
    }
  }

  /**
   * Get value from cache
   * (Comment removed - was in Arabic)
   */
  get<T = any>(key: string): T | null {
    const fullKey = this.getFullKey(key);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateAccessOrder(fullKey);

    this.stats.hits++;
    this.updateHitRate();

    return this.config.compression ? this.decompress(entry.data) : entry.data;
  }

  /**
   * Set value in cache
   * (Comment removed - was in Arabic)
   */
  set<T = any>(key: string, value: T, customTtl?: number): void {
    const fullKey = this.getFullKey(key);
    const ttl = customTtl || this.config.ttl;
    const compressedValue = this.config.compression ? this.compress(value) : value;
    const size = this.estimateSize(compressedValue);

    // Check if we need to evict entries
    if (!this.cache.has(fullKey) && this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data: compressedValue,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      size
    };

    const existingEntry = this.cache.get(fullKey);
    if (existingEntry) {
      this.stats.size -= existingEntry.size;
    }

    this.cache.set(fullKey, entry);
    this.stats.size += size;
    this.updateAccessOrder(fullKey);
    this.stats.sets++;
  }

  /**
   * Delete value from cache
   * (Comment removed - was in Arabic)
   */
  delete(key: string): boolean {
    const fullKey = this.getFullKey(key);
    const entry = this.cache.get(fullKey);

    if (entry) {
      this.stats.size -= entry.size;
      this.cache.delete(fullKey);
      this.removeFromAccessOrder(fullKey);
      this.stats.deletes++;
      return true;
    }

    return false;
  }

  /**
   * Check if key exists and is not expired
   * (Comment removed - was in Arabic)
   */
  has(key: string): boolean {
    const fullKey = this.getFullKey(key);
    const entry = this.cache.get(fullKey);

    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get or set value (cache-aside pattern)
   * (Comment removed - was in Arabic)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    let value = this.get<T>(key);

    if (value === null) {
      value = await fetcher();
      this.set(key, value, customTtl);
    }

    return value;
  }

  /**
   * Clear all cache entries
   * (Comment removed - was in Arabic)
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats.size = 0;
    this.stats.clears++;
  }

  /**
   * Get cache statistics
   * (Comment removed - was in Arabic)
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all keys
   * (Comment removed - was in Arabic)
   */
  keys(): string[] {
    return Array.from(this.cache.keys()).map(key => this.stripNamespace(key));
  }

  /**
   * Get cache size information
   * (Comment removed - was in Arabic)
   */
  getSizeInfo(): {
    entries: number;
    maxEntries: number;
    sizeBytes: number;
    utilizationPercent: number;
  } {
    return {
      entries: this.cache.size,
      maxEntries: this.config.maxSize,
      sizeBytes: this.stats.size,
      utilizationPercent: (this.cache.size / this.config.maxSize) * 100
    };
  }

  /**
   * Warm up cache with initial data
   * (Comment removed - was in Arabic)
   */
  async warmUp(data: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      this.set(key, value);
    }
  }

  /**
   * Export cache data for backup
   * (Comment removed - was in Arabic)
   */
  exportData(): Record<string, CacheEntry> {
    const data: Record<string, CacheEntry> = {};
    for (const [key, entry] of this.cache.entries()) {
      data[key] = {
        ...entry,
        data: this.config.compression ? this.decompress(entry.data) : entry.data
      };
    }
    return data;
  }

  /**
   * Import cache data from backup
   * (Comment removed - was in Arabic)
   */
  importData(data: Record<string, CacheEntry>): void {
    this.clear();
    for (const [key, entry] of Object.entries(data)) {
      this.cache.set(key, entry);
      this.accessOrder.push(key);
      this.stats.size += entry.size;
    }
  }

  /**
   * Destroy cache service
   * (Comment removed - was in Arabic)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.config.persistence) {
      this.saveToPersistence();
    }

    this.clear();
  }

  /**
   * Check if entry is expired
   * (Comment removed - was in Arabic)
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict least recently used entry
   * (Comment removed - was in Arabic)
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder.shift();
    if (lruKey) {
      const entry = this.cache.get(lruKey);
      if (entry) {
        this.stats.size -= entry.size;
        this.stats.evictions++;
      }
      this.cache.delete(lruKey);
    }
  }

  /**
   * Update access order for LRU
   * (Comment removed - was in Arabic)
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   * (Comment removed - was in Arabic)
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Update hit rate
   * (Comment removed - was in Arabic)
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get full key with namespace
   * (Comment removed - was in Arabic)
   */
  private getFullKey(key: string): string {
    return `${this.config.namespace}:${key}`;
  }

  /**
   * Strip namespace from key
   * (Comment removed - was in Arabic)
   */
  private stripNamespace(fullKey: string): string {
    return fullKey.replace(`${this.config.namespace}:`, '');
  }

  /**
   * Estimate size of data in bytes
   * (Comment removed - was in Arabic)
   */
  private estimateSize(data: unknown): number {
    if (data === null || data === undefined) return 0;

    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return str.length * 2; // Rough estimate: 2 bytes per character
  }

  /**
   * Compress data (simple implementation)
   * (Comment removed - was in Arabic)
   */
  private compress(data: unknown): string {
    // In a real implementation, you would use a compression library
    // For now, just return the data as-is
    return data;
  }

  /**
   * Decompress data
   * (Comment removed - was in Arabic)
   */
  private decompress(data: unknown): unknown {
    // In a real implementation, you would use a decompression library
    return data;
  }

  /**
   * Clean up expired entries
   * (Comment removed - was in Arabic)
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(this.stripNamespace(key));
    }
  }

  /**
   * Save cache to localStorage
   * (Comment removed - was in Arabic)
   */
  private saveToPersistence(): void {
    try {
      const data = this.exportData();
      localStorage.setItem(`cache_${this.config.namespace}`, JSON.stringify(data));
    } catch (error) {
      serviceLogger.warn('Failed to save cache to persistence', { namespace: this.config.namespace, error });
    }
  }

  /**
   * Load cache from localStorage
   * (Comment removed - was in Arabic)
   */
  private loadFromPersistence(): void {
    try {
      const data = localStorage.getItem(`cache_${this.config.namespace}`);
      if (data) {
        this.importData(JSON.parse(data));
      }
    } catch (error) {
      serviceLogger.warn('Failed to load cache from persistence', { namespace: this.config.namespace, error });
    }
  }
}

// Pre-configured cache instances for different use cases
// (Comment removed - was in Arabic)

export const apiCache = new CacheService({
  ttl: 300000, // 5 minutes
  maxSize: 100,
  namespace: 'api'
});

export const userCache = new CacheService({
  ttl: 600000, // 10 minutes
  maxSize: 50,
  namespace: 'user',
  persistence: true
});

export const socialMediaCache = new CacheService({
  ttl: 180000, // 3 minutes
  maxSize: 200,
  namespace: 'social-media'
});

// Legacy export for backward compatibility
// (Comment removed - was in Arabic)
export const cacheService = apiCache;
