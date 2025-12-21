// src/services/realtime-messaging-listeners.ts
// Real-time listeners for messaging service

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';
import { Message, ChatRoom, TypingIndicator } from './realtime-messaging-types';
import { convertTimestampToDate, createTypingDocId } from './realtime-messaging-utils';

/**
 * Listen to new messages in real-time
 */
export function listenToMessages(
  userId: string | null | undefined,
  callback: (messages: Message[]) => void
): Unsubscribe {
  // Guard against null/undefined userId
  if (!userId) {
    logger.warn('listenToMessages called with null/undefined userId - returning no-op unsubscribe');
    return () => {}; // Return no-op unsubscribe function
  }

  const q = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt)
      } as Message);
    });

    // Reverse to get chronological order
    callback(messages.reverse());
  });

  return unsubscribe;
}

/**
 * Get user's chat rooms
 */
export async function getUserChatRooms(userId: string): Promise<ChatRoom[]> {
  try {
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const chatRooms: ChatRoom[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      chatRooms.push({
        id: doc.id,
        ...data,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          createdAt: convertTimestampToDate(data.lastMessage.createdAt),
          updatedAt: convertTimestampToDate(data.lastMessage.updatedAt)
        } : undefined
      } as ChatRoom);
    });

    return chatRooms;
  } catch (error: unknown) {
    throw new Error(`Failed to get chat rooms: ${(error as Error).message}`);
  }
}

/**
 * Get conversation by ID
 */
export async function getConversationById(conversationId: string): Promise<ChatRoom | null> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      return null;
    }

    const data = conversationDoc.data();

    // Convert conversation to ChatRoom format
    const chatRoom: ChatRoom = {
      id: conversationId,
      participants: data.participants || [],
      participantNames: data.participantNames || {},
      carId: data.carId,
      carTitle: data.carTitle,
      unreadCount: data.unreadCount || {},
      createdAt: convertTimestampToDate(data.createdAt),
      updatedAt: convertTimestampToDate(data.updatedAt),
      lastMessage: data.lastMessage ? {
        id: '',
        conversationId,
        senderId: data.lastMessage.senderId || '',
        senderName: '',
        receiverId: '',
        receiverName: '',
        content: data.lastMessage.text || '',
        text: data.lastMessage.text || '',
        messageType: 'text',
        type: 'text',
        status: 'sent',
        isRead: false,
        createdAt: convertTimestampToDate(data.lastMessage.timestamp),
        updatedAt: convertTimestampToDate(data.lastMessage.timestamp)
      } : undefined
    };

    return chatRoom;
  } catch (error: unknown) {
    logger.error('Failed to get conversation by ID', error as Error, { conversationId });
    return null;
  }
}

/**
 * Listen to chat rooms in real-time
 */
export function listenToChatRooms(
  userId: string | null | undefined,
  callback: (chatRooms: ChatRoom[]) => void
): Unsubscribe {
  // Guard against null/undefined userId
  if (!userId) {
    logger.warn('listenToChatRooms called with null/undefined userId - returning no-op unsubscribe');
    return () => {}; // Return no-op unsubscribe function
  }

  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const chatRooms: ChatRoom[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      chatRooms.push({
        id: doc.id,
        ...data,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          createdAt: convertTimestampToDate(data.lastMessage.createdAt),
          updatedAt: convertTimestampToDate(data.lastMessage.updatedAt)
        } : undefined
      } as ChatRoom);
    });

    callback(chatRooms);
  });

  return unsubscribe;
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(
  conversationId: string,
  senderId: string,
  receiverId: string,
  isTyping: boolean
): Promise<void> {
  try {
    const typingDocId = createTypingDocId(conversationId, senderId);
    const typingRef = doc(db, 'typing', typingDocId);

    if (isTyping) {
      await setDoc(typingRef, {
        conversationId,
        userId: senderId,
        receiverId,
        isTyping: true,
        timestamp: serverTimestamp()
      }, { merge: true });

      // Auto-clear after 3 seconds
      setTimeout(async () => {
        try {
          await setDoc(typingRef, {
            isTyping: false,
            timestamp: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          // Silently fail on cleanup
        }
      }, 3000);
    } else {
      await setDoc(typingRef, {
        isTyping: false,
        timestamp: serverTimestamp()
      }, { merge: true });
    }
  } catch (error: unknown) {
    // Error sending typing indicator - silently fail
    logger.debug('Failed to send typing indicator', { conversationId, senderId, error });
  }
}

/**
 * Listen to typing indicators
 */
export function listenToTypingIndicators(
  conversationId: string,
  userId: string | null | undefined,
  callback: (indicators: TypingIndicator[]) => void
): Unsubscribe {
  // Guard against null/undefined userId
  if (!userId) {
    logger.warn('listenToTypingIndicators called with null/undefined userId - returning no-op unsubscribe');
    return () => {}; // Return no-op unsubscribe function
  }

  const q = query(
    collection(db, 'typing'),
    where('conversationId', '==', conversationId),
    where('receiverId', '==', userId),
    where('isTyping', '==', true),
    orderBy('timestamp', 'desc'),
    limit(5)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const indicators: TypingIndicator[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include active typing indicators
      if (data.isTyping) {
        indicators.push({
          userId: data.userId,
          userName: data.userName || 'Unknown User',
          isTyping: true,
          timestamp: convertTimestampToDate(data.timestamp)
        });
      }
    });

    callback(indicators);
  });

  return unsubscribe;
}