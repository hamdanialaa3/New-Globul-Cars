// Unified Car Service - Main Orchestrator
// خدمة السيارات الموحدة - المنسق الرئيسي

import { UnifiedCar, CarFilters } from './unified-car-types';
import {
  getFeaturedCars,
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
   */
  async getFeaturedCars(limitCount: number = 4): Promise<UnifiedCar[]> {
    return getFeaturedCars(limitCount);
  }

  /**
   * Get similar cars (for recommendations)
   */
  async getSimilarCars(carId: string, limitCount: number = 6): Promise<UnifiedCar[]> {
    return getSimilarCars(carId, limitCount);
  }

  /**
   * Search cars with filters
   */
  async searchCars(filters: CarFilters = {}, limitCount: number = 20): Promise<UnifiedCar[]> {
    return searchCars(filters, limitCount);
  }

  /**
   * Get user's cars
   */
  async getUserCars(userId: string): Promise<UnifiedCar[]> {
    return getUserCars(userId);
  }

  /**
   * Get car by ID - searches across ALL vehicle type collections
   */
  async getCarById(carId: string): Promise<UnifiedCar | null> {
    return getCarById(carId);
  }

  // ==================== WRITE OPERATIONS ====================

  /**
   * Create new car (with numeric IDs support)
   */
  async createCar(carData: Partial<UnifiedCar>): Promise<string> {
    const carId = await createCar(carData);
    invalidateCarCache();
    return carId;
  }

  /**
   * Update car
   */
  async updateCar(carId: string, updates: Partial<UnifiedCar>): Promise<void> {
    await updateCar(carId, updates);
    invalidateCarCache();
  }

  /**
   * Delete car
   */
  async deleteCar(carId: string): Promise<void> {
    await deleteCar(carId);
    invalidateCarCache();
  }
}

export const unifiedCarService = new UnifiedCarService();
export default unifiedCarService;