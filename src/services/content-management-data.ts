/**
 * Content Management Data
 * بيانات إدارة المحتوى
 */

import {
  ContentStats,
  ReportStatus,
  ReportPriority,
  ContentStatus,
  ContentType,
  ModerationAction
} from './content-management-types';

/**
 * Collections used by Content Management Service
 * المجموعات المستخدمة في خدمة إدارة المحتوى
 */
export const CONTENT_MANAGEMENT_COLLECTIONS = {
  CARS: 'cars',
  USERS: 'users',
  MESSAGES: 'messages',
  REVIEWS: 'reviews',
  CONTENT_REPORTS: 'content_reports',
  CONTENT_MODERATION: 'content_moderation',
  CONTENT_DELETIONS: 'content_deletions',
  BACKUPS: 'backups'
} as const;

/**
 * Query Limits
 * حدود الاستعلامات
 */
export const QUERY_LIMITS = {
  PENDING_REPORTS: 50,
  ALL_REPORTS: 100,
  SEARCH_RESULTS: 50,
  MODERATION_HISTORY: 100
} as const;

/**
 * Report Statuses
 * حالات التقارير
 */
export const REPORT_STATUSES: Record<string, ReportStatus> = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
} as const;

/**
 * Report Priorities
 * أولويات التقارير
 */
export const REPORT_PRIORITIES: Record<string, ReportPriority> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

/**
 * Content Statuses
 * حالات المحتوى
 */
export const CONTENT_STATUSES: Record<string, ContentStatus> = {
  ACTIVE: 'active',
  HIDDEN: 'hidden',
  DELETED: 'deleted',
  FLAGGED: 'flagged'
} as const;

/**
 * Content Types
 * أنواع المحتوى
 */
export const CONTENT_TYPES: Record<string, ContentType> = {
  CAR: 'car',
  USER: 'user',
  MESSAGE: 'message',
  REVIEW: 'review'
} as const;

/**
 * Moderation Actions
 * إجراءات الإشراف
 */
export const MODERATION_ACTIONS: Record<string, ModerationAction> = {
  HIDE: 'hide',
  DELETE: 'delete',
  FLAG: 'flag',
  RESTORE: 'restore'
} as const;

/**
 * Review Actions
 * إجراءات المراجعة
 */
export const REVIEW_ACTIONS = {
  APPROVE: 'approve',
  DISMISS: 'dismiss'
} as const;

/**
 * Default Content Stats
 * إحصائيات المحتوى الافتراضية
 */
export const DEFAULT_CONTENT_STATS: ContentStats = {
  totalContent: 0,
  activeContent: 0,
  hiddenContent: 0,
  deletedContent: 0,
  flaggedContent: 0,
  pendingReports: 0,
  resolvedReports: 0,
  moderationActions: 0
};

/**
 * Export Formats
 * تنسيقات التصدير
 */
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv'
} as const;

/**
 * Bulgarian Market Content Categories
 * فئات المحتوى للسوق البلغاري
 */
export const BULGARIAN_CONTENT_CATEGORIES = [
  'automotive',
  'user_profiles',
  'dealer_content',
  'company_content',
  'marketplace_listings',
  'service_providers'
] as const;

/**
 * Content Quality Thresholds
 * عتبات جودة المحتوى
 */
export const QUALITY_THRESHOLDS = {
  MIN_DESCRIPTION_LENGTH: 50,
  MIN_IMAGES: 3,
  MAX_IMAGES: 20,
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 100
} as const;

/**
 * Moderation Reasons
 * أسباب الإشراف
 */
export const MODERATION_REASONS = {
  SPAM: 'Spam content',
  INAPPROPRIATE: 'Inappropriate content',
  MISLEADING: 'Misleading information',
  DUPLICATE: 'Duplicate content',
  OUTDATED: 'Outdated information',
  VIOLATION: 'Terms of service violation',
  COPYRIGHT: 'Copyright infringement',
  FRAUD: 'Fraudulent activity',
  ABUSE: 'Abusive behavior',
  OTHER: 'Other reason'
} as const;

/**
 * Report Reasons (Bulgarian Market)
 * أسباب الإبلاغ (السوق البلغاري)
 */
export const REPORT_REASONS = {
  FAKE_LISTING: 'Фалшива обява',
  WRONG_PRICE: 'Грешна цена',
  STOLEN_CAR: 'Откраднат автомобил',
  SCAM: 'Измама',
  INAPPROPRIATE_IMAGES: 'Неподходящи изображения',
  DUPLICATE: 'Дубликат',
  OTHER: 'Друга причина'
} as const;

/**
 * Auto-moderation Rules
 * قواعد الإشراف التلقائي
 */
export const AUTO_MODERATION_RULES = {
  MAX_REPORTS_BEFORE_AUTO_FLAG: 5,
  MAX_REPORTS_BEFORE_AUTO_HIDE: 10,
  SPAM_KEYWORD_THRESHOLD: 3,
  DUPLICATE_THRESHOLD: 0.95
} as const;

/**
 * Backup Configuration
 * إعدادات النسخ الاحتياطي
 */
export const BACKUP_CONFIG = {
  MAX_BACKUP_SIZE: 100 * 1024 * 1024, // 100MB
  RETENTION_DAYS: 30,
  AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000 // 24 hours
} as const;

/**
 * Error Messages
 * رسائل الخطأ
 */
export const ERROR_MESSAGES = {
  REPORT_NOT_FOUND: 'Report not found',
  CONTENT_NOT_FOUND: 'Content not found',
  INVALID_ACTION: 'Invalid action',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  EXPORT_FAILED: 'Export failed',
  BACKUP_FAILED: 'Backup creation failed',
  DELETE_FAILED: 'Delete operation failed',
  RESTORE_FAILED: 'Restore operation failed'
} as const;