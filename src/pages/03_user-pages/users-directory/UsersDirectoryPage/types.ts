// src/pages/UsersDirectoryPage/types.ts
// Types for Users Directory Page
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  profileImage?: { url: string };
  profileType?: 'private' | 'dealer' | 'company';
  accountType?: 'individual' | 'business';
  location?: {
    city?: string;
    region?: string;
  };
  verification?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
    idVerified?: boolean;
    trustScore?: number;
  };
  stats?: {
    followers?: number;
    following?: number;
    listings?: number;
    reviews?: number;
  };
  businessInfo?: {
    companyName?: string;
    dealerType?: string;
  };
  isOnline?: boolean;
  lastSeen?: Date;
  createdAt?: any;
}

export type ViewMode = 'bubbles' | 'grid' | 'list';
export type DensityMode = 'comfortable' | 'compact' | 'cozy';
export type SortOption = 'name' | 'newest' | 'trust';
export type AccountTypeFilter = 'all' | 'individual' | 'business';

