/**
 * Server-Side Subscription Tier Enforcement
 * Prevents listing creation beyond plan limits at the backend level.
 *
 * This is a security-critical function that acts as a backstop for
 * client-side checks in sell-workflow-service.ts and listing-limits.ts.
 *
 * @author Cloud Functions Architect
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import {
  getPlanMaxListings,
  normalizePlanTier,
} from '../constants/plan-limits';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const VEHICLE_COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses',
] as const;

/**
 * Count all active listings across all 6 vehicle collections for a user.
 */
async function countActiveListings(sellerId: string): Promise<number> {
  const counts = await Promise.all(
    VEHICLE_COLLECTIONS.map(async col => {
      const snap = await db
        .collection(col)
        .where('sellerId', '==', sellerId)
        .where('status', '==', 'active')
        .count()
        .get();
      return snap.data().count;
    })
  );
  return counts.reduce((sum, c) => sum + c, 0);
}

/**
 * Validate that the user hasn't exceeded their plan's listing limit.
 * Called from Firestore onCreate triggers on each vehicle collection.
 */
async function enforceLimit(
  snap: functions.firestore.QueryDocumentSnapshot,
  context: functions.EventContext
): Promise<void> {
  const data = snap.data();
  const sellerId: string | undefined = data?.sellerId;
  const collectionId = context.params.collection || snap.ref.parent.id;

  if (!sellerId) {
    functions.logger.warn(
      'Listing created without sellerId — skipping enforcement',
      {
        docId: snap.id,
        collection: collectionId,
      }
    );
    return;
  }

  // Look up user's plan tier
  const userDoc = await db.collection('users').doc(sellerId).get();
  if (!userDoc.exists) {
    functions.logger.warn('User not found for listing enforcement', {
      sellerId,
    });
    return;
  }

  const userData = userDoc.data()!;
  const rawTier = userData.planTier || userData.plan?.tier || 'free';
  const planTier = normalizePlanTier(rawTier);
  const maxListings = getPlanMaxListings(planTier);

  // Unlimited plans always pass
  if (maxListings === -1) return;

  const activeCount = await countActiveListings(sellerId);

  if (activeCount > maxListings) {
    functions.logger.warn(
      'Listing limit exceeded — deactivating newest listing',
      {
        sellerId,
        planTier,
        activeCount,
        maxListings,
        deactivatedDoc: snap.id,
      }
    );

    // Deactivate the newly created listing
    await snap.ref.update({
      status: 'deactivated_plan_limit',
      deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deactivationReason: `Plan limit exceeded (${planTier}: max ${maxListings})`,
    });

    // Create a notification for the user
    await db.collection('notifications').add({
      userId: sellerId,
      type: 'listing_limit_reached',
      title: 'Listing Limit Reached',
      message: `Your ${planTier} plan allows ${maxListings} active listings. Upgrade to add more.`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// Create triggers for each vehicle collection
export const enforcePassengerCarsLimit = functions
  .region('europe-west1')
  .firestore.document('passenger_cars/{docId}')
  .onCreate(enforceLimit);

export const enforceSuvsLimit = functions
  .region('europe-west1')
  .firestore.document('suvs/{docId}')
  .onCreate(enforceLimit);

export const enforceVansLimit = functions
  .region('europe-west1')
  .firestore.document('vans/{docId}')
  .onCreate(enforceLimit);

export const enforceMotorcyclesLimit = functions
  .region('europe-west1')
  .firestore.document('motorcycles/{docId}')
  .onCreate(enforceLimit);

export const enforceTrucksLimit = functions
  .region('europe-west1')
  .firestore.document('trucks/{docId}')
  .onCreate(enforceLimit);

export const enforceBusesLimit = functions
  .region('europe-west1')
  .firestore.document('buses/{docId}')
  .onCreate(enforceLimit);
