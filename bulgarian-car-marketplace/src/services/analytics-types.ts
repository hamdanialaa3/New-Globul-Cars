/**
 * Analytics Types
 * أنواع البيانات للتحليلات
 *
 * This module contains all type definitions for the analytics system.
 * يحتوي هذا الوحدة على جميع تعريفات الأنواع لنظام التحليلات.
 */

export interface RealTimeAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalCars: number;
  activeCars: number;
  carsListedToday: number;
  totalMessages: number;
  messagesSentToday: number;
  totalViews: number;
  viewsToday: number;
  revenue: number;
  trafficSources: { [key: string]: number };
  geoDistribution: { [key: string]: number };
  deviceUsage: { [key: string]: number };
  pageViews: { [key: string]: number };
  topCountries: { country: string; count: number }[];
  topCities: { city: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  carListings: { date: string; count: number }[];
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

export interface SystemPerformance {
  timestamp: Date;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  errorRate: number;
}

export interface AnalyticsCache {
  data: RealTimeAnalytics | null;
  expiry: number;
}

export interface AnalyticsState {
  cache: AnalyticsCache;
  listeners: Set<(analytics: RealTimeAnalytics) => void>;
  subscriptions: Map<string, () => void>;
}

export interface AnalyticsQuery {
  collection: string;
  field?: string;
  value?: any;
  operator?: '==' | '>' | '<' | '>=' | '<=' | 'array-contains';
  orderBy?: string;
  limit?: number;
}

export interface AnalyticsResult {
  count: number;
  data: any[];
  lastUpdated: Date;
}

export interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

export interface GeoDistribution {
  location: string;
  count: number;
  percentage: number;
}

export interface DeviceUsage {
  device: string;
  count: number;
  percentage: number;
}

export interface PageView {
  page: string;
  views: number;
  uniqueViews: number;
  averageTime: number;
}

export interface UserGrowth {
  date: string;
  newUsers: number;
  totalUsers: number;
  growthRate: number;
}

export interface CarListing {
  date: string;
  count: number;
  active: number;
  sold: number;
}

export interface RevenueData {
  total: number;
  monthly: { month: string; amount: number }[];
  bySource: { source: string; amount: number }[];
  currency: string;
}