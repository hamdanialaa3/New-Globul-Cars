/**
 * 🔴 CRITICAL: Report Spam/Abuse Service
 * خدمة الإبلاغ عن الإساءة/الرسائل المزعجة
 * 
 * @description Allows users to report spam, abuse, fake listings, and inappropriate content
 * يسمح للمستخدمين بالإبلاغ عن الرسائل المزعجة والإساءة والإعلانات المزيفة والمحتوى غير المناسب
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses numeric ID system (CONSTITUTION Section 4.1)
 * - Proper error handling and logging (CONSTITUTION Section 4.4)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { logger } from '@/services/logger-service';
import { getNumericIdByFirebaseUid } from '@/services/numeric-id-lookup.service';

// ==================== INTERFACES ====================

/**
 * Report Type
 * نوع البلاغ
 */
export type ReportType = 
  | 'spam_message'
  | 'inappropriate_listing'
  | 'fake_profile'
  | 'scam'
  | 'harassment'
  | 'fake_review'
  | 'inappropriate_image'
  | 'other';

/**
 * Report Status
 * حالة البلاغ
 */
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected';

/**
 * Report Interface
 * واجهة البلاغ
 */
export interface Report {
  id?: string;
  reporterFirebaseId: string;
  reporterNumericId: number;
  reportedUserFirebaseId: string;
  reportedUserNumericId: number;
  reportType: ReportType;
  contentType: 'message' | 'listing' | 'profile' | 'review' | 'image' | 'other';
  contentId?: string; // Message ID, Listing ID, etc.
  reason: string;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  reviewedAt?: any; // Firestore timestamp
  reviewedBy?: string; // Admin Firebase UID
}

/**
 * Report Result Interface
 * واجهة نتيجة البلاغ
 */
export interface ReportResult {
  success: boolean;
  reportId?: string;
  error?: string;
}

// ==================== SERVICE ====================

class ReportSpamService {
  private readonly COLLECTION = 'reports';

  /**
   * Create a report
   * إنشاء بلاغ
   */
  async createReport(
    reporterFirebaseId: string,
    reportedUserFirebaseId: string,
    reportType: ReportType,
    contentType: Report['contentType'],
    reason: string,
    description: string,
    contentId?: string
  ): Promise<ReportResult> {
    try {
      // Get numeric IDs
      const [reporterNumericId, reportedNumericId] = await Promise.all([
        getNumericIdByFirebaseUid(reporterFirebaseId),
        getNumericIdByFirebaseUid(reportedUserFirebaseId),
      ]);

      if (!reporterNumericId || !reportedNumericId) {
        throw new Error('Could not resolve numeric IDs for users');
      }

      // Prevent self-reporting
      if (reporterFirebaseId === reportedUserFirebaseId) {
        return {
          success: false,
          error: 'Cannot report yourself',
        };
      }

      // Create report document
      const reportData: Omit<Report, 'id'> = {
        reporterFirebaseId,
        reporterNumericId,
        reportedUserFirebaseId,
        reportedUserNumericId,
        reportType,
        contentType,
        contentId: contentId || undefined,
        reason: reason.trim(),
        description: description.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const reportRef = await addDoc(collection(db, this.COLLECTION), reportData);

      logger.info('Report created successfully', {
        reportId: reportRef.id,
        reporterNumericId,
        reportedNumericId,
        reportType,
        contentType,
      });

      // TODO: Send email notification to admins (Cloud Function)

      return {
        success: true,
        reportId: reportRef.id,
      };
    } catch (error) {
      logger.error('Failed to create report', error as Error, {
        reporterFirebaseId,
        reportedUserFirebaseId,
        reportType,
      });
      return {
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's reports
   * الحصول على بلاغات المستخدم
   */
  async getUserReports(reporterFirebaseId: string): Promise<Report[]> {
    try {
      const reporterNumericId = await getNumericIdByFirebaseUid(reporterFirebaseId);
      if (!reporterNumericId) {
        return [];
      }

      const q = query(
        collection(db, this.COLLECTION),
        where('reporterNumericId', '==', reporterNumericId)
      );

      const snapshot = await getDocs(q);
      const reports: Report[] = [];

      snapshot.docs.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as Report);
      });

      return reports;
    } catch (error) {
      logger.error('Failed to get user reports', error as Error, { reporterFirebaseId });
      return [];
    }
  }

  /**
   * Check if user has already reported
   * التحقق من وجود بلاغ سابق
   */
  async hasReported(
    reporterFirebaseId: string,
    reportedUserFirebaseId: string,
    contentType: Report['contentType'],
    contentId?: string
  ): Promise<boolean> {
    try {
      const [reporterNumericId, reportedNumericId] = await Promise.all([
        getNumericIdByFirebaseUid(reporterFirebaseId),
        getNumericIdByFirebaseUid(reportedUserFirebaseId),
      ]);

      if (!reporterNumericId || !reportedNumericId) {
        return false;
      }

      const q = query(
        collection(db, this.COLLECTION),
        where('reporterNumericId', '==', reporterNumericId),
        where('reportedUserNumericId', '==', reportedNumericId),
        where('contentType', '==', contentType),
        ...(contentId ? [where('contentId', '==', contentId)] : [])
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      logger.error('Failed to check if user has reported', error as Error, {
        reporterFirebaseId,
        reportedUserFirebaseId,
      });
      return false;
    }
  }
}

// Export singleton instance
export const reportSpamService = new ReportSpamService();
