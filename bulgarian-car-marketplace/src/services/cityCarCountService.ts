// City Car Count Service
// خدمة حساب السيارات حسب المدن البلغارية

import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { BULGARIAN_CITIES } from '../constants/bulgarianCities';

interface CityCount {
  count: number;
  timestamp: number;
}

export class CityCarCountService {
  private static cache: Record<string, CityCount> = {};
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Get car count for a specific city
   */
  static async getCarsCountByCity(cityId: string): Promise<number> {
    // Check cache first
    const cached = this.cache[cityId];
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`Cache hit for ${cityId}: ${cached.count}`);
      return cached.count;
    }

    try {
      const q = query(
        collection(db, 'cars'),
        where('location.city', '==', cityId),
        where('isActive', '==', true),
        where('isSold', '==', false)
      );

      // Use getCountFromServer for better performance
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;

      // Cache the result
      this.cache[cityId] = {
        count,
        timestamp: Date.now()
      };

      console.log(`Fetched count for ${cityId}: ${count}`);
      return count;
    } catch (error) {
      console.error(`Error fetching count for ${cityId}:`, error);
      
      // Return cached value if exists, otherwise 0
      if (cached) {
        return cached.count;
      }
      return 0;
    }
  }

  /**
   * Get car counts for all Bulgarian cities
   */
  static async getAllCityCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    // Fetch all counts in parallel for better performance
    const promises = BULGARIAN_CITIES.map(async (city) => {
      try {
        const count = await this.getCarsCountByCity(city.id);
        counts[city.id] = count;
      } catch (error) {
        console.error(`Error for city ${city.id}:`, error);
        counts[city.id] = 0;
      }
    });

    await Promise.allSettled(promises); // Use allSettled to not fail if one fails
    return counts;
  }

  /**
   * Clear cache for a specific city
   */
  static clearCacheForCity(cityId: string) {
    delete this.cache[cityId];
  }

  /**
   * Clear all cache
   */
  static clearAllCache() {
    this.cache = {};
  }

  /**
   * Refresh count for a specific city (force refresh)
   */
  static async refreshCityCount(cityId: string): Promise<number> {
    this.clearCacheForCity(cityId);
    return this.getCarsCountByCity(cityId);
  }

  /**
   * Get cities with most cars (top N)
   */
  static async getTopCities(limit: number = 10): Promise<Array<{ cityId: string; count: number }>> {
    const allCounts = await this.getAllCityCounts();
    
    return Object.entries(allCounts)
      .map(([cityId, count]) => ({ cityId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get cache status
   */
  static getCacheStatus(): { total: number; expired: number; valid: number } {
    const now = Date.now();
    const entries = Object.values(this.cache);
    
    return {
      total: entries.length,
      expired: entries.filter(e => now - e.timestamp >= this.CACHE_DURATION).length,
      valid: entries.filter(e => now - e.timestamp < this.CACHE_DURATION).length
    };
  }
}

export default CityCarCountService;


