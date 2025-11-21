// src/types/AdvancedProfile.ts
// Advanced Profile Types - أنواع البروفايل المتقدم
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { Timestamp } from 'firebase/firestore';
import { 
  TrustLevel, 
  Badge, 
  VerificationStatus 
} from '@globul-cars/services/profile/trust-score-service';
import { ProfileImage } from '@globul-cars/services/profile/image-processing-service';
import { ProfileStats } from '@globul-cars/services/profile/profile-stats-service';

// ==================== MAIN PROFILE INTERFACE ====================

/**
 * Advanced Profile Interface
 * واجهة البروفايل المتقدم
 * 
 * يتضمن جميع حقول البروفايل الأساسية والمتقدمة
 * Includes all basic and advanced profile fields
 */
export interface AdvancedProfile {
  // Basic Info (موجود مسبقاً)
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  bio?: string;
  
  // Location - Bulgarian cities only
  location?: {
    city: string;              // من 28 مدينة بلغارية
    region: string;
    postalCode: string;        // 4 digits
  };
  
  // Images (جديد)
  profileImage?: ProfileImage;
  coverImage?: ProfileImage;
  gallery: ProfileImage[];
  
  // Verification (جديد)
  verification: VerificationStatus;
  
  // Statistics (محسّن)
  stats: ProfileStats;
  
  // Reviews (جديد)
  reviews: {
    average: number;           // 0-5
    total: number;
    breakdown: {
      communication: number;   // 0-5
      accuracy: number;        // 0-5
      professionalism: number; // 0-5
      valueForMoney: number;   // 0-5
    };
  };
  
  // Preferences
  preferredLanguage: 'bg' | 'en';
  currency: 'EUR';             // ثابت - لا يتغير
  timezone: 'Europe/Sofia';   // ثابت
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastLoginAt?: Date | Timestamp;
}

// ==================== SELLER PROFILE ====================

/**
 * Seller-specific profile extension
 * امتداد البروفايل الخاص بالبائعين
 */
export interface SellerProfile extends AdvancedProfile {
  // Business Information
  businessInfo?: {
    businessName: string;
    businessType: 'individual' | 'dealer' | 'company';
    taxId?: string;            // Bulgarian VAT number
    registrationNumber?: string;
    websiteUrl?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
    };
  };
  
  // Seller Details
  sellerDetails: {
    yearsOfExperience: number;
    specializations: string[]; // ['BMW', 'Mercedes', 'Luxury']
    servicesOffered: string[]; // ['Financing', 'Trade-in', 'Warranty']
    languages: ('bg' | 'en')[];
    operatingHours?: WeeklySchedule;
    acceptedPayments: string[]; // ['Cash', 'Bank Transfer' - EUR only]
  };
}

// ==================== HELPER TYPES ====================

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;  // HH:mm format (e.g., "09:00")
  close: string; // HH:mm format (e.g., "18:00")
  closed: boolean;
}

// ==================== PROFILE UPDATE TYPES ====================

/**
 * Type for profile updates
 * نوع لتحديثات البروفايل
 */
export type ProfileUpdate = Partial<Omit<AdvancedProfile, 'uid' | 'email' | 'createdAt'>>;

/**
 * Type for profile creation
 * نوع لإنشاء بروفايل جديد
 */
export type ProfileCreate = Omit<AdvancedProfile, 'uid' | 'verification' | 'stats' | 'reviews' | 'createdAt' | 'updatedAt'>;

// ==================== EXPORTS ====================

export type {
  TrustLevel,
  Badge,
  VerificationStatus,
  ProfileImage,
  ProfileStats
};
