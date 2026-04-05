import {
  notificationService as unifiedNotificationService,
  UnifiedNotificationService,
  type Notification,
} from '../notifications/unified-notification.service';

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationPermissionResult {
  granted: boolean;
  status: NotificationPermission;
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  listenToNotifications = unifiedNotificationService.listenToNotifications.bind(unifiedNotificationService);
  markAsRead = unifiedNotificationService.markAsRead.bind(unifiedNotificationService);
  markAllAsRead = unifiedNotificationService.markAllAsRead.bind(unifiedNotificationService);
  deleteNotification = unifiedNotificationService.deleteNotification.bind(unifiedNotificationService);
  getUnreadCount = unifiedNotificationService.getUnreadCount.bind(unifiedNotificationService);
  getCarUrl = unifiedNotificationService.getCarUrl.bind(unifiedNotificationService);

  async requestPermission(): Promise<NotificationPermissionResult> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, status: 'denied' as NotificationPermission };
    }

    const status = await Notification.requestPermission();
    return { granted: status === 'granted', status };
  }

  onForegroundMessage(_callback: (payload: PushNotification) => void): () => void {
    return () => {};
  }
}

export const notificationService = NotificationService.getInstance();
export { UnifiedNotificationService, Notification };
