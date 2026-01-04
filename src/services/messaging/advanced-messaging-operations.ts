/**
 * Advanced Messaging Operations
 * عمليات الرسائل المتقدمة
 *
 * This module contains all core business logic operations for the messaging system.
 * يحتوي هذا الوحدة على جميع عمليات منطق الأعمال الأساسية لنظام الرسائل.
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import {
  Message,
  Conversation,
  MessageAttachment,
  RateLimitResult,
  TypingCallback,
  MessagesCallback,
  ConversationsCallback,
  MessageCallback,
} from './advanced-messaging-types';
import {
  RATE_LIMIT_CONFIGS,
  FILE_SIZE_LIMITS,
  COLLECTION_NAMES,
  STORAGE_PATHS,
  TYPING_TIMEOUT_MS,
  QUERY_LIMITS,
} from './advanced-messaging-data';

/**
 * Rate limiter class for managing request limits
 * فئة محدد المعدل لإدارة حدود الطلبات
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  checkRateLimit(userId: string, action: string, config: { maxRequests: number; windowMs: number }): RateLimitResult {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests for this key
    const userRequests = this.requests.get(key) || [];

    // Filter out old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);

    // Check if under limit
    if (validRequests.length < config.maxRequests) {
      validRequests.push(now);
      this.requests.set(key, validRequests);
      return { allowed: true, resetTime: now + config.windowMs };
    }

    // Calculate reset time (when oldest request expires)
    const resetTime = validRequests[0] + config.windowMs;
    return { allowed: false, resetTime };
  }
}

// Create singleton rate limiter
const rateLimiter = new RateLimiter();

/**
 * Conversation Operations
 * عمليات المحادثات
 */
export class ConversationOperations {
  /**
   * Create new conversation
   * إنشاء محادثة جديدة
   */
  static async createConversation(
    participants: string[],
    initialData?: Partial<Conversation>
  ): Promise<string> {
    try {
      // 1. Check if conversation already exists
      const existingId = await this.findConversation(participants[0], participants[1], initialData?.carId);
      if (existingId) {
        return existingId;
      }

      // 2. Create new conversation
      const conversationData = {
        participants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        unreadCount: participants.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
        typing: participants.reduce((acc, id) => ({ ...acc, [id]: false }), {}),
        ...initialData
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAMES.CONVERSATIONS), conversationData);

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Conversation created', { conversationId: docRef.id });
      }

      return docRef.id;
    } catch (error) {
      logger.error('Create conversation failed', error as Error);
      throw error;
    }
  }

  /**
   * Find existing conversation between two users
   * البحث عن محادثة موجودة
   */
  static async findConversation(userId: string, otherUserId: string, carId?: string): Promise<string | null> {
    try {
      const conversationsRef = collection(db, COLLECTION_NAMES.CONVERSATIONS);

      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      );

      const snapshot = await getDocs(q);

      const found = snapshot.docs.find(doc => {
        const data = doc.data();
        const participants = data.participants as string[];
        const hasOtherUser = participants.includes(otherUserId);

        if (carId) {
          return hasOtherUser && data.carId === carId;
        }

        return hasOtherUser;
      });

      return found ? found.id : null;

    } catch (error) {
      logger.error('Find conversation failed', error as Error);
      return null;
    }
  }
  
  /**
   * Find conversation by participants (returns full Conversation object)
   * البحث عن محادثة بواسطة المشاركين
   */
  static async findConversationByParticipants(participantIds: string[]): Promise<Conversation | null> {
    try {
      if (participantIds.length !== 2) {
        logger.warn('findConversationByParticipants requires exactly 2 participants', { 
          provided: participantIds.length 
        });
        return null;
      }

      const conversationsRef = collection(db, COLLECTION_NAMES.CONVERSATIONS);
      
      // Query for conversations containing first participant
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', participantIds[0])
      );

      const snapshot = await getDocs(q);

      // Find conversation that includes both participants
      const found = snapshot.docs.find(doc => {
        const data = doc.data();
        const participants = data.participants as string[];
        
        // Check if all participant IDs are in the conversation
        return participantIds.every(pid => participants.includes(pid));
      });

      if (!found) {
        logger.info('No existing conversation found between participants', { participantIds });
        return null;
      }

      logger.info('Found existing conversation', { 
        conversationId: found.id, 
        participantIds 
      });

      return {
        id: found.id,
        ...found.data()
      } as Conversation;

    } catch (error) {
      logger.error('findConversationByParticipants failed', error as Error, { participantIds });
      return null;
    }
  }

  /**
   * Get user conversations
   * الحصول على محادثات المستخدم
   */
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(db, COLLECTION_NAMES.CONVERSATIONS);
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
    } catch (error) {
      logger.error('Error getting user conversations', error as Error);
      return [];
    }
  }

  /**
   * Update conversation metadata
   * تحديث بيانات المحادثة
   */
  static async updateConversation(
    conversationId: string,
    senderId: string,
    lastMessageText: string
  ): Promise<void> {
    try {
      const convRef = doc(db, COLLECTION_NAMES.CONVERSATIONS, conversationId);
      const convSnap = await getDoc(convRef);
      if (!convSnap.exists()) {
        logger.warn('No conversation document to update', { conversationId });
        return;
      }
      await updateDoc(convRef, {
        lastMessage: {
          text: lastMessageText.slice(0, 100),
          senderId,
          timestamp: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Update conversation failed', error as Error);
    }
  }
}

/**
 * Message Operations
 * عمليات الرسائل
 */
export class MessageOperations {
  /**
   * Send text message
   * إرسال رسالة نصية
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string
  ): Promise<string> {
    try {
      // Rate limiting check
      const rateLimit = rateLimiter.checkRateLimit(
        senderId,
        'message',
        RATE_LIMIT_CONFIGS.message
      );

      if (!rateLimit.allowed) {
        logger.warn('Rate limit exceeded for message', {
          senderId,
          receiverId,
          conversationId,
          resetTime: rateLimit.resetTime
        });
        throw new Error(
          `Rate limit exceeded. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds before sending another message.`
        );
      }

      const messageData = {
        conversationId,
        senderId,
        receiverId,
        text: text.trim(),
        type: 'text',
        status: 'sent',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAMES.MESSAGES), messageData);

      // Update conversation
      await ConversationOperations.updateConversation(conversationId, senderId, text);

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Message sent', { messageId: docRef.id, conversationId });
      }
      return docRef.id;

    } catch (error) {
      logger.error('Send message failed', error as Error);
      throw error;
    }
  }

  /**
   * Send system message
   * إرسال رسالة نظام
   */
  static async sendSystemMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string,
    metadata?: any
  ): Promise<string> {
    try {
      const messageData = {
        conversationId,
        senderId,
        receiverId,
        text,
        type: 'system',
        status: 'sent',
        createdAt: serverTimestamp(),
        ...metadata
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAMES.MESSAGES), messageData);

      // Update conversation last message
      await ConversationOperations.updateConversation(conversationId, senderId, text);

      return docRef.id;
    } catch (error) {
      logger.error('Send system message failed', error as Error);
      throw error;
    }
  }

  /**
   * Send message with attachments
   * إرسال رسالة مع مرفقات
   */
  static async sendMessageWithAttachments(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string,
    files: File[]
  ): Promise<string> {
    try {
      // 1. Upload files
      const attachments = await this.uploadAttachments(conversationId, senderId, files);

      // 2. Send message
      const messageData = {
        conversationId,
        senderId,
        receiverId,
        text: text.trim() || '📎 Attachment',
        attachments,
        type: files[0].type.startsWith('image/') ? 'image' : 'file',
        status: 'sent',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAMES.MESSAGES), messageData);

      // 3. Update conversation
      await ConversationOperations.updateConversation(conversationId, senderId, text || '📎 Attachment');

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Message with attachments sent', { messageId: docRef.id });
      }
      return docRef.id;

    } catch (error) {
      logger.error('Send with attachments failed', error as Error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   * تحديد الرسائل كمقروءة
   */
  static async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTION_NAMES.MESSAGES),
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId)
      );

      const snapshot = await getDocs(q);

      // Filter unread messages client-side
      const updates = snapshot.docs
        .filter(doc => doc.data().status !== 'read')
        .map(doc =>
          updateDoc(doc.ref, {
            status: 'read',
            readAt: serverTimestamp()
          })
        );

      await Promise.all(updates);

      // Reset unread count - check if conversation exists first
      try {
        const convRef = doc(db, COLLECTION_NAMES.CONVERSATIONS, conversationId);
        const convSnap = await getDoc(convRef);
        
        if (convSnap.exists()) {
          await updateDoc(convRef, {
            [`unreadCount.${userId}`]: 0
          });
        } else {
          logger.warn('Conversation not found, skipping unread count update', { conversationId });
        }
      } catch (convError) {
        logger.warn('Failed to update conversation unread count', { conversationId, error: convError });
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Messages marked as read', { conversationId, userId });
      }
    } catch (error) {
      logger.error('Mark as read failed', error as Error);
    }
  }

  /**
   * Mark messages as read (alternative implementation)
   * تحديد الرسائل كمقروءة (تنفيذ بديل)
   */
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const messagesRef = collection(db, COLLECTION_NAMES.MESSAGES);
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      // Only update messages that haven't been read yet
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.readAt) {
          batch.update(doc.ref, { readAt: serverTimestamp() });
        }
      });

      await batch.commit();
    } catch (error) {
      logger.error('Error marking messages as read', error as Error);
    }
  }

  /**
   * Upload message attachments
   * رفع مرفقات الرسالة
   */
  static async uploadAttachments(
    conversationId: string,
    senderId: string,
    files: File[]
  ): Promise<MessageAttachment[]> {
    const uploads = files.map(async (file, index) => {
      // ✅ Phase 2 Fix: Enhanced file validation
      
      // 1. Validate size
      if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }

      // 2. Validate file type (whitelist approach)
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed. Allowed: images (jpg, png, gif, webp) and documents (pdf, doc, docx)`);
      }

      // 3. Validate file extension matches MIME type
      const extension = file.name.split('.').pop()?.toLowerCase();
      const validExtensions: Record<string, string[]> = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
        'image/webp': ['webp'],
        'application/pdf': ['pdf'],
        'application/msword': ['doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
      };
      
      const expectedExtensions = validExtensions[file.type];
      if (!expectedExtensions || !extension || !expectedExtensions.includes(extension)) {
        throw new Error(`File extension .${extension} does not match MIME type ${file.type}`);
      }

      // 4. Check for suspicious filenames
      const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.sh', '.js', '.html', '.php'];
      if (suspiciousPatterns.some(pattern => file.name.toLowerCase().includes(pattern))) {
        throw new Error(`File name contains suspicious pattern: ${file.name}`);
      }

      // Upload to storage
      const timestamp = Date.now();
      const filename = `${timestamp}_${index}_${file.name}`;
      const storageRef = ref(storage, `${STORAGE_PATHS.MESSAGES}/${conversationId}/${filename}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      logger.info('[MessageOperations] File uploaded successfully', {
        conversationId,
        filename: file.name,
        size: file.size,
        type: file.type
      });

      return {
        id: `${timestamp}_${index}`,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url,
        name: file.name,
        size: file.size
      } as MessageAttachment;
    });

    return Promise.all(uploads);
  }

  /**
   * Get conversation messages
   * الحصول على رسائل المحادثة
   */
  static async getConversation(
    userId: string,
    otherUserId: string,
    carId?: string
  ): Promise<Message[]> {
    try {
      const messagesRef = collection(db, COLLECTION_NAMES.MESSAGES);
      let q = query(
        messagesRef,
        where('senderId', 'in', [userId, otherUserId]),
        where('receiverId', 'in', [userId, otherUserId]),
        orderBy('createdAt', 'asc')
      );

      if (carId) {
        q = query(
          messagesRef,
          where('carId', '==', carId),
          orderBy('createdAt', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate()
      } as Message));
    } catch (error) {
      logger.error('Error getting conversation', error as Error);
      return [];
    }
  }
}

/**
 * Typing Operations
 * عمليات الكتابة
 */
export class TypingOperations {
  private static typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Set user typing status
   * تعيين حالة الكتابة
   */
  static async setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      const convRef = doc(db, COLLECTION_NAMES.CONVERSATIONS, conversationId);

      await updateDoc(convRef, {
        [`typing.${userId}`]: isTyping,
        updatedAt: serverTimestamp()
      });

      // Auto-clear after 3 seconds
      if (isTyping) {
        const timeoutKey = `${conversationId}_${userId}`;

        if (this.typingTimeouts.has(timeoutKey)) {
          clearTimeout(this.typingTimeouts.get(timeoutKey)!);
        }

        const timeout = setTimeout(() => {
          this.setTyping(conversationId, userId, false);
        }, TYPING_TIMEOUT_MS);

        this.typingTimeouts.set(timeoutKey, timeout);
      }
    } catch (error) {
      logger.error('Set typing failed', error as Error);
    }
  }

  /**
   * Subscribe to typing indicators
   * الاشتراك في مؤشرات الكتابة
   */
  static subscribeToTyping(
    conversationId: string,
    callback: TypingCallback
  ): () => void {
    const convRef = doc(db, COLLECTION_NAMES.CONVERSATIONS, conversationId);

    return onSnapshot(convRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.typing || {});
      }
    });
  }
}

/**
 * Subscription Operations
 * عمليات الاشتراك
 */
export class SubscriptionOperations {
  /**
   * Subscribe to messages
   * الاشتراك في الرسائل
   */
  static subscribeToMessages(
    conversationId: string,
    callback: MessagesCallback
  ): () => void {
    // ✅ Guard against invalid conversationId
    if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
      logger.warn('subscribeToMessages called with invalid conversationId', { conversationId });
      return () => {}; // Return no-op unsubscribe
    }

    let unsubscribe: (() => void) | null = null;
    
    try {
      const q = query(
        collection(db, COLLECTION_NAMES.MESSAGES),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc'),
        limit(QUERY_LIMITS.MESSAGES_PER_CONVERSATION)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            readAt: doc.data().readAt?.toDate()
          } as Message));

          callback(messages);
        },
        (error) => {
          logger.error('Error in subscribeToMessages', error as Error, { conversationId });
        }
      );
    } catch (error) {
      logger.error('Error setting up messages subscription', error as Error, { conversationId });
      return () => {}; // Return no-op if setup fails
    }

    // Return unsubscribe function with error handling
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (cleanupError) {
          logger.warn('Error cleaning up messages subscription', {
            error: (cleanupError as Error).message,
            conversationId
          });
        }
      }
    };
  }

  /**
   * Subscribe to user conversations
   * الاشتراك في محادثات المستخدم
   */
  static subscribeToUserConversations(
    userId: string | null | undefined,
    callback: ConversationsCallback
  ): () => void {
    // ✅ Guard against null/undefined userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      logger.warn('subscribeToUserConversations called with invalid userId - returning no-op unsubscribe');
      return () => {}; // Return no-op unsubscribe function
    }

    let unsubscribe: (() => void) | null = null;

    try {
      const conversationsRef = collection(db, COLLECTION_NAMES.CONVERSATIONS);
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const conversations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Conversation));
          callback(conversations);
        },
        (error) => {
          logger.error('Error in subscribeToUserConversations', error as Error, { userId });
        }
      );
    } catch (error) {
      logger.error('Error setting up conversations subscription', error as Error, { userId });
      return () => {}; // Return no-op if setup fails
    }

    // Return unsubscribe function with error handling
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (cleanupError) {
          logger.warn('Error cleaning up conversations subscription', {
            error: (cleanupError as Error).message,
            userId
          });
        }
      }
    };
  }

  /**
   * Subscribe to conversation messages
   * الاشتراك في رسائل المحادثة
   */
  static subscribeToConversation(
    conversationId: string,
    userId: string,
    otherUserId: string,
    callback: MessageCallback
  ): () => void {
    const q = query(
      collection(db, COLLECTION_NAMES.MESSAGES),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
      limit(QUERY_LIMITS.MESSAGES_PER_CONVERSATION)
    );

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const message = {
            id: change.doc.id,
            ...change.doc.data(),
            createdAt: change.doc.data().createdAt?.toDate() || new Date(),
            readAt: change.doc.data().readAt?.toDate()
          } as Message;
          callback(message);
        }
      });
    });
  }
}