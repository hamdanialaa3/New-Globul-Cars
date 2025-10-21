"use strict";
/**
 * Stories Cloud Functions
 * Handles story lifecycle: cleanup, notifications, analytics
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldExpiredStories = exports.onStoryViewed = exports.onStoryCreated = exports.cleanupExpiredStories = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// ==================== CLEANUP EXPIRED STORIES ====================
/**
 * Runs every hour to delete expired stories (older than 24 hours)
 */
exports.cleanupExpiredStories = functions.pubsub
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
            console.log('No expired stories to clean up');
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
        console.log(`Cleaned up ${expiredStoriesSnapshot.size} expired stories`);
        return null;
    }
    catch (error) {
        console.error('Error cleaning up expired stories:', error);
        throw error;
    }
});
// ==================== ON STORY CREATED ====================
/**
 * Triggers when a new story is created
 * Sends notifications to followers
 */
exports.onStoryCreated = functions.firestore
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
            console.log('No followers to notify');
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
        console.log(`Sent notifications to ${followersSnapshot.size} followers`);
        return null;
    }
    catch (error) {
        console.error('Error in onStoryCreated:', error);
        return null;
    }
});
// ==================== ON STORY VIEWED ====================
/**
 * Updates story analytics when viewed
 */
exports.onStoryViewed = functions.firestore
    .document('stories/{storyId}/views/{viewId}')
    .onCreate(async (snapshot, context) => {
    try {
        const { storyId } = context.params;
        const view = snapshot.data();
        const storyRef = db.collection('stories').doc(storyId);
        const storyDoc = await storyRef.get();
        if (!storyDoc.exists) {
            console.log('Story not found');
            return null;
        }
        const story = storyDoc.data();
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
    }
    catch (error) {
        console.error('Error in onStoryViewed:', error);
        return null;
    }
});
// ==================== DELETE OLD EXPIRED STORIES ====================
/**
 * Permanently delete expired stories older than 7 days
 * Runs daily to save storage
 */
exports.deleteOldExpiredStories = functions.pubsub
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
            console.log('No old expired stories to delete');
            return null;
        }
        const batch = db.batch();
        for (const doc of oldStoriesSnapshot.docs) {
            batch.delete(doc.ref);
        }
        await batch.commit();
        console.log(`Deleted ${oldStoriesSnapshot.size} old expired stories`);
        return null;
    }
    catch (error) {
        console.error('Error deleting old expired stories:', error);
        throw error;
    }
});
//# sourceMappingURL=stories-functions.js.map