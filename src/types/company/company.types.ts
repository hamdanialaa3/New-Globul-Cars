/**
 * Company Types - Canonical source for company data
 * Phase 1: Core Interfaces & Types
 * 
 * This is the CANONICAL definition for company/corporate data.
 * All company data is stored in companies/{uid} collection.
 * 
 * File: src/types/company/company.types.ts
 */

import { Timestamp } from 'firebase/firestore';

// ==================== COMPANY INFO (CANONICAL) ====================

export interface CompanyInfo {
  // Identity
  uid: string;
  
  // Legal Information
  companyNameBG: string;
  companyNameEN?: string;
  bulstat: string; // BULSTAT/EIK number (required in Bulgaria)
  vatNumber?: string; // VAT number
  registrationNumber?: string; // Trade registry number
  legalForm: CompanyLegalForm; // ООД, ЕООД, АД, etc.
  
  // Address
  headquarters: CompanyAddress;
  branches?: CompanyAddress[]; // Multiple locations
  
  // Contact Information
  contact: CompanyContact;
  
  // Corporate Structure
  structure: CorporateStructure;
  
  // Fleet & Operations
  fleet: FleetInfo;
  
  // Certifications & Documents
  certifications: CompanyCertifications;
  
  // Media & Branding
  media: CompanyMedia;
  
  // Business Settings
  settings: CompanySettings;
  
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

// ==================== LEGAL FORMS ====================

export type CompanyLegalForm =
  | 'ООД' // Limited Liability Company (LLC)
  | 'ЕООД' // Single-member LLC
  | 'АД' // Joint-stock company
  | 'ЕАД' // Single-member joint-stock company
  | 'КДА' // Limited partnership
  | 'СД' // General partnership
  | 'КД' // Limited partnership
  | 'ЕТ' // Sole proprietorship
  | 'other';

// ==================== ADDRESS ====================

export interface CompanyAddress {
  type: 'headquarters' | 'branch' | 'warehouse' | 'office';
  name?: string; // Branch name
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: 'Bulgaria';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isPrimary?: boolean;
}

// ==================== CONTACT ====================

export interface CompanyContact {
  // Primary Contact
  phone: string;
  phoneCountryCode: '+359';
  email: string;
  
  // Alternative Contact
  alternativePhone?: string;
  fax?: string;
  
  // Online Presence
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  
  // Support Channels
  supportEmail?: string;
  supportPhone?: string;
  supportHours?: string;
}

// ==================== CORPORATE STRUCTURE ====================

export interface CorporateStructure {
  // Ownership
  owners?: CompanyOwner[];
  
  // Management
  ceo?: string; // Name
  managingDirector?: string;
  boardMembers?: BoardMember[];
  
  // Departments
  departments?: Department[];
  
  // Employees
  employeeCount?: number;
  employeeRange?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
}

export interface CompanyOwner {
  name: string;
  share: number; // Percentage (0-100)
  type: 'individual' | 'corporate';
  since?: Timestamp;
}

export interface BoardMember {
  name: string;
  position: string; // e.g., 'Chairman', 'Member'
  since?: Timestamp;
}

export interface Department {
  name: string;
  head?: string; // Department head name
  employeeCount?: number;
  description?: string;
}

// ==================== FLEET INFO ====================

export interface FleetInfo {
  // Fleet Size
  totalVehicles: number;
  
  // Fleet Composition
  composition?: FleetComposition;
  
  // Fleet Management
  fleetManagementSystem?: boolean;
  gpsTracking?: boolean;
  maintenanceSchedule?: boolean;
  
  // Purchasing
  annualPurchaseVolume?: number; // Number of cars per year
  preferredBrands?: string[];
  
  // Fleet Services
  services?: {
    leasing: boolean;
    rental: boolean;
    carSharing: boolean;
    chauffeurService: boolean;
  };
}

export interface FleetComposition {
  sedans?: number;
  suvs?: number;
  trucks?: number;
  vans?: number;
  luxury?: number;
  electric?: number;
  hybrid?: number;
}

// ==================== CERTIFICATIONS ====================

export interface CompanyCertifications {
  // Business Registration
  tradeRegistryExtract?: {
    number: string;
    issueDate: Timestamp;
    documentUrl?: string;
  };
  
  // Quality Certifications
  iso9001?: boolean; // Quality Management
  iso14001?: boolean; // Environmental Management
  iso45001?: boolean; // Occupational Health & Safety
  
  // Industry Certifications
  industryCertifications?: IndustryCertification[];
  
  // Awards & Recognition
  awards?: CompanyAward[];
  
  // Partnerships
  partnerships?: Partnership[];
}

export interface IndustryCertification {
  name: string;
  issuedBy: string;
  certificateNumber: string;
  issueDate: Timestamp;
  expiryDate?: Timestamp;
  documentUrl?: string;
}

export interface CompanyAward {
  title: string;
  issuedBy: string;
  year: number;
  category?: string;
  description?: string;
  imageUrl?: string;
}

export interface Partnership {
  partnerName: string;
  partnerType: 'supplier' | 'manufacturer' | 'service_provider' | 'technology' | 'other';
  since: Timestamp;
  description?: string;
  logoUrl?: string;
}

// ==================== MEDIA ====================

export interface CompanyMedia {
  // Logo & Branding
  logo?: string;
  logoLight?: string; // For dark backgrounds
  logoDark?: string; // For light backgrounds
  coverImage?: string;
  
  // Corporate Identity
  brandColors?: {
    primary: string; // Hex code
    secondary?: string;
    accent?: string;
  };
  
  // Gallery
  galleryImages?: CompanyGalleryImage[];
  
  // Office/Facility Images
  facilityImages?: string[];
  
  // Team Photos
  teamPhotos?: TeamPhoto[];
  
  // Video & Virtual Tours
  videoUrl?: string;
  virtualTourUrl?: string;
  
  // Presentations & Documents
  companyBrochure?: string; // PDF URL
  presentationDeck?: string; // PDF URL
}

export interface CompanyGalleryImage {
  url: string;
  caption?: string;
  category?: 'office' | 'team' | 'fleet' | 'events' | 'other';
  uploadedAt: Timestamp;
  order?: number;
}

export interface TeamPhoto {
  url: string;
  name?: string;
  position?: string;
  department?: string;
}

// ==================== SETTINGS ====================

export interface CompanySettings {
  // Display Settings
  displayLanguages: ('bg' | 'en')[];
  currency: 'EUR';
  
  // Privacy Settings
  privacySettings: CompanyPrivacySettings;
  
  // Notification Preferences
  notifications: {
    newInquiries: boolean;
    newOrders: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
    quarterlyReport: boolean;
  };
  
  // Business Rules
  businessRules: {
    minOrderValue?: number;
    maxConcurrentOrders?: number;
    autoApprovalEnabled: boolean;
    requiresQuote: boolean;
    bulkDiscountEnabled: boolean;
  };
  
  // API Access
  apiAccess?: {
    enabled: boolean;
    apiKey?: string;
    webhookUrl?: string;
    rateLimitPerHour?: number;
  };
}

export interface CompanyPrivacySettings {
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showEmployeeCount: boolean;
  showFleetSize: boolean;
  allowDirectContact: boolean;
  requireNDA: boolean; // For sensitive inquiries
}

// ==================== UPDATE TYPES ====================

/**
 * Partial update type for company info
 */
export type CompanyInfoUpdate = Partial<Omit<CompanyInfo, 'uid' | 'createdAt'>>;

/**
 * Creation data for new companies (without generated fields)
 */
export type CompanyInfoCreate = Omit<
  CompanyInfo,
  'uid' | 'createdAt' | 'updatedAt' | 'verification'
> & {
  verification?: Partial<CompanyInfo['verification']>;
};

// ==================== VALIDATION HELPERS ====================

/**
 * Validates Bulgarian BULSTAT number
 * Must be 9 or 13 digits
 */
export function isValidBULSTAT(bulstat: string): boolean {
  return /^\d{9}(\d{4})?$/.test(bulstat);
}

/**
 * Validates Bulgarian VAT number
 * Format: BG + 9-10 digits
 */
export function isValidBulgarianVAT(vat: string): boolean {
  return /^BG\d{9,10}$/.test(vat);
}

/**
 * Validates company info completeness
 */
export function isCompanyInfoComplete(info: CompanyInfo): boolean {
  return !!(
    info.companyNameBG &&
    info.bulstat &&
    isValidBULSTAT(info.bulstat) &&
    info.legalForm &&
    info.headquarters.street &&
    info.headquarters.locationData?.cityName &&
    info.contact.phone &&
    info.contact.email
  );
}

/**
 * Calculate company completeness percentage
 */
export function calculateCompanyCompleteness(info: CompanyInfo): number {
  let score = 0;
  const maxScore = 20;
  
  // Required fields (5 points)
  if (info.companyNameBG) score += 1;
  if (info.bulstat && isValidBULSTAT(info.bulstat)) score += 1;
  if (info.legalForm) score += 1;
  if (info.headquarters.street && info.headquarters.locationData?.cityName) score += 1;
  if (info.contact.phone && info.contact.email) score += 1;
  
  // Optional but important (5 points)
  if (info.media.logo) score += 1;
  if (info.companyNameEN) score += 1;
  if (info.vatNumber) score += 1;
  if (info.contact.website) score += 1;
  if (info.registrationNumber) score += 1;
  
  // Corporate Structure (5 points)
  if (info.structure.ceo || info.structure.managingDirector) score += 1;
  if (info.structure.employeeCount && info.structure.employeeCount > 0) score += 1;
  if (info.structure.departments && info.structure.departments.length > 0) score += 1;
  if (info.structure.owners && info.structure.owners.length > 0) score += 1;
  if (info.structure.boardMembers && info.structure.boardMembers.length > 0) score += 1;
  
  // Fleet & Certifications (5 points)
  if (info.fleet.totalVehicles > 0) score += 1;
  if (info.fleet.composition) score += 1;
  if (info.certifications.tradeRegistryExtract) score += 1;
  if (info.certifications.iso9001 || info.certifications.iso14001) score += 1;
  if (info.verification.status === 'verified') score += 1;
  
  return Math.round((score / maxScore) * 100);
}

/**
 * Get company size category based on employee count
 */
export function getCompanySizeCategory(employeeCount: number): string {
  if (employeeCount === 0) return 'Startup';
  if (employeeCount <= 10) return 'Small';
  if (employeeCount <= 50) return 'Medium';
  if (employeeCount <= 200) return 'Large';
  return 'Enterprise';
}

/**
 * Calculate total ownership percentage
 */
export function calculateTotalOwnership(owners: CompanyOwner[]): number {
  return owners.reduce((total, owner) => total + owner.share, 0);
}

/**
 * Validate ownership percentages
 */
export function validateOwnership(owners: CompanyOwner[]): boolean {
  const total = calculateTotalOwnership(owners);
  return total >= 99 && total <= 101; // Allow for rounding errors
}

