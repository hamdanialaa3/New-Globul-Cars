/**
 * Car Services Barrel Export
 * This file provides backward compatibility and easy imports
 * Re-exports from unified car services
 */

// Re-export types from unified car types
export type { 
  UnifiedCar as Car,
  UnifiedCar,
  CarFilters,
  VehicleCollection
} from './car/unified-car-types';

// Re-export query functions from unified car queries
export { 
  getCarById,
  searchCars,
  getUserCars,
  getFeaturedCars,
  getNewCarsLast24Hours,
  getSimilarCars,
  mapDocToCar
} from './car/unified-car-queries';

// Re-export the unified car service instance as default export
export { unifiedCarService as default } from './car/unified-car-service';

// Also export as named export for flexibility
export { unifiedCarService } from './car/unified-car-service';
