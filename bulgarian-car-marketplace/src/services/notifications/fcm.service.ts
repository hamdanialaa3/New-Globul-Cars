/**
 * Firebase Cloud Messaging Service
 * Handles FCM token registration and notification permissions
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

class FCMService {
  private messaging: Messaging | null = null;
  private readonly vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

  /**
   * Initialize Firebase Messaging
   */
  private initializeMessaging(): void {
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        this.messaging = getMessaging();
        console.log('Firebase Messaging initialized');
      }
    } catch (error) {
      console.error('Error initializing Firebase Messaging:', error);
    }
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
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
        console.error('VAPID key not configured');
        return null;
      }

      const permission = await this.requestPermission();
      
      if (!permission) {
        console.log('Permission not granted for notifications');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });

      if (token) {
        console.log('FCM token obtained:', token.substring(0, 20) + '...');
        await this.saveTokenToFirestore(userId, token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
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

      console.log('FCM token saved to Firestore');
    } catch (error) {
      console.error('Error saving FCM token:', error);
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
      console.log('FCM token deleted from Firestore');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
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
      console.error('Firebase Messaging not initialized');
      return () => {};
    }

    const unsubscribe = onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);
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

