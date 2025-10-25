// City Car Count Caching Service
// localStorage caching للـ city counts لتقليل Firestore reads بنسبة 99%

import { serviceLogger } from './logger-wrapper';

interface CachedData {
  data: Record<string, number>;
  timestamp: number;
}

const CACHE_KEY = 'cityCarCounts';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export class CityCarCountCache {
  /**
   * Get cached city counts if available and not expired
   */
  static get(): Record<string, number> | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp }: CachedData = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - timestamp > CACHE_DURATION) {
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      serviceLogger.error('Error reading city car count cache', error as Error);
      this.clear();
      return null;
    }
  }

  /**
   * Set city counts in cache
   */
  static set(data: Record<string, number>): void {
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      serviceLogger.error('Error setting city car count cache', error as Error);
      // If quota exceeded, clear cache and try again
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clear();
      }
    }
  }

  /**
   * Clear cache
   */
  static clear(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      serviceLogger.error('Error clearing city car count cache', error as Error);
    }
  }

  /**
   * Check if cache exists and is valid
   */
  static isValid(): boolean {
    const cached = this.get();
    return cached !== null;
  }

  /**
   * Get cache age in milliseconds
   */
  static getAge(): number | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { timestamp }: CachedData = JSON.parse(cached);
      return Date.now() - timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get time until cache expires (in milliseconds)
   */
  static getTimeUntilExpiry(): number | null {
    const age = this.getAge();
    if (age === null) return null;
    
    const remaining = CACHE_DURATION - age;
    return remaining > 0 ? remaining : 0;
  }
}

