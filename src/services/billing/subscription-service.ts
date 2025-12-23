import { db, functions } from '../../firebase/firebase-config';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  collectionGroup,
  query,
  where
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../../config/billing-config';

export interface CheckoutSession {
  sessionId: string;
  url: string;
  error?: {
    message: string;
  };
}

class SubscriptionService {
  /**
   * Creates a checkout session for a given subscription plan
   * Writes to `customers/{uid}/checkout_sessions`
   * Triggers the Firebase Extension to create a Stripe Checkout Session
   */
  async createCheckoutSession(uid: string, plan: SubscriptionPlan): Promise<void> {
    if (!uid) throw new Error('User ID is required');
    if (!plan.id) throw new Error('Invalid plan ID');

    const sessionsRef = collection(db, 'customers', uid, 'checkout_sessions');

    // Create the checkout session doc
    // The extension listens to this and updates the doc with 'url' or 'error'
    const docRef = await addDoc(sessionsRef, {
      price: plan.id,
      success_url: window.location.origin + '/payment-success',
      cancel_url: window.location.origin + '/payment-cancel',
      metadata: {
        firebase_uid: uid,
        plan_name: plan.name,
      },
      mode: 'subscription',
      // e.g. "subscription" or "payment" (one-time)
    });

    // Listen for the Checkout Session URL to be written by the extension
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (data?.error) {
          unsubscribe();
          reject(new Error(data.error.message));
        }
        if (data?.url) {
          unsubscribe();
          // Redirect the user to Stripe Checkout
          window.location.assign(data.url);
          resolve();
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
      console.error('Error creating portal link:', error);
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
