/**
 * Numeric ID Assignment Service
 * Automatically assigns numeric IDs to users who don't have one
 */

import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from './logger-service';

/**
 * Ensure user has a numeric ID, assign one if missing
 * Uses a single atomic transaction for both Counter and User documents
 * to prevent race conditions (e.g. double ID assignment).
 * 
 * @param uid Firebase UID
 * @returns The user's numeric ID (existing or newly assigned)
 */
export const ensureUserNumericId = async (uid: string): Promise<number | null> => {
  if (!uid || typeof uid !== 'string') {
    logger.warn('Invalid UID provided to ensureUserNumericId', { uid });
    return null;
  }

  const userRef = doc(db, 'users', uid);
  const counterRef = doc(db, 'counters', 'users');

  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const numericId = await runTransaction(db, async (transaction) => {
        // 1. Read User Doc
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          // If we are on the last attempt, throw
          if (attempt === MAX_RETRIES) {
            throw new Error('User document does not exist after retries');
          }
          // Otherwise, throw a specific error to catch and retry outside transaction
          // (Though runTransaction retries automatically for contention, it doesn't wait for existence.
          //  Actually, we can just return null and retry outside, or throw to abort transaction).
          throw new Error('RETRY_NEEDED');
        }

        const userData = userDoc.data();

        // 2. Check if already has ID (Idempotency)
        if (userData.numericId && typeof userData.numericId === 'number') {
          return userData.numericId;
        }

        // 3. Read Counter Doc
        const counterDoc = await transaction.get(counterRef);
        let currentCount = 0;
        if (counterDoc.exists()) {
          currentCount = counterDoc.data()?.count || 0;
        }

        // 4. Increment
        const nextId = currentCount + 1;

        // 5. Update both documents atomically
        transaction.set(counterRef, { count: nextId, updatedAt: new Date() }, { merge: true });
        transaction.update(userRef, {
          numericId: nextId,
          numericIdAssignedAt: new Date(),
          updatedAt: new Date()
        });

        return nextId;
      });

      if (numericId) {
        return numericId;
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage === 'RETRY_NEEDED') {
        logger.debug(`ensureUserNumericId: User doc not found, retrying attempt ${attempt}/${MAX_RETRIES}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        continue;
      }
      // Real error
      logger.error('Failed to ensure user numeric ID (Transaction)', error as Error, { uid });
      return null;
    }
  }
  return null;
};

/**
 * Get user's numeric ID if it exists
 * @param uid Firebase UID
 * @returns The user's numeric ID or null
 */
export const getUserNumericId = async (uid: string): Promise<number | null> => {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') return null;

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const numericId = snap.data()?.numericId;
    return typeof numericId === 'number' ? numericId : null;
  } catch (error) {
    logger.error('Failed to get user numeric ID', error as Error, { uid });
    return null;
  }
};
