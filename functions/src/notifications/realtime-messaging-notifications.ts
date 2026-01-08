/**
 * 🔔 Realtime Messaging Push Notifications
 * إشعارات الرسائل في الوقت الحقيقي
 * 
 * @description Cloud Functions for push notifications on new messages
 * وظائف السحابة للإشعارات الفورية عند وصول رسائل جديدة
 * 
 * Triggers:
 * - onNewRealtimeMessage: When a new message is added to Realtime Database
 * - onOfferStatusChange: When an offer status changes
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Ensure admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const rtdb = admin.database();

// ==================== INTERFACES ====================

interface RealtimeMessage {
  id: string;
  channelId: string;
  senderId: number;
  senderFirebaseId: string;
  recipientId: number;
  recipientFirebaseId: string;
  content: string;
  type: 'text' | 'offer' | 'image' | 'system' | 'location';
  timestamp: number;
  read: boolean;
  metadata?: {
    offerAmount?: number;
    offerCurrency?: string;
    offerStatus?: string;
    carTitle?: string;
    carImage?: string;
  };
}

interface FCMTokenDoc {
  token: string;
  numericId: number;
  platform: string;
  updatedAt: FirebaseFirestore.Timestamp;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get FCM token for a user by their Firebase UID
 */
async function getFCMToken(userFirebaseId: string): Promise<string | null> {
  try {
    const tokenDoc = await db.collection('fcm_tokens').doc(userFirebaseId).get();
    
    if (!tokenDoc.exists) {
      functions.logger.info('No FCM token found for user', { userFirebaseId });
      return null;
    }
    
    const data = tokenDoc.data() as FCMTokenDoc;
    return data?.token || null;
  } catch (error) {
    functions.logger.error('Error fetching FCM token', { error, userFirebaseId });
    return null;
  }
}

/**
 * Get user display name
 */
async function getUserDisplayName(userFirebaseId: string): Promise<string> {
  try {
    const userDoc = await db.collection('users').doc(userFirebaseId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      return data?.displayName || data?.name || data?.fullName || 'Потребител';
    }
    return 'Потребител';
  } catch (error) {
    functions.logger.error('Error fetching user name', { error });
    return 'Потребител';
  }
}

/**
 * Get channel info for context
 */
async function getChannelInfo(channelId: string): Promise<{ carTitle?: string; carImage?: string } | null> {
  try {
    const channelSnapshot = await rtdb.ref(`channels/${channelId}`).get();
    if (channelSnapshot.exists()) {
      const data = channelSnapshot.val();
      return {
        carTitle: data.carTitle,
        carImage: data.carImage,
      };
    }
    return null;
  } catch (error) {
    functions.logger.error('Error fetching channel info', { error });
    return null;
  }
}

// ==================== CLOUD FUNCTIONS ====================

/**
 * Trigger: New message in Realtime Database
 * المشغل: رسالة جديدة في قاعدة البيانات في الوقت الحقيقي
 * 
 * Path: /messages/{channelId}/{messageId}
 */
export const onNewRealtimeMessage = functions
  .region('europe-west1')
  .database
  .ref('/messages/{channelId}/{messageId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.val() as RealtimeMessage;
    const { channelId, messageId } = context.params;
    
    functions.logger.info('New realtime message', {
      channelId,
      messageId,
      type: message.type,
      senderId: message.senderId,
      recipientId: message.recipientId,
    });
    
    // Don't send notification for system messages
    if (message.type === 'system') {
      return null;
    }
    
    try {
      // Get recipient's FCM token
      const fcmToken = await getFCMToken(message.recipientFirebaseId);
      
      if (!fcmToken) {
        functions.logger.info('Recipient has no FCM token, skipping notification');
        return null;
      }
      
      // Get sender's name
      const senderName = await getUserDisplayName(message.senderFirebaseId);
      
      // Get channel info for car context
      const channelInfo = await getChannelInfo(channelId);
      
      // Build notification content based on message type
      let title: string;
      let body: string;
      let imageUrl: string | undefined;
      
      switch (message.type) {
        case 'offer':
          const amount = message.metadata?.offerAmount?.toLocaleString('de-DE') || '0';
          const currency = message.metadata?.offerCurrency || 'EUR';
          title = `💰 Ново ценово предложение`;
          body = `${senderName} предлага ${amount} ${currency}`;
          if (channelInfo?.carTitle) {
            body += ` за ${channelInfo.carTitle}`;
          }
          imageUrl = channelInfo?.carImage;
          break;
          
        case 'image':
          title = `📷 ${senderName}`;
          body = 'Изпрати снимка';
          imageUrl = message.metadata?.carImage || channelInfo?.carImage;
          break;
          
        case 'location':
          title = `📍 ${senderName}`;
          body = 'Сподели локация';
          break;
          
        default: // text
          title = senderName;
          body = message.content.length > 100 
            ? message.content.substring(0, 100) + '...' 
            : message.content;
          break;
      }
      
      // Build FCM message
      const fcmMessage: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl }),
        },
        data: {
          channelId,
          messageId,
          senderId: String(message.senderId),
          senderFirebaseId: message.senderFirebaseId,
          type: message.type,
          timestamp: String(message.timestamp),
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // For mobile apps
        },
        webpush: {
          notification: {
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            tag: channelId, // Group notifications by channel
            renotify: true,
          },
          fcmOptions: {
            link: `/messages?channel=${channelId}`,
          },
        },
        android: {
          notification: {
            channelId: 'messages',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              mutableContent: true,
            },
          },
        },
      };
      
      // Send notification
      const response = await admin.messaging().send(fcmMessage);
      
      functions.logger.info('Push notification sent successfully', {
        channelId,
        messageId,
        recipientId: message.recipientId,
        response,
      });
      
      return response;
    } catch (error: any) {
      // Handle specific FCM errors
      if (error.code === 'messaging/registration-token-not-registered') {
        // Token is invalid, remove it
        functions.logger.warn('Invalid FCM token, removing', {
          recipientFirebaseId: message.recipientFirebaseId,
        });
        await db.collection('fcm_tokens').doc(message.recipientFirebaseId).delete();
      } else {
        functions.logger.error('Failed to send push notification', { error });
      }
      return null;
    }
  });

/**
 * Trigger: Offer status changed
 * المشغل: تغيير حالة العرض
 * 
 * Path: /messages/{channelId}/{messageId}/metadata/offerStatus
 */
export const onOfferStatusChange = functions
  .region('europe-west1')
  .database
  .ref('/messages/{channelId}/{messageId}/metadata/offerStatus')
  .onUpdate(async (change, context) => {
    const beforeStatus = change.before.val();
    const afterStatus = change.after.val();
    const { channelId, messageId } = context.params;
    
    // Only notify on meaningful status changes
    if (beforeStatus === afterStatus) {
      return null;
    }
    
    functions.logger.info('Offer status changed', {
      channelId,
      messageId,
      before: beforeStatus,
      after: afterStatus,
    });
    
    try {
      // Get the full message to find the original sender (who should be notified)
      const messageSnapshot = await rtdb.ref(`/messages/${channelId}/${messageId}`).get();
      
      if (!messageSnapshot.exists()) {
        return null;
      }
      
      const message = messageSnapshot.val() as RealtimeMessage;
      
      // Notify the original sender about the response
      const fcmToken = await getFCMToken(message.senderFirebaseId);
      
      if (!fcmToken) {
        return null;
      }
      
      const responderName = await getUserDisplayName(message.recipientFirebaseId);
      const channelInfo = await getChannelInfo(channelId);
      
      let title: string;
      let body: string;
      let icon: string;
      
      switch (afterStatus) {
        case 'accepted':
          title = '✅ Предложението е прието!';
          body = `${responderName} прие вашето предложение`;
          icon = '✅';
          break;
        case 'rejected':
          title = '❌ Предложението е отхвърлено';
          body = `${responderName} отхвърли вашето предложение`;
          icon = '❌';
          break;
        case 'countered':
          const newAmount = message.metadata?.offerAmount?.toLocaleString('de-DE') || '0';
          const currency = message.metadata?.offerCurrency || 'EUR';
          title = '💱 Контра предложение';
          body = `${responderName} предложи ${newAmount} ${currency}`;
          icon = '💱';
          break;
        case 'expired':
          title = '⏰ Предложението изтече';
          body = 'Вашето ценово предложение изтече';
          icon = '⏰';
          break;
        default:
          return null;
      }
      
      if (channelInfo?.carTitle) {
        body += ` за ${channelInfo.carTitle}`;
      }
      
      const fcmMessage: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          channelId,
          messageId,
          type: 'offer_status',
          offerStatus: afterStatus,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        webpush: {
          notification: {
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            tag: `offer_${messageId}`,
          },
          fcmOptions: {
            link: `/messages?channel=${channelId}`,
          },
        },
      };
      
      const response = await admin.messaging().send(fcmMessage);
      
      functions.logger.info('Offer status notification sent', {
        channelId,
        messageId,
        status: afterStatus,
        response,
      });
      
      return response;
    } catch (error) {
      functions.logger.error('Failed to send offer status notification', { error });
      return null;
    }
  });

/**
 * Scheduled: Clean expired offers
 * مجدول: تنظيف العروض المنتهية
 * 
 * Runs every hour to mark expired offers
 */
export const cleanupExpiredOffers = functions
  .region('europe-west1')
  .pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const now = Date.now();
    
    functions.logger.info('Starting expired offers cleanup', { now });
    
    try {
      // Get all channels
      const channelsSnapshot = await rtdb.ref('/channels').get();
      
      if (!channelsSnapshot.exists()) {
        return null;
      }
      
      const channels = channelsSnapshot.val();
      let expiredCount = 0;
      
      for (const channelId of Object.keys(channels)) {
        // Get messages for this channel
        const messagesSnapshot = await rtdb
          .ref(`/messages/${channelId}`)
          .orderByChild('type')
          .equalTo('offer')
          .get();
        
        if (!messagesSnapshot.exists()) continue;
        
        const messages = messagesSnapshot.val();
        
        for (const [messageId, message] of Object.entries(messages)) {
          const msg = message as RealtimeMessage;
          
          // Check if offer is pending and expired
          if (
            msg.metadata?.offerStatus === 'pending' &&
            msg.metadata?.offerExpiresAt &&
            msg.metadata.offerExpiresAt < now
          ) {
            // Mark as expired
            await rtdb
              .ref(`/messages/${channelId}/${messageId}/metadata/offerStatus`)
              .set('expired');
            
            expiredCount++;
          }
        }
      }
      
      functions.logger.info('Expired offers cleanup complete', { expiredCount });
      
      return null;
    } catch (error) {
      functions.logger.error('Failed to cleanup expired offers', { error });
      return null;
    }
  });
