/**
 * Advanced Messaging Data
 * بيانات الرسائل المتقدمة
 *
 * This module contains all constants, configurations, and static data for the messaging system.
 * يحتوي هذا الوحدة على جميع الثوابت والإعدادات والبيانات الثابتة لنظام الرسائل.
 */

import { RateLimitConfig } from './advanced-messaging-types';

/**
 * Rate limit configurations
 * إعدادات الحد من المعدل
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  message: {
    maxRequests: 10, // 10 messages per window
    windowMs: 60000, // 1 minute
  },
  conversation: {
    maxRequests: 5, // 5 conversations per window
    windowMs: 300000, // 5 minutes
  },
  attachment: {
    maxRequests: 3, // 3 attachments per window
    windowMs: 300000, // 5 minutes
  },
};

/**
 * File size limits
 * حدود حجم الملفات
 */
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB for images
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB for documents
} as const;

/**
 * Message types
 * أنواع الرسائل
 */
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
} as const;

/**
 * Message statuses
 * حالات الرسائل
 */
export const MESSAGE_STATUSES = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
} as const;

/**
 * Attachment types
 * أنواع المرفقات
 */
export const ATTACHMENT_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
} as const;

/**
 * Typing timeout duration
 * مدة انتهاء صلاحية الكتابة
 */
export const TYPING_TIMEOUT_MS = 3000;

/**
 * Message query limits
 * حدود استعلام الرسائل
 */
export const QUERY_LIMITS = {
  MESSAGES_PER_CONVERSATION: 100,
  CONVERSATIONS_PER_USER: 50,
} as const;

/**
 * Storage paths
 * مسارات التخزين
 */
export const STORAGE_PATHS = {
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
} as const;

/**
 * Firestore collection names
 * أسماء مجموعات Firestore
 */
export const COLLECTION_NAMES = {
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
} as const;

/**
 * Default conversation data
 * بيانات المحادثة الافتراضية
 */
export const DEFAULT_CONVERSATION_DATA = {
  unreadCount: {},
  typing: {},
} as const;