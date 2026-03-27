// src/pages/MyListingsPage/types.ts
// TypeScript interfaces for MyListingsPage

// Vehicle Data Types - من قسم إضافة السيارة
export interface VehicleData {
  make: string;
  model: string;
  variant?: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  power: string;
  engineSize?: string;
  doors: number;
  seats: number;
  color: string;
  previousOwners: number;
  firstRegistration?: string;
  hasAccidentHistory: boolean;
  hasServiceHistory: boolean;
  isDamaged: boolean;
  isRoadworthy: boolean;
  nonSmoker: boolean;
  taxi: boolean;
}

// Equipment Types - من قسم المعدات
export interface EquipmentData {
  safety: string[];
  comfort: string[];
  infotainment: string[];
  extras: string[];
}

// Location Data
export interface LocationData {
  cityId: string;
  cityName: {
    en: string;
    bg: string;
    ar: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  region?: string;
  postalCode?: string;
  address?: string;
}

// Media Data
export interface MediaData {
  images: string[];
  hasVideo: boolean;
  videoUrl?: string;
}

// Complete Car Listing Interface
export interface MyListing {
  id: string;
  sellerNumericId?: number;
  carNumericId?: number;
  numericId?: number; // Legacy support
  title: string;
  price: number;
  currency: 'EUR';
  status: 'active' | 'sold' | 'pending' | 'inactive';
  views: number;
  inquiries: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  isUrgent: boolean;

  // Vehicle Data
  vehicle: VehicleData;

  // Equipment Data
  equipment: EquipmentData;

  // Location Data
  location: LocationData;

  // Media Data
  media: MediaData;

  // Contact Data
  contact: {
    sellerName: string;
    sellerType: 'individual' | 'dealer';
    phone: string;
    email: string;
    preferredContact: 'phone' | 'email' | 'both';
  };

  // Description
  description?: string;
}

export interface MyListingsStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  totalInquiries: number;
}

export interface MyListingsFilters {
  status: string;
  sortBy: 'date' | 'price' | 'views' | 'inquiries';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

export interface MyListingsSection {
  title: string;
  description?: string;
  component: string;
}
