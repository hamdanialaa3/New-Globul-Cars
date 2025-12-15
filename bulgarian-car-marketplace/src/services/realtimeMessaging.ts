// src/services/realtimeMessaging.ts
// Real-time Messaging Service for Bulgarian Car Marketplace

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
  onSnapshot,
  Timestamp,
  Unsubscribe,
  or,
  serverTimestamp,
  writeBatch,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';
import { rateLimiter, RATE_LIMIT_CONFIGS } from './rate-limiting/rateLimiter.service';

export interface Message {
  id: string;
  conversationId: string; // ✅ Required for chat rooms
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  carId?: string;
  carTitle?: string;
  content: string;
  text?: string; // ✅ Alias for content (backward compatibility)
  messageType: 'text' | 'image' | 'offer' | 'question';
  type?: 'text' | 'image' | 'file' | 'voice' | 'system'; // ✅ Extended types
  status?: 'sending' | 'sent' | 'delivered' | 'read'; // ✅ Added 'sending' state
  attachments?: MessageAttachment[]; // ✅ Added for advanced messaging
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  editedAt?: Date;
  replyTo?: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'video';
  url: string;
  name: string;
  size: number;
  thumbnailUrl?: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  lastMessage?: Message;
  unreadCount: { [userId: string]: number };
  carId?: string;
  carTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export class RealtimeMessagingService {
  private static instance: RealtimeMessagingService;
  private messageListeners: Map<string, Unsubscribe> = new Map();
  private chatRoomListeners: Map<string, Unsubscribe> = new Map();
  private typingListeners: Map<string, Unsubscribe> = new Map();

  private constructor() {}

  static getInstance(): RealtimeMessagingService {
    if (!RealtimeMessagingService.instance) {
      RealtimeMessagingService.instance = new RealtimeMessagingService();
    }
    return RealtimeMessagingService.instance;
  }

  // Send a message
  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
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
          if (!participants.includes(messageData.senderId)) {
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
      await this.updateChatRoom(messageData.senderId, messageData.receiverId, message);
      await this.updateConversation(messageData.conversationId, message);

      return docRef.id;
    } catch (error: unknown) {
      logger.error('Failed to send message', error as Error, {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        conversationId: messageData.conversationId
      });
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Get or create conversation ID for a specific car
  // ✅ FIXED: Race Condition - uses setDoc with merge instead of addDoc
  async getOrCreateConversationId(
    senderId: string,
    receiverId: string,
    carId: string,
    senderName: string,
    receiverName: string,
    carTitle?: string
  ): Promise<string> {
    try {
      // Generate conversation ID based on participants and carId
      const conversationId = this.generateConversationId(senderId, receiverId, carId);
      
      // ✅ FIX: Use setDoc with merge to prevent race conditions
      const conversationRef = doc(db, 'conversations', conversationId);
      
      // Use setDoc with merge to atomically create or update
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

      // ✅ FIX: Also create/update chatRoom to keep them in sync
      const chatRoomId = this.generateChatRoomId(senderId, receiverId, carId);
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
      
      logger.info('Conversation and chatRoom created/updated', { conversationId, chatRoomId, carId, senderId, receiverId });
      
      return conversationId;
    } catch (error: unknown) {
      logger.error('Failed to get or create conversation', error as Error, { senderId, receiverId, carId });
      throw new Error(`Failed to get or create conversation: ${error.message}`);
    }
  }

  // Generate conversation ID based on participants and car
  private generateConversationId(userId1: string, userId2: string, carId: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}_${carId}`;
  }

  // Check if car link was already sent in this conversation
  async hasCarLinkBeenSent(conversationId: string, carId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('carId', '==', carId),
        where('type', '==', 'system'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error: unknown) {
      logger.error('Failed to check car link', error as Error, { conversationId, carId });
      return false;
    }
  }

  // Send car link as system message (once per conversation)
  async sendCarLinkMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    senderName: string,
    receiverName: string,
    carId: string,
    carTitle: string
  ): Promise<string | null> {
    try {
      // Check if car link was already sent
      const alreadySent = await this.hasCarLinkBeenSent(conversationId, carId);
      if (alreadySent) {
        logger.debug('Car link already sent', { conversationId, carId });
        return null;
      }

      // Create car link message
      const carLink = `${window.location.origin}/car/${carId}`;
      const messageContent = `🚗 ${carTitle}\n${carLink}`;

      const message: Omit<Message, 'id'> = {
        conversationId,
        senderId,
        senderName,
        receiverId,
        receiverName,
        carId,
        carTitle,
        content: messageContent,
        text: messageContent,
        messageType: 'system',
        type: 'system',
        status: 'sent',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'messages'), {
        ...message,
        createdAt: Timestamp.fromDate(message.createdAt),
        updatedAt: Timestamp.fromDate(message.updatedAt)
      });

      // Update conversation
      await this.updateChatRoom(senderId, receiverId, message);

      logger.info('Car link sent', { conversationId, carId, messageId: docRef.id });
      return docRef.id;
    } catch (error: unknown) {
      logger.error('Failed to send car link', error as Error, { conversationId, carId });
      return null;
    }
  }

  // Get messages for a chat room (with pagination support)
  async getMessages(
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
        const conversationId = this.generateConversationId(senderId, receiverId, carId);
        const baseQuery = query(
          collection(db, 'messages'),
          where('conversationId', '==', conversationId),
          orderBy('createdAt', 'asc'),
          limit(limitCount)
        );
        q = lastMessage ? query(baseQuery, startAfter(lastMessage)) : baseQuery;
      } else {
        // Get all messages between two users (fallback to sender/receiver query)
        // Note: This will get messages where senderId is one user and receiverId is the other
        // For better results, use carId-specific conversations
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
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
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
        const fallbackMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        } as Message));
        return { messages: fallbackMessages, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
      } catch (fallbackError: any) {
        throw new Error(`Failed to get messages: ${error.message}`);
      }
    }
  }

  // Mark messages as read (by conversationId for better accuracy)
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // ✅ FIX: Use conversationId instead of senderId/receiverId for accuracy
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

      // Also update chatRoom if it exists
      const conversationDoc = await getDoc(conversationRef);
      if (conversationDoc.exists()) {
        const data = conversationDoc.data();
        if (data.carId) {
          const participants = data.participants || [];
          if (participants.length === 2) {
            const chatRoomId = this.generateChatRoomId(participants[0], participants[1], data.carId);
            const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
            await updateDoc(chatRoomRef, {
              [`unreadCount.${userId}`]: 0,
              updatedAt: serverTimestamp()
            });
          }
        }
      }

      logger.debug('Messages marked as read', { conversationId, userId, count: querySnapshot.size });
    } catch (error: unknown) {
      logger.error('Failed to mark messages as read', error as Error, { conversationId, userId });
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  }

  // Listen to new messages in real-time
  listenToMessages(
    userId: string | null | undefined,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    // ✅ FIX: Guard against null/undefined userId BEFORE constructing query
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
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Message);
      });

      // Reverse to get chronological order
      callback(messages.reverse());
    });

    this.messageListeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Get user's chat rooms
  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
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
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            createdAt: data.lastMessage.createdAt.toDate(),
            updatedAt: data.lastMessage.updatedAt.toDate()
          } : undefined
        } as ChatRoom);
      });

      return chatRooms;
    } catch (error: unknown) {
      throw new Error(`Failed to get chat rooms: ${error.message}`);
    }
  }

  // Listen to chat rooms in real-time
  listenToChatRooms(
    userId: string | null | undefined,
    callback: (chatRooms: ChatRoom[]) => void
  ): Unsubscribe {
    // ✅ FIX: Guard against null/undefined userId BEFORE constructing query
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
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            createdAt: data.lastMessage.createdAt.toDate(),
            updatedAt: data.lastMessage.updatedAt.toDate()
          } : undefined
        } as ChatRoom);
      });

      callback(chatRooms);
    });

    this.chatRoomListeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Send typing indicator
  // ✅ FIXED: Uses setDoc with fixed document ID instead of addDoc
  async sendTypingIndicator(
    conversationId: string,
    senderId: string,
    receiverId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      // ✅ FIX: Use setDoc with fixed document ID to prevent collection growth
      const typingDocId = `${conversationId}_${senderId}`;
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

  // Listen to typing indicators (by conversationId)
  listenToTypingIndicators(
    conversationId: string,
    userId: string | null | undefined,
    callback: (indicators: TypingIndicator[]) => void
  ): Unsubscribe {
    // ✅ FIX: Guard against null/undefined userId BEFORE constructing query
    if (!userId) {
      logger.warn('listenToTypingIndicators called with null/undefined userId - returning no-op unsubscribe');
      return () => {}; // Return no-op unsubscribe function
    }

    // ✅ FIX: Query by conversationId for better accuracy
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
            timestamp: data.timestamp?.toDate() || new Date()
          });
        }
      });

      callback(indicators);
    });

    const listenerKey = `${conversationId}_${userId}`;
    this.typingListeners.set(listenerKey, unsubscribe);
    return unsubscribe;
  }

  // Private methods
  // ✅ FIXED: Uses setDoc instead of addDoc, and syncs with conversations
  private async updateChatRoom(
    senderId: string,
    receiverId: string,
    lastMessage: Omit<Message, 'id'>
  ): Promise<void> {
    try {
      const chatRoomId = this.generateChatRoomId(senderId, receiverId, lastMessage.carId);
      const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

      // ✅ FIX: Use setDoc with merge instead of getDoc + addDoc/updateDoc
      await setDoc(chatRoomRef, {
        id: chatRoomId,
        participants: [senderId, receiverId],
        participantNames: {
          [senderId]: lastMessage.senderName,
          [receiverId]: lastMessage.receiverName
        },
        lastMessage: {
          ...lastMessage,
          createdAt: Timestamp.fromDate(lastMessage.createdAt),
          updatedAt: Timestamp.fromDate(lastMessage.updatedAt)
        },
        carId: lastMessage.carId,
        carTitle: lastMessage.carTitle,
        unreadCount: {
          [senderId]: 0,
          [receiverId]: 1
        },
        updatedAt: serverTimestamp()
      }, { merge: true });

      // ✅ FIX: Also update conversation to keep them in sync
      if (lastMessage.conversationId) {
        const conversationRef = doc(db, 'conversations', lastMessage.conversationId);
        await updateDoc(conversationRef, {
          lastMessage: {
            text: lastMessage.content || lastMessage.text || '',
            senderId: lastMessage.senderId,
            timestamp: serverTimestamp()
          },
          lastMessageAt: serverTimestamp(),
          [`unreadCount.${receiverId}`]: 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error: unknown) {
      logger.error('Error updating chat room', error as Error, { senderId, receiverId });
    }
  }

  // ✅ NEW: Update conversation metadata
  private async updateConversation(
    conversationId: string,
    lastMessage: Omit<Message, 'id'>
  ): Promise<void> {
    try {
      if (!conversationId) return;

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

  // ✅ DEPRECATED: Use markMessagesAsRead with conversationId instead
  private async updateUnreadCount(
    senderId: string,
    receiverId: string,
    count: number
  ): Promise<void> {
    try {
      const chatRoomId = this.generateChatRoomId(senderId, receiverId);
      const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

      await updateDoc(chatRoomRef, {
        [`unreadCount.${receiverId}`]: count,
        updatedAt: serverTimestamp()
      });
    } catch (error: unknown) {
      // Error updating unread count - silently fail
      logger.debug('Error updating unread count', { senderId, receiverId, error });
    }
  }

  private generateChatRoomId(userId1: string, userId2: string, carId?: string): string {
    // Create consistent chat room ID regardless of order
    const sortedIds = [userId1, userId2].sort();
    if (carId) {
      return `${sortedIds[0]}_${sortedIds[1]}_${carId}`;
    }
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

  // Cleanup listeners
  cleanup(userId: string): void {
    // Cleanup message listeners
    const messageUnsubscribe = this.messageListeners.get(userId);
    if (messageUnsubscribe) {
      messageUnsubscribe();
      this.messageListeners.delete(userId);
    }

    // Cleanup chat room listeners
    const chatRoomUnsubscribe = this.chatRoomListeners.get(userId);
    if (chatRoomUnsubscribe) {
      chatRoomUnsubscribe();
      this.chatRoomListeners.delete(userId);
    }

    // Cleanup typing listeners (by prefix)
    const typingKeysToDelete: string[] = [];
    for (const [key, unsubscribe] of this.typingListeners.entries()) {
      if (key.includes(userId)) {
        unsubscribe();
        typingKeysToDelete.push(key);
      }
    }
    typingKeysToDelete.forEach(key => this.typingListeners.delete(key));
  }
}

/**
 * IMPORTANT: Always call the returned unsubscribe function when using any real-time listener.
 * For user-level listeners, use the provided bulk cleanup helper to remove all listeners for a user on logout/unmount.
 */

// Export singleton instance
export const realtimeMessagingService = RealtimeMessagingService.getInstance();