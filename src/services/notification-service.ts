/**
 * Notification Service
 * خدمة الإشعارات
 * 
 * Features:
 * - Real-time notification listening
 * - Mark as read/unread
 * - Get unread count
 * - Delete notifications
 * - Pagination support
 * 
 * Usage:
 * const service = notificationService.getInstance();
 * service.listenToNotifications(userId, (notifications) => { ... });
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  Timestamp,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';

export interface Notification {
  id: string;
  userId: string;
  type: 'new_car_from_followed_seller' | 'price_drop' | 'car_sold' | 'message';
  carId: string;
  sellerId: string;
  sellerName: string;
  carMake: string;
  carModel: string;
  carPrice: number;
  carImage?: string;
  isRead: boolean;
  createdAt: Timestamp;
}

class NotificationService {
  private static instance: NotificationService;
  private unsubscribers: Map<string, Unsubscribe> = new Map();

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Listen to real-time notifications for a user
   * Returns unsubscribe function
   */
  listenToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void,
    maxResults: number = 20
  ): Unsubscribe {
    try {
      // Stop existing listener if any
      this.stopListening(userId);

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notifications: Notification[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Notification));

          callback(notifications);

          logger.info('Notifications updated', { 
            userId, 
            count: notifications.length 
          });
        },
        (error) => {
          logger.error('Error listening to notifications', error as Error, { userId });
          callback([]); // Return empty array on error
        }
      );

      // Store unsubscriber
      this.unsubscribers.set(userId, unsubscribe);

      return unsubscribe;

    } catch (error) {
      logger.error('Failed to start notification listener', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Stop listening to notifications
   */
  stopListening(userId: string): void {
    const unsubscribe = this.unsubscribers.get(userId);
    if (unsubscribe) {
      try {
        unsubscribe();
        this.unsubscribers.delete(userId);
        logger.info('Stopped listening to notifications', { userId });
      } catch (error) {
        logger.error('Error stopping notification listener', error as Error, { userId });
        // Always delete even if error occurs
        this.unsubscribers.delete(userId);
      }
    }
  }

  /**
   * Get unread notification count (one-time fetch)
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;

    } catch (error) {
      logger.error('Failed to get unread count', error as Error, { userId });
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true
      });

      logger.info('Notification marked as read', { notificationId });

    } catch (error) {
      logger.error('Failed to mark notification as read', error as Error, { notificationId });
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read (batch operation)
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    if (notificationIds.length === 0) return;

    try {
      const batch = writeBatch(db);

      notificationIds.forEach(id => {
        const notificationRef = doc(db, 'notifications', id);
        batch.update(notificationRef, { isRead: true });
      });

      await batch.commit();

      logger.info('Multiple notifications marked as read', { 
        count: notificationIds.length 
      });

    } catch (error) {
      logger.error('Failed to mark multiple notifications as read', error as Error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        logger.info('No unread notifications to mark', { userId });
        return;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();

      logger.info('All notifications marked as read', { 
        userId, 
        count: snapshot.size 
      });

    } catch (error) {
      logger.error('Failed to mark all notifications as read', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);

      logger.info('Notification deleted', { notificationId });

    } catch (error) {
      logger.error('Failed to delete notification', error as Error, { notificationId });
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        logger.info('No notifications to delete', { userId });
        return;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      logger.info('All notifications deleted', { 
        userId, 
        count: snapshot.size 
      });

    } catch (error) {
      logger.error('Failed to delete all notifications', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Request permission and save FCM token (Stub for production)
   * This prevents the "requestPermissionAndSaveToken is not a function" error
   */
  async requestPermissionAndSaveToken(userId: string): Promise<void> {
    try {
      logger.info('📱 Notification permission requested (stub)', { userId });
      // TODO: Implement Firebase Cloud Messaging (FCM) token registration
      // For now, this is a stub to prevent errors in production
    } catch (error) {
      logger.error('Failed to request notification permission', error as Error, { userId });
    }
  }

  /**
   * Listen for foreground messages (Stub for production)
   * This prevents the "onForegroundMessage is not a function" error
   * Returns an unsubscribe function
   */
  onForegroundMessage(callback: (payload: any) => void): () => void {
    logger.info('📱 Foreground message listener initialized (stub)');
    // TODO: Implement Firebase Cloud Messaging (FCM) foreground message listener
    // For now, this is a stub to prevent errors in production
    
    // Return a no-op unsubscribe function
    return () => {
      logger.info('📱 Foreground message listener unsubscribed (stub)');
    };
  }

  /**
   * Get car URL from notification
   * Uses strict numeric ID system
   */
  getCarUrl(notification: Notification): string {
    const { carId } = notification;
    
    // Assuming the car has numeric IDs embedded or we fetch them
    // For now, fallback to UUID-based URL (will be fixed in migration)
    return `/car-details/${carId}`;
    
    // TODO: Upgrade to strict numeric URLs when migration is complete
    // return `/car/${sellerNumericId}/${carNumericId}`;
  }

  /**
   * Cleanup: Stop all active listeners
   */
  cleanup(): void {
    this.unsubscribers.forEach((unsubscribe, userId) => {
      try {
        unsubscribe();
        logger.info('Cleaned up notification listener', { userId });
      } catch (error) {
        logger.error('Error cleaning up notification listener', error as Error, { userId });
      }
    });
    this.unsubscribers.clear();
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
export default notificationService;
