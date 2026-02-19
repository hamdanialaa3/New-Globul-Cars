/**
 * Users Service
 * Centralized service for fetching user profile data
 * 
 * Supports:
 * - Numeric ID lookup (numericId)
 * - UUID lookup (userId / uid)
 * - User settings access control
 * 
 * @file users.service.ts
 * @since 2026-02-18
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { BulgarianUser } from '../types/user/bulgarian-user.types';

export interface User {
  userId: string;               // Firestore document ID (uid)
  userNumericId?: number;       // Numeric ID for clean URLs
  slug?: string;                // SEO-friendly username slug
  email: string;
  displayName: string;
  photoURL?: string;
  roles: string[];              // ['user'] or ['admin'] or ['dealer']
  profileType?: 'private' | 'dealer' | 'company';
  
  // Additional fields from BulgarianUser
  phoneNumber?: string;
  locationData?: {
    cityName?: string;
    regionName?: string;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
  
  [key: string]: any;           // Allow additional fields
}

/**
 * Map Firestore BulgarianUser document to our User interface
 */
function mapBulgarianUserToUser(data: any, userId: string): User {
  return {
    userId: userId || data.uid,
    userNumericId: data.numericId,
    slug: data.profileSlug || data.slug,
    email: data.email,
    displayName: data.displayName || data.publicDisplayName || 'Unknown',
    photoURL: data.photoURL,
    roles: data.roles || ['user'],
    profileType: data.profileType,
    phoneNumber: data.phoneNumber,
    locationData: data.locationData,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
    // Include all other fields
    ...data
  };
}

/**
 * Fetch user by Firestore document ID (uid)
 * 
 * @param id - Firebase Auth UID or Firestore document ID
 * @returns User object or null if not found
 * 
 * @example
 * const user = await getUserById('abc123-firebase-uid');
 * if (user) {
 *   console.log(user.displayName, user.slug);
 * }
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    serviceLogger.info('[users.service] Fetching user by ID', { userId: id });

    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const user = mapBulgarianUserToUser(data, docSnap.id);

      serviceLogger.info('[users.service] Found user by ID', {
        userId: id,
        numericId: user.userNumericId,
        slug: user.slug
      });

      return user;
    }

    serviceLogger.warn('[users.service] User not found by ID', { userId: id });
    return null;
  } catch (error) {
    serviceLogger.error('[users.service] Error fetching user by ID', error as Error, { userId: id });
    throw error;
  }
}

/**
 * Fetch user by numeric ID
 * 
 * @param numericId - Numeric user ID (numericId field)
 * @returns User object or null if not found
 * 
 * @example
 * const user = await getUserByNumericId(456);
 * if (user) {
 *   console.log(`/u/${user.userNumericId}/${user.slug}`);
 * }
 */
export async function getUserByNumericId(numericId: number): Promise<User | null> {
  try {
    serviceLogger.info('[users.service] Fetching user by numeric ID', { numericId });

    const q = query(
      collection(db, 'users'),
      where('numericId', '==', numericId),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const user = mapBulgarianUserToUser(data, docSnap.id);

      serviceLogger.info('[users.service] Found user by numeric ID', {
        numericId,
        userId: user.userId,
        slug: user.slug
      });

      return user;
    }

    serviceLogger.warn('[users.service] User not found by numeric ID', { numericId });
    return null;
  } catch (error) {
    serviceLogger.error('[users.service] Error fetching user by numeric ID', error as Error, { numericId });
    throw error;
  }
}

/**
 * Fetch user by slug (username)
 * 
 * @param slug - User's slug (profileSlug field)
 * @returns User object or null if not found
 * 
 * @example
 * const user = await getUserBySlug('john-doe');
 */
export async function getUserBySlug(slug: string): Promise<User | null> {
  try {
    serviceLogger.info('[users.service] Fetching user by slug', { slug });

    const q = query(
      collection(db, 'users'),
      where('profileSlug', '==', slug),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const user = mapBulgarianUserToUser(data, docSnap.id);

      serviceLogger.info('[users.service] Found user by slug', {
        slug,
        userId: user.userId,
        numericId: user.userNumericId
      });

      return user;
    }

    serviceLogger.warn('[users.service] User not found by slug', { slug });
    return null;
  } catch (error) {
    serviceLogger.error('[users.service] Error fetching user by slug', error as Error, { slug });
    throw error;
  }
}

/**
 * Check if user has admin role
 * Used for access control in hooks and guards
 * 
 * @param userId - Firebase Auth UID
 * @returns true if user is admin, false otherwise
 * 
 * @example
 * const canEdit = await isUserAdmin(currentUser.uid);
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    return user?.roles?.includes('admin') || user?.roles?.includes('superadmin') || false;
  } catch (error) {
    serviceLogger.error('[users.service] Error checking admin status', error as Error, { userId });
    return false;
  }
}

/**
 * Check if user is the owner of a resource
 * 
 * @param currentUserId - Current authenticated user ID
 * @param resourceOwnerId - Owner ID of the resource
 * @returns true if current user is the owner
 * 
 * @example
 * const canEditSettings = await isOwner(currentUser.uid, profileUserId);
 */
export async function isOwner(currentUserId: string, resourceOwnerId: string): Promise<boolean> {
  return currentUserId === resourceOwnerId;
}

/**
 * Check if user can access settings for a profile
 * User can access if they are the owner OR an admin
 * 
 * @param currentUserId - Current authenticated user ID
 * @param profileUserId - Profile owner's user ID
 * @returns true if user has access
 * 
 * @example
 * const canAccessSettings = await canAccessUserSettings(currentUser.uid, profileUserId);
 * if (!canAccessSettings) navigate('/unauthorized');
 */
export async function canAccessUserSettings(
  currentUserId: string,
  profileUserId: string
): Promise<boolean> {
  try {
    // Check if owner
    if (await isOwner(currentUserId, profileUserId)) {
      return true;
    }

    // Check if admin
    if (await isUserAdmin(currentUserId)) {
      return true;
    }

    return false;
  } catch (error) {
    serviceLogger.error('[users.service] Error checking settings access', error as Error, {
      currentUserId,
      profileUserId
    });
    return false;
  }
}
