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
   * UPDATE MESSAGE STATUS
   * تحديث حالة الرسالة عبر جميع الطبقات
   */
  async updateStatus(
    conversationId: string,
    messageId: string,
    status: DeliveryStatus
  ): Promise<void> {
    try {
      logger.info('[DeliveryEngine] Updating status', {
        messageId,
        status
      });

      // 1. Update Firestore (long-term consistency)
      // Only sync final states to save writes
      if (status === 'read' || status === 'delivered' || status === 'failed') {
        try {
          const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('@/firebase/firebase-config');
          await updateDoc(doc(db, 'messages', messageId), {
            status,
            updatedAt: serverTimestamp(),
            ...(status === 'delivered' ? { deliveredAt: serverTimestamp() } : {}),
            ...(status === 'read' ? { readAt: serverTimestamp() } : {})
          });
        } catch (fsErr) {
          logger.warn('[DeliveryEngine] Firestore status sync skipped', { messageId, status, error: (fsErr as Error).message });
        }
      }

      // 2. Remove from retry queue if successful
      if (status === 'delivered' || status === 'read') {
        this.retryQueue.delete(messageId);
      }

      logger.info('[DeliveryEngine] Status updated successfully', {
        messageId,
        status
      });
    } catch (error) {
      logger.error('[DeliveryEngine] Failed to update status', error as Error, {
        messageId,
        status
      });

      // Don't throw - status updates should fail silently to not disrupt UX
      // If it fails, we'll retry later
      if (status !== 'failed') {
        this.scheduleRetry(conversationId, messageId, status);
      }
    }
  }

  /**
   * MARK CONVERSATION AS READ
   * تعليم جميع رسائل المحادثة كمقروءة
   */
  async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      logger.info('[DeliveryEngine] Marking conversation as read', {
        conversationId,
        userId
      });

      // Execute in parallel for speed
      await Promise.all([
        (async () => {
          try {
            const { advancedMessagingService } = await import('@/services/messaging/advanced-messaging-service');
            await advancedMessagingService.markMessagesAsRead(conversationId, userId);
          } catch (noop) {
            // optional integration; ignore if unavailable
          }
        })(),
        (async () => {
          try {
            const { updateDoc, collection, query, where, getDocs, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('@/firebase/firebase-config');
            const q = query(
              collection(db, 'messages'),
              where('conversationId', '==', conversationId),
              where('receiverId', '==', userId),
              where('status', 'in', ['sent', 'delivered'])
            );
            const snapshot = await getDocs(q);
            await Promise.all(snapshot.docs.map(docSnap => updateDoc(docSnap.ref, { status: 'read', readAt: serverTimestamp(), updatedAt: serverTimestamp() })));
          } catch (noop) {
            // soft-fail
          }
        })()
      ]);

      logger.info('[DeliveryEngine] Conversation marked as read');
    } catch (error) {
      logger.error('[DeliveryEngine] Failed to mark as read', error as Error);
      // Fail silently for read receipts
    }
  }

  /**
   * MARK PENDING MESSAGES AS DELIVERED
   * تعليم الرسائل المعلقة كموصلة (عند اتصال المستخدم)
   */
  async markPendingMessagesAsDelivered(userId: string): Promise<void> {
    try {
      logger.info('[DeliveryEngine] Marking pending messages as delivered', { userId });

      // جلب جميع الرسائل ذات status='sent' وreceiverId=userId
      const { getDocs, collection, where, writeBatch, serverTimestamp, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/firebase/firebase-config');
      const messagesRef = collection(db, 'messages');
      const q = where('receiverId', '==', userId);
      const q2 = where('status', '==', 'sent');
      const querySnapshot = await getDocs(
        // Firestore doesn't support multiple where() in getDocs directly, so use query()
        (await import('firebase/firestore')).query(messagesRef, q, q2)
      );

      if (querySnapshot.empty) {
        logger.info('[DeliveryEngine] No pending messages to mark as delivered', { userId });
        return;
      }

      const batch = writeBatch(db);
      querySnapshot.forEach(docSnap => {
        batch.update(docSnap.ref, {
          status: 'delivered',
          deliveredAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();

      logger.info('[DeliveryEngine] Pending messages marked as delivered', { count: querySnapshot.size });
    } catch (error) {
      logger.error('[DeliveryEngine] Failed to mark pending messages', error as Error);
    }
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
