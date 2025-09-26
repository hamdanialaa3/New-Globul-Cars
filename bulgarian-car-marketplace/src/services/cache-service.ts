// src/services/cache-service.ts
// Professional Cache Service for Bulgarian Car Marketplace
// خدمة التخزين المؤقت المهنية لسوق السيارات البلغاري

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  namespace?: string; // Cache namespace for isolation
  compression?: boolean; // Enable compression for large data
  persistence?: boolean; // Persist cache to localStorage
}

export interface CacheEntry<T = any> {
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
 * خدمة التخزين المؤقت المهنية مع إزالة LRU والضغط
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
   * الحصول على قيمة من التخزين المؤقت
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
   * تعيين قيمة في التخزين المؤقت
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
   * حذف قيمة من التخزين المؤقت
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
   * التحقق من وجود المفتاح وأنه غير منتهي الصلاحية
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
   * الحصول على القيمة أو تعيينها (نمط cache-aside)
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
   * مسح جميع إدخالات التخزين المؤقت
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats.size = 0;
    this.stats.clears++;
  }

  /**
   * Get cache statistics
   * الحصول على إحصائيات التخزين المؤقت
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all keys
   * الحصول على جميع المفاتيح
   */
  keys(): string[] {
    return Array.from(this.cache.keys()).map(key => this.stripNamespace(key));
  }

  /**
   * Get cache size information
   * الحصول على معلومات حجم التخزين المؤقت
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
   * تسخين التخزين المؤقت بالبيانات الأولية
   */
  async warmUp(data: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      this.set(key, value);
    }
  }

  /**
   * Export cache data for backup
   * تصدير بيانات التخزين المؤقت للنسخ الاحتياطي
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
   * استيراد بيانات التخزين المؤقت من النسخ الاحتياطي
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
   * تدمير خدمة التخزين المؤقت
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
   * التحقق من انتهاء صلاحية الإدخال
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict least recently used entry
   * إزالة الإدخال الأقل استخداماً مؤخراً
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
   * تحديث ترتيب الوصول لـ LRU
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   * إزالة المفتاح من ترتيب الوصول
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Update hit rate
   * تحديث معدل الإصابة
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get full key with namespace
   * الحصول على المفتاح الكامل مع مساحة الاسم
   */
  private getFullKey(key: string): string {
    return `${this.config.namespace}:${key}`;
  }

  /**
   * Strip namespace from key
   * إزالة مساحة الاسم من المفتاح
   */
  private stripNamespace(fullKey: string): string {
    return fullKey.replace(`${this.config.namespace}:`, '');
  }

  /**
   * Estimate size of data in bytes
   * تقدير حجم البيانات بالبايت
   */
  private estimateSize(data: any): number {
    if (data === null || data === undefined) return 0;

    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return str.length * 2; // Rough estimate: 2 bytes per character
  }

  /**
   * Compress data (simple implementation)
   * ضغط البيانات (تنفيذ بسيط)
   */
  private compress(data: any): any {
    // In a real implementation, you would use a compression library
    // For now, just return the data as-is
    return data;
  }

  /**
   * Decompress data
   * فك ضغط البيانات
   */
  private decompress(data: any): any {
    // In a real implementation, you would use a decompression library
    return data;
  }

  /**
   * Clean up expired entries
   * تنظيف الإدخالات المنتهية الصلاحية
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
   * حفظ التخزين المؤقت في localStorage
   */
  private saveToPersistence(): void {
    try {
      const data = this.exportData();
      localStorage.setItem(`cache_${this.config.namespace}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to persistence:', error);
    }
  }

  /**
   * Load cache from localStorage
   * تحميل التخزين المؤقت من localStorage
   */
  private loadFromPersistence(): void {
    try {
      const data = localStorage.getItem(`cache_${this.config.namespace}`);
      if (data) {
        this.importData(JSON.parse(data));
      }
    } catch (error) {
      console.warn('Failed to load cache from persistence:', error);
    }
  }
}

// Pre-configured cache instances for different use cases
// مثيلات التخزين المؤقت المعدة مسبقاً للحالات المختلفة

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
// تصدير قديم للتوافق مع الإصدارات السابقة
export const cacheService = apiCache;