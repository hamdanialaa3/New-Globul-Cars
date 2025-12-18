// functions/src/reviews/respondToReview.ts
// Cloud Function: Business response to review

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { RespondToReviewRequest } from './types';

const db = getFirestore();

/**
 * Respond to Review
 * 
 * Allows business owners to respond to reviews
 * Only the target user or team members can respond
 * 
 * @param reviewId - Review to respond to
 * @param responseText - Response text
 * 
 * @returns Success status
 */
export const respondToReview = onCall<RespondToReviewRequest>(async (request) => {
  const { reviewId, responseText } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  // 2. Validate inputs
  if (!reviewId || !responseText) {
    throw new HttpsError('invalid-argument', 'reviewId and responseText are required');
  }

  if (responseText.length < 10) {
    throw new HttpsError(
      'invalid-argument',
      'Response must be at least 10 characters long'
    );
  }

  if (responseText.length > 1000) {
    throw new HttpsError(
      'invalid-argument',
      'Response cannot exceed 1000 characters'
    );
  }

  logger.info('Responding to review', { reviewId, userId });

  try {
    // 3. Get review document
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      throw new HttpsError('not-found', 'Review not found');
    }

    const reviewData = reviewDoc.data();

    // 4. Check if review is published
    if (reviewData?.status !== 'published') {
      throw new HttpsError('permission-denied', 'Can only respond to published reviews');
    }

    // 5. Check if user is authorized to respond
    const isTargetUser = reviewData?.targetUserId === userId;
    const isTeamMember = await checkTeamMembership(userId, reviewData?.targetUserId);

    if (!isTargetUser && !isTeamMember) {
      throw new HttpsError(
        'permission-denied',
        'Only the business owner or team members can respond to reviews'
      );
    }

    // 6. Check if review already has a response
    if (reviewData?.response) {
      throw new HttpsError('already-exists', 'This review already has a response');
    }

    // 7. Get responder's name
    const userDoc = await db.collection('users').doc(userId).get();
    const userName = userDoc.data()?.displayName || 'Business Owner';

    // 8. Add response to review
    await reviewRef.update({
      response: {
        text: responseText,
        respondedBy: userId,
        respondedByName: userName,
        respondedAt: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Response added to review', { reviewId, respondedBy: userId });

    // 9. Notify reviewer
    await db.collection('notifications').add({
      userId: reviewData?.reviewerId,
      type: 'review_response',
      title: 'Response to Your Review',
      message: `${reviewData?.targetUserName} responded to your review`,
      data: {
        reviewId,
        targetUserId: reviewData?.targetUserId,
        responseText: responseText.substring(0, 100),
      },
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 10. Log activity
    await db.collection('activityLog').add({
      type: 'review_response',
      userId,
      reviewId,
      targetUserId: reviewData?.targetUserId,
      reviewerId: reviewData?.reviewerId,
      timestamp: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Response added successfully',
    };

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to respond to review', { error: err.message });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to respond to review: ${err.message}`);
  }
});

/**
 * Update Review Response
 * 
 * Allows editing existing response
 */
export const updateReviewResponse = onCall<RespondToReviewRequest>(async (request) => {
  const { reviewId, responseText } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  // 2. Validate inputs
  if (!reviewId || !responseText) {
    throw new HttpsError('invalid-argument', 'reviewId and responseText are required');
  }

  if (responseText.length < 10 || responseText.length > 1000) {
    throw new HttpsError('invalid-argument', 'Response must be 10-1000 characters');
  }

  logger.info('Updating review response', { reviewId, userId });

  try {
    // 3. Get review document
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      throw new HttpsError('not-found', 'Review not found');
    }

    const reviewData = reviewDoc.data();

    // 4. Check if review has a response
    if (!reviewData?.response) {
      throw new HttpsError('not-found', 'This review does not have a response yet');
    }

    // 5. Check if user is the original responder or business owner
    const isOriginalResponder = reviewData.response.respondedBy === userId;
    const isTargetUser = reviewData.targetUserId === userId;
    const isTeamMember = await checkTeamMembership(userId, reviewData.targetUserId);

    if (!isOriginalResponder && !isTargetUser && !isTeamMember) {
      throw new HttpsError('permission-denied', 'Not authorized to edit this response');
    }

    // 6. Update response
    await reviewRef.update({
      'response.text': responseText,
      'response.editedAt': FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Review response updated', { reviewId, userId });

    return {
      success: true,
      message: 'Response updated successfully',
    };

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to update review response', { error: err.message });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to update response: ${err.message}`);
  }
});

/**
 * Delete Review Response
 * 
 * Removes response from review
 */
export const deleteReviewResponse = onCall<{ reviewId: string }>(async (request) => {
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

  logger.info('Deleting review response', { reviewId, userId });

  try {
    // 3. Get review document
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      throw new HttpsError('not-found', 'Review not found');
    }

    const reviewData = reviewDoc.data();

    // 4. Check if review has a response
    if (!reviewData?.response) {
      throw new HttpsError('not-found', 'This review does not have a response');
    }

    // 5. Check if user is authorized
    const isOriginalResponder = reviewData.response.respondedBy === userId;
    const isTargetUser = reviewData.targetUserId === userId;
    const isTeamMember = await checkTeamMembership(userId, reviewData.targetUserId);

    if (!isOriginalResponder && !isTargetUser && !isTeamMember) {
      throw new HttpsError('permission-denied', 'Not authorized to delete this response');
    }

    // 6. Delete response
    await reviewRef.update({
      response: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Review response deleted', { reviewId, userId });

    return {
      success: true,
      message: 'Response deleted successfully',
    };

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to delete review response', { error: err.message });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to delete response: ${err.message}`);
  }
});

/**
 * Check if user is a team member of the business
 */
async function checkTeamMembership(userId: string, businessUserId: string): Promise<boolean> {
  try {
    const teamMemberDoc = await db
      .collection('users')
      .doc(businessUserId)
      .collection('team')
      .doc(userId)
      .get();

    if (!teamMemberDoc.exists) {
      return false;
    }

    const memberData = teamMemberDoc.data();
    
    // Check if member has permission to respond to reviews
    return memberData?.permissions?.canRespondToReviews === true || 
           memberData?.role === 'admin' || 
           memberData?.role === 'manager';

  } catch (error) {
    logger.error('Failed to check team membership', error);
    return false;
  }
}
