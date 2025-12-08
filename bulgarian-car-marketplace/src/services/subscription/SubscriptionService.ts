// src/services/subscription/SubscriptionService.ts
// Professional Subscription Management Service
// Integrates with Stripe Cloud Functions

import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import type { PlanTier, BillingInterval } from '../../types/user/bulgarian-user.types';

// ==================== TYPES ====================

export interface CheckoutSessionData {
  userId: string;
  planId: PlanTier;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  message?: string;
  error?: string;
}

export interface SubscriptionData {
  id: string;
  userId: string;
  planTier: PlanTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CancelSubscriptionData {
  userId: string;
  immediate?: boolean;
  reason?: string;
}

export interface CancelSubscriptionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UpdatePaymentMethodData {
  userId: string;
  paymentMethodId: string;
}

export interface UpdatePaymentMethodResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: 'BGN' | 'EUR';
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidAt?: Date;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
  createdAt: Date;
}

export interface GetInvoicesResult {
  success: boolean;
  invoices?: Invoice[];
  total?: number;
  error?: string;
}

// ==================== SUBSCRIPTION SERVICE ====================

class SubscriptionService {
  private static instance: SubscriptionService;

  private constructor() {
    serviceLogger.info('SubscriptionService initialized');
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Create Stripe Checkout Session
   * 
   * @param data - Checkout session data
   * @returns Checkout session result with URL
   */
  async createCheckoutSession(data: CheckoutSessionData): Promise<CheckoutSessionResult> {
    try {
      serviceLogger.info('Creating checkout session', { 
        userId: data.userId, 
        planId: data.planId 
      });

      // Default URLs if not provided
      const successUrl = data.successUrl || `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = data.cancelUrl || `${window.location.origin}/billing/cancel`;

      // Call Cloud Function
      const createCheckout = httpsCallable<CheckoutSessionData, CheckoutSessionResult>(
        functions, 
        'createCheckoutSession'
      );

      const result = await createCheckout({
        userId: data.userId,
        planId: data.planId,
        successUrl,
        cancelUrl,
      });

      const response = result.data;

      if (response.success && response.checkoutUrl) {
        serviceLogger.info('Checkout session created successfully', { 
          sessionId: response.sessionId 
        });
        return response;
      } else {
        throw new Error(response.error || 'Failed to create checkout session');
      }

    } catch (error: any) {
      serviceLogger.error('Error creating checkout session', error as Error, {
        userId: data.userId,
        planId: data.planId,
      });

      return {
        success: false,
        error: error.message || 'Failed to create checkout session',
      };
    }
  }

  /**
   * Cancel Subscription
   * 
   * @param data - Cancellation data
   * @returns Cancellation result
   */
  async cancelSubscription(data: CancelSubscriptionData): Promise<CancelSubscriptionResult> {
    try {
      serviceLogger.info('Canceling subscription', { 
        userId: data.userId, 
        immediate: data.immediate 
      });

      const cancelSub = httpsCallable<CancelSubscriptionData, CancelSubscriptionResult>(
        functions,
        'cancelSubscription'
      );

      const result = await cancelSub(data);
      const response = result.data;

      if (response.success) {
        serviceLogger.info('Subscription canceled successfully', { 
          userId: data.userId 
        });
      }

      return response;

    } catch (error: any) {
      serviceLogger.error('Error canceling subscription', error as Error, {
        userId: data.userId,
      });

      return {
        success: false,
        error: error.message || 'Failed to cancel subscription',
      };
    }
  }

  /**
   * Update Payment Method
   * 
   * @param data - Payment method data
   * @returns Update result
   */
  async updatePaymentMethod(data: UpdatePaymentMethodData): Promise<UpdatePaymentMethodResult> {
    try {
      serviceLogger.info('Updating payment method', { 
        userId: data.userId 
      });

      const updateMethod = httpsCallable<UpdatePaymentMethodData, UpdatePaymentMethodResult>(
        functions,
        'updatePaymentMethod'
      );

      const result = await updateMethod(data);
      const response = result.data;

      if (response.success) {
        serviceLogger.info('Payment method updated successfully', { 
          userId: data.userId 
        });
      }

      return response;

    } catch (error: any) {
      serviceLogger.error('Error updating payment method', error as Error, {
        userId: data.userId,
      });

      return {
        success: false,
        error: error.message || 'Failed to update payment method',
      };
    }
  }

  /**
   * Get User Invoices
   * 
   * @param userId - User ID
   * @param params - Optional query parameters
   * @returns List of invoices
   */
  async getInvoices(
    userId: string,
    params?: {
      limit?: number;
      status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    }
  ): Promise<GetInvoicesResult> {
    try {
      serviceLogger.info('Getting user invoices', { userId, params });

      const getInvoicesFn = httpsCallable<any, GetInvoicesResult>(
        functions,
        'getUserInvoices'
      );

      const result = await getInvoicesFn({ userId, ...params });
      const response = result.data;

      if (response.success) {
        serviceLogger.info('Invoices retrieved successfully', { 
          userId, 
          count: response.invoices?.length 
        });
      }

      return response;

    } catch (error: any) {
      serviceLogger.error('Error getting invoices', error as Error, { userId });

      return {
        success: false,
        error: error.message || 'Failed to get invoices',
      };
    }
  }

  /**
   * Redirect to Checkout
   * 
   * @param data - Checkout session data
   */
  async redirectToCheckout(data: CheckoutSessionData): Promise<void> {
    const result = await this.createCheckoutSession(data);

    if (result.success && result.checkoutUrl) {
      // Redirect to Stripe Checkout
      window.location.href = result.checkoutUrl;
    } else {
      throw new Error(result.error || 'Failed to create checkout session');
    }
  }

  /**
   * Get Available Plans
   * 
   * @returns List of available subscription plans
   */
  async getAvailablePlans(): Promise<any[]> {
    try {
      const getPlans = httpsCallable(functions, 'getAvailablePlans');
      const result = await getPlans();
      return (result.data as any).plans || [];
    } catch (error: any) {
      serviceLogger.error('Error getting available plans', error as Error);
      // Return default plans as fallback
      return this.getDefaultPlans();
    }
  }

  /**
   * Get Default Plans (Fallback)
   */
  private getDefaultPlans(): any[] {
    return [
      {
        id: 'free',
        name: { bg: 'Безплатен', en: 'Free' },
        price: 0,
        tier: 'free',
        features: []
      },
      {
        id: 'dealer',
        name: { bg: 'Дилър', en: 'Dealer' },
        price: 49.99,
        tier: 'dealer',
        features: []
      },
      {
        id: 'company',
        name: { bg: 'Компания', en: 'Company' },
        price: 149.99,
        tier: 'company',
        features: []
      }
    ];
  }
}

// ==================== EXPORT ====================

export const subscriptionService = SubscriptionService.getInstance();
export default subscriptionService;
