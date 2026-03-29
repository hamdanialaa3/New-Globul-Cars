/**
 * Firestore Backup - Scheduled Cloud Function
 *
 * Automatically exports all Firestore collections to Cloud Storage daily.
 * Uses the Firestore Admin API exportDocuments method.
 *
 * Runs daily at 2 AM (Bulgaria timezone), before archive-sold-cars.
 *
 * Prerequisites:
 *   - Cloud Storage bucket must exist (e.g., gs://koli-one-backups)
 *   - Service account needs "Cloud Datastore Import Export Admin" role
 *   - Service account needs write access to the backup bucket
 *
 * @since 2026
 * @author Koli One Team
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

const BACKUP_BUCKET = process.env.FIRESTORE_BACKUP_BUCKET || 'koli-one-backups';
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || '';

// Critical collections to back up
const COLLECTIONS_TO_BACKUP = [
  'users',
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses',
  'construction_machines',
  'agricultural_machines',
  'trailers',
  'campers',
  'forklifts',
  'boats',
  'conversations',
  'payments',
  'subscriptions',
  'dealer_profiles',
  'analytics_events',
  'ai_usage_logs',
];

/**
 * Daily Firestore backup via exportDocuments API.
 * Scheduled at 2:00 AM Europe/Sofia.
 */
export const scheduledFirestoreBackup = functions
  .region('europe-west1')
  .pubsub.schedule('0 2 * * *')
  .timeZone('Europe/Sofia')
  .onRun(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputUri = `gs://${BACKUP_BUCKET}/backups/${timestamp}`;

    logger.info(`[firestore-backup] Starting backup to ${outputUri}`);

    try {
      const client = new admin.firestore.v1.FirestoreAdminClient();

      const databaseName = client.databasePath(PROJECT_ID, '(default)');

      const [response] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: outputUri,
        collectionIds: COLLECTIONS_TO_BACKUP,
      });

      logger.info('[firestore-backup] Export operation started', {
        operationName: response.name,
        outputUri,
        collections: COLLECTIONS_TO_BACKUP.length,
      });

      // Log success to Firestore for monitoring
      await admin.firestore().collection('system_logs').add({
        type: 'firestore_backup',
        status: 'started',
        outputUri,
        operationName: response.name,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        collectionsCount: COLLECTIONS_TO_BACKUP.length,
      });

      return null;
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Unknown backup error';
      logger.error('[firestore-backup] Backup failed', { error: errMsg });

      // Log failure for alerting
      await admin.firestore().collection('system_logs').add({
        type: 'firestore_backup',
        status: 'failed',
        error: errMsg,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return null;
    }
  });
