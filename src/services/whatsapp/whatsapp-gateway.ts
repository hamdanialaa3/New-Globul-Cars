import { whatsappBusinessService } from './whatsapp-business.service';
import { logger } from '../logger-service';

/**
 * WhatsApp Gateway
 * Lightweight helper to send lead/contact messages via WhatsApp Business API.
 * Keeps UI call sites minimal and reusable.
 */
class WhatsAppGateway {
  private static instance: WhatsAppGateway;

  static getInstance(): WhatsAppGateway {
    if (!WhatsAppGateway.instance) {
      WhatsAppGateway.instance = new WhatsAppGateway();
    }
    return WhatsAppGateway.instance;
  }

  async sendLeadMessage(params: {
    to: string;
    buyerName: string;
    carTitle: string;
    message?: string;
  }): Promise<boolean> {
    const body = [
      `Здравейте, ${params.buyerName} се интересува от: ${params.carTitle}.`,
      params.message ? `Съобщение: ${params.message}` : null,
      'Изпратено от Koli One'
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const res = await whatsappBusinessService.sendTextMessage({
        to: params.to,
        text: body,
        previewUrl: false
      });
      return !!res;
    } catch (error) {
      logger.warn('[WhatsAppGateway] Failed to send lead message', { error });
      return false;
    }
  }
}

export const whatsappGateway = WhatsAppGateway.getInstance();
export default whatsappGateway;
