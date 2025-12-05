/**
 * Dealership Types - Canonical source for dealership data
 * Phase 1: Core Interfaces & Types
 * 
 * This is the CANONICAL definition for dealership data.
 * All dealership data is stored in dealerships/{uid} collection.
 * 
 * File: src/types/dealership/dealership.types.ts
 */

import { Timestamp } from 'firebase/firestore';

// ==================== DEALERSHIP INFO (CANONICAL) ====================

export interface DealershipInfo {
  // Identity
  uid: string;
  
  // Legal Information
  dealershipNameBG: string;
  dealershipNameEN?: string;
  eik: string; // EIK/BULSTAT number (required in Bulgaria)
  vatNumber?: string; // VAT number (optional)
  licenseNumber?: string; // Dealer license number
  
  // Address
  address: DealershipAddress;
  
  // Contact Information
  contact: DealershipContact;
  
  // Working Hours
  workingHours: WorkingHours;
  
  // Services & Specializations
  services: DealershipServices;
  
  // Certifications & Documents
  certifications: DealershipCertifications;
  
  // Media & Branding
  media: DealershipMedia;
  
  // Business Settings
  settings: DealershipSettings;
  
  // Verification Status
  verification: {
    status: 'pending' | 'in_review' | 'verified' | 'rejected';
    submittedAt?: Timestamp;
    reviewedAt?: Timestamp;
    reviewedBy?: string; // Admin UID
    notes?: string;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== ADDRESS ====================

export interface DealershipAddress {
  street: string;
  city: string;
  region: string; // Bulgarian region
  postalCode: string;
  country: 'Bulgaria';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  mapUrl?: string; // Google Maps URL
}

// ==================== CONTACT ====================

export interface DealershipContact {
  // Primary Contact
  phone: string;
  phoneCountryCode: '+359';
  email: string;
  
  // Alternative Contact
  alternativePhone?: string;
  fax?: string;
  
  // Online Presence
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  
  // Messaging Apps
  whatsapp?: string;
  viber?: string;
  telegram?: string;
}

// ==================== WORKING HOURS ====================

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  
  // Special hours
  holidays?: string; // e.g., "Closed on public holidays"
  notes?: string;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // HH:mm format (e.g., "09:00")
  closeTime?: string; // HH:mm format (e.g., "18:00")
  breakStart?: string; // Lunch break start
  breakEnd?: string; // Lunch break end
}

// ==================== SERVICES ====================

export interface DealershipServices {
  // Car Services
  newCarSales: boolean;
  usedCarSales: boolean;
  carImport: boolean;
  tradeIn: boolean;
  
  // Financial Services
  financing: boolean;
  leasing: boolean;
  insurance: boolean;
  
  // After-Sales Services
  maintenance: boolean;
  repairs: boolean;
  warranty: boolean;
  carWash: boolean;
  detailing: boolean;
  
  // Additional Services
  homeDelivery: boolean;
  testDrive: boolean;
  onlineReservation: boolean;
  
  // Specializations
  specializations: string[]; // e.g., ['BMW', 'Mercedes', 'Luxury Cars']
  brands: string[]; // Brands they specialize in
}

// ==================== CERTIFICATIONS ====================

export interface DealershipCertifications {
  // Government Certifications
  dealerLicense?: {
    number: string;
    issueDate: Timestamp;
    expiryDate: Timestamp;
    issuingAuthority: string;
  };
  
  // Manufacturer Certifications
  brandCertifications?: BrandCertification[];
  
  // Quality Certifications
  qualityCertifications?: string[]; // e.g., ['ISO 9001', 'TÜV']
  
  // Awards & Recognition
  awards?: Award[];
}

export interface BrandCertification {
  brand: string; // e.g., 'BMW', 'Mercedes'
  certificateNumber: string;
  level?: string; // e.g., 'Gold Partner', 'Authorized Dealer'
  issueDate: Timestamp;
  expiryDate?: Timestamp;
  documentUrl?: string;
}

export interface Award {
  title: string;
  issuedBy: string;
  year: number;
  description?: string;
  imageUrl?: string;
}

// ==================== MEDIA ====================

export interface DealershipMedia {
  // Logo & Branding
  logo?: string; // URL
  coverImage?: string; // URL
  
  // Gallery
  galleryImages?: GalleryImage[];
  
  // Showroom Images
  showroomImages?: string[];
  
  // Video
  videoUrl?: string; // YouTube/Vimeo URL
  virtualTourUrl?: string; // 360° tour URL
}

export interface GalleryImage {
  url: string;
  caption?: string;
  category?: 'exterior' | 'interior' | 'team' | 'cars' | 'other';
  uploadedAt: Timestamp;
  order?: number; // For sorting
}

// ==================== SETTINGS ====================

export interface DealershipSettings {
  // Display Settings
  displayLanguages: ('bg' | 'en')[]; // Languages supported
  currency: 'EUR';
  
  // Privacy Settings
  privacySettings: PrivacySettings;
  
  // Notification Preferences
  notifications: {
    newInquiries: boolean;
    newReviews: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  
  // Business Rules
  businessRules: {
    minOrderValue?: number; // Minimum order value
    maxListings?: number; // Max active listings
    autoReplyEnabled: boolean;
    autoReplyMessage?: string;
  };
}

export interface PrivacySettings {
  showPhoneNumber: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showWorkingHours: boolean;
  allowDirectMessages: boolean;
  allowCalls: boolean;
}

// ==================== UPDATE TYPES ====================

/**
 * Partial update type for dealership info
 */
export type DealershipInfoUpdate = Partial<Omit<DealershipInfo, 'uid' | 'createdAt'>>;

/**
 * Creation data for new dealerships (without generated fields)
 */
export type DealershipInfoCreate = Omit<
  DealershipInfo,
  'uid' | 'createdAt' | 'updatedAt' | 'verification'
> & {
  verification?: Partial<DealershipInfo['verification']>;
};

// ==================== VALIDATION HELPERS ====================

/**
 * Validates Bulgarian EIK/BULSTAT number
 * Must be 9 or 13 digits
 */
export function isValidEIK(eik: string): boolean {
  return /^\d{9}(\d{4})?$/.test(eik);
}

/**
 * Validates Bulgarian phone number
 * Format: +359 XXX XXX XXX
 */
export function isValidBulgarianPhone(phone: string): boolean {
  return /^\+359\d{9}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Validates working hours consistency
 */
export function validateWorkingHours(hours: WorkingHours): boolean {
  const days: (keyof WorkingHours)[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  
  for (const day of days) {
    const schedule = hours[day];
    if (typeof schedule === 'object' && schedule.isOpen) {
      if (!schedule.openTime || !schedule.closeTime) {
        return false; // Must have both times if open
      }
    }
  }
  
  return true;
}

/**
 * Checks if dealership info is complete
 */
export function isDealershipInfoComplete(info: DealershipInfo): boolean {
  return !!(
    info.dealershipNameBG &&
    info.eik &&
    isValidEIK(info.eik) &&
    info.address.street &&
    info.address.city &&
    info.contact.phone &&
    info.contact.email &&
    validateWorkingHours(info.workingHours)
  );
}

/**
 * Calculate dealership completeness percentage
 */
export function calculateDealershipCompleteness(info: DealershipInfo): number {
  let score = 0;
  const maxScore = 15;
  
  // Required fields (5 points)
  if (info.dealershipNameBG) score += 1;
  if (info.eik && isValidEIK(info.eik)) score += 1;
  if (info.address.street && info.address.city) score += 1;
  if (info.contact.phone && info.contact.email) score += 1;
  if (validateWorkingHours(info.workingHours)) score += 1;
  
  // Optional but important (5 points)
  if (info.media.logo) score += 1;
  if (info.media.galleryImages && info.media.galleryImages.length > 0) score += 1;
  if (info.contact.website) score += 1;
  if (info.dealershipNameEN) score += 1;
  if (info.vatNumber) score += 1;
  
  // Services & Certifications (5 points)
  if (info.services.specializations.length > 0) score += 1;
  if (info.services.brands.length > 0) score += 1;
  if (info.certifications.dealerLicense) score += 1;
  if (info.certifications.brandCertifications && info.certifications.brandCertifications.length > 0) score += 1;
  if (info.verification.status === 'verified') score += 1;
  
  return Math.round((score / maxScore) * 100);
}

