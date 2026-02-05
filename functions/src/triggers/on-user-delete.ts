/**
 * 🔴 CRITICAL: Firebase Auth User Deletion Trigger
 * Cloud Function triggered automatically when a user deletes their Firebase Auth account
 * 
 * @description This function ensures GDPR compliance by cleaning up ALL user data
 * when a user deletes their authentication account, including:
 * - All car listings across 6 collections
 * - All messages in Realtime Database
 * - All favorites, notifications, reviews, posts
 * - All analytics data and team memberships
 * - Profile pictures from Storage
 * 
 * @architecture
 * - Triggered by Firebase Auth user deletion event
 * - Uses Firestore batch operations for atomic deletions
 * - Handles Realtime Database cleanup separately
 * - Logs all deletions for compliance audit
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses numeric ID system (CONSTITUTION Section 4.1)
 * - Multi-collection pattern (CONSTITUTION Section 4.2)
 * - Proper error handling and logging (CONSTITUTION Section 4.4)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { UserRecord } from 'firebase-functions/v1/auth';

// Firebase Admin initialization
if (!admin.apps.length) {
  admin.initializeApp();
}

const logger = functions.logger;
const db = admin.firestore();
const rtdb = admin.database();
const storage = admin.storage();

/**
 * Vehicle Collections (CONSTITUTION Section 4.2 - Multi-collection Pattern)
 */
const VEHICLE_COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses'
] as const;

/**
 * Main trigger function: onUserDelete
 * Triggered automatically when Firebase Auth user is deleted
 */
export const onUserDelete = functions.auth.user().onDelete(async (user: UserRecord) => {
  const userId = user.uid;
  const userEmail = user.email || 'unknown';
  
  logger.info('🗑️ User deletion triggered', { userId, email: userEmail });

  const deletedCollections: string[] = [];
  const errors: string[] = [];

  try {
    // Step 1: Get user's numeric ID before deleting user document
    let userNumericId: number | null = null;
    try {
      const userDoc = await db.doc(`users/${userId}`).get();
      if (userDoc.exists) {
        userNumericId = userDoc.data()?.numericId || null;
        logger.info('User numeric ID found', { userId, numericId: userNumericId });
      }
    } catch (error) {
      logger.warn('Could not fetch user numeric ID', { userId, error });
      errors.push(`fetch_user_numericId: ${(error as Error).message}`);
    }

    // Step 2: Delete all car listings across 6 collections (CONSTITUTION Section 4.2)
    logger.info('Deleting car listings across collections', { userId });
    for (const collectionName of VEHICLE_COLLECTIONS) {
      try {
        const carsQuery = db.collection(collectionName).where('sellerId', '==', userId);
        const carsSnapshot = await carsQuery.get();

        if (!carsSnapshot.empty) {
          // Use batch for atomic deletion (max 500 operations per batch)
          const batches: admin.firestore.WriteBatch[] = [];
          let currentBatch = db.batch();
          let operationCount = 0;

          carsSnapshot.docs.forEach((carDoc) => {
            if (operationCount >= 500) {
              batches.push(currentBatch);
              currentBatch = db.batch();
              operationCount = 0;
            }
            currentBatch.delete(carDoc.ref);
            operationCount++;
          });

          if (operationCount > 0) {
            batches.push(currentBatch);
          }

          // Commit all batches
          await Promise.all(batches.map(batch => batch.commit()));
          
          deletedCollections.push(`${collectionName} (${carsSnapshot.size} items)`);
          logger.info('Car listings deleted', { collection: collectionName, count: carsSnapshot.size, userId });
        }
      } catch (error) {
        const errorMsg = `${collectionName}: ${(error as Error).message}`;
        errors.push(errorMsg);
        logger.error('Failed to delete car listings', { collection: collectionName, userId, error });
      }
    }

    // Step 3: Delete Realtime Database channels and messages
    if (userNumericId) {
      try {
        logger.info('Deleting Realtime Database channels', { userId, numericId: userNumericId });
        
        // Find all channels where user is buyer or seller
        const channelsRef = rtdb.ref('channels');
        const channelsSnapshot = await channelsRef.once('value');
        
        if (channelsSnapshot.exists()) {
          const channels = channelsSnapshot.val();
          const deletePromises: Promise<void>[] = [];

          for (const [channelId, channelData] of Object.entries(channels)) {
            const channel = channelData as { buyerFirebaseId?: string; sellerFirebaseId?: string };
            
            if (channel.buyerFirebaseId === userId || channel.sellerFirebaseId === userId) {
              // Delete entire channel (includes messages sub-path)
              deletePromises.push(
                rtdb.ref(`channels/${channelId}`).remove()
                  .then(() => {
                    logger.debug('Channel deleted', { channelId, userId });
                  })
                  .catch((error) => {
                    logger.error('Failed to delete channel', { channelId, userId, error });
                  })
              );
            }
          }

          await Promise.all(deletePromises);
          deletedCollections.push(`realtime_channels (${deletePromises.length} channels)`);
        }

        // Delete user_channels index
        try {
          await rtdb.ref(`user_channels/${userNumericId}`).remove();
        } catch (error) {
          logger.warn('Could not delete user_channels index', { numericId: userNumericId, error });
        }

        // Delete presence
        try {
          await rtdb.ref(`presence/${userNumericId}`).remove();
        } catch (error) {
          logger.warn('Could not delete presence', { numericId: userNumericId, error });
        }

        // Delete typing indicators (scan all channels)
        try {
          const typingRef = rtdb.ref('typing');
          const typingSnapshot = await typingRef.once('value');
          
          if (typingSnapshot.exists()) {
            const typing = typingSnapshot.val();
            const typingDeletePromises: Promise<void>[] = [];

            for (const [channelId, channelTyping] of Object.entries(typing)) {
              const channel = channelTyping as Record<string, unknown>;
              if (channel[String(userNumericId)]) {
                typingDeletePromises.push(
                  rtdb.ref(`typing/${channelId}/${userNumericId}`).remove()
                );
              }
            }

            await Promise.all(typingDeletePromises);
          }
        } catch (error) {
          logger.warn('Could not delete typing indicators', { numericId: userNumericId, error });
        }

        logger.info('Realtime Database cleanup completed', { userId, numericId: userNumericId });
      } catch (error) {
        errors.push(`realtime_database: ${(error as Error).message}`);
        logger.error('Failed to delete Realtime Database data', { userId, numericId: userNumericId, error });
      }
    }

    // Step 4: Delete user data collections (favorites, notifications, reviews, posts, etc.)
    const userDataCollections = [
      'favorites',
      'saved_searches',
      'notifications',
      'reviews',
      'posts',
      'follows',
      'campaigns',
      'consultations',
      'analytics_events',
      'profile_analytics',
      'profile_metrics',
      'profile_stats',
      'searchHistory',
      'leaderboard',
      'challenges',
      'user_challenges',
      'stories',
      'user_achievements',
      'user_badges',
      'userPoints',
      'listing_reviews'
    ];

    logger.info('Deleting user data collections', { userId, collections: userDataCollections.length });
    for (const collectionName of userDataCollections) {
      try {
        // Handle different field names for userId
        const userIdFields = ['userId', 'userRef', 'authorId', 'buyerId', 'requesterId', 'followerId', 'followingId'];
        
        for (const fieldName of userIdFields) {
          try {
            const dataQuery = db.collection(collectionName).where(fieldName, '==', userId);
            const dataSnapshot = await dataQuery.get();

            if (!dataSnapshot.empty) {
              const batches: admin.firestore.WriteBatch[] = [];
              let currentBatch = db.batch();
              let operationCount = 0;

              dataSnapshot.docs.forEach((doc) => {
                if (operationCount >= 500) {
                  batches.push(currentBatch);
                  currentBatch = db.batch();
                  operationCount = 0;
                }
                currentBatch.delete(doc.ref);
                operationCount++;
              });

              if (operationCount > 0) {
                batches.push(currentBatch);
              }

              await Promise.all(batches.map(batch => batch.commit()));
              
              const countKey = `${collectionName}_${fieldName}`;
              if (!deletedCollections.includes(countKey)) {
                deletedCollections.push(`${collectionName} (${dataSnapshot.size} items by ${fieldName})`);
              }
              logger.debug('User data deleted', { collection: collectionName, field: fieldName, count: dataSnapshot.size, userId });
            }
          } catch (queryError) {
            // Field might not exist in collection, continue
            logger.debug('Query failed (field may not exist)', { collection: collectionName, field: fieldName, error: queryError });
          }
        }
      } catch (error) {
        errors.push(`${collectionName}: ${(error as Error).message}`);
        logger.error('Failed to delete user data collection', { collection: collectionName, userId, error });
      }
    }

    // Step 5: Delete comments and likes in posts (sub-collections)
    try {
      const postsQuery = db.collection('posts').where('userId', '==', userId);
      const postsSnapshot = await postsQuery.get();

      for (const postDoc of postsSnapshot.docs) {
        try {
          // Delete comments sub-collection
          const commentsRef = postDoc.ref.collection('comments');
          const commentsSnapshot = await commentsRef.get();
          const commentsBatch = db.batch();
          commentsSnapshot.docs.forEach(commentDoc => commentsBatch.delete(commentDoc.ref));
          await commentsBatch.commit();

          // Delete likes sub-collection
          const likesRef = postDoc.ref.collection('likes');
          const likesSnapshot = await likesRef.get();
          const likesBatch = db.batch();
          likesSnapshot.docs.forEach(likeDoc => likesBatch.delete(likeDoc.ref));
          await likesBatch.commit();
        } catch (error) {
          logger.warn('Failed to delete post sub-collections', { postId: postDoc.id, userId, error });
        }
      }
    } catch (error) {
      logger.error('Failed to delete posts sub-collections', { userId, error });
      errors.push(`posts_subcollections: ${(error as Error).message}`);
    }

    // Step 6: Delete team memberships (if Company account)
    try {
      // Delete as team member in other companies
      const teamMembersQuery = db.collectionGroup('team_members').where('linkedUserId', '==', userId);
      const teamMembersSnapshot = await teamMembersQuery.get();

      if (!teamMembersSnapshot.empty) {
        const batches: admin.firestore.WriteBatch[] = [];
        let currentBatch = db.batch();
        let operationCount = 0;

        teamMembersSnapshot.docs.forEach((doc) => {
          if (operationCount >= 500) {
            batches.push(currentBatch);
            currentBatch = db.batch();
            operationCount = 0;
          }
          currentBatch.delete(doc.ref);
          operationCount++;
        });

        if (operationCount > 0) {
          batches.push(currentBatch);
        }

        await Promise.all(batches.map(batch => batch.commit()));
        deletedCollections.push(`team_members (${teamMembersSnapshot.size} memberships)`);
      }

      // Delete team invitations
      const invitationsQuery = db.collection('team_invitations').where('userId', '==', userId);
      const invitationsSnapshot = await invitationsQuery.get();
      
      if (!invitationsSnapshot.empty) {
        const invitationsBatch = db.batch();
        invitationsSnapshot.docs.forEach(doc => invitationsBatch.delete(doc.ref));
        await invitationsBatch.commit();
        deletedCollections.push(`team_invitations (${invitationsSnapshot.size} invitations)`);
      }
    } catch (error) {
      logger.error('Failed to delete team memberships', { userId, error });
      errors.push(`team_memberships: ${(error as Error).message}`);
    }

    // Step 7: Delete counters (numeric ID counter)
    try {
      if (userNumericId) {
        await db.doc(`counters/${userId}/cars`).delete();
        deletedCollections.push('counters');
      }
    } catch (error) {
      logger.warn('Could not delete counter', { userId, error });
      // Not critical, continue
    }

    // Step 8: Delete profile pictures from Storage
    try {
      const bucket = storage.bucket();
      const prefix = `profile-pictures/${userId}/`;
      const [files] = await bucket.getFiles({ prefix });

      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);

      if (files.length > 0) {
        deletedCollections.push(`storage_profile_pictures (${files.length} files)`);
        logger.info('Profile pictures deleted from Storage', { userId, count: files.length });
      }
    } catch (error) {
      logger.warn('Could not delete profile pictures from Storage', { userId, error });
      errors.push(`storage_profile_pictures: ${(error as Error).message}`);
      // Not critical, continue
    }

    // Step 9: Delete user document (must be last, after all references are cleaned)
    try {
      await db.doc(`users/${userId}`).delete();
      deletedCollections.push('users');
      logger.info('User document deleted', { userId });
    } catch (error) {
      errors.push(`users: ${(error as Error).message}`);
      logger.error('Failed to delete user document', { userId, error });
    }

    // Step 10: Delete dealer profile if exists
    try {
      const dealerDoc = await db.doc(`dealers/${userId}`).get();
      if (dealerDoc.exists) {
        await db.doc(`dealers/${userId}`).delete();
        deletedCollections.push('dealers');
      }
    } catch (error) {
      logger.warn('Could not delete dealer profile', { userId, error });
      // Not critical
    }

    // Log completion
    logger.info('✅ User deletion completed', {
      userId,
      email: userEmail,
      numericId: userNumericId,
      deletedCollections,
      errors: errors.length > 0 ? errors : 'None'
    });

    // Create compliance log
    try {
      await db.collection('compliance_logs').add({
        action: 'GDPR_USER_DELETED',
        userId,
        userEmail,
        numericId: userNumericId,
        deletedCollections,
        errors: errors.length > 0 ? errors : [],
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: 'auth_user_delete_trigger'
      });
    } catch (logError) {
      logger.error('Failed to create compliance log', { userId, error: logError });
      // Not critical, continue
    }

  } catch (error) {
    logger.error('❌ CRITICAL: User deletion failed', {
      userId,
      email: userEmail,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Still try to log the failure
    try {
      await db.collection('compliance_logs').add({
        action: 'GDPR_USER_DELETE_FAILED',
        userId,
        userEmail,
        error: error instanceof Error ? error.message : String(error),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: 'auth_user_delete_trigger'
      });
    } catch (logError) {
      // Silent fail for logging
    }

    // Re-throw to trigger retry mechanism
    throw error;
  }
});
