// src/services/realtime-messaging-operations.ts
// Core messaging operations for Real-time Messaging Service

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  startAfter,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';
import { rateLimiter, RATE_LIMIT_CONFIGS } from './rate-limiting/rateLimiter.service';
import { Message, Conversation } from './realtime-messaging-types';
import {
  generateConversationId,
  generateChatRoomId,
  validateMessageData,
  convertTimestampToDate,
  isUserParticipant
} from './realtime-messaging-utils';

/**
 * Send a message with rate limiting and validation
 */
export async function sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Validate message data
    const validation = validateMessageData(messageData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Rate limiting check
    const rateLimit = rateLimiter.checkRateLimit(
      messageData.senderId,
      'message',
      RATE_LIMIT_CONFIGS.message
    );

    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded for message', {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        resetTime: rateLimit.resetTime
      });
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds before sending another message.`
      );
    }

    // Validate conversation ownership
    if (messageData.conversationId) {
      const conversationRef = doc(db, 'conversations', messageData.conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (conversationDoc.exists()) {
        const participants = conversationDoc.data().participants || [];
        if (!isUserParticipant(messageData.senderId, participants)) {
          throw new Error('User is not a participant in this conversation');
        }
      }
    }

    // Create message object
    const message: Omit<Message, 'id'> = {
      ...messageData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      createdAt: Timestamp.fromDate(message.createdAt),
      updatedAt: Timestamp.fromDate(message.updatedAt)
    });

    // Update chat room and conversation
    await updateChatRoom(messageData.senderId, messageData.receiverId, message);
    await updateConversation(messageData.conversationId, message);

    return docRef.id;
  } catch (error: unknown) {
    logger.error('Failed to send message', error as Error, {
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      conversationId: messageData.conversationId
    });
    throw new Error(`Failed to send message: ${(error as Error).message}`);
  }
}

/**
 * Get or create conversation ID for a specific car
 */
export async function getOrCreateConversationId(
  senderId: string,
  receiverId: string,
  carId: string,
  senderName: string,
  receiverName: string,
  carTitle?: string
): Promise<string> {
  try {
    // Generate conversation ID based on participants and carId
    const conversationId = generateConversationId(senderId, receiverId, carId);

    // Use setDoc with merge to prevent race conditions
    const conversationRef = doc(db, 'conversations', conversationId);

    await setDoc(conversationRef, {
      id: conversationId,
      participants: [senderId, receiverId],
      participantNames: {
        [senderId]: senderName,
        [receiverId]: receiverName
      },
      carId,
      carTitle: carTitle || '',
      unreadCount: {
        [senderId]: 0,
        [receiverId]: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Also create/update chatRoom to keep them in sync
    const chatRoomId = generateChatRoomId(senderId, receiverId, carId);
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

    await setDoc(chatRoomRef, {
      id: chatRoomId,
      participants: [senderId, receiverId],
      participantNames: {
        [senderId]: senderName,
        [receiverId]: receiverName
      },
      carId,
      carTitle: carTitle || '',
      unreadCount: {
        [senderId]: 0,
        [receiverId]: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return conversationId;
  } catch (error: unknown) {
    logger.error('Failed to get or create conversation ID', error as Error, {
      senderId, receiverId, carId
    });
    throw new Error(`Failed to create conversation: ${(error as Error).message}`);
  }
}

/**
 * Get messages for a chat room with pagination support
 */
export async function getMessages(
  senderId: string,
  receiverId: string,
  carId?: string,
  limitCount: number = 50,
  lastMessage?: QueryDocumentSnapshot
): Promise<{ messages: Message[]; lastDoc?: QueryDocumentSnapshot }> {
  try {
    let q;

    if (carId) {
      // Get messages for specific car conversation
      const conversationId = generateConversationId(senderId, receiverId, carId);
      const baseQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );
      q = lastMessage ? query(baseQuery, startAfter(lastMessage)) : baseQuery;
    } else {
      // Get all messages between two users (fallback)
      const baseQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', senderId),
        where('receiverId', '==', receiverId),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );
      q = lastMessage ? query(baseQuery, startAfter(lastMessage)) : baseQuery;
    }

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    let lastDoc: QueryDocumentSnapshot | undefined;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt)
      } as Message);
      lastDoc = doc;
    });

    return { messages, lastDoc };
  } catch (error: unknown) {
    logger.error('Failed to get messages', error as Error, { senderId, receiverId, carId });
    // Fallback: try without carId filter
    try {
      const q = query(
        collection(db, 'messages'),
        where('senderId', '==', senderId),
        where('receiverId', '==', receiverId),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const fallbackMessages = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestampToDate(doc.data().createdAt),
        updatedAt: convertTimestampToDate(doc.data().updatedAt)
      } as Message));
      return { messages: fallbackMessages, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
    } catch (fallbackError: unknown) {
      const errorMessage = fallbackError instanceof Error 
        ? fallbackError.message 
        : String(fallbackError);
      throw new Error(`Failed to get messages: ${errorMessage}`);
    }
  }
}

/**
 * Mark messages as read by conversation ID
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    // Use batch for better performance
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();

    // Update unread count in conversation and chatRoom
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0,
      updatedAt: serverTimestamp()
    });

    logger.debug('Messages marked as read', { conversationId, userId, count: querySnapshot.size });
  } catch (error: unknown) {
    logger.error('Failed to mark messages as read', error as Error, { conversationId, userId });
    throw new Error(`Failed to mark messages as read: ${(error as Error).message}`);
  }
}

/**
 * Update chat room with last message
 */
async function updateChatRoom(
  senderId: string,
  receiverId: string,
  lastMessage: Omit<Message, 'id'>
): Promise<void> {
  try {
    const chatRoomId = generateChatRoomId(senderId, receiverId, lastMessage.carId);
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

    await updateDoc(chatRoomRef, {
      lastMessage: {
        text: lastMessage.content || lastMessage.text || '',
        senderId: lastMessage.senderId,
        timestamp: serverTimestamp()
      },
      [`unreadCount.${lastMessage.receiverId}`]: 1,
      updatedAt: serverTimestamp()
    });
  } catch (error: unknown) {
    logger.error('Error updating chat room', error as Error, {
      senderId, receiverId, carId: lastMessage.carId
    });
  }
}

/**
 * Update conversation with last message
 */
async function updateConversation(
  conversationId: string | undefined,
  lastMessage: Omit<Message, 'id'>
): Promise<void> {
  if (!conversationId) return;

  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        text: lastMessage.content || lastMessage.text || '',
        senderId: lastMessage.senderId,
        timestamp: serverTimestamp()
      },
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${lastMessage.receiverId}`]: 1,
      updatedAt: serverTimestamp()
    });
  } catch (error: unknown) {
    logger.error('Error updating conversation', error as Error, { conversationId });
  }
}
