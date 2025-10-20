// functions/src/trustScore/onScoreUpdate.ts
// Firestore Triggers: Auto-update trust scores when data changes

import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { calculateTrustScore } from './calculateScore';

const db = getFirestore();

/**
 * Update Trust Score on Review Stats Change
 * 
 * Triggers when reviewStats/{userId} is updated
 */
export const onReviewStatsUpdated = onDocumentWritten(
  'reviewStats/{userId}',
  async (event) => {
    const userId = event.params.userId;

    logger.info('Review stats updated, recalculating trust score', { userId });

    try {
      await recalculateAndSave(userId);
    } catch (error) {
      logger.error('Failed to update trust score on review stats change', { userId, error });
    }
  }
);

/**
 * Update Trust Score on Verification Status Change
 * 
 * Triggers when user verification status changes
 */
export const onVerificationUpdated = onDocumentWritten(
  'users/{userId}',
  async (event) => {
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();

    // Only trigger if verification status changed
    const verificationChanged = beforeData?.isVerified !== afterData?.isVerified;

    if (!verificationChanged) {
      return;
    }

    const userId = event.params.userId;

    logger.info('Verification status changed, recalculating trust score', {
      userId,
      isVerified: afterData?.isVerified,
    });

    try {
      await recalculateAndSave(userId);
    } catch (error) {
      logger.error('Failed to update trust score on verification change', { userId, error });
    }
  }
);

/**
 * Update Trust Score on Listing Change
 * 
 * Triggers when listings are created/updated/deleted
 */
export const onListingChanged = onDocumentWritten(
  'cars/{listingId}',
  async (event) => {
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();

    // Get seller ID (from before or after)
    const sellerId = afterData?.sellerId || beforeData?.sellerId;

    if (!sellerId) {
      return;
    }

    // Only trigger if listing status, premium status, or significant fields changed
    const statusChanged = beforeData?.status !== afterData?.status;
    const premiumChanged = beforeData?.isPremium !== afterData?.isPremium;
    const significantChange = statusChanged || premiumChanged || !beforeData || !afterData;

    if (!significantChange) {
      return;
    }

    logger.info('Listing changed, recalculating trust score', { sellerId });

    try {
      await recalculateAndSave(sellerId);
    } catch (error) {
      logger.error('Failed to update trust score on listing change', { sellerId, error });
    }
  }
);

/**
 * Update Trust Score on Analytics Change
 * 
 * Triggers when user analytics are updated (response rate)
 */
export const onAnalyticsUpdated = onDocumentWritten(
  'userAnalytics/{userId}',
  async (event) => {
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();

    // Only trigger if response rate changed significantly (> 5%)
    const beforeRate = beforeData?.inquiryResponseRate || 0;
    const afterRate = afterData?.inquiryResponseRate || 0;
    const rateChangedSignificantly = Math.abs(afterRate - beforeRate) > 0.05;

    if (!rateChangedSignificantly) {
      return;
    }

    const userId = event.params.userId;

    logger.info('Response rate changed, recalculating trust score', {
      userId,
      beforeRate,
      afterRate,
    });

    try {
      await recalculateAndSave(userId);
    } catch (error) {
      logger.error('Failed to update trust score on analytics change', { userId, error });
    }
  }
);

/**
 * Helper: Recalculate and save trust score
 */
async function recalculateAndSave(userId: string) {
  try {
    // Calculate new score
    const scoreResult = await calculateTrustScore(userId);

    // Save to trustScores collection
    await db.collection('trustScores').doc(userId).set({
      ...scoreResult,
      lastCalculated: FieldValue.serverTimestamp(),
    });

    // Update user document
    await db.collection('users').doc(userId).update({
      trustScore: scoreResult.score,
      trustLevel: scoreResult.level,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Trust score recalculated and saved', {
      userId,
      score: scoreResult.score,
      level: scoreResult.level,
    });
  } catch (error) {
    logger.error('Failed to recalculate trust score', { userId, error });
    throw error;
  }
}
