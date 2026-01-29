/**
 * RTDB → Firestore Sync Cloud Function
 * ====================================
 * Syncs new messages from Realtime Database to Firestore
 * for FCM notification triggers
 * 
 * @critical This fixes broken notifications from Phase 2 migration
 * @author Phase 3 - Notification Sync
 * @date January 14, 2026
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestoreDb = admin.firestore();

/**
 * Trigger: Realtime Database message creation
 * Path: /messages/{channelId}/{messageId}
 * 
 * When a new message is written to RTDB, this function:
 * 1. Copies the message to Firestore (for FCM triggers)
 * 2. Updates conversation metadata
 * 3. Increments unread counts
 */
export const syncMessageToFirestore = functions
  .region('europe-west1')
  .database.ref('/messages/{channelId}/{messageId}')
  .onCreate(async (snapshot, context) => {
    const { channelId, messageId } = context.params;
    const message = snapshot.val();
    
    if (!message) {
      console.warn(`Empty message data for ${channelId}/${messageId}`);
      return null;
    }
    
    try {
      // Extract channel info
      const channelSnapshot = await admin.database()
        .ref(`/channels/${channelId}`)
        .once('value');
      
      const channel = channelSnapshot.val();
      
      if (!channel) {
        console.error(`Channel not found: ${channelId}`);
        return null;
      }
      
      const {
        buyerNumericId,
        sellerNumericId,
        carNumericId,
        buyerFirebaseId,
        sellerFirebaseId
      } = channel;
      
      // Determine recipient
      const isFromBuyer = message.senderNumericId === buyerNumericId;
      const recipientNumericId = isFromBuyer ? sellerNumericId : buyerNumericId;
      const recipientFirebaseId = isFromBuyer ? sellerFirebaseId : buyerFirebaseId;
      
      // Write to Firestore (for FCM trigger)
      const batch = firestoreDb.batch();
      
      // 1. Create notification document
      const notificationRef = firestoreDb
        .collection('notifications')
        .doc(recipientFirebaseId)
        .collection('items')
        .doc();
      
      batch.set(notificationRef, {
        type: 'new_message',
        channelId,
        messageId,
        senderNumericId: message.senderNumericId,
        recipientNumericId,
        content: message.content || '',
        messageType: message.type || 'text',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        carId: carNumericId || null
      });
      
      // 2. Update conversation metadata
      const conversationRef = firestoreDb
        .collection('conversations_metadata')
        .doc(channelId);
      
      batch.set(conversationRef, {
        channelId,
        buyerNumericId,
        sellerNumericId,
        carNumericId: carNumericId || null,
        lastMessage: {
          content: message.content || '',
          type: message.type || 'text',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          senderNumericId: message.senderNumericId
        },
        unreadCount: {
          [recipientFirebaseId]: admin.firestore.FieldValue.increment(1)
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      await batch.commit();
      
      console.log(`Message synced: ${channelId}/${messageId}`);
      return null;
      
    } catch (error) {
      console.error(`Error syncing message ${channelId}/${messageId}:`, error);
      return null;
    }
  });

/**
 * Trigger: Firestore notification creation → Send FCM
 * Path: /notifications/{userId}/items/{notificationId}
 * 
 * When notification document is created, send FCM push
 */
export const sendMessageNotification = functions
  .region('europe-west1')
  .firestore
  .document('/notifications/{userId}/items/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const { userId, notificationId } = context.params;
    const notification = snapshot.data();
    
    if (!notification || notification.type !== 'new_message') {
      return null;
    }
    
    try {
      // Get user's FCM tokens
      const userDoc = await firestoreDb.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData || !userData.fcmTokens || userData.fcmTokens.length === 0) {
        console.log(`No FCM tokens for user ${userId}`);
        return null;
      }
      
      // Get sender info
      const senderDoc = await firestoreDb
        .collection('users')
        .doc(notification.senderFirebaseId || userId)
        .get();
      
      const senderName = senderDoc.data()?.displayName || 'Someone';
      
      // Build notification payload
      const payload = {
        notification: {
          title: `New message from ${senderName}`,
          body: notification.messageType === 'text'
            ? notification.content
            : notification.messageType === 'offer'
            ? `Offer: ${notification.content}`
            : 'Sent you an image',
          clickAction: `https://koli.one/messages-v2?channel=${notification.channelId}`,
          icon: '/logo192.png',
          badge: '/logo192.png'
        },
        data: {
          type: 'new_message',
          channelId: notification.channelId,
          messageId: notification.messageId,
          timestamp: String(Date.now())
        }
      };
      
      // Send to all user devices
      const responses = await Promise.allSettled(
        userData.fcmTokens.map((token: string) =>
          admin.messaging().send({
            token,
            ...payload
          })
        )
      );
      
      // Remove invalid tokens
      const invalidTokens: string[] = [];
      responses.forEach((response, index) => {
        if (response.status === 'rejected') {
          const error = response.reason;
          if (
            error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(userData.fcmTokens[index]);
          }
        }
      });
      
      if (invalidTokens.length > 0) {
        await firestoreDb.collection('users').doc(userId).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens)
        });
        console.log(`Removed ${invalidTokens.length} invalid FCM tokens for user ${userId}`);
      }
      
      console.log(`Sent FCM to ${userData.fcmTokens.length - invalidTokens.length} devices`);
      return null;
      
    } catch (error) {
      console.error(`Error sending FCM for notification ${notificationId}:`, error);
      return null;
    }
  });

/**
 * Trigger: Message marked as read in RTDB
 * Path: /messages/{channelId}/{messageId}/read
 * 
 * When message is marked as read, decrement unread count
 */
export const syncReadStatusToFirestore = functions
  .region('europe-west1')
  .database.ref('/messages/{channelId}/{messageId}/read')
  .onUpdate(async (change, context) => {
    const { channelId, messageId } = context.params;
    const wasRead = change.before.val();
    const isRead = change.after.val();
    
    // Only process if changed from unread to read
    if (wasRead === true || isRead !== true) {
      return null;
    }
    
    try {
      // Get message details
      const messageSnapshot = await admin.database()
        .ref(`/messages/${channelId}/${messageId}`)
        .once('value');
      
      const message = messageSnapshot.val();
      
      if (!message) {
        console.warn(`Message not found: ${channelId}/${messageId}`);
        return null;
      }
      
      // Get channel info
      const channelSnapshot = await admin.database()
        .ref(`/channels/${channelId}`)
        .once('value');
      
      const channel = channelSnapshot.val();
      
      if (!channel) {
        console.error(`Channel not found: ${channelId}`);
        return null;
      }
      
      // Determine recipient (who read the message)
      const isFromBuyer = message.senderNumericId === channel.buyerNumericId;
      const recipientFirebaseId = isFromBuyer 
        ? channel.sellerFirebaseId 
        : channel.buyerFirebaseId;
      
      // Decrement unread count in Firestore
      const conversationRef = firestoreDb
        .collection('conversations_metadata')
        .doc(channelId);
      
      await conversationRef.set({
        unreadCount: {
          [recipientFirebaseId]: admin.firestore.FieldValue.increment(-1)
        }
      }, { merge: true });
      
      console.log(`Read status synced: ${channelId}/${messageId}`);
      return null;
      
    } catch (error) {
      console.error(`Error syncing read status ${channelId}/${messageId}:`, error);
      return null;
    }
  });

/**
 * Scheduled function: Clean old notifications
 * Runs daily at 3 AM (Bulgarian time)
 * Deletes notifications older than 30 days
 */
export const cleanOldNotifications = functions
  .region('europe-west1')
  .pubsub.schedule('0 3 * * *')
  .timeZone('Europe/Sofia')
  .onRun(async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    try {
      // Query all users
      const usersSnapshot = await firestoreDb.collection('users').get();
      
      let deletedCount = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        const notificationsQuery = firestoreDb
          .collection('notifications')
          .doc(userDoc.id)
          .collection('items')
          .where('timestamp', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
          .limit(500); // Process in batches
        
        const notificationsSnapshot = await notificationsQuery.get();
        
        if (notificationsSnapshot.empty) {
          continue;
        }
        
        const batch = firestoreDb.batch();
        notificationsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        deletedCount += notificationsSnapshot.size;
      }
      
      console.log(`Cleaned ${deletedCount} old notifications`);
      return null;
      
    } catch (error) {
      console.error('Error cleaning notifications:', error);
      return null;
    }
  });

export default {
  syncMessageToFirestore,
  sendMessageNotification,
  syncReadStatusToFirestore,
  cleanOldNotifications
};
