// Profile Page Types - Moved to @globul-cars/profile package
// Updated imports to use package aliases

import type { BulgarianUser } from '@globul-cars/core/types/user/bulgarian-user.types';

// Account Type
export type AccountType = 'individual' | 'business';

// Business Type
export type BusinessType = 'dealership' | 'trader' | 'company';

// Profile Form Data Interface
export interface ProfileFormData {
  // Account Type
  accountType: AccountType;
  
  // Required fields (from ID card) - For Individual
  firstName: string;
  lastName: string;
  
  // Optional personal info (from ID card) - For Individual
  middleName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  
  // Business Information - For Business
  businessName?: string;
  bulstat?: string;
  vatNumber?: string;
  businessType?: BusinessType;
  registrationNumber?: string;
  businessAddress?: string;
  businessCity?: string;
  businessPostalCode?: string;
  website?: string;
  businessPhone?: string;
  businessEmail?: string;
  workingHours?: string;
  businessDescription?: string;
  
  // Optional contact & location (from ID card back)
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  
  // Optional other
  bio?: string;
  preferredLanguage: string;
  
  // Legacy (for backwards compatibility)
  displayName?: string;
  region?: string;
}

// Profile Statistics Interface
export interface ProfileStats {
  cars: number;
  favorites: number;
}

// Car Information Interface (simplified for profile display)
export interface ProfileCar {
  id: string;
  title?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrl: string;
  mainImage?: string;
  mileage?: number;
  fuelType?: string;
  status?: 'active' | 'sold' | 'pending' | 'draft';
  viewCount?: number;
  views?: number;
  inquiries?: number;
}

// Profile State Interface
export interface ProfileState {
  /**
   * Target profile currently being viewed.
   * For backwards compatibility, this is also exposed as `user`.
   */
  user: BulgarianUser | null;
  /**
   * Authenticated viewer profile (may be null when not signed in).
   */
  viewer: BulgarianUser | null;
  userCars: ProfileCar[];
  loading: boolean;
  editing: boolean;
  formData: ProfileFormData;
  isOwnProfile: boolean;
  error?: string | null;
}

// Profile Actions Interface
export interface ProfileActions {
  loadUserData: () => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveProfile: () => Promise<void>;
  handleCancelEdit: () => void;
  handleLogout: () => Promise<void>;
  setEditing: (editing: boolean) => void;
  setUser: React.Dispatch<React.SetStateAction<BulgarianUser | null>>;
}

// Combined Profile Hook Return Type
export interface UseProfileReturn extends ProfileState, ProfileActions {
  loadUserCars?: () => void;
  /**
   * Alias for the target profile to make the API explicit during the migration.
   */
  target: BulgarianUser | null;
  /**
   * Force data reload (viewer + target).
   */
  refresh: () => Promise<void>;
  
  // NEW: Profile Type System
  profileType?: 'private' | 'dealer' | 'company';
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  permissions?: {
    canAddListings: boolean;
    maxListings: number;
    hasAnalytics: boolean;
    hasAdvancedAnalytics: boolean;
    hasTeam: boolean;
    canExportData: boolean;
    hasPrioritySupport: boolean;
    canUseQuickReplies: boolean;
    canBulkEdit: boolean;
    canImportCSV: boolean;
    canUseAPI: boolean;
  };
  planTier?: 'free' | 'premium' | 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise' | 
             'company_starter' | 'company_pro' | 'company_enterprise' | 'custom';
}
