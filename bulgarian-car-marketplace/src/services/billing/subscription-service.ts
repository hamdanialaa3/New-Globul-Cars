import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  getFirestore
} from 'firebase/firestore';
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions, db } from '../../firebase/firebase-config'; // Correct import path
import { logger } from '../logger-service';
import type { SubscriptionInfo, CheckoutSessionResponse, CancelSubscriptionResponse } from '../../types/subscription';
import { getStripePriceId } from '../../config/stripe-extension.config'; // Import helper

const REGION_FUNCTIONS = functions;

// Callable names must match functions/src/index.ts exports
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
  /**
   * Create Checkout Session using Firestore Extension (Write-and-Listen)
   * This is more reliable than direct callable functions for the extension.
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResponse> {
    const { userId, planId, interval = 'monthly', successUrl, cancelUrl } = params;

    try {
      // 1. Get the correct Stripe Price ID
      const priceId = getStripePriceId(planId, interval);

      // 2. Define the collection reference: customers/{uid}/checkout_sessions
      const sessionsRef = collection(db, 'customers', userId, 'checkout_sessions');

      // 3. Create the checkout session document
      const docRef = await addDoc(sessionsRef, {
        price: priceId,
        success_url: successUrl || window.location.origin + '/profile',
        cancel_url: cancelUrl || window.location.origin + '/subscription',
        mode: 'subscription',
        allow_promotion_codes: true,
        metadata: {
          planId,
          interval,
          userId
        }
      });

      logger.info('Checkout session doc created', { docId: docRef.id, priceId });

      // 4. Listen for the extension to populate the 'url' or 'error'
      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(docRef, (snap) => {
          const data = snap.data();
          if (!data) return;

          if (data.error) {
            unsubscribe();
            logger.error('Checkout session error from extension', new Error(data.error.message));
            reject(new Error(data.error.message));
          }

          if (data.url) {
            unsubscribe();
            logger.info('Checkout URL generated', { url: data.url });
            // Automatic redirect is often desired, but we return logic to the caller
            resolve({
              success: true,
              sessionId: snap.id,
              checkoutUrl: data.url
            });
          }
        });

        // Timeout backup (15 seconds)
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Timeout waiting for Stripe Checkout URL'));
        }, 15000);
      });

    } catch (error: unknown) {
      logger.error('createCheckoutSession failed', error as Error);
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
    } catch (error: unknown) {
      logger.error('verifyCheckoutSession failed', error as Error);
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
    } catch (error: unknown) {
      logger.warn('getSubscriptionStatus failed', { error });
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
    } catch (error: unknown) {
      logger.error('cancelSubscription failed', error as Error);
      throw error;
    }
  },

  async createBillingPortalLink(returnUrl?: string): Promise<string | null> {
    try {
      const callable = httpsCallable(REGION_FUNCTIONS, FN_CREATE_BILLING_PORTAL);
      const res = await callable({ return_url: returnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/billing` : undefined) }) as HttpsCallableResult<{ url?: string }>;
      return res.data?.url || null;
    } catch (error: unknown) {
      logger.error('createBillingPortalLink failed', error as Error);
      return null;
    }
  },
};

export default subscriptionService;
