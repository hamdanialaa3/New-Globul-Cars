// functions/src/messaging/autoResponder.ts
// Auto-Responder System for Dealers/Companies

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { UpdateAutoResponderRequest, AutoResponderSettings } from './types';

const db = getFirestore();

/**
 * Get auto-responder settings for a user
 */
export const getAutoResponderSettings = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const settingsDoc = await db.collection('autoResponderSettings').doc(auth.uid).get();

    if (!settingsDoc.exists) {
      // Return default settings
      const defaultSettings: AutoResponderSettings = {
        userId: auth.uid,
        enabled: false,
        workingHours: {
          monday: { start: '09:00', end: '18:00', enabled: true },
          tuesday: { start: '09:00', end: '18:00', enabled: true },
          wednesday: { start: '09:00', end: '18:00', enabled: true },
          thursday: { start: '09:00', end: '18:00', enabled: true },
          friday: { start: '09:00', end: '18:00', enabled: true },
          saturday: { start: '10:00', end: '14:00', enabled: true },
          sunday: { start: '00:00', end: '00:00', enabled: false },
        },
        awayMessage: 'Благодаря за съобщението! В момента не съм на разположение, но ще ви отговоря възможно най-скоро.',
        holidayMode: {
          enabled: false,
          startDate: null,
          endDate: null,
          message: 'В момента съм в отпуск. Ще се върна на работа скоро.',
        },
        instantReply: {
          enabled: true,
          message: 'Здравейте! Благодаря за интереса. Ще ви отговоря в най-скоро време.',
          delaySeconds: 60,
        },
      };

      return {
        success: true,
        settings: defaultSettings,
      };
    }

    return {
      success: true,
      settings: settingsDoc.data(),
    };
  } catch (error: any) {
    console.error('Error getting auto-responder settings:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Update auto-responder settings
 */
export const updateAutoResponderSettings = onCall<UpdateAutoResponderRequest>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Get user profile to check if dealer/company
    const userDoc = await db.collection('users').doc(auth.uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    if (!['dealer', 'company'].includes(userData?.profileType)) {
      throw new HttpsError(
        'permission-denied',
        'Only dealers and companies can use auto-responder'
      );
    }

    const settingsRef = db.collection('autoResponderSettings').doc(auth.uid);
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      // Create new settings
      const newSettings: AutoResponderSettings = {
        userId: auth.uid,
        enabled: data.enabled ?? false,
        workingHours: data.workingHours ?? {
          monday: { start: '09:00', end: '18:00', enabled: true },
          tuesday: { start: '09:00', end: '18:00', enabled: true },
          wednesday: { start: '09:00', end: '18:00', enabled: true },
          thursday: { start: '09:00', end: '18:00', enabled: true },
          friday: { start: '09:00', end: '18:00', enabled: true },
          saturday: { start: '10:00', end: '14:00', enabled: true },
          sunday: { start: '00:00', end: '00:00', enabled: false },
        },
        awayMessage: data.awayMessage ?? 'Благодаря за съобщението! В момента не съм на разположение.',
        holidayMode: data.holidayMode ?? {
          enabled: false,
          startDate: null,
          endDate: null,
          message: 'В момента съм в отпуск.',
        },
        instantReply: data.instantReply ?? {
          enabled: true,
          message: 'Здравейте! Благодаря за интереса.',
          delaySeconds: 60,
        },
      };

      await settingsRef.set(newSettings);
    } else {
      // Update existing settings
      const updates: any = {};

      if (data.enabled !== undefined) updates.enabled = data.enabled;
      if (data.workingHours) updates.workingHours = data.workingHours;
      if (data.awayMessage) updates.awayMessage = data.awayMessage;
      if (data.holidayMode) updates.holidayMode = data.holidayMode;
      if (data.instantReply) updates.instantReply = data.instantReply;

      await settingsRef.update(updates);
    }

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'auto_responder_updated',
      description: 'Updated auto-responder settings',
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Auto-responder settings updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating auto-responder settings:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Check if we should send auto-reply
 */
function shouldSendAutoReply(settings: AutoResponderSettings): { send: boolean; message: string } {
  if (!settings.enabled) {
    return { send: false, message: '' };
  }

  const now = new Date();

  // Check holiday mode
  if (settings.holidayMode.enabled) {
    const startDate = settings.holidayMode.startDate?.toDate();
    const endDate = settings.holidayMode.endDate?.toDate();

    if (startDate && endDate && now >= startDate && now <= endDate) {
      return { send: true, message: settings.holidayMode.message };
    }
  }

  // Check working hours
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()] as keyof typeof settings.workingHours;
  const daySettings = settings.workingHours[currentDay];

  if (!daySettings.enabled) {
    return { send: true, message: settings.awayMessage };
  }

  // Check if within working hours
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isWorkingHours = currentTime >= daySettings.start && currentTime <= daySettings.end;

  if (!isWorkingHours) {
    return { send: true, message: settings.awayMessage };
  }

  // Within working hours - send instant reply if enabled
  if (settings.instantReply.enabled) {
    return { send: true, message: settings.instantReply.message };
  }

  return { send: false, message: '' };
}

/**
 * Auto-reply trigger when new message is received
 */
export const onNewMessage = onDocumentCreated('messages/{messageId}', async (event) => {
  const messageData = event.data?.data();
  if (!messageData) return;

  const { recipientId, senderId, conversationId } = messageData;

  // Don't auto-reply to auto-replies
  if (messageData.isAutoReply) return;

  try {
    // Get recipient's auto-responder settings
    const settingsDoc = await db.collection('autoResponderSettings').doc(recipientId).get();
    if (!settingsDoc.exists) return;

    const settings = settingsDoc.data() as AutoResponderSettings;
    const { send, message } = shouldSendAutoReply(settings);

    if (!send) return;

    // Check if we already sent an auto-reply in this conversation in the last hour
    const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
    const recentAutoReplies = await db
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .where('senderId', '==', recipientId)
      .where('isAutoReply', '==', true)
      .where('timestamp', '>', oneHourAgo)
      .limit(1)
      .get();

    if (!recentAutoReplies.empty) {
      console.log('Auto-reply already sent in the last hour');
      return;
    }

    // Wait for the delay period
    if (settings.instantReply.enabled && settings.instantReply.delaySeconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, settings.instantReply.delaySeconds * 1000));
    }

    // Send auto-reply
    await db.collection('messages').add({
      conversationId,
      senderId: recipientId,
      recipientId: senderId,
      content: message,
      isAutoReply: true,
      read: false,
      timestamp: Timestamp.now(),
    });

    // Update conversation
    await db.collection('conversations').doc(conversationId).update({
      lastMessage: message,
      lastMessageAt: Timestamp.now(),
      lastMessageBy: recipientId,
    });

    console.log(`Auto-reply sent in conversation ${conversationId}`);
  } catch (error) {
    console.error('Error sending auto-reply:', error);
  }
});
