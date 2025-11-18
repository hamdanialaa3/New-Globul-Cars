/**
 * Sell Workflow Types - Complete Type Safety
 * نظام أنواع شامل لعملية بيع السيارات
 * 
 * Location: src/types/sell-workflow.types.ts
 * Week: 1, Day: 1-2
 */

import { Timestamp } from 'firebase/firestore';

// ============ ENUMS & LITERAL TYPES ============

export type VehicleType = 'car' | 'truck' | 'motorcycle' | 'van';
export type SellerType = 'private' | 'dealer' | 'company';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'LPG' | 'CNG';
export type Transmission = 'Manual' | 'Automatic' | 'Semi-Automatic';
export type PriceType = 'fixed' | 'negotiable' | 'auction';
export type Currency = 'EUR' | 'BGN' | 'USD';
export type CarCondition = 'new' | 'used' | 'damaged';

// ============ EQUIPMENT DATA ============

export interface EquipmentData {
  safety: string[];
  comfort: string[];
  infotainment: string[];
  extras: string[];
}

// ============ LOCATION DATA ============

export interface LocationData {
  region: string;
  regionNameBg: string;
  regionNameEn: string;
  city: string;
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// ============ SELLER CONTACT INFO ============

export interface SellerContactInfo {
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  preferredContact: string[];
  availableHours?: string;
  additionalPhone?: string;
  additionalInfo?: string;
}

// ============ PRICING DATA ============

export interface PricingData {
  price: number;
  currency: Currency;
  priceType: PriceType;
  negotiable: boolean;
  financing: boolean;
  tradeIn: boolean;
  warranty: boolean;
  warrantyMonths?: number;
  paymentMethods: string[];
  additionalCosts?: string;
  vatDeductible: boolean;
}

// ============ VEHICLE BASIC DATA ============

export interface VehicleBasicData {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  variant?: string;
  power?: number;
  engineSize?: number;
  color?: string;
  doors?: string;
  seats?: string;
  previousOwners?: number;
  accidentHistory: boolean;
  serviceHistory: boolean;
  firstRegistration?: string;
  inspectionValidUntil?: string;
  condition?: CarCondition;
  vin?: string;
  description?: string;
}

// ============ COMPLETE WORKFLOW DATA ============

export interface SellWorkflowData {
  vehicleType: VehicleType;
  sellerType: SellerType;
  vehicle: VehicleBasicData;
  equipment: EquipmentData;
  images: string[];
  pricing: PricingData;
  seller: SellerContactInfo;
  location: LocationData;
  userId?: string;
  draftId?: string;
  lastUpdated?: number;
  currentStep?: number;
}

// ============ VALIDATION TYPES ============

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  criticalMissing: boolean;
}

// ============ API RESPONSE TYPES ============

export interface CreateCarResponse {
  success: boolean;
  carId?: string;
  error?: string;
  validationErrors?: ValidationError[];
}

export interface UploadImagesResponse {
  success: boolean;
  imageUrls?: string[];
  failedImages?: number[];
  error?: string;
}

export interface SaveDraftResponse {
  success: boolean;
  draftId?: string;
  error?: string;
}

// ============ STORAGE TYPES ============

export interface WorkflowState {
  data: SellWorkflowData;
  images: File[] | string[];
  currentStep: number;
  lastUpdated: number;
  expiresAt: number;
}

// ============ LEGACY COMPATIBILITY ============

export interface LegacyWorkflowData {
  vehicleType?: string;
  sellerType?: string;
  make?: string;
  model?: string;
  year?: string;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  safety?: string | string[];
  comfort?: string | string[];
  infotainment?: string | string[];
  extras?: string | string[];
  images?: string | string[];
  price?: string;
  currency?: string;
  priceType?: string;
  negotiable?: string | boolean;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  region?: string;
  city?: string;
  [key: string]: any;
}

