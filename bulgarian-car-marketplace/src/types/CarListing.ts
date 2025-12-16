export interface CarListing {
  // Basic Information
  id?: string;

  // ✅ NEW: Numeric ID system for clean URLs
  numericId?: number;           // Unique numeric ID per seller (e.g., 1, 2, 3...)
  sellerNumericId?: number;     // Seller's numeric ID

  vehicleType: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  power?: number; // in hp
  powerKW?: number; // in kW (for search filters)
  engineSize?: number; // Cubic Capacity in cm³
  color?: string;
  exteriorColor?: string; // Alias for color
  doors?: string;
  numberOfDoors?: number; // Numeric value for search (from/to)
  seats?: string;
  numberOfSeats?: number; // Numeric value for search (from/to)
  slidingDoor?: boolean;
  previousOwners?: string;
  numberOfOwners?: number; // Numeric value for search
  condition?: string; // Type and condition
  accidentHistory: boolean;
  serviceHistory: boolean;
  fullServiceHistory?: boolean; // Full service history flag
  roadworthy?: boolean; // Is car roadworthy
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
  fuelConsumption?: number; // l/100km
  co2Emissions?: number;
  euroStandard?: string;
  weight?: number; // Weight in kg
  weightKg?: number; // Weight in kg (alias)
  maxWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  groundClearance?: number;
  trunkVolume?: number;
  fuelTankCapacity?: number; // Fuel Tank Volume in liters
  fuelTankVolumeL?: number; // Fuel Tank Volume in liters (alias)
  cylinders?: number;
  acceleration?: number;
  topSpeed?: number;
  features?: string[];

  // Emission & Environmental
  emissionSticker?: string; // Emission sticker type
  emissionClass?: string; // Emission class (Euro 4, 5, 6, etc.)
  particulateFilter?: boolean; // Particulate filter installed

  // Equipment
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  exteriorEquipment?: string[];
  interiorEquipment?: string[];
  extras?: string[];

  // Exterior Features
  trailerCoupling?: boolean; // Trailer Coupling (Yes/No)
  towbar?: string; // Trailer coupling type: 'fixed' | 'detachable' | 'swiveling' | 'none'
  trailerLoadBraked?: number; // Trailer Load Braked in kg
  trailerLoadUnbraked?: number; // Trailer Load Unbraked in kg
  noseWeight?: number; // Nose Weight in kg
  parkingSensors?: string[]; // Parking Sensors (front, rear, 360, etc.)
  parkingAssist?: string[]; // Alias for parkingSensors
  cruiseControl?: string; // 'none' | 'cruise' | 'adaptive'

  // Interior Features
  interiorColor?: string;
  interiorMaterial?: string; // fabric, leather, alcantara, etc.
  airbags?: string; // Airbags level/type
  airConditioning?: string; // Air Conditioning type
  climateControl?: string; // Alias for airConditioning

  // Images
  images?: File[];

  // Pricing
  price: number;
  currency: string;
  priceType: string;
  paymentType?: string; // Payment type filter
  negotiable: boolean;
  financing: boolean;
  tradeIn: boolean;
  warranty: boolean;
  warrantyMonths?: number;
  additionalCosts?: string;
  paymentMethods: string[];
  pricingDescription?: string;

  // Registration & Inspection
  firstRegistrationDate?: Date; // First Registration date
  firstRegistration?: Date; // Alias
  inspectionValidUntil?: Date; // HU Valid Until date
  huValid?: Date; // Alias for inspectionValidUntil

  // Contact
  preferredContact: string[];
  availableHours?: string;
  additionalInfo?: string;

  // Offer Details
  adOnlineSince?: Date; // Ad Online Since date
  adOnlineSinceDays?: number; // Days since ad was posted
  hasVideo?: boolean; // Ads with Video
  withVideo?: boolean; // Alias for hasVideo
  videoUrl?: string; // Video URL if available
  hasImages?: boolean; // Ads with Pictures (derived from images array)
  discountOffer?: boolean; // Discount Offers available
  nonSmoker?: boolean; // Non-smoker Vehicle
  taxi?: boolean; // Used as taxi
  vatReclaimable?: boolean; // VAT Reclaimable
  vatDeductible?: boolean; // Alias for vatReclaimable
  damagedVehicles?: string; // Damaged Vehicles description
  isDamaged?: boolean; // Alias (true if damagedVehicles is set)
  commercial?: boolean; // Commercial, Export/Import
  approvedUsedProgramme?: string; // Approved Used Car Programme
  dealerRating?: number; // Dealer Rating (0-5)

  // System Fields
  createdAt?: Date;
  updatedAt?: Date;
  status: 'draft' | 'active' | 'sold' | 'expired' | 'deleted';
  views?: number;
  favorites?: number;
  isFeatured?: boolean;
  isUrgent?: boolean;
  expiresAt?: Date;

  // Search in Description
  searchKeywords?: string; // Keywords for text search in description
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
  config: Record<string, unknown>;
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
  data: Record<string, unknown>;
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
  data: Record<string, unknown>;
  error?: string;
}
