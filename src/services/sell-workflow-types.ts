// sell-workflow-types.ts - Types and interfaces for sell workflow service
// Split from sellWorkflowService.ts (839 lines) to comply with 300-line limit

export interface EnhancedLocation {
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

export interface WorkflowData {
  vehicleType?: string;
  sellerType?: string;
  make?: string;
  model?: string;
  year?: number | string;
  mileage?: number | string;
  fuelType?: string;
  transmission?: string;
  region?: string;
  locationData?: {
    cityName?: string;
    cityId?: string;
  };
  postalCode?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  images?: string[] | string | number;
  imagesCount?: number;
  price?: number | string;
  numericId?: number;
  sellerNumericId?: number;
  safety?: Record<string, unknown>;
  comfort?: Record<string, unknown>;
  infotainment?: Record<string, unknown>;
  extras?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface WorkflowStep {
  id: string;
  title: string;
  completed: boolean;
  data: Partial<WorkflowData>;
  timestamp?: Date;
}

export interface WorkflowProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  steps: WorkflowStep[];
  lastUpdated: Date;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export interface WorkflowImageUpload {
  file: File;
  preview: string;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export interface WorkflowDraft {
  id: string;
  userId: string;
  data: WorkflowData;
  progress: WorkflowProgress;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}