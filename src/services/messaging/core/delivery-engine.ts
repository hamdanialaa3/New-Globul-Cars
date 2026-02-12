import { logger } from '@/services/logger-service';

/**
 * Message Delivery Status Lifecycle
 */
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * DELIVERY ENGINE (CORE SERVICE)
 * -------------------------------
 * محرك التوصيل - يدير دورة حياة الرسالة بدقة
 * 
 * المسؤوليات:
 * - تتبع حالة التوصيل (✓ واحد، ✓✓ رمادية، ✓✓ زرقاء)
 * - مزامنة الحالات بين Realtime DB و Firestore
 * - إدارة قائمة الانتظار للرسائل الفاشلة
 * - إعادة المحاولة التلقائية
 * 
 * @architect Senior System Architect
 * @compliance PROJECT_CONSTITUTION.md
 * @date December 29, 2025
 */
class DeliveryEngine {
  private static instance: DeliveryEngine;
  private retryQueue: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds

  private constructor() {
    logger.info('[DeliveryEngine] Initialized');
  }

  static getInstance(): DeliveryEngine {
    if (!this.instance) {
      this.instance = new DeliveryEngine();
    }
    return this.instance;
  }

  /**
   * UPDATE MESSAGE STATUS (RTDB)
   * تحديث حالة الرسالة في الوقت الحقيقي
   */
  async updateStatus(
    channelId: string,
    messageId: string,
    status: DeliveryStatus
  ): Promise<void> {
    try {
      logger.info('[DeliveryEngine] Updating status (RTDB)', {
        messageId,
        status
      });

      const { getDatabase, ref, update } = await import('firebase/database');
      const db = getDatabase();

      const updates: any = {
        [`messages/${channelId}/${messageId}/status`]: status,
        [`messages/${channelId}/${messageId}/updatedAt`]: Date.now()
      };

      if (status === 'delivered') updates[`messages/${channelId}/${messageId}/deliveredAt`] = Date.now();
      if (status === 'read') {
        updates[`messages/${channelId}/${messageId}/readAt`] = Date.now();
        updates[`messages/${channelId}/${messageId}/read`] = true;
      }

      await update(ref(db), updates);

      if (status === 'delivered' || status === 'read') {
        this.retryQueue.delete(messageId);
      }

      logger.info('[DeliveryEngine] Status updated successfully');
    } catch (error) {
      logger.error('[DeliveryEngine] Failed to update status', error as Error);
      if (status !== 'failed') {
        this.scheduleRetry(channelId, messageId, status);
      }
    }
  }

  /**
   * MARK CONVERSATION AS READ
   */
  async markConversationAsRead(
    channelId: string,
    userId: string | number // Firebase UID or Numeric ID depending on context
  ): Promise<void> {
    try {
      const { realtimeMessagingService } = await import('@/services/messaging/realtime/realtime-messaging.service');
      await realtimeMessagingService.markAsRead(channelId, userId);
      logger.info('[DeliveryEngine] Conversation marked as read');
    } catch (error) {
      logger.error('[DeliveryEngine] Failed to mark as read', error as Error);
    }
  }


  /**
   * MARK PENDING MESSAGES AS DELIVERED
   * No longer needed as separate Firestore sync - Realtime rules/presence handle this better
   */
  async markPendingMessagesAsDelivered(userId: string): Promise<void> {
    // Phase 3 uses Realtime DB presence and connection events to handle delivery
    logger.info('[DeliveryEngine] markPendingMessagesAsDelivered: Handled by RTDB connection logic');
  }


  /**
   * SCHEDULE RETRY
   * جدولة إعادة محاولة لرسالة فاشلة
   * @private
   */
  private scheduleRetry(
    conversationId: string,
    messageId: string,
    status: DeliveryStatus
  ): void {
    const retries = this.retryQueue.get(messageId) || 0;

    if (retries >= this.MAX_RETRIES) {
      logger.warn('[DeliveryEngine] Max retries reached', {
        messageId,
        retries
      });

      // Mark as permanently failed
      this.updateStatus(conversationId, messageId, 'failed').catch(() => {
        // Silent fail
      });

      this.retryQueue.delete(messageId);
      return;
    }

    this.retryQueue.set(messageId, retries + 1);

    logger.info('[DeliveryEngine] Scheduling retry', {
      messageId,
      attempt: retries + 1,
      maxRetries: this.MAX_RETRIES
    });

    setTimeout(() => {
      this.updateStatus(conversationId, messageId, status).catch(() => {
        // Will retry again if still fails
      });
    }, this.RETRY_DELAY * (retries + 1)); // Exponential backoff
  }

  /**
   * GET DELIVERY STATS
   * احصائيات التوصيل
   */
  getDeliveryStats(): {
    pendingRetries: number;
    retryQueue: Array<{ messageId: string; attempts: number }>;
  } {
    const retryQueue = Array.from(this.retryQueue.entries()).map(([messageId, attempts]) => ({
      messageId,
      attempts
    }));

    return {
      pendingRetries: this.retryQueue.size,
      retryQueue
    };
  }

  /**
   * CLEAR RETRY QUEUE
   * مسح قائمة إعادة المحاولة (للاختبار)
   */
  clearRetryQueue(): void {
    logger.info('[DeliveryEngine] Clearing retry queue', {
      size: this.retryQueue.size
    });

    this.retryQueue.clear();
  }
}

export const deliveryEngine = DeliveryEngine.getInstance();
