/**
 * Server-side Rate Limiter for Cloud Functions
 *
 * Uses Firestore-based sliding window to enforce per-user rate limits.
 * Applied to AI functions and other expensive operations.
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

const db = admin.firestore();

interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  ai: { maxRequests: 10, windowSeconds: 60 },
  search: { maxRequests: 30, windowSeconds: 60 },
  messaging: { maxRequests: 60, windowSeconds: 60 },
};

/**
 * Check and enforce rate limit for a given user and operation type.
 *
 * @param userId - Firebase Auth UID
 * @param operationType - Key from DEFAULT_CONFIGS (e.g. 'ai', 'search')
 * @throws functions.https.HttpsError with 'resource-exhausted' if rate limit exceeded
 */
export async function enforceRateLimit(
  userId: string,
  operationType: string
): Promise<void> {
  const config = DEFAULT_CONFIGS[operationType] || DEFAULT_CONFIGS['ai'];
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  const docRef = db.collection('rate_limits').doc(`${userId}_${operationType}`);

  await db.runTransaction(async tx => {
    const doc = await tx.get(docRef);
    const data = doc.data();

    // Filter timestamps within the sliding window
    const timestamps: number[] = (data?.timestamps || []).filter(
      (ts: number) => ts > windowStart
    );

    if (timestamps.length >= config.maxRequests) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Rate limit exceeded: max ${config.maxRequests} requests per ${config.windowSeconds}s for ${operationType}.`
      );
    }

    timestamps.push(now);

    tx.set(docRef, {
      userId,
      operationType,
      timestamps,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
}
