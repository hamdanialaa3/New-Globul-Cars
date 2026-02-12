// Koli One Profile Types
// أنواع البيانات الخاصة بنظام البروفايل

export type ProfileType = 'private' | 'dealer' | 'corporate';
export type BadgeType = 
  | 'phone_verified' 
  | 'identity_verified' 
  | 'dealer_verified' 
  | 'company_certified'
  | 'trusted_seller';

export type ProfileAction = 
  | 'contact' 
  | 'book_inspection' 
  | 'book_test_drive' 
  | 'request_quote' 
  | 'schedule_consultation';

/**
 * Badge information with display metadata
 */
export interface BadgeInfo {
  type: BadgeType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Main seller profile interface
 */
export interface SellerProfile {
  // IDs
  id: string;                           // Firebase document ID
  sellerId: string;                     // Firebase Auth UID
  numericId: number;                    // Numeric ID (URL-safe)
  
  // Profile type
  profileType: ProfileType;
  
  // Basic information
  name: string;
  logo?: string;                        // URL or Firebase Storage ref
  description?: string;
  
  // Location
  location: {
    city: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Contact information
  phone: string;                        // +359 format
  email: string;
  businessHours?: {
    open: string;                       // "09:00"
    close: string;                      // "18:00"
    days: string[];                     // ['Monday', 'Tuesday', ...]
  };
  
  // Verification & Trust
  badges: BadgeType[];
  verificationDocs?: {
    type: 'identity' | 'business_license' | 'tax_id';
    uploadedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    documentUrl?: string;
  }[];
  
  // Trust metrics
  stats: {
    totalListings: number;
    avgResponseTime: number;            // minutes
    responseRate: number;               // percentage (0-100)
    trustScore: number;                 // 0-100
    totalReviews?: number;
    averageRating?: number;
  };
  
  // Gallery (for all types)
  gallery: {
    url: string;
    type: 'image' | 'video';
    uploadedAt: Date;
    alt?: string;
  }[];
  
  // Dealer/Corporate specific
  businessName?: string;
  businessLicense?: string;
  teamMembers?: {
    name: string;
    role: string;
    photo?: string;
  }[];
  
  // Corporate specific
  officeLocations?: {
    name: string;
    address: string;
    phone: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }[];
  corporateServices?: string[];         // ['fleet_sales', 'leasing', ...]
  certifications?: {
    name: string;
    issuer: string;
    issuedAt: Date;
    expiresAt?: Date;
    certificateUrl?: string;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

/**
 * Car filters interface (for dealer/corporate profile)
 */
export interface CarFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  vehicleType?: string;
  condition?: string;
  location?: {
    city?: string;
    region?: string;
  };
}

/**
 * Profile shell props
 */
export interface ProfileShellProps {
  profileType: ProfileType;
  profileId: string;                    // Numeric ID or Firebase UID
  profileData: SellerProfile;
  children: React.ReactNode;
  isLoading?: boolean;
  onActionClick?: (action: ProfileAction, payload?: any) => void;
  className?: string;
}

/**
 * Trust panel props
 */
export interface TrustPanelProps {
  profile: SellerProfile;
  accentColor: string;
  className?: string;
}

/**
 * Badges component props
 */
export interface ProfileBadgesProps {
  badges: BadgeType[];
  accentColor: string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

/**
 * Profile loader props
 */
export interface ProfileLoaderProps {
  stage: number;                        // 0-100
  profileType: ProfileType;
  message?: string;
  visible?: boolean;
  className?: string;
}

/**
 * Protected action payload
 */
export interface ProfileActionPayload {
  action: ProfileAction;
  profileId: string;
  profileType: ProfileType;
  sellerId: string;
  sellerName: string;
  redirectAfterAuth?: string;
}
