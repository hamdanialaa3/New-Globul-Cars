/**
 * 🚗 Car Listing Service Adapter
 * Adapter for recommendation service to query cars
 * 
 * @description Provides a simple interface for the recommendation 
 * service to fetch cars from Firestore
 * 
 * @version 1.0.0
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';

import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ============================================================================
// TYPES
// ============================================================================

interface CarQueryFilters {
  maxPrice?: number;
  minPrice?: number;
  minYear?: number;
  maxYear?: number;
  brands?: string[];
  bodyTypes?: string[];
  fuels?: string[];
  gearboxes?: string[];
  status?: 'active' | 'sold' | 'expired' | 'deleted';
  limit?: number;
}

interface CarListingData {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel?: string;
  fuelType?: string;
  gearbox?: string;
  transmission?: string;
  km?: number;
  mileage?: number;
  bodyType?: string;
  color?: string;
  images?: string[];
  thumbnail?: string;
  videoUrl?: string;
  description?: string;
  views?: number;
  viewsToday?: number;
  favorites?: number;
  contacts?: number;
  createdAt?: Timestamp | number;
  updatedAt?: Timestamp | number;
  priceDropped?: boolean;
  priceDropAmount?: number;
  priceDropDate?: number;
  location?: {
    city?: string;
    region?: string;
  };
  sellerId?: string;
  sellerType?: 'private' | 'dealer';
  status?: string;
}

// ============================================================================
// CAR LISTING SERVICE
// ============================================================================

class CarListingService {
  private readonly collectionName = 'cars';

  /**
   * Get cars with optional filters
   * Used by recommendation service to fetch candidate cars
   */
  async getCars(filters: CarQueryFilters = {}): Promise<CarListingData[]> {
    try {
      const constraints: QueryConstraint[] = [];

      // Status filter (default: active)
      constraints.push(where('status', '==', filters.status || 'active'));

      // Price filters
      if (filters.maxPrice) {
        constraints.push(where('price', '<=', filters.maxPrice));
      }
      if (filters.minPrice) {
        constraints.push(where('price', '>=', filters.minPrice));
      }

      // Year filters
      if (filters.minYear) {
        constraints.push(where('year', '>=', filters.minYear));
      }
      if (filters.maxYear) {
        constraints.push(where('year', '<=', filters.maxYear));
      }

      // Order by most recent first
      constraints.push(orderBy('createdAt', 'desc'));

      // Limit results
      constraints.push(limit(filters.limit || 100));

      // Execute query
      const carsRef = collection(db, this.collectionName);
      const q = query(carsRef, ...constraints);
      const snapshot = await getDocs(q);

      let cars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarListingData[];

      // Apply in-memory filters for arrays (Firestore doesn't support IN for multiple fields)
      if (filters.brands?.length) {
        const brandsLower = filters.brands.map(b => b.toLowerCase());
        cars = cars.filter(car => 
          car.brand && brandsLower.includes(car.brand.toLowerCase())
        );
      }

      if (filters.bodyTypes?.length) {
        const bodyTypesLower = filters.bodyTypes.map(b => b.toLowerCase());
        cars = cars.filter(car => 
          car.bodyType && bodyTypesLower.includes(car.bodyType.toLowerCase())
        );
      }

      if (filters.fuels?.length) {
        const fuelsLower = filters.fuels.map(f => f.toLowerCase());
        cars = cars.filter(car => {
          const fuel = car.fuel || car.fuelType;
          return fuel && fuelsLower.includes(fuel.toLowerCase());
        });
      }

      if (filters.gearboxes?.length) {
        const gearboxesLower = filters.gearboxes.map(g => g.toLowerCase());
        cars = cars.filter(car => {
          const gearbox = car.gearbox || car.transmission;
          return gearbox && gearboxesLower.includes(gearbox.toLowerCase());
        });
      }

      logger.info(`[CarListingService] Fetched ${cars.length} cars with filters`, { 
        filters, 
        resultCount: cars.length 
      });

      return cars;

    } catch (error) {
      logger.error('[CarListingService] Error fetching cars:', error);
      return [];
    }
  }

  /**
   * Get trending cars (most viewed in last 7 days)
   */
  async getTrendingCars(limitCount = 20): Promise<CarListingData[]> {
    try {
      const carsRef = collection(db, this.collectionName);
      const q = query(
        carsRef,
        where('status', '==', 'active'),
        orderBy('views', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarListingData[];

    } catch (error) {
      logger.error('[CarListingService] Error fetching trending cars:', error);
      return [];
    }
  }

  /**
   * Get new cars (added in last 24 hours)
   */
  async getNewCars(limitCount = 20): Promise<CarListingData[]> {
    try {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      const carsRef = collection(db, this.collectionName);
      const q = query(
        carsRef,
        where('status', '==', 'active'),
        where('createdAt', '>=', new Date(oneDayAgo)),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarListingData[];

    } catch (error) {
      logger.error('[CarListingService] Error fetching new cars:', error);
      return [];
    }
  }

  /**
   * Get cars with price drops
   */
  async getPriceDroppedCars(limitCount = 20): Promise<CarListingData[]> {
    try {
      const carsRef = collection(db, this.collectionName);
      const q = query(
        carsRef,
        where('status', '==', 'active'),
        where('priceDropped', '==', true),
        orderBy('priceDropDate', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarListingData[];

    } catch (error) {
      logger.error('[CarListingService] Error fetching price dropped cars:', error);
      return [];
    }
  }

  /**
   * Get cars by brand
   */
  async getCarsByBrand(brand: string, limitCount = 20): Promise<CarListingData[]> {
    try {
      const carsRef = collection(db, this.collectionName);
      const q = query(
        carsRef,
        where('status', '==', 'active'),
        where('brand', '==', brand),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarListingData[];

    } catch (error) {
      logger.error('[CarListingService] Error fetching cars by brand:', error);
      return [];
    }
  }
}

// Export singleton instance
const carListingService = new CarListingService();
export default carListingService;

// Named exports
export { CarListingService, CarQueryFilters, CarListingData };
