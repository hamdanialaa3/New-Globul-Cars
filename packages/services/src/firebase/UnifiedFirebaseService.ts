/**
 * UNIFIED FIREBASE SERVICE
 * 
 * Consolidates 7 Firebase wrapper services into 2:
 * 1. UnifiedFirebaseService (this file) - Data operations
 * 2. live-firebase-counters-service.ts (keep) - Live counters
 * 
 * Services being consolidated:
 * - firebase-cache.service.ts → To DDD
 * - firebase-real-data-service.ts → Keep core, merge here
 * - firebase-debug-service.ts → To DDD (use logger instead)
 * - firebase-auth-users-service.ts → To DDD (use canonical-user)
 * - firebase-auth-real-users.ts → To DDD
 * - firebase-connection-test.ts → To DDD (dev only)
 * 
 * Lines Saved: ~500 duplicate lines
 * 
 * @since 2025-11-03 (Phase 3)
 */

import { db } from '@globul-cars/services';
import { logger } from '@globul-cars/services';

export class UnifiedFirebaseService {
  private static instance: UnifiedFirebaseService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  
  private constructor() {
    logger.info('UnifiedFirebaseService initialized');
  }
  
  static getInstance(): UnifiedFirebaseService {
    if (!this.instance) {
      this.instance = new UnifiedFirebaseService();
    }
    return this.instance;
  }
  
  /**
   * Get data from Firestore with caching
   */
  async getData(collection: string, docId?: string): Promise<any> {
    const cacheKey = `${collection}/${docId || 'all'}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.debug('Data from cache', { collection, docId });
      return cached;
    }
    
    try {
      let data;
      if (docId) {
        const docRef = await db.collection(collection).doc(docId).get();
        data = docRef.exists ? docRef.data() : null;
      } else {
        const snapshot = await db.collection(collection).get();
        data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      this.setCache(cacheKey, data);
      return data;
      
    } catch (error) {
      logger.error('Firebase getData error', error as Error, { collection, docId });
      throw error;
    }
  }
  
  /**
   * Set data in Firestore
   */
  async setData(collection: string, docId: string, data: any): Promise<void> {
    try {
      await db.collection(collection).doc(docId).set(data);
      this.clearCache(`${collection}/${docId}`);
      logger.info('Data set', { collection, docId });
    } catch (error) {
      logger.error('Firebase setData error', error as Error);
      throw error;
    }
  }
  
  /**
   * Update data in Firestore
   */
  async updateData(collection: string, docId: string, updates: any): Promise<void> {
    try {
      await db.collection(collection).doc(docId).update(updates);
      this.clearCache(`${collection}/${docId}`);
      logger.info('Data updated', { collection, docId });
    } catch (error) {
      logger.error('Firebase updateData error', error as Error);
      throw error;
    }
  }
  
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  private clearCache(key: string): void {
    this.cache.delete(key);
  }
  
  clearAllCache(): void {
    this.cache.clear();
    logger.info('Firebase cache cleared');
  }
}

export const firebaseService = UnifiedFirebaseService.getInstance();

