// Unified Car Service - Moved to @globul-cars/services package
// Updated imports to use package aliases

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
import { db, auth } from '../firebase/firebase-config';
import { homePageCache, CACHE_KEYS } from '@globul-cars/services/homepage-cache.service';
import { serviceLogger } from '@globul-cars/services/logger-wrapper';

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
    try {
      // Try with filters first
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 2) // Get more to filter client-side
      );

      const snapshot = await getDocs(q);
      let cars = snapshot.docs.map(doc => this.mapDocToCar(doc));
      
      // Filter client-side for compatibility with old data
      cars = cars.filter(car => {
        const isActive = car.isActive !== false; // Default to true if missing
        const isSold = car.isSold === true; // Default to false if missing
        return isActive && !isSold;
      });
      
      return cars.slice(0, limitCount);
    } catch (error) {
      serviceLogger.error('Error getting featured cars', error as Error);
      return [];
    }
  }

  /**
   * Search cars with filters
   */
  async searchCars(filters: CarFilters = {}, limitCount: number = 20): Promise<UnifiedCar[]> {
    try {
      let q = query(collection(db, this.collectionName));

      // Apply filters
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
      if (filters.sellerId) {
        q = query(q, where('sellerId', '==', filters.sellerId));
      }
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }
      if (filters.isSold !== undefined) {
        q = query(q, where('isSold', '==', filters.isSold));
      }

      // Order and limit
      q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

      const snapshot = await getDocs(q);
      let cars = snapshot.docs.map(doc => this.mapDocToCar(doc));

      // Client-side filtering for price and year ranges
      if (filters.minPrice !== undefined) {
        cars = cars.filter(car => car.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        cars = cars.filter(car => car.price <= filters.maxPrice!);
      }
      if (filters.minYear !== undefined) {
        cars = cars.filter(car => car.year >= filters.minYear!);
      }
      if (filters.maxYear !== undefined) {
        cars = cars.filter(car => car.year <= filters.maxYear!);
      }

      return cars;
    } catch (error) {
      serviceLogger.error('Error searching cars', error as Error);
      return [];
    }
  }

  /**
   * Get car by ID
   */
  async getCarById(carId: string): Promise<UnifiedCar | null> {
    try {
      const carRef = doc(db, this.collectionName, carId);
      const carDoc = await getDoc(carRef);
      
      if (!carDoc.exists()) {
        return null;
      }

      return this.mapDocToCar(carDoc);
    } catch (error) {
      serviceLogger.error('Error getting car by ID', error as Error);
      return null;
    }
  }

  /**
   * Get user's cars
   */
  async getUserCars(userId: string): Promise<UnifiedCar[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('sellerId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.mapDocToCar(doc));
    } catch (error) {
      serviceLogger.error('Error getting user cars', error as Error);
      return [];
    }
  }

  // ==================== WRITE OPERATIONS ====================

  /**
   * Create new car listing
   */
  async createCar(carData: Omit<UnifiedCar, 'id' | 'createdAt' | 'updatedAt'>): Promise<UnifiedCar | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to create a car listing');
      }

      const newCar = {
        ...carData,
        sellerId: currentUser.uid,
        isActive: true,
        isSold: false,
        views: 0,
        favorites: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), newCar);
      
      return {
        ...carData,
        id: docRef.id,
        sellerId: currentUser.uid,
        isActive: true,
        isSold: false,
        views: 0,
        favorites: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      serviceLogger.error('Error creating car', error as Error);
      return null;
    }
  }

  /**
   * Update car listing
   */
  async updateCar(carId: string, updates: Partial<UnifiedCar>): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to update a car listing');
      }

      const carRef = doc(db, this.collectionName, carId);
      const carDoc = await getDoc(carRef);

      if (!carDoc.exists()) {
        throw new Error('Car not found');
      }

      const carData = carDoc.data() as UnifiedCar;
      if (carData.sellerId !== currentUser.uid) {
        throw new Error('User does not have permission to update this car');
      }

      await updateDoc(carRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      serviceLogger.error('Error updating car', error as Error);
      return false;
    }
  }

  /**
   * Delete car listing
   */
  async deleteCar(carId: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to delete a car listing');
      }

      const carRef = doc(db, this.collectionName, carId);
      const carDoc = await getDoc(carRef);

      if (!carDoc.exists()) {
        throw new Error('Car not found');
      }

      const carData = carDoc.data() as UnifiedCar;
      if (carData.sellerId !== currentUser.uid) {
        throw new Error('User does not have permission to delete this car');
      }

      await deleteDoc(carRef);
      return true;
    } catch (error) {
      serviceLogger.error('Error deleting car', error as Error);
      return false;
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
      sellerId: data?.sellerId || '',
      make: data?.make || '',
      model: data?.model || '',
      year: data?.year || 0,
      price: data?.price || 0,
      mileage: data?.mileage,
      fuelType: data?.fuelType,
      transmission: data?.transmission,
      power: data?.power,
      images: data?.images || [],
      mainImage: data?.mainImage || data?.images?.[0] || '',
      status: data?.status || 'active',
      isActive: data?.isActive !== false,
      isSold: data?.isSold === true,
      views: data?.views || 0,
      favorites: data?.favorites || 0,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      ...data
    };
  }
}

export const unifiedCarService = new UnifiedCarService();
export default unifiedCarService;

