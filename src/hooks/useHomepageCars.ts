/**
 * useHomepageCars Hook
 * Custom hook for fetching and managing cars displayed on the HomePage
 * 
 * Features:
 * - Fetches latest, featured, and new cars
 * - Caching with TTL (5 minutes)
 * - Error handling and loading states
 * - Respects numeric ID system
 * 
 * ✅ CRITICAL FIX: Extracted from HomePage to follow Single Responsibility Principle
 * 
 * @architecture Clean Architecture - Separation of Concerns
 */

import { useState, useEffect, useCallback } from 'react';
import { unifiedCarService } from '../services/car/unified-car-service';
import { logger } from '../services/logger-service';

interface Car {
  id: string;
  sellerNumericId: number;
  carNumericId: number;
  make: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  city?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  status: string;
  createdAt: Date;
  [key: string]: any;
}

interface UseHomepageCarsOptions {
  latestLimit?: number;
  featuredLimit?: number;
  newLimit?: number;
  cacheTTL?: number; // in milliseconds
}

interface UseHomepageCarsReturn {
  latestCars: Car[];
  featuredCars: Car[];
  newCars: Car[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const DEFAULT_OPTIONS: UseHomepageCarsOptions = {
  latestLimit: 12,
  featuredLimit: 8,
  newLimit: 6,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

// In-memory cache
const cache: {
  latest?: { data: Car[]; timestamp: number };
  featured?: { data: Car[]; timestamp: number };
  new?: { data: Car[]; timestamp: number };
} = {};

/**
 * Custom hook for fetching homepage cars
 */
export const useHomepageCars = (
  options: UseHomepageCarsOptions = {}
): UseHomepageCarsReturn => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [latestCars, setLatestCars] = useState<Car[]>([]);
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [newCars, setNewCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Check if cache is valid
   */
  const isCacheValid = useCallback((key: 'latest' | 'featured' | 'new'): boolean => {
    const cached = cache[key];
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < opts.cacheTTL!;
  }, [opts.cacheTTL]);

  /**
   * Fetch latest cars (sorted by createdAt DESC)
   */
  const fetchLatestCars = useCallback(async (): Promise<Car[]> => {
    if (isCacheValid('latest')) {
      logger.debug('Using cached latest cars');
      return cache.latest!.data;
    }

    try {
      const result = await unifiedCarService.getLatestCars(opts.latestLimit!);
      const cars = result.cars as Car[];
      
      // Validate numeric IDs
      const validCars = cars.filter((car: any) => 
        car.sellerNumericId && car.carNumericId
      );

      if (validCars.length < cars.length) {
        logger.warn('Some cars missing numeric IDs', {
          total: cars.length,
          valid: validCars.length,
          invalid: cars.length - validCars.length
        });
      }

      cache.latest = { data: validCars, timestamp: Date.now() };
      return validCars;
    } catch (err) {
      logger.error('Failed to fetch latest cars', err as Error);
      throw err;
    }
  }, [opts.latestLimit, isCacheValid]);

  /**
   * Fetch featured cars (status = 'featured')
   */
  const fetchFeaturedCars = useCallback(async (): Promise<Car[]> => {
    if (isCacheValid('featured')) {
      logger.debug('Using cached featured cars');
      return cache.featured!.data;
    }

    try {
      const result = await unifiedCarService.searchCars(
        { status: 'featured' },
        1,
        opts.featuredLimit!
      );
      const cars = result.cars as Car[];
      
      // Validate numeric IDs
      const validCars = cars.filter((car: any) => 
        car.sellerNumericId && car.carNumericId
      );

      cache.featured = { data: validCars, timestamp: Date.now() };
      return validCars;
    } catch (err) {
      logger.error('Failed to fetch featured cars', err as Error);
      throw err;
    }
  }, [opts.featuredLimit, isCacheValid]);

  /**
   * Fetch new cars (created in last 7 days)
   */
  const fetchNewCars = useCallback(async (): Promise<Car[]> => {
    if (isCacheValid('new')) {
      logger.debug('Using cached new cars');
      return cache.new!.data;
    }

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await unifiedCarService.searchCars(
        { createdAfter: sevenDaysAgo },
        1,
        opts.newLimit!
      );
      const cars = result.cars as Car[];
      
      // Validate numeric IDs
      const validCars = cars.filter((car: any) => 
        car.sellerNumericId && car.carNumericId
      );

      cache.new = { data: validCars, timestamp: Date.now() };
      return validCars;
    } catch (err) {
      logger.error('Failed to fetch new cars', err as Error);
      throw err;
    }
  }, [opts.newLimit, isCacheValid]);

  /**
   * Fetch all cars in parallel
   */
  const fetchAllCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [latest, featured, newCarsData] = await Promise.all([
        fetchLatestCars(),
        fetchFeaturedCars(),
        fetchNewCars()
      ]);

      setLatestCars(latest);
      setFeaturedCars(featured);
      setNewCars(newCarsData);

      logger.info('Homepage cars fetched successfully', {
        latest: latest.length,
        featured: featured.length,
        new: newCarsData.length
      });
    } catch (err) {
      const error = err as Error;
      logger.error('Failed to fetch homepage cars', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLatestCars, fetchFeaturedCars, fetchNewCars]);

  /**
   * Refetch all cars (clears cache)
   */
  const refetch = useCallback(async () => {
    // Clear cache
    delete cache.latest;
    delete cache.featured;
    delete cache.new;
    
    await fetchAllCars();
  }, [fetchAllCars]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAllCars();
  }, [fetchAllCars]);

  return {
    latestCars,
    featuredCars,
    newCars,
    isLoading,
    error,
    refetch
  };
};

/**
 * Export individual car fetchers for advanced usage
 */
export const useLatestCars = (limit: number = 12) => {
  const { latestCars, isLoading, error, refetch } = useHomepageCars({ latestLimit: limit });
  return { cars: latestCars, isLoading, error, refetch };
};

export const useFeaturedCars = (limit: number = 8) => {
  const { featuredCars, isLoading, error, refetch } = useHomepageCars({ featuredLimit: limit });
  return { cars: featuredCars, isLoading, error, refetch };
};

export const useNewCars = (limit: number = 6) => {
  const { newCars, isLoading, error, refetch } = useHomepageCars({ newLimit: limit });
  return { cars: newCars, isLoading, error, refetch };
};
