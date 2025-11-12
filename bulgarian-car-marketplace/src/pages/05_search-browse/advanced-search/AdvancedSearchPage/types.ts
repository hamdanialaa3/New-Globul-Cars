// src/pages/AdvancedSearchPage/types.ts
// Type definitions for Advanced Search Page

export interface SearchData {
  // Basic Data
  make: string;
  model: string;
  vehicleType: string;
  seatsFrom: string;
  seatsTo: string;
  doorsFrom: string;
  doorsTo: string;
  slidingDoor: string;
  condition: string;
  paymentType: string;
  priceFrom: string;
  priceTo: string;
  firstRegistrationFrom: string;
  firstRegistrationTo: string;
  mileageFrom: string;
  mileageTo: string;
  huValid: string;
  ownersCount: string;
  serviceHistory: string;
  roadworthy: string;
  // Technical Data
  fuelType: string;
  powerFrom: string;
  powerTo: string;
  cubicCapacityFrom: string;
  cubicCapacityTo: string;
  fuelTankVolumeFrom: string;
  fuelTankVolumeTo: string;
  weightFrom: string;
  weightTo: string;
  cylindersFrom: string;
  cylindersTo: string;
  driveType: string;
  transmission: string;
  fuelConsumptionUpTo: string;
  emissionSticker: string;
  emissionClass: string;
  particulateFilter: string;
  // Exterior
  exteriorColor: string;
  trailerCoupling: string;
  trailerLoadBraked: string;
  trailerLoadUnbraked: string;
  noseWeight: string;
  parkingSensors: string[];
  cruiseControl: string;
  // Interior
  interiorColor: string;
  interiorMaterial: string;
  airbags: string;
  airConditioning: string;
  // ✅ Equipment Arrays
  safetyEquipment: string[];
  comfortEquipment: string[];
  infotainmentEquipment: string[];
  extras: string[];
  // Offer Details
  seller: string;
  dealerRating: string;
  adOnlineSince: string;
  adsWithPictures: boolean;
  adsWithVideo: boolean;
  discountOffers: boolean;
  nonSmokerVehicle: boolean;
  taxi: boolean;
  vatReclaimable: boolean;
  warranty: boolean;
  damagedVehicles: boolean;
  commercialExport: string;
  approvedUsedProgramme: string;
  // Location
  country: string;
  city: string;
  radius: string;
  deliveryOffers: boolean;
  // Search
  searchDescription: string;
}

export interface SectionState {
  basicData: boolean;
  technicalData: boolean;
  exterior: boolean;
  interior: boolean;
  offerDetails: boolean;
  location: boolean;
  searchDescription: boolean;
}

export type SectionName = keyof SectionState;

// Sort options for search results
export type SortOption = 
  | 'createdAt_desc'  // Newest first (default)
  | 'price_asc'       // Price: Low to High
  | 'price_desc'      // Price: High to Low
  | 'year_desc'       // Year: Newest first
  | 'mileage_asc';    // Mileage: Low to High

// View mode for search results
export type ViewMode = 'list' | 'map';

// Search results metadata
export interface SearchResultsMeta {
  totalResults: number;
  processingTime: number;
  page: number;
  totalPages: number;
}