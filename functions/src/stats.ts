// functions/src/stats.ts
// Cloud Functions for marketplace statistics and counters.
// Adheres to the project constitution.
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const statsRef = db.collection('market').doc('stats');

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
