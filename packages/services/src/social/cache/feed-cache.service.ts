// Feed Cache Service - 3-Layer Caching System
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';
import { Post } from '../posts.service';
import { CachedFeed, isExpired } from '@globul-cars/core/typessocial-feed.types';
import { logger } from '../../logger-service';

class FeedCacheService {
  // Cache TTLs
  private readonly MEMORY_TTL = 60000;      // 1 minute
  private readonly IDB_TTL = 300000;        // 5 minutes
  private readonly FIRESTORE_TTL = 3600000; // 1 hour

  // Layer 1: Memory cache
  private memoryCache = new Map<string, CachedFeed>();

  // Layer 2: IndexedDB
  private idbName = 'social-feed-cache';
  private idbVersion = 1;
  private idbStore = 'feeds';

  // Get feed from cache (all layers)
  async getCachedFeed(userId: string): Promise<Post[] | null> {
    try {
      // Layer 1: Memory
      const memCache = this.memoryCache.get(userId);
      if (memCache && !isExpired(memCache.expiresAt)) {
        return memCache.posts;
      }

      // Layer 2: IndexedDB
      const idbCache = await this.getFromIndexedDB(userId);
      if (idbCache && !isExpired(idbCache.expiresAt)) {
        this.memoryCache.set(userId, idbCache);
        return idbCache.posts;
      }

      // Layer 3: Firestore
      const firestoreCache = await this.getFromFirestore(userId);
      if (firestoreCache && !isExpired(firestoreCache.expiresAt)) {
        await this.saveToAllLayers(userId, firestoreCache);
        return firestoreCache.posts;
      }

      return null;
    } catch (error) {
      logger.error('Error getting cached feed', error as Error, { userId });
      return null;
    }
  }

  // Save to all cache layers
  async saveFeedToCache(userId: string, posts: Post[]): Promise<void> {
    const cached: CachedFeed = {
      userId,
      posts,
      scores: new Map(),
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.MEMORY_TTL,
      version: 1
    };

    await this.saveToAllLayers(userId, cached);
  }

  // Save to all layers
  private async saveToAllLayers(userId: string, cached: CachedFeed): Promise<void> {
    this.memoryCache.set(userId, cached);
    await this.saveToIndexedDB(userId, cached);
    await this.saveToFirestore(userId, cached);
  }

  // IndexedDB operations
  private async openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.idbName, this.idbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.idbStore)) {
          db.createObjectStore(this.idbStore);
        }
      };
    });
  }

  private async getFromIndexedDB(userId: string): Promise<CachedFeed | null> {
    try {
      const idb = await this.openIDB();
      const transaction = idb.transaction([this.idbStore], 'readonly');
      const store = transaction.objectStore(this.idbStore);
      
      return new Promise((resolve) => {
        const request = store.get(userId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      return null;
    }
  }

  private async saveToIndexedDB(userId: string, cached: CachedFeed): Promise<void> {
    try {
      const idb = await this.openIDB();
      const transaction = idb.transaction([this.idbStore], 'readwrite');
      const store = transaction.objectStore(this.idbStore);
      
      const cacheData = {
        ...cached,
        expiresAt: Date.now() + this.IDB_TTL,
        scores: Object.fromEntries(cached.scores)
      };
      
      store.put(cacheData, userId);
    } catch (error) {
      logger.error('Error saving to IndexedDB', error as Error, { userId });
    }
  }

  // Firestore operations
  private async getFromFirestore(userId: string): Promise<CachedFeed | null> {
    try {
      const cacheDoc = await getDoc(doc(db, 'feedCache', userId));
      if (!cacheDoc.exists()) return null;

      const data = cacheDoc.data();
      return {
        ...data,
        scores: new Map(Object.entries(data.scores || {}))
      } as CachedFeed;
    } catch (error) {
      return null;
    }
  }

  private async saveToFirestore(userId: string, cached: CachedFeed): Promise<void> {
    try {
      const cacheData = {
        userId,
        posts: cached.posts,
        scores: Object.fromEntries(cached.scores),
        cachedAt: cached.cachedAt,
        expiresAt: Date.now() + this.FIRESTORE_TTL,
        version: cached.version
      };

      await setDoc(doc(db, 'feedCache', userId), cacheData);
    } catch (error) {
      logger.error('Error saving to Firestore cache', error as Error, { userId });
    }
  }

  // Invalidate cache for user
  async invalidateUserCache(userId: string): Promise<void> {
    this.memoryCache.delete(userId);
    
    try {
      const idb = await this.openIDB();
      const transaction = idb.transaction([this.idbStore], 'readwrite');
      const store = transaction.objectStore(this.idbStore);
      store.delete(userId);
    } catch (error) {
      logger.error('Error invalidating IDB cache', error as Error, { userId });
    }
  }

  // Clear all expired entries
  clearExpiredEntries(): void {
    const now = Date.now();
    
    for (const [userId, cached] of this.memoryCache.entries()) {
      if (isExpired(cached.expiresAt)) {
        this.memoryCache.delete(userId);
      }
    }
  }

  // Get cache stats
  getCacheStats() {
    return {
      memorySize: this.memoryCache.size,
      memoryHits: 0,
      idbHits: 0,
      firestoreHits: 0
    };
  }
}

export default new FeedCacheService();

