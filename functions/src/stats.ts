// functions/src/stats.ts
// Cloud Functions for marketplace statistics and counters.
// Adheres to the project constitution.
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { verifySuperAdmin } from './auth/set-super-admin-claim';

// Initialize admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const statsRef = db.collection('market').doc('stats');

/**
 * Callable: Return full Super Admin analytics with Admin privileges
 * Uses custom claim check for better security
 */
export const getSuperAdminAnalytics = functions.region('europe-west1').https.onCall(async (data, context) => {
  // Verify super admin using custom claim (or email fallback)
  const isSuperAdmin = await verifySuperAdmin(context);
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Super Admin access required');
  }

  try {
    // Users (Auth)
    let totalUsers = 0;
    let activeUsers = 0;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let nextPageToken: string | undefined = undefined;
    do {
      const res = await admin.auth().listUsers(1000, nextPageToken);
      for (const u of res.users) {
        if (u.email === 'alaa.hamdani@yahoo.com') continue; // exclude owner from counts if desired
        totalUsers++;
        const last = u.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime) : null;
        if (last && last > oneDayAgo) activeUsers++;
      }
      nextPageToken = res.pageToken;
    } while (nextPageToken);

    // Firestore counts (admin privileges bypass rules)
    const carsSnap = await db.collection('cars').get();
    const totalCars = carsSnap.size;
    const activeCars = (await db.collection('cars').where('isActive', '==', true).get()).size;

    // Messages top-level (may not exist in some envs)
    let totalMessages = 0;
    try {
      totalMessages = (await db.collection('messages').get()).size;
    } catch {}

    // Views top-level (may not exist) and market stats doc
    let totalViews = 0;
    try {
      totalViews = (await db.collection('views').get()).size;
    } catch {}
    try {
      const statsDoc = await statsRef.get();
      const v = statsDoc.exists ? (statsDoc.data()?.totalViews || 0) : 0;
      totalViews = Math.max(totalViews, v);
    } catch {}

    // Revenue (simple: 5% of sold cars)
    let revenue = 0;
    try {
      carsSnap.forEach(doc => {
        const d = doc.data() as any;
        if (d?.isSold && typeof d.price === 'number') revenue += d.price * 0.05;
      });
    } catch {}

    return {
      totalUsers,
      activeUsers,
      totalCars,
      activeCars,
      totalMessages,
      totalViews,
      revenue,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('getSuperAdminAnalytics error', err);
    throw new functions.https.HttpsError('internal', err?.message || 'Failed to compute analytics');
  }
});

/**
 * Increments the view count for a car and the total market views.
 * This is a callable function invoked from the frontend.
 */
export const incrementCarViewCount = functions.region('europe-west1').https.onCall(async (data, context) => {
  const carId = data.carId;
  if (!carId) {
    throw new functions.https.HttpsError('invalid-argument', 'A "carId" must be provided.');
  }

  const carRef = db.collection('cars').doc(carId);

  try {
    await db.runTransaction(async (transaction) => {
      const carDoc = await transaction.get(carRef);
      if (!carDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Car document not found.');
      }
      
      // Increment view count on the car document
      const newViewCount = (carDoc.data()?.viewCount || 0) + 1;
      transaction.update(carRef, { viewCount: newViewCount });

      // Increment total market views in the stats document
      transaction.set(statsRef, { 
        totalViews: admin.firestore.FieldValue.increment(1) 
      }, { merge: true });
    });
    return { success: true, newViewCount: (await carRef.get()).data()?.viewCount };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    throw new functions.https.HttpsError('internal', 'Failed to increment view count.');
  }
});

/**
 * Updates total car count when a new car document is created.
 * This is a Firestore trigger.
 */
export const onCarCreate = functions.region('europe-west1').firestore
  .document('cars/{carId}')
  .onCreate(async (snap, context) => {
    return statsRef.set({
      totalCars: admin.firestore.FieldValue.increment(1)
    }, { merge: true });
  });

/**
 * Updates total car count when a car document is deleted.
 * This is a Firestore trigger.
 */
export const onCarDelete = functions.region('europe-west1').firestore
  .document('cars/{carId}')
  .onDelete(async (snap, context) => {
    return statsRef.set({
      totalCars: admin.firestore.FieldValue.increment(-1)
    }, { merge: true });
  });

/**
 * Updates total user count when a new user is created.
 * This is an Auth trigger.
 */
export const onUserCreate = functions.region('europe-west1').auth
  .user()
  .onCreate(async (user) => {
    return statsRef.set({
      totalUsers: admin.firestore.FieldValue.increment(1)
    }, { merge: true });
  });

/**
 * Updates total user count when a user is deleted.
 * This is an Auth trigger.
 */
export const onUserDelete = functions.region('europe-west1').auth
  .user()
  .onDelete(async (user) => {
    return statsRef.set({
      totalUsers: admin.firestore.FieldValue.increment(-1)
    }, { merge: true });
  });
