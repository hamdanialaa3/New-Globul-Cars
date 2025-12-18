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
import { db, auth } from '../../firebase/firebase-config';
import { homePageCache, CACHE_KEYS } from '../homepage-cache.service';
import { serviceLogger } from '../logger-service';

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
  bodyType?: string; // Sedan, SUV, Hatchback, Coupe, Wagon, Convertible, Pickup, Minivan, other
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
      // ✅ CRITICAL FIX: Search across ALL vehicle type collections
      const collections = [
        'cars',             // Legacy collection
        'passenger_cars',   // New: Personal cars
        'suvs',             // New: SUVs/Jeeps
        'vans',             // New: Vans/Cargo
        'motorcycles',      // New: Motorcycles
        'trucks',           // New: Trucks
        'buses'             // New: Buses
      ];

      const allCars: UnifiedCar[] = [];

      // Query each collection in parallel
      const queryPromises = collections.map(async (collectionName) => {
        try {
          const q = query(
            collection(db, collectionName),
            orderBy('createdAt', 'desc'),
            limit(limitCount * 2) // Get more to filter client-side
          );
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => this.mapDocToCar(doc));
        } catch (error) {
          serviceLogger.warn(`Error querying ${collectionName}`, { error });
          return [];
        }
      });

      const results = await Promise.all(queryPromises);
      results.forEach(cars => allCars.push(...cars));
      
      // Filter client-side for active, non-sold cars
      const activeCars = allCars.filter(car => {
        const isActive = car.isActive !== false; // Default to true if missing
        const isSold = car.isSold === true; // Default to false if missing
        return isActive && !isSold;
      });

      // Sort by date (newest first) and limit
      const sorted = activeCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      serviceLogger.info('getFeaturedCars: found cars across all collections', { 
        totalCars: sorted.length,
        limitCount,
        perCollection: results.map((cars, i) => ({ collection: collections[i], count: cars.length }))
      });
      
      return sorted.slice(0, limitCount);
    } catch (error) {
      serviceLogger.error('Error getting featured cars', error as Error);
      return [];
    }
  }

  /**
   * Get similar cars (for recommendations)
   */
  async getSimilarCars(carId: string, limitCount: number = 6): Promise<UnifiedCar[]> {
    try {
      const car = await this.getCarById(carId);
      if (!car) return [];

      const collections = [
        'cars',
        'passenger_cars',
        'suvs',
        'vans',
        'motorcycles',
        'trucks',
        'buses'
      ];

      const allCars: UnifiedCar[] = [];

      // Query each collection for similar cars
      const queryPromises = collections.map(async (collectionName) => {
        try {
          // First try: Same make and model
          let q = query(
            collection(db, collectionName),
            where('make', '==', car.make),
            where('model', '==', car.model),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(limitCount * 2)
          );
          
          let snapshot = await getDocs(q).catch(() => null);
          
          // If no results, try just same make
          if (!snapshot || snapshot.empty) {
            q = query(
              collection(db, collectionName),
              where('make', '==', car.make),
              where('status', '==', 'active'),
              orderBy('createdAt', 'desc'),
              limit(limitCount * 2)
            );
            snapshot = await getDocs(q).catch(() => null);
          }

          if (snapshot && !snapshot.empty) {
            return snapshot.docs
              .map(doc => this.mapDocToCar(doc))
              .filter(c => c.id !== carId && c.isActive !== false && c.isSold !== true);
          }
          return [];
        } catch (error) {
          serviceLogger.warn(`Error querying similar cars from ${collectionName}`, { error });
          return [];
        }
      });

      const results = await Promise.all(queryPromises);
      results.forEach(cars => allCars.push(...cars));

      // Remove duplicates and sort
      const uniqueCars = Array.from(
        new Map(allCars.map(car => [car.id, car])).values()
      );

      return uniqueCars.slice(0, limitCount);
    } catch (error) {
      serviceLogger.error('Error getting similar cars', error as Error);
      return [];
    }
  }

  /**
   * Search cars with filters
   */
  async searchCars(filters: CarFilters = {}, limitCount: number = 20): Promise<UnifiedCar[]> {
    try {
      
      // ✅ CRITICAL FIX: Search across ALL vehicle type collections
      const collections = [
        'cars',             // Legacy collection
        'passenger_cars',   // New: Personal cars
        'suvs',             // New: SUVs/Jeeps
        'vans',             // New: Vans/Cargo
        'motorcycles',      // New: Motorcycles
        'trucks',           // New: Trucks
        'buses'             // New: Buses
      ];

      const allCars: UnifiedCar[] = [];

      // Query each collection in parallel
      const queryPromises = collections.map(async (collectionName) => {
        try {
          let q = query(collection(db, collectionName));

          // Apply Firestore filters
          // NOTE: make and model filters are applied client-side for case-insensitive matching
          // Firestore where() is case-sensitive, so we filter client-side instead
          if (filters.fuelType) {
            q = query(q, where('fuelType', '==', filters.fuelType));
          }
          if (filters.transmission) {
            q = query(q, where('transmission', '==', filters.transmission));
          }
          if (filters.bodyType) {
            q = query(q, where('bodyType', '==', filters.bodyType));
          }
          if (filters.locationData?.regionName) {
            q = query(q, where('region', '==', filters.locationData?.regionName));
          }

          q = query(q, orderBy('createdAt', 'desc'));
          q = query(q, limit(limitCount * 2)); // Get more for client-side filtering

          const snapshot = await getDocs(q);
          const cars = snapshot.docs.map(doc => this.mapDocToCar(doc));
          
          if (cars.length > 0) {
          }
          
          return cars;
        } catch (error) {
          serviceLogger.warn(`⚠️ Error querying ${collectionName}`, { error });
          serviceLogger.warn(`Error querying ${collectionName} for search`, { error, filters });
          return [];
        }
      });

      const results = await Promise.all(queryPromises);
      results.forEach(cars => allCars.push(...cars));
      
      
      // Debug: Print first few cars with ALL fields
      if (allCars.length > 0) {
        serviceLogger.info('🚗 Sample cars from database (first 3):');
        allCars.slice(0, 3).forEach((car, idx) => {
          serviceLogger.info(`Car ${idx + 1}:`, {
            id: car.id,
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
            status: (car as any).status,
            isActive: car.isActive,
            isSold: car.isSold,
            createdAt: car.createdAt
          });
        });
      } else {
        serviceLogger.info('📋 Collections checked:', { collections });
      }

      // Client-side filters with detailed logging
      let filteredCars = allCars;
      const initialCount = filteredCars.length;
      serviceLogger.info('🔍 Starting client-side filtering', { initialCount });

      // Filter 0: Make (case-insensitive)
      if (filters.make) {
        const beforeCount = filteredCars.length;
        const searchMake = filters.make.toLowerCase().trim();
        filteredCars = filteredCars.filter(c => {
          const carMake = (c.make || '').toLowerCase().trim();
          return carMake === searchMake;
        });
        serviceLogger.info('✅ make filter (case-insensitive)', { 
          beforeCount, 
          afterCount: filteredCars.length, 
          searchMake: filters.make,
          matched: filteredCars.slice(0, 3).map(c => c.make)
        });
      }

      // Filter 0.5: Model (case-insensitive)
      if (filters.model) {
        const beforeCount = filteredCars.length;
        const searchModel = filters.model.toLowerCase().trim();
        filteredCars = filteredCars.filter(c => {
          const carModel = (c.model || '').toLowerCase().trim();
          return carModel === searchModel;
        });
        serviceLogger.info('✅ model filter (case-insensitive)', { 
          beforeCount, 
          afterCount: filteredCars.length, 
          searchModel: filters.model 
        });
      }

      // Filter 1: isActive
      if (filters.isActive !== undefined) {
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => (c.isActive !== false) === filters.isActive);
        serviceLogger.info('✅ isActive filter', { beforeCount, afterCount: filteredCars.length, filterValue: filters.isActive });
      } else {
        // Default: show only active cars
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => c.isActive !== false);
        serviceLogger.info('✅ isActive default filter (active only)', { beforeCount, afterCount: filteredCars.length });
      }
      
      // Filter 2: isSold
      if (filters.isSold !== undefined) {
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => (c.isSold === true) === filters.isSold);
        serviceLogger.info('✅ isSold filter', { beforeCount, afterCount: filteredCars.length, filterValue: filters.isSold });
      } else {
        // Default: hide sold cars
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => c.isSold !== true);
        serviceLogger.info('✅ isSold default filter (hide sold)', { beforeCount, afterCount: filteredCars.length });
      }
      
      // Filter 3: Year range
      if (filters.minYear) {
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => c.year >= filters.minYear!);
        serviceLogger.info('✅ minYear filter', { beforeCount, afterCount: filteredCars.length, minYear: filters.minYear });
      }
      if (filters.maxYear) {
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => c.year <= filters.maxYear!);
        serviceLogger.info('✅ maxYear filter', { beforeCount, afterCount: filteredCars.length, maxYear: filters.maxYear });
      }
      
      // Filter 4: Price range
      if (filters.minPrice) {
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => c.price >= filters.minPrice!);
        serviceLogger.info('✅ minPrice filter', { beforeCount, afterCount: filteredCars.length, minPrice: filters.minPrice });
      }
      if (filters.maxPrice) {
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => c.price <= filters.maxPrice!);
        serviceLogger.info('✅ maxPrice filter', { beforeCount, afterCount: filteredCars.length, maxPrice: filters.maxPrice });
      }
      
      // Filter 5: Body type
      if (filters.bodyType) {
        const beforeCount = filteredCars.length;
        filteredCars = filteredCars.filter(c => {
          const carBodyType = (c as any).bodyType || '';
          return carBodyType.toLowerCase() === filters.bodyType!.toLowerCase();
        });
        serviceLogger.info('✅ bodyType filter', { beforeCount, afterCount: filteredCars.length, bodyType: filters.bodyType });
      }
      
      serviceLogger.info('🎯 Filtering complete', { 
        initialCount, 
        finalCount: filteredCars.length, 
        filtersApplied: Object.keys(filters).length 
      });

      // Sort and limit
      const sorted = filteredCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const result = sorted.slice(0, limitCount);
      
      serviceLogger.info('searchCars: final result', { returnedCount: result.length, totalConsidered: sorted.length });
      if (result.length > 0) {
        serviceLogger.info('searchCars: first car sample', {
          make: result[0].make,
          model: result[0].model,
          year: result[0].year,
          price: result[0].price,
          isActive: result[0].isActive,
          isSold: result[0].isSold
        });
      }

      serviceLogger.info('searchCars: found cars across all collections', { 
        totalCars: sorted.length,
        returnedCount: result.length,
        filters,
        limitCount,
        perCollection: results.map((cars, i) => ({ collection: collections[i], count: cars.length }))
      });

      return result;
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
      // ✅ CRITICAL FIX: Search across ALL vehicle type collections
      const collections = [
        'cars',             // Legacy collection
        'passenger_cars',   // New: Personal cars
        'suvs',             // New: SUVs/Jeeps
        'vans',             // New: Vans/Cargo
        'motorcycles',      // New: Motorcycles
        'trucks',           // New: Trucks
        'buses'             // New: Buses
      ];

      const allCars: UnifiedCar[] = [];

      // Query each collection in parallel
      const queryPromises = collections.map(async (collectionName) => {
        try {
          const q = query(
            collection(db, collectionName),
            where('sellerId', '==', userId)
          );
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => this.mapDocToCar(doc));
        } catch (error) {
          serviceLogger.warn(`Error querying ${collectionName}`, { error, userId });
          return [];
        }
      });
      const results = await Promise.all(queryPromises);
      results.forEach(cars => allCars.push(...cars));

      // Sort by date (newest first)
      const sorted = allCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      serviceLogger.info('getUserCars: found cars across all collections', { 
        userId, 
        totalCars: sorted.length,
        perCollection: results.map((cars, i) => ({ collection: collections[i], count: cars.length }))
      });

      return sorted;
    } catch (error) {
      serviceLogger.error('Error getting user cars', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get car by ID - searches across ALL vehicle type collections
   * ✅ CRITICAL FIX: Now searches in all collections (passenger_cars, suvs, vans, etc.)
   */
  async getCarById(carId: string): Promise<UnifiedCar | null> {
    if (!carId || carId.trim() === '') {
      serviceLogger.warn('getCarById: invalid carId', { carId });
      return null;
    }

    try {
      // ✅ CRITICAL FIX: Search across ALL vehicle type collections
      const collections = [
        'cars',             // Legacy collection
        'passenger_cars',   // New: Personal cars
        'suvs',             // New: SUVs/Jeeps
        'vans',             // New: Vans/Cargo
        'motorcycles',      // New: Motorcycles
        'trucks',           // New: Trucks
        'buses'             // New: Buses
      ];

      // Try each collection in parallel
      const searchPromises = collections.map(async (collectionName) => {
        try {
          const docRef = doc(db, collectionName, carId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const foundCar = this.mapDocToCar(docSnap);
            serviceLogger.info('getCarById: found car', { carId, collection: collectionName });
            return { car: foundCar, collection: collectionName };
          }
          return null;
        } catch (error) {
          serviceLogger.warn(`Error querying ${collectionName} for getCarById`, { error, carId });
          return null;
        }
      });

      const results = await Promise.all(searchPromises);
      const foundResult = results.find(result => result !== null);

      if (foundResult) {
        serviceLogger.info('getCarById: car found successfully', { 
          carId, 
          collection: foundResult.collection 
        });
        return foundResult.car;
      }

      serviceLogger.warn('getCarById: car not found in any collection', { carId });
      return null;
    } catch (error) {
      serviceLogger.error('Error getting car by ID', error as Error, { carId });
      return null;
    }
  }

  // ==================== WRITE OPERATIONS ====================

  /**
   * Create new car (with numeric IDs support)
   * ✅ NEW: Uses numeric-car-system-service for strict numeric URL structure
   */
  async createCar(carData: Partial<UnifiedCar>): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
      throw new Error('Not authenticated');
    }

    try {
      // ✅ NEW: Use numeric car system for creation
      const { numericCarSystemService } = await import('../numeric-car-system.service');
      
      const numericCarData = await numericCarSystemService.createCarWithNumericIds({
        ...carData,
        make: carData.make || '',
        model: carData.model || '',
        year: carData.year || new Date().getFullYear(),
        price: carData.price || 0
      });

      // Invalidate cache
      this.invalidateCache();

      serviceLogger.info('✅ Car created with numeric IDs', {
        carId: numericCarData.id,
        sellerNumericId: numericCarData.sellerNumericId,
        carNumericId: numericCarData.carNumericId,
        url: `/car/${numericCarData.sellerNumericId}/${numericCarData.carNumericId}`
      });
      
      // Award points for creating listing
      try {
        const { pointsAutomationService } = await import('../profile/points-automation.service');
        await pointsAutomationService.onListingCreated(currentUser.uid, numericCarData.id);
      } catch (error) {
        // Don't fail car creation if points fail
        serviceLogger.error('Failed to award points for listing creation', error as Error);
      }
      
      return numericCarData.id;
      
      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error creating car', error as Error);
      throw error;
    }
  }

  /**
   * Update car
   * ✅ FIX: Find the correct collection for the car before updating
   */
  async updateCar(carId: string, updates: Partial<UnifiedCar>): Promise<void> {
    try {
      // ✅ FIX: Find which collection contains this car
      const collections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
      let foundCollection: string | null = null;
      let carData: Record<string, unknown> = null;

      // Search all collections to find the car
      for (const collectionName of collections) {
        try {
          const docRef = doc(db, collectionName, carId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            foundCollection = collectionName;
            carData = docSnap.data();
            break;
          }
        } catch (error) {
          // Continue searching other collections
          continue;
        }
      }

      if (!foundCollection) {
        throw new Error(`Car with ID ${carId} not found in any collection`);
      }

      const docRef = doc(db, foundCollection, carId);
      
      // Check if car is being marked as sold
      const wasSold = updates.isSold === true || updates.status === 'sold';
      let isFirstSale = false;
      
      if (wasSold) {
        // Get current car data to check if it was already sold
        const wasAlreadySold = carData?.isSold === true || carData?.status === 'sold';
        
        if (!wasAlreadySold && carData?.sellerId) {
          // Check if this is the first sale
          const userCars = await this.getUserCars(carData.sellerId);
          const soldCars = userCars.filter(c => c.isSold === true || c.status === 'sold');
          isFirstSale = soldCars.length === 0;
        }
      }
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Invalidate cache
      this.invalidateCache();

      serviceLogger.info('Car updated', { carId });
      
      // Award points if car was sold
      if (wasSold) {
        try {
          const carSnap = await getDoc(docRef);
          const carData = carSnap.data();
          if (carData?.sellerId) {
            const { pointsAutomationService } = await import('../profile/points-automation.service');
            await pointsAutomationService.onCarSold(carData.sellerId, carId, isFirstSale);
          }
        } catch (error) {
          // Don't fail car update if points fail
          serviceLogger.error('Failed to award points for car sale', error as Error);
        }
      }
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
    
    if (!data) {
      serviceLogger.error('Document has no data', new Error(`Document ${doc.id} has no data`), { docId: doc.id });
      throw new Error(`Document ${doc.id} has no data`);
    }
    
    // Debug: Log raw data from Firestore
    serviceLogger.debug('Mapping car document', {
      docId: doc.id,
      rawStatus: data.status,
      rawIsActive: data.isActive,
      rawIsSold: data.isSold,
      make: data.make,
      model: data.model,
      rawPrice: data.price,
      netPrice: data.netPrice,
      finalPrice: data.finalPrice
    });
    
    const car = {
      id: doc.id,
      ...data,
      // ✅ FIX: Prioritize netPrice or finalPrice over price if they exist
      price: typeof data.netPrice === 'number' ? data.netPrice : 
             typeof data.finalPrice === 'number' ? data.finalPrice :
             typeof data.price === 'number' ? data.price : 0,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date()
    } as UnifiedCar;
    
    // Ensure isActive and isSold have default values
    if (car.isActive === undefined || car.isActive === null) {
      car.isActive = car.status === 'active';
    }
    if (car.isSold === undefined || car.isSold === null) {
      car.isSold = car.status === 'sold';
    }
    
    
    return car;
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
