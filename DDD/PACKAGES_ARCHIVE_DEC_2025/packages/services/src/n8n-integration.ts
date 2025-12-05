// src/services/n8n-integration.ts
// N8N Integration Service for Globul Cars

import { serviceLogger } from './logger-wrapper';

export class N8nIntegrationService {
  private static readonly N8N_BASE_URL = process.env.REACT_APP_N8N_URL || 'https://globul-cars-bg.app.n8n.cloud';
  private static readonly WEBHOOK_BASE = process.env.REACT_APP_N8N_WEBHOOK_BASE || `${this.N8N_BASE_URL}/webhook`;
  private static readonly N8N_ENABLED = process.env.REACT_APP_N8N_ENABLED === 'true';

  // Webhook endpoints
  private static readonly WEBHOOKS = {
    SELL_STARTED: `${this.WEBHOOK_BASE}/sell-started`,
    VEHICLE_TYPE_SELECTED: `${this.WEBHOOK_BASE}/vehicle-type-selected`,
    SELLER_TYPE_DETECTED: `${this.WEBHOOK_BASE}/seller-type-detected`,
    VEHICLE_DATA_ENTERED: `${this.WEBHOOK_BASE}/vehicle-data-entered`,
    IMAGES_UPLOADED: `${this.WEBHOOK_BASE}/images-uploaded`,
    PRICE_SET: `${this.WEBHOOK_BASE}/price-set`,
    CAR_PUBLISHED: `${this.WEBHOOK_BASE}/car-published`,
    USER_REGISTERED: `${this.WEBHOOK_BASE}/user-registered`,
    MESSAGE_SENT: `${this.WEBHOOK_BASE}/message-sent`,
    OFFER_SUBMITTED: `${this.WEBHOOK_BASE}/offer-submitted`
  };

  /**
   * Send webhook to n8n workflow
   */
  private static async sendWebhook(url: string, data: any): Promise<any> {
    // Skip if n8n is disabled
    if (!this.N8N_ENABLED) {
      serviceLogger.debug('N8N is disabled, skipping webhook', { url });
      return null;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'globul-cars-web'
        })
      });

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      // Silently ignore CORS errors in development (localhost)
      if (error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch')) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('N8N webhook blocked by CORS (expected in localhost)');
        }
        return null;
      }
      // Log other errors but don't break the main flow
      serviceLogger.error('N8N webhook error', error as Error, { url });
      return null;
    }
  }

  /**
   * Trigger when user starts selling process
   */
  static async onSellStarted(userId: string, userProfile: any) {
    return this.sendWebhook(this.WEBHOOKS.SELL_STARTED, {
      userId,
      userProfile,
      event: 'sell_started'
    });
  }

  /**
   * Trigger when vehicle type is selected
   */
  static async onVehicleTypeSelected(userId: string, vehicleType: string) {
    return this.sendWebhook(this.WEBHOOKS.VEHICLE_TYPE_SELECTED, {
      userId,
      vehicleType,
      event: 'vehicle_type_selected'
    });
  }

  /**
   * Trigger when seller type is detected/selected
   */
  static async onSellerTypeDetected(userId: string, sellerType: string, isAutoDetected: boolean) {
    return this.sendWebhook(this.WEBHOOKS.SELLER_TYPE_DETECTED, {
      userId,
      sellerType,
      isAutoDetected,
      event: 'seller_type_detected'
    });
  }

  /**
   * Trigger when vehicle data is entered
   */
  static async onVehicleDataEntered(userId: string, vehicleData: any) {
    return this.sendWebhook(this.WEBHOOKS.VEHICLE_DATA_ENTERED, {
      userId,
      vehicleData,
      event: 'vehicle_data_entered'
    });
  }

  /**
   * Trigger when images are uploaded
   */
  static async onImagesUploaded(userId: string, carId: string, imageCount: number) {
    return this.sendWebhook(this.WEBHOOKS.IMAGES_UPLOADED, {
      userId,
      carId,
      imageCount,
      event: 'images_uploaded'
    });
  }

  /**
   * Trigger when price is set
   */
  static async onPriceSet(userId: string, carId: string, price: number, currency: string) {
    return this.sendWebhook(this.WEBHOOKS.PRICE_SET, {
      userId,
      carId,
      price,
      currency,
      event: 'price_set'
    });
  }

  /**
   * Trigger when car is published
   */
  static async onCarPublished(userId: string, carId: string, carData: any) {
    return this.sendWebhook(this.WEBHOOKS.CAR_PUBLISHED, {
      userId,
      carId,
      carData,
      event: 'car_published'
    });
  }

  /**
   * Trigger when new user registers
   */
  static async onUserRegistered(userId: string, userData: any) {
    return this.sendWebhook(this.WEBHOOKS.USER_REGISTERED, {
      userId,
      userData,
      event: 'user_registered'
    });
  }

  /**
   * Trigger when message is sent
   */
  static async onMessageSent(senderId: string, recipientId: string, carId: string, messageType: string) {
    return this.sendWebhook(this.WEBHOOKS.MESSAGE_SENT, {
      senderId,
      recipientId,
      carId,
      messageType,
      event: 'message_sent'
    });
  }

  /**
   * Trigger when offer is submitted
   */
  static async onOfferSubmitted(buyerId: string, sellerId: string, carId: string, offerAmount: number) {
    return this.sendWebhook(this.WEBHOOKS.OFFER_SUBMITTED, {
      buyerId,
      sellerId,
      carId,
      offerAmount,
      event: 'offer_submitted'
    });
  }

  /**
   * Health check for n8n connection
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.N8N_BASE_URL}/healthz`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default N8nIntegrationService;