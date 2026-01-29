"use strict";
/**
 * Orphaned Data Cleanup Cloud Functions
 * Handles cascading deletes when users delete cars or profiles
 *
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOrphanedData = exports.dailyOrphanedDataCleanup = exports.onDeleteOffer = exports.onDeleteProfile = exports.onDeleteCar = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const storage = admin.storage();
// ============================================================================
// ON DELETE CAR - CLEANUP RELATED DATA
// ============================================================================
/**
 * Triggered when a car listing is deleted
 * Cleans up: favorites, reviews, messages, offers, images
 */
exports.onDeleteCar = functions
    .region('europe-west1')
    .firestore
    .document('cars/{sellerUid}/{collectionName}/{carUid}')
    .onDelete(async (snap, context) => {
    const { sellerUid, carUid, collectionName } = context.params;
    const carData = snap.data();
    logger.info(`Deleting car ${carUid} from seller ${sellerUid}`);
    try {
        const batch = db.batch();
        // 1. Delete car images from Cloud Storage
        if ((carData === null || carData === void 0 ? void 0 : carData.images) && Array.isArray(carData.images)) {
            const bucket = storage.bucket();
            for (const imagePath of carData.images) {
                try {
                    await bucket.file(imagePath).delete().catch(() => {
                        // File might not exist, continue
                    });
                }
                catch (error) {
                    logger.warn(`Could not delete image ${imagePath}`, { error });
                }
            }
        }
        // 2. Delete car from favorites (bulk operation)
        const favoritesSnapshot = await db
            .collectionGroup('favorites')
            .where('carUid', '==', carUid)
            .get();
        for (const doc of favoritesSnapshot.docs) {
            batch.delete(doc.ref);
        }
        // 3. Delete car reviews
        const reviewsSnapshot = await db
            .collection(`cars/${sellerUid}/${collectionName}/${carUid}/reviews`)
            .get();
        for (const doc of reviewsSnapshot.docs) {
            batch.delete(doc.ref);
        }
        // 4. Delete related offers
        const offersSnapshot = await db
            .collectionGroup('offers')
            .where('carUid', '==', carUid)
            .get();
        for (const doc of offersSnapshot.docs) {
            batch.delete(doc.ref);
        }
        // 5. Delete related messages (mark as orphaned instead)
        const messagesSnapshot = await db
            .collectionGroup('messages')
            .where('carUid', '==', carUid)
            .get();
        for (const doc of messagesSnapshot.docs) {
            batch.update(doc.ref, {
                carDeleted: true,
                deletedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        // 6. Update seller's car count
        const profileRef = db.collection('profiles').doc(sellerUid);
        batch.update(profileRef, {
            totalListings: admin.firestore.FieldValue.increment(-1),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        // 7. Update car counter
        const counterRef = db.collection('counters').doc(sellerUid);
        batch.update(counterRef, {
            cars: admin.firestore.FieldValue.increment(-1)
        });
        // Execute batch
        await batch.commit();
        logger.info(`Successfully deleted car ${carUid} and related data`);
    }
    catch (error) {
        logger.error(`Error deleting car data: ${error}`);
        throw error;
    }
});
// ============================================================================
// ON DELETE PROFILE - CLEANUP ALL USER DATA
// ============================================================================
/**
 * Triggered when a user profile is deleted
 * Cleans up: car listings, messages, favorites, reviews, offers, images
 */
exports.onDeleteProfile = functions
    .region('europe-west1')
    .firestore
    .document('profiles/{userId}')
    .onDelete(async (snap, context) => {
    const { userId } = context.params;
    // userData is snapshot data but not actively used in cleanup
    // (we delete by userId only)
    logger.info(`Deleting profile and all data for user ${userId}`);
    try {
        // 1. Delete all cars from all collections
        const carCollections = [
            'passenger_cars',
            'suvs',
            'vans',
            'motorcycles',
            'trucks',
            'buses'
        ];
        for (const collectionName of carCollections) {
            const carsSnapshot = await db
                .collection(`cars/${userId}/${collectionName}`)
                .get();
            for (const carDoc of carsSnapshot.docs) {
                // Call onDeleteCar logic inline
                const carData = carDoc.data();
                // Delete images
                if ((carData === null || carData === void 0 ? void 0 : carData.images) && Array.isArray(carData.images)) {
                    const bucket = storage.bucket();
                    for (const imagePath of carData.images) {
                        try {
                            await bucket.file(imagePath).delete().catch(() => { });
                        }
                        catch (error) {
                            logger.warn(`Could not delete image ${imagePath}`);
                        }
                    }
                }
                // Delete car document
                await carDoc.ref.delete();
            }
        }
        // 2. Delete user folder
        await db.collection('cars').doc(userId).delete().catch(() => { });
        // 3. Delete all user messages
        const messagesSnapshot = await db
            .collectionGroup('messages')
            .where('senderUid', '==', userId)
            .get();
        const batch1 = db.batch();
        for (const doc of messagesSnapshot.docs) {
            batch1.delete(doc.ref);
        }
        if (messagesSnapshot.docs.length > 0) {
            await batch1.commit();
        }
        // 4. Delete messages received by user
        const receivedMessagesSnapshot = await db
            .collectionGroup('messages')
            .where('recipientUid', '==', userId)
            .get();
        const batch2 = db.batch();
        for (const doc of receivedMessagesSnapshot.docs) {
            batch2.delete(doc.ref);
        }
        if (receivedMessagesSnapshot.docs.length > 0) {
            await batch2.commit();
        }
        // 5. Delete user's favorites
        const favoritesRef = db.collection('favorites').doc(userId);
        await favoritesRef.delete().catch(() => { });
        // 6. Delete user's profile stats
        const profileStatsRef = db.collection('profile_stats').doc(userId);
        await profileStatsRef.delete().catch(() => { });
        // 7. Delete user's saved searches
        const savedSearchesSnapshot = await db
            .collection('saved_searches')
            .where('userId', '==', userId)
            .get();
        const batch3 = db.batch();
        for (const doc of savedSearchesSnapshot.docs) {
            batch3.delete(doc.ref);
        }
        if (savedSearchesSnapshot.docs.length > 0) {
            await batch3.commit();
        }
        // 8. Delete user points/rewards
        const pointsRef = db.collection('userPoints').doc(userId);
        await pointsRef.delete().catch(() => { });
        // 9. Delete user achievements
        const achievementsSnapshot = await db
            .collection('user_achievements')
            .where('userId', '==', userId)
            .get();
        const batch4 = db.batch();
        for (const doc of achievementsSnapshot.docs) {
            batch4.delete(doc.ref);
        }
        if (achievementsSnapshot.docs.length > 0) {
            await batch4.commit();
        }
        // 10. Delete user account (Firebase Auth)
        try {
            await admin.auth().deleteUser(userId);
        }
        catch (error) {
            logger.warn(`Could not delete Firebase Auth user ${userId}:`, { error });
        }
        logger.info(`Successfully deleted profile and all data for user ${userId}`);
    }
    catch (error) {
        logger.error(`Error deleting profile data: ${error}`);
        throw error;
    }
});
// ============================================================================
// ON DELETE OFFER - CLEANUP
// ============================================================================
/**
 * Triggered when an offer is deleted
 * Cleans up: related messages, notifications
 */
exports.onDeleteOffer = functions
    .region('europe-west1')
    .firestore
    .document('cars/{sellerUid}/{collectionName}/{carUid}/offers/{offerId}')
    .onDelete(async (snap, context) => {
    const { offerId } = context.params;
    logger.info(`Deleting offer ${offerId} and related data`);
    try {
        const batch = db.batch();
        // Delete related messages
        const messagesSnapshot = await db
            .collectionGroup('messages')
            .where('offerId', '==', offerId)
            .get();
        for (const doc of messagesSnapshot.docs) {
            batch.delete(doc.ref);
        }
        // Mark notifications as obsolete
        const notificationsSnapshot = await db
            .collectionGroup('notifications')
            .where('offerId', '==', offerId)
            .get();
        for (const doc of notificationsSnapshot.docs) {
            batch.update(doc.ref, {
                isObsolete: true,
                deletedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        await batch.commit();
        logger.info(`Successfully deleted offer ${offerId} and related data`);
    }
    catch (error) {
        logger.error(`Error deleting offer data: ${error}`);
        throw error;
    }
});
// ============================================================================
// SCHEDULED CLEANUP - REMOVE ORPHANED DOCUMENTS
// ============================================================================
/**
 * Runs daily at 2 AM to clean up orphaned and deleted documents
 */
exports.dailyOrphanedDataCleanup = functions
    .region('europe-west1')
    .pubsub
    .schedule('0 2 * * *') // 2 AM every day
    .timeZone('Europe/Sofia')
    .onRun(async (context) => {
    logger.info('Starting daily orphaned data cleanup');
    try {
        // Clean up messages with deleted cars
        const orphanedMessagesSnapshot = await db
            .collectionGroup('messages')
            .where('carDeleted', '==', true)
            .where('deletedAt', '<', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // older than 30 days
            .get();
        const batch1 = db.batch();
        let count1 = 0;
        for (const doc of orphanedMessagesSnapshot.docs) {
            batch1.delete(doc.ref);
            count1++;
        }
        if (count1 > 0) {
            await batch1.commit();
            logger.info(`Cleaned up ${count1} orphaned messages`);
        }
        // Clean up notifications
        const orphanedNotificationsSnapshot = await db
            .collectionGroup('notifications')
            .where('isObsolete', '==', true)
            .where('deletedAt', '<', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .get();
        const batch2 = db.batch();
        let count2 = 0;
        for (const doc of orphanedNotificationsSnapshot.docs) {
            batch2.delete(doc.ref);
            count2++;
        }
        if (count2 > 0) {
            await batch2.commit();
            logger.info(`Cleaned up ${count2} orphaned notifications`);
        }
        // Clean up images in storage with no references
        // This is more complex and should be done with a separate process
        logger.info('Daily cleanup complete');
    }
    catch (error) {
        logger.error(`Error during daily cleanup: ${error}`);
    }
});
// ============================================================================
// MANUAL CLEANUP FUNCTION
// ============================================================================
/**
 * Callable function to manually trigger cleanup for testing
 * Usage: firebase functions:call cleanupOrphanedData
 */
exports.cleanupOrphanedData = functions
    .region('europe-west1')
    .https
    .onCall(async (data, context) => {
    // Verify user is admin
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can call this function');
    }
    logger.info('Manual cleanup triggered by admin');
    try {
        // Run cleanup logic
        const orphanedMessagesSnapshot = await db
            .collectionGroup('messages')
            .where('carDeleted', '==', true)
            .get();
        const batch = db.batch();
        for (const doc of orphanedMessagesSnapshot.docs) {
            batch.delete(doc.ref);
        }
        await batch.commit();
        return {
            success: true,
            message: `Cleaned up ${orphanedMessagesSnapshot.docs.length} orphaned documents`
        };
    }
    catch (error) {
        logger.error(`Manual cleanup error: ${error}`);
        throw new functions.https.HttpsError('internal', 'Cleanup failed');
    }
});
/**
 * DEPLOYMENT INSTRUCTIONS:
 *
 * 1. Add these functions to functions/src/triggers/orphaned-data-cleanup.ts
 *
 * 2. Export in functions/src/index.ts:
 *    import * as orphanedCleanup from './triggers/orphaned-data-cleanup';
 *    export const onDeleteCar = orphanedCleanup.onDeleteCar;
 *    export const onDeleteProfile = orphanedCleanup.onDeleteProfile;
 *    export const onDeleteOffer = orphanedCleanup.onDeleteOffer;
 *    export const dailyOrphanedDataCleanup = orphanedCleanup.dailyOrphanedDataCleanup;
 *    export const cleanupOrphanedData = orphanedCleanup.cleanupOrphanedData;
 *
 * 3. Deploy:
 *    firebase deploy --only functions
 *
 * 4. Test locally:
 *    firebase emulate:functions
 *
 * 5. Monitor in console:
 *    firebase functions:log
 *
 * IMPORTANT NOTES:
 * - Ensure Firestore indexes are created for collectionGroup queries
 * - Add security rules to prevent unauthorized calls to cleanupOrphanedData
 * - Consider rate limiting for cleanup operations
 * - Set up alerts for failed cleanup operations
 * - Backup database regularly before cleanup operations
 */
//# sourceMappingURL=orphaned-data-cleanup.js.map