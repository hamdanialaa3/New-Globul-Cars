// src/types/firestore-models.ts
// Firestore data models for Bulgarian Car Marketplace

import { Timestamp } from 'firebase/firestore';

// Base interfaces
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User interfaces (extending existing BulgarianUser)
export interface BulgarianUser extends BaseDocument {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  location: string; // Bulgarian cities
  preferredLanguage: 'bg' | 'en';
  currency: 'EUR';
  isDealer?: boolean;
  dealerInfo?: DealerInfo;
  profileComplete: boolean;
  lastLogin: Timestamp;
  accountStatus: 'active' | 'suspended' | 'banned';
}

// Dealer specific information
export interface DealerInfo {
  companyName: string;
  licenseNumber: string;
  taxNumber: string;
  address: BulgarianAddress;
  verified: boolean;
  verificationDate?: Timestamp;
  specializations: string[]; // e.g., ['BMW', 'Mercedes', 'SUV']
  serviceArea: string[]; // Bulgarian cities/regions
  rating: number;
  totalReviews: number;
}

// Bulgarian address structure
export interface BulgarianAddress {
  street: string;
  city: string;
  postalCode: string;
  region: string; // Bulgarian regions
}

// Car interfaces
export interface Car extends BaseDocument {
  make: string;
  model: string;
  year: number;
  price: number; // Always in EUR
  currency: 'EUR';
  mileage: number;
  fuelType: 'Бензин' | 'Дизел' | 'Хибрид' | 'Електрически' | 'Газ';
  transmission: 'Ръчна' | 'Автоматична';
  power: number; // HP
  engineSize: number; // Liters
  location: string; // Bulgarian city
  images: string[];
  description?: string;
  features: string[];
  sellerId: string;
  sellerType: 'private' | 'dealer';
  status: 'active' | 'sold' | 'inactive';
  registeredInBulgaria: boolean;
  environmentalTaxPaid: boolean;
  technicalInspectionValid: boolean;
  technicalInspectionExpiry?: Timestamp;
  views: number;
  favorites: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

// Service Leads for Financial Services
export interface ServiceLead extends BaseDocument {
  userId: string;
  carId: string;
  type: 'finance' | 'insurance';
  partnerId?: string; // e.g., 'dsk_bank', 'unicredit', 'allianz_bg'
  status: 'sent' | 'pending' | 'approved' | 'rejected' | 'expired';
  submittedData: FinanceLeadData | InsuranceQuoteData;
  responseData?: any; // Partner response
  commission?: number; // For tracking earnings
  notes?: string;
}

// Finance lead data
export interface FinanceLeadData {
  // Personal info
  fullName: string;
  email: string;
  phone: string;
  personalId: string; // Bulgarian personal ID

  // Car info (auto-filled)
  carMake: string;
  carModel: string;
  carYear: number;
  carPrice: number;

  // Finance details
  downPayment: number;
  loanTerm: number; // months
  monthlyIncome: number;
  employmentStatus: 'employed' | 'self_employed' | 'retired' | 'student';
  employerName?: string;

  // Additional
  additionalInfo?: string;
}

// Insurance quote data
export interface InsuranceQuoteData {
  // Personal info
  fullName: string;
  email: string;
  phone: string;
  personalId: string;

  // Car info (auto-filled)
  carMake: string;
  carModel: string;
  carYear: number;
  carPrice: number;
  carMileage: number;

  // Insurance details
  insuranceType: 'comprehensive' | 'third_party' | 'accident_only';
  coverageAmount: number;
  deductible: number;
  preferredInsurer?: string;

  // Driver info
  driverAge: number;
  drivingExperience: number; // years
  accidentHistory: boolean;
  licenseIssueDate: string;

  // Additional
  additionalDrivers?: AdditionalDriver[];
  parkingLocation: string; // Bulgarian city
}

export interface AdditionalDriver {
  name: string;
  age: number;
  relation: string;
}

// Direct Sale Request (C2B - Consumer to Business)
export interface DirectSaleRequest extends BaseDocument {
  userId: string;
  carDetails: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>;
  status: 'active' | 'pending_review' | 'sold' | 'expired' | 'cancelled';
  bestOfferId?: string;
  bestOfferAmount?: number;
  minPrice?: number; // Minimum acceptable price
  maxPrice?: number; // Maximum expected price
  expiresAt: Timestamp;
  views: number; // How many dealers viewed it
  totalOffers: number;
  preferredDealers?: string[]; // Specific dealers to notify
  location: string; // Bulgarian city
  urgent: boolean; // Priority listing
}

// Offer on Direct Sale Request
export interface DirectSaleOffer extends BaseDocument {
  requestId: string;
  dealerId: string;
  dealerName: string;
  dealerRating: number;
  price: number;
  currency: 'EUR';
  conditions: string; // Special conditions or notes
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offer' | 'expired';
  counterOfferPrice?: number;
  validUntil: Timestamp;
  dealerContact: {
    phone: string;
    email: string;
  };
  inspectionRequired: boolean;
  pickupLocation?: string;
}

// Bulgarian Financial Partners
export interface FinancialPartner {
  id: string;
  name: string;
  type: 'bank' | 'insurance';
  country: 'BG'; // Bulgaria only
  apiEndpoint?: string;
  active: boolean;
  commission: number; // Percentage
  supportedProducts: string[];
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
}

// Message interfaces (extending existing)
export interface CarMessage extends BaseDocument {
  carId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  language: 'bg' | 'en';
  type: 'comment' | 'question' | 'offer' | 'review' | 'complaint';
  rating?: number;
  price?: number;
  isSeller: boolean;
  isModerated: boolean;
  replies?: CarMessage[];
  parentId?: string;
  likes: number;
  likedBy: string[];
  isEdited: boolean;
  editedAt?: Timestamp;
  attachments?: MessageAttachment[];
  metadata: {
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface MessageAttachment {
  type: 'image' | 'document' | 'link';
  url: string;
  filename?: string;
  size?: number;
}

// Analytics and tracking
export interface UserAnalytics extends BaseDocument {
  userId: string;
  searches: SearchAnalytics[];
  views: CarView[];
  favorites: string[]; // Car IDs
  messages: MessageAnalytics;
  lastActivity: Timestamp;
}

export interface SearchAnalytics {
  query: string;
  filters: any;
  results: number;
  timestamp: Timestamp;
}

export interface CarView {
  carId: string;
  timestamp: Timestamp;
  source: 'search' | 'direct' | 'favorites';
}

export interface MessageAnalytics {
  sent: number;
  received: number;
  responseRate: number;
  averageResponseTime: number;
}

// Bulgarian-specific constants
export const BULGARIAN_CITIES = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора',
  'Плевен', 'Сливен', 'Добрич', 'Шумен', 'Перник', 'Хасково',
  'Ямбол', 'Пазарджик', 'Благоевград', 'Велико Търново', 'Враца',
  'Габрово', 'Асеновград', 'Видин', 'Кърджали', 'Кюстендил', 'Монтана',
  'Търговище', 'Силистра', 'Ловеч', 'Разград', 'Смолян', 'Дупница'
];

export const BULGARIAN_REGIONS = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Благоевград', 'Велико Търново',
  'Видин', 'Враца', 'Габрово', 'Добрич', 'Кърджали', 'Кюстендил',
  'Ловеч', 'Монтана', 'Пазарджик', 'Перник', 'Плевен', 'Разград',
  'Русе', 'Силистра', 'Сливен', 'Смолян', 'Стара Загора', 'Търговище',
  'Хасково', 'Шуمن', 'Ямбол'
];

export const FINANCIAL_PARTNERS: FinancialPartner[] = [
  {
    id: 'dsk_bank',
    name: 'ДСК Банк',
    type: 'bank',
    country: 'BG',
    active: true,
    commission: 0.5,
    supportedProducts: ['car_loan', 'leasing'],
    contactInfo: {
      email: 'business@dskbank.bg',
      phone: '+359 2 9266 000',
      website: 'https://www.dskbank.bg'
    }
  },
  {
    id: 'unicredit_bulbank',
    name: 'УниКредит Булбанк',
    type: 'bank',
    country: 'BG',
    active: true,
    commission: 0.6,
    supportedProducts: ['car_loan', 'refinancing'],
    contactInfo: {
      email: 'info@unicreditbulbank.bg',
      phone: '+359 2 9266 000',
      website: 'https://www.unicreditbulbank.bg'
    }
  },
  {
    id: 'allianz_bulgaria',
    name: 'Алианц България',
    type: 'insurance',
    country: 'BG',
    active: true,
    commission: 0.8,
    supportedProducts: ['comprehensive', 'third_party', 'accident'],
    contactInfo: {
      email: 'info@allianz.bg',
      phone: '+359 2 811 11 11',
      website: 'https://www.allianz.bg'
    }
  },
  {
    id: 'bulstrad',
    name: 'Булстрад',
    type: 'insurance',
    country: 'BG',
    active: true,
    commission: 0.7,
    supportedProducts: ['comprehensive', 'third_party'],
    contactInfo: {
      email: 'info@bulstrad.bg',
      phone: '+359 2 811 11 11',
      website: 'https://www.bulstrad.bg'
    }
  }
];