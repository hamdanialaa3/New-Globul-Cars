import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import type { Message, Conversation } from '../advanced-messaging-types';

/**
 * Search Manager Module
 * وحدة البحث والفلترة
 * 
 * Handles searching messages and filtering conversations
 * Phase 2 Implementation
 */
export class SearchManager {
  private readonly MESSAGES_COLLECTION = 'messages';
  private readonly CONVERSATIONS_COLLECTION = 'conversations';

  /**
   * SEARCH MESSAGES
   * البحث في الرسائل
   */
  async searchMessages(params: {
    conversationId?: string;
    userId: string;
    searchTerm: string;
    limit?: number;
  }): Promise<Message[]> {
    const { conversationId, userId, searchTerm, limit = 50 } = params;

    try {
      logger.info('[SearchManager] Searching messages', {
        conversationId,
        searchTerm: searchTerm.substring(0, 20) + '...',
        limit
      });

      const messagesRef = collection(db, this.MESSAGES_COLLECTION);
      
      // Build query based on search criteria
      let q;
      if (conversationId) {
        // Search within specific conversation
        q = query(
          messagesRef,
          where('conversationId', '==', conversationId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Search across all user's messages
        q = query(
          messagesRef,
          where('participants', 'array-contains', userId),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      
      // Client-side filtering (Firestore doesn't support full-text search natively)
      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        } as Message))
        .filter(message => {
          const content = message.content?.toLowerCase() || '';
          const term = searchTerm.toLowerCase();
          return content.includes(term);
        })
        .slice(0, limit);

      logger.info('[SearchManager] Search completed', {
        resultsCount: results.length,
        searchTerm: searchTerm.substring(0, 20) + '...'
      });

      return results;
    } catch (error) {
      logger.error('[SearchManager] Search failed', error as Error, {
        conversationId,
        searchTerm: searchTerm.substring(0, 20) + '...'
      });
      throw error;
    }
  }

  /**
   * FILTER CONVERSATIONS
   * فلترة المحادثات
   */
  async filterConversations(params: {
    userId: string;
    filters: {
      unreadOnly?: boolean;
      hasOffers?: boolean;
      archivedOnly?: boolean;
      carId?: string;
      startDate?: Date;
      endDate?: Date;
    };
    limit?: number;
  }): Promise<Conversation[]> {
    const { userId, filters, limit = 50 } = params;

    try {
      logger.info('[SearchManager] Filtering conversations', {
        userId,
        filters
      });

      const conversationsRef = collection(db, this.CONVERSATIONS_COLLECTION);
      
      // Base query: user's conversations
      let q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      const snapshot = await getDocs(q);
      
      // Apply filters client-side
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      } as Conversation));

      // Filter: unread only
      if (filters.unreadOnly) {
        results = results.filter(conv => 
          (conv.unreadCount?.[userId] || 0) > 0
        );
      }

      // Filter: has offers
      if (filters.hasOffers) {
        results = results.filter(conv => 
          conv.hasOffers === true
        );
      }

      // Filter: archived only
      if (filters.archivedOnly) {
        results = results.filter(conv => 
          conv.isArchivedFor?.[userId] === true
        );
      }

      // Filter: specific car
      if (filters.carId) {
        results = results.filter(conv => 
          conv.carId === filters.carId
        );
      }

      // Filter: date range
      if (filters.startDate) {
        results = results.filter(conv => 
          conv.lastMessageAt >= filters.startDate!
        );
      }

      if (filters.endDate) {
        results = results.filter(conv => 
          conv.lastMessageAt <= filters.endDate!
        );
      }

      // Apply limit
      results = results.slice(0, limit);

      logger.info('[SearchManager] Filter completed', {
        resultsCount: results.length,
        filters
      });

      return results;
    } catch (error) {
      logger.error('[SearchManager] Filter failed', error as Error, {
        userId,
        filters
      });
      throw error;
    }
  }

  /**
   * SEARCH CONVERSATIONS BY PARTICIPANT NAME
   * البحث في المحادثات حسب اسم المشارك
   */
  async searchConversationsByParticipant(params: {
    userId: string;
    participantName: string;
    limit?: number;
  }): Promise<Conversation[]> {
    const { userId, participantName, limit = 20 } = params;

    try {
      logger.info('[SearchManager] Searching conversations by participant', {
        userId,
        participantName: participantName.substring(0, 20) + '...'
      });

      // First, get all user's conversations
      const conversations = await this.filterConversations({
        userId,
        filters: {},
        limit: 100 // Get more to filter
      });

      // Get participant details and filter by name
      const usersRef = collection(db, 'users');
      const participantsPromises = conversations.map(async (conv) => {
        const otherParticipantId = conv.participants.find(id => id !== userId);
        if (!otherParticipantId) return null;

        const userDoc = await getDocs(
          query(usersRef, where('__name__', '==', otherParticipantId))
        );

        if (userDoc.empty) return null;

        const userData = userDoc.docs[0].data();
        const displayName = userData.displayName || userData.email || '';
        
        if (displayName.toLowerCase().includes(participantName.toLowerCase())) {
          return conv;
        }

        return null;
      });

      const results = (await Promise.all(participantsPromises))
        .filter((conv): conv is Conversation => conv !== null)
        .slice(0, limit);

      logger.info('[SearchManager] Participant search completed', {
        resultsCount: results.length,
        participantName: participantName.substring(0, 20) + '...'
      });

      return results;
    } catch (error) {
      logger.error('[SearchManager] Participant search failed', error as Error, {
        userId,
        participantName: participantName.substring(0, 20) + '...'
      });
      throw error;
    }
  }
}

// Singleton export
export const searchManager = new SearchManager();
