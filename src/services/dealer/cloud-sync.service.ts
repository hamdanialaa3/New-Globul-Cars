import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

export type CloudProvider = 'google_drive' | 'dropbox';

export interface CloudSyncConfig {
  provider: CloudProvider;
  folderId: string;
  folderName: string;
  autoProcessing: boolean;
  syncFrequency: 'hourly' | 'daily';
  fileFilter: string[];
}

export interface SavedCloudSyncConfig extends CloudSyncConfig {
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSyncAt?: Timestamp;
}

class CloudSyncService {
  /**
   * Check whether the user already has an active config for this provider.
   * Returns `true` if a config exists — the UI can treat this as "connected".
   */
  async connectProvider(
    provider: CloudProvider,
    userId: string
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'cloud_sync_configs'),
        where('userId', '==', userId),
        where('provider', '==', provider)
      );
      const snap = await getDocs(q);
      const connected = !snap.empty;
      serviceLogger.info('Cloud provider connection check', {
        provider,
        userId,
        connected,
      });
      return connected;
    } catch (error) {
      serviceLogger.warn('Cloud provider check failed', {
        provider,
        userId,
        message: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Persist sync config to Firestore (upsert by userId + provider key).
   */
  async saveSyncConfig(userId: string, config: CloudSyncConfig): Promise<void> {
    const configId = `${userId}_${config.provider}`;
    const docRef = doc(db, 'cloud_sync_configs', configId);

    const payload: SavedCloudSyncConfig = {
      ...config,
      userId,
      createdAt: Timestamp.now(), // will be overwritten by merge if already exists
      updatedAt: Timestamp.now(),
    };

    await setDoc(docRef, payload, { merge: true });

    serviceLogger.info('Cloud sync config saved', {
      userId,
      provider: config.provider,
      folderId: config.folderId,
    });
  }

  /**
   * Queue a manual sync by writing a sync_requests document.
   * The `syncCloudFolders` Cloud Function picks this up.
   */
  async triggerManualSync(
    userId: string,
    provider: CloudProvider
  ): Promise<{ queued: boolean }> {
    const ref = doc(collection(db, 'sync_requests'));
    await setDoc(ref, {
      userId,
      provider,
      requestedAt: Timestamp.now(),
      status: 'pending',
    });
    serviceLogger.info('Manual cloud sync queued', { userId, provider });
    return { queued: true };
  }
}

export const cloudSyncService = new CloudSyncService();
