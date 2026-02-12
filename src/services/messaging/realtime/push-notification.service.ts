/**
 * 🔔 Push Notification Service (Client-Side)
 * خدمة الإشعارات الفورية (جانب العميل)
 * 
 * @description Handles FCM token management and foreground notifications
 * إدارة رموز FCM والإشعارات في المقدمة
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';

// ==================== INTERFACES ====================

/**
 * Notification Data Interface
 * واجهة بيانات الإشعار
 */
export interface NotificationData {
  channelId?: string;
  senderId?: string;
  senderName?: string;
  carId?: string;
  carTitle?: string;
  type: 'new_message' | 'offer_received' | 'offer_accepted' | 'offer_rejected';
}

/**
 * Notification Callback Type
 * نوع دالة رد الاتصال
 */
export type NotificationCallback = (payload: MessagePayload) => void;

// ==================== SERVICE CLASS ====================

/**
 * Push Notification Service
 * خدمة الإشعارات الفورية
 */
class PushNotificationService {
  private static instance: PushNotificationService;
  private messaging: ReturnType<typeof getMessaging> | null = null;
  private currentToken: string | null = null;
  private foregroundCallbacks: Set<NotificationCallback> = new Set();
  
  // VAPID Key (from Firebase Console -> Project Settings -> Cloud Messaging)
  private readonly VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        this.messaging = getMessaging();
        this.setupForegroundHandler();
        logger.info('[PushNotification] Service initialized');
      } catch (error) {
        logger.warn('[PushNotification] FCM not available', { error });
      }
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // ==================== TOKEN MANAGEMENT ====================

  /**
   * Request notification permission and get FCM token
   * طلب إذن الإشعارات والحصول على رمز FCM
   */
  async requestPermissionAndGetToken(userFirebaseId: string, userNumericId: number): Promise<string | null> {
    if (!this.messaging) {
      logger.warn('[PushNotification] Messaging not available');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        logger.info('[PushNotification] Permission denied by user');
        return null;
      }
      
      // Get FCM token
      const token = await getToken(this.messaging, {
        vapidKey: this.VAPID_KEY,
      });
      
      if (token) {
        this.currentToken = token;
        
        // Save token to Firestore for Cloud Functions to use
        await this.saveTokenToFirestore(userFirebaseId, userNumericId, token);
        
        logger.info('[PushNotification] Token obtained and saved', {
          userNumericId,
          tokenPreview: token.substring(0, 20) + '...',
        });
        
        return token;
      }
      
      return null;
    } catch (error: unknown) {
      const errObj = error instanceof Error ? error : new Error(String(error));
      logger.error('[PushNotification] Failed to get token', errObj);
      return null;
    }
  }

  /**
   * Save FCM token to Firestore
   * حفظ رمز FCM في Firestore
   */
  private async saveTokenToFirestore(
    userFirebaseId: string,
    userNumericId: number,
    token: string
  ): Promise<void> {
    const tokenRef = doc(db, 'fcm_tokens', userFirebaseId);
    
    await setDoc(tokenRef, {
      token,
      numericId: userNumericId,
      updatedAt: new Date(),
      platform: this.detectPlatform(),
      userAgent: navigator.userAgent,
    }, { merge: true });
  }

  /**
   * Get stored token from Firestore
   * الحصول على الرمز المخزن من Firestore
   */
  async getStoredToken(userFirebaseId: string): Promise<string | null> {
    const tokenRef = doc(db, 'fcm_tokens', userFirebaseId);
    const snapshot = await getDoc(tokenRef);
    
    if (snapshot.exists()) {
      return snapshot.data()?.token || null;
    }
    
    return null;
  }

  /**
   * Remove FCM token (on logout)
   * إزالة رمز FCM عند تسجيل الخروج
   */
  async removeToken(userFirebaseId: string): Promise<void> {
    const tokenRef = doc(db, 'fcm_tokens', userFirebaseId);
    
    await setDoc(tokenRef, {
      token: null,
      removedAt: new Date(),
    }, { merge: true });
    
    this.currentToken = null;
    logger.info('[PushNotification] Token removed');
  }

  /**
   * Detect platform for analytics
   * اكتشاف المنصة
   */
  private detectPlatform(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) return 'android-web';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios-web';
    return 'desktop-web';
  }

  // ==================== FOREGROUND NOTIFICATIONS ====================

  /**
   * Setup foreground notification handler
   * إعداد معالج الإشعارات في المقدمة
   */
  private setupForegroundHandler(): void {
    if (!this.messaging) return;
    
    onMessage(this.messaging, (payload) => {
      logger.info('[PushNotification] Foreground message received', {
        title: payload.notification?.title,
        type: payload.data?.type,
      });
      
      // Notify all registered callbacks
      this.foregroundCallbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (err: unknown) {
          const errObj = err instanceof Error ? err : new Error(String(err));
          logger.error('[PushNotification] Callback error', errObj);
        }
      });
      
      // Show browser notification if app is in foreground
      this.showBrowserNotification(payload);
    });
  }

  /**
   * Show browser notification
   * عرض إشعار المتصفح
   */
  private showBrowserNotification(payload: MessagePayload): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    
    const title = payload.notification?.title || 'New Globul Cars';
    const options: NotificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icons/notification-icon.png',
      tag: payload.data?.channelId || 'default',
    };
    
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      
      // ✅ Navigate using browser navigation API (preserves React Router state)
      // Note: Can't use navigate() here as we're outside React context
      // This is acceptable for notification clicks
      if (payload.data?.channelId) {
        // Use pushState for smoother navigation
        window.history.pushState({}, '', `/messages?channel=${payload.data.channelId}`);
        // Trigger popstate to let React Router handle the route
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      
      notification.close();
    };
  }

  /**
   * Register foreground notification callback
   * تسجيل دالة رد الاتصال للإشعارات في المقدمة
   */
  onForegroundNotification(callback: NotificationCallback): () => void {
    this.foregroundCallbacks.add(callback);
    
    return () => {
      this.foregroundCallbacks.delete(callback);
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if notifications are supported
   * التحقق من دعم الإشعارات
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }

  /**
   * Check notification permission status
   * التحقق من حالة إذن الإشعارات
   */
  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Check if user has granted permission
   * التحقق مما إذا كان المستخدم قد منح الإذن
   */
  hasPermission(): boolean {
    return this.getPermissionStatus() === 'granted';
  }

  /**
   * Get current FCM token
   * الحصول على رمز FCM الحالي
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

// ==================== EXPORTS ====================

export const pushNotificationService = PushNotificationService.getInstance();
export default PushNotificationService;
