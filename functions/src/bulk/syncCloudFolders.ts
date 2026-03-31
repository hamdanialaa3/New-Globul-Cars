import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * syncCloudFolders — runs every 60 minutes.
 *
 * 1. Heartbeat-updates all active cloud_sync_configs.
 * 2. Processes any pending sync_requests created by the client,
 *    marking them as 'processed'.
 */
export const syncCloudFolders = functions.pubsub
  .schedule('every 60 minutes')
  .timeZone('Europe/Sofia')
  .onRun(async () => {
    const now = admin.firestore.FieldValue.serverTimestamp();

    // 1. Update heartbeats
    const configs = await db
      .collection('cloud_sync_configs')
      .where('autoProcessing', '==', true)
      .get();

    if (!configs.empty) {
      const batch = db.batch();
      configs.forEach(d => {
        batch.update(d.ref, { lastSyncAt: now });
      });
      await batch.commit();
      functions.logger.info('[syncCloudFolders] Heartbeat updated', {
        count: configs.size,
      });
    }

    // 2. Process pending manual sync requests
    const requests = await db
      .collection('sync_requests')
      .where('status', '==', 'pending')
      .limit(50)
      .get();

    if (!requests.empty) {
      const reqBatch = db.batch();
      requests.forEach(d => {
        reqBatch.update(d.ref, { status: 'processed', processedAt: now });
      });
      await reqBatch.commit();
      functions.logger.info('[syncCloudFolders] Processed sync requests', {
        count: requests.size,
      });
    }

    return null;
  });
