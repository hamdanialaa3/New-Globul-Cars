/**
 * Messaging Service - P2P Chat System
 * Handles all messaging operations between users
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  limit,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Timestamp;
  read: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  members: string[];
  lastMessage: {
    text: string;
    timestamp: Timestamp;
    senderId: string;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ConversationWithUser {
  conversation: Conversation;
  otherUser: {
    uid: string;
    displayName: string;
    photoURL: string;
    email: string;
  };
}

class MessagingService {
  /**
   * Create deterministic conversation ID from two user IDs
   * Always sorts IDs alphabetically to ensure same ID regardless of order
   */
  private createConversationId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Get or create a conversation between two users
   */
  async getOrCreateConversation(
    currentUserId: string,
    otherUserId: string
  ): Promise<string> {
    const conversationId = this.createConversationId(currentUserId, otherUserId);
    const conversationRef = doc(db, 'conversations', conversationId);
    
    try {
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        // Create new conversation
        await updateDoc(conversationRef, {
          members: [currentUserId, otherUserId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unreadCount: {
            [currentUserId]: 0,
            [otherUserId]: 0
          }
        });
        
        console.log('Created new conversation:', conversationId);
      }
      
      return conversationId;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachments?: string[]
  ): Promise<string> {
    if (!content.trim() && (!attachments || attachments.length === 0)) {
      throw new Error('Message content or attachments required');
    }
    
    try {
      // Get conversation to find recipient
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }
      
      const conversationData = conversationDoc.data();
      const members = conversationData.members || [];
      const recipientId = members.find((uid: string) => uid !== senderId);
      
      // Add message to subcollection
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const messageDoc = await addDoc(messagesRef, {
        senderId,
        content: content.trim(),
        timestamp: serverTimestamp(),
        read: false,
        ...(attachments && attachments.length > 0 && { attachments })
      });
      
      // Update conversation metadata
      await updateDoc(conversationRef, {
        lastMessage: {
          text: content.substring(0, 100),
          timestamp: serverTimestamp(),
          senderId
        },
        updatedAt: serverTimestamp(),
        [`unreadCount.${recipientId}`]: (conversationData.unreadCount?.[recipientId] || 0) + 1
      });
      
      console.log('Message sent:', messageDoc.id);
      return messageDoc.id;
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(
    conversationId: string,
    messageId: string
  ): Promise<void> {
    try {
      const messageRef = doc(
        db,
        'conversations',
        conversationId,
        'messages',
        messageId
      );
      
      await updateDoc(messageRef, {
        read: true
      });
      
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      // Reset unread count for this user
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
      });
      
      // Mark all unread messages as read
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const unreadQuery = query(
        messagesRef,
        where('read', '==', false),
        where('senderId', '!=', userId)
      );
      
      const unreadMessages = await getDocs(unreadQuery);
      
      const updatePromises = unreadMessages.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updatePromises);
      
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  /**
   * Subscribe to messages in a conversation
   * Returns unsubscribe function
   */
  subscribeToMessages(
    conversationId: string,
    onMessagesUpdate: (messages: Message[]) => void
  ): Unsubscribe {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messagesQuery = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    
    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages: Message[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message));
        
        onMessagesUpdate(messages);
      },
      (error) => {
        console.error('Error listening to messages:', error);
      }
    );
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<ConversationWithUser[]> {
    try {
      const conversationsRef = collection(db, 'conversations');
      const conversationsQuery = query(
        conversationsRef,
        where('members', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const conversationsSnapshot = await getDocs(conversationsQuery);
      
      const conversationsWithUsers = await Promise.all(
        conversationsSnapshot.docs.map(async (conversationDoc) => {
          const conversationData = conversationDoc.data() as Conversation;
          const otherUserId = conversationData.members.find(
            (uid) => uid !== userId
          );
          
          if (!otherUserId) {
            return null;
          }
          
          // Get other user's info
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          const userData = userDoc.data();
          
          return {
            conversation: {
              ...conversationData,
              id: conversationDoc.id
            },
            otherUser: {
              uid: otherUserId,
              displayName: userData?.displayName || userData?.businessName || 'User',
              photoURL: userData?.photoURL || userData?.profileImage?.url || '',
              email: userData?.email || ''
            }
          };
        })
      );
      
      // Filter out null values and ensure proper typing
      const validConversations = conversationsWithUsers.filter(
        (conv): conv is NonNullable<typeof conv> => conv !== null
      );
      
      return validConversations as ConversationWithUser[];
      
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user's conversations
   */
  subscribeToConversations(
    userId: string,
    onConversationsUpdate: (conversations: ConversationWithUser[]) => void
  ): Unsubscribe {
    const conversationsRef = collection(db, 'conversations');
    const conversationsQuery = query(
      conversationsRef,
      where('members', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(
      conversationsQuery,
      async (snapshot) => {
        const conversationsWithUsers = await Promise.all(
          snapshot.docs.map(async (conversationDoc) => {
            const conversationData = conversationDoc.data() as Conversation;
            const otherUserId = conversationData.members.find(
              (uid) => uid !== userId
            );
            
            if (!otherUserId) return null;
            
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            const userData = userDoc.data();
            
            return {
              conversation: {
                ...conversationData,
                id: conversationDoc.id
              },
              otherUser: {
                uid: otherUserId,
                displayName: userData?.displayName || userData?.businessName || 'User',
                photoURL: userData?.photoURL || userData?.profileImage?.url || '',
                email: userData?.email || ''
              }
            };
          })
        );
        
        const validConversations = conversationsWithUsers.filter(
          (conv): conv is NonNullable<typeof conv> => conv !== null
        );
        
        onConversationsUpdate(validConversations as ConversationWithUser[]);
      },
      (error) => {
        console.error('Error listening to conversations:', error);
      }
    );
  }

  /**
   * Delete a conversation (admin only or both users agree)
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      // Delete all messages first
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(messageDoc.ref)
      );
      await Promise.all(deletePromises);
      
      // Delete conversation document
      const conversationRef = doc(db, 'conversations', conversationId);
      await deleteDoc(conversationRef);
      
      console.log('Conversation deleted:', conversationId);
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

export const messagingService = new MessagingService();
export default messagingService;

