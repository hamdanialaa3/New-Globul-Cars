// Daily Profile Metrics Aggregation Cloud Function
// Region: europe-west1 | Scheduled: 02:00 UTC daily
// Purpose: Pre-compute heavy profile stats to reduce query cost on dashboard load
// Architecture: Write to profileMetrics collection for fast reads

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from '../logger-service';

const db = admin.firestore();
const PROFILES = 'profiles';
const LISTINGS = 'listings';
const LISTING_METRICS = 'listingMetrics';
const REVIEWS = 'reviews';
const SAVED_SEARCHES = 'savedSearches';
const PROFILE_METRICS = 'profileMetrics'; // aggregated output collection

interface ProfileMetricsDoc {
  profileId: string;
  userId: string;
  trustScore: number;
  badges: string[];
  activeListings: number;
  totalListings: number;
  soldListings: number;
  views30d: number;
  messages30d: number;
  favorites30d: number;
  reviewCount: number;
  avgRating: number;
  conversionRate30d: number;
  savedSearchesCount: number;
  computedAt: FirebaseFirestore.Timestamp;
}

/**
 * Aggregate single profile metrics
 */
async function aggregateProfile(profileSnap: FirebaseFirestore.DocumentSnapshot): Promise<ProfileMetricsDoc | null> {
  const profileData = profileSnap.data();
  if (!profileData) return null;

  const profileId = profileSnap.id;
  const userId = profileData.userId;

  // Parallel fetch
  const [listingsSnap, metricsSnap, reviewsSnap, searchesSnap] = await Promise.all([
    db.collection(LISTINGS).where('ownerProfileId', '==', profileId).get(),
    db.collection(LISTING_METRICS).where('ownerProfileId', '==', profileId).get(),
    db.collection(REVIEWS).where('profileId', '==', profileId).get(),
    db.collection(SAVED_SEARCHES).where('userId', '==', userId).get()
  ]);

  // Aggregate listings
  let activeListings = 0;
  let soldListings = 0;
  listingsSnap.forEach(doc => {
    const status = doc.data().status;
    if (status === 'published') activeListings++;
    if (status === 'sold') soldListings++;
  });

  // Aggregate metrics
  let views30d = 0, messages30d = 0, favorites30d = 0;
  metricsSnap.forEach(doc => {
    const m = doc.data();
    views30d += m.views30d || 0;
    messages30d += m.messages30d || 0;
    favorites30d += m.favorites30d || 0;
  });

  // Aggregate reviews
  let totalRating = 0;
  reviewsSnap.forEach(doc => {
    totalRating += doc.data().rating || 0;
  });
  const reviewCount = reviewsSnap.size;
  const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;

  // Conversion
  const conversionRate30d = views30d > 0 ? (messages30d / views30d) * 100 : 0;

  return {
    profileId,
    userId,
    trustScore: profileData.trustScore || 0,
    badges: profileData.badges || [],
    activeListings,
    totalListings: listingsSnap.size,
    soldListings,
    views30d,
    messages30d,
    favorites30d,
    reviewCount,
    avgRating,
    conversionRate30d,
    savedSearchesCount: searchesSnap.size,
    computedAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
  };
}

/**
 * Scheduled daily aggregation (02:00 UTC)
 * Processes all profiles in batches
 */
export const dailyProfileMetricsAggregation = functions.region('europe-west1').pubsub.schedule('0 2 * * *').timeZone('UTC').onRun(async () => {
  const startTime = Date.now();
  const profilesSnap = await db.collection(PROFILES).get();
  
  const batch = db.batch();
  let processed = 0;
  let batchCount = 0;

  for (const profileDoc of profilesSnap.docs) {
    try {
      const metrics = await aggregateProfile(profileDoc);
      if (!metrics) continue;

      const ref = db.collection(PROFILE_METRICS).doc(profileDoc.id);
      batch.set(ref, metrics, { merge: true });
      
      processed++;
      batchCount++;

      // Firestore batch limit: 500 operations
      if (batchCount >= 450) {
        await batch.commit();
        batchCount = 0;
        logger.info(`Committed batch, processed: ${processed}`);
      }
    } catch (e) {
      logger.error(`Error processing profile ${profileDoc.id}`, e instanceof Error ? e : new Error(String(e)));
    }
  }

  // Final commit
  if (batchCount > 0) {
    await batch.commit();
  }

  const duration = Date.now() - startTime;
  logger.info(`Completed profile metrics aggregation. Processed: ${processed}/${profilesSnap.size}, Duration: ${duration}ms`);
});

/**
 * On-demand manual trigger (callable function)
 * Useful for immediate refresh or admin tools
 */
export const triggerProfileMetricsAggregation = functions.region('europe-west1').https.onCall(async (data, context) => {
  // Verify admin auth
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const profileId = data.profileId;
  if (!profileId) {
    throw new functions.https.HttpsError('invalid-argument', 'profileId required');
  }

  const profileSnap = await db.collection(PROFILES).doc(profileId).get();
  if (!profileSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Profile not found');
  }

  const metrics = await aggregateProfile(profileSnap);
  if (!metrics) {
    throw new functions.https.HttpsError('internal', 'Failed to compute metrics');
  }

  await db.collection(PROFILE_METRICS).doc(profileId).set(metrics, { merge: true });
  
  return { success: true, metrics };
});
