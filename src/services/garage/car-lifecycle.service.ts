/**
 * Car Lifecycle Service
 * ====================
 * Manages car-related side effects across the platform
 *
 * @critical Prevents orphaned conversations when cars are sold/deleted
 * @author Phase 4.4 - Lifecycle Management
 * @date January 14, 2026
 */

import { getDatabase, ref, get, update } from 'firebase/database';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp as firestoreTimestamp,
} from 'firebase/firestore';
import { db as firestoreDb } from '@/firebase';
import { logger } from '@/services/logger-service';

/**
 * Car status after lifecycle event
 */
export type CarStatus = 'active' | 'sold' | 'deleted' | 'suspended' | 'expired';

/**
 * Archive conversations when car is no longer available
 *
 * @param carNumericId The numeric ID of the car
 * @param carFirebaseId The Firebase document ID of the car
 * @param newStatus The new status of the car
 *
 * @description
 * When a car is sold or deleted:
 * 1. Find all RTDB channels with this car
 * 2. Update channel status to 'archived'
 * 3. Add archival metadata (reason, timestamp)
 * 4. Prevent new messages in archived channels
 */
export async function archiveCarConversations(
  carNumericId: number,
  carFirebaseId: string,
  newStatus: CarStatus
): Promise<{ archivedCount: number }> {
  if (!carNumericId || !carFirebaseId) {
    logger.warn(
      '[CarLifecycle] Invalid parameters for archiveCarConversations',
      {
        carNumericId,
        carFirebaseId,
      }
    );
    return { archivedCount: 0 };
  }

  try {
    const rtdb = getDatabase();

    // Find all channels for this car
    const channelsRef = ref(rtdb, 'channels');
    const snapshot = await get(channelsRef);

    if (!snapshot.exists()) {
      logger.info('[CarLifecycle] No channels found to archive', {
        carNumericId,
      });
      return { archivedCount: 0 };
    }

    const channels = snapshot.val();
    const archivePromises: Promise<void>[] = [];
    let archivedCount = 0;

    // Find channels matching this car
    for (const [channelId, channelData] of Object.entries(channels)) {
      const channel = channelData as any;

      if (channel.carNumericId === carNumericId) {
        // Archive this channel
        const channelRef = ref(rtdb, `channels/${channelId}`);

        archivePromises.push(
          update(channelRef, {
            status: 'archived',
            archivedAt: Date.now(),
            archivedReason: newStatus === 'sold' ? 'car_sold' : 'car_deleted',
            archivedMetadata: {
              carNumericId,
              carFirebaseId,
              previousStatus: channel.status || 'active',
              timestamp: Date.now(),
            },
          }).then(() => {
            logger.info('[CarLifecycle] Archived channel', {
              channelId,
              carNumericId,
              reason: newStatus,
            });
          })
        );

        archivedCount++;
      }
    }

    // Execute all archive operations
    await Promise.all(archivePromises);

    logger.info('[CarLifecycle] Archived car conversations', {
      carNumericId,
      carFirebaseId,
      newStatus,
      archivedCount,
    });

    return { archivedCount };
  } catch (error) {
    logger.error(
      '[CarLifecycle] Failed to archive car conversations',
      error as Error,
      {
        carNumericId,
        carFirebaseId,
        newStatus,
      }
    );

    throw error;
  }
}

/**
 * Mark car as sold and archive conversations
 *
 * @param carNumericId The numeric ID of the car
 * @param carFirebaseId The Firebase document ID of the car
 * @param collectionName The Firestore collection (passenger_cars, suvs, etc.)
 */
export async function markCarAsSold(
  carNumericId: number,
  carFirebaseId: string,
  collectionName: string
): Promise<void> {
  try {
    // Update Firestore car document
    const carRef = doc(firestoreDb, collectionName, carFirebaseId);
    await updateDoc(carRef, {
      status: 'sold',
      soldAt: firestoreTimestamp(),
      updatedAt: firestoreTimestamp(),
    });

    // Archive conversations
    await archiveCarConversations(carNumericId, carFirebaseId, 'sold');

    logger.info('[CarLifecycle] Car marked as sold', {
      carNumericId,
      carFirebaseId,
      collectionName,
    });

    // Emit profile event for points/achievements/transactions (fire-and-forget)
    // Read car data to include in event meta
    try {
      const carSnap = await getDoc(carRef);
      const carData = carSnap.exists() ? carSnap.data() : {};
      const { emitProfileEvent } =
        await import('@/services/profile/profile-event-bus');
      emitProfileEvent({
        type: 'listing_sold',
        userId: carData?.sellerId ?? carData?.userId ?? '',
        meta: {
          carId: carFirebaseId,
          carMake: carData?.make ?? '',
          carModel: carData?.model ?? '',
          carYear: carData?.year ?? 0,
          salePrice: carData?.price ?? 0,
        },
      });
    } catch {
      /* non-blocking */
    }
  } catch (error) {
    logger.error('[CarLifecycle] Failed to mark car as sold', error as Error, {
      carNumericId,
      carFirebaseId,
      collectionName,
    });
    throw error;
  }
}

/**
 * Delete car and archive conversations
 *
 * @param carNumericId The numeric ID of the car
 * @param carFirebaseId The Firebase document ID of the car
 * @param collectionName The Firestore collection
 */
export async function deleteCarWithArchive(
  carNumericId: number,
  carFirebaseId: string,
  collectionName: string
): Promise<void> {
  try {
    // Archive conversations BEFORE deleting car
    await archiveCarConversations(carNumericId, carFirebaseId, 'deleted');

    // Update car status (soft delete - keep document for history)
    const carRef = doc(firestoreDb, collectionName, carFirebaseId);
    await updateDoc(carRef, {
      status: 'deleted',
      deletedAt: firestoreTimestamp(),
      updatedAt: firestoreTimestamp(),
      isActive: false,
    });

    logger.info('[CarLifecycle] Car deleted with conversation archive', {
      carNumericId,
      carFirebaseId,
      collectionName,
    });
  } catch (error) {
    logger.error('[CarLifecycle] Failed to delete car', error as Error, {
      carNumericId,
      carFirebaseId,
      collectionName,
    });
    throw error;
  }
}

/**
 * Check if channel is archived (prevents new messages)
 *
 * @param channelId The channel ID to check
 * @returns True if channel is archived
 */
export async function isChannelArchived(channelId: string): Promise<boolean> {
  try {
    const rtdb = getDatabase();
    const channelRef = ref(rtdb, `channels/${channelId}`);
    const snapshot = await get(channelRef);

    if (!snapshot.exists()) {
      return false;
    }

    const channel = snapshot.val();
    return channel.status === 'archived';
  } catch (error) {
    logger.error(
      '[CarLifecycle] Failed to check channel archive status',
      error as Error,
      {
        channelId,
      }
    );
    return false;
  }
}

/**
 * Get archive metadata for a channel
 *
 * @param channelId The channel ID
 * @returns Archive metadata or null
 */
export async function getChannelArchiveMetadata(channelId: string): Promise<{
  reason: string;
  archivedAt: number;
  carNumericId: number;
  carFirebaseId: string;
} | null> {
  try {
    const rtdb = getDatabase();
    const channelRef = ref(rtdb, `channels/${channelId}`);
    const snapshot = await get(channelRef);

    if (!snapshot.exists()) {
      return null;
    }

    const channel = snapshot.val();

    if (channel.status !== 'archived') {
      return null;
    }

    return {
      reason: channel.archivedReason || 'unknown',
      archivedAt: channel.archivedAt || 0,
      carNumericId: channel.archivedMetadata?.carNumericId || 0,
      carFirebaseId: channel.archivedMetadata?.carFirebaseId || '',
    };
  } catch (error) {
    logger.error(
      '[CarLifecycle] Failed to get archive metadata',
      error as Error,
      {
        channelId,
      }
    );
    return null;
  }
}

/**
 * Reactivate archived channel (if car becomes available again)
 *
 * @param channelId The channel ID to reactivate
 */
export async function reactivateChannel(channelId: string): Promise<void> {
  try {
    const rtdb = getDatabase();
    const channelRef = ref(rtdb, `channels/${channelId}`);

    await update(channelRef, {
      status: 'active',
      reactivatedAt: Date.now(),
      archivedAt: null,
      archivedReason: null,
      archivedMetadata: null,
    });

    logger.info('[CarLifecycle] Channel reactivated', { channelId });
  } catch (error) {
    logger.error(
      '[CarLifecycle] Failed to reactivate channel',
      error as Error,
      {
        channelId,
      }
    );
    throw error;
  }
}

/**
 * Get all channels for a car (for diagnostics)
 *
 * @param carNumericId The numeric ID of the car
 * @returns Array of channel IDs
 */
export async function getCarChannels(carNumericId: number): Promise<string[]> {
  try {
    const rtdb = getDatabase();
    const channelsRef = ref(rtdb, 'channels');
    const snapshot = await get(channelsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const channels = snapshot.val();
    const carChannels: string[] = [];

    for (const [channelId, channelData] of Object.entries(channels)) {
      const channel = channelData as any;
      if (channel.carNumericId === carNumericId) {
        carChannels.push(channelId);
      }
    }

    return carChannels;
  } catch (error) {
    logger.error('[CarLifecycle] Failed to get car channels', error as Error, {
      carNumericId,
    });
    return [];
  }
}

export default {
  archiveCarConversations,
  markCarAsSold,
  deleteCarWithArchive,
  isChannelArchived,
  getChannelArchiveMetadata,
  reactivateChannel,
  getCarChannels,
};
