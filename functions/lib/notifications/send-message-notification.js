"use strict";
/**
 * Cloud Function: Send Message Notification
 * إرسال إشعار عند استلام رسالة جديدة
 *
 * @description Sends FCM push notification when a new message is created
 * @author AI Senior System Architect
 * @date January 16, 2026
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRealtimeMessageNotification = exports.sendMessageNotification = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Trigger: Firestore onCreate for messages collection
 * Sends push notification to message recipient
 */
exports.sendMessageNotification = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap, context) => {
    var _a, _b;
    const message = snap.data();
    const messageId = context.params.messageId;
    try {
        // Get recipient's FCM tokens
        const recipientId = message.receiverId || message.recipientId;
        if (!recipientId) {
            functions.logger.warn('No recipient ID in message', { messageId });
            return;
        }
        // Get recipient user document
        const userDoc = await db.collection('users').doc(recipientId).get();
        if (!userDoc.exists) {
            functions.logger.warn('Recipient user not found', { recipientId });
            return;
        }
        const userData = userDoc.data();
        const fcmTokens = (userData === null || userData === void 0 ? void 0 : userData.fcmTokens) || [];
        if (fcmTokens.length === 0) {
            functions.logger.info('No FCM tokens for recipient', { recipientId });
            return;
        }
        // Get sender info
        const senderId = message.senderId;
        const senderDoc = await db.collection('users').doc(senderId).get();
        const senderName = senderDoc.exists
            ? ((_a = senderDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Someone'
            : 'Someone';
        // Get car info if available
        let carTitle = '';
        if (message.carId) {
            const carDoc = await db.collection('passenger_cars').doc(message.carId).get();
            if (carDoc.exists) {
                const carData = carDoc.data();
                carTitle = `${carData === null || carData === void 0 ? void 0 : carData.brand} ${carData === null || carData === void 0 ? void 0 : carData.model}`;
            }
        }
        // Prepare notification payload
        const notificationTitle = `${senderName} sent you a message`;
        const notificationBody = message.content || message.text || 'New message';
        const payload = {
            tokens: fcmTokens,
            notification: {
                title: notificationTitle,
                body: notificationBody,
                imageUrl: ((_b = message.metadata) === null || _b === void 0 ? void 0 : _b.carImage) || undefined
            },
            data: {
                type: 'new_message',
                messageId,
                senderId: String(senderId),
                conversationId: message.conversationId || '',
                carId: message.carId || '',
                carTitle: carTitle || '',
                clickAction: `/messages/${message.conversationId || message.channelId}`
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'messages',
                    priority: 'high'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1
                    }
                }
            },
            webpush: {
                notification: {
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    tag: 'messaging',
                    requireInteraction: false
                },
                fcmOptions: {
                    link: `/messages/${message.conversationId || message.channelId}`
                }
            }
        };
        // Send notification
        const response = await admin.messaging().sendEachForMulticast(payload);
        functions.logger.info('Message notification sent', {
            messageId,
            recipientId,
            successCount: response.successCount,
            failureCount: response.failureCount
        });
        // Remove invalid tokens
        const tokensToRemove = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const error = resp.error;
                if ((error === null || error === void 0 ? void 0 : error.code) === 'messaging/invalid-registration-token' ||
                    (error === null || error === void 0 ? void 0 : error.code) === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(fcmTokens[idx]);
                }
            }
        });
        if (tokensToRemove.length > 0) {
            await db.collection('users').doc(recipientId).update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
            });
            functions.logger.info('Removed invalid tokens', {
                recipientId,
                count: tokensToRemove.length
            });
        }
        // Create in-app notification
        await db.collection('notifications').add({
            userId: recipientId,
            type: 'new_message',
            title: notificationTitle,
            message: notificationBody,
            data: {
                messageId,
                senderId,
                senderName,
                conversationId: message.conversationId,
                carId: message.carId,
                carTitle
            },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    catch (error) {
        functions.logger.error('Error sending message notification', {
            messageId,
            error
        });
    }
});
/**
 * Trigger: RTDB onCreate for realtime messages
 * Sends push notification for realtime messaging system
 */
exports.sendRealtimeMessageNotification = functions.database
    .ref('/messages/{channelId}/{messageId}')
    .onCreate(async (snapshot, context) => {
    var _a;
    const message = snapshot.val();
    const { channelId, messageId } = context.params;
    try {
        // Get recipient's FCM tokens
        const recipientId = message.recipientFirebaseId;
        if (!recipientId) {
            functions.logger.warn('No recipient ID in realtime message', { messageId });
            return;
        }
        // Get recipient user document
        const userDoc = await db.collection('users').doc(recipientId).get();
        if (!userDoc.exists) {
            functions.logger.warn('Recipient user not found', { recipientId });
            return;
        }
        const userData = userDoc.data();
        const fcmTokens = (userData === null || userData === void 0 ? void 0 : userData.fcmTokens) || [];
        if (fcmTokens.length === 0) {
            functions.logger.info('No FCM tokens for recipient', { recipientId });
            return;
        }
        // Get sender info
        const senderId = message.senderFirebaseId;
        const senderDoc = await db.collection('users').doc(senderId).get();
        const senderName = senderDoc.exists
            ? ((_a = senderDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName) || 'Someone'
            : 'Someone';
        // Prepare notification
        const notificationTitle = `${senderName} sent you a message`;
        const notificationBody = message.content || 'New message';
        const payload = {
            tokens: fcmTokens,
            notification: {
                title: notificationTitle,
                body: notificationBody
            },
            data: {
                type: 'new_realtime_message',
                messageId,
                channelId,
                senderId: String(message.senderId),
                clickAction: `/messages/${channelId}`
            },
            webpush: {
                notification: {
                    icon: '/logo192.png',
                    badge: '/logo192.png'
                },
                fcmOptions: {
                    link: `/messages/${channelId}`
                }
            }
        };
        // Send notification
        const response = await admin.messaging().sendEachForMulticast(payload);
        functions.logger.info('Realtime message notification sent', {
            channelId,
            messageId,
            recipientId,
            successCount: response.successCount
        });
    }
    catch (error) {
        functions.logger.error('Error sending realtime message notification', {
            channelId,
            messageId,
            error
        });
    }
});
//# sourceMappingURL=send-message-notification.js.map