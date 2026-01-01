// Unified Car Queries - Read Operations
// استعلامات السيارات الموحدة - عمليات القراءة

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { UnifiedCar, CarFilters, VEHICLE_COLLECTIONS } from './unified-car-types';

/**
 * Map Firestore document to UnifiedCar
 */
export function mapDocToCar(doc: DocumentSnapshot): UnifiedCar {
  const data = doc.data();

  if (!data) {
    serviceLogger.error('Document has no data', new Error(`Document ${doc.id} has no data`), { docId: doc.id });
    throw new Error(`Document ${doc.id} has no data`);
  }

  // Debug: Log raw data from Firestore
  if (process.env.NODE_ENV === 'development') {
    // Only log in dev to reduce noise
    // serviceLogger.debug('Mapping car document', { docId: doc.id, ... });
  }

  const car = {
    id: doc.id,
    ...data,
    // ✅ FIX: Prioritize netPrice or finalPrice over price if they exist, handling string values
    price: (data.netPrice !== undefined && !isNaN(Number(data.netPrice))) ? Number(data.netPrice) :
      (data.finalPrice !== undefined && !isNaN(Number(data.finalPrice))) ? Number(data.finalPrice) :
        (data.price !== undefined && !isNaN(Number(data.price))) ? Number(data.price) : 0,

    // ✅ FIX: Ensure numeric IDs are properly mapped and typed
    sellerNumericId: data.sellerNumericId ? Number(data.sellerNumericId) : undefined,
    carNumericId: data.carNumericId ? Number(data.carNumericId) : (data.numericId ? Number(data.numericId) : undefined),
    numericId: data.numericId ? Number(data.numericId) : (data.carNumericId ? Number(data.carNumericId) : undefined),

    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : (data?.createdAt instanceof Date ? data.createdAt : new Date()),
    updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : (data?.updatedAt instanceof Date ? data.updatedAt : new Date())
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
 * Get featured cars for HomePage
 */
export async function getFeaturedCars(limitCount: number = 4): Promise<UnifiedCar[]> {
  try {
    const allCars: UnifiedCar[] = [];

    // ⚡ PERFORMANCE: Query each collection with where clauses to filter at database level
    // ✅ FIX: Use fallback query to support both status-based and isActive-based filtering
    const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
      // Use simpler query without where clauses to support all status formats
      // Filter client-side to handle: status='published'/'active', isActive=true, isSold=false
      try {
        const q = query(
          collection(db, collectionName),
          orderBy('createdAt', 'desc'),
          limit(limitCount * 4) // Get more to compensate for client-side filtering
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => mapDocToCar(doc))
          .filter(car => {
            // Support multiple status formats: status='published'/'active', or isActive=true
            const isActive = car.isActive !== false; // Default to true if missing
            const isSold = car.isSold === true; // Default to false if missing
            const status = (car as any).status;
            const isPublished = status === 'published' || status === 'active';
            const isNotSoldStatus = status !== 'sold';

            // Include car if: (isActive OR status='published'/'active') AND NOT sold
            return (isActive || isPublished);
          });
      } catch (error) {
        serviceLogger.warn(`Error querying ${collectionName} for featured cars`, { error });
        return [];
      }
    });

    const results = await Promise.all(queryPromises);
    results.forEach(cars => allCars.push(...cars));

    // Sort by date (newest first) and limit
    const sorted = allCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sorted.slice(0, limitCount);
  } catch (error) {
    serviceLogger.error('Error getting featured cars', error as Error);
    return [];
  }
}

/**
 * Get new cars from last 24 hours - ⚡ PERFORMANCE: Direct Firestore query instead of client-side filtering
 */
export async function getNewCarsLast24Hours(limitCount: number = 12): Promise<UnifiedCar[]> {
  try {
    const allCars: UnifiedCar[] = [];
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    const timestamp24HoursAgo = Timestamp.fromDate(last24Hours);

    // Query each collection in parallel with date filter
    // ✅ FIX: Use simpler query to support both status-based and isActive-based filtering
    const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
      try {
        // Use date filter only, then filter client-side for status/isActive compatibility
        const q = query(
          collection(db, collectionName),
          where('createdAt', '>=', timestamp24HoursAgo),
          orderBy('createdAt', 'desc'),
          limit(limitCount * 4) // Get more to compensate for client-side filtering
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => mapDocToCar(doc))
          .filter(car => {
            // Support multiple status formats: status='published'/'active', or isActive=true
            const isActive = car.isActive !== false; // Default to true if missing
            const isSold = car.isSold === true; // Default to false if missing
            const status = (car as any).status;
            const isPublished = status === 'published' || status === 'active';
            const isNotSoldStatus = status !== 'sold';

            // Include car if: (isActive OR status='published'/'active') AND NOT sold
            return (isActive || isPublished);
          });
      } catch (error) {
        serviceLogger.warn(`Error querying ${collectionName} for new cars`, { error });
        return [];
      }
    });

    const results = await Promise.all(queryPromises);
    results.forEach(cars => allCars.push(...cars));

    // Sort by date (newest first) and limit
    const sorted = allCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sorted.slice(0, limitCount);
  } catch (error) {
    serviceLogger.error('Error getting new cars from last 24 hours', error as Error);
    return [];
  }
}

/**
 * Get similar cars (for recommendations)
 */
export async function getSimilarCars(carId: string, limitCount: number = 6): Promise<UnifiedCar[]> {
  try {
    const car = await getCarById(carId);
    if (!car) return [];

    const allCars: UnifiedCar[] = [];

    // Query each collection for similar cars
    const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
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
            .map(doc => mapDocToCar(doc))
            .filter(c => c.id !== carId && c.isActive !== false);
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
export async function searchCars(filters: CarFilters = {}, limitCount: number = 20): Promise<UnifiedCar[]> {
  try {
    const allCars: UnifiedCar[] = [];

    // Query each collection in parallel
    const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
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
        const cars = snapshot.docs.map(doc => mapDocToCar(doc));

        return cars;
      } catch (error) {
        serviceLogger.warn(`⚠️ Error querying ${collectionName}`, { error });
        return [];
      }
    });

    const results = await Promise.all(queryPromises);
    results.forEach(cars => allCars.push(...cars));

    // Client-side filters
    let filteredCars = allCars;

    // Filter 0: Make (case-insensitive)
    if (filters.make) {
      const searchMake = filters.make.toLowerCase().trim();
      filteredCars = filteredCars.filter(c => {
        const carMake = (c.make || '').toLowerCase().trim();
        return carMake === searchMake;
      });
    }

    // Filter 0.5: Model (case-insensitive)
    if (filters.model) {
      const searchModel = filters.model.toLowerCase().trim();
      filteredCars = filteredCars.filter(c => {
        const carModel = (c.model || '').toLowerCase().trim();
        return carModel === searchModel;
      });
    }

    // Filter 1: isActive
    if (filters.isActive !== undefined) {
      filteredCars = filteredCars.filter(c => (c.isActive !== false) === filters.isActive);
    } else {
      // Default: show only active cars
      filteredCars = filteredCars.filter(c => c.isActive !== false);
    }

    // Filter 2: isSold (only if explicitly specified)
    if (filters.isSold !== undefined) {
      filteredCars = filteredCars.filter(c => (c.isSold === true) === filters.isSold);
    }

    // Filter 3: Year range
    if (filters.minYear) {
      filteredCars = filteredCars.filter(c => c.year >= filters.minYear!);
    }
    if (filters.maxYear) {
      filteredCars = filteredCars.filter(c => c.year <= filters.maxYear!);
    }

    // Filter 4: Price range
    if (filters.minPrice) {
      filteredCars = filteredCars.filter(c => c.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filteredCars = filteredCars.filter(c => c.price <= filters.maxPrice!);
    }

    // Filter 5: Body type
    if (filters.bodyType) {
      filteredCars = filteredCars.filter(c => {
        const carBodyType = (c as any).bodyType || '';
        return carBodyType.toLowerCase() === filters.bodyType!.toLowerCase();
      });
    }

    // Sort and limit
    const sorted = filteredCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const result = sorted.slice(0, limitCount);

    return result;
  } catch (error) {
    serviceLogger.error('Error searching cars', error as Error, { filters });
    return [];
  }
}

/**
 * Get user's cars
 */
export async function getUserCars(userId: string): Promise<UnifiedCar[]> {
  if (!userId || userId.trim() === '') {
    serviceLogger.warn('getUserCars: invalid userId', { userId });
    return [];
  }

  try {
    const allCars: UnifiedCar[] = [];

    // Query each collection in parallel
    const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
      try {
        const q = query(
          collection(db, collectionName),
          where('sellerId', '==', userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => mapDocToCar(doc));
      } catch (error) {
        serviceLogger.warn(`Error querying ${collectionName}`, { error, userId });
        return [];
      }
    });
    const results = await Promise.all(queryPromises);
    results.forEach(cars => allCars.push(...cars));

    // Sort by date (newest first)
    const sorted = allCars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
export async function getCarById(carId: string): Promise<UnifiedCar | null> {
  if (!carId || carId.trim() === '') {
    serviceLogger.warn('getCarById: invalid carId', { carId });
    return null;
  }

  try {
    // Try each collection in parallel
    const searchPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
      try {
        const docRef = doc(db, collectionName, carId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const foundCar = mapDocToCar(docSnap);
          return { car: foundCar, collection: collectionName };
        }
        return null;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(searchPromises);
    const foundResult = results.find(result => result !== null);

    if (foundResult) {
      return foundResult.car;
    }

    return null;
  } catch (error) {
    serviceLogger.error('Error getting car by ID', error as Error, { carId });
    return null;
  }
}