/**
 * Workflow Types
 * أنواع البيانات للـ workflow
 *
 * This module contains all type definitions for the workflow persistence system.
 * يحتوي هذا الوحدة على جميع تعريفات الأنواع لنظام حفظ البيانات.
 */

export interface UnifiedWorkflowData {
  // Step 1: Vehicle Type
  vehicleType?: string; // 'car' | 'suv' | 'van' | 'motorcycle' | 'truck' | 'bus'

  // Step 2: Vehicle Details (All fields from VehicleDataPageUnified)
  make?: string;
  makeRaw?: string; // ✅ ADDED: Raw make input
  model?: string;
  year?: string;
  firstRegistration?: string;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  driveType?: string; // ✅ ADDED: Drive type (FWD/RWD/AWD/4WD)
  power?: string;
  powerKW?: string;
  engineSize?: string;
  color?: string;
  doors?: string;
  seats?: string;
  exteriorColor?: string; // ✅ ADDED: Exterior color
  previousOwners?: string; // ✅ ADDED: Previous owners
  hasAccidentHistory?: boolean; // ✅ ADDED: Accident history
  hasServiceHistory?: boolean; // ✅ ADDED: Service history
  variant?: string; // ✅ ADDED: Variant
  condition?: string;
  roadworthy?: boolean;
  saleType?: string;
  saleTimeline?: string;
  bodyType?: string; // ✅ ADDED: Body type

  // "Other" fields for free text entry
  bodyTypeOther?: string;
  makeOther?: string;
  modelOther?: string;
  fuelTypeOther?: string;
  colorOther?: string;
  exteriorColorOther?: string;

  // Location
  region?: string;
  city?: string;
  postalCode?: string;
  saleProvince?: string; // ✅ ADDED: Specific sale location fields
  saleCity?: string;
  salePostalCode?: string;
  saleCountry?: string;
  saleLocation?: string;

  // Step 3: Equipment (Arrays only - NO duplicate strings!)
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  extrasEquipment?: string[];

  // Step 4: Images (count only - files stored in IndexedDB)
  imagesCount?: number;

  // Step 5: Pricing
  price?: string;
  currency?: string;
  priceType?: string;
  negotiable?: boolean;
  financing?: boolean;
  tradeIn?: boolean;
  warranty?: boolean;
  warrantyMonths?: string;
  vatDeductible?: boolean;

  // Contact
  sellerType?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;

  // Additional Info
  description?: string;
  hasVideo?: boolean;
  videoUrl?: string;

  // Metadata
  currentStep: number | string; // 1-5 or step id
  startedAt: number; // Timestamp
  lastSavedAt: number; // Timestamp
  isPublished: boolean; // Prevents auto-deletion
  completedSteps: number[]; // Array of completed step numbers
}

export interface TimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

export interface ValidationResult {
  isValid: boolean;
  critical: string[];
  recommended: string[];
}

export interface StorageUsage {
  used: number;
  percentage: number;
}

export interface WorkflowProgress {
  completedSteps: number;
  totalSteps: number;
  percentage: number;
}

export interface WorkflowTimer {
  interval: NodeJS.Timeout | null;
  listeners: Set<(state: TimerState) => void>;
  clearListeners: Set<() => void>;
}

export interface WorkflowState {
  saveInProgress: boolean;
  lastSaveTimestamp: number;
  debounceLocked: boolean;
  saveDebounceMs: number;
}

export interface LegacyWorkflowState {
  data: Record<string, any>;
  images: string[];
  lastUpdated: number;
  currentStep: string;
}

export interface LegacyStorageUsage {
  used: number;
  max: number;
  percentage: number;
}
