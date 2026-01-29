/**
 * User Reporting Service
 * ======================
 * Report abusive users and content
 * 
 * @gpt-suggestion Phase 5.2 - User reporting feature
 * @author Implementation - January 14, 2026
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import { logger } from '@/services/logger-service';

/**
 * Report categories
 */
export type ReportCategory =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'scam'
  | 'fake_listing'
  | 'other';

/**
 * Report status
 */
export type ReportStatus =
  | 'pending'
  | 'under_review'
  | 'resolved'
  | 'dismissed';

/**
 * User report interface
 */
export interface UserReport {
  id: string;
  reporterNumericId: number;
  reporterFirebaseId: string;
  reportedNumericId: number;
  reportedFirebaseId: string;
  category: ReportCategory;
  description: string;
  channelId?: string;
  messageId?: string;
  carId?: number;
  evidence?: {
    screenshots?: string[];
    messageContent?: string;
  };
  status: ReportStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
}

/**
 * Report user for abuse
 * 
 * @param reporterNumericId Reporter's numeric ID
 * @param reporterFirebaseId Reporter's Firebase UID
 * @param reportedNumericId Reported user's numeric ID
 * @param reportedFirebaseId Reported user's Firebase UID
 * @param category Report category
 * @param description Detailed description
 * @param context Optional context (channel, message, car)
 * @returns Report ID
 */
export async function reportUser(
  reporterNumericId: number,
  reporterFirebaseId: string,
  reportedNumericId: number,
  reportedFirebaseId: string,
  category: ReportCategory,
  description: string,
  context?: {
    channelId?: string;
    messageId?: string;
    carId?: number;
    screenshots?: string[];
    messageContent?: string;
  }
): Promise<string> {
  if (!reporterNumericId || !reportedNumericId || !description) {
    throw new Error('Invalid parameters for reportUser');
  }
  
  // Prevent self-reporting
  if (reporterNumericId === reportedNumericId) {
    throw new Error('INVALID_REPORT: Cannot report yourself');
  }
  
  try {
    // Check for duplicate reports (same reporter + reported + category within 24h)
    const recentReportsQuery = query(
      collection(db, 'reports'),
      where('reporterNumericId', '==', reporterNumericId),
      where('reportedNumericId', '==', reportedNumericId),
      where('category', '==', category),
      where('createdAt', '>', Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000)),
      limit(1)
    );
    
    const recentReports = await getDocs(recentReportsQuery);
    
    if (!recentReports.empty) {
      throw new Error('DUPLICATE_REPORT: You already reported this user for this reason today');
    }
    
    // Create report document
    const reportRef = doc(collection(db, 'reports'));
    const reportId = reportRef.id;
    
    const report: Omit<UserReport, 'id'> = {
      reporterNumericId,
      reporterFirebaseId,
      reportedNumericId,
      reportedFirebaseId,
      category,
      description,
      channelId: context?.channelId,
      messageId: context?.messageId,
      carId: context?.carId,
      evidence: {
        screenshots: context?.screenshots,
        messageContent: context?.messageContent
      },
      status: 'pending',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };
    
    await setDoc(reportRef, report);
    
    // Increment report counter for reported user
    const userStatsRef = doc(db, 'user_stats', reportedFirebaseId);
    await updateDoc(userStatsRef, {
      reportsReceived: increment(1),
      [`reportsByCategory.${category}`]: increment(1)
    }).catch(async () => {
      // Create if doesn't exist
      await setDoc(userStatsRef, {
        reportsReceived: 1,
        reportsByCategory: { [category]: 1 }
      }, { merge: true });
    });
    
    logger.info('[UserReport] User reported', {
      reportId,
      reporter: reporterNumericId,
      reported: reportedNumericId,
      category
    });
    
    return reportId;
    
  } catch (error) {
    logger.error('[UserReport] Failed to report user', error as Error, {
      reporter: reporterNumericId,
      reported: reportedNumericId,
      category
    });
    throw error;
  }
}

/**
 * Get report by ID
 * 
 * @param reportId The report ID
 * @returns Report data or null
 */
export async function getReport(reportId: string): Promise<UserReport | null> {
  try {
    const reportRef = doc(db, 'reports', reportId);
    const snapshot = await getDoc(reportRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return { id: snapshot.id, ...snapshot.data() } as UserReport;
    
  } catch (error) {
    logger.error('[UserReport] Failed to get report', error as Error, { reportId });
    return null;
  }
}

/**
 * Get reports against a user (admin only)
 * 
 * @param reportedNumericId The reported user's numeric ID
 * @param maxResults Maximum results to return
 * @returns Array of reports
 */
export async function getReportsAgainstUser(
  reportedNumericId: number,
  maxResults: number = 20
): Promise<UserReport[]> {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('reportedNumericId', '==', reportedNumericId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(reportsQuery);
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as UserReport[];
    
  } catch (error) {
    logger.error('[UserReport] Failed to get reports against user', error as Error, {
      reportedNumericId
    });
    return [];
  }
}

/**
 * Get pending reports (admin only)
 * 
 * @param maxResults Maximum results
 * @returns Pending reports
 */
export async function getPendingReports(maxResults: number = 50): Promise<UserReport[]> {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(reportsQuery);
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as UserReport[];
    
  } catch (error) {
    logger.error('[UserReport] Failed to get pending reports', error as Error);
    return [];
  }
}

/**
 * Update report status (admin only)
 * 
 * @param reportId The report ID
 * @param status New status
 * @param reviewerFirebaseId Reviewer's Firebase UID
 * @param reviewNotes Optional review notes
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  reviewerFirebaseId: string,
  reviewNotes?: string
): Promise<void> {
  try {
    const reportRef = doc(db, 'reports', reportId);
    
    await updateDoc(reportRef, {
      status,
      reviewedBy: reviewerFirebaseId,
      reviewedAt: serverTimestamp(),
      reviewNotes: reviewNotes || null,
      updatedAt: serverTimestamp()
    });
    
    logger.info('[UserReport] Report status updated', {
      reportId,
      status,
      reviewer: reviewerFirebaseId
    });
    
  } catch (error) {
    logger.error('[UserReport] Failed to update report status', error as Error, {
      reportId,
      status
    });
    throw error;
  }
}

/**
 * Get report statistics for a user
 * 
 * @param userNumericId The user's numeric ID
 * @returns Report statistics
 */
export async function getUserReportStats(userNumericId: number): Promise<{
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  reportsByCategory: Record<ReportCategory, number>;
}> {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('reportedNumericId', '==', userNumericId)
    );
    
    const snapshot = await getDocs(reportsQuery);
    
    const stats = {
      totalReports: snapshot.size,
      pendingReports: 0,
      resolvedReports: 0,
      reportsByCategory: {
        spam: 0,
        harassment: 0,
        inappropriate_content: 0,
        scam: 0,
        fake_listing: 0,
        other: 0
      } as Record<ReportCategory, number>
    };
    
    snapshot.docs.forEach(doc => {
      const report = doc.data() as UserReport;
      
      if (report.status === 'pending' || report.status === 'under_review') {
        stats.pendingReports++;
      } else if (report.status === 'resolved') {
        stats.resolvedReports++;
      }
      
      stats.reportsByCategory[report.category]++;
    });
    
    return stats;
    
  } catch (error) {
    logger.error('[UserReport] Failed to get user report stats', error as Error, {
      userNumericId
    });
    throw error;
  }
}

/**
 * Check if user should be auto-flagged (too many reports)
 * 
 * @param userNumericId The user's numeric ID
 * @returns True if user should be flagged
 */
export async function shouldAutoFlagUser(userNumericId: number): Promise<boolean> {
  try {
    const stats = await getUserReportStats(userNumericId);
    
    // Auto-flag thresholds
    const TOTAL_THRESHOLD = 10; // 10+ total reports
    const PENDING_THRESHOLD = 5; // 5+ pending reports
    const HARASSMENT_THRESHOLD = 3; // 3+ harassment reports
    
    return (
      stats.totalReports >= TOTAL_THRESHOLD ||
      stats.pendingReports >= PENDING_THRESHOLD ||
      stats.reportsByCategory.harassment >= HARASSMENT_THRESHOLD
    );
    
  } catch (error) {
    logger.error('[UserReport] Failed to check auto-flag status', error as Error, {
      userNumericId
    });
    return false;
  }
}

export default {
  reportUser,
  getReport,
  getReportsAgainstUser,
  getPendingReports,
  updateReportStatus,
  getUserReportStats,
  shouldAutoFlagUser
};
