// dashboard-types.ts
// Types and interfaces for dashboard service

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  pendingListings: number;
  totalViews: number;
  potentialSales: number;
  weeklyViews: number;
}

export interface DashboardMessage {
  id: string;
  senderId: string;
  senderName: string;
  carId: string;
  carTitle: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface DashboardNotification {
  id: string;
  type: 'listing_approved' | 'new_inquiry' | 'price_update' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  carId?: string;
}

export interface DashboardCar {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'active' | 'pending' | 'sold' | 'draft';
  views: number;
  inquiries: number;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
}

export interface DashboardUpdateCallbacks {
  onStatsUpdate: (stats: DashboardStats) => void;
  onCarsUpdate: (cars: DashboardCar[]) => void;
  onMessagesUpdate: (messages: DashboardMessage[]) => void;
  onNotificationsUpdate: (notifications: DashboardNotification[]) => void;
}

export interface RealtimeSubscriptionOptions {
  userId: string;
  callbacks: DashboardUpdateCallbacks;
  pollingInterval?: number; // in milliseconds
}

export interface PreflightCheckResult {
  ready: boolean;
  error?: string;
}
