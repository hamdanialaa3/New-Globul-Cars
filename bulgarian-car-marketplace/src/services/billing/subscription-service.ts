// src/services/billing/subscription-service.ts
// Frontend Subscription Service (Stripe) — connects to Firebase callable functions

import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from '@/firebase';
import { logger } from '@/services/logger-service';
import type { SubscriptionInfo, CheckoutSessionResponse, CancelSubscriptionResponse } from '@/types/subscription';

const REGION_FUNCTIONS = functions; // already initialized with europe-west1 in firebase-config

// Callable names must match functions/src/index.ts exports
const FN_CREATE_CHECKOUT = 'createCheckoutSession';
const FN_VERIFY_CHECKOUT = 'verifyCheckoutSession';
const FN_CANCEL_SUBSCRIPTION = 'cancelSubscription';
const FN_CREATE_BILLING_PORTAL = 'ext-firestore-stripe-payments-createPortalLink';

export type BillingInterval = 'monthly' | 'annual';

export interface CreateCheckoutParams {
  userId: string;
  planId: 'dealer' | 'company';
  interval?: BillingInterval;
  successUrl?: string;
  cancelUrl?: string;
}

export const subscriptionService = {
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResponse> {
    try {
      const callable = httpsCallable(REGION_FUNCTIONS, FN_CREATE_CHECKOUT);
      const res = await callable(params as any) as HttpsCallableResult<CheckoutSessionResponse>;
      if (!res.data?.success || !res.data?.checkoutUrl) {
        throw new Error(res.data?.message || 'Failed to create checkout session');
      }
      logger.info('Checkout session created', { planId: params.planId, interval: params.interval, sessionId: res.data.sessionId });
      return res.data;
    } catch (error: any) {
      logger.error('createCheckoutSession failed', error);
      throw error;
    }
  },

  async verifyCheckoutSession(sessionId: string): Promise<{ success: boolean; subscription?: SubscriptionInfo; message?: string; }> {
    try {
      const callable = httpsCallable(REGION_FUNCTIONS, FN_VERIFY_CHECKOUT);
      const res = await callable({ sessionId }) as HttpsCallableResult<{ success: boolean; subscription?: SubscriptionInfo; message?: string; }>;
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Verification failed');
      }
      logger.info('Checkout session verified', { sessionId, subscription: res.data.subscription });
      return res.data;
    } catch (error: any) {
      logger.error('verifyCheckoutSession failed', error);
      throw error;
    }
  },

  async getSubscriptionStatus(userId: string): Promise<SubscriptionInfo | null> {
    try {
      const callable = httpsCallable(REGION_FUNCTIONS, 'getSubscriptionStatus');
      const res = await callable({ userId }) as HttpsCallableResult<{ subscription?: SubscriptionInfo; }>;
      if (res.data?.subscription) {
        logger.info('Subscription status retrieved', { userId, status: res.data.subscription.status });
        return res.data.subscription;
      }
      return null;
    } catch (error: any) {
      logger.warn('getSubscriptionStatus failed', error);
      return null;
    }
  },

  async cancelSubscription(userId: string, immediate = false): Promise<CancelSubscriptionResponse> {
    try {
      const callable = httpsCallable(REGION_FUNCTIONS, FN_CANCEL_SUBSCRIPTION);
      const res = await callable({ userId, immediate }) as HttpsCallableResult<CancelSubscriptionResponse>;
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Cancellation failed');
      }
      logger.info('Subscription cancellation processed', { userId, immediate });
      return res.data;
    } catch (error: any) {
      logger.error('cancelSubscription failed', error);
      throw error;
    }
  },

  async createBillingPortalLink(returnUrl?: string): Promise<string | null> {
    try {
      const callable = httpsCallable(REGION_FUNCTIONS, FN_CREATE_BILLING_PORTAL);
      const res = await callable({ return_url: returnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/billing` : undefined) }) as HttpsCallableResult<{ url?: string }>;
      return res.data?.url || null;
    } catch (error: any) {
      logger.error('createBillingPortalLink failed', error);
      return null;
    }
  },
};

export default subscriptionService;
