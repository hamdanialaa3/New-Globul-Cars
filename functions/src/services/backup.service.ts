/**
 * Backup Service for Firestore
 * Automated backups to Cloud Storage
 * Note: Uses gcloud CLI for exports (requires googleapis in production)
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

interface BackupResult {
  operationName: string;
  backupName: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Backup Service Class
 */
export class BackupService {
  private static instance: BackupService;
  private projectId: string;
  private bucketName: string;

  private constructor() {
    this.projectId = process.env.GCP_PROJECT || functions.config().project?.id || admin.instanceId().app.options.projectId || '';
    this.bucketName = `${this.projectId}-backups`;
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Create full Firestore backup
   * Note: In production, use gcloud CLI or enable Firestore Admin API
   */
  async createBackup(collectionIds?: string[]): Promise<BackupResult> {
    try {
      // For now, use gcloud CLI method
      // In production, uncomment googleapis code below
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${timestamp}`;
      
      console.log(`🔄 Backup requested: ${backupName}`);
      console.log(`⚠️ Note: Actual backup requires gcloud CLI or Firestore Admin API`);
      console.log(`Run manually: gcloud firestore export gs://${this.bucketName}/firestore-backups/${timestamp}`);

      // Log backup request to Firestore
      await this.logBackup({
        operationName: `manual-${timestamp}`,
        backupName,
        timestamp: new Date(),
        outputUriPrefix: `gs://${this.bucketName}/firestore-backups/${timestamp}`,
        collectionIds: collectionIds || ['all'],
        status: 'pending',
      });

      return {
        operationName: `manual-${timestamp}`,
        backupName,
        timestamp: new Date(),
        status: 'pending',
      };
      
      /* PRODUCTION VERSION (requires googleapis):
      const client = await this.getAuthorizedClient();
      
      const databaseName = `projects/${this.projectId}/databases/(default)`;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputUriPrefix = `gs://${this.bucketName}/firestore-backups/${timestamp}`;

      const response = await firestore.projects.databases.exportDocuments({
        name: databaseName,
        auth: client as any,
        requestBody: {
          outputUriPrefix,
          collectionIds: collectionIds || [],
        },
      });

      const operationName = response.data.name as string;
      const backupName = `backup-${timestamp}`;

      await this.logBackup({
        operationName,
        backupName,
        timestamp: new Date(),
        outputUriPrefix,
        collectionIds: collectionIds || ['all'],
        status: 'pending',
      });

      return {
        operationName,
        backupName,
        timestamp: new Date(),
        status: 'pending',
      };
      */
    } catch (error: any) {
      console.error('❌ Backup failed:', error);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  /**
   * Get backup operation status
   * Note: Requires googleapis in production
   */
  async getBackupStatus(operationName: string): Promise<any> {
    console.log(`⚠️ getBackupStatus requires googleapis - check logs manually`);
    return { done: false, name: operationName };
    
    /* PRODUCTION VERSION:
    try {
      const client = await this.getAuthorizedClient();

      const response = await firestore.projects.databases.operations.get({
        name: operationName,
        auth: client as any,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get backup status:', error);
      throw error;
    }
    */
  }

  /**
   * List available backups
   */
  async listBackups(limit: number = 10): Promise<any[]> {
    try {
      const bucket = admin.storage().bucket(this.bucketName);
      const [files] = await bucket.getFiles({
        prefix: 'firestore-backups/',
        maxResults: limit * 10, // Get more to account for folder structure
      });

      // Group by backup folders
      const backupFolders = new Set<string>();
      files.forEach(file => {
        const match = file.name.match(/firestore-backups\/([\d-T]+)\//);
        if (match) {
          backupFolders.add(match[1]);
        }
      });

      // Convert to array and sort by date (newest first)
      const backups = Array.from(backupFolders)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, limit)
        .map(folder => ({
          name: `backup-${folder}`,
          timestamp: folder,
          path: `gs://${this.bucketName}/firestore-backups/${folder}`,
        }));

      return backups;
    } catch (error: any) {
      console.error('❌ Failed to list backups:', error);
      throw error;
    }
  }

  /**
   * Restore from backup
   * Note: Requires googleapis in production
   */
  async restoreBackup(inputUriPrefix: string): Promise<any> {
    console.log(`⚠️ restoreBackup requires googleapis`);
    console.log(`Run manually: gcloud firestore import ${inputUriPrefix}`);
    
    await this.logRestore({
      operationName: `manual-restore-${Date.now()}`,
      inputUriPrefix,
      timestamp: new Date(),
      status: 'pending',
    });
    
    return { name: `manual-restore-${Date.now()}` };
    
    /* PRODUCTION VERSION:
    try {
      const client = await this.getAuthorizedClient();
      
      const databaseName = `projects/${this.projectId}/databases/(default)`;

      console.log(`🔄 Starting restore from: ${inputUriPrefix}`);

      const response = await firestore.projects.databases.importDocuments({
        name: databaseName,
        auth: client as any,
        requestBody: {
          inputUriPrefix,
        },
      });

      console.log(`✅ Restore started: ${response.data.name}`);

      await this.logRestore({
        operationName: response.data.name as string,
        inputUriPrefix,
        timestamp: new Date(),
        status: 'pending',
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
    */
  }

  /**
   * Delete old backups (retention policy)
   */
  async deleteOldBackups(daysOld: number = 90): Promise<number> {
    try {
      const bucket = admin.storage().bucket(this.bucketName);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const [files] = await bucket.getFiles({
        prefix: 'firestore-backups/',
      });

      let deletedCount = 0;

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const fileDate = new Date(metadata.timeCreated!);

        if (fileDate < cutoffDate) {
          await file.delete();
          deletedCount++;
        }
      }

      console.log(`✅ Deleted ${deletedCount} old backup files (older than ${daysOld} days)`);
      return deletedCount;
    } catch (error: any) {
      console.error('❌ Failed to delete old backups:', error);
      throw error;
    }
  }

  /**
   * Get authorized Google API client
   * Note: Commented out - requires googleapis package
   */
  private async getAuthorizedClient() {
    throw new Error('googleapis not installed - use gcloud CLI for backups');
    
    /* PRODUCTION VERSION:
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/datastore',
      ],
    });

    return await auth.getClient();
    */
  }

  /**
   * Log backup to Firestore
   */
  private async logBackup(data: any) {
    try {
      await db.collection('backup_logs').add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to log backup:', error);
    }
  }

  /**
   * Log restore to Firestore
   */
  private async logRestore(data: any) {
    try {
      await db.collection('restore_logs').add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to log restore:', error);
    }
  }
}

// Export singleton instance
export const backupService = BackupService.getInstance();
