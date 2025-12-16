/**
 * Numeric ID Assignment Service
 * Automatically assigns numeric IDs to users who don't have one
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { db } from '../firebase';
import { logger } from './logger-service';
import { getNextUserNumericId } from './numeric-id-counter.service';

/**
 * Ensure user has a numeric ID, assign one if missing
 * @param uid Firebase UID
 * @returns The user's numeric ID (existing or newly assigned)
 */
export const ensureUserNumericId = async (uid: string): Promise<number | null> => {
  if (!uid || typeof uid !== 'string') {
    logger.warn('Invalid UID provided to ensureUserNumericId', { uid });
    return null;
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      logger.warn('User document does not exist', { uid });
      return null;
    }

    const userData = userDoc.data();
    
    // If user already has a numeric ID, return it
    if (userData.numericId && typeof userData.numericId === 'number') {
      logger.debug('User already has numeric ID', { uid, numericId: userData.numericId });
      return userData.numericId;
    }

    // Assign a new numeric ID
    const numericId = await getNextUserNumericId();
    
    await updateDoc(userRef, {
      numericId,
      numericIdAssignedAt: new Date(),
      updatedAt: new Date()
    });

    logger.info('Assigned numeric ID to user', { uid, numericId });
    return numericId;
  } catch (error) {
    logger.error('Failed to ensure user numeric ID', error as Error, { uid });
    return null;
  }
};

/**
 * Get user's numeric ID if it exists
 * @param uid Firebase UID
 * @returns The user's numeric ID or null
 */
export const getUserNumericId = async (uid: string): Promise<number | null> => {
  if (!uid || typeof uid !== 'string') {
    return null;
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const numericId = userDoc.data()?.numericId;
    return typeof numericId === 'number' ? numericId : null;
  } catch (error) {
    logger.error('Failed to get user numeric ID', error as Error, { uid });
    return null;
  }
};
