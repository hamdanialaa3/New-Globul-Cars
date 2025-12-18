// functions/src/subscriptions/stripeWebhook.ts
// Stripe Webhook Handler - Process subscription events

import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import Stripe from 'stripe';
import { STRIPE_CONFIG } from './config';

const db = getFirestore();

// Initialize Stripe lazily to avoid errors during deployment
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe && STRIPE_CONFIG.secretKey) {
    stripe = new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2024-11-20' as any,
    });
  }
  return stripe;
};

// Helper to safely access Stripe properties that may not be in type definitions
interface SubscriptionPeriod {
  start: number;
  end: number;
}

const getSubscriptionPeriod = (sub: Stripe.Subscription): SubscriptionPeriod => ({
  start: sub.current_period_start,
  end: sub.current_period_end,
});

const getInvoiceSubscription = (invoice: Stripe.Invoice): string | null => {
  return invoice.subscription as string | null;
};

/**
 * Stripe Webhook Handler
 * 
 * Handles webhook events from Stripe:
 * - checkout.session.completed: Payment successful, activate subscription
 * - invoice.payment_succeeded: Subscription renewed
 * - customer.subscription.deleted: Subscription canceled
 * - invoice.payment_failed: Payment failed
 * 
 * Webhook URL: https://<region>-<project>.cloudfunctions.net/stripeWebhook
 * 
 * Configure in Stripe Dashboard:
 * https://dashboard.stripe.com/test/webhooks
 */
export const stripeWebhook = onRequest({ region: 'europe-west1' }, async (request, response) => {
  const sig = request.headers['stripe-signature'] as string;

  if (!sig) {
    logger.error('No Stripe signature in webhook');
    response.status(400).send('No signature');
    return;
  }

  // Get Stripe instance
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    logger.error('Stripe is not configured');
    response.status(500).send('Stripe configuration error');
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripeInstance.webhooks.constructEvent(
      request.rawBody,
      sig,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Webhook signature verification failed', error);
    response.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  logger.info('Stripe webhook received', { 
    type: event.type,
    eventId: event.id 
  });

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    response.json({ received: true });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error processing webhook', err);
    response.status(500).send('Webhook processing failed');
  }
});

/**
 * Handle checkout.session.completed
 * Activate subscription when payment successful
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;
  const planId = session.metadata?.planId;
  const planTier = session.metadata?.planTier;

  if (!userId || !planId) {
    logger.error('Missing metadata in checkout session', { sessionId: session.id });
    return;
  }

  logger.info('Processing checkout completion', { userId, planId, sessionId: session.id });

  const stripeInstance = getStripe();
  if (!stripeInstance) {
    logger.error('Stripe is not configured');
    return;
  }

  try {
    // Get subscription details
    const subscriptionId = session.subscription as string;
    const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);

    // Update user subscription in Firestore
    const period = getSubscriptionPeriod(subscription);
    await db.collection('users').doc(userId).update({
      planTier: planTier, // Sync to root level
      'subscription.planId': planId,
      'subscription.planTier': planTier,
      'subscription.status': 'active',
      'subscription.stripeCustomerId': session.customer as string,
      'subscription.stripeSubscriptionId': subscriptionId,
      'subscription.stripePriceId': subscription.items.data[0].price.id,
      'subscription.currentPeriodStart': FieldValue.serverTimestamp(),
      'subscription.currentPeriodEnd': period.end ? new Date(period.end * 1000) : FieldValue.serverTimestamp(),
      'subscription.cancelAtPeriodEnd': false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update checkout session status
    await db.collection('checkoutSessions')
      .where('sessionId', '==', session.id)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          doc.ref.update({
            status: 'completed',
            completedAt: FieldValue.serverTimestamp(),
          });
        });
      });

    // Send confirmation email
    await db.collection('mail').add({
      to: session.customer_email,
      template: {
        name: 'subscription-activated',
        data: {
          planName: planId,
          userId,
        },
      },
    });

    logger.info('Subscription activated', { userId, subscriptionId });

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error handling checkout completion', err);
    throw err;
  }
}

/**
 * Handle invoice.payment_succeeded
 * Renew subscription when payment successful
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = getInvoiceSubscription(invoice);

  if (!subscriptionId) {
    logger.info('Invoice not related to subscription', { invoiceId: invoice.id });
    return;
  }

  logger.info('Processing payment success', { customerId, subscriptionId });

  const stripeInstance = getStripe();
  if (!stripeInstance) {
    logger.error('Stripe is not configured');
    return;
  }

  try {
    // Find user by Stripe customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      logger.error('User not found for Stripe customer', { customerId });
      return;
    }

    const userId = usersSnapshot.docs[0].id;

    // Get subscription details
    const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
    const period = getSubscriptionPeriod(subscription);

    // Update subscription period
    await db.collection('users').doc(userId).update({
      'subscription.status': 'active',
      'subscription.currentPeriodStart': period.start ? new Date(period.start * 1000) : FieldValue.serverTimestamp(),
      'subscription.currentPeriodEnd': period.end ? new Date(period.end * 1000) : FieldValue.serverTimestamp(),
      'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Subscription renewed', { userId, subscriptionId });

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error handling payment success', err);
    throw err;
  }
}

/**
 * Handle customer.subscription.deleted
 * Cancel subscription
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  logger.info('Processing subscription deletion', { customerId, subscriptionId });

  try {
    // Find user by Stripe customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      logger.error('User not found for Stripe customer', { customerId });
      return;
    }

    const userId = usersSnapshot.docs[0].id;

    // Update subscription status
    await db.collection('users').doc(userId).update({
      planTier: 'free', // Revert to free at root level
      'subscription.planId': 'free',
      'subscription.planTier': 'free',
      'subscription.status': 'canceled',
      'subscription.cancelAtPeriodEnd': false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Send cancellation email
    const userData = usersSnapshot.docs[0].data();
    await db.collection('mail').add({
      to: userData.email,
      template: {
        name: 'subscription-canceled',
        data: {
          userId,
          displayName: userData.displayName,
        },
      },
    });

    logger.info('Subscription canceled', { userId, subscriptionId });

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error handling subscription deletion', err);
    throw err;
  }
}

/**
 * Handle customer.subscription.updated
 * Update subscription details
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  logger.info('Processing subscription update', { customerId, subscriptionId });

  try {
    // Find user by Stripe customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      logger.error('User not found for Stripe customer', { customerId });
      return;
    }

    const userId = usersSnapshot.docs[0].id;

    // Update subscription details
    const period = getSubscriptionPeriod(subscription);
    await db.collection('users').doc(userId).update({
      'subscription.status': subscription.status,
      'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      'subscription.currentPeriodStart': period.start ? new Date(period.start * 1000) : FieldValue.serverTimestamp(),
      'subscription.currentPeriodEnd': period.end ? new Date(period.end * 1000) : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Subscription updated', { userId, subscriptionId, status: subscription.status });

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error handling subscription update', err);
    throw err;
  }
}

/**
 * Handle invoice.payment_failed
 * Mark subscription as past_due
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = getInvoiceSubscription(invoice);

  if (!subscriptionId) {
    logger.info('Invoice not related to subscription', { invoiceId: invoice.id });
    return;
  }

  logger.info('Processing payment failure', { customerId, subscriptionId });

  try {
    // Find user by Stripe customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      logger.error('User not found for Stripe customer', { customerId });
      return;
    }

    const userId = usersSnapshot.docs[0].id;

    // Update subscription status to past_due
    await db.collection('users').doc(userId).update({
      'subscription.status': 'past_due',
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Send payment failed email
    const userData = usersSnapshot.docs[0].data();
    await db.collection('mail').add({
      to: userData.email,
      template: {
        name: 'payment-failed',
        data: {
          userId,
          displayName: userData.displayName,
          invoiceUrl: invoice.hosted_invoice_url,
        },
      },
    });

    logger.info('Subscription marked as past_due', { userId, subscriptionId });

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error handling payment failure', err);
    throw err;
  }
}
