// src/services/realtime-messaging-types.ts
// Type definitions for Real-time Messaging Service

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

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  carId?: string;
  carTitle?: string;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}
