/**
 * Numeric Messaging System Service
 * 🔢 Integrated Messaging between Users by Numeric IDs
 * 
 * URL Format:
 * - Messages: /messages/:senderNumericId/:recipientNumericId/:carNumericId?
 * - Example: /messages/1/2/5 (Talk about User 1's car #5)
 * 
 * Database Structure:
 * - messages collection: {
 *     id: 'uuid',
 *     senderNumericId: 1,           // ✨ Sender's numeric ID
 *     recipientNumericId: 2,        // ✨ Recipient's numeric ID
 *     carNumericId?: 5,             // ✨ Optional car reference
 *     type: 'inquiry' | 'offer' | 'general',
 *     subject, content, ...
 *   }
 * 
 * @file numeric-messaging-system.service.ts
 * @since 2025-12-16
 */

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  and,
  or
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';
import { SocialAuthService } from '../firebase/social-auth-service';

export type MessageType = 'inquiry' | 'offer' | 'general';

export interface NumericMessage {
  id: string;
  senderUserId: string;           // Firebase UID
  senderNumericId: number;        // ✨ Numeric ID
  senderName: string;
  senderPhoto?: string;

  recipientUserId: string;        // Firebase UID
  recipientNumericId: number;     // ✨ Numeric ID
  recipientName: string;
  recipientPhoto?: string;

  carId?: string;                 // Car document ID (optional)
  carNumericId?: number;          // Car numeric ID (optional)
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carPrice?: number;

  type: MessageType;
  subject: string;
  content: string;
  isRead: boolean;
  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}

class NumericMessagingSystemService {
  /**
   * ✅ Send message between users by numeric IDs
   */
  async sendMessage(
    senderNumericId: number,
    recipientNumericId: number,
    messageData: {
      type: MessageType;
      subject: string;
      content: string;
      carId?: string;
      carNumericId?: number;
      carMake?: string;
      carModel?: string;
      carYear?: number;
      carPrice?: number;
    }
  ): Promise<NumericMessage> {
    const currentUser = auth.currentUser;

    if (!currentUser?.uid) {
      throw new Error('❌ Not authenticated');
    }

    try {
      // 1️⃣ Verify sender owns the numeric ID
      const senderProfile = await SocialAuthService.getBulgarianUserProfile(currentUser.uid);

      if (!senderProfile?.numericId || senderProfile.numericId !== senderNumericId) {
        throw new Error(`❌ You do not own numeric ID ${senderNumericId}`);
      }

      // 2️⃣ Get recipient by numeric ID
      const recipientQuery = query(
        collection(db, 'users'),
        where('numericId', '==', recipientNumericId)
      );

      const recipientSnapshot = await getDocs(recipientQuery);

      if (recipientSnapshot.empty) {
        throw new Error(`❌ Recipient not found: numeric ID ${recipientNumericId}`);
      }

      const recipientUserId = recipientSnapshot.docs[0].id;
      const recipientData = recipientSnapshot.docs[0].data();

      // 3️⃣ Get sender profile for display
      const senderName = senderProfile.displayName || 'Anonymous';
      const senderPhoto = senderProfile.photoURL || undefined;

      const recipientName = recipientData.displayName || 'User';
      const recipientPhoto = recipientData.photoURL || undefined;

      // 4️⃣ Validate message content
      if (!messageData.subject || messageData.subject.trim().length === 0) {
        throw new Error('❌ Message subject is required');
      }

      if (!messageData.content || messageData.content.trim().length === 0) {
        throw new Error('❌ Message content is required');
      }

      if (messageData.content.length > 5000) {
        throw new Error('❌ Message content too long (max 5000 characters)');
      }

      // 5️⃣ Create message
      const docRef = await addDoc(collection(db, 'messages'), {
        senderUserId: currentUser.uid,
        senderNumericId: senderNumericId,
        senderName: senderName,
        senderPhoto: senderPhoto,

        recipientUserId: recipientUserId,
        recipientNumericId: recipientNumericId,
        recipientName: recipientName,
        recipientPhoto: recipientPhoto,

        ...messageData,

        isRead: false,
        isArchived: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('✅ Message sent', {
        messageId: docRef.id,
        from: senderNumericId,
        to: recipientNumericId,
        carNumericId: messageData.carNumericId
      });

      return {
        id: docRef.id,
        senderUserId: currentUser.uid,
        senderNumericId: senderNumericId,
        senderName: senderName,
        senderPhoto: senderPhoto,

        recipientUserId: recipientUserId,
        recipientNumericId: recipientNumericId,
        recipientName: recipientName,
        recipientPhoto: recipientPhoto,

        ...messageData,

        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      serviceLogger.error('Error sending message', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Get conversation between two users by numeric IDs
   */
  async getConversation(
    userNumericId1: number,
    userNumericId2: number
  ): Promise<NumericMessage[]> {
    try {
      // 1️⃣ Get user IDs by numeric IDs
      const user1Query = query(
        collection(db, 'users'),
        where('numericId', '==', userNumericId1)
      );
      const user1Snapshot = await getDocs(user1Query);

      if (user1Snapshot.empty) {
        throw new Error(`❌ User not found: numeric ID ${userNumericId1}`);
      }

      const user1Id = user1Snapshot.docs[0].id;

      const user2Query = query(
        collection(db, 'users'),
        where('numericId', '==', userNumericId2)
      );
      const user2Snapshot = await getDocs(user2Query);

      if (user2Snapshot.empty) {
        throw new Error(`❌ User not found: numeric ID ${userNumericId2}`);
      }

      const user2Id = user2Snapshot.docs[0].id;

      // 2️⃣ Get all messages between these two users
      const messagesQuery = query(
        collection(db, 'messages'),
        or(
          and(
            where('senderUserId', '==', user1Id),
            where('recipientUserId', '==', user2Id)
          ),
          and(
            where('senderUserId', '==', user2Id),
            where('recipientUserId', '==', user1Id)
          )
        ),
        orderBy('createdAt', 'asc')
      );

      const messagesSnapshot = await getDocs(messagesQuery);

      const messages: NumericMessage[] = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as any)?.toDate?.() || new Date(),
        updatedAt: (doc.data().updatedAt as any)?.toDate?.() || new Date()
      } as NumericMessage));

      serviceLogger.info('✅ Got conversation', {
        user1NumericId: userNumericId1,
        user2NumericId: userNumericId2,
        messageCount: messages.length
      });

      return messages;
    } catch (error) {
      serviceLogger.error('Error getting conversation', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Get all conversations for a user (by numeric ID)
   * Returns unique chat partners with last message
   */
  async getUserConversations(userNumericId: number): Promise<
    Array<{
      partnerNumericId: number;
      partnerName: string;
      partnerPhoto?: string;
      lastMessage: NumericMessage;
      unreadCount: number;
    }>
  > {
    try {
      // 1️⃣ Get user by numeric ID
      const userQuery = query(
        collection(db, 'users'),
        where('numericId', '==', userNumericId)
      );

      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error(`❌ User not found: numeric ID ${userNumericId}`);
      }

      const userId = userSnapshot.docs[0].id;

      // 2️⃣ Get all messages for this user
      const messagesQuery = query(
        collection(db, 'messages'),
        or(
          where('senderUserId', '==', userId),
          where('recipientUserId', '==', userId)
        ),
        orderBy('createdAt', 'desc')
      );

      const messagesSnapshot = await getDocs(messagesQuery);

      // 3️⃣ Group by conversation partner
      const conversations = new Map<
        number,
        {
          partnerUserId: string;
          partnerNumericId: number;
          partnerName: string;
          partnerPhoto?: string;
          lastMessage: NumericMessage;
          unreadCount: number;
        }
      >();

      for (const doc of messagesSnapshot.docs) {
        const message = {
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as any)?.toDate?.() || new Date(),
          updatedAt: (doc.data().updatedAt as any)?.toDate?.() || new Date()
        } as NumericMessage;

        const isSender = message.senderUserId === userId;
        const partnerNumericId = isSender
          ? message.recipientNumericId
          : message.senderNumericId;
        const partnerUserId = isSender
          ? message.recipientUserId
          : message.senderUserId;
        const partnerName = isSender
          ? message.recipientName
          : message.senderName;
        const partnerPhoto = isSender
          ? message.recipientPhoto
          : message.senderPhoto;

        // Only add the first (most recent) message per partner
        if (!conversations.has(partnerNumericId)) {
          // Count unread messages from this partner
          const unreadCount = isSender
            ? 0
            : message.isRead
              ? 0
              : 1;

          conversations.set(partnerNumericId, {
            partnerUserId,
            partnerNumericId,
            partnerName,
            partnerPhoto,
            lastMessage: message,
            unreadCount
          });
        }
      }

      const result = Array.from(conversations.values());

      serviceLogger.info('✅ Got user conversations', {
        userNumericId,
        conversationCount: result.length
      });

      return result;
    } catch (error) {
      serviceLogger.error('Error getting user conversations', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      const docRef = doc(db, 'messages', messageId);
      await updateDoc(docRef, {
        isRead: true,
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('✅ Message marked as read', { messageId });
    } catch (error) {
      serviceLogger.error('Error marking message as read', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Archive conversation with a user
   */
  async archiveConversation(
    userNumericId: number,
    partnerNumericId: number
  ): Promise<void> {
    try {
      // Get the conversation
      const messages = await this.getConversation(userNumericId, partnerNumericId);

      // Archive all messages
      for (const message of messages) {
        const docRef = doc(db, 'messages', message.id);
        await updateDoc(docRef, {
          isArchived: true,
          updatedAt: serverTimestamp()
        });
      }

      serviceLogger.info('✅ Conversation archived', {
        userNumericId,
        partnerNumericId
      });
    } catch (error) {
      serviceLogger.error('Error archiving conversation', error as Error);
      throw error;
    }
  }
}

export const numericMessagingSystemService = new NumericMessagingSystemService();
