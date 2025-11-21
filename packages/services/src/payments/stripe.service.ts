/**
 * Stripe Payment Service
 * Handles Stripe Connect integration for payments
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { serviceLogger } from '../logger-wrapper';

interface PaymentIntent {
  success: boolean;
  paymentId: string;
  clientSecret?: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
  message?: string;
}

interface AccountStatus {
  hasAccount: boolean;
  onboardingComplete: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirements?: any;
}

interface CreateAccountResponse {
  success: boolean;
  accountId: string;
  onboardingUrl: string;
  message?: string;
}

class StripeService {
  private functions = getFunctions();

  /**
   * Create Stripe Connect account for seller
   */
  async createSellerAccount(
    email: string,
    businessName?: string,
    businessType: 'individual' | 'company' = 'individual'
  ): Promise<CreateAccountResponse> {
    try {
      const createAccount = httpsCallable<any, CreateAccountResponse>(
        this.functions,
        'createStripeSellerAccount'
      );

      const result = await createAccount({
        email,
        businessName,
        businessType,
        country: 'BG',
        returnUrl: `${window.location.origin}/seller/dashboard`,
        refreshUrl: `${window.location.origin}/seller/stripe-refresh`
      });

      return result.data;

    } catch (error: any) {
      serviceLogger.error('Error creating Stripe account', error as Error, { email, businessType });
      throw new Error(error.message || 'Failed to create Stripe account');
    }
  }

  /**
   * Get Stripe account status for current seller
   */
  async getAccountStatus(): Promise<AccountStatus> {
    try {
      const getStatus = httpsCallable<any, AccountStatus>(
        this.functions,
        'getStripeAccountStatus'
      );

      const result = await getStatus();
      return result.data;

    } catch (error: any) {
      serviceLogger.error('Error getting account status', error as Error);
      throw new Error(error.message || 'Failed to get account status');
    }
  }

  /**
   * Create payment intent for car purchase
   */
  async createPaymentIntent(
    carId: string,
    amount: number,
    buyerId: string
  ): Promise<PaymentIntent> {
    try {
      const createPayment = httpsCallable<any, PaymentIntent>(
        this.functions,
        'createCarPaymentIntent'
      );

      const result = await createPayment({
        carId,
        amount,
        currency: 'EUR',
        buyerId
      });

      return result.data;

    } catch (error: any) {
      serviceLogger.error('Error creating payment intent', error as Error, { carId, amount, buyerId });
      throw new Error(error.message || 'Failed to create payment');
    }
  }

  /**
   * Confirm payment after successful charge
   */
  async confirmPayment(paymentId: string): Promise<{ success: boolean }> {
    try {
      const confirmPayment = httpsCallable<any, { success: boolean }>(
        this.functions,
        'confirmCarPayment'
      );

      const result = await confirmPayment({ paymentId });
      return result.data;

    } catch (error: any) {
      serviceLogger.error('Error confirming payment', error as Error, { paymentId });
      throw new Error(error.message || 'Failed to confirm payment');
    }
  }

  /**
   * Calculate platform fee
   */
  calculatePlatformFee(amount: number, feePercent: number = 5): number {
    return parseFloat((amount * (feePercent / 100)).toFixed(2));
  }

  /**
   * Calculate seller net amount
   */
  calculateSellerAmount(amount: number, feePercent: number = 5): number {
    const fee = this.calculatePlatformFee(amount, feePercent);
    return parseFloat((amount - fee).toFixed(2));
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency
    }).format(amount);
  }
}

export const stripeService = new StripeService();
export default stripeService;

