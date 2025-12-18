/**
 * Stories Cloud Functions
 * Handles story lifecycle: cleanup, notifications, analytics
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';

const db = admin.firestore();

// ==================== CLEANUP EXPIRED STORIES ====================

/**
 * Runs every hour to delete expired stories (older than 24 hours)
 */
export const cleanupExpiredStories = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      
      const expiredStoriesSnapshot = await db
        .collection('stories')
        .where('status', '==', 'active')
        .where('expiresAt', '<=', now)
        .get();
      
      if (expiredStoriesSnapshot.empty) {
        logger.info('No expired stories to clean up');
        return null;
      }
      
      const batch = db.batch();
      let count = 0;
      
      for (const doc of expiredStoriesSnapshot.docs) {
        batch.update(doc.ref, {
          status: 'expired',
          expiredAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        count++;
        
        if (count >= 500) {
          await batch.commit();
          count = 0;
        }
      }
      
      if (count > 0) {
        await batch.commit();
      }
      
      logger.info(`Cleaned up ${expiredStoriesSnapshot.size} expired stories`);
      return null;
    } catch (error) {
      logger.error('Error cleaning up expired stories:', error);
      throw error;
    }
  });

// ==================== ON STORY CREATED ====================

/**
 * Triggers when a new story is created
 * Sends notifications to followers
 */
export const onStoryCreated = functions.firestore
  .document('stories/{storyId}')
  .onCreate(async (snapshot, context) => {
    try {
      const story = snapshot.data();
      const { storyId } = context.params;
      
      const followersSnapshot = await db
        .collection('follows')
        .where('followingId', '==', story.authorId)
        .get();
      
      if (followersSnapshot.empty) {
        logger.info('No followers to notify');
        return null;
      }
      
      const batch = db.batch();
      let count = 0;
      
      for (const followerDoc of followersSnapshot.docs) {
        const followerId = followerDoc.data().followerId;
        
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId: followerId,
          type: 'new_story',
          fromUserId: story.authorId,
          fromUserInfo: story.authorInfo,
          storyId,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        count++;
        
        if (count >= 500) {
          await batch.commit();
          count = 0;
        }
      }
      
      if (count > 0) {
        await batch.commit();
      }
      
      logger.info(`Sent notifications to ${followersSnapshot.size} followers`);
      return null;
    } catch (error) {
      logger.error('Error in onStoryCreated:', error);
      return null;
    }
  });

// ==================== ON STORY VIEWED ====================

/**
 * Updates story analytics when viewed
 */
export const onStoryViewed = functions.firestore
  .document('stories/{storyId}/views/{viewId}')
  .onCreate(async (snapshot, context) => {
    try {
      const { storyId } = context.params;
      const view = snapshot.data();
      
      const storyRef = db.collection('stories').doc(storyId);
      const storyDoc = await storyRef.get();
      
      if (!storyDoc.exists) {
        logger.info('Story not found', { storyId });
        return null;
      }
      
      const story = storyDoc.data();
      
      if (!story) {
        logger.info('Story data is undefined', { storyId });
        return null;
      }
      
      if (view.viewerId !== story.authorId) {
        const notificationRef = db.collection('notifications').doc();
        await notificationRef.set({
          userId: story.authorId,
          type: 'story_view',
          fromUserId: view.viewerId,
          storyId,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return null;
    } catch (error) {
      logger.error('Error in onStoryViewed', error, { storyId });
      return null;
    }
  });

// ==================== DELETE OLD EXPIRED STORIES ====================

/**
 * Permanently delete expired stories older than 7 days
 * Runs daily to save storage
 */
export const deleteOldExpiredStories = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const timestamp = admin.firestore.Timestamp.fromDate(sevenDaysAgo);
      
      const oldStoriesSnapshot = await db
        .collection('stories')
        .where('status', '==', 'expired')
        .where('expiresAt', '<=', timestamp)
        .limit(500)
        .get();
      
      if (oldStoriesSnapshot.empty) {
        logger.info('No old expired stories to delete');
        return null;
      }
      
      const batch = db.batch();
      
      for (const doc of oldStoriesSnapshot.docs) {
        batch.delete(doc.ref);
      }
      
      await batch.commit();
      
    logger.info('Deleted old expired stories', { count: oldStoriesSnapshot.size });
      return null;
    } catch (error) {
      logger.error('Error deleting old expired stories', error);
      throw error;
    }
  });
