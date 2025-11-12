// functions/src/reviews/reportReview.ts
// Cloud Function: Report inappropriate review

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { ReportReviewRequest } from './types';

const db = getFirestore();

// Report threshold before auto-flagging
const AUTO_FLAG_THRESHOLD = 3;

/**
 * Report Review
 * 
 * Allows users to report inappropriate reviews
 * Auto-flags review if report threshold exceeded
 * 
 * @param reviewId - Review to report
 * @param reason - Reason for reporting
 * 
 * @returns Success status
 */
export const reportReview = onCall<ReportReviewRequest>(async (request) => {
  const { reviewId, reason } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  // 2. Validate inputs
  if (!reviewId || !reason) {
    throw new HttpsError('invalid-argument', 'reviewId and reason are required');
  }

  if (reason.length < 10) {
    throw new HttpsError(
      'invalid-argument',
      'Report reason must be at least 10 characters'
    );
  }

  logger.info('Reporting review', { reviewId, userId, reason });

  try {
    // 3. Get review document
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      throw new HttpsError('not-found', 'Review not found');
    }

    const reviewData = reviewDoc.data();

    // 4. Check if user already reported this review
    const reportsSnapshot = await db
      .collection('reviews')
      .doc(reviewId)
      .collection('reports')
      .doc(userId)
      .get();

    if (reportsSnapshot.exists) {
      throw new HttpsError('already-exists', 'You have already reported this review');
    }

    // 5. Add report
    await db
      .collection('reviews')
      .doc(reviewId)
      .collection('reports')
      .doc(userId)
      .set({
        userId,
        reason,
        reportedAt: FieldValue.serverTimestamp(),
      });

    // 6. Increment report count
    await reviewRef.update({
      reportCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await reviewRef.get();
    const newReportCount = updatedDoc.data()?.reportCount || 0;

    logger.info('Review reported', { reviewId, newReportCount });

    // 7. Auto-flag if threshold exceeded
    if (newReportCount >= AUTO_FLAG_THRESHOLD) {
      await reviewRef.update({
        status: 'flagged',
        flaggedAt: FieldValue.serverTimestamp(),
        flaggedReason: 'Exceeded report threshold',
      });

      logger.warn('Review auto-flagged', { reviewId, reportCount: newReportCount });

      // 8. Notify admins
      await notifyAdminsReviewFlagged(reviewId, reviewData, newReportCount);
    }

    return {
      success: true,
      message: 'Review reported successfully',
    };

  } catch (error: any) {
    logger.error('Failed to report review', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to report review: ${error.message}`);
  }
});

/**
 * Notify admins that a review has been auto-flagged
 */
async function notifyAdminsReviewFlagged(
  reviewId: string,
  reviewData: any,
  reportCount: number
) {
  try {
    // Get all admin users
    const adminsSnapshot = await db.collection('admins').get();

    if (adminsSnapshot.empty) {
      logger.warn('No admins found to notify');
      return;
    }

    // Create notifications for all admins
    const notificationPromises = adminsSnapshot.docs.map((adminDoc) => {
      return db.collection('notifications').add({
        userId: adminDoc.id,
        type: 'review_flagged',
        title: '⚠️ Review Auto-Flagged',
        message: `A review by ${reviewData?.reviewerName} has been flagged after ${reportCount} reports`,
        data: {
          reviewId,
          reviewerId: reviewData?.reviewerId,
          targetUserId: reviewData?.targetUserId,
          reportCount,
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    await Promise.all(notificationPromises);

    // Send email to admins (optional)
    await sendAdminFlagEmail(reviewId, reviewData, reportCount);

    logger.info('Admins notified of flagged review', { reviewId, adminCount: adminsSnapshot.size });

  } catch (error) {
    logger.error('Failed to notify admins', error);
  }
}

/**
 * Send email to admins about flagged review
 */
async function sendAdminFlagEmail(
  reviewId: string,
  reviewData: any,
  reportCount: number
) {
  try {
    await db.collection('mail').add({
      to: ['admin@mobilebg.eu'], // Replace with actual admin email
      template: {
        name: 'review-flagged',
        data: {
          reviewId,
          reviewerName: reviewData?.reviewerName,
          targetUserName: reviewData?.targetUserName,
          rating: reviewData?.overallRating,
          comment: reviewData?.comment,
          reportCount,
          adminUrl: `https://mobilebg.eu/admin/reviews/${reviewId}`,
        },
      },
    });

    logger.info('Admin flag email queued', { reviewId });

  } catch (error) {
    logger.error('Failed to send admin email', error);
  }
}
