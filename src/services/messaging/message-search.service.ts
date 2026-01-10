/**
 * Message Search Service
 * Provides search functionality for messaging system
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/config/firebase-config';
import { logger } from '@/services/logger-service';
import { Message, Conversation } from '@/types/messaging.types';

interface SearchFilters {
  userId: string;
  searchTerm?: string;
  conversationId?: string;
  startDate?: Date;
  endDate?: Date;
  hasAttachments?: boolean;
  messageType?: 'text' | 'offer' | 'system';
  limit?: number;
}

interface SearchResult {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
}

class MessageSearchService {
  private readonly MESSAGES_COLLECTION = 'messages';
  private readonly CONVERSATIONS_COLLECTION = 'conversations';
  private readonly DEFAULT_LIMIT = 20;

  /**
   * Search messages with filters
   */
  async searchMessages(filters: SearchFilters): Promise<SearchResult> {
    try {
      const { 
        userId, 
        searchTerm, 
        conversationId,
        startDate,
        endDate,
        hasAttachments,
        messageType,
        limit: searchLimit = this.DEFAULT_LIMIT
      } = filters;

      const messagesRef = collection(db, this.MESSAGES_COLLECTION);
      const constraints: QueryConstraint[] = [];

      // User filter (messages where user is sender or recipient)
      if (conversationId) {
        constraints.push(where('conversationId', '==', conversationId));
      } else {
        // Search across all user's conversations
        constraints.push(
          where('participants', 'array-contains', userId)
        );
      }

      // Date filters
      if (startDate) {
        constraints.push(
          where('timestamp', '>=', Timestamp.fromDate(startDate))
        );
      }

      if (endDate) {
        constraints.push(
          where('timestamp', '<=', Timestamp.fromDate(endDate))
        );
      }

      // Message type filter
      if (messageType) {
        constraints.push(where('type', '==', messageType));
      }

      // Attachments filter
      if (hasAttachments !== undefined) {
        if (hasAttachments) {
          constraints.push(where('hasAttachments', '==', true));
        } else {
          constraints.push(where('hasAttachments', '==', false));
        }
      }

      // Order by timestamp (most recent first)
      constraints.push(orderBy('timestamp', 'desc'));

      // Limit results
      constraints.push(limit(searchLimit + 1)); // +1 to check if there are more

      const q = query(messagesRef, ...constraints);
      const snapshot = await getDocs(q);

      let messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      // Filter by search term (client-side for flexibility)
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        messages = messages.filter(msg => 
          msg.content?.toLowerCase().includes(term) ||
          msg.metadata?.subject?.toLowerCase().includes(term)
        );
      }

      const hasMore = messages.length > searchLimit;
      if (hasMore) {
        messages = messages.slice(0, searchLimit);
      }

      logger.info('Message search completed', {
        userId,
        searchTerm,
        resultsCount: messages.length,
        hasMore
      });

      return {
        messages,
        totalCount: messages.length,
        hasMore
      };

    } catch (error) {
      logger.error('Failed to search messages', error as Error, { filters });
      throw error;
    }
  }

  /**
   * Search conversations by participant name or last message
   */
  async searchConversations(
    userId: string,
    searchTerm: string
  ): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(db, this.CONVERSATIONS_COLLECTION);
      
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTimestamp', 'desc'),
        limit(50) // Get more to filter client-side
      );

      const snapshot = await getDocs(q);
      let conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];

      // Filter by search term (participant names or last message)
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        conversations = conversations.filter(conv => {
          // Search in participant names
          const participantMatch = conv.participantDetails?.some(p => 
            p.displayName?.toLowerCase().includes(term)
          );

          // Search in last message
          const messageMatch = conv.lastMessage?.content?.toLowerCase().includes(term);

          return participantMatch || messageMatch;
        });
      }

      logger.info('Conversation search completed', {
        userId,
        searchTerm,
        resultsCount: conversations.length
      });

      return conversations;

    } catch (error) {
      logger.error('Failed to search conversations', error as Error, { userId, searchTerm });
      throw error;
    }
  }

  /**
   * Get messages with attachments
   */
  async getMessagesWithAttachments(
    userId: string,
    conversationId?: string
  ): Promise<Message[]> {
    return this.searchMessages({
      userId,
      conversationId,
      hasAttachments: true,
      limit: 50
    }).then(result => result.messages);
  }

  /**
   * Get offer messages
   */
  async getOfferMessages(
    userId: string,
    conversationId?: string
  ): Promise<Message[]> {
    return this.searchMessages({
      userId,
      conversationId,
      messageType: 'offer',
      limit: 50
    }).then(result => result.messages);
  }

  /**
   * Get messages in date range
   */
  async getMessagesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    conversationId?: string
  ): Promise<Message[]> {
    return this.searchMessages({
      userId,
      conversationId,
      startDate,
      endDate,
      limit: 100
    }).then(result => result.messages);
  }

  /**
   * Count total messages for user
   */
  async getTotalMessagesCount(userId: string): Promise<number> {
    try {
      const messagesRef = collection(db, this.MESSAGES_COLLECTION);
      const q = query(
        messagesRef,
        where('participants', 'array-contains', userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;

    } catch (error) {
      logger.error('Failed to count messages', error as Error, { userId });
      return 0;
    }
  }
}

export const messageSearchService = new MessageSearchService();
