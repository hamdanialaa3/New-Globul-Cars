/**
 * Notification System Enhancements
 * Extends existing notification service with new features:
 * - Notification preferences management
 * - Advanced filtering and categories
 * - Batch operations
 * - Notification statistics
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import {
  doc,
  updateDoc,
  batch,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  collection,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

export type NotificationCategory =
  | 'messages'
  | 'offers'
  | 'reviews'
  | 'favorites'
  | 'sales'
  | 'system'
  | 'promotions';

export interface NotificationPreferences {
  userId: string;
  categories: Record<NotificationCategory, boolean>;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableSmsNotifications: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
  lastUpdated: Timestamp;
}

export interface NotificationFilter {
  category?: NotificationCategory;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// ============================================================================
// NOTIFICATION PREFERENCES SERVICE
// ============================================================================

class NotificationPreferencesService {
  /**
   * Initialize default preferences for new user
   */
  async initializePreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const preferences: NotificationPreferences = {
        userId,
        categories: {
          messages: true,
          offers: true,
          reviews: true,
          favorites: false,
          sales: true,
          system: true,
          promotions: false
        },
        enableEmailNotifications: true,
        enablePushNotifications: true,
        enableSmsNotifications: false,
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'Europe/Sofia'
        },
        lastUpdated: Timestamp.now()
      };

      const prefRef = doc(db, 'notification_preferences', userId);
      await updateDoc(prefRef, preferences as any);

      logger.info('Notification preferences initialized', { userId });
      return preferences;
    } catch (error) {
      logger.error('Failed to initialize preferences', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const prefRef = doc(db, 'notification_preferences', userId);
      const snapshot = await getDocs(collection(db, 'notification_preferences'));

      const pref = snapshot.docs.find((doc) => doc.id === userId);
      return pref ? (pref.data() as NotificationPreferences) : null;
    } catch (error) {
      logger.error('Failed to get preferences', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Update specific preference
   */
  async updatePreference(
    userId: string,
    key: keyof NotificationPreferences,
    value: any
  ): Promise<void> {
    try {
      const prefRef = doc(db, 'notification_preferences', userId);

      await updateDoc(prefRef, {
        [key]: value,
        lastUpdated: Timestamp.now()
      });

      logger.info('Preference updated', { userId, key });
    } catch (error) {
      logger.error('Failed to update preference', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Toggle notification category
   */
  async toggleCategory(userId: string, category: NotificationCategory): Promise<void> {
    try {
      const preferences = await this.getPreferences(userId);
      if (!preferences) {
        return;
      }

      const updated = {
        ...preferences.categories,
        [category]: !preferences.categories[category]
      };

      await this.updatePreference(userId, 'categories', updated);
    } catch (error) {
      logger.error('Failed to toggle category', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Set quiet hours
   */
  async setQuietHours(
    userId: string,
    startTime: string,
    endTime: string,
    enabled: boolean = true
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences(userId);
      if (!preferences) {
        return;
      }

      await this.updatePreference(userId, 'quietHours', {
        ...preferences.quietHours,
        enabled,
        startTime,
        endTime
      });

      logger.info('Quiet hours updated', { userId, startTime, endTime, enabled });
    } catch (error) {
      logger.error('Failed to set quiet hours', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Check if currently in quiet hours
   */
  isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return (
      currentTime >= preferences.quietHours.startTime &&
      currentTime <= preferences.quietHours.endTime
    );
  }

  /**
   * Check if notification category is enabled
   */
  isCategoryEnabled(preferences: NotificationPreferences, category: NotificationCategory): boolean {
    return preferences.categories[category] ?? true;
  }

  /**
   * Should send notification based on preferences
   */
  shouldSendNotification(
    preferences: NotificationPreferences,
    category: NotificationCategory
  ): boolean {
    // Check if category is enabled
    if (!this.isCategoryEnabled(preferences, category)) {
      return false;
    }

    // Check quiet hours
    if (this.isInQuietHours(preferences)) {
      // Allow system notifications during quiet hours
      if (category !== 'system') {
        return false;
      }
    }

    return true;
  }
}

// ============================================================================
// BATCH NOTIFICATION OPERATIONS
// ============================================================================

class BatchNotificationService {
  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<number> {
    try {
      const b = writeBatch(db);
      const now = Timestamp.now();

      notificationIds.forEach((id) => {
        const ref = doc(db, 'notifications', id);
        b.update(ref, {
          isRead: true,
          readAt: now
        });
      });

      await b.commit();
      logger.info('Multiple notifications marked as read', { count: notificationIds.length });

      return notificationIds.length;
    } catch (error) {
      logger.error('Failed to mark multiple as read', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(notificationIds: string[]): Promise<number> {
    try {
      const b = writeBatch(db);

      notificationIds.forEach((id) => {
        const ref = doc(db, 'notifications', id);
        b.delete(ref);
      });

      await b.commit();
      logger.info('Multiple notifications deleted', { count: notificationIds.length });

      return notificationIds.length;
    } catch (error) {
      logger.error('Failed to delete multiple', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Archive multiple notifications
   */
  async archiveMultiple(notificationIds: string[]): Promise<number> {
    try {
      const b = writeBatch(db);
      const now = Timestamp.now();

      notificationIds.forEach((id) => {
        const ref = doc(db, 'notifications', id);
        b.update(ref, {
          isArchived: true,
          archivedAt: now
        });
      });

      await b.commit();
      logger.info('Multiple notifications archived', { count: notificationIds.length });

      return notificationIds.length;
    } catch (error) {
      logger.error('Failed to archive multiple', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}

// ============================================================================
// NOTIFICATION STATISTICS
// ============================================================================

class NotificationStatisticsService {
  /**
   * Get notification stats for user
   */
  async getStats(userId: string) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isArchived', '==', false)
      );

      const snapshot = await getDocs(q);

      const stats = {
        total: snapshot.size,
        unread: 0,
        byCategory: {} as Record<NotificationCategory, number>,
        lastWeek: 0,
        lastMonth: 0
      };

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      snapshot.docs.forEach((doc) => {
        const notification = doc.data();

        if (!notification.isRead) {
          stats.unread++;
        }

        const createdAt = notification.createdAt?.toDate() ?? new Date();

        if (createdAt > oneWeekAgo) {
          stats.lastWeek++;
        }

        if (createdAt > oneMonthAgo) {
          stats.lastMonth++;
        }

        // Count by category
        const category = notification.category || 'system';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get stats', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get notification trends
   */
  async getTrends(userId: string, days: number = 30) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      const trends = new Map<string, number>();

      const now = new Date();

      snapshot.docs.forEach((doc) => {
        const notification = doc.data();
        const createdAt = notification.createdAt?.toDate() ?? new Date();
        const daysAgo = Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000));

        if (daysAgo <= days) {
          const dateStr = createdAt.toISOString().split('T')[0];
          trends.set(dateStr, (trends.get(dateStr) || 0) + 1);
        }
      });

      return Object.fromEntries(trends);
    } catch (error) {
      logger.error('Failed to get trends', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const notificationPreferences = new NotificationPreferencesService();
export const batchNotifications = new BatchNotificationService();
export const notificationStats = new NotificationStatisticsService();

/**
 * USAGE EXAMPLES:
 * 
 * 1. INITIALIZE PREFERENCES:
 *    await notificationPreferences.initializePreferences(userId);
 * 
 * 2. UPDATE PREFERENCE:
 *    await notificationPreferences.updatePreference(userId, 'enablePushNotifications', false);
 * 
 * 3. SET QUIET HOURS:
 *    await notificationPreferences.setQuietHours(userId, '22:00', '08:00', true);
 * 
 * 4. CHECK IF SHOULD SEND:
 *    const prefs = await notificationPreferences.getPreferences(userId);
 *    if (prefs && notificationPreferences.shouldSendNotification(prefs, 'messages')) {
 *      // Send notification
 *    }
 * 
 * 5. BATCH OPERATIONS:
 *    await batchNotifications.markMultipleAsRead(notificationIds);
 *    await batchNotifications.archiveMultiple(notificationIds);
 * 
 * 6. GET STATISTICS:
 *    const stats = await notificationStats.getStats(userId);
 *    const trends = await notificationStats.getTrends(userId, 30);
 */
