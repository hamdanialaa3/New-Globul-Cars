/**
 * Favorites Service - Professional Favorites Management System
 * 
 * Features:
 * - Add/Remove favorites
 * - Real-time favorites sync
 * - User-specific favorites with numeric ID support
 * - Optimistic UI updates
 * - Firestore integration with atomic operations
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from './logger-service';

export interface FavoriteItem {
  userId: string; // Firebase UID
  userNumericId: number; // Numeric ID for URLs
  carId: string; // Car document ID
  carNumericId: number; // Car numeric ID
  sellerNumericId: number; // Seller numeric ID
  addedAt: Timestamp;
  // Car preview data (cached for performance)
  carPreview?: {
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;
    primaryImage?: string;
    isActive: boolean;
  };
}

class FavoritesService {
  private static instance: FavoritesService;

  private constructor() { }

  static getInstance(): FavoritesService {
    if (!this.instance) {
      this.instance = new FavoritesService();
    }
    return this.instance;
  }

  /**
   * Add car to user's favorites
   */
  async addToFavorites(
    userId: string,
    userNumericId: number,
    carId: string,
    carNumericId: number,
    sellerNumericId: number,
    carPreview?: FavoriteItem['carPreview']
  ): Promise<void> {
    try {
      const favoriteRef = doc(db, 'favorites', `${userId}_${carId}`);

      // ✅ CRITICAL FIX: Ensure numeric IDs are never undefined
      const favoriteData: FavoriteItem = {
        userId,
        userNumericId: userNumericId || 0,
        carId,
        carNumericId: carNumericId || 0,
        sellerNumericId: sellerNumericId || 0,
        addedAt: Timestamp.now(),
        carPreview
      };

      await setDoc(favoriteRef, favoriteData);

      logger.info('[Favorites] Added to favorites', {
        userId,
        carId,
        carNumericId: favoriteData.carNumericId
      });
    } catch (error) {
      logger.error('[Favorites] Failed to add favorite', error as Error, {
        userId,
        carId
      });
      throw error;
    }
  }

  /**
   * Remove car from user's favorites
   */
  async removeFromFavorites(userId: string, carId: string): Promise<void> {
    try {
      const favoriteRef = doc(db, 'favorites', `${userId}_${carId}`);
      await deleteDoc(favoriteRef);

      logger.info('[Favorites] Removed from favorites', {
        userId,
        carId
      });
    } catch (error) {
      logger.error('[Favorites] Failed to remove favorite', error as Error, {
        userId,
        carId
      });
      throw error;
    }
  }

  /**
   * Check if car is in user's favorites
   */
  async isFavorite(userId: string, carId: string): Promise<boolean> {
    try {
      const favoriteRef = doc(db, 'favorites', `${userId}_${carId}`);
      const favoriteDoc = await getDoc(favoriteRef);
      return favoriteDoc.exists();
    } catch (error) {
      logger.error('[Favorites] Failed to check favorite status', error as Error, {
        userId,
        carId
      });
      return false;
    }
  }

  /**
   * Get all favorites for a user
   */
  async getUserFavorites(
    userId: string,
    limitCount?: number
  ): Promise<FavoriteItem[]> {
    try {
      const favoritesRef = collection(db, 'favorites');
      let q = query(
        favoritesRef,
        where('userId', '==', userId),
        orderBy('addedAt', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const favorites: FavoriteItem[] = [];

      snapshot.forEach((doc) => {
        favorites.push(doc.data() as FavoriteItem);
      });

      // Sort on client-side until Firestore index is ready
      favorites.sort((a, b) => {
        const dateA = a.addedAt?.toMillis() || 0;
        const dateB = b.addedAt?.toMillis() || 0;
        return dateB - dateA; // Descending order
      });

      logger.info('[Favorites] Fetched user favorites', {
        userId,
        count: favorites.length
      });

      return favorites;
    } catch (error) {
      logger.error('[Favorites] Failed to fetch favorites', error as Error, {
        userId
      });
      throw error;
    }
  }

  /**
   * Get favorites count for user
   */
  async getFavoritesCount(userId: string): Promise<number> {
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      logger.error('[Favorites] Failed to get favorites count', error as Error, {
        userId
      });
      return 0;
    }
  }

  /**
   * Toggle favorite status (add if not exists, remove if exists)
   */
  async toggleFavorite(
    userId: string,
    userNumericId: number,
    carId: string,
    carNumericId: number,
    sellerNumericId: number,
    carPreview?: FavoriteItem['carPreview']
  ): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(userId, carId);

      if (isFav) {
        await this.removeFromFavorites(userId, carId);
        return false; // Not favorite anymore
      } else {
        await this.addToFavorites(
          userId,
          userNumericId,
          carId,
          carNumericId,
          sellerNumericId,
          carPreview
        );
        return true; // Now favorite
      }
    } catch (error) {
      logger.error('[Favorites] Failed to toggle favorite', error as Error, {
        userId,
        carId
      });
      throw error;
    }
  }

  /**
   * Get favorite car IDs for user (for quick lookup)
   */
  async getUserFavoriteIds(userId: string): Promise<string[]> {
    try {
      const favorites = await this.getUserFavorites(userId);
      return favorites.map((fav) => fav.carId);
    } catch (error) {
      logger.error('[Favorites] Failed to get favorite IDs', error as Error, {
        userId
      });
      return [];
    }
  }

  /**
   * Batch check if multiple cars are favorites
   */
  async checkMultipleFavorites(
    userId: string,
    carIds: string[]
  ): Promise<Map<string, boolean>> {
    try {
      const favoriteIds = await this.getUserFavoriteIds(userId);
      const favoriteSet = new Set(favoriteIds);

      const result = new Map<string, boolean>();
      carIds.forEach((carId) => {
        result.set(carId, favoriteSet.has(carId));
      });

      return result;
    } catch (error) {
      logger.error('[Favorites] Failed to check multiple favorites', error as Error);
      return new Map();
    }
  }

  /**
   * Clean up favorites for deleted cars
   */
  async cleanupDeletedCarFavorites(carId: string): Promise<void> {
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('carId', '==', carId));
      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      logger.info('[Favorites] Cleaned up favorites for deleted car', {
        carId,
        count: snapshot.size
      });
    } catch (error) {
      logger.error('[Favorites] Failed to cleanup favorites', error as Error, {
        carId
      });
    }
  }
}

export const favoritesService = FavoritesService.getInstance();
export default favoritesService;
