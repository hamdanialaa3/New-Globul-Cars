// Favorites Service - Firebase Backend
// Premium World-Class Implementation

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

// Types
export interface FavoriteCarData {
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  mileage: number;
  location: string;
  fuelType?: string;
  transmission?: string;
}

export interface FavoriteCar {
  id: string;
  userId: string;
  carId: string;
  carData: FavoriteCarData;
  addedAt: Timestamp;
  originalPrice: number;
  priceHistory: Array<{
    price: number;
    date: Timestamp;
  }>;
  notifyOnPriceChange: boolean;
  notes?: string;
  tags?: string[];
}

export interface FavoriteInput {
  carId: string;
  carData: FavoriteCarData;
  notifyOnPriceChange?: boolean;
}

class FavoritesService {
  private collectionName = 'favorites';

  /**
   * Add car to favorites
   */
  async addFavorite(userId: string, favoriteData: FavoriteInput): Promise<string> {
    try {
      // Check if already exists
      const exists = await this.isFavorite(userId, favoriteData.carId);
      if (exists) {
        serviceLogger.info('Car already in favorites', { userId, carId: favoriteData.carId });
        return favoriteData.carId;
      }

      const favoritesRef = collection(db, this.collectionName);
      
      const newFavorite = {
        userId,
        carId: favoriteData.carId,
        carData: favoriteData.carData,
        addedAt: serverTimestamp(),
        originalPrice: favoriteData.carData.price,
        priceHistory: [{
          price: favoriteData.carData.price,
          date: serverTimestamp()
        }],
        notifyOnPriceChange: favoriteData.notifyOnPriceChange || false,
        notes: '',
        tags: []
      };

      const docRef = await addDoc(favoritesRef, newFavorite);
      serviceLogger.info('Car added to favorites', { userId, carId: favoriteData.carId, favoriteId: docRef.id });
      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error adding favorite', error as Error, { userId, carId: favoriteData.carId });
      throw error;
    }
  }

  /**
   * Remove car from favorites
   */
  async removeFavorite(userId: string, carId: string): Promise<void> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(
        favoritesRef,
        where('userId', '==', userId),
        where('carId', '==', carId)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const favoriteDoc = querySnapshot.docs[0];
        await deleteDoc(doc(db, this.collectionName, favoriteDoc.id));
        serviceLogger.info('Favorite removed successfully', { userId, carId, favoriteId: favoriteDoc.id });
      }
    } catch (error) {
      serviceLogger.error('Error removing favorite', error as Error, { userId, carId });
      throw error;
    }
  }

  /**
   * Check if car is in favorites
   */
  async isFavorite(userId: string, carId: string): Promise<boolean> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(
        favoritesRef,
        where('userId', '==', userId),
        where('carId', '==', carId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      serviceLogger.error('Error checking favorite', error as Error, { userId, carId });
      return false;
    }
  }

  /**
   * Get all favorites for user
   * Note: Sorting is done client-side to avoid requiring a Firestore index
   */
  async getUserFavorites(userId: string): Promise<FavoriteCar[]> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      // Only filter by userId - no orderBy to avoid index requirement
      const q = query(
        favoritesRef,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const favorites: FavoriteCar[] = [];

      querySnapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data()
        } as FavoriteCar);
      });

      // Sort client-side by addedAt (newest first)
      favorites.sort((a, b) => {
        const aTime = a.addedAt?.toMillis?.() || (a.addedAt as any)?.seconds * 1000 || 0;
        const bTime = b.addedAt?.toMillis?.() || (b.addedAt as any)?.seconds * 1000 || 0;
        return bTime - aTime; // Descending order (newest first)
      });

      serviceLogger.info('Retrieved favorites for user', { userId, count: favorites.length });
      return favorites;
    } catch (error) {
      serviceLogger.error('Error getting favorites', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get favorites count
   */
  async getFavoritesCount(userId: string): Promise<number> {
    try {
      const favorites = await this.getUserFavorites(userId);
      return favorites.length;
    } catch (error) {
      serviceLogger.error('Error getting favorites count', error as Error, { userId });
      return 0;
    }
  }

  /**
   * Toggle favorite (add/remove)
   */
  async toggleFavorite(
    userId: string,
    carId: string,
    carData?: FavoriteCarData
  ): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(userId, carId);
      
      if (isFav) {
        await this.removeFavorite(userId, carId);
        return false;
      } else {
        if (!carData) {
          throw new Error('Car data required to add favorite');
        }
        await this.addFavorite(userId, { carId, carData });
        return true;
      }
    } catch (error) {
      serviceLogger.error('Error toggling favorite', error as Error, { userId, carId });
      throw error;
    }
  }

  /**
   * Update price and track history
   */
  async updatePrice(favoriteId: string, newPrice: number): Promise<void> {
    try {
      const favoriteRef = doc(db, this.collectionName, favoriteId);
      const favoriteDoc = await getDoc(favoriteRef);
      
      if (favoriteDoc.exists()) {
        const data = favoriteDoc.data() as FavoriteCar;
        const priceHistory = data.priceHistory || [];
        
        priceHistory.push({
          price: newPrice,
          date: serverTimestamp() as Timestamp
        });

        await setDoc(favoriteRef, {
          ...data,
          'carData.price': newPrice,
          priceHistory
        }, { merge: true });

        serviceLogger.info('Price updated', { favoriteId, newPrice });
      }
    } catch (error) {
      serviceLogger.error('Error updating price', error as Error, { favoriteId, newPrice });
      throw error;
    }
  }

  /**
   * Add note to favorite
   */
  async addNote(favoriteId: string, note: string): Promise<void> {
    try {
      const favoriteRef = doc(db, this.collectionName, favoriteId);
      await setDoc(favoriteRef, { notes: note }, { merge: true });
      serviceLogger.info('Note added to favorite', { favoriteId });
    } catch (error) {
      serviceLogger.error('Error adding note', error as Error, { favoriteId });
      throw error;
    }
  }

  /**
   * Add tags to favorite
   */
  async addTags(favoriteId: string, tags: string[]): Promise<void> {
    try {
      const favoriteRef = doc(db, this.collectionName, favoriteId);
      await setDoc(favoriteRef, { tags }, { merge: true });
      serviceLogger.info('Tags added to favorite', { favoriteId, tagsCount: tags.length });
    } catch (error) {
      serviceLogger.error('Error adding tags', error as Error, { favoriteId });
      throw error;
    }
  }

  /**
   * Toggle price notifications
   */
  async togglePriceNotifications(
    favoriteId: string,
    enabled: boolean
  ): Promise<void> {
    try {
      const favoriteRef = doc(db, this.collectionName, favoriteId);
      await setDoc(favoriteRef, { notifyOnPriceChange: enabled }, { merge: true });
      serviceLogger.info('Price notifications toggled', { favoriteId, enabled });
    } catch (error) {
      serviceLogger.error('Error toggling notifications', error as Error, { favoriteId, enabled });
      throw error;
    }
  }

  /**
   * Get favorites with price drops
   */
  async getFavoritesWithPriceDrops(userId: string): Promise<FavoriteCar[]> {
    try {
      const favorites = await this.getUserFavorites(userId);
      
      return favorites.filter(fav => {
        const currentPrice = fav.carData.price;
        const originalPrice = fav.originalPrice;
        return currentPrice < originalPrice;
      });
    } catch (error) {
      serviceLogger.error('Error getting price drops', error as Error, { userId });
      return [];
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;
