// functions/src/stripe-checkout.ts
// Cloud Function for creating Stripe Checkout Sessions

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { logger } from './utils/logger';

// Initialize Stripe with secret key
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2025-10-29.clover',
});

// functions/src/stripe-checkout.ts
// Cloud Function for creating Stripe Checkout Sessions

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { logger } from './utils/logger';

// Initialize Stripe with secret key
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2025-10-29.clover',
});

interface CheckoutRequest {
  userId: string;
  priceId: string; // Changed from planId to priceId for direct Stripe price IDs
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

// Updated pricing configuration for 9 tiers
const TIER_PRICES = {
  basic: functions.config().stripe.price_basic,
  premium: functions.config().stripe.price_premium,
  enterprise: functions.config().stripe.price_enterprise,
  dealer_basic: functions.config().stripe.price_dealer_basic,
  dealer_premium: functions.config().stripe.price_dealer_premium,
  dealer_enterprise: functions.config().stripe.price_dealer_enterprise,
  company_basic: functions.config().stripe.price_company_basic,
  company_premium: functions.config().stripe.price_company_premium,
  company_enterprise: functions.config().stripe.price_company_enterprise,
};

// Tier mapping for metadata
const TIER_MAPPING = {
  [functions.config().stripe.price_basic]: 'basic',
  [functions.config().stripe.price_premium]: 'premium',
  [functions.config().stripe.price_enterprise]: 'enterprise',
  [functions.config().stripe.price_dealer_basic]: 'dealer_basic',
  [functions.config().stripe.price_dealer_premium]: 'dealer_premium',
  [functions.config().stripe.price_dealer_enterprise]: 'dealer_enterprise',
  [functions.config().stripe.price_company_basic]: 'company_basic',
  [functions.config().stripe.price_company_premium]: 'company_premium',
  [functions.config().stripe.price_company_enterprise]: 'company_enterprise',
};

export const createCheckoutSession = functions.https.onCall(
  async (data: CheckoutRequest, context): Promise<CheckoutResponse> => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to create checkout session'
      );
    }

    const { userId, priceId, successUrl, cancelUrl, metadata = {} } = data;

    // Validate input
    if (!userId || !priceId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: userId, priceId'
      );
    }

    // Validate priceId is one of our supported tiers
    const validPriceIds = Object.values(TIER_PRICES);
    if (!validPriceIds.includes(priceId)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid price ID provided'
      );
    }

    try {
      // Get or create Stripe customer
      const user = await admin.firestore().doc(`users/${userId}`).get();
      const userData = user.data();

      let customerId = userData?.stripeCustomerId;

      if (!customerId) {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: userData?.email,
          name: userData?.displayName,
          metadata: {
            firebaseUID: userId,
          },
        });

        customerId = customer.id;

        // Save customer ID to user document
        await admin.firestore().doc(`users/${userId}`).update({
          stripeCustomerId: customerId,
        });
      }

      // Get tier name from priceId
      const tierId = TIER_MAPPING[priceId];

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          firebaseUID: userId,
          tierId,
          ...metadata
        },
        subscription_data: {
          metadata: {
            firebaseUID: userId,
            tierId,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true,
        },
      });

      // Log the checkout session creation
      await admin.firestore().collection('billing_logs').add({
        userId,
        action: 'checkout_session_created',
        sessionId: session.id,
        tierId,
        amount: session.amount_total,
        currency: session.currency,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url!,
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error creating checkout session', { error: err.message });

      // Log the error
      await admin.firestore().collection('billing_logs').add({
        userId,
        action: 'checkout_session_error',
        error: err.message,
        priceId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw new functions.https.HttpsError(
        'internal',
        `Failed to create checkout session: ${err.message}`
      );
    }
  }
);

// Webhook handler for Stripe events
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Webhook signature verification failed', { message: error.message });
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      logger.info('Unhandled event type', { eventType: event.type });
  }

  res.json({ received: true });
});

// Helper functions for webhook events
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;
  const tierId = session.metadata?.tierId;

  if (!userId || !tierId) {
    logger.error('Missing metadata in checkout session', { sessionId: session.id });
    return;
  }

  // Update user's plan in Firestore
  await admin.firestore().doc(`users/${userId}`).update({
    plan: {
      tier: tierId,
      status: 'active',
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      renewsAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      ),
    },
  });

  // Log the successful activation
  await admin.firestore().collection('billing_logs').add({
    userId,
    action: 'subscription_activated',
    sessionId: session.id,
    subscriptionId: session.subscription,
    tierId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.firebaseUID;
  const tierId = subscription.metadata?.tierId;

  if (!userId) {
    logger.error('Missing firebaseUID in subscription metadata', { subscriptionId: subscription.id });
    return;
  }

  // Update subscription status
  await admin.firestore().doc(`users/${userId}`).update({
    'plan.status': subscription.status,
    'plan.tier': tierId,
    'plan.stripeSubscriptionId': subscription.id,
    'plan.currentPeriodStart': admin.firestore.Timestamp.fromDate(
      new Date((subscription as any).current_period_start * 1000)
    ),
    'plan.currentPeriodEnd': admin.firestore.Timestamp.fromDate(
      new Date((subscription as any).current_period_end * 1000)
    ),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.firebaseUID;

  if (!userId) return;

  await admin.firestore().doc(`users/${userId}`).update({
    'plan.status': subscription.status,
    'plan.currentPeriodStart': admin.firestore.Timestamp.fromDate(
      new Date((subscription as any).current_period_start * 1000)
    ),
    'plan.currentPeriodEnd': admin.firestore.Timestamp.fromDate(
      new Date((subscription as any).current_period_end * 1000)
    ),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.firebaseUID;
  
  if (!userId) return;

  // Downgrade to free plan
  await admin.firestore().doc(`users/${userId}`).update({
    plan: {
      tier: 'free',
      status: 'canceled',
      canceledAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!subscriptionId) return;

  // Get subscription to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.firebaseUID;
  
  if (!userId) return;

  // Log successful payment
  await admin.firestore().collection('billing_logs').add({
    userId,
    action: 'payment_succeeded',
    invoiceId: invoice.id,
    subscriptionId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.firebaseUID;
  
  if (!userId) return;

  // Log failed payment
  await admin.firestore().collection('billing_logs').add({
    userId,
    action: 'payment_failed',
    invoiceId: invoice.id,
    subscriptionId,
    amount: invoice.amount_due,
    currency: invoice.currency,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // TODO: Send email notification about failed payment
}

// Additional Cloud Functions for subscription management
export const getSubscriptionStatus = functions.https.onCall(
  async (data: { userId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { userId } = data;

    try {
      const userDoc = await admin.firestore().doc(`users/${userId}`).get();
      const userData = userDoc.data();

      if (!userData?.stripeCustomerId) {
        return { status: 'inactive', tier: null };
      }

      // Get subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: userData.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return { status: 'inactive', tier: null };
      }

      const subscription = subscriptions.data[0];
      const tierId = subscription.metadata?.tierId;

      return {
        status: subscription.status,
        tier: tierId,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error getting subscription status', { error: err.message, userId });
      throw new functions.https.HttpsError('internal', err.message);
    }
  }
);

export const cancelSubscription = functions.https.onCall(
  async (data: { userId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { userId } = data;

    try {
      const userDoc = await admin.firestore().doc(`users/${userId}`).get();
      const userData = userDoc.data();

      if (!userData?.plan?.stripeSubscriptionId) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No active subscription found'
        );
      }

      // Cancel subscription at period end
      await stripe.subscriptions.update(userData.plan.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update Firestore
      await admin.firestore().doc(`users/${userId}`).update({
        'plan.cancelAtPeriodEnd': true,
        'plan.cancelledAt': admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info('Subscription cancelled', { userId });
      return { success: true };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error cancelling subscription', { error: err.message, userId });
      throw new functions.https.HttpsError('internal', err.message);
    }
  }
);

export const updatePaymentMethod = functions.https.onCall(
  async (data: { userId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { userId } = data;

    try {
      const userDoc = await admin.firestore().doc(`users/${userId}`).get();
      const userData = userDoc.data();

      if (!userData?.stripeCustomerId) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No Stripe customer found'
        );
      }

      // Create setup intent for updating payment method
      const setupIntent = await stripe.setupIntents.create({
        customer: userData.stripeCustomerId,
        payment_method_types: ['card'],
      });

      return {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error creating setup intent', { error: err.message, userId });
      throw new functions.https.HttpsError('internal', err.message);
    }
  }
);