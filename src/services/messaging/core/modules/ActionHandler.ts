import { logger } from '@/services/logger-service';
import { MessageSender } from './MessageSender';
import { offerWorkflowService } from '@/services/messaging/actions/offer-workflow.service';

/**
 * Action Handler Module
 * وحدة معالجة الإجراءات التفاعلية
 * 
 * Handles interactive actions like offers and test drives
 */
export class ActionHandler {
  private messageSender: MessageSender;

  constructor(messageSender: MessageSender) {
    this.messageSender = messageSender;
  }

  /**
   * SEND OFFER
   * يرسل عرض سعر مع workflow كامل
   */
  async sendOffer(params: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    carId: string;
    offerAmount: number;
    currency?: string;
    message?: string;
  }): Promise<string> {
    const { conversationId, senderId, receiverId, carId, offerAmount, currency = 'EUR', message: offerMessage } = params;

    try {
      logger.info('[ActionHandler] Sending offer', {
        conversationId,
        offerAmount,
        currency
      });

      // ✅ Phase 2 Fix: Integrated with offer-workflow.service.ts
      const offer = await offerWorkflowService.createOffer({
        conversationId,
        senderId,
        receiverId,
        carId,
        offerAmount,
        currency,
        message: offerMessage,
        expiryDays: 7
      });

      // 2. Send as interactive message
      const messageId = await this.messageSender.sendMessage({
        conversationId,
        senderId,
        receiverId,
        content: offerMessage || `Offer: ${currency} ${offerAmount.toLocaleString()}`,
        type: 'offer',
        carId,
        metadata: {
          offerId: offer.id,
          amount: offerAmount,
          currency,
          status: 'pending'
        }
      });

      logger.info('[ActionHandler] Offer sent successfully', {
        offerId: offer.id,
        messageId
      });

      return offer.id;
    } catch (error) {
      logger.error('[ActionHandler] Failed to send offer', error as Error);
      throw error;
    }
  }

  /**
   * REQUEST TEST DRIVE
   * طلب تجربة قيادة
   * 
   * @param conversationId - معرف المحادثة
   * @param senderId - معرف المرسل
   * @param receiverId - معرف المستقبل
   * @param carId - معرف السيارة
   * @param date - تاريخ ووقت التجربة (timestamp)
   * @param locationType - نوع الموقع ('dealer_location' | 'client_location' | 'neutral_ground')
   * @param location - العنوان أو نقطة اللقاء (اختياري)
   * @param notes - ملاحظات إضافية (اختياري)
   * @returns requestId - معرف طلب التجربة
   */
  async requestTestDrive(
    conversationId: string,
    senderId: string,
    receiverId: string,
    carId: string,
    date: number,
    locationType: 'dealer_location' | 'client_location' | 'neutral_ground',
    location?: string,
    notes?: string
  ): Promise<string> {
    try {
      logger.info('[ActionHandler] Requesting test drive', {
        conversationId,
        carId,
        date: new Date(date).toISOString(),
        locationType
      });

      // Validate date is in the future
      if (date <= Date.now()) {
        throw new Error('[ActionHandler] Test drive date must be in the future');
      }

      // Create test drive request ID
      const requestId = `testdrive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare test drive data
      const testDriveData = {
        id: requestId,
        conversationId,
        senderId,
        receiverId,
        carId,
        date,
        locationType,
        location: location || '',
        status: 'pending' as const,
        notes: notes || '',
        createdAt: Date.now()
      };

      // Send as test-drive message
      const messageId = await this.messageSender.sendMessage({
        conversationId,
        senderId,
        receiverId,
        content: `Test Drive Request: ${new Date(date).toLocaleString('bg-BG')}`,
        type: 'test-drive',
        carId,
        metadata: {
          testDriveData,
          requestId
        }
      });

      logger.info('[ActionHandler] Test drive request sent successfully', {
        requestId,
        messageId
      });

      return requestId;
    } catch (error) {
      logger.error('[ActionHandler] Failed to request test drive', error as Error);
      throw error;
    }
  }
}

