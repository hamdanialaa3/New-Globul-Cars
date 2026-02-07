/**
 * Google Ads Integration Service
 * خدمة تكامل Google Ads
 * 
 * Handles:
 * - Conversion tracking
 * - Enhanced conversions
 * - Audience building
 * - Remarketing
 */

import { logger } from '../logger-service';

export interface GoogleAdsConfig {
  conversionId?: string; // AW-XXXXXXXXX format
  customerId?: string; // 425-581-1541
  accountName?: string; // Glo Bul G AD
}

class GoogleAdsIntegrationService {
  private static instance: GoogleAdsIntegrationService;
  
  private readonly config: GoogleAdsConfig = {
    conversionId: import.meta.env.VITE_GOOGLE_ADS_CONVERSION_ID,
    customerId: import.meta.env.VITE_GOOGLE_ADS_CUSTOMER_ID || '425-581-1541',
    accountName: import.meta.env.VITE_GOOGLE_ADS_ACCOUNT_NAME || 'Glo Bul G AD'
  };

  private constructor() {}

  public static getInstance(): GoogleAdsIntegrationService {
    if (!GoogleAdsIntegrationService.instance) {
      GoogleAdsIntegrationService.instance = new GoogleAdsIntegrationService();
    }
    return GoogleAdsIntegrationService.instance;
  }

  /**
   * Track conversion event
   * تتبع حدث التحويل
   */
  public trackConversion(
    conversionLabel: string,
    value?: number,
    currency: string = 'EUR',
    transactionId?: string
  ): void {
    try {
      if (typeof window === 'undefined' || !(window as any).gtag) {
        logger.warn('Google Ads: gtag not available');
        return;
      }

      (window as any).gtag('event', 'conversion', {
        'send_to': conversionLabel,
        'value': value,
        'currency': currency,
        'transaction_id': transactionId
      });

      logger.info('Google Ads conversion tracked', {
        conversionLabel,
        value,
        currency,
        transactionId
      });
    } catch (error) {
      logger.error('Failed to track Google Ads conversion', error as Error);
    }
  }

  /**
   * Track lead generation (contact seller)
   * تتبع توليد العملاء المحتملين (اتصال بالبائع)
   */
  public trackLead(
    carId: string,
    method: 'phone' | 'whatsapp' | 'message',
    value?: number
  ): void {
    try {
      if (typeof window === 'undefined' || !(window as any).gtag) {
        return;
      }

      // Track as conversion
      (window as any).gtag('event', 'generate_lead', {
        'event_category': 'engagement',
        'event_label': method,
        'value': value || 1,
        'currency': 'EUR',
        'car_id': carId
      });

      logger.debug('Google Ads lead tracked', { carId, method, value });
    } catch (error) {
      logger.error('Failed to track Google Ads lead', error as Error);
    }
  }

  /**
   * Track purchase/booking (if applicable)
   * تتبع الشراء/الحجز (إن وجد)
   */
  public trackPurchase(
    transactionId: string,
    value: number,
    currency: string = 'EUR',
    items?: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity?: number;
    }>
  ): void {
    try {
      if (typeof window === 'undefined' || !(window as any).gtag) {
        return;
      }

      (window as any).gtag('event', 'purchase', {
        'transaction_id': transactionId,
        'value': value,
        'currency': currency,
        'items': items
      });

      logger.info('Google Ads purchase tracked', {
        transactionId,
        value,
        currency
      });
    } catch (error) {
      logger.error('Failed to track Google Ads purchase', error as Error);
    }
  }

  /**
   * Get Google Ads configuration
   */
  public getConfig(): GoogleAdsConfig {
    return { ...this.config };
  }

  /**
   * Check if Google Ads is configured
   */
  public isConfigured(): boolean {
    return !!(this.config.conversionId || this.config.customerId);
  }
}

export const googleAdsService = GoogleAdsIntegrationService.getInstance();
export default googleAdsService;

