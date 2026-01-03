// Unified Car Types - Interfaces and Type Definitions
// أنواع السيارات الموحدة - واجهات وتعريفات الأنواع

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
  driveType?: string; // Drive type (FWD/RWD/AWD/4WD)
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
  sellerNumericId?: number;
  carNumericId?: number;
  numericId?: number;
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
  locationData?: {
    regionName?: string;
    [key: string]: any;
  };
}

// Vehicle Collections
export const VEHICLE_COLLECTIONS = [
  'cars',             // Legacy collection
  'passenger_cars',   // New: Personal cars
  'suvs',             // New: SUVs/Jeeps
  'vans',             // New: Vans/Cargo
  'motorcycles',      // New: Motorcycles
  'trucks',           // New: Trucks
  'buses'             // New: Buses
] as const;

export type VehicleCollection = typeof VEHICLE_COLLECTIONS[number];