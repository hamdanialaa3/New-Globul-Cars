// functions/src/stripe-checkout.ts
// Cloud Function for creating Stripe Checkout Sessions

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

interface CheckoutRequest {
  userId: string;
  planId: 'free' | 'dealer' | 'company';
  interval?: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

// Plan pricing configuration
const PLAN_PRICES = {
  dealer: {
    monthly: 'price_dealer_monthly', // Replace with actual Stripe Price ID
    annual: 'price_dealer_annual',   // Replace with actual Stripe Price ID
  },
  company: {
    monthly: 'price_company_monthly', // Replace with actual Stripe Price ID
    annual: 'price_company_annual',   // Replace with actual Stripe Price ID
  },
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

    const { userId, planId, interval = 'monthly', successUrl, cancelUrl } = data;

    // Validate input
    if (!userId || !planId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: userId, planId'
      );
    }

    // Free plan doesn't need checkout
    if (planId === 'free') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Free plan does not require payment'
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

      // Get price ID for the selected plan and interval
      const priceId = PLAN_PRICES[planId as keyof typeof PLAN_PRICES]?.[interval];

      if (!priceId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Invalid plan or interval: ${planId}/${interval}`
        );
      }

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
          planId,
          interval,
        },
        subscription_data: {
          metadata: {
            firebaseUID: userId,
            planId,
            interval,
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
        planId,
        interval,
        amount: session.amount_total,
        currency: session.currency,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url!,
      };

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      
      // Log the error
      await admin.firestore().collection('billing_logs').add({
        userId,
        action: 'checkout_session_error',
        error: error.message,
        planId,
        interval,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw new functions.https.HttpsError(
        'internal',
        `Failed to create checkout session: ${error.message}`
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
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
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
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Helper functions for webhook events
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;
  const planId = session.metadata?.planId;
  const interval = session.metadata?.interval;

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Update user's plan in Firestore
  await admin.firestore().doc(`users/${userId}`).update({
    plan: {
      tier: planId,
      status: 'active',
      interval,
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      renewsAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + (interval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000)
      ),
    },
  });

  // Log the successful activation
  await admin.firestore().collection('billing_logs').add({
    userId,
    action: 'subscription_activated',
    sessionId: session.id,
    subscriptionId: session.subscription,
    planId,
    interval,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.firebaseUID;
  
  if (!userId) {
    console.error('Missing firebaseUID in subscription metadata:', subscription.id);
    return;
  }

  // Update subscription status
  await admin.firestore().doc(`users/${userId}`).update({
    'plan.status': subscription.status,
    'plan.stripeSubscriptionId': subscription.id,
    'plan.currentPeriodStart': admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_start * 1000)
    ),
    'plan.currentPeriodEnd': admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_end * 1000)
    ),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.firebaseUID;
  
  if (!userId) return;

  await admin.firestore().doc(`users/${userId}`).update({
    'plan.status': subscription.status,
    'plan.currentPeriodStart': admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_start * 1000)
    ),
    'plan.currentPeriodEnd': admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_end * 1000)
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
  const subscriptionId = invoice.subscription as string;
  
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
  const subscriptionId = invoice.subscription as string;
  
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