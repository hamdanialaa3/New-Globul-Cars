export interface CarListing {
  // Basic Information
  id?: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  power?: number;
  engineSize?: number;
  color?: string;
  doors?: string;
  seats?: string;
  previousOwners?: string;
  accidentHistory: boolean;
  serviceHistory: boolean;
  description?: string;

  // Seller Information
  sellerType: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
    sellerId: string;  // User ID of the seller - REQUIRED for security rules
  companyName?: string;
  companyAddress?: string;
  companyWebsite?: string;

  // Location
  location?: string;
  city: string;
  region: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Technical Specifications
  engineType?: string;
  driveType?: string;
  fuelConsumption?: number;
  co2Emissions?: number;
  euroStandard?: string;
  weight?: number;
  maxWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  groundClearance?: number;
  trunkVolume?: number;
  fuelTankCapacity?: number;
  acceleration?: number;
  topSpeed?: number;
  features?: string[];

  // Equipment
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  exteriorEquipment?: string[];
  interiorEquipment?: string[];
  extras?: string[];

  // Images
  images?: File[];

  // Pricing
  price: number;
  currency: string;
  priceType: string;
  negotiable: boolean;
  financing: boolean;
  tradeIn: boolean;
  warranty: boolean;
  warrantyMonths?: number;
  additionalCosts?: string;
  paymentMethods: string[];
  pricingDescription?: string;

  // Contact
  preferredContact: string[];
  availableHours?: string;
  additionalInfo?: string;

  // System Fields
  createdAt?: Date;
  updatedAt?: Date;
  status: 'draft' | 'active' | 'sold' | 'expired' | 'deleted';
  views?: number;
  favorites?: number;
  isFeatured?: boolean;
  isUrgent?: boolean;
  expiresAt?: Date;
}

export interface CarListingFormData extends Partial<CarListing> {
  // Form specific fields
  step: number;
  isComplete: boolean;
  validationErrors?: { [key: string]: string };
}

export interface CarListingFilters {
  vehicleType?: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuelType?: string;
  transmission?: string;
  location?: string;
  region?: string;
  features?: string[];
  sellerType?: string;
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CarListingSearchResult {
  listings: CarListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CarListingStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  expiredListings: number;
  totalViews: number;
  totalFavorites: number;
  averagePrice: number;
  averageMileage: number;
  mostPopularMake: string;
  mostPopularModel: string;
  mostPopularRegion: string;
}

export interface CarListingAnalytics {
  views: number;
  favorites: number;
  inquiries: number;
  phoneCalls: number;
  emails: number;
  whatsappMessages: number;
  lastViewed?: Date;
  lastInquiry?: Date;
  conversionRate: number;
}

export interface CarListingValidation {
  isValid: boolean;
  errors: { [key: string]: string };
  warnings: { [key: string]: string };
}

export interface CarListingExport {
  format: 'csv' | 'excel' | 'pdf';
  data: CarListing[];
  filename: string;
  createdAt: Date;
}

export interface CarListingImport {
  file: File;
  format: 'csv' | 'excel';
  mapping: { [key: string]: string };
  validation: CarListingValidation;
  preview: CarListing[];
}

export interface CarListingTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarListingCategory {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  icon: string;
  parentId?: string;
  children?: CarListingCategory[];
  isActive: boolean;
  sortOrder: number;
}

export interface CarListingTag {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  color: string;
  isActive: boolean;
  usageCount: number;
}

export interface CarListingReport {
  id: string;
  title: string;
  description: string;
  type: 'spam' | 'inappropriate' | 'fraud' | 'duplicate' | 'other';
  reason: string;
  reporterId: string;
  reporterEmail: string;
  listingId: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  resolution?: string;
}

export interface CarListingNotification {
  id: string;
  type: 'inquiry' | 'favorite' | 'view' | 'message' | 'system';
  title: string;
  message: string;
  listingId: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  actionText?: string;
}

export interface CarListingMessage {
  id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  message: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  attachments?: File[];
}

export interface CarListingFavorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export interface CarListingInquiry {
  id: string;
  listingId: string;
  inquirerId: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone: string;
  message: string;
  type: 'general' | 'price' | 'availability' | 'technical' | 'other';
  status: 'pending' | 'replied' | 'closed';
  createdAt: Date;
  repliedAt?: Date;
  closedAt?: Date;
}

export interface CarListingComparison {
  id: string;
  userId: string;
  listings: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CarListingHistory {
  id: string;
  listingId: string;
  action: 'created' | 'updated' | 'viewed' | 'favorited' | 'inquiry' | 'sold' | 'expired' | 'deleted';
  userId: string;
  details: { [key: string]: any };
  createdAt: Date;
}

export interface CarListingBackup {
  id: string;
  listingId: string;
  data: CarListing;
  createdAt: Date;
  reason: 'update' | 'delete' | 'system' | 'manual';
  createdBy: string;
}

export interface CarListingAudit {
  id: string;
  listingId: string;
  action: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  details: { [key: string]: any };
  createdAt: Date;
}

export interface CarListingPermission {
  id: string;
  userId: string;
  listingId: string;
  permission: 'view' | 'edit' | 'delete' | 'manage';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface CarListingWorkflow {
  id: string;
  name: string;
  description: string;
  steps: CarListingWorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarListingWorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'form' | 'approval' | 'notification' | 'action';
  order: number;
  isRequired: boolean;
  config: { [key: string]: any };
}

export interface CarListingWorkflowInstance {
  id: string;
  workflowId: string;
  listingId: string;
  currentStep: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  startedBy: string;
  completedBy?: string;
  cancelledBy?: string;
  data: { [key: string]: any };
}

export interface CarListingWorkflowStepInstance {
  id: string;
  workflowInstanceId: string;
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  skippedAt?: Date;
  failedAt?: Date;
  completedBy?: string;
  skippedBy?: string;
  failedBy?: string;
  data: { [key: string]: any };
  error?: string;
}
