/**
 * Firebase Cloud Messaging Service
 * Handles FCM token registration and notification permissions
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

class FCMService {
  private messaging: Messaging | null = null;
  private readonly vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  /**
   * Initialize Firebase Messaging
   */
  private initializeMessaging(): void {
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        this.messaging = getMessaging();
        serviceLogger.info('Firebase Messaging initialized');
      }
    } catch (error) {
      serviceLogger.error('Error initializing Firebase Messaging', error as Error);
    }
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        serviceLogger.warn('This browser does not support notifications');
        return false;
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        serviceLogger.info('Notification permission granted');
        return true;
      } else {
        serviceLogger.info('Notification permission denied');
        return false;
      }
    } catch (error) {
      serviceLogger.error('Error requesting notification permission', error as Error);
      return false;
    }
  }

  /**
   * Get FCM token for the current device
   */
  async getToken(userId: string): Promise<string | null> {
    try {
      if (!this.messaging) {
        this.initializeMessaging();
      }

      if (!this.messaging) {
        throw new Error('Firebase Messaging not initialized');
      }

      if (!this.vapidKey) {
        serviceLogger.error('VAPID key not configured');
        return null;
      }

      const permission = await this.requestPermission();
      
      if (!permission) {
        serviceLogger.info('Permission not granted for notifications');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });

      if (token) {
        serviceLogger.info('FCM token obtained', { userId, tokenPreview: token.substring(0, 20) });
        await this.saveTokenToFirestore(userId, token);
        return token;
      } else {
        serviceLogger.warn('No registration token available', { userId });
        return null;
      }
    } catch (error) {
      serviceLogger.error('Error getting FCM token', error as Error, { userId });
      return null;
    }
  }

  /**
   * Save FCM token to Firestore
   */
  private async saveTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      const tokenRef = doc(db, 'users', userId, 'fcmTokens', token);
      
      await setDoc(tokenRef, {
        token,
        createdAt: new Date(),
        lastUsed: new Date(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      });

      serviceLogger.info('FCM token saved to Firestore', { userId });
    } catch (error) {
      serviceLogger.error('Error saving FCM token', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Delete FCM token from Firestore
   */
  async deleteToken(userId: string, token: string): Promise<void> {
    try {
      const tokenRef = doc(db, 'users', userId, 'fcmTokens', token);
      await deleteDoc(tokenRef);
      serviceLogger.info('FCM token deleted from Firestore', { userId });
    } catch (error) {
      serviceLogger.error('Error deleting FCM token', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Listen for foreground messages
   */
  onForegroundMessage(callback: (payload: any) => void): () => void {
    if (!this.messaging) {
      this.initializeMessaging();
    }

    if (!this.messaging) {
      serviceLogger.error('Firebase Messaging not initialized');
      return () => {};
    }

    const unsubscribe = onMessage(this.messaging, (payload) => {
      serviceLogger.debug('Foreground message received', { notificationTitle: payload?.notification?.title });
      callback(payload);
    });

    return unsubscribe;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator
    );
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'default';
    }
    return Notification.permission;
  }
}

export const fcmService = new FCMService();
export default fcmService;

