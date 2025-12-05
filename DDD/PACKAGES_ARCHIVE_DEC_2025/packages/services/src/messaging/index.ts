// src/services/messaging/index.ts
// Messaging Module Index - ملف ربط خدمات المحادثات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Messaging Module
 * 
 * نظام محادثات متقدم للمستخدمين البلغاريين
 * Advanced messaging system for Bulgarian users
 * 
 * Available Services:
 * 1. advancedMessagingService - المحادثات المتقدمة
 * 2. notificationService - الإشعارات
 */

// ==================== IMPORTS ====================

import { advancedMessagingService } from './advanced-messaging-service';
import { notificationService } from './notification-service';

// ==================== EXPORTS ====================

// Advanced Messaging
export {
  advancedMessagingService,
  AdvancedMessagingService
} from './advanced-messaging-service';

export type {
  Message,
  MessageAttachment,
  Conversation,
  TypingIndicator
} from './advanced-messaging-service';

// Notifications
export {
  notificationService,
  NotificationService
} from './notification-service';

export type {
  PushNotification,
  NotificationPermissionResult
} from './notification-service';

// ==================== CONSOLIDATED SERVICE ====================

/**
 * Main Messaging Service
 * خدمة المحادثات الموحدة
 */
export const MessagingService = {
  messaging: advancedMessagingService,
  notifications: notificationService
};

// Default export
export default MessagingService;
