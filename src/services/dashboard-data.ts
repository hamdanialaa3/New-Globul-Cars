// dashboard-data.ts
// Constants and data structures for dashboard service

import { DashboardStats } from './dashboard-types';

// Default dashboard stats
export const DEFAULT_DASHBOARD_STATS: DashboardStats = {
  totalListings: 0,
  activeListings: 0,
  soldListings: 0,
  pendingListings: 0,
  totalViews: 0,
  potentialSales: 0,
  weeklyViews: 0
};

// Dashboard polling intervals
export const DASHBOARD_POLLING_INTERVALS = {
  CARS: 10000, // 10 seconds
  STATS: 30000, // 30 seconds
  MESSAGES: 5000, // 5 seconds
  NOTIFICATIONS: 5000 // 5 seconds
} as const;

// Retry configuration for real-time listeners
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 10,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 5000,
  BACKOFF_MULTIPLIER: 1000
} as const;

// Firestore collection names
export const COLLECTIONS = {
  CARS: 'cars',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  USERS: 'users'
} as const;

// Query limits
export const QUERY_LIMITS = {
  RECENT_CARS: 5,
  RECENT_MESSAGES: 5,
  RECENT_NOTIFICATIONS: 5,
  DASHBOARD_ITEMS: 10
} as const;

// Car status mapping
export const CAR_STATUS_MAPPING = {
  active: 'active',
  pending: 'pending',
  sold: 'sold',
  draft: 'draft'
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  LISTING_APPROVED: 'listing_approved',
  NEW_INQUIRY: 'new_inquiry',
  PRICE_UPDATE: 'price_update',
  SYSTEM: 'system'
} as const;

// Error codes that should be handled gracefully
export const GRACEFUL_ERROR_CODES = {
  PERMISSION_DENIED: 'permission-denied',
  FAILED_PRECONDITION: 'failed-precondition',
  INDEX_BUILDING: 'failed-precondition'
} as const;

// Default car data structure
export const DEFAULT_CAR_DATA = {
  title: '',
  make: '',
  model: '',
  year: 0,
  price: 0,
  status: 'draft' as const,
  views: 0,
  inquiries: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  imageUrl: undefined
};

// Default message data structure
export const DEFAULT_MESSAGE_DATA = {
  senderId: '',
  senderName: 'Unknown',
  carId: '',
  carTitle: 'Unknown Car',
  message: '',
  timestamp: new Date(),
  isRead: false
};

// Default notification data structure
export const DEFAULT_NOTIFICATION_DATA = {
  type: 'system' as const,
  title: 'Notification',
  message: '',
  timestamp: new Date(),
  isRead: false,
  carId: undefined
};
