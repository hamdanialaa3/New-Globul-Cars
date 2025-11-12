// Unified Car Service - Single Source of Truth
// خدمة السيارات الموحدة - مصدر واحد للحقيقة

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db, auth } from '@/firebase/firebase-config';
import { homePageCache, CACHE_KEYS } from '../homepage-cache.service';
import { serviceLogger } from '../logger-wrapper';

// Unified Car Interface
export interface UnifiedCar {
  id: string;
  sellerId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  power?: number;
  images?: string[];
  mainImage?: string;
  status: 'active' | 'sold' | 'draft';
  isActive: boolean;
  isSold: boolean;
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

// Search Filters
export interface CarFilters {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  region?: string;
  sellerId?: string;
  isActive?: boolean;
  isSold?: boolean;
}

class UnifiedCarService {
  private collectionName = 'cars';

  // ==================== READ OPERATIONS ====================

  /**
   * Get featured cars for HomePage
   */
  async getFeaturedCars(limitCount: number = 4): Promise<UnifiedCar[]> {
    return homePageCache.getOrFetch(
      CACHE_KEYS.FEATURED_CARS(limitCount),
      async () => {
        const q = query(
          collection(db, this.collectionName),
          where('isActive', '==', true),
          where('isSold', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToCar(doc));
      }
    );
  }

  /**
   * Search cars with filters
   */
  async searchCars(filters: CarFilters = {}, limitCount: number = 20): Promise<UnifiedCar[]> {
    try {
      let q = query(collection(db, this.collectionName));

      // Apply filters
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }
      if (filters.isSold !== undefined) {
        q = query(q, where('isSold', '==', filters.isSold));
      }
      if (filters.make) {
        q = query(q, where('make', '==', filters.make));
      }
      if (filters.model) {
        q = query(q, where('model', '==', filters.model));
      }
      if (filters.fuelType) {
        q = query(q, where('fuelType', '==', filters.fuelType));
      }
      if (filters.transmission) {
        q = query(q, where('transmission', '==', filters.transmission));
      }
      if (filters.region) {
        q = query(q, where('region', '==', filters.region));
      }

      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      let cars = snapshot.docs.map(doc => this.mapDocToCar(doc));

      // Client-side filters
      if (filters.minYear) {
        cars = cars.filter(c => c.year >= filters.minYear!);
      }
      if (filters.maxYear) {
        cars = cars.filter(c => c.year <= filters.maxYear!);
      }
      if (filters.minPrice) {
        cars = cars.filter(c => c.price >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        cars = cars.filter(c => c.price <= filters.maxPrice!);
      }

      return cars;
    } catch (error) {
      serviceLogger.error('Error searching cars', error as Error, { filters });
      return [];
    }
  }

  /**
   * Get user's cars
   */
  async getUserCars(userId: string): Promise<UnifiedCar[]> {
    if (!userId || userId.trim() === '') {
      serviceLogger.warn('getUserCars: invalid userId', { userId });
      return [];
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('sellerId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const cars = snapshot.docs.map(doc => this.mapDocToCar(doc));

      // Sort by date
      return cars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      serviceLogger.error('Error getting user cars', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get car by ID
   */
  async getCarById(carId: string): Promise<UnifiedCar | null> {
    try {
      const docRef = doc(db, this.collectionName, carId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.mapDocToCar(docSnap);
    } catch (error) {
      serviceLogger.error('Error getting car by ID', error as Error, { carId });
      return null;
    }
  }

  // ==================== WRITE OPERATIONS ====================

  /**
   * Create new car
   */
  async createCar(carData: Partial<UnifiedCar>): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
      throw new Error('Not authenticated');
    }

    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...carData,
        sellerId: currentUser.uid,
        status: 'active',
        isActive: true,
        isSold: false,
        views: 0,
        favorites: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Invalidate cache
      this.invalidateCache();

      serviceLogger.info('Car created', { carId: docRef.id, userId: currentUser.uid });
      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error creating car', error as Error);
      throw error;
    }
  }

  /**
   * Update car
   */
  async updateCar(carId: string, updates: Partial<UnifiedCar>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, carId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Invalidate cache
      this.invalidateCache();

      serviceLogger.info('Car updated', { carId });
    } catch (error) {
      serviceLogger.error('Error updating car', error as Error, { carId });
      throw error;
    }
  }

  /**
   * Delete car
   */
  async deleteCar(carId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, carId);
      await deleteDoc(docRef);

      // Invalidate cache
      this.invalidateCache();

      serviceLogger.info('Car deleted', { carId });
    } catch (error) {
      serviceLogger.error('Error deleting car', error as Error, { carId });
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Map Firestore document to UnifiedCar
   */
  private mapDocToCar(doc: DocumentSnapshot): UnifiedCar {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date()
    } as UnifiedCar;
  }

  /**
   * Invalidate all car-related cache
   */
  private invalidateCache(): void {
    homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(4));
    homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(8));
    homePageCache.invalidate(CACHE_KEYS.FEATURED_CARS(10));
  }
}

export const unifiedCarService = new UnifiedCarService();
export default unifiedCarService;
