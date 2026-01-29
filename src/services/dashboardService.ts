// dashboard-service.ts
// Orchestrator service for dashboard functionality

import { serviceLogger } from './logger-service';

import {
  DashboardStats,
  DashboardCar,
  DashboardMessage,
  DashboardNotification,
  DashboardUpdateCallbacks
} from './dashboard-types';
import { DEFAULT_DASHBOARD_STATS } from './dashboard-data';
import {
  StatsOperations,
  CarsOperations,
  MessagesOperations,
  NotificationsOperations,
  RealtimeOperations
} from './dashboard-operations';

export class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  // Get dashboard statistics
  async getDashboardStats(userId: string | null | undefined): Promise<DashboardStats> {
    // Guard against null/undefined userId
    if (!userId) {
      serviceLogger.warn('[DashboardService] getDashboardStats called with null/undefined userId');
      return DEFAULT_DASHBOARD_STATS;
    }

    return StatsOperations.getDashboardStats(userId);
  }

  // Get recent cars
  async getRecentCars(userId: string | null | undefined, limitCount: number = 5): Promise<DashboardCar[]> {
    // Guard against null/undefined userId
    if (!userId) {
      serviceLogger.warn('[DashboardService] getRecentCars called with null/undefined userId');
      return [];
    }

    return CarsOperations.getRecentCars(userId, limitCount);
  }

  // Get recent messages
  async getRecentMessages(userId: string | null | undefined, limitCount: number = 5): Promise<DashboardMessage[]> {
    // Guard against null/undefined userId
    if (!userId) {
      serviceLogger.warn('[DashboardService] getRecentMessages called with null/undefined userId');
      return [];
    }

    return MessagesOperations.getRecentMessages(userId, limitCount);
  }

  // Get notifications
  async getNotifications(userId: string | null | undefined, limitCount: number = 5): Promise<DashboardNotification[]> {
    // Guard against null/undefined userId
    if (!userId) {
      serviceLogger.warn('[DashboardService] getNotifications called with null/undefined userId');
      return [];
    }

    return NotificationsOperations.getNotifications(userId, limitCount);
  }

  // Real-time updates
  subscribeToDashboardUpdates(
    userId: string | null | undefined,
    onStatsUpdate: (stats: DashboardStats) => void,
    onCarsUpdate: (cars: DashboardCar[]) => void,
    onMessagesUpdate: (messages: DashboardMessage[]) => void,
    onNotificationsUpdate: (notifications: DashboardNotification[]) => void
  ): () => void {
    // Guard against null/undefined userId
    if (!userId) {
      serviceLogger.warn('[DashboardService] subscribeToDashboardUpdates called with null/undefined userId');
      return () => {}; // Return empty unsubscribe function
    }

    return RealtimeOperations.subscribeToDashboardUpdates(userId, {
      onStatsUpdate,
      onCarsUpdate,
      onMessagesUpdate,
      onNotificationsUpdate
    });
  }

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    return MessagesOperations.markMessageAsRead(messageId);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    return NotificationsOperations.markNotificationAsRead(notificationId);
  }

  /**
   * Attaches all dashboard real-time listeners (cars, messages, notifications).
   *
   * @returns {() => void} Cleanup function to remove all listeners. MUST be called on component unmount to avoid memory leaks.
   *
   * Usage:
   *   const cleanup = dashboardService.attachListeners(...);
   *   useEffect(() => { ...; return cleanup; }, []);
   */
  attachListeners(
    userId: string,
    onStatsUpdate: (stats: DashboardStats) => void,
    onCarsUpdate: (cars: DashboardCar[]) => void,
    onMessagesUpdate: (messages: DashboardMessage[]) => void,
    onNotificationsUpdate: (notifications: DashboardNotification[]) => void
  ): () => void {
    return this.subscribeToDashboardUpdates(
      userId,
      onStatsUpdate,
      onCarsUpdate,
      onMessagesUpdate,
      onNotificationsUpdate
    );
  }
}

export const dashboardService = DashboardService.getInstance();