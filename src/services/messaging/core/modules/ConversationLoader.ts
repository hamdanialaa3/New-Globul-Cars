import { logger } from '@/services/logger-service';
import type { Message } from '../../advanced-messaging-types';

/**
 * Conversation Loader Module
 * وحدة تحميل المحادثات
 * 
 * Handles conversation loading logic
 */
export class ConversationLoader {
  /**
   * GET CONVERSATION
   * يجلب المحادثة من المصدر المناسب حسب الاستراتيجية
   * 
   * @param conversationId - معرف المحادثة
   * @param strategy - 'speed' للرسائل الأخيرة، 'history' للتاريخ الكامل
   */
  async getConversation(
    conversationId: string,
    strategy: 'speed' | 'history' = 'speed'
  ): Promise<Message[]> {
    try {
      logger.info('[ConversationLoader] Fetching conversation', {
        conversationId,
        strategy
      });

      // Import here to avoid circular deps
      const { getMessages: getRealtimeMessages } = await import('@/services/realtime-messaging-operations');
      const { advancedMessagingService } = await import('../../advanced-messaging-service');

      if (strategy === 'speed') {
        // Last 50 messages from Realtime DB (fast)
        const messages = await getRealtimeMessages(conversationId, 50);
        return Array.isArray(messages) ? messages : [];
      } else {
        // Full history from Firestore (complete)
        const messages = await advancedMessagingService.getMessages(conversationId);
        return Array.isArray(messages) ? messages : [];
      }
    } catch (error) {
      logger.error('[ConversationLoader] Failed to get conversation', error as Error, {
        conversationId
      });
      throw error;
    }
  }
}

