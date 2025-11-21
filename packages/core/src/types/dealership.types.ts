/**
 * Dealership/Showroom Types for Bulgarian Car Marketplace
 * Support for professional car dealers and showrooms
 */

export type LegalForm = 
  | 'EOOD'           // Еднолично дружество с ограничена отговорност (Single-person LLC)
  | 'OOD'            // Дружество с ограничена отговорност (Limited Liability Company)
  | 'AD'             // Акционерно дружество (Joint-Stock Company)
  | 'SOLE_TRADER'    // Едноличен търговец (Sole Proprietorship)
  | 'ET';            // ЕТ (Individual Entrepreneur)

export type VehicleType = 
  | 'new'
  | 'used'
  | 'both';

export type CarCategory = 
  | 'passenger'      // Легкови автомобили
  | 'trucks'         // Камиони
  | 'vans'           // Ванове
  | 'luxury'         // Луксозни автомобили
  | 'commercial'     // Търговски превозни средства
  | 'motorcycles';   // Мотоциклети

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: boolean;
  openTime: string;  // "09:00"
  closeTime: string; // "18:00"
  breakStart?: string;
  breakEnd?: string;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
}

export interface DealershipServices {
  financing: boolean;           // Финансиране/Лизинг
  warranty: boolean;            // Гаранция след продажба
  maintenance: boolean;         // Поддръжка
  importOnDemand: boolean;      // Внос по заявка
  tradeIn: boolean;             // Изкупуване на стари коли
  insurance: boolean;           // Застраховка
  registration: boolean;        // Регистрация
  delivery: boolean;            // Доставка
}

export interface DealershipCertifications {
  chamberOfCommerce: boolean;   // Член на Търговска камара
  bankPartner?: string;         // Партньор на банка
  manufacturerAuthorized: boolean; // Оторизиран дилър
  isocertified: boolean;       // ISO сертификат
  other: string[];              // Други сертификати
}

export interface DealershipDocument {
  id: string;
  type: 'business_license' | 'tax_registration' | 'property_proof' | 'insurance' | 'other';
  name: string;
  url: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface DealershipMedia {
  id: string;
  type: 'facade' | 'showroom' | 'parking_lot' | 'office' | 'team' | 'other';
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export interface ManagerInfo {
  fullName: string;
  position: string;              // مدير، مالك، مسؤول مبيعات
  photo?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface DealershipInfo {
  // Basic Information
  dealershipNameBG: string;      // اسم المعرض بالبلغارية (مطلوب)
  dealershipNameEN?: string;     // اسم المعرض بالإنجليزية
  legalForm: LegalForm;
  vatNumber: string;             // ДДС номер
  companyRegNumber: string;      // ЕИК (Единен идентификационен код)
  
  // Address
  address: {
    city: string;
    street: string;
    number: string;
    postalCode?: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Working Hours
  workingHours: WorkingHours;
  
  // Contact
  primaryPhone: string;
  secondaryPhone?: string;
  officialEmail: string;
  website?: string;
  socialMedia: SocialMedia;
  
  // Manager Information
  manager: ManagerInfo;
  
  // Business Details
  vehicleTypes: VehicleType;
  carCategories: CarCategory[];
  services: DealershipServices;
  certifications: DealershipCertifications;
  
  // Statistics (auto-calculated)
  totalCarsAvailable: number;
  totalCarsSold?: number;
  yearsInBusiness?: number;
  
  // Trust & Reputation
  verified: boolean;
  featuredDealer: boolean;
  trustScore?: number;
  
  // Media
  logo?: string;
  coverImage?: string;
  galleryImages: DealershipMedia[];
  
  // Documents (admin only)
  documents: DealershipDocument[];
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrivacySettings {
  // Personal Information Privacy
  showFullName: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showDateOfBirth: boolean;
  showPlaceOfBirth: boolean;
  
  // Dealership Information Privacy
  showDealershipName: boolean;
  showLegalForm: boolean;
  showVATNumber: boolean;
  showCompanyRegNumber: boolean;
  showDealershipAddress: boolean;
  showWorkingHours: boolean;
  showWebsite: boolean;
  showSocialMedia: boolean;
  showManager: boolean;
  showServices: boolean;
  showCertifications: boolean;
  showGallery: boolean;
  
  // Statistics Privacy
  showTotalCars: boolean;
  showTrustScore: boolean;
  showReviews: boolean;
  
  // Default: true (public profile)
  profileVisibility: 'public' | 'registered_only' | 'private';
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  // Personal
  showFullName: true,
  showEmail: false,
  showPhone: true,
  showAddress: false,
  showDateOfBirth: false,
  showPlaceOfBirth: false,
  
  // Dealership
  showDealershipName: true,
  showLegalForm: true,
  showVATNumber: false,
  showCompanyRegNumber: false,
  showDealershipAddress: true,
  showWorkingHours: true,
  showWebsite: true,
  showSocialMedia: true,
  showManager: true,
  showServices: true,
  showCertifications: true,
  showGallery: true,
  
  // Statistics
  showTotalCars: true,
  showTrustScore: true,
  showReviews: true,
  
  profileVisibility: 'public'
};

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { open: true, openTime: '09:00', closeTime: '18:00' },
  tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
  wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
  thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
  friday: { open: true, openTime: '09:00', closeTime: '18:00' },
  saturday: { open: true, openTime: '10:00', closeTime: '14:00' },
  sunday: { open: false, openTime: '', closeTime: '' }
};

export const DEFAULT_SERVICES: DealershipServices = {
  financing: false,
  warranty: false,
  maintenance: false,
  importOnDemand: false,
  tradeIn: false,
  insurance: false,
  registration: false,
  delivery: false
};

export const DEFAULT_CERTIFICATIONS: DealershipCertifications = {
  chamberOfCommerce: false,
  manufacturerAuthorized: false,
  isocertified: false,
  other: []
};

