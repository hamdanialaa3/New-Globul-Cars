/**
 * Algolia Users Sync Cloud Function — مزامنة المستخدمين مع Algolia
 * Automatically syncs user data to Algolia on every create/update/delete
 *
 * Deployment:
 *   cd functions
 *   firebase deploy --only functions:syncUserToAlgolia,functions:syncUserToAlgoliaOnDelete
 *
 * @since April 2026 — Cloud Apps 4.6
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import algoliasearch from 'algoliasearch';

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || '';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || '';
const USERS_INDEX_NAME = 'users';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const usersIndex = client.initIndex(USERS_INDEX_NAME);

/**
 * Transform Firestore user document → Algolia record
 */
function transformUserToAlgoliaRecord(
  uid: string,
  data: FirebaseFirestore.DocumentData
) {
  return {
    objectID: String(data.numericId || uid),
    uid,
    numericId: data.numericId || 0,
    displayName: data.displayName || '',
    businessName:
      data.dealerSnapshot?.businessName || data.companySnapshot?.name || '',
    accountType: data.accountType || data.profileType || 'private',
    avatarUrl: data.photoURL || data.profileImage || '',
    city: data.location?.city || data.city || '',
    region: data.location?.region || data.region || '',
    description: data.bio || data.dealerSnapshot?.description || '',
    rating: data.rating || 0,
    reviewsCount: data.reviewsCount || data.stats?.reviewsReceived || 0,
    listingsCount: data.stats?.totalListings || data.listingsCount || 0,
    isVerified: !!(
      data.verification?.email?.verified && data.verification?.phone?.verified
    ),
    isOnline: false, // Updated via Realtime DB, not part of search
    lastActiveAt: data.lastActiveAt?._seconds || data.updatedAt?._seconds || 0,
    createdAt: data.createdAt?._seconds || 0,
  };
}

/**
 * Should the user be indexed?
 * Excludes banned and inactive accounts.
 */
function shouldIndex(data: FirebaseFirestore.DocumentData): boolean {
  if (data.isBanned === true) return false;
  if (data.isActive === false) return false;
  if (data.isDeleted === true) return false;
  return true;
}

// ================ TRIGGERS ================

/**
 * onCreate + onUpdate: Push user to Algolia
 */
export const syncUserToAlgolia = functions
  .region('europe-west1')
  .firestore.document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;

    // Deleted
    if (!change.after.exists) {
      try {
        const before = change.before.data();
        const objectID = String(before?.numericId || userId);
        await usersIndex.deleteObject(objectID);
        logger.info('[sync-users] Deleted from Algolia', { userId, objectID });
      } catch (error) {
        logger.error('[sync-users] Failed to delete from Algolia', {
          userId,
          error,
        });
      }
      return;
    }

    const data = change.after.data()!;

    // Skip if user should not be indexed
    if (!shouldIndex(data)) {
      // Remove from index if it was previously indexed
      try {
        const objectID = String(data.numericId || userId);
        await usersIndex.deleteObject(objectID);
        logger.info('[sync-users] Removed hidden user from Algolia', {
          userId,
        });
      } catch {
        // Not in index — fine
      }
      return;
    }

    const record = transformUserToAlgoliaRecord(userId, data);

    try {
      await usersIndex.saveObject(record);
      logger.info('[sync-users] Synced user to Algolia', {
        userId,
        objectID: record.objectID,
        displayName: record.displayName,
      });
    } catch (error) {
      logger.error('[sync-users] Failed to sync user to Algolia', {
        userId,
        error,
      });
    }
  });
