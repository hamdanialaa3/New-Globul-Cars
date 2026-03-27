/**
 * Messaging Service Interface
 * Shared contract for real-time messaging across web and mobile.
 */

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  listingId?: string;
  unreadCount: Record<string, number>;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
  readBy: string[];
  createdAt: Date;
}

export interface IMessagingService {
  /** Get or create a conversation between two users about a listing */
  getOrCreateConversation(
    currentUserId: string,
    otherUserId: string,
    listingId?: string
  ): Promise<Conversation>;

  /** Send a text message */
  sendMessage(conversationId: string, senderId: string, text: string): Promise<Message>;

  /** Mark messages as read */
  markAsRead(conversationId: string, userId: string): Promise<void>;

  /** Get conversations for a user */
  getConversations(userId: string): Promise<Conversation[]>;

  /** Get messages in a conversation */
  getMessages(conversationId: string, limitCount?: number): Promise<Message[]>;
}
