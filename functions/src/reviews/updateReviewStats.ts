// functions/src/reviews/updateReviewStats.ts
// Firestore Trigger: Update review statistics when review status changes

import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const db = getFirestore();

/**
 * Update Review Stats Trigger
 * 
 * Automatically recalculates review statistics when:
 * - New review is created
 * - Review status changes (pending → published)
 * - Review is updated (rating changed)
 * - Review is deleted/removed
 * 
 * Updates the reviewStats/{userId} document
 */
export const updateReviewStatsOnWrite = onDocumentWritten(
  'reviews/{reviewId}',
  async (event) => {
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();

    // If document was deleted
    if (!afterData) {
      if (beforeData?.targetUserId) {
        logger.info('Review deleted, updating stats', { 
          targetUserId: beforeData.targetUserId 
        });
        await recalculateStats(beforeData.targetUserId);
      }
      return;
    }

    const targetUserId = afterData.targetUserId;

    if (!targetUserId) {
      logger.warn('Review missing targetUserId', { reviewId: event.params.reviewId });
      return;
    }

    // Check if status changed to/from published
    const beforeStatus = beforeData?.status;
    const afterStatus = afterData.status;

    const statusChanged = beforeStatus !== afterStatus;
    const isNowPublished = afterStatus === 'published';
    const wasPublished = beforeStatus === 'published';

    // Check if rating changed
    const ratingChanged = beforeData?.overallRating !== afterData.overallRating;

    // Recalculate if:
    // 1. Status changed to or from published
    // 2. Rating changed on a published review
    if ((statusChanged && (isNowPublished || wasPublished)) || 
        (ratingChanged && isNowPublished)) {
      logger.info('Review updated, recalculating stats', { 
        targetUserId, 
        statusChanged, 
        ratingChanged 
      });
      await recalculateStats(targetUserId);
    }
  }
);

/**
 * Recalculate Review Statistics
 * 
 * Aggregates all published reviews for a user
 * Updates reviewStats document with current data
 */
async function recalculateStats(userId: string) {
  try {
    // Get all published reviews for this user
    const reviewsSnapshot = await db
      .collection('reviews')
      .where('targetUserId', '==', userId)
      .where('status', '==', 'published')
      .get();

    if (reviewsSnapshot.empty) {
      // No published reviews - set stats to zero
      await db.collection('reviewStats').doc(userId).set({
        userId,
        totalReviews: 0,
        averageRating: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0,
        avgCommunication: 0,
        avgAccuracy: 0,
        avgProfessionalism: 0,
        avgValueForMoney: 0,
        avgResponseTime: 0,
        publishedReviews: 0,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      logger.info('No published reviews, stats reset to zero', { userId });
      return;
    }

    // Initialize counters
    let totalRating = 0;
    let fiveStars = 0;
    let fourStars = 0;
    let threeStars = 0;
    let twoStars = 0;
    let oneStar = 0;

    let totalCommunication = 0;
    let totalAccuracy = 0;
    let totalProfessionalism = 0;
    let totalValueForMoney = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    // Aggregate all reviews
    reviewsSnapshot.forEach((doc) => {
      const review = doc.data();
      const rating = review.overallRating || 0;

      totalRating += rating;

      // Count star distribution
      if (rating === 5) fiveStars++;
      else if (rating >= 4) fourStars++;
      else if (rating >= 3) threeStars++;
      else if (rating >= 2) twoStars++;
      else if (rating >= 1) oneStar++;

      // Sum category ratings
      const categoryRatings = review.categoryRatings || {};
      totalCommunication += categoryRatings.communication || 0;
      totalAccuracy += categoryRatings.accuracy || 0;
      totalProfessionalism += categoryRatings.professionalism || 0;
      totalValueForMoney += categoryRatings.valueForMoney || 0;

      if (categoryRatings.responseTime) {
        totalResponseTime += categoryRatings.responseTime;
        responseTimeCount++;
      }
    });

    const totalReviews = reviewsSnapshot.size;
    const averageRating = totalRating / totalReviews;

    // Calculate category averages
    const avgCommunication = totalCommunication / totalReviews;
    const avgAccuracy = totalAccuracy / totalReviews;
    const avgProfessionalism = totalProfessionalism / totalReviews;
    const avgValueForMoney = totalValueForMoney / totalReviews;
    const avgResponseTime = responseTimeCount > 0 
      ? totalResponseTime / responseTimeCount 
      : 0;

    // Update stats document
    await db.collection('reviewStats').doc(userId).set({
      userId,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      fiveStars,
      fourStars,
      threeStars,
      twoStars,
      oneStar,
      avgCommunication: Math.round(avgCommunication * 10) / 10,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      avgProfessionalism: Math.round(avgProfessionalism * 10) / 10,
      avgValueForMoney: Math.round(avgValueForMoney * 10) / 10,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      publishedReviews: totalReviews,
      lastUpdated: FieldValue.serverTimestamp(),
    });

    // Update user document with average rating (for quick access)
    await db.collection('users').doc(userId).update({
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Review stats recalculated', { 
      userId, 
      totalReviews, 
      averageRating: Math.round(averageRating * 10) / 10 
    });

  } catch (error) {
    logger.error('Failed to recalculate review stats', { userId, error });
    throw error;
  }
}

/**
 * Calculate Star Distribution Percentage
 * 
 * Helper function to calculate percentage distribution
 */
function calculateStarDistribution(
  fiveStars: number,
  fourStars: number,
  threeStars: number,
  twoStars: number,
  oneStar: number
) {
  const total = fiveStars + fourStars + threeStars + twoStars + oneStar;

  if (total === 0) {
    return {
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    };
  }

  return {
    fiveStar: Math.round((fiveStars / total) * 100),
    fourStar: Math.round((fourStars / total) * 100),
    threeStar: Math.round((threeStars / total) * 100),
    twoStar: Math.round((twoStars / total) * 100),
    oneStar: Math.round((oneStar / total) * 100),
  };
}
