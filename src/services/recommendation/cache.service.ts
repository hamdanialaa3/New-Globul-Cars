/**
 * 💾 Recommendation Cache Service
 * Caches recommendations for performance
 * 
 * @description Provides fast recommendation retrieval with TTL-based caching
 * @features
 * - User-specific caching
 * - Session-specific caching
 * - TTL (10 minutes default)
 * - Cache invalidation
 * - Memory + localStorage hybrid
 * 
 * @version 1.0.0
 */

import { logger } from '../logger-service';

import { RecommendationResponse, RecommendationCache } from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 50;
const STORAGE_KEY = 'koli_one_recommendation_cache';

// ============================================================================
// MEMORY CACHE
// ============================================================================

const memoryCache: Map<string, RecommendationCache> = new Map();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate cache key
 */
const generateCacheKey = (userId?: string, sessionId?: string, filters?: Record<string, unknown>): string => {
  const parts = [
    userId || 'anonymous',
    sessionId || 'no-session'
  ];
  
  if (filters) {
    const filterStr = Object.entries(filters)
      .filter(([_, v]) => v !== undefined && v !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
      .join('|');
    parts.push(filterStr);
  }
  
  return parts.join('::');
};

/**
 * Check if cache entry is expired
 */
const isExpired = (cache: RecommendationCache): boolean => {
  return Date.now() > cache.expiresAt;
};

/**
 * Load cache from localStorage
 */
const loadFromStorage = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const entries: RecommendationCache[] = JSON.parse(stored);
    const now = Date.now();
    
    // Load non-expired entries into memory
    entries.forEach(entry => {
      if (entry.expiresAt > now) {
        memoryCache.set(entry.key, entry);
      }
    });
    
    logger.debug('[CacheService] Loaded from storage', { 
      entries: memoryCache.size 
    });
  } catch (err) {
    logger.error('[CacheService] Failed to load from storage:', err);
  }
};

/**
 * Save cache to localStorage
 */
const saveToStorage = (): void => {
  try {
    const entries = Array.from(memoryCache.values())
      .filter(entry => !isExpired(entry))
      .slice(-MAX_CACHE_ENTRIES);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    logger.error('[CacheService] Failed to save to storage:', err);
  }
};

// Initialize from storage
if (typeof window !== 'undefined') {
  loadFromStorage();
}

// ============================================================================
// CACHE SERVICE
// ============================================================================

class RecommendationCacheService {
  /**
   * Get cached recommendations
   */
  get(
    userId?: string,
    sessionId?: string,
    filters?: Record<string, unknown>
  ): RecommendationResponse | null {
    const key = generateCacheKey(userId, sessionId, filters);
    const cached = memoryCache.get(key);
    
    if (!cached) {
      logger.debug('[CacheService] Cache miss', { key });
      return null;
    }
    
    if (isExpired(cached)) {
      logger.debug('[CacheService] Cache expired', { key });
      memoryCache.delete(key);
      return null;
    }
    
    // Update hit count
    cached.hitCount++;
    
    logger.debug('[CacheService] Cache hit', { 
      key, 
      hitCount: cached.hitCount,
      age: Math.round((Date.now() - cached.createdAt) / 1000) + 's'
    });
    
    return {
      ...cached.response,
      cached: true,
      cacheKey: key
    };
  }
  
  /**
   * Set cached recommendations
   */
  set(
    response: RecommendationResponse,
    userId?: string,
    sessionId?: string,
    filters?: Record<string, unknown>,
    ttl = CACHE_TTL
  ): void {
    const key = generateCacheKey(userId, sessionId, filters);
    const currentTime = Date.now();
    
    const cacheEntry: RecommendationCache = {
      key,
      response: {
        ...response,
        cached: false,
        cacheKey: key
      },
      createdAt: currentTime,
      expiresAt: currentTime + ttl,
      hitCount: 0
    };
    
    memoryCache.set(key, cacheEntry);
    
    // Cleanup old entries if over limit
    if (memoryCache.size > MAX_CACHE_ENTRIES) {
      this.cleanup();
    }
    
    // Save to storage (debounced would be better in production)
    saveToStorage();
    
    logger.debug('[CacheService] Cache set', { 
      key,
      expiresIn: Math.round(ttl / 1000) + 's',
      carsCount: response.cars.length
    });
  }
  
  /**
   * Invalidate cache for user/session
   */
  invalidate(userId?: string, sessionId?: string): void {
    const prefix = [userId || 'anonymous', sessionId || ''].join('::');
    
    let invalidated = 0;
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
        invalidated++;
      }
    }
    
    saveToStorage();
    
    logger.info('[CacheService] Cache invalidated', { 
      prefix,
      invalidated 
    });
  }
  
  /**
   * Invalidate all cache
   */
  invalidateAll(): void {
    const size = memoryCache.size;
    memoryCache.clear();
    localStorage.removeItem(STORAGE_KEY);
    
    logger.info('[CacheService] All cache invalidated', { 
      cleared: size 
    });
  }
  
  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    let cleaned = 0;
    
    for (const [key, entry] of memoryCache.entries()) {
      if (isExpired(entry)) {
        memoryCache.delete(key);
        cleaned++;
      }
    }
    
    // If still over limit, remove oldest
    if (memoryCache.size > MAX_CACHE_ENTRIES) {
      const entries = Array.from(memoryCache.entries())
        .sort((a, b) => a[1].createdAt - b[1].createdAt);
      
      const toRemove = entries.slice(0, memoryCache.size - MAX_CACHE_ENTRIES);
      toRemove.forEach(([key]) => {
        memoryCache.delete(key);
        cleaned++;
      });
    }
    
    if (cleaned > 0) {
      saveToStorage();
      logger.debug('[CacheService] Cleanup completed', { cleaned });
    }
  }
  
  /**
   * Get cache stats
   */
  getStats(): {
    entries: number;
    totalHits: number;
    avgAge: number;
  } {
    const entries = Array.from(memoryCache.values());
    const now = Date.now();
    
    const totalHits = entries.reduce((sum, e) => sum + e.hitCount, 0);
    const avgAge = entries.length > 0
      ? entries.reduce((sum, e) => sum + (now - e.createdAt), 0) / entries.length
      : 0;
    
    return {
      entries: entries.length,
      totalHits,
      avgAge: Math.round(avgAge / 1000) // seconds
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cacheService = new RecommendationCacheService();

// Periodic cleanup (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheService.cleanup();
  }, 5 * 60 * 1000);
}

export default cacheService;
