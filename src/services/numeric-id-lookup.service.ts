/**
 * Numeric ID Lookup Service
 * Resolves numeric IDs to Firebase UIDs and vice versa
 */

import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from './logger-service';
import type { UserProfile } from '../types/common-types';
import type { CarListing } from '../types/CarListing';

/**
 * Get user by numeric ID
 */
export const getUserByNumericId = async (numericId: number): Promise<UserProfile | null> => {
  try {
    logger.debug('getUserByNumericId: Searching for user', { numericId });
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('numericId', '==', numericId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    logger.debug('getUserByNumericId: Query result', { numericId, found: !snapshot.empty, count: snapshot.size });

    if (snapshot.empty) {
      logger.warn('User not found by numeric ID', { numericId });
      return null;
    }

    const userData = snapshot.docs[0].data() as UserProfile;
    const result = {
      ...userData,
      id: snapshot.docs[0].id
    };
    logger.debug('getUserByNumericId: User found', { numericId, firebaseUid: snapshot.docs[0].id, email: userData.email });
    return result;
  } catch (error) {
    logger.error('Failed to get user by numeric ID', error as Error, { numericId });
    return null;
  }
};

/**
 * Get Firebase UID by numeric ID (faster if you only need the UID)
 */
export const getFirebaseUidByNumericId = async (numericId: number): Promise<string | null> => {
  const user = await getUserByNumericId(numericId);
  return user?.id || null;
};

/**
 * Get car by seller's numeric ID and car's numeric ID
 * Example: /profile/1/2 → seller numericId = 1, car numericId = 2
 */
export const getCarByNumericIds = async (
  sellerNumericId: number | string,
  carNumericId: number | string
): Promise<CarListing | null> => {
  try {
    const carsRef = collection(db, 'cars');
    // Prepare permutations for tolerant lookup
    const sValues = [Number(sellerNumericId), String(sellerNumericId)].filter(v => v);
    const cValues = [Number(carNumericId), String(carNumericId)].filter(v => v);
    const idFields = ['numericId', 'carNumericId'];

    // Strategy 1: Direct Lookup
    for (const s of sValues) {
      for (const c of cValues) {
        for (const field of idFields) {
          const q = query(
            carsRef,
            where('sellerNumericId', '==', s),
            where(field, '==', c),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const carData = snap.docs[0].data() as CarListing;
            return { ...carData, id: snap.docs[0].id };
          }
        }
      }
    }

    // Strategy 2: Fallback via User UID
    logger.warn('Car not found via direct numeric lookup. Attempting User UID fallback...', { sellerNumericId, carNumericId });

    let sellerUid: string | null = null;
    const usersRef = collection(db, 'users');

    // Find User
    for (const s of sValues) {
      const uq = query(usersRef, where('numericId', '==', s), limit(1));
      const uSnap = await getDocs(uq);
      if (!uSnap.empty) {
        sellerUid = uSnap.docs[0].id;
        break;
      }
    }

    if (sellerUid) {
      logger.debug(`Resolved sellerNumericId ${sellerNumericId} -> UID ${sellerUid}. Searching cars by UID...`);
      for (const c of cValues) {
        for (const field of idFields) {
          const q = query(
            carsRef,
            where('sellerId', '==', sellerUid),
            where(field, '==', c),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const carData = snap.docs[0].data() as CarListing;
            return { ...carData, id: snap.docs[0].id };
          }
        }
      }
    }

    logger.warn('Car not found after all lookup strategies.', { sellerNumericId, carNumericId });
    return null;

  } catch (error) {
    logger.error('Failed to get car by numeric IDs', error as Error, { sellerNumericId, carNumericId });
    return null;
  }
};

/**
 * Get all cars for a seller by their numeric ID
 */
export const getCarsBySellerNumericId = async (sellerNumericId: number): Promise<CarListing[]> => {
  try {
    const carsRef = collection(db, 'cars');
    const q = query(
      carsRef,
      where('sellerNumericId', '==', sellerNumericId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: any) => ({
      ...doc.data() as CarListing,
      id: doc.id
    }));
  } catch (error) {
    logger.error('Failed to get cars by seller numeric ID', error as Error, { sellerNumericId });
    return [];
  }
};

/**
 * Verify if current user owns a profile
 */
export const verifyProfileOwnership = async (
  numericId: number,
  currentUserId: string
): Promise<boolean> => {
  const user = await getUserByNumericId(numericId);

  if (!user) return false;

  return user.id === currentUserId;
};

/**
 * Verify if current user owns a car
 */
export const verifyCarOwnership = async (
  sellerNumericId: number,
  carNumericId: number,
  currentUserId: string
): Promise<boolean> => {
  const car = await getCarByNumericIds(sellerNumericId, carNumericId);

  if (!car) return false;

  return car.sellerId === currentUserId;
};

/**
 * Get user's numeric ID from Firebase UID
 */
export const getNumericIdByFirebaseUid = async (uid: string): Promise<number | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      logger.warn('User not found by Firebase UID', { uid });
      return null;
    }

    return userDoc.data()?.numericId || null;
  } catch (error) {
    logger.error('Failed to get numeric ID by Firebase UID', error as Error, { uid });
    return null;
  }
};
