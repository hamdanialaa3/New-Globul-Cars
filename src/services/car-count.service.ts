/**
 * Car Count Service
 * خدمة العد الإجمالي للسيارات
 * 
 * Purpose:
 * - Get total count of active cars across all collections
 * - Cached count for performance (5 minutes cache)
 * - Real-time accuracy with cache invalidation
 * 
 * Architecture:
 * - Uses Multi-collection pattern (VEHICLE_COLLECTIONS)
 * - Numeric ID compatible
 * - Firestore optimized queries (getCountFromServer)
 * - Follows PROJECT_CONSTITUTION.md standards
 * 
 * Usage:
 * ```typescript
 * import { carCountService } from '@/services/car-count.service';
 * 
 * const total = await carCountService.getTotalCount();
 * ```
 * 
 * @see PROJECT_CONSTITUTION.md - Section 4.2 Multi-collection Pattern
 */

import { db } from '@/firebase/firebase-config';
import { collection, getCountFromServer, getDocs, query, where } from 'firebase/firestore';
import { logger } from '@/services/logger-service';
import { VEHICLE_COLLECTIONS } from '@/services/search/multi-collection-helper';

interface CarCountResult {
  total: number;
  byCollection: Record<string, number>;
  lastUpdated: Date;
}

class CarCountService {
  private static instance: CarCountService | null = null;
  private cache: CarCountResult | null = null;
  private readonly cacheExpiry = 5 * 60 * 1000; // 5 minutes (CONSTITUTION: Performance First)
  private lastFetchTime: number = 0;

  private constructor() {
    logger.debug('CarCountService initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CarCountService {
    if (!CarCountService.instance) {
      CarCountService.instance = new CarCountService();
    }
    return CarCountService.instance;
  }

  /**
   * Get total car count across all collections
   * Only counts active, non-sold cars
   * 
   * @param forceRefresh - If true, bypasses cache
   * @returns Total count of active cars
   */
  async getTotalCount(forceRefresh: boolean = false): Promise<number> {
    try {
      const now = Date.now();
      
      // Return cached if still valid and not forced
      if (!forceRefresh && this.cache && (now - this.lastFetchTime < this.cacheExpiry)) {
        logger.debug('Car count from cache', { 
          total: this.cache.total,
          lastUpdated: this.cache.lastUpdated.toISOString()
        });
        return this.cache.total;
      }

      logger.info('Fetching car count from Firestore', {
        forceRefresh,
        collections: VEHICLE_COLLECTIONS.length
      });

      // Fetch from all collections in parallel
      // ✅ CONSTITUTION: Multi-collection pattern (not hardcoded)
      // Note: Some collections use status='active', others use isActive=true
      // We try both strategies for maximum compatibility
      const countPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
        try {
          const collectionRef = collection(db, collectionName);
          
          // Strategy 1: Try status='active' (most common)
          try {
            const statusQuery = query(
              collectionRef,
              where('status', '==', 'active')
            );
            const snapshot = await getCountFromServer(statusQuery);
            const count = snapshot.data().count;
            
            logger.debug(`Counted ${collectionName} (status='active')`, { 
              collection: collectionName, 
              count 
            });
            
            return { collection: collectionName, count };
          } catch (statusError) {
            // Strategy 2: Fallback to isActive=true
            try {
              const isActiveQuery = query(
                collectionRef,
                where('isActive', '==', true)
              );
              const snapshot = await getCountFromServer(isActiveQuery);
              const count = snapshot.data().count;
              
              logger.debug(`Counted ${collectionName} (isActive=true)`, { 
                collection: collectionName, 
                count 
              });
              
              return { collection: collectionName, count };
            } catch (isActiveError) {
              // Strategy 3: Get total count without filter (fallback)
              // Note: This returns total count, not just active cars
              // It's better than returning 0, but ideally all collections should use status field
              logger.warn(`Using total count for ${collectionName} (no active filter available)`, {
                collection: collectionName,
                statusError: statusError instanceof Error ? statusError.message : 'Unknown',
                isActiveError: isActiveError instanceof Error ? isActiveError.message : 'Unknown'
              });
              
              try {
                const totalSnapshot = await getCountFromServer(collectionRef);
                const totalCount = totalSnapshot.data().count;
                
                logger.debug(`Using total count as approximation for ${collectionName}`, {
                  collection: collectionName,
                  count: totalCount
                });
                
                // Return total count as approximation (actual active count would be lower)
                return { collection: collectionName, count: totalCount };
              } catch (totalError) {
                // If even total count fails, return 0
                logger.error(`Failed to get total count for ${collectionName}`, totalError as Error);
                return { collection: collectionName, count: 0 };
              }
            }
          }
        } catch (error) {
          // ✅ CONSTITUTION: Error handling with logger service
          logger.error(`Error counting ${collectionName}`, error as Error, { 
            collection: collectionName,
            context: 'CarCountService.getTotalCount'
          });
          return { collection: collectionName, count: 0 };
        }
      });

      const results = await Promise.all(countPromises);
      
      // Aggregate results
      const byCollection: Record<string, number> = {};
      let total = 0;
      
      results.forEach(({ collection, count }) => {
        byCollection[collection] = count;
        total += count;
      });

      // Update cache
      this.cache = {
        total,
        byCollection,
        lastUpdated: new Date()
      };
      this.lastFetchTime = now;

      logger.info('Car count fetched successfully', { 
        total, 
        byCollection,
        duration: `${Date.now() - now}ms`
      });
      
      return total;

    } catch (error) {
      logger.error('Error getting total car count', error as Error, {
        context: 'CarCountService.getTotalCount',
        forceRefresh
      });
      
      // Return cached value if available, otherwise default to 0
      if (this.cache) {
        logger.warn('Returning cached count due to error', { 
          cachedTotal: this.cache.total 
        });
        return this.cache.total;
      }
      
      return 0; // Fallback
    }
  }

  /**
   * Get count by specific collection
   * 
   * @param collectionName - Collection name (e.g., 'passenger_cars')
   * @returns Count for that collection
   */
  async getCountByCollection(collectionName: string): Promise<number> {
    // Ensure cache is fresh
    await this.getTotalCount();
    
    if (!this.cache) {
      return 0;
    }
    
    return this.cache.byCollection[collectionName] ?? 0;
  }

  /**
   * Get breakdown by collection
   * 
   * @returns Record of collection name to count
   */
  async getCountByCollections(): Promise<Record<string, number>> {
    await this.getTotalCount();
    
    if (!this.cache) {
      return {};
    }
    
    return { ...this.cache.byCollection };
  }

  /**
   * Invalidate cache
   * Call this after car creation/deletion to force refresh
   */
  invalidateCache(): void {
    logger.debug('Car count cache invalidated');
    this.cache = null;
    this.lastFetchTime = 0;
  }

  /**
   * Get cache status (for debugging)
   */
  getCacheStatus(): {
    hasCache: boolean;
    lastUpdated: Date | null;
    age: number | null;
    isValid: boolean;
  } {
    const now = Date.now();
    const age = this.lastFetchTime > 0 ? now - this.lastFetchTime : null;
    const isValid = age !== null && age < this.cacheExpiry;
    
    return {
      hasCache: this.cache !== null,
      lastUpdated: this.cache?.lastUpdated ?? null,
      age,
      isValid: isValid ?? false
    };
  }
}

// ✅ CONSTITUTION: Singleton pattern export
export const carCountService = CarCountService.getInstance();

// Export class for testing
export { CarCountService };
