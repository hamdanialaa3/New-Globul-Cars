/**
 * Bulgarian Payment Gateways Integration
 * Supports: ePay.bg and EasyPay
 * Location: Bulgaria
 * Currency: EUR
 * 
 * 🔒 SECURITY FIX: Payment operations are now routed through Cloud Functions.
 * Secret keys are NEVER stored or accessed in client-side code.
 * The client only handles redirect URLs and payment status display.
 * 
 * File: src/services/payment/bulgarian-payment.service.ts
 * Created: February 8, 2026
 * Secured: February 21, 2026
 */

import { serviceLogger } from '../logger-service';

export type BulgarianPaymentProvider = 'epay' | 'easypay';

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

/**
 * Bulgarian Payment Service - Client-Side Proxy
 * 
 * 🔒 SECURITY: All sensitive payment operations (key management, signature
 * generation, payment verification) are handled by Cloud Functions.
 * This client-side service only:
 * 1. Sends payment requests to the Cloud Function
 * 2. Receives payment URLs for redirect
 * 3. Displays payment status
 */
class BulgarianPaymentService {
  private static instance: BulgarianPaymentService;
  private readonly cloudFunctionBaseUrl: string;

  private constructor() {
    // Cloud Function endpoint for payment operations
    this.cloudFunctionBaseUrl = '/api/payments';
  }

  static getInstance(): BulgarianPaymentService {
    if (!BulgarianPaymentService.instance) {
      BulgarianPaymentService.instance = new BulgarianPaymentService();
    }
    return BulgarianPaymentService.instance;
  }

  /**
   * Create a payment via Cloud Function
   * The Cloud Function handles secret keys, signature generation, etc.
   */
  async createPayment(
    provider: BulgarianPaymentProvider,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.cloudFunctionBaseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          ...request
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.statusText}`);
      }

      const data = await response.json();

      serviceLogger.info('Payment created via Cloud Function', {
        provider,
        orderId: request.orderId,
        amount: request.amount
      });

      return {
        success: data.success,
        paymentUrl: data.paymentUrl,
        transactionId: data.transactionId,
        error: data.error
      };
    } catch (error) {
      serviceLogger.error('Payment creation failed', error as Error, { provider, request });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check payment status via Cloud Function
   */
  async checkPaymentStatus(
    provider: BulgarianPaymentProvider,
    orderId: string
  ): Promise<{ status: string; paid: boolean }> {
    try {
      const response = await fetch(
        `${this.cloudFunctionBaseUrl}/status?provider=${provider}&orderId=${orderId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Payment status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      serviceLogger.error('Payment status check failed', error as Error, { provider, orderId });
      return { status: 'error', paid: false };
    }
  }
}

export const bulgarianPaymentService = BulgarianPaymentService.getInstance();
