/**
 * Advanced Content Management Service
 * خدمة إدارة المحتوى المتقدمة
 *
 * This module provides the main orchestrator for advanced content management using the singleton pattern.
 * يوفر هذا الوحدة المنسق الرئيسي لإدارة المحتوى المتقدمة باستخدام نمط الـ singleton.
 */

import { serviceLogger } from './logger-service';
import { ContentManagementOperations } from './content-management-operations';
import {
  ContentReport,
  ContentStats,
  ContentSearchOptions
} from './content-management-types';
import {
  QUERY_LIMITS,
  ERROR_MESSAGES
} from './content-management-data';

/**
 * Advanced Content Management Service Class
 * فئة خدمة إدارة المحتوى المتقدمة
 */
class AdvancedContentManagementService {
  private static instance: AdvancedContentManagementService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   * الحصول على مثيل singleton
   */
  public static getInstance(): AdvancedContentManagementService {
    if (!AdvancedContentManagementService.instance) {
      AdvancedContentManagementService.instance = new AdvancedContentManagementService();
    }
    return AdvancedContentManagementService.instance;
  }

  // ==================== REPORTS MANAGEMENT ====================

  /**
   * Get pending reports
   * الحصول على التقارير المعلقة
   */
  public async getPendingReports(limitCount: number = QUERY_LIMITS.PENDING_REPORTS): Promise<ContentReport[]> {
    return ContentManagementOperations.fetchPendingReports(limitCount);
  }

  /**
   * Get all reports
   * الحصول على جميع التقارير
   */
  public async getAllReports(limitCount: number = QUERY_LIMITS.ALL_REPORTS): Promise<ContentReport[]> {
    return ContentManagementOperations.fetchAllReports(limitCount);
  }

  /**
   * Review report with action
   * مراجعة التقرير مع الإجراء
   */
  public async reviewReport(
    reportId: string,
    action: 'approve' | 'dismiss',
    moderatorId: string,
    notes?: string
  ): Promise<void> {
    try {
      // Update report status
      await ContentManagementOperations.updateReportStatus(reportId, action, moderatorId, notes);

      // If approved, apply action to content
      if (action === 'approve') {
        const report = await ContentManagementOperations.getReportById(reportId);
        if (report) {
          await ContentManagementOperations.applyModerationAction(
            report.contentId,
            report.contentType,
            'flag',
            moderatorId,
            'Auto-flagged from report'
          );
        }
      }
    } catch (error) {
      serviceLogger.error('Error reviewing report', error as Error, { reportId, action, moderatorId });
      throw error;
    }
  }

  // ==================== CONTENT MODERATION ====================

  /**
   * Apply moderation action to content
   * تطبيق إجراء الإشراف على المحتوى
   */
  public async applyContentAction(
    contentId: string,
    contentType: string,
    action: 'hide' | 'delete' | 'flag' | 'restore',
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    return ContentManagementOperations.applyModerationAction(contentId, contentType, action, moderatorId, reason);
  }

  /**
   * Permanently delete content
   * حذف المحتوى نهائياً
   */
  public async permanentlyDeleteContent(
    contentId: string,
    contentType: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    return ContentManagementOperations.permanentlyDeleteContent(contentId, contentType, moderatorId, reason);
  }

  /**
   * Restore deleted or hidden content
   * استعادة المحتوى المحذوف أو المخفي
   */
  public async restoreContent(
    contentId: string,
    contentType: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    return ContentManagementOperations.restoreContent(contentId, contentType, moderatorId, reason);
  }

  // ==================== STATISTICS ====================

  /**
   * Get content statistics
   * الحصول على إحصائيات المحتوى
   */
  public async getContentStats(): Promise<ContentStats> {
    return ContentManagementOperations.calculateContentStats();
  }

  // ==================== SEARCH & QUERY ====================

  /**
   * Search content with filters
   * البحث في المحتوى مع الفلاتر
   */
  public async searchContent(
    searchQuery: string,
    contentType?: string,
    status?: string,
    limitCount: number = QUERY_LIMITS.SEARCH_RESULTS
  ): Promise<Array<{ id: string; [key: string]: unknown }>> {
    const options: ContentSearchOptions = {
      searchQuery,
      contentType,
      status,
      limitCount
    };
    return ContentManagementOperations.searchContent(options);
  }

  /**
   * Get moderation history for content
   * الحصول على تاريخ الإشراف للمحتوى
   */
  public async getModerationHistory(contentId: string): Promise<Array<{ id: string; [key: string]: unknown; timestamp: Date }>> {
    return ContentManagementOperations.getModerationHistory(contentId);
  }

  // ==================== DATA EXPORT ====================

  /**
   * Export content data to JSON or CSV
   * تصدير بيانات المحتوى إلى JSON أو CSV
   */
  public async exportContentData(
    contentType: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    return ContentManagementOperations.exportContentData(contentType, format);
  }

  /**
   * Create backup of content collections
   * إنشاء نسخة احتياطية من مجموعات المحتوى
   */
  public async createBackup(backupName: string): Promise<string> {
    return ContentManagementOperations.createBackup(backupName);
  }
}

// ==================== EXPORTS ====================

export const advancedContentManagementService = AdvancedContentManagementService.getInstance();

export default AdvancedContentManagementService;
