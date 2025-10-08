// src/services/notification-service.ts
// Service for handling Firebase Cloud Messaging (FCM)
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseApp, { db } from '../firebase/firebase-config';
import { doc, updateDoc } from 'firebase/firestore';
import { bulgarianAuthService } from '../firebase';

class NotificationService {
  private messaging = getMessaging(firebaseApp);

  /**
   * Requests permission to show notifications and saves the token.
   * @returns {Promise<string | null>} The FCM token or null if permission denied.
   */
  async requestPermissionAndSaveToken(): Promise<string | null> {
    console.log('Requesting notification permission...');
    try {
      const currentUser = await bulgarianAuthService.getCurrentUserProfile();
      if (!currentUser) {
        console.warn('Cannot request notification permission: user not logged in.');
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        const fcmToken = await getToken(this.messaging, {
          vapidKey: 'YOUR_VAPID_KEY_HERE', // TODO: Replace with your actual VAPID key from Firebase Console
        });

        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          // Save the token to the user's document in Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, { fcmToken });
          console.log('FCM token saved to Firestore.');
          return fcmToken;
        } else {
          console.warn('No registration token available. Request permission to generate one.');
          return null;
        }
      } else {
        console.warn('Notification permission denied.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while requesting notification permission or getting token:', error);
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
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
  }
}

export const notificationService = new NotificationService();
