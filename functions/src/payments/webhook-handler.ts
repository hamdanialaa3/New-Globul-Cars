/**
 * Firebase Cloud Functions - Stripe Webhook Handler
 * Processes Stripe webhook events
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Handle Stripe webhooks
 * Processes payment events (succeeded, failed, refunded)
 * 
 * Setup in Stripe Dashboard:
 * 1. Add webhook endpoint: https://your-project.cloudfunctions.net/handleStripeWebhook
 * 2. Select events: payment_intent.succeeded, payment_intent.payment_failed
 * 3. Copy webhook signing secret to Firebase config
 */
export const handleStripeWebhook = functions.https.onRequest(
  async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      /*
      const Stripe = require('stripe');
      const stripe = new Stripe(functions.config().stripe.secret_key);
      
      const sig = req.headers['stripe-signature'];
      const webhookSecret = functions.config().stripe.webhook_secret;

      // Verify webhook signature
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          sig,
          webhookSecret
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(400).send('Webhook signature verification failed');
        return;
      }

      console.log('Webhook event received:', event.type);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object);
          break;

        case 'payment_intent.canceled':
          await handlePaymentCanceled(event.data.object);
          break;

        case 'account.updated':
          await handleAccountUpdated(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
      */

      // Mock response (Stripe not configured)
      console.log('Webhook received (Stripe not configured)');
      res.json({ received: true, status: 'mock' });

    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).send('Webhook handler failed');
    }
  }
);

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: any): Promise<void> {
  const metadata = paymentIntent.metadata;
  const carId = metadata.carId;
  const buyerId = metadata.buyerId;
  const sellerId = metadata.sellerId;

  try {
    // Update payment record
    const paymentsSnapshot = await admin.firestore()
      .collection('payments')
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .get();

    if (!paymentsSnapshot.empty) {
      await paymentsSnapshot.docs[0].ref.update({
        status: 'succeeded',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Mark car as sold
    await admin.firestore()
      .collection('cars')
      .doc(carId)
      .update({
        status: 'sold',
        soldAt: admin.firestore.FieldValue.serverTimestamp(),
        soldTo: buyerId,
        soldPrice: paymentIntent.amount / 100
      });

    // Send notification to seller
    await admin.firestore()
      .collection('notifications')
      .doc(sellerId)
      .collection('items')
      .add({
        type: 'car_sold',
        carId,
        buyerId,
        amount: paymentIntent.amount / 100,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });

    console.log(`Payment succeeded for car ${carId}`);

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: any): Promise<void> {
  try {
    const paymentsSnapshot = await admin.firestore()
      .collection('payments')
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .get();

    if (!paymentsSnapshot.empty) {
      await paymentsSnapshot.docs[0].ref.update({
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`Payment failed for intent ${paymentIntent.id}`);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: any): Promise<void> {
  try {
    const paymentsSnapshot = await admin.firestore()
      .collection('payments')
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .get();

    if (!paymentsSnapshot.empty) {
      await paymentsSnapshot.docs[0].ref.update({
        status: 'canceled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`Payment canceled for intent ${paymentIntent.id}`);

  } catch (error) {
    console.error('Error handling payment cancelation:', error);
  }
}

/**
 * Handle Stripe account updates
 */
async function handleAccountUpdated(account: any): Promise<void> {
  try {
    const accountId = account.id;

    // Find seller with this account ID
    const sellersSnapshot = await admin.firestore()
      .collection('sellers')
      .where('stripeAccountId', '==', accountId)
      .get();

    if (!sellersSnapshot.empty) {
      await sellersSnapshot.docs[0].ref.update({
        stripeOnboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Stripe account ${accountId} status updated`);
    }

  } catch (error) {
    console.error('Error handling account update:', error);
  }
}

