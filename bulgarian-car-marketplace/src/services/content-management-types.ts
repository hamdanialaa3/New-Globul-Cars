/**
 * Content Management Types
 * أنواع إدارة المحتوى
 */

export interface ContentReport {
  id: string;
  contentId: string;
  contentType: 'car' | 'user' | 'message' | 'review';
  reporterId: string;
  reporterEmail: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: string;
  notes?: string;
}

export interface ContentModeration {
  id: string;
  contentId: string;
  contentType: string;
  status: 'active' | 'hidden' | 'deleted' | 'flagged';
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  originalData?: Record<string, unknown>;
  moderationHistory?: Array<{
    action: string;
    timestamp: Date;
    moderator: string;
    reason: string;
  }>;
}

export interface ContentStats {
  totalContent: number;
  activeContent: number;
  hiddenContent: number;
  deletedContent: number;
  flaggedContent: number;
  pendingReports: number;
  resolvedReports: number;
  moderationActions: number;
}

export interface ContentAction {
  type: 'hide' | 'delete' | 'flag' | 'restore';
  contentId: string;
  contentType: string;
  moderatorId: string;
  reason?: string;
  timestamp: Date;
}

export interface ModerationLog {
  id: string;
  contentId: string;
  contentType: string;
  action: string;
  moderatorId: string;
  reason?: string;
  timestamp: Date;
}

export interface ContentDeletion {
  id: string;
  contentId: string;
  contentType: string;
  deletedBy: string;
  reason: string;
  timestamp: Date;
  originalData?: Record<string, unknown>;
}

export interface ContentBackup {
  id: string;
  name: string;
  timestamp: Date;
  collections: {
    cars: string;
    users: string;
    reports: string;
  };
  size?: number;
  status: 'completed' | 'in_progress' | 'failed';
}

export interface ContentSearchOptions {
  searchQuery?: string;
  contentType?: string;
  status?: string;
  limitCount?: number;
}

export interface ExportOptions {
  contentType: string;
  format: 'json' | 'csv';
  filters?: Record<string, unknown>;
}

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type ContentStatus = 'active' | 'hidden' | 'deleted' | 'flagged';
export type ContentType = 'car' | 'user' | 'message' | 'review';
export type ModerationAction = 'hide' | 'delete' | 'flag' | 'restore';
export type ReviewAction = 'approve' | 'dismiss';