/**
 * Cloud Function: Notify Followers on New Car Post
 * دالة سحابية: إشعار المتابعين عند نشر سيارة جديدة
 * 
 * Trigger: Firestore onCreate for cars collection
 * Logic: Fan-out notifications to all followers of the seller
 * 
 * Performance: Batched writes (500 notifications per batch)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const logger = functions.logger;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface NotificationData {
  userId: string;           // Who receives the notification
  type: 'new_car_from_followed_seller';
  carId: string;            // The new car
  sellerId: string;         // Who posted it
  sellerName: string;       // Seller's display name
  carMake: string;          // Car brand
  carModel: string;         // Car model
  carPrice: number;         // Car price
  carImage?: string;        // First car image
  isRead: boolean;          // Read status
  createdAt: admin.firestore.FieldValue;
}

/**
 * Cloud Function: Trigger when a new car is created
 * Collection: cars, passenger_cars, suvs, vans, motorcycles, trucks, buses
 * 
 * NOTE: This function must be deployed for each collection if using multi-collection architecture.
 * For simplicity, we'll use a wildcard path if all collections follow the same pattern.
 */
export const notifyFollowersOnNewCar = functions.firestore
  .document('cars/{carId}')
  .onCreate(async (snap, context) => {
    const carData = snap.data();
    const carId = context.params.carId;

    // Validation
    if (!carData) {
      logger.error('No car data found');
      return null;
    }

    const sellerId = carData.sellerId;
    if (!sellerId) {
      logger.error('Car has no sellerId', { carId });
      return null;
    }

    // Skip notifications for draft cars
    if (carData.status === 'draft') {
      logger.info('Skipping notification for draft car', { carId });
      return null;
    }

    logger.info('New car posted, finding followers...', { carId, sellerId });

    try {
      // STEP 1: Get seller information
      const sellerDoc = await db.collection('users').doc(sellerId).get();
      if (!sellerDoc.exists) {
        logger.error('Seller not found', { sellerId });
        return null;
      }

      const sellerData = sellerDoc.data();
      const sellerName = sellerData?.displayName || 'Unknown Seller';

      // STEP 2: Find all followers of this seller
      // Query: follows collection where followingId == sellerId
      const followersSnapshot = await db
        .collection('follows')
        .where('followingId', '==', sellerId)
        .get();

      if (followersSnapshot.empty) {
        logger.info('No followers found for seller', { sellerId });
        return null;
      }

      const followerIds = followersSnapshot.docs.map(doc => doc.data().followerId);
      logger.info(`Found ${followerIds.length} followers`, { sellerId, followerIds });

      // STEP 3: Create notification data
      const notificationBase: Omit<NotificationData, 'userId'> = {
        type: 'new_car_from_followed_seller',
        carId,
        sellerId,
        sellerName,
        carMake: carData.make || 'Unknown',
        carModel: carData.model || '',
        carPrice: carData.price || 0,
        carImage: carData.images?.[0] || '',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // STEP 4: Batch write notifications (max 500 per batch)
      const BATCH_SIZE = 500;
      let batch = db.batch();
      let operationCount = 0;
      let totalNotifications = 0;

      for (const followerId of followerIds) {
        // Create notification document
        const notificationRef = db.collection('notifications').doc();
        const notification: NotificationData = {
          ...notificationBase,
          userId: followerId
        };

        batch.set(notificationRef, notification);
        operationCount++;
        totalNotifications++;

        // Commit batch if reaching limit
        if (operationCount >= BATCH_SIZE) {
          await batch.commit();
          logger.info(`Committed batch of ${operationCount} notifications`);
          batch = db.batch(); // Start new batch
          operationCount = 0;
        }
      }

      // Commit remaining notifications
      if (operationCount > 0) {
        await batch.commit();
        logger.info(`Committed final batch of ${operationCount} notifications`);
      }

      // STEP 5: Update seller's notification stats
      await db.collection('users').doc(sellerId).update({
        'stats.notificationsSent': admin.firestore.FieldValue.increment(totalNotifications)
      });

      logger.info('✅ Notification fan-out complete', {
        carId,
        sellerId,
        totalNotifications
      });

      return { success: true, notificationsSent: totalNotifications };

    } catch (error) {
      logger.error('Error in notifyFollowersOnNewCar', error);
      throw error;
    }
  });

/**
 * Alternative: Generic trigger for all vehicle collections
 * Uncomment if using multi-collection architecture
 */
/*
export const notifyFollowersOnNewCarUnified = functions.firestore
  .document('{collection}/{carId}')
  .onCreate(async (snap, context) => {
    const collection = context.params.collection;
    
    // Only trigger for vehicle collections
    const vehicleCollections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
    if (!vehicleCollections.includes(collection)) {
      return null;
    }

    // Same logic as above...
    // (Copy the entire function body from above)
  });
*/

/**
 * Scheduled Function: Clean up old notifications (monthly)
 * Deletes notifications older than 90 days
 */
export const cleanupOldNotifications = functions.pubsub
  .schedule('0 2 1 * *') // 2 AM on the 1st of every month
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    logger.info('Starting cleanup of old notifications...');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
      const oldNotificationsSnapshot = await db
        .collection('notifications')
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(ninetyDaysAgo))
        .limit(500) // Process in batches
        .get();

      if (oldNotificationsSnapshot.empty) {
        logger.info('No old notifications to clean up');
        return null;
      }

      const batch = db.batch();
      oldNotificationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      logger.info(`Deleted ${oldNotificationsSnapshot.size} old notifications`);

      return { deleted: oldNotificationsSnapshot.size };

    } catch (error) {
      logger.error('Error cleaning up old notifications', error);
      throw error;
    }
  });
