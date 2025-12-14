// Advanced Content Management Service - نظام إدارة المحتوى المتقدم
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
  startAfter,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

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
  originalData?: any;
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

export class AdvancedContentManagementService {
  private static instance: AdvancedContentManagementService;

  public static getInstance(): AdvancedContentManagementService {
    if (!AdvancedContentManagementService.instance) {
      AdvancedContentManagementService.instance = new AdvancedContentManagementService();
    }
    return AdvancedContentManagementService.instance;
  }

  // الحصول على التقارير المعلقة
  public async getPendingReports(limitCount: number = 50): Promise<ContentReport[]> {
    try {
      const reportsRef = collection(db, 'content_reports');
      const q = query(
        reportsRef,
        where('status', '==', 'pending'),
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
      serviceLogger.error('Error getting pending reports', error as Error, { limitCount });
      return [];
    }
  }

  // الحصول على جميع التقارير
  public async getAllReports(limitCount: number = 100): Promise<ContentReport[]> {
    try {
      const reportsRef = collection(db, 'content_reports');
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
      serviceLogger.error('Error getting all reports', error as Error, { limitCount });
      return [];
    }
  }

  // مراجعة تقرير
  public async reviewReport(
    reportId: string, 
    action: 'approve' | 'dismiss', 
    moderatorId: string,
    notes?: string
  ): Promise<void> {
    try {
      const reportRef = doc(db, 'content_reports', reportId);
      const updateData: Record<string, unknown> = {
        status: action === 'approve' ? 'reviewed' : 'dismissed',
        reviewedBy: moderatorId,
        reviewedAt: serverTimestamp(),
        action,
        notes
      };

      await updateDoc(reportRef, updateData);

      // إذا تم الموافقة على التقرير، قم بتطبيق الإجراء على المحتوى
      if (action === 'approve') {
        const reportDoc = await getDocs(query(collection(db, 'content_reports'), where('__name__', '==', reportId)));
        if (!reportDoc.empty) {
          const reportData = reportDoc.docs[0].data();
          await this.applyContentAction(reportData.contentId, reportData.contentType, 'flag', 'super_admin', 'Auto-flagged from report');
        }
      }
    } catch (error) {
      serviceLogger.error('Error reviewing report', error as Error, { reportId, action, moderatorId });
      throw error;
    }
  }

  // تطبيق إجراء على المحتوى
  public async applyContentAction(
    contentId: string, 
    contentType: string, 
    action: 'hide' | 'delete' | 'flag' | 'restore',
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // تحديث حالة المحتوى
      const contentRef = doc(db, contentType === 'car' ? 'cars' : 'users', contentId);
      const moderationData: Record<string, unknown> = {
        status: action === 'delete' ? 'deleted' : 
                action === 'hide' ? 'hidden' : 
                action === 'flag' ? 'flagged' : 'active',
        moderatedAt: serverTimestamp(),
        moderatedBy: moderatorId,
        moderationReason: reason
      };

      batch.update(contentRef, moderationData);

      // إنشاء سجل الإشراف
      const moderationRef = doc(collection(db, 'content_moderation'));
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
      serviceLogger.error('Error applying content action', error as Error, { contentId, contentType, action, moderatorId });
      throw error;
    }
  }

  // حذف المحتوى نهائياً
  public async permanentlyDeleteContent(
    contentId: string, 
    contentType: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // حذف المحتوى الرئيسي
      const contentRef = doc(db, contentType === 'car' ? 'cars' : 'users', contentId);
      batch.delete(contentRef);

      // حذف المحتوى المرتبط
      if (contentType === 'car') {
        // حذف رسائل السيارة
        const messagesQuery = query(
          collection(db, 'messages'),
          where('carId', '==', contentId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // حذف تقييمات السيارة
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('carId', '==', contentId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        reviewsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      }

      // إنشاء سجل الحذف
      const deletionRef = doc(collection(db, 'content_deletions'));
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

  // استعادة المحتوى
  public async restoreContent(
    contentId: string, 
    contentType: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      const contentRef = doc(db, contentType === 'car' ? 'cars' : 'users', contentId);
      await updateDoc(contentRef, {
        status: 'active',
        restoredAt: serverTimestamp(),
        restoredBy: moderatorId,
        restoreReason: reason
      });
    } catch (error) {
      serviceLogger.error('Error restoring content', error as Error, { contentId, contentType, moderatorId });
      throw error;
    }
  }

  // الحصول على إحصائيات المحتوى
  public async getContentStats(): Promise<ContentStats> {
    try {
      const [carsSnapshot, usersSnapshot, reportsSnapshot, moderationSnapshot] = await Promise.all([
        queryAllCollections(),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'content_reports')),
        getDocs(collection(db, 'content_moderation'))
      ]);

      const cars = carsSnapshot.docs.map(doc => doc.data());
      const users = usersSnapshot.docs.map(doc => doc.data());
      const reports = reportsSnapshot.docs.map(doc => doc.data());
      const moderation = moderationSnapshot.docs.map(doc => doc.data());

      return {
        totalContent: cars.length + users.length,
        activeContent: cars.filter(c => c.status === 'active').length + users.filter(u => !u.isBanned).length,
        hiddenContent: cars.filter(c => c.status === 'hidden').length,
        deletedContent: cars.filter(c => c.status === 'deleted').length,
        flaggedContent: cars.filter(c => c.status === 'flagged').length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        resolvedReports: reports.filter(r => r.status === 'resolved').length,
        moderationActions: moderation.length
      };
    } catch (error) {
      serviceLogger.error('Error getting content stats', error as Error);
      return {
        totalContent: 0,
        activeContent: 0,
        hiddenContent: 0,
        deletedContent: 0,
        flaggedContent: 0,
        pendingReports: 0,
        resolvedReports: 0,
        moderationActions: 0
      };
    }
  }

  // البحث في المحتوى
  public async searchContent(
    searchQuery: string, 
    contentType?: string,
    status?: string,
    limitCount: number = 50
  ): Promise<any[]> {
    try {
      let contentRef = collection(db, contentType || 'cars');
      let q = query(contentRef, limit(limitCount));

      if (status) {
        q = query(contentRef, where('status', '==', status), limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // فلترة النتائج حسب النص (محاكاة البحث)
      if (searchQuery) {
        return results.filter(item => 
          JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return results;
    } catch (error) {
      serviceLogger.error('Error searching content', error as Error, { searchQuery, contentType, status });
      return [];
    }
  }

  // الحصول على تاريخ الإشراف
  public async getModerationHistory(contentId: string): Promise<any[]> {
    try {
      const moderationRef = collection(db, 'content_moderation');
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

  // تصدير بيانات المحتوى
  public async exportContentData(
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
        // تحويل إلى CSV (محاكاة)
        const headers = Object.keys(data[0] || {});
        const csvContent = [
          headers.join(','),
          ...data.map((row: any) => 
            headers.map(header => 
              JSON.stringify((row as any)[header] || '')
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

  // إنشاء نسخة احتياطية
  public async createBackup(backupName: string): Promise<string> {
    try {
      const backupData = {
        name: backupName,
        timestamp: serverTimestamp(),
        collections: {
          cars: await this.exportContentData('cars'),
          users: await this.exportContentData('users'),
          reports: await this.exportContentData('content_reports')
        }
      };

      const backupRef = doc(collection(db, 'backups'));
      await updateDoc(backupRef, backupData);

      return backupRef.id;
    } catch (error) {
      serviceLogger.error('Error creating backup', error as Error, { backupName });
      throw error;
    }
  }
}

export const advancedContentManagementService = AdvancedContentManagementService.getInstance();
