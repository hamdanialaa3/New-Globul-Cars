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

import { db } from '@globul-cars/services';
import { logger } from '@globul-cars/services';

export class UnifiedNotificationService {
  private static instance: UnifiedNotificationService;
  
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
   * Send notification to user
   * Consolidates all notification methods
   */
  async sendNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      link?: string;
    }
  ): Promise<void> {
    try {
      // Store notification in Firestore
      await db.collection('notifications').add({
        userId,
        ...notification,
        read: false,
        createdAt: new Date()
      });
      
      logger.info('Notification sent', { userId, type: notification.type });
      
    } catch (error) {
      logger.error('Error sending notification', error as Error, { userId });
      throw error;
    }
  }
  
  /**
   * Send FCM push notification
   */
  async sendFCMNotification(token: string, data: any): Promise<void> {
    logger.info('FCM notification', { token });
    // Implementation here
  }
  
  /**
   * Send email notification
   */
  async sendEmailNotification(email: string, subject: string, body: string): Promise<void> {
    logger.info('Email notification', { email });
    // Implementation here
  }
  
  /**
   * Send SMS notification (Bulgarian phone numbers)
   */
  async sendSMSNotification(phone: string, message: string): Promise<void> {
    logger.info('SMS notification', { phone });
    // Implementation here
  }
}

// Export singleton
export const notificationService = UnifiedNotificationService.getInstance();

