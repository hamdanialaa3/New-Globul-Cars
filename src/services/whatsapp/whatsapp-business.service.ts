// WhatsApp Business Cloud API Service
// خدمة واتساب للأعمال - أحدث تقنية من Meta 2025
// Phone: +359 879 839 671 (Bulgaria)

import axios from 'axios';

import { logger } from '../logger-service';

interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  apiVersion: string;
}

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
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

/**
 * WhatsApp Business Cloud API Service
 * 
 * Features:
 * - Send text messages
 * - Send images with captions
 * - Send interactive buttons
 * - Send pre-approved templates
 * - Process incoming webhooks
 * 
 * Latest API: v18.0 (2025)
 */
class WhatsAppBusinessService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      phoneNumberId: process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      accessToken: process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN || '',
      apiVersion: process.env.REACT_APP_WHATSAPP_API_VERSION || 'v18.0'
    };

    this.baseUrl = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}`;

    if (!this.config.phoneNumberId || !this.config.accessToken) {
      logger.warn('WhatsApp configuration missing', {
        hasPhoneNumberId: !!this.config.phoneNumberId,
        hasAccessToken: !!this.config.accessToken
      } as Record<string, unknown>);
    }
  }

  /**
   * Send simple text message
   * إرسال رسالة نصية بسيطة
   */
  async sendTextMessage(params: WhatsAppTextMessage): Promise<WhatsAppMessageResponse | null> {
    try {
      const response = await axios.post<WhatsAppMessageResponse>(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.to,
          type: 'text',
          text: {
            preview_url: params.previewUrl || false,
            body: params.text
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('✅ WhatsApp text message sent', {
        messageId: response.data.messages[0].id,
        to: params.to
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      logger.error('❌ Failed to send WhatsApp text message', error as Error, {
        to: params.to,
        errorMessage: err.response?.data?.error?.message || err.message || 'Unknown error'
      });

      return null;
    }
  }

  /**
   * Send image with caption
   * إرسال صورة مع نص
   */
  async sendImageMessage(params: WhatsAppImageMessage): Promise<WhatsAppMessageResponse | null> {
    try {
      const response = await axios.post<WhatsAppMessageResponse>(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.to,
          type: 'image',
          image: {
            link: params.imageUrl,
            caption: params.caption || ''
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('✅ WhatsApp image message sent', {
        messageId: response.data.messages[0].id,
        to: params.to
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      logger.error('❌ Failed to send WhatsApp image message', error as Error, {
        to: params.to,
        errorMessage: err.response?.data?.error?.message || err.message || 'Unknown error'
      });

      return null;
    }
  }

  /**
   * Send interactive message with buttons
   * إرسال رسالة تفاعلية مع أزرار
   */
  async sendButtonMessage(params: WhatsAppButtonMessage): Promise<WhatsAppMessageResponse | null> {
    try {
      const response = await axios.post<WhatsAppMessageResponse>(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.to,
          type: 'interactive',
          interactive: {
            type: 'button',
            header: params.header ? {
              type: 'text',
              text: params.header
            } : undefined,
            body: {
              text: params.bodyText
            },
            footer: params.footer ? {
              text: params.footer
            } : undefined,
            action: {
              buttons: params.buttons.map(btn => ({
                type: 'reply',
                reply: {
                  id: btn.id,
                  title: btn.title.substring(0, 20) // Max 20 chars
                }
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('✅ WhatsApp button message sent', {
        messageId: response.data.messages[0].id,
        to: params.to,
        buttonCount: params.buttons.length
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      logger.error('❌ Failed to send WhatsApp button message', error as Error, {
        to: params.to,
        errorMessage: err.response?.data?.error?.message || err.message || 'Unknown error'
      });

      return null;
    }
  }

  /**
   * Send pre-approved template message
   * إرسال رسالة قالب مُعتمد
   */
  async sendTemplateMessage(params: WhatsAppTemplateMessage): Promise<WhatsAppMessageResponse | null> {
    try {
      const response = await axios.post<WhatsAppMessageResponse>(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: params.to,
          type: 'template',
          template: {
            name: params.templateName,
            language: {
              code: params.language
            },
            components: params.components || []
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('✅ WhatsApp template message sent', {
        messageId: response.data.messages[0].id,
        to: params.to,
        template: params.templateName
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      logger.error('❌ Failed to send WhatsApp template message', error as Error, {
        to: params.to,
        template: params.templateName,
        errorMessage: err.response?.data?.error?.message || err.message || 'Unknown error'
      });

      return null;
    }
  }

  /**
   * Send car listing to WhatsApp
   * إرسال إعلان سيارة عبر واتساب
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

      // Send image with caption
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

      if (!imageResult) {
        return false;
      }

      // Send interactive buttons
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
   * Test WhatsApp API connection
   * اختبار الاتصال بـ WhatsApp API
   */
  async testConnection(): Promise<boolean> {
    try {
      const testUrl = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}`;
      
      const response = await axios.get(testUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      logger.info('✅ WhatsApp API connection successful', {
        phoneNumberId: response.data.id,
        displayPhoneNumber: response.data.display_phone_number,
        verifiedName: response.data.verified_name
      });

      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      logger.error('❌ WhatsApp API connection failed', error as Error, {
        errorMessage: err.response?.data?.error?.message || err.message || 'Unknown error'
      });

      return false;
    }
  }

  /**
   * Format Bulgarian phone number for WhatsApp
   * تنسيق رقم هاتف بلغاري لواتساب
   */
  formatBulgarianPhone(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 00359, convert to +359
    if (cleaned.startsWith('00359')) {
      cleaned = cleaned.substring(2);
    }

    // If starts with 0, replace with 359
    if (cleaned.startsWith('0')) {
      cleaned = '359' + cleaned.substring(1);
    }

    // If doesn't start with 359, add it
    if (!cleaned.startsWith('359')) {
      cleaned = '359' + cleaned;
    }

    return cleaned;
  }
}

// Singleton instance
export const whatsappBusinessService = new WhatsAppBusinessService();
