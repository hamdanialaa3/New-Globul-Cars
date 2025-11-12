// Dashboard Page Types
// TypeScript interfaces and types for the Dashboard Page component

import { DashboardStats, DashboardCar, DashboardMessage, DashboardNotification } from '@/services/dashboardService';

// Formatted stat for display
export interface FormattedStat {
  icon: string;
  value: string;
  label: string;
  change: string;
  changeType: 'positive' | 'negative' | 'warning' | 'info';
}

// Dashboard state interface
export interface DashboardState {
  stats: DashboardStats | null;
  recentCars: DashboardCar[];
  recentMessages: DashboardMessage[];
  notifications: DashboardNotification[];
  loading: boolean;
  error: string | null;
}

// Dashboard actions interface
export interface DashboardActions {
  formatTimeAgo: (date: Date) => string;
  handleMarkMessageAsRead: (messageId: string) => Promise<void>;
  handleMarkNotificationAsRead: (notificationId: string) => Promise<void>;
}

// Combined dashboard hook return type
export interface UseDashboardReturn extends DashboardState, DashboardActions {
  formattedStats: FormattedStat[];
}