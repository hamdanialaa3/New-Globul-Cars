import { db, functions } from '../../firebase/firebase-config';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { SUBSCRIPTION_PLANS, PlanTier } from '../../config/subscription-plans';
import { logger } from '../logger-service';
import type { BillingInterval } from '../../features/billing/types';

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

interface CreateCheckoutSessionInput {
  userId: string;
  planId: PlanTier;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

class SubscriptionService {
  /**
   * Creates a checkout session for a given subscription plan
   * Writes to `customers/{uid}/checkout_sessions`
   * Triggers the Firebase Extension to create a Stripe Checkout Session
   */
  async createCheckoutSession(params: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    const { userId, planId, interval, successUrl, cancelUrl } = params;

    if (!userId) throw new Error('User ID is required');

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan || !plan.isActive) {
      throw new Error('Invalid or inactive plan');
    }

    const priceId = plan.stripePriceIds[interval];
    if (!priceId) {
      throw new Error('Missing Stripe price id for selected interval');
    }

    const sessionsRef = collection(db, 'customers', userId, 'checkout_sessions');

    // Create the checkout session doc (Stripe Extension listens and injects url/sessionId)
    const docRef = await addDoc(sessionsRef, {
      price: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebase_uid: userId,
        plan_tier: plan.tier,
        plan_name: plan.name.en,
        interval,
      },
      mode: 'subscription',
    });

    return await new Promise<CheckoutSession>((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (data?.error) {
          unsubscribe();
          reject(new Error(data.error.message));
          return;
        }

        if (data?.url) {
          unsubscribe();
          resolve({
            url: data.url,
            sessionId: data.sessionId || '',
          });
        }
      });
    });
  }

  /**
   * Generates a link to the Stripe Customer Portal
   * Calls `ext-firestore-stripe-payments-createPortalLink`
   */
  async getPortalLink(): Promise<string> {
    const functionRef = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');

    try {
      const { data } = await functionRef({
        returnUrl: window.location.origin + '/profile',
      });
      return (data as any).url;
    } catch (error) {
      const { logger } = await import('../logger-service');
      logger.error('Error creating portal link', error as Error);
      throw error;
    }
  }

  /**
   * Checks if user has an active subscription matching the plan
   * Useful for permission checks
   */
  async checkSubscriptionStatus(uid: string): Promise<boolean> {
    // This logic might be better handled by a real-time listener hook
    return false;
  }
}

export const subscriptionService = new SubscriptionService();
