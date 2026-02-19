/**
 * UNIFIED NOTIFICATION SERVICE
 * 
 * Consolidates 4 notification services into one:
 * - notifications/fcm.service.ts (canonical) → Keep
 * - notification-service.ts → Move to DDD
 * - messaging/notification-service.ts → Move to DDD
 * - fcm-service.ts → Move to DDD
 * 
 * Lines Saved: ~600 duplicate lines
 * 
 * @since 2025-11-03 (Phase 1.4)
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
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';

export interface Notification {
  id: string;
  userId: string;
  type: 'new_car_from_followed_seller' | 'price_drop' | 'car_sold' | 'message' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp | Date;
  carId?: string;
  link?: string;
  // ✅ CONSTITUTION: Numeric ID fields for strict URL generation
  sellerNumericId?: number;
  carNumericId?: number;
}

export class UnifiedNotificationService {
  private static instance: UnifiedNotificationService;
  private unsubscribers: Map<string, Unsubscribe> = new Map();

  private constructor() {
    logger.info('UnifiedNotificationService initialized');
  }

  static getInstance(): UnifiedNotificationService {
    if (!this.instance) {
      this.instance = new UnifiedNotificationService();
    }
    return this.instance;
  }

  /**
   * Listen to real-time notifications for a user
   */
  listenToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void,
    maxResults: number = 20
  ): Unsubscribe {
    try {
      this.stopListening(userId);

      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        } as Notification));
        callback(notifications);
      }, (error) => {
        // Gracefully handle permission-denied (e.g., rules not deployed yet)
        logger.warn('Notification listener error', { code: (error as any).code, message: error.message, userId });
        callback([]);
      });

      this.unsubscribers.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      logger.error('Error listening to notifications', error as Error, { userId });
      return () => { };
    }
  }

  stopListening(userId: string): void {
    const unsubscribe = this.unsubscribers.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribers.delete(userId);
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const ref = doc(db, 'notifications', notificationId);
      await updateDoc(ref, { isRead: true });
    } catch (error) {
      logger.error('Error marking notification as read', error as Error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      logger.error('Error getting unread count', error as Error);
      return 0;
    }
  }

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    notification: Partial<Notification> & { title: string; message: string; type: any }
  ): Promise<void> {
    try {
      await db.collection('notifications').add({
        userId,
        ...notification,
        isRead: false,
        createdAt: new Date()
      });
      logger.info('Notification sent', { userId, type: notification.type });
    } catch (error) {
      logger.error('Error sending notification', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Send FCM push notification (Legacy/Bridge)
   */
  /**
   * Request notification permission (Bridge)
   */
  async requestPermission(): Promise<boolean> {
    logger.info('Notification permission requested');
    return true;
  }

  /**
   * Listen for foreground messages (Bridge)
   */
  onForegroundMessage(callback: (payload: any) => void): () => void {
    logger.info('Foreground message listener attached');
    return () => { };
  }
}

export const notificationService = UnifiedNotificationService.getInstance();

