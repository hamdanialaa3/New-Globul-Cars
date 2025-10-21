"use strict";
/**
 * Messaging Cloud Functions
 * Handles message notifications, cleanup, and analytics
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
exports.generateMessageAnalytics = exports.updateChatRoomActivity = exports.cleanupOldMessages = exports.onMessageUpdate = exports.onNewMessage = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// ==================== ON NEW MESSAGE ====================
/**
 * Triggers when a new message is sent
 * Sends push notification to recipient
 */
exports.onNewMessage = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snapshot, context) => {
    var _a, _b, _c;
    try {
        const message = snapshot.data();
        const { messageId } = context.params;
        if (!message.recipientId || message.senderId === message.recipientId) {
            return null;
        }
        const recipientDoc = await db.collection('users').doc(message.recipientId).get();
        if (!recipientDoc.exists) {
            console.log('Recipient not found');
            return null;
        }
        const recipient = recipientDoc.data();
        const notificationRef = db.collection('notifications').doc();
        await notificationRef.set({
            userId: message.recipientId,
            type: 'new_message',
            fromUserId: message.senderId,
            fromUserInfo: message.senderInfo,
            messageId,
            messagePreview: ((_a = message.text) === null || _a === void 0 ? void 0 : _a.substring(0, 50)) || '[Media]',
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        if (recipient.fcmToken) {
            await admin.messaging().send({
                token: recipient.fcmToken,
                notification: {
                    title: ((_b = message.senderInfo) === null || _b === void 0 ? void 0 : _b.displayName) || 'New Message',
                    body: ((_c = message.text) === null || _c === void 0 ? void 0 : _c.substring(0, 100)) || 'Sent you a message'
                },
                data: {
                    type: 'new_message',
                    messageId,
                    senderId: message.senderId,
                    chatRoomId: message.chatRoomId
                }
            });
        }
        await db.collection('chatRooms').doc(message.chatRoomId).update({
            lastMessage: {
                text: message.text || '[Media]',
                senderId: message.senderId,
                timestamp: message.createdAt
            },
            lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
            [`unreadCount.${message.recipientId}`]: admin.firestore.FieldValue.increment(1)
        });
        console.log(`Sent notification for message ${messageId}`);
        return null;
    }
    catch (error) {
        console.error('Error in onNewMessage:', error);
        return null;
    }
});
// ==================== ON MESSAGE UPDATE ====================
/**
 * Triggers when a message is updated (read status, reactions, etc.)
 */
exports.onMessageUpdate = functions.firestore
    .document('messages/{messageId}')
    .onUpdate(async (change, context) => {
    try {
        const before = change.before.data();
        const after = change.after.data();
        const { messageId } = context.params;
        if (!before.isRead && after.isRead) {
            await db.collection('chatRooms').doc(after.chatRoomId).update({
                [`unreadCount.${after.recipientId}`]: admin.firestore.FieldValue.increment(-1)
            });
        }
        if (after.reactions && Object.keys(after.reactions).length > Object.keys(before.reactions || {}).length) {
            const newReactions = Object.keys(after.reactions).filter(userId => !before.reactions || !before.reactions[userId]);
            for (const userId of newReactions) {
                if (userId !== after.senderId) {
                    const notificationRef = db.collection('notifications').doc();
                    await notificationRef.set({
                        userId: after.senderId,
                        type: 'message_reaction',
                        fromUserId: userId,
                        messageId,
                        reaction: after.reactions[userId],
                        isRead: false,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
        }
        return null;
    }
    catch (error) {
        console.error('Error in onMessageUpdate:', error);
        return null;
    }
});
// ==================== CLEANUP OLD MESSAGES ====================
/**
 * Deletes messages older than 90 days
 * Runs daily to manage storage
 */
exports.cleanupOldMessages = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const timestamp = admin.firestore.Timestamp.fromDate(ninetyDaysAgo);
        const oldMessagesSnapshot = await db
            .collection('messages')
            .where('createdAt', '<=', timestamp)
            .where('isDeleted', '==', false)
            .limit(1000)
            .get();
        if (oldMessagesSnapshot.empty) {
            console.log('No old messages to clean up');
            return null;
        }
        const batch = db.batch();
        for (const doc of oldMessagesSnapshot.docs) {
            batch.update(doc.ref, {
                isDeleted: true,
                deletedAt: admin.firestore.FieldValue.serverTimestamp(),
                text: '[Message deleted]',
                attachments: []
            });
        }
        await batch.commit();
        console.log(`Cleaned up ${oldMessagesSnapshot.size} old messages`);
        return null;
    }
    catch (error) {
        console.error('Error cleaning up old messages:', error);
        throw error;
    }
});
// ==================== UPDATE CHAT ROOM ACTIVITY ====================
/**
 * Updates chat room last activity timestamp
 */
exports.updateChatRoomActivity = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snapshot, context) => {
    try {
        const message = snapshot.data();
        if (!message.chatRoomId)
            return null;
        const chatRoomRef = db.collection('chatRooms').doc(message.chatRoomId);
        await chatRoomRef.update({
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
            messageCount: admin.firestore.FieldValue.increment(1)
        });
        return null;
    }
    catch (error) {
        console.error('Error updating chat room activity:', error);
        return null;
    }
});
// ==================== GENERATE MESSAGE ANALYTICS ====================
/**
 * Generates daily messaging analytics
 */
exports.generateMessageAnalytics = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterdayTimestamp = admin.firestore.Timestamp.fromDate(yesterday);
        const todayTimestamp = admin.firestore.Timestamp.fromDate(today);
        const messagesSnapshot = await db
            .collection('messages')
            .where('createdAt', '>=', yesterdayTimestamp)
            .where('createdAt', '<', todayTimestamp)
            .get();
        const analytics = {
            date: yesterday.toISOString().split('T')[0],
            totalMessages: messagesSnapshot.size,
            uniqueSenders: new Set(messagesSnapshot.docs.map(doc => doc.data().senderId)).size,
            uniqueRecipients: new Set(messagesSnapshot.docs.map(doc => doc.data().recipientId)).size,
            messagesWithAttachments: messagesSnapshot.docs.filter(doc => doc.data().attachments && doc.data().attachments.length > 0).length,
            voiceMessages: messagesSnapshot.docs.filter(doc => doc.data().type === 'voice').length,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('analytics').doc('messaging').collection('daily').add(analytics);
        console.log('Generated message analytics:', analytics);
        return null;
    }
    catch (error) {
        console.error('Error generating message analytics:', error);
        throw error;
    }
});
//# sourceMappingURL=messaging-functions.js.map