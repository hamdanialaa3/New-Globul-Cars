/**
 * Super Admin Types
 * أنواع خدمة الإدارة الفائقة
 */

export interface SuperAdminUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  photoURL: string;
  role: 'super_admin';
  permissions: string[];
  lastLogin: Date;
  isActive: boolean;
  location: {
    city: string;
    region: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface RealTimeAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalCars: number;
  activeCars: number;
  totalMessages: number;
  totalViews: number;
  revenue: number;
  topCountries: Array<{country: string; count: number}>;
  topCities: Array<{city: string; count: number}>;
  userGrowth: Array<{date: string; count: number}>;
  carListings: Array<{date: string; count: number}>;
  lastUpdated: Date;
}

export interface UserActivity {
  uid: string;
  email: string;
  displayName: string;
  lastLogin: Date;
  loginCount: number;
  location: string;
  device: string;
  browser: string;
  isOnline: boolean;
  lastActivity: Date;
}

export interface ContentModeration {
  reportedCars: number;
  pendingReviews: number;
  bannedUsers: number;
  deletedContent: number;
  flaggedMessages: number;
}

export interface AdminActionLog {
  action: string;
  details: any;
  adminEmail: string;
  timestamp: Date;
}

export interface UserGrowthData {
  date: string;
  count: number;
}

export interface CarListingsData {
  date: string;
  count: number;
}

export interface FlaggedContent {
  contentId: string;
  type: string;
  reason: string;
  flaggedBy: string;
  flaggedAt: Date;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface BannedUser {
  uid: string;
  email: string;
  displayName: string;
  banReason: string;
  bannedAt: Date;
  bannedBy: string;
  isBanned: boolean;
}

export interface DeletedContent {
  id: string;
  type: 'car' | 'message' | 'review';
  reason: string;
  deletedAt: Date;
  deletedBy: string;
  originalData?: any;
}

export interface SuperAdminCache {
  analytics: RealTimeAnalytics | null;
  expiry: number;
}

export interface SuperAdminSubscription {
  id: string;
  callback: (data: RealTimeAnalytics) => void;
  unsubscribe: () => void;
}