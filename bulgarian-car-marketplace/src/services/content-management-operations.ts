/**
 * Content Management Operations
 * عمليات إدارة المحتوى
 */

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import {
  ContentReport,
  ContentStats,
  ModerationLog,
  ContentDeletion,
  ContentBackup,
  ContentSearchOptions
} from './content-management-types';
import {
  CONTENT_MANAGEMENT_COLLECTIONS,
  QUERY_LIMITS,
  CONTENT_STATUSES,
  REPORT_STATUSES,
  DEFAULT_CONTENT_STATS,
  ERROR_MESSAGES
} from './content-management-data';

/**
 * Content Management Operations Class
 * فئة عمليات إدارة المحتوى
 */
export class ContentManagementOperations {
  /**
   * Fetch pending reports from Firebase
   * جلب التقارير المعلقة من Firebase
   */
  static async fetchPendingReports(limitCount: number = QUERY_LIMITS.PENDING_REPORTS): Promise<ContentReport[]> {
    try {
      const reportsRef = collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_REPORTS);
      const q = query(
        reportsRef,
        where('status', '==', REPORT_STATUSES.PENDING),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as ContentReport));
    } catch (error) {
      serviceLogger.error('Error fetching pending reports', error as Error, { limitCount });
      return [];
    }
  }

  /**
   * Fetch all reports from Firebase
   * جلب جميع التقارير من Firebase
   */
  static async fetchAllReports(limitCount: number = QUERY_LIMITS.ALL_REPORTS): Promise<ContentReport[]> {
    try {
      const reportsRef = collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_REPORTS);
      const q = query(
        reportsRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as ContentReport));
    } catch (error) {
      serviceLogger.error('Error fetching all reports', error as Error, { limitCount });
      return [];
    }
  }

  /**
   * Update report status
   * تحديث حالة التقرير
   */
  static async updateReportStatus(
    reportId: string,
    action: 'approve' | 'dismiss',
    moderatorId: string,
    notes?: string
  ): Promise<void> {
    try {
      const reportRef = doc(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_REPORTS, reportId);
      const updateData: Record<string, unknown> = {
        status: action === 'approve' ? REPORT_STATUSES.REVIEWED : REPORT_STATUSES.DISMISSED,
        reviewedBy: moderatorId,
        reviewedAt: serverTimestamp(),
        action,
        notes
      };

      await updateDoc(reportRef, updateData);
    } catch (error) {
      serviceLogger.error('Error updating report status', error as Error, { reportId, action, moderatorId });
      throw error;
    }
  }

  /**
   * Get report by ID
   * الحصول على التقرير بواسطة المعرف
   */
  static async getReportById(reportId: string): Promise<ContentReport | null> {
    try {
      const reportDoc = await getDocs(
        query(
          collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_REPORTS),
          where('__name__', '==', reportId)
        )
      );

      if (!reportDoc.empty) {
        const data = reportDoc.docs[0].data();
        return {
          id: reportDoc.docs[0].id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as ContentReport;
      }
      return null;
    } catch (error) {
      serviceLogger.error('Error getting report by ID', error as Error, { reportId });
      return null;
    }
  }

  /**
   * Apply content moderation action
   * تطبيق إجراء الإشراف على المحتوى
   */
  static async applyModerationAction(
    contentId: string,
    contentType: string,
    action: 'hide' | 'delete' | 'flag' | 'restore',
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Update content status
      const contentRef = doc(db, contentType === 'car' ? CONTENT_MANAGEMENT_COLLECTIONS.CARS : CONTENT_MANAGEMENT_COLLECTIONS.USERS, contentId);
      const moderationData: Record<string, unknown> = {
        status: action === 'delete' ? CONTENT_STATUSES.DELETED :
                action === 'hide' ? CONTENT_STATUSES.HIDDEN :
                action === 'flag' ? CONTENT_STATUSES.FLAGGED : CONTENT_STATUSES.ACTIVE,
        moderatedAt: serverTimestamp(),
        moderatedBy: moderatorId,
        moderationReason: reason
      };

      batch.update(contentRef, moderationData);

      // Create moderation log
      const moderationRef = doc(collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_MODERATION));
      batch.set(moderationRef, {
        contentId,
        contentType,
        action,
        moderatorId,
        reason,
        timestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      serviceLogger.error('Error applying moderation action', error as Error, { contentId, contentType, action, moderatorId });
      throw error;
    }
  }

  /**
   * Permanently delete content with related data
   * حذف المحتوى بشكل دائم مع البيانات المرتبطة
   */
  static async permanentlyDeleteContent(
    contentId: string,
    contentType: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete main content
      const contentRef = doc(db, contentType === 'car' ? CONTENT_MANAGEMENT_COLLECTIONS.CARS : CONTENT_MANAGEMENT_COLLECTIONS.USERS, contentId);
      batch.delete(contentRef);

      // Delete related content if car
      if (contentType === 'car') {
        // Delete car messages
        const messagesQuery = query(
          collection(db, CONTENT_MANAGEMENT_COLLECTIONS.MESSAGES),
          where('carId', '==', contentId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // Delete car reviews
        const reviewsQuery = query(
          collection(db, CONTENT_MANAGEMENT_COLLECTIONS.REVIEWS),
          where('carId', '==', contentId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        reviewsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      }

      // Create deletion log
      const deletionRef = doc(collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_DELETIONS));
      batch.set(deletionRef, {
        contentId,
        contentType,
        deletedBy: moderatorId,
        reason,
        timestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      serviceLogger.error('Error permanently deleting content', error as Error, { contentId, contentType, moderatorId });
      throw error;
    }
  }

  /**
   * Restore content
   * استعادة المحتوى
   */
  static async restoreContent(
    contentId: string,
    contentType: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      const contentRef = doc(db, contentType === 'car' ? CONTENT_MANAGEMENT_COLLECTIONS.CARS : CONTENT_MANAGEMENT_COLLECTIONS.USERS, contentId);
      await updateDoc(contentRef, {
        status: CONTENT_STATUSES.ACTIVE,
        restoredAt: serverTimestamp(),
        restoredBy: moderatorId,
        restoreReason: reason
      });
    } catch (error) {
      serviceLogger.error('Error restoring content', error as Error, { contentId, contentType, moderatorId });
      throw error;
    }
  }

  /**
   * Calculate content statistics
   * حساب إحصائيات المحتوى
   */
  static async calculateContentStats(): Promise<ContentStats> {
    try {
      // Note: queryAllCollections is assumed to be imported from another service
      // For now, we'll use a placeholder
      const [carsSnapshot, usersSnapshot, reportsSnapshot, moderationSnapshot] = await Promise.all([
        getDocs(collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CARS)),
        getDocs(collection(db, CONTENT_MANAGEMENT_COLLECTIONS.USERS)),
        getDocs(collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_REPORTS)),
        getDocs(collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_MODERATION))
      ]);

      const cars = carsSnapshot.docs.map(doc => doc.data());
      const users = usersSnapshot.docs.map(doc => doc.data());
      const reports = reportsSnapshot.docs.map(doc => doc.data());
      const moderation = moderationSnapshot.docs.map(doc => doc.data());

      return {
        totalContent: cars.length + users.length,
        activeContent: cars.filter(c => c.status === CONTENT_STATUSES.ACTIVE).length + users.filter(u => !u.isBanned).length,
        hiddenContent: cars.filter(c => c.status === CONTENT_STATUSES.HIDDEN).length,
        deletedContent: cars.filter(c => c.status === CONTENT_STATUSES.DELETED).length,
        flaggedContent: cars.filter(c => c.status === CONTENT_STATUSES.FLAGGED).length,
        pendingReports: reports.filter(r => r.status === REPORT_STATUSES.PENDING).length,
        resolvedReports: reports.filter(r => r.status === REPORT_STATUSES.RESOLVED).length,
        moderationActions: moderation.length
      };
    } catch (error) {
      serviceLogger.error('Error calculating content stats', error as Error);
      return DEFAULT_CONTENT_STATS;
    }
  }

  /**
   * Search content with filters
   * البحث في المحتوى مع الفلاتر
   */
  static async searchContent(options: ContentSearchOptions): Promise<Array<{ id: string; [key: string]: unknown }>> {
    try {
      const {
        searchQuery,
        contentType = 'cars',
        status,
        limitCount = QUERY_LIMITS.SEARCH_RESULTS
      } = options;

      let contentRef = collection(db, contentType);
      let q = query(contentRef, limit(limitCount));

      if (status) {
        q = query(contentRef, where('status', '==', status), limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter results by search query (simple text search simulation)
      if (searchQuery) {
        return results.filter(item =>
          JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return results;
    } catch (error) {
      serviceLogger.error('Error searching content', error as Error, options);
      return [];
    }
  }

  /**
   * Get moderation history for content
   * الحصول على تاريخ الإشراف للمحتوى
   */
  static async getModerationHistory(contentId: string): Promise<Array<{ id: string; [key: string]: unknown; timestamp: Date }>> {
    try {
      const moderationRef = collection(db, CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_MODERATION);
      const q = query(
        moderationRef,
        where('contentId', '==', contentId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
    } catch (error) {
      serviceLogger.error('Error getting moderation history', error as Error, { contentId });
      return [];
    }
  }

  /**
   * Export content data to JSON or CSV
   * تصدير بيانات المحتوى إلى JSON أو CSV
   */
  static async exportContentData(
    contentType: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const contentRef = collection(db, contentType);
      const snapshot = await getDocs(contentRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // Convert to CSV
        const headers = Object.keys(data[0] || {});
        const csvContent = [
          headers.join(','),
          ...data.map((row: Record<string, unknown>) =>
            headers.map(header =>
              JSON.stringify((row[header] ?? '') || '')
            ).join(',')
          )
        ].join('\n');
        return csvContent;
      }
    } catch (error) {
      serviceLogger.error('Error exporting content data', error as Error, { contentType, format });
      throw error;
    }
  }

  /**
   * Create backup of content collections
   * إنشاء نسخة احتياطية من مجموعات المحتوى
   */
  static async createBackup(backupName: string): Promise<string> {
    try {
      const backupData = {
        name: backupName,
        timestamp: serverTimestamp(),
        collections: {
          cars: await this.exportContentData(CONTENT_MANAGEMENT_COLLECTIONS.CARS),
          users: await this.exportContentData(CONTENT_MANAGEMENT_COLLECTIONS.USERS),
          reports: await this.exportContentData(CONTENT_MANAGEMENT_COLLECTIONS.CONTENT_REPORTS)
        }
      };

      const backupRef = doc(collection(db, CONTENT_MANAGEMENT_COLLECTIONS.BACKUPS));
      await updateDoc(backupRef, backupData);

      return backupRef.id;
    } catch (error) {
      serviceLogger.error('Error creating backup', error as Error, { backupName });
      throw error;
    }
  }
}