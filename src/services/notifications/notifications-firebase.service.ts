// src/services/notifications/notifications-firebase.service.ts
// Firebase Notification Management Service
// خدمة إدارة الإشعارات عبر Firebase

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  addDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

export type NotificationType = 
  | 'message' 
  | 'search' 
  | 'login' 
  | 'car' 
  | 'favorite' 
  | 'offer' 
  | 'system' 
  | 'alert';

export interface FirebaseNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface NotificationCreateData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

class NotificationsFirebaseService {
  private readonly COLLECTION = 'notifications';

  /**
   * Subscribe to user's notifications in real-time
   * الاشتراك في الإشعارات للمستخدم في الوقت الفعلي
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: FirebaseNotification[]) => void,
    options: {
      filter?: 'all' | 'unread' | 'read';
      type?: NotificationType;
      limit?: number;
    } = {}
  ) {
    try {
      const { filter = 'all', type, limit = 50 } = options;

      // Build query constraints
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId)
      ];

      // Add filter constraints
      if (filter === 'unread') {
        constraints.push(where('read', '==', false));
      } else if (filter === 'read') {
        constraints.push(where('read', '==', true));
      }

      // Add type filter
      if (type) {
        constraints.push(where('type', '==', type));
      }

      // Order by timestamp (newest first)
      constraints.push(orderBy('timestamp', 'desc'));

      // Create query
      const q = query(
        collection(db, this.COLLECTION),
        ...constraints
      );

      // Subscribe to real-time updates
      let isActive = true;
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isActive) return;
          const notifications: FirebaseNotification[] = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          } as FirebaseNotification));

          callback(notifications);
          
          logger.info('Notifications loaded', {
            userId,
            count: notifications.length,
            unread: notifications.filter(n => !n.read).length
          });
        },
        (error) => {
          if (!isActive) return;
          logger.error('Notification subscription error', error as Error, { userId });
          callback([]); // Return empty array on error
        }
      );

      return () => { isActive = false; unsubscribe(); };
    } catch (error) {
      logger.error('Failed to subscribe to notifications', error as Error, { userId });
      return () => {}; // Return no-op unsubscribe function
    }
  }

  /**
   * Mark a notification as read
   * تعليم الإشعار كمقروء
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, this.COLLECTION, notificationId);
      
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: serverTimestamp()
      });

      logger.info('Notification marked as read', { notificationId });
      return true;
    } catch (error) {
      logger.error('Failed to mark notification as read', error as Error, { notificationId });
      return false;
    }
  }

  /**
   * Mark all user's notifications as read
   * تعليم جميع إشعارات المستخدم كمقروءة
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      // Get all unread notifications
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        logger.info('No unread notifications to mark', { userId });
        return true;
      }

      // Batch update (Firestore limit: 500 operations per batch)
      const batch = writeBatch(db);
      const now = serverTimestamp();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          updatedAt: now
        });
      });

      await batch.commit();

      logger.info('All notifications marked as read', {
        userId,
        count: snapshot.size
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to mark all notifications as read', error as Error, { userId });
      return false;
    }
  }

  /**
   * Delete a notification
   * حذف إشعار
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, this.COLLECTION, notificationId);
      await deleteDoc(notificationRef);

      logger.info('Notification deleted', { notificationId });
      return true;
    } catch (error) {
      logger.error('Failed to delete notification', error as Error, { notificationId });
      return false;
    }
  }

  /**
   * Delete all read notifications for a user
   * حذف جميع الإشعارات المقروءة للمستخدم
   */
  async deleteAllRead(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('read', '==', true)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        logger.info('No read notifications to delete', { userId });
        return true;
      }

      // Batch delete
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      logger.info('All read notifications deleted', {
        userId,
        count: snapshot.size
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to delete all read notifications', error as Error, { userId });
      return false;
    }
  }

  /**
   * Create a new notification
   * إنشاء إشعار جديد
   * (Usually called by Cloud Functions or admin operations)
   */
  async createNotification(data: NotificationCreateData): Promise<string | null> {
    try {
      const now = serverTimestamp();
      
      const notificationData = {
        ...data,
        read: false,
        timestamp: now,
        createdAt: now
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTION),
        notificationData
      );

      logger.info('Notification created', {
        id: docRef.id,
        userId: data.userId,
        type: data.type
      });

      return docRef.id;
    } catch (error) {
      logger.error('Failed to create notification', error as Error, { userId: data.userId });
      return null;
    }
  }

  /**
   * Get unread notification count
   * الحصول على عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      logger.error('Failed to get unread count', error as Error, { userId });
      return 0;
    }
  }

  /**
   * Subscribe to unread count in real-time
   * الاشتراك في عدد الإشعارات غير المقروءة في الوقت الفعلي
   */
  subscribeToUnreadCount(
    userId: string,
    callback: (count: number) => void
  ) {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      let isActive = true;
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isActive) return;
          callback(snapshot.size);
        },
        (error) => {
          if (!isActive) return;
          logger.error('Unread count subscription error', error as Error, { userId });
          callback(0);
        }
      );

      return () => { isActive = false; unsubscribe(); };
    } catch (error) {
      logger.error('Failed to subscribe to unread count', error as Error, { userId });
      return () => {};
    }
  }
}

// Export singleton instance
export const notificationsFirebaseService = new NotificationsFirebaseService();
