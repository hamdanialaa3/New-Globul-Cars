// src/services/fcm-service.ts
// Firebase Cloud Messaging Service for Push Notifications
// Firebase Cloud Messaging service for notifications

import {
  getMessaging,
  getToken,
  onMessage,
  MessagePayload,
  Messaging
} from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { BULGARIAN_CONFIG } from '../config/bulgarian-config';
import { serviceLogger } from './logger-wrapper';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || BULGARIAN_CONFIG.api.firebase.apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || BULGARIAN_CONFIG.api.firebase.authDomain,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || BULGARIAN_CONFIG.api.firebase.projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || BULGARIAN_CONFIG.api.firebase.storageBucket,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || BULGARIAN_CONFIG.api.firebase.messagingSenderId,
  appId: process.env.VITE_FIREBASE_APP_ID || BULGARIAN_CONFIG.api.firebase.appId
};

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  type: 'message' | 'car_update' | 'system' | 'promotion';
}

class FCMService {
  private messaging: Messaging | null = null;
  private vapidKey: string;
  private notifications: PushNotification[] = [];
  private listeners: ((notification: PushNotification) => void)[] = [];

  constructor() {
    // ✅ Get VAPID key from environment variable
    this.vapidKey = process.env.REACT_APP_VAPID_KEY || '';
    
    // Warn if VAPID key not configured
    if (!this.vapidKey) {
      serviceLogger.warn('VAPID key not configured - push notifications disabled. Add REACT_APP_VAPID_KEY to .env file', {});
    }
    
    this.initializeMessaging();
  }

  private initializeMessaging() {
    try {
      // Skip initialization in test environment or when window is not available
      if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
        serviceLogger.warn('FCM initialization skipped in test environment', {});
        return;
      }

      // Initialize Firebase if not already initialized
      if (!this.messaging) {
        const app = initializeApp(firebaseConfig);
        this.messaging = getMessaging(app);
      }
    } catch (error) {
      serviceLogger.error('Failed to initialize FCM', error as Error, {});
    }
  }

  // Request permission for notifications
  async requestPermission(): Promise<boolean> {
    try {
      // Skip in test environment
      if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
        return true;
      }

      if (!('Notification' in window)) {
        serviceLogger.warn('Browser does not support notifications', {});
        return false;
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
return true;
      } else {
return false;
      }
    } catch (error) {
      serviceLogger.error('Error requesting notification permission', error as Error, {});
      return false;
    }
  }

  // Get FCM token
  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        serviceLogger.error('FCM not initialized', new Error('FCM not initialized'), {});
        return null;
      }

      if (!this.vapidKey) {
        serviceLogger.error('VAPID key not configured', new Error('VAPID key missing'), {});
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });

      if (token) {
return token;
      } else {
return null;
      }
    } catch (error) {
      serviceLogger.error('Error getting FCM token', error as Error, {});
      return null;
    }
  }

  // Listen for incoming messages
  setupMessageListener() {
    if (!this.messaging) {
      serviceLogger.error('FCM not initialized', new Error('FCM not initialized'), {});
      return;
    }

    onMessage(this.messaging, (payload: MessagePayload) => {
const notification: PushNotification = {
        id: payload.messageId || Date.now().toString(),
        title: payload.notification?.title || 'New Notification',
        body: payload.notification?.body || '',
        data: payload.data,
        timestamp: new Date(),
        read: false,
        type: this.getNotificationType(payload.data)
      };

      this.addNotification(notification);
      this.showBrowserNotification(notification);
    });
  }

  // Show browser notification
  private showBrowserNotification(notification: PushNotification) {
    if (Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
        data: notification.data
      };

      const browserNotification = new Notification(notification.title, options);

      browserNotification.onclick = () => {
        // Handle notification click
        this.handleNotificationClick(notification);
        browserNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  // Handle notification click
  private handleNotificationClick(notification: PushNotification) {
    // Mark as read
    this.markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        window.location.href = '/messages';
        break;
      case 'car_update':
        if (notification.data?.carId) {
          window.location.href = `/cars/${notification.data.carId}`;
        }
        break;
      default:
        window.location.href = '/';
    }
  }

  // Determine notification type from data
  private getNotificationType(data?: any): PushNotification['type'] {
    if (!data) return 'system';

    if (data.type) {
      return data.type as PushNotification['type'];
    }

    if (data.messageId) return 'message';
    if (data.carId) return 'car_update';

    return 'system';
  }

  // Add notification to local storage
  private addNotification(notification: PushNotification) {
    this.notifications.unshift(notification);

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Save to localStorage
    this.saveNotifications();

    // Notify listeners
    this.listeners.forEach(listener => listener(notification));
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotifications();
  }

  // Get all notifications
  getNotifications(): PushNotification[] {
    return [...this.notifications];
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Clear all notifications
  clearNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  // Save notifications to localStorage
  private saveNotifications() {
    try {
      localStorage.setItem('globul-cars-notifications', JSON.stringify(this.notifications));
    } catch (error) {
      serviceLogger.error('Error saving notifications', error as Error, {});
    }
  }

  // Load notifications from localStorage
  loadNotifications() {
    try {
      const saved = localStorage.getItem('globul-cars-notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      serviceLogger.error('Error loading notifications', error as Error, {});
    }
  }

  // Subscribe to notification updates
  subscribe(listener: (notification: PushNotification) => void) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Send test notification (for development)
  async sendTestNotification() {
    const testNotification: PushNotification = {
      id: Date.now().toString(),
      title: 'Test Notification',
      body: 'This is a test push notification',
      timestamp: new Date(),
      read: false,
      type: 'system'
    };

    this.addNotification(testNotification);
    this.showBrowserNotification(testNotification);
  }

  // Initialize service
  async initialize() {
    this.loadNotifications();

    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      const token = await this.getFCMToken();
      if (token) {
        this.setupMessageListener();
        return token;
      }
    }

    return null;
  }
}

// Export singleton instance
export const fcmService = new FCMService();
export default fcmService;