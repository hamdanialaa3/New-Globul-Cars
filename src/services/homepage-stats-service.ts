/**
 * Homepage Stats Service
 * Real platform metrics for homepage sections
 *
 * Pattern: Singleton + TTL cache (same as car-count.service.ts)
 * Uses getCountFromServer() for lightweight queries
 *
 * @see car-count.service.ts for reference pattern
 */

import { db } from '@/firebase/firebase-config';
import {
  collection,
  getCountFromServer,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { logger } from '@/services/logger-service';
import { carCountService } from '@/services/car-count.service';

export interface HomepageStats {
  totalActiveCars: number;
  totalUsers: number;
  totalDealers: number;
  totalVerifiedDealers: number;
  carsListedThisWeek: number;
  lastUpdated: Date;
}

class HomepageStatsService {
  private static instance: HomepageStatsService | null = null;
  private cache: HomepageStats | null = null;
  private readonly cacheExpiry = 10 * 60 * 1000; // 10 minutes
  private lastFetchTime: number = 0;
  private fetchPromise: Promise<HomepageStats> | null = null;

  private constructor() {
    logger.debug('HomepageStatsService initialized');
  }

  public static getInstance(): HomepageStatsService {
    if (!HomepageStatsService.instance) {
      HomepageStatsService.instance = new HomepageStatsService();
    }
    return HomepageStatsService.instance;
  }

  async getStats(forceRefresh: boolean = false): Promise<HomepageStats> {
    const now = Date.now();

    // Return cached if still valid
    if (
      !forceRefresh &&
      this.cache &&
      now - this.lastFetchTime < this.cacheExpiry
    ) {
      return this.cache;
    }

    // Deduplicate concurrent calls
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.fetchAllStats(now);
    try {
      const result = await this.fetchPromise;
      return result;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async fetchAllStats(now: number): Promise<HomepageStats> {
    try {
      logger.info('Fetching homepage stats from Firestore');

      const sevenDaysAgo = Timestamp.fromDate(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      const [
        totalActiveCars,
        totalUsersSnap,
        totalDealersSnap,
        totalVerifiedDealersSnap,
      ] = await Promise.all([
        carCountService.getTotalCount(),
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(
          query(collection(db, 'users'), where('role', '==', 'dealer'))
        ).catch(() => ({ data: () => ({ count: 0 }) })),
        getCountFromServer(
          query(
            collection(db, 'users'),
            where('isVerified', '==', true),
            where('role', '==', 'dealer')
          )
        ).catch(() => ({ data: () => ({ count: 0 }) })),
      ]);

      // Cars listed this week — try across main collection
      let carsThisWeek = 0;
      try {
        const recentSnap = await getCountFromServer(
          query(collection(db, 'cars'), where('createdAt', '>=', sevenDaysAgo))
        );
        carsThisWeek = recentSnap.data().count;
      } catch {
        logger.warn('Could not query carsListedThisWeek, defaulting to 0');
      }

      const stats: HomepageStats = {
        totalActiveCars,
        totalUsers: totalUsersSnap.data().count,
        totalDealers: totalDealersSnap.data().count,
        totalVerifiedDealers: totalVerifiedDealersSnap.data().count,
        carsListedThisWeek: carsThisWeek,
        lastUpdated: new Date(),
      };

      // Update cache
      this.cache = stats;
      this.lastFetchTime = now;

      logger.info('Homepage stats fetched', {
        totalActiveCars: stats.totalActiveCars,
        totalUsers: stats.totalUsers,
        totalDealers: stats.totalDealers,
      });

      return stats;
    } catch (error) {
      logger.error('Error fetching homepage stats', error as Error);

      if (this.cache) {
        logger.warn('Returning cached stats due to error');
        return this.cache;
      }

      return {
        totalActiveCars: 0,
        totalUsers: 0,
        totalDealers: 0,
        totalVerifiedDealers: 0,
        carsListedThisWeek: 0,
        lastUpdated: new Date(),
      };
    }
  }
}

export const homepageStatsService = HomepageStatsService.getInstance();
