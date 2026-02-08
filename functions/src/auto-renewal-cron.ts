/**
 * Firebase Scheduled Function - Auto-Renewal
 * Runs daily to renew expired dealer listings
 * Location: Bulgaria
 * 
 * File: functions/src/auto-renewal-cron.ts
 * Created: February 8, 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface RenewalResult {
  userId: string;
  carId: string;
  renewedAt: Date;
  success: boolean;
  error?: string;
}

export const dailyAutoRenewal = functions
  .region('europe-west1')
  .pubsub.schedule('0 2 * * *')
  .timeZone('Europe/Sofia')
  .onRun(async (context: functions.EventContext) => {
    const startTime = Date.now();
    const results: RenewalResult[] = [];

    try {
      console.log('Starting daily auto-renewal job');

      const expiredCars = await findExpiredListings();
      console.log(`Found ${expiredCars.length} expired listings`);

      for (const car of expiredCars) {
        const result = await renewListing(car);
        results.push(result);

        if (result.success) {
          await sendRenewalNotification(result.userId, result.carId);
        }
      }

      await saveRenewalReport(results);

      const duration = Date.now() - startTime;
      console.log('Auto-renewal completed', {
        totalProcessed: results.length,
        totalRenewed: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        durationMs: duration
      });

      return null;
    } catch (error) {
      console.error('Auto-renewal cron failed:', error);
      throw error;
    }
  });

async function findExpiredListings(): Promise<any[]> {
  const now = new Date();
  const expiryDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const collections = [
    'cars_basic_info',
    'cars_technical',
    'cars_condition',
    'cars_location',
    'cars_media',
    'cars_pricing'
  ];

  const expiredCars: any[] = [];

  for (const collectionName of collections) {
    try {
      const snapshot = await db
        .collection(collectionName)
        .where('isActive', '==', true)
        .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(expiryDate))
        .get();

      snapshot.forEach(doc => {
        expiredCars.push({
          id: doc.id,
          collection: collectionName,
          data: doc.data()
        });
      });
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
    }
  }

  return expiredCars;
}

async function renewListing(car: any): Promise<RenewalResult> {
  try {
    const userId = car.data.userId || car.data.sellerId;
    if (!userId) {
      return {
        userId: 'unknown',
        carId: car.id,
        renewedAt: new Date(),
        success: false,
        error: 'Missing userId'
      };
    }

    const userSnapshot = await db.collection('users').where('uid', '==', userId).get();

    if (userSnapshot.empty) {
      return {
        userId,
        carId: car.id,
        renewedAt: new Date(),
        success: false,
        error: 'User not found'
      };
    }

    const userData = userSnapshot.docs[0].data();
    const plan = userData.subscriptionTier || 'free';

    if (plan !== 'dealer' && plan !== 'company') {
      return {
        userId,
        carId: car.id,
        renewedAt: new Date(),
        success: false,
        error: 'User plan does not support auto-renewal'
      };
    }

    const now = admin.firestore.Timestamp.now();
    await db.collection(car.collection).doc(car.id).update({
      createdAt: now,
      updatedAt: now,
      renewedAt: now,
      renewalCount: (car.data.renewalCount || 0) + 1,
      isActive: true
    });

    console.log('Listing renewed:', { userId, carId: car.id });

    return {
      userId,
      carId: car.id,
      renewedAt: new Date(),
      success: true
    };
  } catch (error) {
    return {
      userId: car.data.userId || 'unknown',
      carId: car.id,
      renewedAt: new Date(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function sendRenewalNotification(userId: string, carId: string): Promise<void> {
  try {
    const userSnapshot = await db.collection('users').where('uid', '==', userId).get();

    if (userSnapshot.empty) {
      console.error('User not found for notification:', userId);
      return;
    }

    const userData = userSnapshot.docs[0].data();
    const email = userData.email;

    if (!email) {
      console.error('No email found for user:', userId);
      return;
    }

    await db.collection('mail').add({
      to: email,
      template: {
        name: 'listing-renewed',
        data: {
          userId,
          carId,
          renewedAt: new Date().toISOString(),
          listingUrl: `https://kolioneauction.com/car/${carId}`
        }
      }
    });

    console.log('Renewal notification sent:', { userId, carId, email });
  } catch (error) {
    console.error('Failed to send renewal notification:', error);
  }
}

async function saveRenewalReport(results: RenewalResult[]): Promise<void> {
  try {
    const report = {
      totalProcessed: results.length,
      totalRenewed: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      executedAt: admin.firestore.FieldValue.serverTimestamp(),
      details: results
    };

    await db.collection('renewal_reports').add(report);
    console.log('Renewal report saved');
  } catch (error) {
    console.error('Failed to save renewal report:', error);
  }
}
