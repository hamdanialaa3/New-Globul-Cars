// src/services/messaging/advanced-messaging-service.ts
// Advanced Messaging Service - خدمة المحادثات المتقدمة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';

// ==================== INTERFACES ====================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text?: string;
  attachments?: MessageAttachment[];
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: Date;
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

export interface Conversation {
  id: string;
  participants: string[];
  carId?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: { [userId: string]: number };
  typing?: { [userId: string]: boolean };
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  timestamp: Date;
}

// ==================== SERVICE CLASS ====================

export class AdvancedMessagingService {
  private static instance: AdvancedMessagingService;
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): AdvancedMessagingService {
    if (!AdvancedMessagingService.instance) {
      AdvancedMessagingService.instance = new AdvancedMessagingService();
    }
    return AdvancedMessagingService.instance;
  }

  // ==================== MESSAGING ====================

  /**
   * Send text message
   * إرسال رسالة نصية
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string
  ): Promise<string> {
    try {
      const messageData = {
        conversationId,
        senderId,
        receiverId,
        text: text.trim(),
        type: 'text',
        status: 'sent',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);

      // Update conversation
      await this.updateConversation(conversationId, senderId, text);

      console.log('✅ Message sent:', docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('❌ Send message failed:', error);
      throw error;
    }
  }

  /**
   * Send message with attachments
   * إرسال رسالة مع مرفقات
   */
  async sendMessageWithAttachments(
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

      const docRef = await addDoc(collection(db, 'messages'), messageData);

      // 3. Update conversation
      await this.updateConversation(conversationId, senderId, text || '📎 Attachment');

      console.log('✅ Message with attachments sent');
      return docRef.id;

    } catch (error) {
      console.error('❌ Send with attachments failed:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   * تحديد الرسائل كمقروءة
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('status', '!=', 'read')
      );

      const snapshot = await getDocs(q);
      
      const updates = snapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          status: 'read',
          readAt: serverTimestamp()
        })
      );

      await Promise.all(updates);

      // Reset unread count
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0
      });

      console.log('✅ Messages marked as read');
    } catch (error) {
      console.error('❌ Mark as read failed:', error);
    }
  }

  // ==================== TYPING INDICATORS ====================

  /**
   * Set user typing status
   * تعيين حالة الكتابة
   */
  async setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      
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
        }, 3000);

        this.typingTimeouts.set(timeoutKey, timeout);
      }
    } catch (error) {
      console.error('❌ Set typing failed:', error);
    }
  }

  /**
   * Subscribe to typing indicators
   * الاشتراك في مؤشرات الكتابة
   */
  subscribeToTyping(
    conversationId: string,
    callback: (typing: { [userId: string]: boolean }) => void
  ): () => void {
    const convRef = doc(db, 'conversations', conversationId);
    
    return onSnapshot(convRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.typing || {});
      }
    });
  }

  // ==================== FILE ATTACHMENTS ====================

  /**
   * Upload message attachments
   * رفع مرفقات الرسالة
   */
  private async uploadAttachments(
    conversationId: string,
    senderId: string,
    files: File[]
  ): Promise<MessageAttachment[]> {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const uploads = files.map(async (file, index) => {
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }

      // Upload to storage
      const timestamp = Date.now();
      const filename = `${timestamp}_${index}_${file.name}`;
      const storageRef = ref(storage, `messages/${conversationId}/${filename}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

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

  // ==================== HELPERS ====================

  /**
   * Update conversation metadata
   * تحديث بيانات المحادثة
   */
  private async updateConversation(
    conversationId: string,
    senderId: string,
    lastMessageText: string
  ): Promise<void> {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      
      await updateDoc(convRef, {
        lastMessage: {
          text: lastMessageText.slice(0, 100),
          senderId,
          timestamp: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Update conversation failed:', error);
    }
  }

  /**
   * Subscribe to messages
   * الاشتراك في الرسائل
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate()
      } as Message));

      callback(messages);
    });
  }
}

// Export singleton
export const advancedMessagingService = AdvancedMessagingService.getInstance();
