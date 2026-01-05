/**
 * Cars Service - Facade for Unified Car Service
 * خدمة السيارات - واجهة لخدمة السيارات الموحدة
 * 
 * This file provides a simple re-export of the unified car service functionality
 * to maintain backward compatibility with components that import from 'carsService'.
 * 
 * @see src/services/car/unified-car-service.ts for the actual implementation
 * @see src/services/car/unified-car-types.ts for type definitions
 */

import { unifiedCarService } from './car/unified-car-service';
import { UnifiedCar, CarFilters } from './car/unified-car-types';
import { serviceLogger } from './logger-service';

/**
 * Car interface - Re-exported from UnifiedCar for backward compatibility
 * This is the main Car type used throughout the application
 */
export type Car = UnifiedCar;

/**
 * Search filters for car queries
 */
export type SearchFilters = CarFilters;

/**
 * Get car by ID
 * Searches across all vehicle type collections (cars, passenger_cars, suvs, vans, motorcycles, trucks, buses)
 * 
 * @param id - Car ID (string) or numeric ID (number)
 * @returns Promise resolving to Car object or null if not found
 * 
 * @example
 * const car = await getCarById('abc123');
 * if (car) {
 *   console.log(`Found: ${car.make} ${car.model}`);
 * }
 */
export async function getCarById(id: string | number): Promise<Car | null> {
  try {
    const carId = String(id); // Convert to string in case numeric ID is passed
    serviceLogger.debug('getCarById called', { id: carId });
    
    const car = await unifiedCarService.getCarById(carId);
    
    if (!car) {
      serviceLogger.info('Car not found', { id: carId });
      return null;
    }
    
    return car;
  } catch (error) {
    serviceLogger.error('Error in getCarById', error as Error, { id });
    throw error;
  }
}

/**
 * Get all cars (with optional filters)
 * Returns active cars by default
 * 
 * @param filters - Optional search filters
 * @param limitCount - Maximum number of results (default: 50)
 * @returns Promise resolving to array of Car objects
 * 
 * @example
 * const allCars = await getAllCars();
 * const bmwCars = await getAllCars({ make: 'BMW' });
 */
export async function getAllCars(filters: SearchFilters = {}, limitCount: number = 50): Promise<Car[]> {
  try {
    serviceLogger.debug('getAllCars called', { filters, limitCount });
    
    // Default to active cars only
    const searchFilters: SearchFilters = {
      isActive: true,
      ...filters
    };
    
    const cars = await unifiedCarService.searchCars(searchFilters, limitCount);
    
    serviceLogger.info('getAllCars completed', { count: cars.length });
    return cars;
  } catch (error) {
    serviceLogger.error('Error in getAllCars', error as Error, { filters });
    throw error;
  }
}

/**
 * Search cars with filters
 * 
 * @param filters - Search filters (make, model, price range, location, etc.)
 * @param limitCount - Maximum number of results (default: 20)
 * @returns Promise resolving to array of matching Car objects
 * 
 * @example
 * const results = await searchCars({
 *   make: 'BMW',
 *   minPrice: 10000,
 *   maxPrice: 50000,
 *   minYear: 2015
 * }, 30);
 */
export async function searchCars(filters: SearchFilters, limitCount: number = 20): Promise<Car[]> {
  try {
    serviceLogger.debug('searchCars called', { filters, limitCount });
    
    const cars = await unifiedCarService.searchCars(filters, limitCount);
    
    serviceLogger.info('searchCars completed', { count: cars.length, filters });
    return cars;
  } catch (error) {
    serviceLogger.error('Error in searchCars', error as Error, { filters });
    throw error;
  }
}

/**
 * Get cars by brand/make
 * 
 * @param brand - Brand/make name (e.g., 'BMW', 'Mercedes', 'Audi')
 * @param limitCount - Maximum number of results (default: 20)
 * @returns Promise resolving to array of Car objects
 * 
 * @example
 * const bmwCars = await getCarsByBrand('BMW', 50);
 */
export async function getCarsByBrand(brand: string, limitCount: number = 20): Promise<Car[]> {
  try {
    serviceLogger.debug('getCarsByBrand called', { brand, limitCount });
    
    if (!brand || brand.trim() === '') {
      serviceLogger.warn('getCarsByBrand: empty brand name');
      return [];
    }
    
    const cars = await unifiedCarService.searchCars({
      make: brand,
      isActive: true
    }, limitCount);
    
    serviceLogger.info('getCarsByBrand completed', { brand, count: cars.length });
    return cars;
  } catch (error) {
    serviceLogger.error('Error in getCarsByBrand', error as Error, { brand });
    throw error;
  }
}

/**
 * Get featured cars for homepage
 * 
 * @param limitCount - Maximum number of featured cars (default: 4)
 * @returns Promise resolving to array of featured Car objects
 * 
 * @example
 * const featured = await getFeaturedCars(6);
 */
export async function getFeaturedCars(limitCount: number = 4): Promise<Car[]> {
  try {
    serviceLogger.debug('getFeaturedCars called', { limitCount });
    
    const cars = await unifiedCarService.getFeaturedCars(limitCount);
    
    serviceLogger.info('getFeaturedCars completed', { count: cars.length });
    return cars;
  } catch (error) {
    serviceLogger.error('Error in getFeaturedCars', error as Error);
    throw error;
  }
}

/**
 * Get new cars from last 24 hours
 * 
 * @param limitCount - Maximum number of cars (default: 12)
 * @returns Promise resolving to array of new Car objects
 * 
 * @example
 * const newCars = await getNewCars(20);
 */
export async function getNewCars(limitCount: number = 12): Promise<Car[]> {
  try {
    serviceLogger.debug('getNewCars called', { limitCount });
    
    const cars = await unifiedCarService.getNewCarsLast24Hours(limitCount);
    
    serviceLogger.info('getNewCars completed', { count: cars.length });
    return cars;
  } catch (error) {
    serviceLogger.error('Error in getNewCars', error as Error);
    throw error;
  }
}

/**
 * Get similar cars for recommendations
 * 
 * @param carId - The ID of the car to find similar cars for
 * @param limitCount - Maximum number of similar cars (default: 6)
 * @returns Promise resolving to array of similar Car objects
 * 
 * @example
 * const similar = await getSimilarCars('car-123', 8);
 */
export async function getSimilarCars(carId: string, limitCount: number = 6): Promise<Car[]> {
  try {
    serviceLogger.debug('getSimilarCars called', { carId, limitCount });
    
    const cars = await unifiedCarService.getSimilarCars(carId, limitCount);
    
    serviceLogger.info('getSimilarCars completed', { carId, count: cars.length });
    return cars;
  } catch (error) {
    serviceLogger.error('Error in getSimilarCars', error as Error, { carId });
    throw error;
  }
}

/**
 * Get user's cars
 * 
 * @param userId - Firebase UID of the user
 * @returns Promise resolving to array of user's Car objects
 * 
 * @example
 * const userCars = await getUserCars('user-123');
 */
export async function getUserCars(userId: string): Promise<Car[]> {
  try {
    serviceLogger.debug('getUserCars called', { userId });
    
    if (!userId || userId.trim() === '') {
      serviceLogger.warn('getUserCars: empty userId');
      return [];
    }
    
    const cars = await unifiedCarService.getUserCars(userId);
    
    serviceLogger.info('getUserCars completed', { userId, count: cars.length });
    return cars;
  } catch (error) {
    serviceLogger.error('Error in getUserCars', error as Error, { userId });
    throw error;
  }
}

// Re-export the unified car service for advanced use cases
export { unifiedCarService };

// Default export for convenience
export default {
  getCarById,
  getAllCars,
  searchCars,
  getCarsByBrand,
  getFeaturedCars,
  getNewCars,
  getSimilarCars,
  getUserCars,
  unifiedCarService
};
