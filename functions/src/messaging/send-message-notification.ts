/**
 * Firebase Cloud Functions - Message Notifications
 * Sends FCM push notifications when new messages are received
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface MessageNotificationPayload {
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

/**
 * Triggered when a new message is created in any conversation
 * Sends push notification to the recipient
 */
export const sendMessageNotification = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const messageData = snap.data();
    const conversationId = context.params.conversationId;
    const messageId = context.params.messageId;
    
    if (!messageData) {
      console.log('No message data found');
      return null;
    }
    
    const senderId = messageData.senderId;
    const content = messageData.content;
    
    try {
      // 1. Get conversation data to find recipient
      const conversationDoc = await admin.firestore()
        .collection('conversations')
        .doc(conversationId)
        .get();
      
      if (!conversationDoc.exists) {
        console.log('Conversation not found:', conversationId);
        return null;
      }
      
      const conversationData = conversationDoc.data();
      if (!conversationData) return null;
      
      const members = conversationData.members || [];
      
      // Find recipient (the member who is NOT the sender)
      const recipientId = members.find((uid: string) => uid !== senderId);
      
      if (!recipientId) {
        console.log('No recipient found in conversation');
        return null;
      }
      
      // 2. Get sender information
      const senderDoc = await admin.firestore()
        .collection('users')
        .doc(senderId)
        .get();
      
      const senderData = senderDoc.data();
      const senderName = senderData?.displayName || senderData?.businessName || 'User';
      
      // 3. Get recipient's FCM tokens
      const tokensSnapshot = await admin.firestore()
        .collection('users')
        .doc(recipientId)
        .collection('fcmTokens')
        .get();
      
      if (tokensSnapshot.empty) {
        console.log('No FCM tokens found for recipient:', recipientId);
        return null;
      }
      
      const tokens = tokensSnapshot.docs.map(doc => doc.id);
      
      // 4. Prepare notification payload
      // Bulgarian and English versions
      const notificationTitle = {
        bg: 'Ново съобщение',
        en: 'New Message'
      };
      
      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: `${notificationTitle.bg} / ${notificationTitle.en}`,
          body: `${senderName}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
          sound: 'default',
          badge: '1',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        },
        data: {
          type: 'new_message',
          conversationId,
          senderId,
          senderName,
          messageId,
          timestamp: messageData.timestamp?.toDate().getTime().toString() || Date.now().toString()
        }
      };
      
      // 5. Send notification to all recipient devices
      const response = await admin.messaging().sendToDevice(tokens, payload);
      
      console.log(`Notification sent to ${tokens.length} devices for user ${recipientId}`);
      
      // 6. Clean up invalid tokens
      const tokensToRemove: string[] = [];
      
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Error sending to token:', tokens[index], error);
          
          // Remove tokens that are no longer valid
          if (
            error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered'
          ) {
            tokensToRemove.push(tokens[index]);
          }
        }
      });
      
      // Delete invalid tokens from Firestore
      if (tokensToRemove.length > 0) {
        const batch = admin.firestore().batch();
        
        tokensToRemove.forEach(token => {
          const tokenRef = admin.firestore()
            .collection('users')
            .doc(recipientId)
            .collection('fcmTokens')
            .doc(token);
          
          batch.delete(tokenRef);
        });
        
        await batch.commit();
        console.log(`Removed ${tokensToRemove.length} invalid tokens`);
      }
      
      return {
        success: true,
        sentToDevices: tokens.length,
        invalidTokensRemoved: tokensToRemove.length
      };
      
    } catch (error) {
      console.error('Error sending message notification:', error);
      return null;
    }
  });

/**
 * Triggered when a message is updated (e.g., marked as read)
 * Updates unread count in conversation document
 */
export const updateMessageReadStatus = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const conversationId = context.params.conversationId;
    
    // Check if 'read' status changed from false to true
    if (!beforeData.read && afterData.read) {
      const recipientId = afterData.recipientId || afterData.senderId;
      
      // Decrease unread count for this user
      try {
        const conversationRef = admin.firestore()
          .collection('conversations')
          .doc(conversationId);
        
        await conversationRef.update({
          [`unreadCount.${recipientId}`]: admin.firestore.FieldValue.increment(-1)
        });
        
        console.log(`Decreased unread count for ${recipientId} in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error updating unread count:', error);
      }
    }
    
    return null;
  });

