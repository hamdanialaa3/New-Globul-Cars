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
        console.log('[Favorites] Car already in favorites');
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
      console.log('[Favorites] Car added to favorites:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[Favorites] Error adding favorite:', error);
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
        console.log('[Favorites] Favorite removed successfully');
      }
    } catch (error) {
      console.error('[Favorites] Error removing favorite:', error);
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
      console.error('[Favorites] Error checking favorite:', error);
      return false;
    }
  }

  /**
   * Get all favorites for user
   */
  async getUserFavorites(userId: string): Promise<FavoriteCar[]> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(
        favoritesRef,
        where('userId', '==', userId),
        orderBy('addedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const favorites: FavoriteCar[] = [];

      querySnapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data()
        } as FavoriteCar);
      });

      console.log(`[Favorites] Retrieved ${favorites.length} favorites for user`);
      return favorites;
    } catch (error) {
      console.error('[Favorites] Error getting favorites:', error);
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
      console.error('[Favorites] Error getting count:', error);
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
      console.error('[Favorites] Error toggling favorite:', error);
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

        console.log('[Favorites] Price updated:', favoriteId);
      }
    } catch (error) {
      console.error('[Favorites] Error updating price:', error);
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
      console.log('[Favorites] Note added');
    } catch (error) {
      console.error('[Favorites] Error adding note:', error);
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
      console.log('[Favorites] Tags added');
    } catch (error) {
      console.error('[Favorites] Error adding tags:', error);
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
      console.log('[Favorites] Price notifications toggled');
    } catch (error) {
      console.error('[Favorites] Error toggling notifications:', error);
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
      console.error('[Favorites] Error getting price drops:', error);
      return [];
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;
