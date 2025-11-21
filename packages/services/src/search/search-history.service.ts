// Search History Service - Track and Manage User Search History
// خدمة تاريخ البحث - تتبع وإدارة تاريخ بحث المستخدم
// 🎯 100% Real - Firestore Backend

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  Timestamp,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';

interface SearchHistoryEntry {
  id: string;
  userId: string;
  query: string;
  filters: any;
  resultsCount: number;
  timestamp: Timestamp;
}

class SearchHistoryService {
  private collectionName = 'searchHistory';

  /**
   * Save search to history
   * حفظ البحث في التاريخ
   */
  async saveSearch(
    userId: string,
    query: string,
    filters: any = {},
    resultsCount: number = 0
  ): Promise<void> {
    try {
      // Don't save empty searches
      if (!query.trim()) return;
      
      await addDoc(collection(db, this.collectionName), {
        userId,
        query: query.trim(),
        filters,
        resultsCount,
        timestamp: serverTimestamp()
      });
      
      serviceLogger.debug('Search saved to history', { userId, query });
      
    } catch (error) {
      serviceLogger.warn('Failed to save search history', { error: (error as Error).message });
      // Don't throw - history is not critical
    }
  }

  /**
   * Get user's recent searches
   * الحصول على عمليات البحث الأخيرة للمستخدم
   */
  async getRecentSearches(
    userId: string,
    limit: number = 10
  ): Promise<SearchHistoryEntry[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SearchHistoryEntry[];
      
    } catch (error) {
      serviceLogger.warn('Failed to get recent searches', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * Get popular searches across all users
   * الحصول على عمليات البحث الشائعة لجميع المستخدمين
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      // Get recent searches across all users
      const q = query(
        collection(db, this.collectionName),
        orderBy('timestamp', 'desc'),
        firestoreLimit(100) // Get last 100 searches
      );
      
      const snapshot = await getDocs(q);
      
      // Count frequency
      const frequency: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const query = doc.data().query;
        frequency[query] = (frequency[query] || 0) + 1;
      });
      
      // Sort by frequency
      const sorted = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([query]) => query);
      
      return sorted;
      
    } catch (error) {
      serviceLogger.warn('Failed to get popular searches', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * Clear user's search history
   * مسح تاريخ بحث المستخدم
   */
  async clearHistory(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      serviceLogger.info('Search history cleared', { userId, count: snapshot.size });
      
    } catch (error) {
      serviceLogger.error('Failed to clear search history', error as Error);
      throw error;
    }
  }

  /**
   * Get search statistics
   * الحصول على إحصائيات البحث
   */
  async getSearchStats(userId: string): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    topSearches: Array<{ query: string; count: number }>;
  }> {
    try {
      const searches = await this.getRecentSearches(userId, 100);
      
      const uniqueQueries = new Set(searches.map(s => s.query));
      
      // Count frequency
      const frequency: Record<string, number> = {};
      searches.forEach(s => {
        frequency[s.query] = (frequency[s.query] || 0) + 1;
      });
      
      const topSearches = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([query, count]) => ({ query, count }));
      
      return {
        totalSearches: searches.length,
        uniqueQueries: uniqueQueries.size,
        topSearches
      };
      
    } catch (error) {
      serviceLogger.error('Failed to get search stats', error as Error);
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        topSearches: []
      };
    }
  }
}

export const searchHistoryService = new SearchHistoryService();
export default searchHistoryService;

