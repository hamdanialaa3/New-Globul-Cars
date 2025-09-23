// src/types/CarData.ts
// Bulgarian Car Marketplace Data Types

export interface CarDataFromFile {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  currency: string; // Always 'EUR' for Bulgarian market
  mileage: number;
  fuelType: string;
  transmission: string;
  engineSize: number;
  power: number;
  powerUnit: 'hp' | 'kw';
  doors: number;
  seats: number;
  color: string;
  condition: 'new' | 'used' | 'pre-registration';
  location: string; // Bulgarian cities
  description?: string;
  features: string[];
  images?: string[];
  sellerType: 'dealer' | 'private';
  dealerRating?: number;
  createdAt: string;
  country: string; // Always 'BG' for Bulgaria
}

export interface CarDataSummary {
  totalCars: number;
  brands: number;
  models: number;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  currency: string; // 'EUR'
  country: string; // 'BG'
  lastUpdated: string;
}

export interface SearchFilters {
  query?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string[];
  transmission?: string[];
  location?: string;
  condition?: string[];
  sellerType?: string[];
  withImages?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc' | 'mileage_asc' | 'date_desc';
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
  lastUsed?: string;
  resultCount?: number;
}

// Advanced Search Parameters for mobile.de-like system
export interface AdvancedSearchParams {
  // Basic Data
  make: string;
  model: string;
  vehicleType: string[];
  minSeats: string;
  maxSeats: string;
  doors: string;
  slidingDoor: string;

  // Price & Condition
  condition: string[];
  paymentType: string[];
  minPrice: string;
  maxPrice: string;
  minFirstRegistration: string;
  maxFirstRegistration: string;
  minMileage: string;
  maxMileage: string;
  huValidUntil: string;
  owners: string;
  fullServiceHistory: boolean;
  roadworthy: boolean;
  newService: boolean;

  // Location
  country: string;
  city: string;
  zipCode: string;
  radius: string;
  deliveryAvailable: boolean;

  // Technical Data
  fuelType: string[];
  minPower: string;
  maxPower: string;
  powerUnit: 'hp' | 'kw';
  minEngineSize: string;
  maxEngineSize: string;
  minFuelTank: string;
  maxFuelTank: string;
  minWeight: string;
  maxWeight: string;
  minCylinders: string;
  maxCylinders: string;
  driveType: string;
  transmission: string[];
  maxFuelConsumption: string;
  emissionSticker: string;
  emissionClass: string;
  particulateFilter: boolean;

  // Exterior
  exteriorColor: string[];
  exteriorFinish: string[];
  trailerCoupling: string;
  trailerAssist: boolean;
  minTrailerLoadBraked: string;
  minTrailerLoadUnbraked: string;
  noseWeight: string;
  parkingSensors: string[];
  camera360: boolean;
  rearTrafficAlert: boolean;
  selfSteering: boolean;
  cruiseControl: string[];

  // Exterior Features (Checkboxes)
  exteriorFeatures: string[];

  // Interior
  interiorColor: string[];
  interiorMaterial: string[];
  airbags: string[];
  airConditioning: string[];
  interiorFeatures: string[];

  // Offer Details
  sellerType: string[];
  minDealerRating: string;
  adOnlineSince: string;
  withPictures: boolean;
  vatReclaimable: boolean;
  warranty: boolean;
  nonSmoker: boolean;

  // Exclude vehicles
  excludeVehicles: string[];
}

// Vehicle Types for Bulgarian market
export interface VehicleType {
  value: string;
  label: string;
  labelBg: string;
}

// Available Options for filters
export interface AvailableFilterOptions {
  makes: string[];
  models: string[];
  modelsByMake: Record<string, string[]>;
  vehicleTypes: VehicleType[];
  conditions: { value: string; label: string; labelBg: string }[];
  cities: string[];
  fuelTypes: { value: string; label: string; labelBg: string }[];
  transmissions: { value: string; label: string; labelBg: string }[];
  colors: { value: string; label: string; labelBg: string }[];
  features: { value: string; label: string; labelBg: string }[];
}

// Analytics Data
export interface SearchAnalytics {
  searchResults: CarDataFromFile[];
  searchParams: AdvancedSearchParams;
  searchDuration: number;
  timestamp: string;
}

// Rating System
export interface DealerRating {
  dealerId: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}