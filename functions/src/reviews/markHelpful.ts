// functions/src/reviews/markHelpful.ts
// Cloud Function: Mark review as helpful

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { MarkHelpfulRequest } from './types';

const db = getFirestore();

/**
 * Mark Review as Helpful
 * 
 * Allows users to mark reviews as helpful
 * Prevents duplicate marks from same user
 * 
 * @param reviewId - Review to mark as helpful
 * 
 * @returns Success status and updated helpful count
 */
export const markHelpful = onCall<MarkHelpfulRequest>(async (request) => {
  const { reviewId } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  // 2. Validate inputs
  if (!reviewId) {
    throw new HttpsError('invalid-argument', 'reviewId is required');
  }

  logger.info('Marking review as helpful', { reviewId, userId });

  try {
    // 3. Get review document
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      throw new HttpsError('not-found', 'Review not found');
    }

    const reviewData = reviewDoc.data();

    // 4. Check if user already marked this review as helpful
    const helpfulMarksSnapshot = await db
      .collection('reviews')
      .doc(reviewId)
      .collection('helpfulMarks')
      .doc(userId)
      .get();

    if (helpfulMarksSnapshot.exists) {
      throw new HttpsError('already-exists', 'You already marked this review as helpful');
    }

    // 5. Prevent marking own reviews as helpful
    if (reviewData?.reviewerId === userId) {
      throw new HttpsError('permission-denied', 'Cannot mark your own review as helpful');
    }

    // 6. Add helpful mark
    await db
      .collection('reviews')
      .doc(reviewId)
      .collection('helpfulMarks')
      .doc(userId)
      .set({
        userId,
        markedAt: FieldValue.serverTimestamp(),
      });

    // 7. Increment helpful count
    await reviewRef.update({
      helpfulCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await reviewRef.get();
    const newHelpfulCount = updatedDoc.data()?.helpfulCount || 0;

    logger.info('Review marked as helpful', { reviewId, newHelpfulCount });

    return {
      success: true,
      helpfulCount: newHelpfulCount,
      message: 'Review marked as helpful',
    };

  } catch (error: any) {
    logger.error('Failed to mark review as helpful', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to mark review as helpful: ${error.message}`);
  }
});

/**
 * Unmark Review as Helpful
 * 
 * Allows users to remove their helpful mark
 */
export const unmarkHelpful = onCall<MarkHelpfulRequest>(async (request) => {
  const { reviewId } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  // 2. Validate inputs
  if (!reviewId) {
    throw new HttpsError('invalid-argument', 'reviewId is required');
  }

  logger.info('Unmarking review as helpful', { reviewId, userId });

  try {
    // 3. Get review document
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      throw new HttpsError('not-found', 'Review not found');
    }

    // 4. Check if user marked this review as helpful
    const helpfulMarkRef = db
      .collection('reviews')
      .doc(reviewId)
      .collection('helpfulMarks')
      .doc(userId);

    const helpfulMarkDoc = await helpfulMarkRef.get();

    if (!helpfulMarkDoc.exists) {
      throw new HttpsError('not-found', 'You have not marked this review as helpful');
    }

    // 5. Remove helpful mark
    await helpfulMarkRef.delete();

    // 6. Decrement helpful count
    await reviewRef.update({
      helpfulCount: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await reviewRef.get();
    const newHelpfulCount = updatedDoc.data()?.helpfulCount || 0;

    logger.info('Review unmarked as helpful', { reviewId, newHelpfulCount });

    return {
      success: true,
      helpfulCount: newHelpfulCount,
      message: 'Helpful mark removed',
    };

  } catch (error: any) {
    logger.error('Failed to unmark review as helpful', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to unmark review: ${error.message}`);
  }
});
