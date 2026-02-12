/**
 * Archive Sold Cars - Scheduled Cloud Function
 * 
 * Automatically archives cars that have been sold for more than 30 days.
 * This prevents database bloat and keeps search results clean.
 * 
 * Runs daily at 3 AM (Bulgaria timezone)
 * 
 * @since January 6, 2026
 * @author Koli One Team
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

// All vehicle collections (from Constitution - Multi-collection pattern)
const VEHICLE_COLLECTIONS = [
    'passenger_cars',
    'suvs',
    'vans',
    'motorcycles',
    'trucks',
    'buses'
];

// Archive threshold: 30 days after marked as sold
const ARCHIVE_AFTER_DAYS = 30;

interface ArchiveResult {
    collection: string;
    archived: number;
    errors: number;
}

interface ArchiveSummary {
    totalArchived: number;
    totalErrors: number;
    collections: ArchiveResult[];
    executionTime: number;
}

/**
 * Scheduled function to archive sold cars
 * Runs daily at 3 AM Bulgaria time (EET/EEST)
 */
export const archiveSoldCars = functions
    .region("europe-west1")
    .pubsub.schedule("0 3 * * *") // Every day at 3 AM
    .timeZone("Europe/Sofia")
    .onRun(async (): Promise<void> => {
        const startTime = Date.now();
        
        logger.info("🚗 Starting archiveSoldCars job", {
            timestamp: new Date().toISOString(),
            archiveThreshold: `${ARCHIVE_AFTER_DAYS} days`
        });

        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - ARCHIVE_AFTER_DAYS);
        const thresholdTimestamp = admin.firestore.Timestamp.fromDate(thresholdDate);

        const summary: ArchiveSummary = {
            totalArchived: 0,
            totalErrors: 0,
            collections: [],
            executionTime: 0
        };

        // Process each vehicle collection
        for (const collectionName of VEHICLE_COLLECTIONS) {
            const result = await archiveCollectionSoldCars(collectionName, thresholdTimestamp);
            summary.collections.push(result);
            summary.totalArchived += result.archived;
            summary.totalErrors += result.errors;
        }

        summary.executionTime = Date.now() - startTime;

        // Log summary
        logger.info("✅ archiveSoldCars job completed", {
            summary,
            executionTimeMs: summary.executionTime
        });

        // Record job execution for monitoring
        await recordJobExecution(summary);
    });

/**
 * Archive sold cars from a specific collection
 */
async function archiveCollectionSoldCars(
    collectionName: string, 
    thresholdTimestamp: admin.firestore.Timestamp
): Promise<ArchiveResult> {
    const result: ArchiveResult = {
        collection: collectionName,
        archived: 0,
        errors: 0
    };

    try {
        // Find cars that are sold and older than threshold
        const soldCarsQuery = db.collection(collectionName)
            .where('status', '==', 'sold')
            .where('isActive', '==', true) // Only process active (non-archived) cars
            .where('soldAt', '<', thresholdTimestamp)
            .limit(500); // Process in batches to avoid timeout

        const snapshot = await soldCarsQuery.get();

        if (snapshot.empty) {
            logger.info(`📦 [${collectionName}] No cars to archive`);
            return result;
        }

        logger.info(`📦 [${collectionName}] Found ${snapshot.size} cars to archive`);

        // Process in batches of 500 (Firestore limit)
        const batch = db.batch();
        const archivedDocs: string[] = [];

        for (const doc of snapshot.docs) {
            const carData = doc.data();
            
            try {
                // 1. Move to archived collection
                const archivedRef = db.collection(`archived_${collectionName}`).doc(doc.id);
                batch.set(archivedRef, {
                    ...carData,
                    archivedAt: admin.firestore.FieldValue.serverTimestamp(),
                    archivedFrom: collectionName,
                    archivedReason: 'sold_auto_cleanup'
                });

                // 2. Mark original as inactive (soft delete)
                batch.update(doc.ref, {
                    isActive: false,
                    archivedAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                archivedDocs.push(doc.id);
                result.archived++;

            } catch (docError) {
                logger.error(`❌ [${collectionName}] Failed to archive ${doc.id}`, { error: docError });
                result.errors++;
            }
        }

        // Commit the batch
        await batch.commit();

        logger.info(`✅ [${collectionName}] Archived ${result.archived} cars`, {
            carIds: archivedDocs.slice(0, 10) // Log first 10 for debugging
        });

    } catch (error) {
        logger.error(`❌ [${collectionName}] Collection archive failed`, { error });
        result.errors++;
    }

    return result;
}

/**
 * Record job execution for monitoring and auditing
 */
async function recordJobExecution(summary: ArchiveSummary): Promise<void> {
    try {
        await db.collection('system_jobs').add({
            jobName: 'archiveSoldCars',
            status: summary.totalErrors === 0 ? 'success' : 'partial_success',
            totalArchived: summary.totalArchived,
            totalErrors: summary.totalErrors,
            collections: summary.collections,
            executionTimeMs: summary.executionTime,
            executedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        logger.error("Failed to record job execution", { error });
    }
}

/**
 * HTTP trigger to manually run the archive job (for admins)
 * Can be called via: POST /manualArchiveSoldCars
 */
export const manualArchiveSoldCars = functions
    .region("europe-west1")
    .https.onCall(async (data, context) => {
        // Verify admin access
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
        }

        // Check if user is admin (you should have admin check logic)
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        const userData = userDoc.data();
        
        if (!userData?.isAdmin && !userData?.isSuperAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }

        logger.info("Manual archive triggered by admin", { adminId: context.auth.uid });

        const startTime = Date.now();
        
        const thresholdDate = new Date();
        const daysOverride = data?.daysThreshold || ARCHIVE_AFTER_DAYS;
        thresholdDate.setDate(thresholdDate.getDate() - daysOverride);
        const thresholdTimestamp = admin.firestore.Timestamp.fromDate(thresholdDate);

        const summary: ArchiveSummary = {
            totalArchived: 0,
            totalErrors: 0,
            collections: [],
            executionTime: 0
        };

        for (const collectionName of VEHICLE_COLLECTIONS) {
            const result = await archiveCollectionSoldCars(collectionName, thresholdTimestamp);
            summary.collections.push(result);
            summary.totalArchived += result.archived;
            summary.totalErrors += result.errors;
        }

        summary.executionTime = Date.now() - startTime;

        await recordJobExecution(summary);

        return {
            success: true,
            message: `Archived ${summary.totalArchived} sold cars across ${VEHICLE_COLLECTIONS.length} collections`,
            summary
        };
    });

/**
 * Cleanup expired drafts (cars that were never published)
 * Runs weekly on Sunday at 4 AM
 */
export const cleanupExpiredDrafts = functions
    .region("europe-west1")
    .pubsub.schedule("0 4 * * 0") // Every Sunday at 4 AM
    .timeZone("Europe/Sofia")
    .onRun(async (): Promise<void> => {
        const startTime = Date.now();
        
        logger.info("🗑️ Starting cleanupExpiredDrafts job");

        // Drafts older than 30 days should be cleaned
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - 30);
        const thresholdTimestamp = admin.firestore.Timestamp.fromDate(thresholdDate);

        try {
            const draftsQuery = db.collection('drafts')
                .where('createdAt', '<', thresholdTimestamp)
                .limit(500);

            const snapshot = await draftsQuery.get();

            if (snapshot.empty) {
                logger.info("📦 No expired drafts to clean");
                return;
            }

            const batch = db.batch();
            let deletedCount = 0;

            for (const doc of snapshot.docs) {
                // Move to archived_drafts for safety
                const archivedRef = db.collection('archived_drafts').doc(doc.id);
                batch.set(archivedRef, {
                    ...doc.data(),
                    archivedAt: admin.firestore.FieldValue.serverTimestamp(),
                    archivedReason: 'expired_auto_cleanup'
                });
                
                batch.delete(doc.ref);
                deletedCount++;
            }

            await batch.commit();

            logger.info(`✅ Cleaned up ${deletedCount} expired drafts`, {
                executionTimeMs: Date.now() - startTime
            });

        } catch (error) {
            logger.error("❌ Failed to cleanup expired drafts", { error });
        }
    });
