// Personal Vehicle Types
// أنواع بيانات المركبة الشخصية (مشابهة لـ mobile.de)

import { Timestamp } from 'firebase/firestore';

export interface PersonalVehicle {
  // Basic Info
  id: string;
  userId: string;
  make: string;              // Audi
  model: string;              // A1
  variant?: string;           // A1 1.2 TFSI Attraction Sportback
  
  // Registration
  firstRegistration: {
    month: number;            // 2 (February)
    year: number;             // 2013
  };
  
  // Physical
  doors: '2/3' | '4/5' | '6/7';
  category?: string;           // Kleinwagen (auto-filled)
  exteriorColor: {
    name: string;             // Schwarz
    isMetallic: boolean;      // true/false
  };
  
  // Technical
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  transmission: 'manual' | 'automatic';
  power: {
    hp: number;               // 85
    kw: number;               // 63
  };
  
  // Usage
  purchaseDate?: {
    month?: number;
    year?: number;
  };
  purchaseMileage?: number;
  currentMileage: number;      // REQUIRED
  annualMileage?: number;
  
  // Inspection
  inspectionValidUntil?: {
    month?: number;
    year?: number;
  };
  
  // Ownership
  isSoleUser: boolean;
  
  // Location
  postalCode: string;         // REQUIRED
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  marketValue?: number;       // Calculated
  nextInspectionReminder?: Timestamp;
  nextServiceReminder?: Timestamp;
}

export interface PersonalVehicleFormData {
  // Step 1: Brand & Model
  make: string;
  model: string;
  variant?: string;
  
  // Step 2: Basic Details
  registrationMonth: string;
  registrationYear: string;
  doors: '2/3' | '4/5' | '6/7' | '';
  category?: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | '';
  transmission: 'manual' | 'automatic' | '';
  power: string; // HP as string, will be converted
  
  // Step 3: Color
  color: string;
  isMetallic: boolean;
  
  // Step 4: Purchase & Usage
  purchaseMonth?: string;
  purchaseYear?: string;
  purchaseMileage?: string;
  currentMileage: string; // REQUIRED
  annualMileage?: string;
  inspectionMonth?: string;
  inspectionYear?: string;
  isSoleUser: boolean | null;
  postalCode: string; // REQUIRED
}

export interface VehicleReminder {
  id: string;
  userId: string;
  vehicleId: string;
  type: 'inspection' | 'service' | 'tire-change';
  title: string;
  dueDate: Timestamp;
  isCompleted: boolean;
  notificationSent: boolean;
  createdAt: Timestamp;
  vehicle?: {
    make: string;
    model: string;
  };
}

export interface MarketValueCalculation {
  vehicleId: string;
  value: number;
  currency: 'EUR';
  calculatedAt: Timestamp;
  source: 'internal' | 'external-api';
  confidence: number; // 0-100
}
