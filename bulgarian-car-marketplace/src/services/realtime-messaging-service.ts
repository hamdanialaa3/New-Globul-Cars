// src/services/realtime-messaging-service.ts
// Main Real-time Messaging Service class

import { Unsubscribe } from 'firebase/firestore';
import { logger } from './logger-service';
import { Message, ChatRoom, TypingIndicator } from './realtime-messaging-types';
import {
  sendMessage,
  getOrCreateConversationId,
  getMessages,
  markMessagesAsRead
} from './realtime-messaging-operations';
import {
  listenToMessages,
  getUserChatRooms,
  getConversationById,
  listenToChatRooms,
  sendTypingIndicator,
  listenToTypingIndicators
} from './realtime-messaging-listeners';

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
    return sendMessage(messageData);
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
    return getOrCreateConversationId(senderId, receiverId, carId, senderName, receiverName, carTitle);
  }

  // Get messages for a chat room (with pagination support)
  async getMessages(
    senderId: string,
    receiverId: string,
    carId?: string,
    limitCount: number = 50,
    lastMessage?: any
  ): Promise<{ messages: Message[]; lastDoc?: any }> {
    return getMessages(senderId, receiverId, carId, limitCount, lastMessage);
  }

  // Mark messages as read (by conversationId for better accuracy)
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    return markMessagesAsRead(conversationId, userId);
  }

  // Listen to new messages in real-time
  listenToMessages(
    userId: string | null | undefined,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    const unsubscribe = listenToMessages(userId, callback);
    if (userId) {
      this.messageListeners.set(userId, unsubscribe);
    }
    return unsubscribe;
  }

  // Get user's chat rooms
  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    return getUserChatRooms(userId);
  }

  // Get conversation by ID
  async getConversationById(conversationId: string): Promise<ChatRoom | null> {
    return getConversationById(conversationId);
  }

  // Listen to chat rooms in real-time
  listenToChatRooms(
    userId: string | null | undefined,
    callback: (chatRooms: ChatRoom[]) => void
  ): Unsubscribe {
    const unsubscribe = listenToChatRooms(userId, callback);
    if (userId) {
      this.chatRoomListeners.set(userId, unsubscribe);
    }
    return unsubscribe;
  }

  // Send typing indicator
  async sendTypingIndicator(
    conversationId: string,
    senderId: string,
    receiverId: string,
    isTyping: boolean
  ): Promise<void> {
    return sendTypingIndicator(conversationId, senderId, receiverId, isTyping);
  }

  // Listen to typing indicators (by conversationId)
  listenToTypingIndicators(
    conversationId: string,
    userId: string | null | undefined,
    callback: (indicators: TypingIndicator[]) => void
  ): Unsubscribe {
    const unsubscribe = listenToTypingIndicators(conversationId, userId, callback);
    if (userId) {
      const listenerKey = `${conversationId}_${userId}`;
      this.typingListeners.set(listenerKey, unsubscribe);
    }
    return unsubscribe;
  }

  // Send car link in message
  async sendCarLink(
    conversationId: string,
    senderId: string,
    receiverId: string,
    carId: string,
    carTitle: string
  ): Promise<string | null> {
    try {
      const messageData = {
        conversationId,
        senderId,
        senderName: '', // Will be filled by caller
        receiverId,
        receiverName: '', // Will be filled by caller
        carId,
        carTitle,
        content: `Check out this car: ${carTitle}`,
        messageType: 'offer' as const,
        isRead: false
      };

      return await this.sendMessage(messageData);
    } catch (error: unknown) {
      logger.error('Failed to send car link', error as Error, { conversationId, carId });
      return null;
    }
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