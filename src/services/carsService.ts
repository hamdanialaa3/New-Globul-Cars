/**
 * Cars Service - Barrel Export
 * Re-exports from unified car service for backward compatibility
 */

import { unifiedCarService } from './car/unified-car-service';
import type { UnifiedCar } from './car/unified-car-types';

// Export the Car type for backward compatibility
export type Car = UnifiedCar;

// Export getCarById function
export async function getCarById(carId: number | string): Promise<Car | null> {
  const id = typeof carId === 'number' ? carId.toString() : carId;
  return await unifiedCarService.getCarById(id);
}

// Export getAllCars function
export async function getAllCars(limitCount?: number): Promise<Car[]> {
  return await unifiedCarService.getFeaturedCars(limitCount);
}

// Export getFeaturedCars function
export async function getFeaturedCars(limitCount?: number): Promise<Car[]> {
  return await unifiedCarService.getFeaturedCars(limitCount);
}

// Export searchCars function
export async function searchCars(filters: any, limitCount?: number): Promise<Car[]> {
  return await unifiedCarService.searchCars(filters, limitCount);
}

// Export getUserCars function
export async function getUserCars(userId: string): Promise<Car[]> {
  return await unifiedCarService.getUserCars(userId);
}

// Re-export the entire service as default
export { unifiedCarService as default };
