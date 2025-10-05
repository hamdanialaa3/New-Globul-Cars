// src/services/messaging/notification-service.ts
// Notification Service - خدمة الإشعارات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

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
      console.warn('⚠️ Push notifications not available:', error);
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

        console.log('✅ Notification permission granted');
        
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
      console.error('❌ Request permission failed:', error);
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
        console.warn('⚠️ Notifications not supported');
        return;
      }

      if (Notification.permission !== 'granted') {
        console.warn('⚠️ No notification permission');
        return;
      }

      const n = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/logo192.png',
        badge: notification.badge,
        data: notification.data,
        tag: 'bulgarian-cars',
        vibrate: [200, 100, 200],
        requireInteraction: false
      });

      if (notification.onClick) {
        n.onclick = notification.onClick;
      }

      // Auto-close after 5 seconds
      setTimeout(() => n.close(), 5000);

    } catch (error) {
      console.error('❌ Show notification failed:', error);
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
      console.log('📩 Foreground message received:', payload);
      
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
      
      console.log('✅ FCM token saved');
    } catch (error) {
      console.error('❌ Save token failed:', error);
    }
  }
}

// Export singleton
export const notificationService = NotificationService.getInstance();
