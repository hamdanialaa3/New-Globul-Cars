// Region Car Count Service
// خدمة حساب السيارات حسب المحافظات البلغارية

import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { queryAllCollections, countAllVehicles, VEHICLE_COLLECTIONS } from './search/multi-collection-helper';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

interface RegionCount {
  count: number;
  timestamp: number;
}

export class RegionCarCountService {
  private static cache: Record<string, RegionCount> = {};
  private static CACHE_DURATION = 3 * 60 * 1000; // 3 minutes cache

  /**
   * Get car count for a specific region
   */
  static async getCarsCountByRegion(regionId: string): Promise<number> {
    // Check cache first
    const cached = this.cache[regionId];
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      serviceLogger.debug('Cache hit for region', { regionId, count: cached.count });
      return cached.count;
    }

    try {
      serviceLogger.debug('Fetching car count for region', { regionId });
      
      // ✅ Query ALL vehicle collections
      const cars = await queryAllCollections(
        where('status', '==', 'active'),
        where('region', '==', regionId)
      );

      const count = cars.length;

      // Cache the result
      this.cache[regionId] = {
        count,
        timestamp: Date.now()
      };

      serviceLogger.info('Fetched count for region', { regionId, count });
      return count;
    } catch (error) {
      serviceLogger.error('Error fetching count for region', error as Error, { regionId });
      
      // Return cached value if exists, otherwise 0
      if (cached) {
        serviceLogger.warn('Using stale cache for region', { regionId, count: cached.count });
        return cached.count;
      }
      return 0;
    }
  }

  /**
   * Get car counts for all Bulgarian regions (28 regions)
   */
  static async getAllRegionCounts(regionIds: string[]): Promise<Record<string, number>> {
    serviceLogger.info('Fetching car counts for all regions', { regionCount: regionIds.length });
    const counts: Record<string, number> = {};

    // Fetch all counts in parallel for better performance
    const promises = regionIds.map(async (regionId) => {
      try {
        const count = await this.getCarsCountByRegion(regionId);
        counts[regionId] = count;
      } catch (error) {
        serviceLogger.error('Error for region', error as Error, { regionId });
        counts[regionId] = 0;
      }
    });

    await Promise.allSettled(promises); // Use allSettled to not fail if one fails
    
    const totalCars = Object.values(counts).reduce((sum, count) => sum + count, 0);
    serviceLogger.info('Total cars across all regions', { totalCars, regionCount: regionIds.length });
    
    return counts;
  }

  /**
   * Clear cache for a specific region
   */
  static clearCacheForRegion(regionId: string) {
    delete this.cache[regionId];
    serviceLogger.debug('Cleared cache for region', { regionId });
  }

  /**
   * Clear all cache
   */
  static clearAllCache() {
    this.cache = {};
    serviceLogger.debug('Cleared all region cache', {});
  }

  /**
   * Refresh count for a specific region (force refresh)
   */
  static async refreshRegionCount(regionId: string): Promise<number> {
    this.clearCacheForRegion(regionId);
    return this.getCarsCountByRegion(regionId);
  }

  /**
   * Get regions with most cars (top N)
   */
  static async getTopRegions(regionIds: string[], limit: number = 10): Promise<Array<{ regionId: string; count: number }>> {
    const allCounts = await this.getAllRegionCounts(regionIds);
    
    return Object.entries(allCounts)
      .map(([regionId, count]) => ({ regionId, count }))
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

  /**
   * Get total cars across all regions
   */
  static async getTotalCars(regionIds: string[]): Promise<number> {
    const counts = await this.getAllRegionCounts(regionIds);
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  }
}

export default RegionCarCountService;


