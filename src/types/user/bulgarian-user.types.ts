/**
 * CANONICAL Bulgarian User Types
 * المصدر القياسي الوحيد لتعريف المستخدم
 *
 * ⚠️ DO NOT create other BulgarianUser interfaces!
 * ⚠️ All imports MUST use this file only!
 *
 * File: src/types/user/bulgarian-user.types.ts
 * Created: November 2025
 * Phase: -1 (Code Audit - Type Unification)
 */

import { Timestamp } from 'firebase/firestore';

// ==================== BASE PROFILE ====================
export interface BaseProfile {
  // Identity
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  coverImage?: string;

  // ✅ NEW: Public Display Name - Shows as main name in profiles
  // For private: User's chosen public name
  // For dealer: Dealership name (e.g., "Auto Sofia")
  // For company: Company name (e.g., "Cars Bulgaria Ltd")
  publicDisplayName?: string;

  // ✅ NEW: Numeric ID for clean URLs (e.g. /profile/18)
  numericId?: number;

  // Contact
  phoneNumber?: string;
  phoneCountryCode: '+359';

  // ✅ NEW: Structured Location Data (Primary Source of Truth)
  locationData?: {
    cityName: string;
    regionName: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Location (Bulgarian cities only) - Legacy format
  location?: {
    city: string;
    region: string;
    country: 'Bulgaria';
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // ✅ Legacy compatibility fields (will be migrated to location)
  city?: string;
  region?: string;
  address?: string;

  // Preferences
  preferredLanguage: 'bg' | 'en';
  currency: 'EUR';

  // Profile Type & Plan
  profileType: 'private' | 'dealer' | 'company';
  planTier: PlanTier;

  // Permissions
  permissions: ProfilePermissions;

  // Verification
  verification: {
    email: boolean;
    phone: boolean;
    id: boolean;
    business: boolean;
  };

  // Stats
  stats: {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalMessages: number;
    trustScore: number;
    followersCount?: number;
    followingCount?: number;
  };

  // ✅ Quota Tracking (Digital Domination v3.0)
  // Essential for enforcing monthly limits and Flex-Edit quotas
  quotaStats?: {
    listingsCreatedThisMonth: number; // Resets monthly
    flexEditsUsedThisMonth: number; // Resets monthly
    lastMonthReset: string; // Format: "YYYY-MM"
  };

  // Social Links
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
  };

  // Bio & Description
  bio?: string;
  about?: string;

  // Gallery
  gallery?: string[];

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;

  // Flags
  isActive: boolean;
  isBanned: boolean;
  isVerified?: boolean;
}

// ==================== DEALER PROFILE ====================
export interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  planTier: 'dealer';

  // ✅ NEW: Canonical reference (Phase 1+)
  dealershipRef?: `dealerships/${string}`;

  // ✅ NEW: Snapshot for quick display (Phase 1+)
  dealerSnapshot?: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
    address?: string;
    phone?: string;
    website?: string;
  };

  // ❌ DEPRECATED (migration period only)
  /**
   * @deprecated Use dealershipRef instead
   * Will be removed after Phase 4 (Week 8)
   * Current usage: 6 files
   */
  dealerInfo?: any;

  /**
   * @deprecated Use profileType === 'dealer' instead
   * Will be removed after Phase 4 (Week 8)
   * Current usage: 25 occurrences in 10 files
   */
  isDealer?: boolean;
}

// ==================== PRIVATE PROFILE ====================
export interface PrivateProfile extends BaseProfile {
  profileType: 'private';
  planTier: 'free' | 'dealer' | 'company'; // Aligned with PlanTier type

  // Private-specific
  egn?: string; // Bulgarian personal ID (optional)
}

// ==================== COMPANY PROFILE ====================
export interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company';

  // ✅ NEW: Company reference (Phase 1+)
  companyRef?: `companies/${string}`;
  companySnapshot?: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
    address?: string;
    phone?: string;
    website?: string;
    vatNumber?: string;
  };

  // ✅ NEW: Team Management Structure (Phase 4)
  teamMembers?: {
    uid: string;
    role: 'admin' | 'agent' | 'viewer';
    addedAt: Timestamp;
    status: 'active' | 'invited' | 'disabled';
  }[];
}

// ==================== UNION TYPE ====================
/**
 * Main BulgarianUser type
 * Use this for all user-related operations
 */
export type BulgarianUser = PrivateProfile | DealerProfile | CompanyProfile;

// ==================== SUPPORTING TYPES ====================
/**
 * Unified Plan Tiers - matches BillingService.ts
 * Updated: December 2025
 */
export type PlanTier = 'free' | 'dealer' | 'company';

export type BillingInterval = 'monthly' | 'annual';

/**
 * Digital Domination v3.0 Permissions Schema
 * Defines the strict capabilities for each user class.
 */
export interface ProfilePermissions {
  // --- LIMITS (The Commercial Engine) ---
  canAddListings: boolean;
  maxListings: number; // -1 for unlimited

  /**
   * Maximum new listings allowed per calendar month.
   * Private: 3, Dealer: 30, Company: 200
   */
  maxMonthlyListings: number;

  // --- ANTI-FRAUD & INTEGRITY ---
  /**
   * If true, user can edit Make/Model/Year AFTER publishing.
   * Private: FALSE (Anti-Fraud Lock to prevent bait-and-switch)
   * Dealer: Quota-based (Flex-Edit)
   * Company: TRUE (Unrestricted)
   */
  canEditLockedFields: boolean;

  /**
   * Number of "Flex-Edits" allowed per month for Dealers.
   * Allows correcting honest mistakes without unbridled editing.
   */
  maxFlexEditsPerMonth: number;

  // --- POWER TOOLS (Productivity) ---
  /**
   * Access to "Matrix Grid" uploader for multiple cars.
   * Private: false, Dealer: true (5 rows), Company: true (20 rows)
   */
  canBulkUpload: boolean;
  bulkUploadLimit: number;

  /**
   * Clone specs from one listing to new one.
   * High-value time saver for dealers selling similar fleets.
   */
  canCloneListing: boolean;

  // --- ANALYTICS & TEAMS ---
  hasAnalytics: boolean;
  hasAdvancedAnalytics: boolean; // Market price intelligence
  hasTeam: boolean;
  canExportData: boolean;

  // --- SUPPORT ---
  hasPrioritySupport: boolean;

  // --- FEATURES ---
  canUseQuickReplies: boolean;
  canBulkEdit: boolean;
  canImportCSV: boolean;
  canUseAPI: boolean; // For Companies (ERP integration)

  // --- AI & INTELLIGENCE ---
  canUseAI: boolean;
  canUseChatbot: boolean;
  canEditMakeModel: boolean;

  // --- VISUAL IDENTITY ---
  themeMode: 'standard' | 'dealer-led' | 'company-led';
}

// ==================== TYPE GUARDS ====================
/**
 * Type guard to check if a user is a dealer
 * Use this instead of checking isDealer (deprecated)
 */
export function isDealerProfile(user: BulgarianUser): user is DealerProfile {
  return user.profileType === 'dealer';
}

/**
 * Type guard to check if a user is a company
 */
export function isCompanyProfile(user: BulgarianUser): user is CompanyProfile {
  return user.profileType === 'company';
}

/**
 * Type guard to check if a user is a private user
 */
export function isPrivateProfile(user: BulgarianUser): user is PrivateProfile {
  return user.profileType === 'private';
}

/**
 * Type guard to check if a user is a business (dealer or company)
 */
export function isBusinessProfile(
  user: BulgarianUser
): user is DealerProfile | CompanyProfile {
  return user.profileType === 'dealer' || user.profileType === 'company';
}

// ==================== HELPER TYPES ====================
export type ProfileType = BulgarianUser['profileType'];
export type ProfileStatus = 'pending' | 'verified' | 'rejected';

/**
 * Partial update type for user profiles
 */
export type BulgarianUserUpdate = Partial<
  Omit<BulgarianUser, 'uid' | 'createdAt'>
>;

/**
 * Creation data for new users (without generated fields)
 */
export type BulgarianUserCreateData = Omit<
  BulgarianUser,
  'uid' | 'createdAt' | 'updatedAt' | 'stats' | 'verification'
> & {
  stats?: Partial<BaseProfile['stats']>;
  verification?: Partial<BaseProfile['verification']>;
};
