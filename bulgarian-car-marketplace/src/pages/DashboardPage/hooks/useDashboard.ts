import { useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthProvider';
import { dashboardService, DashboardStats, DashboardCar, DashboardMessage, DashboardNotification } from '../../../services/dashboardService';
import { FormattedStat } from '../types';

export interface UseDashboardReturn {
  // State
  stats: DashboardStats | null;
  recentCars: DashboardCar[];
  recentMessages: DashboardMessage[];
  notifications: DashboardNotification[];
  loading: boolean;
  error: string | null;

  // Computed data
  formattedStats: FormattedStat[];

  // Actions
  formatTimeAgo: (date: Date) => string;
  handleMarkMessageAsRead: (messageId: string) => Promise<void>;
  handleMarkNotificationAsRead: (notificationId: string) => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Real data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCars, setRecentCars] = useState<DashboardCar[]>([]);
  const [recentMessages, setRecentMessages] = useState<DashboardMessage[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    if (!user?.uid) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load initial data
        const [statsData, carsData, messagesData, notificationsData] = await Promise.all([
          dashboardService.getDashboardStats(user.uid),
          dashboardService.getRecentCars(user.uid, 5),
          dashboardService.getRecentMessages(user.uid, 5),
          dashboardService.getNotifications(user.uid, 5)
        ]);

        setStats(statsData);
        setRecentCars(carsData);
        setRecentMessages(messagesData);
        setNotifications(notificationsData);

        // Subscribe to real-time updates
        const unsubscribe = dashboardService.subscribeToDashboardUpdates(
          user.uid,
          setStats,
          setRecentCars,
          setRecentMessages,
          setNotifications
        );

        return unsubscribe;
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    let unsubscribe: (() => void) | undefined;
    loadDashboardData().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  // Format stats for display
  const formattedStats: FormattedStat[] = stats ? [
    {
      icon: 'car',
      value: stats.activeListings.toString(),
      label: t('dashboard.stats.listingsOnline'),
      change: `+${stats.weeklyViews} ${t('dashboard.stats.thisWeek')}`,
      changeType: 'positive' as const
    },
    {
      icon: 'eye',
      value: stats.totalViews.toLocaleString(),
      label: t('dashboard.stats.views'),
      change: `+${stats.weeklyViews} ${t('dashboard.stats.lastWeek')}`,
      changeType: 'positive' as const
    },
    {
      icon: 'message',
      value: recentMessages.length.toString(),
      label: t('dashboard.stats.newInquiries'),
      change: `${recentMessages.filter(m => !m.isRead).length} ${t('dashboard.stats.unread')}`,
      changeType: recentMessages.filter(m => !m.isRead).length > 0 ? 'warning' as const : 'info' as const
    },
    {
      icon: 'euro',
      value: `€${stats.potentialSales.toLocaleString()}`,
      label: t('dashboard.stats.potentialSales'),
      change: t('dashboard.stats.basedOnInquiries'),
      changeType: 'info' as const
    }
  ] : [];

  // Helper functions
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return t('dashboard.timeAgo.justNow');
    if (diffInHours < 24) return t('dashboard.timeAgo.hoursAgo').replace('{{count}}', diffInHours.toString());

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t('dashboard.timeAgo.dayAgo');
    return t('dashboard.timeAgo.daysAgo').replace('{{count}}', diffInDays.toString());
  };

  const handleMarkMessageAsRead = async (messageId: string) => {
    try {
      await dashboardService.markMessageAsRead(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await dashboardService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    // State
    stats,
    recentCars,
    recentMessages,
    notifications,
    loading,
    error,

    // Computed data
    formattedStats,

    // Actions
    formatTimeAgo,
    handleMarkMessageAsRead,
    handleMarkNotificationAsRead,
  };
};