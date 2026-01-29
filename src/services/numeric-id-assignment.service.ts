/**
 * ⚠️ DEPRECATED: Numeric ID Assignment Service (Client-Side)
 * 
 * MIGRATION STATUS: Backend trigger now handles numeric ID assignment
 * See: functions/src/triggers/onUserCreate.ts
 * 
 * This service is kept ONLY for:
 * 1. Reading existing numeric IDs (getUserNumericId)
 * 2. Emergency fallback for users created before backend migration
 * 
 * DO NOT USE ensureUserNumericId in new code - it will fail due to:
 * - Firestore rules blocking client writes to counters
 * - Firestore rules blocking client writes to users.numericId
 * 
 * For new users: Backend trigger assigns numeric ID automatically
 * For existing flows: Listen to user doc changes to detect numeric ID
 * 
 * Created: [Original Date]
 * Deprecated: January 25, 2026
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from './logger-service';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * ⚠️ DEPRECATED: Client-side numeric ID assignment
 * 
 * This function is NO LONGER FUNCTIONAL due to security rules.
 * Backend trigger (onUserCreate) handles assignment now.
 * 
 * @deprecated Use waitForNumericId() instead to listen for backend assignment
 */
export const ensureUserNumericId = async (uid: string): Promise<number | null> => {
  logger.warn('⚠️ ensureUserNumericId is deprecated and will fail', { 
    uid,
    reason: 'Backend trigger handles numeric ID assignment',
    migration: 'Use waitForNumericId() instead'
  });
  
  // Try to read existing ID (might already be assigned by backend)
  const existingId = await getUserNumericId(uid);
  if (existingId) {
    return existingId;
  }
  
  // If not assigned yet, call backend function as emergency fallback
  try {
    const functions = getFunctions();
    const getUserNumericIdCallable = httpsCallable(functions, 'getUserNumericId');
    const result = await getUserNumericIdCallable({ userId: uid });
    return (result.data as { numericId: number }).numericId;
  } catch (error) {
    logger.error('Failed to call backend getUserNumericId', error as Error, { uid });
    return null;
  }
};

/**
 * ✅ ACTIVE: Wait for backend to assign numeric ID
 * 
 * Use this instead of ensureUserNumericId for new code.
 * Polls the user document until numeric ID is assigned by backend.
 * 
 * @param uid Firebase UID
 * @param maxWaitMs Maximum wait time (default: 10 seconds)
 * @returns The user's numeric ID or null if timeout
 */
export const waitForNumericId = async (
  uid: string, 
  maxWaitMs: number = 10000
): Promise<number | null> => {
  if (!uid || typeof uid !== 'string') {
    logger.warn('Invalid UID provided to waitForNumericId', { uid });
    return null;
  }

  const startTime = Date.now();
  const pollInterval = 500; // Check every 500ms
  
  while (Date.now() - startTime < maxWaitMs) {
    const numericId = await getUserNumericId(uid);
    
    if (numericId) {
      logger.info('Numeric ID assigned by backend', { uid, numericId });
      return numericId;
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  logger.error('Timeout waiting for numeric ID assignment', { uid, maxWaitMs });
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
