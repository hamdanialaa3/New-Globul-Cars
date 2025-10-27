// src/services/messaging/notification-service.ts
// Notification Service - خدمة الإشعارات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== INTERFACES ====================

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  onClick?: () => void;
}

export interface NotificationPermissionResult {
  granted: boolean;
  token?: string;
  error?: string;
}

// ==================== SERVICE CLASS ====================

export class NotificationService {
  private static instance: NotificationService;
  private messaging: any = null;

  private constructor() {
    try {
      if ('serviceWorker' in navigator) {
        this.messaging = getMessaging();
      }
    } catch (error) {
      logger.warn('Push notifications not available', error as Error);
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Request notification permission
   * طلب إذن الإشعارات
   */
  async requestPermission(userId: string): Promise<NotificationPermissionResult> {
    try {
      if (!this.messaging) {
        return {
          granted: false,
          error: 'Push notifications not supported'
        };
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });

        // Save token to user profile
        await this.saveToken(userId, token);

        if (process.env.NODE_ENV === 'development') {
          logger.debug('Notification permission granted');
        }
        
        return {
          granted: true,
          token
        };
      } else {
        return {
          granted: false,
          error: 'Permission denied'
        };
      }
    } catch (error: any) {
      logger.error('Request permission failed', error as Error);
      return {
        granted: false,
        error: error.message
      };
    }
  }

  /**
   * Show local notification
   * عرض إشعار محلي
   */
  async showNotification(notification: PushNotification): Promise<void> {
    try {
      if (!('Notification' in window)) {
        logger.warn('Notifications not supported');
        return;
      }

      if (Notification.permission !== 'granted') {
        logger.warn('No notification permission');
        return;
      }

      const options: NotificationOptions & { vibrate?: number[] } = {
        body: notification.body,
        icon: notification.icon || '/logo192.png',
        badge: notification.badge,
        data: notification.data,
        tag: 'bulgarian-cars',
        vibrate: [200, 100, 200],
        requireInteraction: false
      };

      const n = new Notification(notification.title, options);

      if (notification.onClick) {
        n.onclick = notification.onClick;
      }

      // Auto-close after 5 seconds
      setTimeout(() => n.close(), 5000);

    } catch (error) {
      logger.error('Show notification failed', error as Error);
    }
  }

  /**
   * Listen to foreground messages
   * الاستماع للرسائل في المقدمة
   */
  listenToForegroundMessages(
    callback: (payload: any) => void
  ): () => void {
    if (!this.messaging) {
      return () => {};
    }

    return onMessage(this.messaging, (payload) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Foreground message received', payload as any);
      }
      
      // Show notification
      if (payload.notification) {
        this.showNotification({
          title: payload.notification.title || 'New Message',
          body: payload.notification.body || '',
          icon: payload.notification.icon,
          data: payload.data
        });
      }

      callback(payload);
    });
  }

  /**
   * Send new message notification
   * إرسال إشعار رسالة جديدة
   */
  async notifyNewMessage(
    receiverId: string,
    senderName: string,
    messageText: string,
    language: 'bg' | 'en'
  ): Promise<void> {
    const title = language === 'bg' 
      ? `💬 Ново съобщение от ${senderName}`
      : `💬 New message from ${senderName}`;

    const body = messageText.length > 100 
      ? messageText.slice(0, 100) + '...'
      : messageText;

    await this.showNotification({
      title,
      body,
      onClick: () => {
        window.location.href = '/messages';
      }
    });
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Save FCM token to user profile
   * حفظ رمز FCM في البروفايل
   */
  private async saveToken(userId: string, token: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmTokens: arrayUnion(token),
        updatedAt: serverTimestamp()
      });
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('FCM token saved');
      }
    } catch (error) {
      logger.error('Save token failed', error as Error);
    }
  }
}

// Export singleton
export const notificationService = NotificationService.getInstance();
