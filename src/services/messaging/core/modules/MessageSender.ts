import { logger } from '@/services/logger-service';
import { deliveryEngine } from '../delivery-engine';
import { advancedMessagingService } from '../../advanced-messaging-service';
import { sendMessage as sendRealtimeMessage } from '@/services/realtime-messaging-operations';
import { userService } from '../../../user/canonical-user.service';
import { messagingAnalytics } from '../../analytics/messaging-analytics.service';

/**
 * Message Sender Module
 * وحدة إرسال الرسائل
 * 
 * Handles core message sending logic
 */
export class MessageSender {
  /**
   * UNIFIED SEND MESSAGE
   * يرسل الرسالة عبر جميع الطبقات بطريقة ذرية
   * 
   * @param params - معلومات الرسالة
   * @returns messageId - معرف الرسالة الدائم
   */
  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type?: 'text' | 'offer' | 'action' | 'voice' | 'location' | 'test-drive';
    carId?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const { conversationId, senderId, receiverId, content, type = 'text', carId, metadata } = params;

    try {
      // 1. Validation
      if (!conversationId || !senderId || !receiverId) {
        throw new Error('[MessageSender] Missing required fields');
      }

      if (type === 'text' && !content.trim()) {
        throw new Error('[MessageSender] Text message cannot be empty');
      }

      // Import here to avoid circular deps
      const { sendMessage: sendRealtimeMessage } = await import('@/services/realtime-messaging-operations');
      const { advancedMessagingService } = await import('../../advanced-messaging-service');
      const { userService } = await import('../../../user/canonical-user.service');

      // 2. Create message object
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message = {
        id: messageId,
        conversationId,
        senderId,
        receiverId,
        content,
        type,
        carId,
        metadata: metadata || {},
        timestamp: new Date(),
        status: 'sent' as const,
        isRead: false
      };

      logger.info('[MessageSender] Sending message', {
        messageId: message.id,
        type: message.type,
        conversationId
      });

      // 3. Send to Realtime DB (instant delivery) - Non-blocking
      // Fetch user names in parallel for Realtime DB
      const [senderProfile, receiverProfile] = await Promise.all([
        userService.getUserProfile(senderId).catch(() => null),
        userService.getUserProfile(receiverId).catch(() => null)
      ]);

      const senderName = senderProfile?.displayName || senderProfile?.firstName || 'User';
      const receiverName = receiverProfile?.displayName || receiverProfile?.firstName || 'User';

      // Send to Realtime DB (fire and forget - don't block on failure)
      sendRealtimeMessage({
        conversationId,
        senderId,
        senderName,
        receiverId,
        receiverName,
        content,
        text: content,
        messageType: type === 'offer' ? 'offer' : 'text',
        type: type as any,
        status: 'sent',
        isRead: false,
        carId,
        attachments: metadata?.attachments
      }).catch(realtimeError => {
        logger.warn('[MessageSender] Realtime DB send failed', { 
          error: (realtimeError as Error).message 
        });
        // Continue with Firestore - Realtime DB is for speed, not critical
      });

      // 4. Persist to Firestore (durable storage) - Primary storage
      let firestoreMessageId: string;
      try {
        // Use advancedMessagingService for standard messages
        if (type === 'text' || !type) {
          firestoreMessageId = await advancedMessagingService.sendMessage(
            conversationId,
            senderId,
            receiverId,
            content
          );
        } else {
          // For non-text messages (offer, test-drive, etc.), use system message with metadata
          firestoreMessageId = await advancedMessagingService.sendSystemMessage(
            conversationId,
            senderId,
            receiverId,
            content,
            { ...metadata, type, carId }
          );
        }
      } catch (firestoreError) {
        logger.error('[MessageSender] Firestore persistence failed', firestoreError as Error);
        throw new Error(`Failed to persist message: ${(firestoreError as Error).message}`);
      }

      // 5. Update delivery status via DeliveryEngine (after successful save)
      await deliveryEngine.updateStatus(conversationId, firestoreMessageId, 'sent').catch(err => {
        logger.warn('[MessageSender] Delivery status update failed', { error: err.message });
        // Don't throw - message was saved, status update is secondary
      });

      // 6. Track analytics (async, fire and forget)
      this.trackMessageSent(conversationId, type).catch(err => 
        logger.warn('[MessageSender] Analytics failed', { error: err.message })
      );

      // 7. AI processing (async, fire and forget)
      this.processWithAI({ ...message, id: firestoreMessageId }).catch(err =>
        logger.warn('[MessageSender] AI processing failed', { error: err.message })
      );

      logger.info('[MessageSender] Message sent successfully', { 
        messageId: firestoreMessageId,
        conversationId
      });
      
      // Return Firestore ID as the canonical message ID
      return firestoreMessageId;

    } catch (error) {
      logger.error('[MessageSender] Failed to send message', error as Error, {
        conversationId,
        senderId
      });
      throw error;
    }
  }

  /**
   * PROCESS WITH AI
   * معالجة الرسالة بالـ AI (async)
   * @private
   */
  private async processWithAI(message: any): Promise<void> {
    try {
      // TODO: Integrate with ai-message-agent.ts
      // const needsResponse = await aiMessageAgent.shouldRespond(message);
      
      // if (needsResponse) {
      //   const suggestion = await aiMessageAgent.generateReply(message);
      //   await advancedMessagingService.storeSuggestion(
      //     message.conversationId,
      //     suggestion
      //   );
      // }
    } catch (error) {
      logger.warn('[MessageSender] AI processing skipped', {
        error: (error as Error).message
      });
    }
  }

  /**
   * TRACK MESSAGE SENT
   * تتبع الرسالة المرسلة
   * @private
   */
  private async trackMessageSent(conversationId: string, type: string): Promise<void> {
    try {
      await messagingAnalytics.trackMessageSent(conversationId, type);
    } catch (error) {
      logger.warn('[MessageSender] Analytics tracking failed', {
        error: (error as Error).message
      });
    }
  }
}

