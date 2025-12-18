/**
 * Backup Cloud Functions
 * Automated and manual backup operations
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { backupService } from '../services/backup.service';

/**
 * Manual backup trigger (admin only)
 */
export const manualBackup = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can trigger manual backups'
      );
    }

    try {
      const { collectionIds } = data;
      
      console.log('🔄 Manual backup triggered by:', context.auth.uid);
      
      const result = await backupService.createBackup(collectionIds);
      
      return {
        success: true,
        ...result,
        message: 'Backup started successfully'
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Manual backup failed:', err.message);
      throw new functions.https.HttpsError('internal', err.message);
    }
  });

/**
 * Daily automated backup (3 AM)
 * Scheduled via Cloud Scheduler
 */
export const dailyBackup = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 3 * * *') // 3 AM every day
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    try {
      console.log('🔄 Daily backup started');
      
      const result = await backupService.createBackup();
      
      console.log('✅ Daily backup completed:', result);
      
      // Check status after 5 minutes
      setTimeout(async () => {
        const status = await backupService.getBackupStatus(result.operationName);
        console.log('📊 Backup status:', status);
      }, 5 * 60 * 1000);
      
      return { success: true, ...result };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Daily backup failed:', err.message);
      
      // Send alert
      await admin.firestore().collection('monitoring_alerts').add({
        source: 'custom',
        severity: 'high',
        title: 'Daily Backup Failed',
        message: err.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        acknowledged: false,
      });
      
      throw error;
    }
  });

/**
 * Weekly backup cleanup (Sunday 4 AM)
 * Deletes backups older than 90 days
 */
export const weeklyBackupCleanup = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 4 * * 0') // 4 AM every Sunday
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    try {
      console.log('🔄 Weekly backup cleanup started');
      
      const deletedCount = await backupService.deleteOldBackups(90);
      
      console.log(`✅ Cleanup complete: ${deletedCount} old backups deleted`);
      
      return { success: true, deletedCount };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Backup cleanup failed:', err.message);
      throw error;
    }
  });

/**
 * List available backups (admin only)
 */
export const listBackups = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can list backups'
      );
    }

    try {
      const { limit } = data;
      const backups = await backupService.listBackups(limit || 10);
      
      return {
        success: true,
        backups,
        total: backups.length,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Failed to list backups:', err.message);
      throw new functions.https.HttpsError('internal', err.message);
    }
  });

/**
 * Restore from backup (admin only, requires confirmation)
 */
export const restoreBackup = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can restore backups'
      );
    }

    const { inputUriPrefix, confirmationText } = data;

    // Require explicit confirmation
    if (confirmationText !== 'I UNDERSTAND THIS WILL OVERWRITE DATA') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Confirmation text does not match. Please type: "I UNDERSTAND THIS WILL OVERWRITE DATA"'
      );
    }

    try {
      console.log('🔄 Restore triggered by:', context.auth.uid);
      console.log('📂 Restore from:', inputUriPrefix);
      
      const result = await backupService.restoreBackup(inputUriPrefix);
      
      // Log restore operation with admin ID
      await admin.firestore().collection('restore_logs').add({
        adminId: context.auth.uid,
        adminEmail: context.auth.token.email || 'unknown',
        inputUriPrefix,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        operationName: result.name,
      });
      
      return {
        success: true,
        operationName: result.name,
        message: 'Restore started successfully. This may take several minutes.',
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Restore failed:', err.message);
      throw new functions.https.HttpsError('internal', err.message);
    }
  });
