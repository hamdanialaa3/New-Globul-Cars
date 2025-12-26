// Unified Car Service - Main Orchestrator
// خدمة السيارات الموحدة - المنسق الرئيسي

import { UnifiedCar, CarFilters } from './unified-car-types';
import {
  getFeaturedCars,
  getNewCarsLast24Hours,
  getSimilarCars,
  searchCars,
  getUserCars,
  getCarById
} from './unified-car-queries';
import {
  createCar,
  updateCar,
  deleteCar
} from './unified-car-mutations';
import { invalidateCarCache } from './unified-car-utils';

class UnifiedCarService {
  private collectionName = 'cars';

  // ==================== READ OPERATIONS ====================

  /**
   * Get featured cars for HomePage
   * Retrieves the most popular/featured cars to display on the homepage
   * 
   * @param limitCount - Maximum number of cars to return (default: 4)
   * @returns Promise resolving to array of featured cars
   * @throws Error if database query fails
   * 
   * @example
   * const featured = await unifiedCarService.getFeaturedCars(6);
   * console.log(`Found ${featured.length} featured cars`);
   */
  async getFeaturedCars(limitCount: number = 4): Promise<UnifiedCar[]> {
    return getFeaturedCars(limitCount);
  }

  /**
   * Get new cars from last 24 hours - ⚡ PERFORMANCE: Direct Firestore query
   * @param limitCount - Maximum number of cars to return (default: 12)
   * @returns Promise resolving to array of new cars from last 24 hours
   */
  async getNewCarsLast24Hours(limitCount: number = 12): Promise<UnifiedCar[]> {
    return getNewCarsLast24Hours(limitCount);
  }

  /**
   * Get similar cars (for recommendations)
   * Finds cars similar to the given car based on make, model, price range, etc.
   * 
   * @param carId - The ID of the car to find similar cars for
   * @param limitCount - Maximum number of similar cars to return (default: 6)
   * @returns Promise resolving to array of similar cars
   * @throws Error if car not found or database query fails
   * 
   * @example
   * const similar = await unifiedCarService.getSimilarCars('car-123', 8);
   */
  async getSimilarCars(carId: string, limitCount: number = 6): Promise<UnifiedCar[]> {
    return getSimilarCars(carId, limitCount);
  }

  /**
   * Search cars with filters
   * Performs a filtered search across all car collections
   * 
   * @param filters - Search filters (make, model, price range, location, etc.)
   * @param limitCount - Maximum number of results to return (default: 20)
   * @returns Promise resolving to array of matching cars
   * @throws Error if database query fails
   * 
   * @example
   * const results = await unifiedCarService.searchCars({
   *   make: 'BMW',
   *   minPrice: 10000,
   *   maxPrice: 50000
   * }, 50);
   */
  async searchCars(filters: CarFilters = {}, limitCount: number = 20): Promise<UnifiedCar[]> {
    return searchCars(filters, limitCount);
  }

  /**
   * Get user's cars
   * Retrieves all cars listed by a specific user
   * 
   * @param userId - Firebase UID of the user
   * @returns Promise resolving to array of user's cars
   * @throws Error if user not found or database query fails
   * 
   * @example
   * const userCars = await unifiedCarService.getUserCars('user-123');
   */
  async getUserCars(userId: string): Promise<UnifiedCar[]> {
    return getUserCars(userId);
  }

  /**
   * Get car by ID - searches across ALL vehicle type collections
   * Searches in: cars, passenger_cars, suvs, vans, motorcycles, trucks, buses
   * 
   * @param carId - The car ID to search for
   * @returns Promise resolving to car data or null if not found
   * @throws Error if database query fails
   * 
   * @example
   * const car = await unifiedCarService.getCarById('car-123');
   * if (car) {
   *   console.log(`Found: ${car.make} ${car.model}`);
   * }
   */
  async getCarById(carId: string): Promise<UnifiedCar | null> {
    return getCarById(carId);
  }

  // ==================== WRITE OPERATIONS ====================

  /**
   * Create new car listing (with numeric IDs support)
   * Creates a new car document in the appropriate collection based on vehicle type
   * Automatically assigns numeric IDs via Cloud Functions
   * 
   * @param carData - Partial car data (sellerId, make, model, price, etc. are required)
   * @returns Promise resolving to the created car object with IDs
   * @throws Error if validation fails or database write fails
   * 
   * @example
   *   status: 'active'
   * });
   */
  async createCar(carData: Partial<UnifiedCar>): Promise<{ id: string; sellerNumericId: number; carNumericId: number; ownerNumericId?: number; userCarSequenceId?: number }> {
    const carResult = await createCar(carData);
    invalidateCarCache();
    return carResult;
  }

  /**
   * Update car listing
   * Updates an existing car document with new data
   * Automatically invalidates cache after update
   * 
   * @param carId - The ID of the car to update
   * @param updates - Partial car data with fields to update
   * @returns Promise that resolves when update is complete
   * @throws Error if car not found, permission denied, or database write fails
   * 
   * @example
   * await unifiedCarService.updateCar('car-123', {
   *   price: 32000,
   *   mileage: 50000
   * });
   */
  async updateCar(carId: string, updates: Partial<UnifiedCar>): Promise<void> {
    await updateCar(carId, updates);
    invalidateCarCache();
  }

  /**
   * Delete car listing
   * Permanently deletes a car document from the database
   * Automatically invalidates cache after deletion
   * 
   * @param carId - The ID of the car to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if car not found, permission denied, or database delete fails
   * 
   * @example
   * await unifiedCarService.deleteCar('car-123');
   */
  async deleteCar(carId: string): Promise<void> {
    await deleteCar(carId);
    invalidateCarCache();
  }
}

export const unifiedCarService = new UnifiedCarService();
export default unifiedCarService;