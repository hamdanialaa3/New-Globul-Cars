// functions/src/analytics/types.ts
// Analytics System Types

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: 'listing_view' | 'profile_view' | 'inquiry_sent' | 'favorite_added' | 'search' | 'contact_click';
  timestamp: FirebaseFirestore.Timestamp;
  metadata: {
    listingId?: string;
    sellerId?: string;
    profileType?: string;
    searchTerm?: string;
    filters?: Record<string, any>;
    location?: string;
    deviceType?: string;
    source?: string;
  };
}

export interface UserAnalytics {
  userId: string;
  profileType: 'private' | 'dealer' | 'company';
  
  // Profile metrics
  profileViews: number;
  profileViewsToday: number;
  profileViewsThisWeek: number;
  profileViewsThisMonth: number;
  
  // Listing metrics
  totalListings: number;
  activeListings: number;
  listingViews: number;
  listingViewsToday: number;
  listingViewsThisWeek: number;
  listingViewsThisMonth: number;
  
  // Engagement metrics
  inquiries: number;
  inquiriesToday: number;
  inquiriesThisWeek: number;
  inquiriesThisMonth: number;
  
  favorites: number;
  favoritesToday: number;
  favoritesThisWeek: number;
  favoritesThisMonth: number;
  
  // Response metrics
  avgResponseTime: number; // minutes
  responseRate: number; // percentage (0-100)
  
  // Conversion metrics
  conversionRate: number; // percentage
  leads: number;
  
  lastUpdated: FirebaseFirestore.Timestamp;
}

export interface ListingAnalytics {
  listingId: string;
  sellerId: string;
  
  views: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  
  inquiries: number;
  favorites: number;
  shares: number;
  
  avgViewDuration: number; // seconds
  bounceRate: number; // percentage
  
  topSources: Array<{
    source: string;
    views: number;
  }>;
  
  viewsByDay: Record<string, number>; // YYYY-MM-DD: count
  
  lastUpdated: FirebaseFirestore.Timestamp;
}

export interface TrackEventRequest {
  eventType: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface GetAnalyticsRequest {
  userId: string;
  period?: 'today' | 'week' | 'month' | 'all';
}

export interface GetAnalyticsResponse {
  success: boolean;
  analytics: UserAnalytics;
}
