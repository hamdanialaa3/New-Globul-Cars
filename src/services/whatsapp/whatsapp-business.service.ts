// WhatsApp Business Cloud API Service
// 🔒 SECURED: Access token and API calls routed through Cloud Functions
// Client-side only handles formatting and triggering — NO direct API calls
// Phone: +359 879 839 671 (Bulgaria)

import { serviceLogger as logger } from '../logger-service';

interface WhatsAppTextMessage {
  to: string;
  text: string;
  previewUrl?: boolean;
}

interface WhatsAppImageMessage {
  to: string;
  imageUrl: string;
  caption?: string;
}

interface WhatsAppButtonMessage {
  to: string;
  bodyText: string;
  buttons: Array<{
    id: string;
    title: string;
  }>;
  header?: string;
  footer?: string;
}

interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  language: string;
  components?: any[];
}

interface WhatsAppMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * WhatsApp Business Cloud API Service (Client-Side Proxy)
 * 
 * 🔒 SECURITY FIX: All API calls are proxied through Cloud Functions.
 * The access token is stored in Cloud Functions environment/Secret Manager.
 * This client-side service NEVER holds or transmits the access token.
 * 
 * Features:
 * - Send text messages (via Cloud Function)
 * - Send images with captions (via Cloud Function)
 * - Send interactive buttons (via Cloud Function)
 * - Send pre-approved templates (via Cloud Function)
 * 
 * Latest API: v18.0 (2025)
 */
class WhatsAppBusinessService {
  private readonly cloudFunctionBaseUrl: string;

  constructor() {
    this.cloudFunctionBaseUrl = '/api/whatsapp';
  }

  /**
   * Send simple text message via Cloud Function
   */
  async sendTextMessage(params: WhatsAppTextMessage): Promise<WhatsAppMessageResponse> {
    try {
      const response = await fetch(`${this.cloudFunctionBaseUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text',
          to: params.to,
          text: params.text,
          previewUrl: params.previewUrl || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('✅ WhatsApp text message sent', { to: params.to, messageId: data.messageId });
      return data;
    } catch (error: unknown) {
      logger.error('❌ Failed to send WhatsApp text message', error as Error, { to: params.to });
      return { success: false, error: (error as Error).message || 'Unknown error' };
    }
  }

  /**
   * Send image with caption via Cloud Function
   */
  async sendImageMessage(params: WhatsAppImageMessage): Promise<WhatsAppMessageResponse> {
    try {
      const response = await fetch(`${this.cloudFunctionBaseUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          to: params.to,
          imageUrl: params.imageUrl,
          caption: params.caption || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('✅ WhatsApp image message sent', { to: params.to, messageId: data.messageId });
      return data;
    } catch (error: unknown) {
      logger.error('❌ Failed to send WhatsApp image message', error as Error, { to: params.to });
      return { success: false, error: (error as Error).message || 'Unknown error' };
    }
  }

  /**
   * Send interactive message with buttons via Cloud Function
   */
  async sendButtonMessage(params: WhatsAppButtonMessage): Promise<WhatsAppMessageResponse> {
    try {
      const response = await fetch(`${this.cloudFunctionBaseUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'button',
          to: params.to,
          bodyText: params.bodyText,
          buttons: params.buttons,
          header: params.header,
          footer: params.footer,
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('✅ WhatsApp button message sent', { to: params.to, messageId: data.messageId });
      return data;
    } catch (error: unknown) {
      logger.error('❌ Failed to send WhatsApp button message', error as Error, { to: params.to });
      return { success: false, error: (error as Error).message || 'Unknown error' };
    }
  }

  /**
   * Send pre-approved template message via Cloud Function
   */
  async sendTemplateMessage(params: WhatsAppTemplateMessage): Promise<WhatsAppMessageResponse> {
    try {
      const response = await fetch(`${this.cloudFunctionBaseUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'template',
          to: params.to,
          templateName: params.templateName,
          language: params.language,
          components: params.components || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('✅ WhatsApp template message sent', {
        to: params.to,
        template: params.templateName,
        messageId: data.messageId,
      });
      return data;
    } catch (error: unknown) {
      logger.error('❌ Failed to send WhatsApp template message', error as Error, {
        to: params.to,
        template: params.templateName,
      });
      return { success: false, error: (error as Error).message || 'Unknown error' };
    }
  }

  /**
   * Send car listing to WhatsApp via Cloud Function
   */
  async sendCarListing(to: string, car: {
    make: string;
    model: string;
    year: number;
    price: number;
    images: string[];
    city: string;
    mileage?: number;
    fuelType?: string;
    sellerNumericId: number;
    carNumericId: number;
  }): Promise<boolean> {
    try {
      const carUrl = `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`;

      const caption = `
🚗 ${car.make} ${car.model} ${car.year}
💰 €${car.price.toLocaleString('bg-BG')}
${car.mileage ? `📊 ${car.mileage.toLocaleString('bg-BG')} км` : ''}
${car.fuelType ? `⛽ ${car.fuelType}` : ''}
📍 ${car.city}, България

👉 Вижте пълните детайли:
${carUrl}
      `.trim();

      const imageResult = await this.sendImageMessage({
        to,
        imageUrl: car.images[0],
        caption
      });

      if (!imageResult.success) {
        return false;
      }

      await this.sendButtonMessage({
        to,
        bodyText: 'Какво искате да направите?',
        buttons: [
          {
            id: `view_car_${car.sellerNumericId}_${car.carNumericId}`,
            title: '👁️ Виж детайли'
          },
          {
            id: `contact_seller_${car.sellerNumericId}`,
            title: '📞 Свържи се'
          },
          {
            id: 'search_similar',
            title: '🔍 Подобни'
          }
        ],
        footer: 'Koli One'
      });

      return true;
    } catch (error) {
      logger.error('Failed to send car listing via WhatsApp', error as Error, {
        to,
        carId: `${car.sellerNumericId}/${car.carNumericId}`
      });

      return false;
    }
  }

  /**
   * Test WhatsApp API connection via Cloud Function
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.cloudFunctionBaseUrl}/test`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      const data = await response.json();
      logger.info('✅ WhatsApp API connection successful', data);
      return true;
    } catch (error: unknown) {
      logger.error('❌ WhatsApp API connection failed', error as Error);
      return false;
    }
  }

  /**
   * Format Bulgarian phone number for WhatsApp
   */
  formatBulgarianPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('00359')) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.startsWith('0')) {
      cleaned = '359' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('359')) {
      cleaned = '359' + cleaned;
    }
    return cleaned;
  }
}

// Singleton instance
export const whatsappBusinessService = new WhatsAppBusinessService();
