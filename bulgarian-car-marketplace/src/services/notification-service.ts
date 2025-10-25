// src/services/notification-service.ts
// Service for handling Firebase Cloud Messaging (FCM)
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseApp, { db } from '../firebase/firebase-config';
import { doc, setDoc, collection } from 'firebase/firestore';
import { bulgarianAuthService } from '../firebase';
import { serviceLogger } from './logger-wrapper';

class NotificationService {
  private messaging = getMessaging(firebaseApp);
  private readonly vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

  /**
   * Requests permission to show notifications and saves the token
   * Supports multiple devices per user via fcmTokens subcollection
   */
  async requestPermissionAndSaveToken(): Promise<string | null> {
    // Silent fail if VAPID key is not configured (not critical for MVP)
        if (!this.vapidKey) {
          if (process.env.NODE_ENV === 'development') {
            serviceLogger.info('FCM notifications disabled: VAPID key not configured', { envVar: 'REACT_APP_FIREBASE_VAPID_KEY' });
          }
          return null;
        }
    
    try {
      const currentUser = await bulgarianAuthService.getCurrentUserProfile();
      if (!currentUser) {
        return null; // Silent fail if not logged in
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const fcmToken = await getToken(this.messaging, {
          vapidKey: this.vapidKey
        });

        if (fcmToken) {
          // Save token to fcmTokens subcollection (supports multiple devices)
          const tokenRef = doc(
            collection(db, 'users', currentUser.uid, 'fcmTokens'),
            fcmToken
          );
          
          await setDoc(tokenRef, {
            token: fcmToken,
            createdAt: new Date(),
            lastUsed: new Date(),
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform
            }
          }, { merge: true });
          
              if (process.env.NODE_ENV === 'development') {
                serviceLogger.info('FCM token saved', { uid: currentUser.uid });
              }
          return fcmToken;
        }
      }
      return null;
    } catch (error) {
      // Silent fail in production, log in development
      if (process.env.NODE_ENV === 'development') {
              serviceLogger.warn('FCM setup incomplete (non-critical)', error as Error);
      }
      return null;
    }
  }

  /**
   * Listens for incoming messages when the app is in the foreground.
   * @param callback A function to be called when a message is received.
   * @returns Unsubscribe function.
   */
  onForegroundMessage(callback: (payload: any) => void) {
    return onMessage(this.messaging, (payload) => {
      serviceLogger.info('Message received in foreground', { payload });
      callback(payload);
    });
  }
}

export const notificationService = new NotificationService();
