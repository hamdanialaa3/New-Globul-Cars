// src/services/realtimeMessaging.ts
// Real-time Messaging Service for Bulgarian Car Marketplace

import {
  collection,
  doc,
  addDoc,
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
  or
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';

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

      // Update chat room
      await this.updateChatRoom(messageData.senderId, messageData.receiverId, message);

      return docRef.id;
    } catch (error: unknown) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Get or create conversation ID for a specific car
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
      
      // Check if conversation exists
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        // Create new conversation
        await addDoc(collection(db, 'conversations'), {
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
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        });
        
        logger.info('New conversation created', { conversationId, carId, senderId, receiverId });
      }
      
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

  // Get messages for a chat room (fixed query)
  async getMessages(
    senderId: string, 
    receiverId: string, 
    carId?: string,
    limitCount: number = 50
  ): Promise<Message[]> {
    try {
      let q;
      
      if (carId) {
        // Get messages for specific car conversation
        const conversationId = this.generateConversationId(senderId, receiverId, carId);
        q = query(
          collection(db, 'messages'),
          where('conversationId', '==', conversationId),
          orderBy('createdAt', 'asc'),
          limit(limitCount)
        );
      } else {
        // Get all messages between two users (fallback to sender/receiver query)
        // Note: This will get messages where senderId is one user and receiverId is the other
        // For better results, use carId-specific conversations
        q = query(
          collection(db, 'messages'),
          where('senderId', '==', senderId),
          where('receiverId', '==', receiverId),
          orderBy('createdAt', 'asc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Message);
      });

      return messages;
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
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        } as Message));
      } catch (fallbackError: any) {
        throw new Error(`Failed to get messages: ${error.message}`);
      }
    }
  }

  // Mark messages as read
  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('senderId', '==', senderId),
        where('receiverId', '==', receiverId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);

      const updatePromises = querySnapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          isRead: true,
          updatedAt: Timestamp.fromDate(new Date())
        })
      );

      await Promise.all(updatePromises);

      // Update unread count in chat room
      await this.updateUnreadCount(senderId, receiverId, 0);
    } catch (error: unknown) {
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
  async sendTypingIndicator(
    senderId: string,
    receiverId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const typingData = {
        userId: senderId,
        isTyping,
        timestamp: Timestamp.fromDate(new Date())
      };

      // Update typing status in a temporary collection
      await addDoc(collection(db, 'typing'), {
        ...typingData,
        receiverId
      });
    } catch (error: unknown) {
      // Error sending typing indicator - silently fail
    }
  }

  // Listen to typing indicators
  listenToTypingIndicators(
    userId: string | null | undefined,
    callback: (indicators: TypingIndicator[]) => void
  ): Unsubscribe {
    // ✅ FIX: Guard against null/undefined userId BEFORE constructing query
    if (!userId) {
      logger.warn('listenToTypingIndicators called with null/undefined userId - returning no-op unsubscribe');
      return () => {}; // Return no-op unsubscribe function
    }

    const q = query(
      collection(db, 'typing'),
      where('receiverId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const indicators: TypingIndicator[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        indicators.push({
          userId: data.userId,
          userName: data.userName || 'Unknown User',
          isTyping: data.isTyping,
          timestamp: data.timestamp.toDate()
        });
      });

      callback(indicators);
    });

    this.typingListeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Private methods
  private async updateChatRoom(
    senderId: string,
    receiverId: string,
    lastMessage: Omit<Message, 'id'>
  ): Promise<void> {
    try {
      const chatRoomId = this.generateChatRoomId(senderId, receiverId, lastMessage.carId);

      const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
      const chatRoomDoc = await getDoc(chatRoomRef);

      if (chatRoomDoc.exists()) {
        // Update existing chat room
        await updateDoc(chatRoomRef, {
          lastMessage: {
            ...lastMessage,
            createdAt: Timestamp.fromDate(lastMessage.createdAt),
            updatedAt: Timestamp.fromDate(lastMessage.updatedAt)
          },
          carId: lastMessage.carId || chatRoomDoc.data().carId,
          carTitle: lastMessage.carTitle || chatRoomDoc.data().carTitle,
          updatedAt: Timestamp.fromDate(new Date())
        });
      } else {
        // Create new chat room
        await addDoc(collection(db, 'chatRooms'), {
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
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    } catch (error: unknown) {
      logger.error('Error updating chat room', error as Error, { senderId, receiverId });
    }
  }

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
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error: unknown) {
      // Error updating unread count - silently fail
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
    const messageUnsubscribe = this.messageListeners.get(userId);
    if (messageUnsubscribe) {
      messageUnsubscribe();
      this.messageListeners.delete(userId);
    }

    const chatRoomUnsubscribe = this.chatRoomListeners.get(userId);
    if (chatRoomUnsubscribe) {
      chatRoomUnsubscribe();
      this.chatRoomListeners.delete(userId);
    }

    const typingUnsubscribe = this.typingListeners.get(userId);
    if (typingUnsubscribe) {
      typingUnsubscribe();
      this.typingListeners.delete(userId);
    }
  }
}

/**
 * IMPORTANT: Always call the returned unsubscribe function when using any real-time listener.
 * For user-level listeners, use the provided bulk cleanup helper to remove all listeners for a user on logout/unmount.
 */

// Export singleton instance
export const realtimeMessagingService = RealtimeMessagingService.getInstance();