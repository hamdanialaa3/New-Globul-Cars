// functions/src/subscriptions/createCheckoutSession.ts
// Cloud Function: Create Stripe Checkout Session

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import Stripe from 'stripe';
import { CheckoutSessionResult } from './types';
import { STRIPE_CONFIG, getPlanById, validatePaidPlan } from './config';

const db = getFirestore();

// Initialize Stripe only if secret key is configured
let stripeInstance: Stripe | null = null;

const getStripe = (): Stripe => {
  if (!stripeInstance) {
    if (!STRIPE_CONFIG.secretKey) {
      throw new Error('Stripe secret key is not configured. Set STRIPE_SECRET_KEY environment variable.');
    }
    stripeInstance = new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2025-09-30.clover' as any,
    });
  }
  return stripeInstance;
};

/**
 * Create Stripe Checkout Session
 * 
 * Creates a Stripe checkout session for subscription purchase
 * Updated: December 2025 - Added interval parameter support
 * 
 * @param userId - The user ID subscribing
 * @param planId - The subscription plan ID (dealer or company)
 * @param interval - Billing interval ('monthly' or 'annual')
 * @param successUrl - Optional custom success URL
 * @param cancelUrl - Optional custom cancel URL
 * 
 * @returns CheckoutSessionResult with sessionId and checkoutUrl
 */
export const createCheckoutSession = onCall<{
  userId: string;
  planId: string;
  interval?: 'monthly' | 'annual'; // New parameter
  successUrl?: string;
  cancelUrl?: string;
}>({ region: 'europe-west1' }, async (request) => {
  const { userId, planId, interval = 'monthly', successUrl, cancelUrl } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // 2. Verify user is authenticated user (not impersonating)
  if (request.auth.uid !== userId) {
    logger.warn('User attempted to create checkout for different user', {
      authenticatedUid: request.auth.uid,
      requestedUserId: userId,
    });
    throw new HttpsError(
      'permission-denied',
      'Cannot create checkout session for another user'
    );
  }

  // 3. Validate plan and interval
  if (!validatePaidPlan(planId)) {
    throw new HttpsError(
      'invalid-argument',
      `Invalid or free plan: ${planId}`
    );
  }

  // Get the correct plan based on interval (e.g., 'dealer' + 'annual' = 'dealer_annual')
  const fullPlanId = interval === 'annual' ? `${planId}_annual` : planId;
  const plan = getPlanById(fullPlanId);
  
  if (!plan) {
    throw new HttpsError(
      'invalid-argument',
      `Plan not found: ${fullPlanId}`
    );
  }

  if (!plan.stripePriceId) {
    throw new HttpsError(
      'failed-precondition',
      'Stripe Price ID not configured for this plan'
    );
  }

  logger.info('Creating checkout session', { userId, planId, interval, fullPlanId });

  try {
    // 4. Get user data
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const userEmail = userData?.email || request.auth.token.email;

    // 5. Create or get Stripe customer
    let stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUID: userId,
          displayName: userData?.displayName || '',
        },
      });

      stripeCustomerId = customer.id;

      // Save customer ID to Firestore
      await db.collection('users').doc(userId).update({
        stripeCustomerId,
        updatedAt: FieldValue.serverTimestamp(),
      });

      logger.info('Created new Stripe customer', { userId, stripeCustomerId });
    }

    // 6. Create Checkout Session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || STRIPE_CONFIG.cancelUrl,
      metadata: {
        firebaseUID: userId,
        planId: plan.id,
        planTier: plan.tier,
      },
      subscription_data: {
        metadata: {
          firebaseUID: userId,
          planId: plan.id,
          planTier: plan.tier,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    logger.info('Checkout session created', { 
      userId, 
      sessionId: session.id,
      planId 
    });

    // 7. Log checkout initiation
    await db.collection('checkoutSessions').add({
      userId,
      sessionId: session.id,
      planId,
      planTier: plan.tier,
      amount: plan.price,
      currency: plan.currency,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });

    const result: CheckoutSessionResult = {
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url || '',
      message: 'Checkout session created successfully',
    };

    return result;

  } catch (error: any) {
    logger.error('Checkout session creation failed', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    // Stripe errors
    if (error.type === 'StripeCardError') {
      throw new HttpsError('invalid-argument', `Payment error: ${error.message}`);
    }

    throw new HttpsError(
      'internal',
      `Failed to create checkout session: ${error.message}`
    );
  }
});
