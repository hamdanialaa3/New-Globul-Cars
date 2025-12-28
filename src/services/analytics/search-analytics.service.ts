/**
 * Search Analytics Service
 * خدمة تحليلات البحث
 * 
 * Tracks:
 * - Search queries
 * - Click-through rates
 * - Popular searches
 * - Failed searches
 * - User behavior
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  Timestamp,
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '../logger-service';

interface SearchAnalyticEvent {
  userId?: string;
  sessionId: string;
  query: string;
  resultsCount: number;
  processingTime: number;
  source: 'direct' | 'autocomplete' | 'suggestion';
  filters?: Record<string, any>;
  timestamp: any;
  userAgent: string;
  language: string;
}

interface SearchClickEvent {
  searchId: string;
  carId: string;
  position: number;
  timestamp: any;
}

interface PopularSearch {
  query: string;
  count: number;
  avgResultsCount: number;
  lastSearched: Date;
}

interface FailedSearch {
  query: string;
  count: number;
  lastAttempted: Date;
}

class SearchAnalyticsService {
  private static instance: SearchAnalyticsService;
  private sessionId: string;

  private constructor() {
    // Generate unique session ID
    this.sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getInstance(): SearchAnalyticsService {
    if (!this.instance) {
      this.instance = new SearchAnalyticsService();
    }
    return this.instance;
  }

  /**
   * 📊 LOG SEARCH EVENT
   */
  async logSearch(event: Omit<SearchAnalyticEvent, 'sessionId' | 'timestamp' | 'userAgent'>): Promise<string> {
    try {
      const searchEvent: SearchAnalyticEvent = {
        ...event,
        sessionId: this.sessionId,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      };

      const docRef = await addDoc(collection(db, 'searchAnalytics'), searchEvent);
      
      // Update aggregated stats
      await this.updateAggregatedStats(event.query, event.resultsCount);

      logger.debug('Search event logged', { searchId: docRef.id });
      return docRef.id;

    } catch (error) {
      logger.error('Failed to log search', error as Error);
      return '';
    }
  }

  /**
   * 🖱️ LOG CLICK EVENT
   */
  async logClick(clickEvent: Omit<SearchClickEvent, 'timestamp'> & { userId?: string }): Promise<void> {
    try {
      // ✅ FIX: Only include userId if it's defined
      const clickData: any = {
        searchId: clickEvent.searchId,
        carId: clickEvent.carId,
        position: clickEvent.position,
        timestamp: serverTimestamp()
      };
      
      // Only add userId if it's provided and not undefined
      if (clickEvent.userId && clickEvent.userId !== undefined) {
        clickData.userId = clickEvent.userId;
      }

      await addDoc(collection(db, 'searchClicks'), clickData);

      // Update click-through rate for this search
      const searchRef = doc(db, 'searchAnalytics', clickEvent.searchId);
      await updateDoc(searchRef, {
        hasClick: true,
        clickedCarId: clickEvent.carId,
        clickPosition: clickEvent.position
      });

      logger.debug('Click event logged', { carId: clickEvent.carId });

    } catch (error) {
      logger.error('Failed to log click', error as Error);
    }
  }

  /**
   * 📈 GET POPULAR SEARCHES
   */
  async getPopularSearches(
    timeframe: 'day' | 'week' | 'month' | 'all' = 'week',
    limitCount: number = 20
  ): Promise<PopularSearch[]> {
    try {
      const startDate = this.getStartDate(timeframe);
      
      const q = query(
        collection(db, 'searchAggregates'),
        where('lastSearched', '>=', startDate),
        orderBy('count', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          query: data.query,
          count: data.count,
          avgResultsCount: data.avgResultsCount,
          lastSearched: data.lastSearched?.toDate() || new Date()
        };
      });

    } catch (error) {
      logger.error('Failed to get popular searches', error as Error);
      return [];
    }
  }

  /**
   * ❌ GET FAILED SEARCHES (0 results)
   */
  async getFailedSearches(
    timeframe: 'day' | 'week' | 'month' = 'week',
    limitCount: number = 20
  ): Promise<FailedSearch[]> {
    try {
      const startDate = this.getStartDate(timeframe);
      
      const q = query(
        collection(db, 'searchAnalytics'),
        where('resultsCount', '==', 0),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      
      // Aggregate by query
      const failedMap = new Map<string, { count: number; lastAttempted: Date }>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const existing = failedMap.get(data.query);
        
        if (existing) {
          existing.count++;
          if (data.timestamp?.toDate() > existing.lastAttempted) {
            existing.lastAttempted = data.timestamp.toDate();
          }
        } else {
          failedMap.set(data.query, {
            count: 1,
            lastAttempted: data.timestamp?.toDate() || new Date()
          });
        }
      });

      return Array.from(failedMap.entries())
        .map(([query, stats]) => ({ query, ...stats }))
        .sort((a, b) => b.count - a.count);

    } catch (error) {
      logger.error('Failed to get failed searches', error as Error);
      return [];
    }
  }

  /**
   * 📊 GET SEARCH STATS
   */
  async getSearchStats(timeframe: 'day' | 'week' | 'month' = 'week') {
    try {
      const startDate = this.getStartDate(timeframe);
      
      const q = query(
        collection(db, 'searchAnalytics'),
        where('timestamp', '>=', startDate)
      );

      const snapshot = await getDocs(q);
      
      let totalSearches = 0;
      let totalResults = 0;
      let zeroResultSearches = 0;
      let totalProcessingTime = 0;
      let autocompleteSearches = 0;
      let directSearches = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalSearches++;
        totalResults += data.resultsCount || 0;
        if (data.resultsCount === 0) zeroResultSearches++;
        totalProcessingTime += data.processingTime || 0;
        if (data.source === 'autocomplete') autocompleteSearches++;
        if (data.source === 'direct') directSearches++;
      });

      // Get clicks
      const clicksQuery = query(
        collection(db, 'searchClicks'),
        where('timestamp', '>=', startDate)
      );
      const clicksSnapshot = await getDocs(clicksQuery);
      const totalClicks = clicksSnapshot.size;

      return {
        totalSearches,
        avgResultsPerSearch: totalSearches > 0 ? totalResults / totalSearches : 0,
        zeroResultRate: totalSearches > 0 ? (zeroResultSearches / totalSearches) * 100 : 0,
        avgProcessingTime: totalSearches > 0 ? totalProcessingTime / totalSearches : 0,
        clickThroughRate: totalSearches > 0 ? (totalClicks / totalSearches) * 100 : 0,
        autocompleteUsage: totalSearches > 0 ? (autocompleteSearches / totalSearches) * 100 : 0,
        directSearchUsage: totalSearches > 0 ? (directSearches / totalSearches) * 100 : 0
      };

    } catch (error) {
      logger.error('Failed to get search stats', error as Error);
      return null;
    }
  }

  /**
   * 📈 GET SEARCH TRENDS (over time)
   */
  async getSearchTrends(days: number = 7): Promise<Array<{ date: string; searches: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'searchAnalytics'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(q);
      
      // Group by date
      const trendsMap = new Map<string, number>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp?.toDate().toISOString().split('T')[0];
        trendsMap.set(date, (trendsMap.get(date) || 0) + 1);
      });

      return Array.from(trendsMap.entries())
        .map(([date, searches]) => ({ date, searches }))
        .sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
      logger.error('Failed to get search trends', error as Error);
      return [];
    }
  }

  /**
   * 🔧 PRIVATE: Update aggregated stats
   */
  private async updateAggregatedStats(query: string, resultsCount: number): Promise<void> {
    try {
      const aggregateRef = doc(db, 'searchAggregates', query.toLowerCase());
      
      await updateDoc(aggregateRef, {
        count: increment(1),
        totalResults: increment(resultsCount),
        lastSearched: serverTimestamp()
      }).catch(async () => {
        // Document doesn't exist, create it
        await addDoc(collection(db, 'searchAggregates'), {
          query: query.toLowerCase(),
          count: 1,
          totalResults: resultsCount,
          avgResultsCount: resultsCount,
          lastSearched: serverTimestamp()
        });
      });

    } catch (error) {
      logger.error('Failed to update aggregated stats', error as Error);
    }
  }

  /**
   * 🔧 PRIVATE: Get start date for timeframe
   */
  private getStartDate(timeframe: 'day' | 'week' | 'month' | 'all'): Timestamp {
    const now = new Date();
    
    switch (timeframe) {
      case 'day':
        now.setDate(now.getDate() - 1);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        now.setFullYear(now.getFullYear() - 10); // 10 years back
        break;
    }
    
    return Timestamp.fromDate(now);
  }
}

export const searchAnalyticsService = SearchAnalyticsService.getInstance();
export default searchAnalyticsService;
