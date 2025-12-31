/**
 * Advanced Messaging Service
 * خدمة الرسائل المتقدمة
 *
 * This module provides the main orchestrator for the messaging system using the singleton pattern.
 * يوفر هذا الوحدة المنسق الرئيسي لنظام الرسائل باستخدام نمط الـ singleton.
 */

import { ConversationOperations, MessageOperations, TypingOperations, SubscriptionOperations } from './advanced-messaging-operations';
import {
  Message,
  Conversation,
  MessageAttachment,
  TypingCallback,
  MessagesCallback,
  ConversationsCallback,
  MessageCallback,
} from './advanced-messaging-types';

/**
 * Advanced Messaging Service Class
 * فئة خدمة الرسائل المتقدمة
 */
class AdvancedMessagingService {
  private static instance: AdvancedMessagingService;

  private constructor() {}

  /**
   * Get singleton instance
   * الحصول على مثيل singleton
   */
  static getInstance(): AdvancedMessagingService {
    if (!AdvancedMessagingService.instance) {
      AdvancedMessagingService.instance = new AdvancedMessagingService();
    }
    return AdvancedMessagingService.instance;
  }

  // ==================== CONVERSATION METHODS ====================

  /**
   * Create new conversation
   * إنشاء محادثة جديدة
   */
  async createConversation(
    participants: string[],
    initialData?: Partial<Conversation>
  ): Promise<string> {
    return ConversationOperations.createConversation(participants, initialData);
  }

  /**
   * Find existing conversation between two users
   * البحث عن محادثة موجودة
   */
  async findConversation(userId: string, otherUserId: string, carId?: string): Promise<string | null> {
    return ConversationOperations.findConversation(userId, otherUserId, carId);
  }

  /**
   * Get user conversations
   * الحصول على محادثات المستخدم
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return ConversationOperations.getUserConversations(userId);
  }

  // ==================== MESSAGING METHODS ====================

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
    return MessageOperations.sendMessage(conversationId, senderId, receiverId, text);
  }

  /**
   * Send system message
   * إرسال رسالة نظام
   */
  async sendSystemMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string,
    metadata?: any
  ): Promise<string> {
    return MessageOperations.sendSystemMessage(conversationId, senderId, receiverId, text, metadata);
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
    return MessageOperations.sendMessageWithAttachments(conversationId, senderId, receiverId, text, files);
  }

  /**
   * Mark messages as read
   * تحديد الرسائل كمقروءة
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    return MessageOperations.markAsRead(conversationId, userId);
  }

  /**
   * Mark messages as read (alternative implementation)
   * تحديد الرسائل كمقروءة (تنفيذ بديل)
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    return MessageOperations.markMessagesAsRead(conversationId, userId);
  }

  /**
   * Get conversation messages
   * الحصول على رسائل المحادثة
   */
  async getConversation(
    userId: string,
    otherUserId: string,
    carId?: string
  ): Promise<Message[]> {
    return MessageOperations.getConversation(userId, otherUserId, carId);
  }

  // ==================== TYPING INDICATORS ====================

  /**
   * Set user typing status
   * تعيين حالة الكتابة
   */
  async setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    return TypingOperations.setTyping(conversationId, userId, isTyping);
  }

  /**
   * Subscribe to typing indicators
   * الاشتراك في مؤشرات الكتابة
   */
  subscribeToTyping(
    conversationId: string,
    callback: TypingCallback
  ): () => void {
    return TypingOperations.subscribeToTyping(conversationId, callback);
  }

  // ==================== SUBSCRIPTION METHODS ====================

  /**
   * Subscribe to messages
   * الاشتراك في الرسائل
   */
  subscribeToMessages(
    conversationId: string,
    callback: MessagesCallback
  ): () => void {
    return SubscriptionOperations.subscribeToMessages(conversationId, callback);
  }

  /**
   * Subscribe to user conversations
   * الاشتراك في محادثات المستخدم
   */
  subscribeToUserConversations(
    userId: string | null | undefined,
    callback: ConversationsCallback
  ): () => void {
    return SubscriptionOperations.subscribeToUserConversations(userId, callback);
  }

  /**
   * Subscribe to conversation messages
   * الاشتراك في رسائل المحادثة
   */
  subscribeToConversation(
    conversationId: string,
    userId: string,
    otherUserId: string,
    callback: MessageCallback
  ): () => void {
    return SubscriptionOperations.subscribeToConversation(conversationId, userId, otherUserId, callback);
  }

  // ==================== ACTION MESSAGES (NEW) ====================
  
  /**
   * Send offer message (new type)
   * إرسال رسالة عرض سعر
   */
  async sendOfferMessage(
    conversationId: string,
    senderId: string,
    offerData: {
      carId: string;
      amount: number;
      currency?: string;
      expiresAt?: Date;
      message?: string;
      isCounter?: boolean;
    }
  ): Promise<string> {
    const receiverId = ''; // Get from conversation
    return MessageOperations.sendSystemMessage(
      conversationId,
      senderId,
      receiverId,
      offerData.message || `عرض سعر: ${offerData.amount} ${offerData.currency || 'EUR'}`,
      {
        type: 'offer',
        offerData,
        actionRequired: true
      }
    );
  }

  /**
   * Update offer status (accept/reject/counter)
   * تحديث حالة العرض
   */
  async updateOfferStatus(
    conversationId: string,
    messageId: string,
    status: 'accepted' | 'rejected' | 'countered'
  ): Promise<void> {
    // Implementation: Update message metadata
    const { updateDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../../firebase/firebase-config');
    
    await updateDoc(doc(db, `conversations/${conversationId}/messages`, messageId), {
      'metadata.offerStatus': status,
      updatedAt: new Date()
    });
  }

  /**
   * Send appointment message
   * إرسال رسالة موعد معاينة
   */
  async sendAppointmentMessage(
    conversationId: string,
    senderId: string,
    appointmentData: {
      carId: string;
      dateTime: Date;
      location?: string;
      notes?: string;
    }
  ): Promise<string> {
    const receiverId = '';
    return MessageOperations.sendSystemMessage(
      conversationId,
      senderId,
      receiverId,
      `طلب موعد معاينة: ${appointmentData.dateTime.toLocaleString('bg-BG')}`,
      {
        type: 'appointment',
        appointmentData,
        actionRequired: true
      }
    );
  }

  /**
   * Send location message
   * إرسال رسالة موقع
   */
  async sendLocationMessage(
    conversationId: string,
    senderId: string,
    location: {
      latitude: number;
      longitude: number;
      address: string;
    }
  ): Promise<string> {
    const receiverId = '';
    return MessageOperations.sendSystemMessage(
      conversationId,
      senderId,
      receiverId,
      `مشاركة الموقع: ${location.address}`,
      {
        type: 'location',
        locationData: location,
        actionRequired: false
      }
    );
  }

  /**
   * Send inspection request message
   * إرسال رسالة طلب فحص
   */
  async sendInspectionRequest(
    conversationId: string,
    senderId: string,
    inspectionData: {
      carId: string;
      inspectorName?: string;
      preferredDate?: Date;
      notes?: string;
    }
  ): Promise<string> {
    const receiverId = '';
    return MessageOperations.sendSystemMessage(
      conversationId,
      senderId,
      receiverId,
      `طلب فحص فني للسيارة`,
      {
        type: 'inspection',
        inspectionData,
        actionRequired: true
      }
    );
  }
}

// Export singleton instance
export const advancedMessagingService = AdvancedMessagingService.getInstance();

// Export aliases for backward compatibility
export const messagingService = advancedMessagingService;
