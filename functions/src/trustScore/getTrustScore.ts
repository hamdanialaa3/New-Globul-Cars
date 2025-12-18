// functions/src/trustScore/getTrustScore.ts
// Cloud Function: Get Trust Score for User

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { calculateTrustScore, getTrustBadge } from './calculateScore';

const db = getFirestore();

/**
 * Get Trust Score
 * 
 * Returns cached trust score or recalculates if outdated
 * 
 * @param userId - User ID to get score for (optional, defaults to caller)
 * @returns Trust score with breakdown and badge info
 */
export const getTrustScore = onCall<{ userId?: string }>(async (request) => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const requesterId = request.auth.uid;
  const targetUserId = request.data.userId || requesterId;

  logger.info('Getting trust score', { requesterId, targetUserId });

  try {
    // 2. Check if cached score exists and is recent (< 24 hours old)
    const trustScoreDoc = await db.collection('trustScores').doc(targetUserId).get();

    if (trustScoreDoc.exists) {
      const cachedScore = trustScoreDoc.data()!;
      const lastCalculated = cachedScore.lastCalculated.toDate();
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - lastCalculated.getTime()) / (1000 * 60 * 60);

      // Use cached if less than 24 hours old
      if (hoursSinceUpdate < 24) {
        logger.info('Using cached trust score', {
          targetUserId,
          score: cachedScore.score,
          hoursSinceUpdate: Math.round(hoursSinceUpdate),
        });

        return {
          success: true,
          ...cachedScore,
          badge: getTrustBadge(cachedScore.level),
          cached: true,
        };
      }
    }

    // 3. Calculate new score
    const scoreResult = await calculateTrustScore(targetUserId);

    // 4. Save to Firestore
    await db.collection('trustScores').doc(targetUserId).set({
      ...scoreResult,
      lastCalculated: FieldValue.serverTimestamp(),
    });

    // 5. Update user document
    await db.collection('users').doc(targetUserId).update({
      trustScore: scoreResult.score,
      trustLevel: scoreResult.level,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Trust score calculated and saved', {
      targetUserId,
      score: scoreResult.score,
      level: scoreResult.level,
    });

    return {
      success: true,
      ...scoreResult,
      badge: getTrustBadge(scoreResult.level),
      cached: false,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to get trust score', { targetUserId, error: err.message });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to get trust score: ${err.message}`);
  }
});

/**
 * Recalculate Trust Score (Force)
 * 
 * Admin function to force recalculation
 */
export const recalculateTrustScore = onCall<{ userId: string }>(async (request) => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId } = request.data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId is required');
  }

  // 2. Check admin permissions
  const adminDoc = await db.collection('admins').doc(request.auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }

  logger.info('Force recalculating trust score', { userId, adminId: request.auth.uid });

  try {
    // Calculate score
    const scoreResult = await calculateTrustScore(userId);

    // Save to Firestore
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

    logger.info('Trust score force recalculated', {
      userId,
      score: scoreResult.score,
      level: scoreResult.level,
    });

    return {
      success: true,
      ...scoreResult,
      badge: getTrustBadge(scoreResult.level),
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to recalculate trust score', { userId, error: err.message });
    throw new HttpsError('internal', `Failed to recalculate trust score: ${err.message}`);
  }
});
