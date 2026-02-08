/**
 * Bulgarian Payment Gateways Integration
 * Supports: ePay.bg and EasyPay
 * Location: Bulgaria
 * Currency: EUR
 * 
 * File: src/services/payment/bulgarian-payment.service.ts
 * Created: February 8, 2026
 */

import { serviceLogger } from '../logger-service';

export type BulgarianPaymentProvider = 'epay' | 'easypay';

export interface PaymentConfig {
  provider: BulgarianPaymentProvider;
  merchantId: string;
  secretKey: string;
  testMode: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: 'EUR';
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface PaymentNotification {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'success' | 'fail' | 'pending';
  timestamp: Date;
  signature: string;
}

class BulgarianPaymentService {
  private static instance: BulgarianPaymentService;
  private config: Map<BulgarianPaymentProvider, PaymentConfig> = new Map();

  private constructor() {
    this.initializeConfig();
  }

  static getInstance(): BulgarianPaymentService {
    if (!BulgarianPaymentService.instance) {
      BulgarianPaymentService.instance = new BulgarianPaymentService();
    }
    return BulgarianPaymentService.instance;
  }

  private initializeConfig(): void {
    const epayConfig: PaymentConfig = {
      provider: 'epay',
      merchantId: process.env.VITE_EPAY_MERCHANT_ID || '',
      secretKey: process.env.VITE_EPAY_SECRET_KEY || '',
      testMode: process.env.NODE_ENV !== 'production'
    };

    const easypayConfig: PaymentConfig = {
      provider: 'easypay',
      merchantId: process.env.VITE_EASYPAY_MERCHANT_ID || '',
      secretKey: process.env.VITE_EASYPAY_SECRET_KEY || '',
      testMode: process.env.NODE_ENV !== 'production'
    };

    this.config.set('epay', epayConfig);
    this.config.set('easypay', easypayConfig);
  }

  async createPayment(
    provider: BulgarianPaymentProvider,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const config = this.config.get(provider);
      if (!config) {
        throw new Error(`Provider ${provider} not configured`);
      }

      if (provider === 'epay') {
        return await this.createEpayPayment(config, request);
      } else {
        return await this.createEasypayPayment(config, request);
      }
    } catch (error) {
      serviceLogger.error('Payment creation failed', error as Error, { provider, request });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createEpayPayment(
    config: PaymentConfig,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const baseUrl = config.testMode
      ? 'https://demo.epay.bg'
      : 'https://www.epay.bg';

    const params = new URLSearchParams({
      MIN: config.merchantId,
      INVOICE: request.orderId,
      AMOUNT: request.amount.toFixed(2),
      CURRENCY: request.currency,
      DESCR: request.description,
      EMAIL: request.customerEmail,
      URL_OK: request.successUrl,
      URL_CANCEL: request.cancelUrl,
      URL_NOTIFY: request.notifyUrl
    });

    const checksum = this.generateEpayChecksum(params.toString(), config.secretKey);
    params.append('CHECKSUM', checksum);

    const paymentUrl = `${baseUrl}/?${params.toString()}`;

    serviceLogger.info('ePay payment created', { orderId: request.orderId, amount: request.amount });

    return {
      success: true,
      paymentUrl,
      transactionId: request.orderId
    };
  }

  private async createEasypayPayment(
    config: PaymentConfig,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const baseUrl = config.testMode
      ? 'https://demo.easypay.bg/checkout'
      : 'https://www.easypay.bg/checkout';

    const payload = {
      merchant: config.merchantId,
      order_id: request.orderId,
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      email: request.customerEmail,
      name: request.customerName,
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      notify_url: request.notifyUrl,
      signature: this.generateEasypaySignature(request, config.secretKey)
    };

    const response = await fetch(`${baseUrl}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.merchantId}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`EasyPay API error: ${response.statusText}`);
    }

    const data = await response.json();

    serviceLogger.info('EasyPay payment created', { orderId: request.orderId, amount: request.amount });

    return {
      success: true,
      paymentUrl: data.checkout_url,
      transactionId: data.transaction_id
    };
  }

  verifyNotification(
    provider: BulgarianPaymentProvider,
    notification: PaymentNotification
  ): boolean {
    try {
      const config = this.config.get(provider);
      if (!config) return false;

      if (provider === 'epay') {
        return this.verifyEpayNotification(notification, config.secretKey);
      } else {
        return this.verifyEasypayNotification(notification, config.secretKey);
      }
    } catch (error) {
      serviceLogger.error('Notification verification failed', error as Error, { provider });
      return false;
    }
  }

  private generateEpayChecksum(data: string, secretKey: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha1', secretKey).update(data).digest('hex');
  }

  private generateEasypaySignature(request: PaymentRequest, secretKey: string): string {
    const crypto = require('crypto');
    const data = `${request.orderId}${request.amount}${request.currency}${secretKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private verifyEpayNotification(notification: PaymentNotification, secretKey: string): boolean {
    const data = `${notification.orderId}${notification.amount}${notification.status}`;
    const expectedSignature = this.generateEpayChecksum(data, secretKey);
    return notification.signature === expectedSignature;
  }

  private verifyEasypayNotification(notification: PaymentNotification, secretKey: string): boolean {
    const data = `${notification.transactionId}${notification.orderId}${notification.amount}`;
    const crypto = require('crypto');
    const expectedSignature = crypto.createHash('sha256').update(data + secretKey).digest('hex');
    return notification.signature === expectedSignature;
  }
}

export const bulgarianPaymentService = BulgarianPaymentService.getInstance();
