import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  carId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  senderName?: string;
  receiverName?: string;
  carTitle?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: Date;
  unreadCount: number;
  carId: string;
  carTitle?: string;
  otherParticipant: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface MessageNotification {
  id: string;
  type: 'new_message';
  title: string;
  message: string;
  userId: string;
  carId: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
}

class MessagingService {
  private unsubscribeFunctions: Unsubscribe[] = [];

  // Send a message
  async sendMessage(
    senderId: string,
    receiverId: string,
    carId: string,
    text: string
  ): Promise<string> {
    try {
      const messageData = {
        senderId,
        receiverId,
        carId,
        text: text.trim(),
        timestamp: serverTimestamp(),
        isRead: false
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);
      
      // Create notification for receiver
      await this.createMessageNotification(receiverId, senderId, carId, text);
      
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get conversation between two users about a specific car
  async getConversation(
    userId1: string,
    userId2: string,
    carId: string
  ): Promise<Message[]> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('carId', '==', carId),
        where('senderId', 'in', [userId1, userId2]),
        where('receiverId', 'in', [userId1, userId2]),
        orderBy('timestamp', 'asc')
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      
      const messages = await Promise.all(
        messagesSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Get sender info
          const senderDoc = await getDoc(doc(db, 'users', data.senderId));
          const senderData = senderDoc.data();
          
          // Get receiver info
          const receiverDoc = await getDoc(doc(db, 'users', data.receiverId));
          const receiverData = receiverDoc.data();
          
          // Get car info
          const carDoc = await getDoc(doc(db, 'cars', data.carId));
          const carData = carDoc.data();
          
          return {
            id: doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            carId: data.carId,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false,
            senderName: senderData?.displayName || senderData?.email || 'Unknown',
            receiverName: receiverData?.displayName || receiverData?.email || 'Unknown',
            carTitle: carData?.title || `${carData?.make} ${carData?.model}` || 'Unknown Car'
          };
        })
      );
      
      return messages;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Get all conversations for a user
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // Get all messages where user is sender or receiver
      const messagesQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      
      // Group messages by car and other participant
      const conversationMap = new Map<string, Conversation>();
      
      for (const doc of messagesSnapshot.docs) {
        const data = doc.data();
        const otherUserId = data.receiverId;
        const carId = data.carId;
        const conversationKey = `${carId}_${otherUserId}`;
        
        if (!conversationMap.has(conversationKey)) {
          // Get other participant info
          const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
          const otherUserData = otherUserDoc.data();
          
          // Get car info
          const carDoc = await getDoc(doc(db, 'cars', carId));
          const carData = carDoc.data();
          
          conversationMap.set(conversationKey, {
            id: conversationKey,
            participants: [userId, otherUserId],
            lastMessage: undefined,
            lastMessageTime: undefined,
            unreadCount: 0,
            carId,
            carTitle: carData?.title || `${carData?.make} ${carData?.model}` || 'Unknown Car',
            otherParticipant: {
              id: otherUserId,
              name: otherUserData?.displayName || otherUserData?.email || 'Unknown',
              avatar: otherUserData?.photoURL
            }
          });
        }
        
        const conversation = conversationMap.get(conversationKey)!;
        
        // Update last message if this is more recent
        if (!conversation.lastMessageTime || data.timestamp > conversation.lastMessageTime) {
          conversation.lastMessage = {
            id: doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            carId: data.carId,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false
          };
          conversation.lastMessageTime = data.timestamp?.toDate() || new Date();
        }
        
        // Count unread messages
        if (data.receiverId === userId && !data.isRead) {
          conversation.unreadCount++;
        }
      }
      
      // Also check messages where user is receiver
      const receivedMessagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const receivedMessagesSnapshot = await getDocs(receivedMessagesQuery);
      
      for (const doc of receivedMessagesSnapshot.docs) {
        const data = doc.data();
        const otherUserId = data.senderId;
        const carId = data.carId;
        const conversationKey = `${carId}_${otherUserId}`;
        
        if (!conversationMap.has(conversationKey)) {
          // Get other participant info
          const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
          const otherUserData = otherUserDoc.data();
          
          // Get car info
          const carDoc = await getDoc(doc(db, 'cars', carId));
          const carData = carDoc.data();
          
          conversationMap.set(conversationKey, {
            id: conversationKey,
            participants: [userId, otherUserId],
            lastMessage: undefined,
            lastMessageTime: undefined,
            unreadCount: 0,
            carId,
            carTitle: carData?.title || `${carData?.make} ${carData?.model}` || 'Unknown Car',
            otherParticipant: {
              id: otherUserId,
              name: otherUserData?.displayName || otherUserData?.email || 'Unknown',
              avatar: otherUserData?.photoURL
            }
          });
        }
        
        const conversation = conversationMap.get(conversationKey)!;
        
        // Update last message if this is more recent
        if (!conversation.lastMessageTime || data.timestamp > conversation.lastMessageTime) {
          conversation.lastMessage = {
            id: doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            carId: data.carId,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false
          };
          conversation.lastMessageTime = data.timestamp?.toDate() || new Date();
        }
        
        // Count unread messages
        if (!data.isRead) {
          conversation.unreadCount++;
        }
      }
      
      return Array.from(conversationMap.values()).sort((a, b) => 
        (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)
      );
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const [carId, otherUserId] = conversationId.split('_');
      
      // Get all unread messages in this conversation
      const messagesQuery = query(
        collection(db, 'messages'),
        where('carId', '==', carId),
        where('senderId', '==', otherUserId),
        where('receiverId', '==', userId),
        where('isRead', '==', false)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      
      // Mark all as read
      const updatePromises = messagesSnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Subscribe to real-time messages for a conversation
  subscribeToConversation(
    carId: string,
    userId1: string,
    userId2: string,
    onMessage: (message: Message) => void
  ): () => void {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('carId', '==', carId),
      where('senderId', 'in', [userId1, userId2]),
      where('receiverId', 'in', [userId1, userId2]),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Get sender info
          const senderDoc = await getDoc(doc(db, 'users', data.senderId));
          const senderData = senderDoc.data();
          
          // Get receiver info
          const receiverDoc = await getDoc(doc(db, 'users', data.receiverId));
          const receiverData = receiverDoc.data();
          
          // Get car info
          const carDoc = await getDoc(doc(db, 'cars', data.carId));
          const carData = carDoc.data();
          
          const message: Message = {
            id: change.doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            carId: data.carId,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false,
            senderName: senderData?.displayName || senderData?.email || 'Unknown',
            receiverName: receiverData?.displayName || receiverData?.email || 'Unknown',
            carTitle: carData?.title || `${carData?.make} ${carData?.model}` || 'Unknown Car'
          };
          
          onMessage(message);
        }
      }
    });

    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Subscribe to user conversations
  subscribeToUserConversations(
    userId: string,
    onConversationsUpdate: (conversations: Conversation[]) => void
  ): () => void {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      // Re-fetch conversations when messages change
      const conversations = await this.getUserConversations(userId);
      onConversationsUpdate(conversations);
    });

    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Create message notification
  private async createMessageNotification(
    receiverId: string,
    senderId: string,
    carId: string,
    messageText: string
  ): Promise<void> {
    try {
      // Get sender info
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data();
      
      // Get car info
      const carDoc = await getDoc(doc(db, 'cars', carId));
      const carData = carDoc.data();
      
      const notificationData = {
        type: 'new_message',
        title: `New message from ${senderData?.displayName || 'Unknown'}`,
        message: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
        userId: receiverId,
        carId,
        senderId,
        timestamp: serverTimestamp(),
        isRead: false
      };

      await addDoc(collection(db, 'notifications'), notificationData);
    } catch (error) {
      console.error('Error creating message notification:', error);
      // Don't throw error to prevent breaking message sending
    }
  }

  // Get unread message count for user
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId),
        where('isRead', '==', false)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      return messagesSnapshot.size;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
  }
}

export const messagingService = new MessagingService();

