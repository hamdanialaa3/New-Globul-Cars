import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as logger from 'firebase-functions/logger';
import { logSubscriptionEvent } from './services/subscription-audit.service';

// Initialize Admin SDK once per instance
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Initialize Stripe - require env key; no fallback to prevent accidental test key usage
const stripeKey =
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET ||
  process.env.STRIPE_API_KEY;

if (!stripeKey) {
  logger.warn(
    'STRIPE_SECRET_KEY not configured - Stripe webhooks will be non-functional'
  );
}

// Use package default apiVersion to avoid invalid override issues
const stripe = stripeKey ? new Stripe(stripeKey) : null;

/**
 * Stripe Webhook Handler - Complete Payment Lifecycle Management
 * Handles: subscriptions, payments, refunds, and plan downgrades
 *
 * @since January 6, 2026 - Enhanced with refunds and proper logging
 */
export const stripeWebhooks = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!sig || !webhookSecret) {
      logger.error('Missing Stripe signature or webhook secret');
      res.status(400).send('Missing signature or secret');
      return;
    }

    if (!stripe) {
      logger.error('Stripe is not configured - missing STRIPE_SECRET_KEY');
      res.status(503).send('Stripe not configured');
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
      logger.error('Webhook signature verification failed', {
        error: err.message,
      });
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      logger.info('Processing Stripe event', {
        type: event.type,
        id: event.id,
      });

      switch (event.type) {
        // ===== SUBSCRIPTION EVENTS =====
        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCreated(subscription);
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionChange(subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCancelled(subscription);
          break;
        }
        case 'customer.subscription.paused': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionPaused(subscription);
          break;
        }

        // ===== PAYMENT EVENTS =====
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentSucceeded(invoice);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(invoice);
          break;
        }

        // ===== REFUND EVENTS =====
        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          await handleRefund(charge);
          break;
        }
        case 'charge.dispute.created': {
          const dispute = event.data.object as Stripe.Dispute;
          await handleDispute(dispute);
          break;
        }

        default:
          logger.info('Unhandled Stripe event type', { type: event.type });
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Error handling Stripe webhook', {
        error,
        eventType: event.type,
      });
      res.status(500).send('Internal Server Error');
    }
  });

// ===== HELPER: Find User by Stripe Customer ID =====
async function findUserByStripeId(
  customerId: string
): Promise<FirebaseFirestore.DocumentSnapshot | null> {
  const usersRef = db.collection('users');
  const snapshot = await usersRef
    .where('stripeId', '==', customerId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    logger.warn('No user found for Stripe Customer', { customerId });
    return null;
  }

  return snapshot.docs[0];
}

// ===== HELPER: Map Stripe Product to Plan Tier =====
function mapProductToPlanTier(
  productId: string | null
): 'free' | 'dealer' | 'company' {
  // ✅ CRITICAL: Use actual Stripe Product IDs from stripe-extension.config.ts
  // These Product IDs are from your Stripe Dashboard
  const productMapping: Record<string, 'dealer' | 'company'> = {
    // Dealer Product IDs (from stripe-extension.config.ts)
    prod_TcMRPH1acbKwsJ: 'dealer', // Mobilebg Cars - Dealer

    // Company Product IDs (from stripe-extension.config.ts)
    prod_TcMX8XZcmlddRd: 'company', // MobileBG Cars - Company

    // Legacy/fallback IDs (if different format)
    prod_dealer_monthly: 'dealer',
    prod_dealer_yearly: 'dealer',
    prod_company_monthly: 'company',
    prod_company_yearly: 'company',
  };

  // ✅ Return 'free' instead of 'private' for consistency with planTier
  return productId ? productMapping[productId] || 'free' : 'free';
}

// ===== SUBSCRIPTION HANDLERS =====
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userDoc = await findUserByStripeId(customerId);

  if (!userDoc) return;

  const productId = subscription.items.data[0]?.price?.product as string;
  const newTier = mapProductToPlanTier(productId);

  logger.info('New subscription created', {
    userId: userDoc.id,
    tier: newTier,
    subscriptionId: subscription.id,
  });

  // ✅ CRITICAL: Sync profileType with planTier
  const newProfileType = newTier === 'free' ? 'private' : newTier;

  await userDoc.ref.update({
    planTier: newTier,
    profileType: newProfileType, // ✅ Sync profileType
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionStart: admin.firestore.Timestamp.fromMillis(
      (subscription as any).start_date * 1000
    ),
    // Use correct Stripe field: current_period_end
    subscriptionCurrentPeriodEnd: admin.firestore.Timestamp.fromMillis(
      (subscription as any).current_period_end * 1000
    ),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Send welcome notification
  await createNotification(userDoc.id, {
    type: 'subscription_activated',
    title: 'Вашият абонамент е активиран! 🎉',
    titleEn: 'Your subscription is now active! 🎉',
    message: `Вие сте ${newTier === 'dealer' ? 'Дилър' : 'Компания'} план.`,
    messageEn: `You are now on the ${newTier} plan.`,
  });

  // Audit log
  await logSubscriptionEvent(userDoc.id, 'created', {
    toTier: newTier,
    toStatus: subscription.status,
    metadata: { subscriptionId: subscription.id },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const userDoc = await findUserByStripeId(customerId);

  if (!userDoc) return;

  const currentData = userDoc.data();
  const currentTier = currentData?.planTier || 'private';

  // If subscription is no longer active, downgrade to free
  if (status !== 'active' && status !== 'trialing') {
    if (currentTier !== 'private') {
      logger.info('Downgrading user due to subscription status', {
        userId: userDoc.id,
        from: currentTier,
        to: 'private',
        reason: status,
      });

      // ✅ CRITICAL: Sync profileType with planTier
      await userDoc.ref.update({
        planTier: 'free', // ✅ Use 'free' instead of 'private' for consistency
        profileType: 'private', // ✅ Sync profileType
        subscriptionStatus: status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 🔴 CRITICAL: Deactivate excess listings on downgrade
      await deactivateExcessListings(userDoc.id, 'free'); // ✅ Use 'free' for consistency

      await createNotification(userDoc.id, {
        type: 'subscription_downgraded',
        title: 'Абонаментът ви е прекратен',
        titleEn: 'Your subscription has been downgraded',
        message: 'Моля, подновете плащането за да възстановите достъпа.',
        messageEn: 'Please renew your payment to restore access.',
      });

      // Audit log
      await logSubscriptionEvent(userDoc.id, 'downgraded', {
        fromTier: currentTier,
        toTier: 'free',
        fromStatus: currentData?.subscriptionStatus,
        toStatus: status,
        reason: `subscription status changed to ${status}`,
      });
    }
  } else {
    // Update subscription details
    const productId = subscription.items.data[0]?.price?.product as string;
    const newTier = mapProductToPlanTier(productId);

    // Check if this is a downgrade (e.g., company -> dealer)
    const tierPriority: Record<string, number> = {
      free: 0,
      private: 0,
      dealer: 1,
      company: 2,
    };
    const normalize = (t: string) => (t === 'private' ? 'free' : t);
    const isDowngrade =
      tierPriority[normalize(newTier)] < tierPriority[normalize(currentTier)];

    // ✅ CRITICAL: Sync profileType with planTier
    const newProfileType = newTier === 'free' ? 'private' : newTier;

    await userDoc.ref.update({
      planTier: newTier,
      profileType: newProfileType, // ✅ Sync profileType
      subscriptionStatus: status,
      // Use correct Stripe field: current_period_end
      subscriptionCurrentPeriodEnd: admin.firestore.Timestamp.fromMillis(
        (subscription as any).current_period_end * 1000
      ),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 🔴 CRITICAL: Handle tier downgrade (e.g., company -> dealer)
    if (isDowngrade) {
      logger.info('Plan tier downgrade detected', {
        userId: userDoc.id,
        from: currentTier,
        to: newTier,
      });
      // ✅ Use correct tier (newTier can be 'free', 'dealer', or 'company')
      const targetTier = newTier === 'free' ? 'free' : newTier;
      await deactivateExcessListings(userDoc.id, targetTier);
    }

    // Audit log
    const eventType = isDowngrade ? 'downgraded' : 'upgraded';
    await logSubscriptionEvent(userDoc.id, eventType, {
      fromTier: currentTier,
      toTier: newTier,
      toStatus: status,
      metadata: { subscriptionId: subscription.id },
    });
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userDoc = await findUserByStripeId(customerId);

  if (!userDoc) return;

  const userId = userDoc.id;
  const previousTier = userDoc.data()?.planTier || 'dealer';

  logger.info('Subscription cancelled', {
    userId,
    subscriptionId: subscription.id,
    previousTier,
  });

  // ✅ CRITICAL: Sync profileType with planTier
  await userDoc.ref.update({
    planTier: 'free', // ✅ Use 'free' instead of 'private' for consistency
    profileType: 'private', // ✅ Sync profileType
    subscriptionStatus: 'cancelled',
    subscriptionEndedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 🔴 CRITICAL: Deactivate excess listings on downgrade
  if (previousTier !== 'free' && previousTier !== 'private') {
    await deactivateExcessListings(userId, 'free'); // ✅ Use 'free' for consistency
  }

  await createNotification(userId, {
    type: 'subscription_cancelled',
    title: 'Абонаментът ви е отменен',
    titleEn: 'Your subscription has been cancelled',
    message: 'Благодарим ви, че използвахте нашата платформа!',
    messageEn: 'Thank you for using our platform!',
  });

  // Audit log
  await logSubscriptionEvent(userId, 'cancelled', {
    fromTier: previousTier,
    toTier: 'free',
    toStatus: 'cancelled',
    metadata: { subscriptionId: subscription.id },
  });
}

async function handleSubscriptionPaused(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userDoc = await findUserByStripeId(customerId);

  if (!userDoc) return;

  logger.info('Subscription paused', { userId: userDoc.id });

  await userDoc.ref.update({
    subscriptionStatus: 'paused',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await createNotification(userDoc.id, {
    type: 'subscription_paused',
    title: 'Абонаментът ви е на пауза',
    titleEn: 'Your subscription is paused',
    message: 'Можете да го възстановите по всяко време.',
    messageEn: 'You can resume it at any time.',
  });
}

// ===== PAYMENT HANDLERS =====
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userDoc = await findUserByStripeId(customerId);

  if (!userDoc) return;

  const amountPaid = (invoice.amount_paid || 0) / 100; // Convert cents to EUR

  logger.info('Payment succeeded', {
    userId: userDoc.id,
    amount: amountPaid,
    invoiceId: invoice.id,
  });

  // Record payment in history
  await db.collection('payments').add({
    userId: userDoc.id,
    stripeCustomerId: customerId,
    invoiceId: invoice.id,
    amount: amountPaid,
    currency: invoice.currency,
    status: 'succeeded',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  await createNotification(userDoc.id, {
    type: 'payment_succeeded',
    title: 'Плащането е успешно ✅',
    titleEn: 'Payment successful ✅',
    message: `Получихме €${amountPaid.toFixed(2)} за вашия абонамент.`,
    messageEn: `We received €${amountPaid.toFixed(2)} for your subscription.`,
  });

  // Audit log
  await logSubscriptionEvent(userDoc.id, 'payment_succeeded', {
    metadata: { invoiceId: invoice.id, amount: amountPaid, currency: invoice.currency },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userDoc = await findUserByStripeId(customerId);

  if (!userDoc) return;

  const attemptCount = invoice.attempt_count || 1;

  logger.warn('Payment failed', {
    userId: userDoc.id,
    invoiceId: invoice.id,
    attemptCount,
  });

  // Record failed payment
  await db.collection('payments').add({
    userId: userDoc.id,
    stripeCustomerId: customerId,
    invoiceId: invoice.id,
    amount: (invoice.amount_due || 0) / 100,
    currency: invoice.currency,
    status: 'failed',
    attemptCount,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update user record
  await userDoc.ref.update({
    paymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
    paymentFailedCount: admin.firestore.FieldValue.increment(1),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notify user with urgency based on attempt count
  const urgency = attemptCount >= 3 ? '🚨' : '⚠️';

  await createNotification(userDoc.id, {
    type: 'payment_failed',
    title: `${urgency} Неуспешно плащане`,
    titleEn: `${urgency} Payment failed`,
    message:
      attemptCount >= 3
        ? 'Моля, актуализирайте платежния метод незабавно!'
        : 'Моля, проверете платежните си данни.',
    messageEn:
      attemptCount >= 3
        ? 'Please update your payment method immediately!'
        : 'Please check your payment details.',
  });

  // If 3+ failed attempts, downgrade immediately
  if (attemptCount >= 3) {
    const currentTier = userDoc.data()?.planTier;
    if (currentTier !== 'private') {
      logger.warn('Auto-downgrading due to multiple payment failures', {
        userId: userDoc.id,
      });

      // ✅ CRITICAL: Sync profileType with planTier
      await userDoc.ref.update({
        planTier: 'free', // ✅ Use 'free' instead of 'private' for consistency
        profileType: 'private', // ✅ Sync profileType
        subscriptionStatus: 'past_due',
        autoDowngradedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Audit log
      await logSubscriptionEvent(userDoc.id, 'auto_downgraded', {
        fromTier: currentTier,
        toTier: 'free',
        toStatus: 'past_due',
        reason: `${attemptCount} consecutive payment failures`,
        metadata: { invoiceId: invoice.id, attemptCount },
      });
    }
  }
}

// ===== REFUND HANDLERS =====
async function handleRefund(charge: Stripe.Charge) {
  const customerId = charge.customer as string;
  const refundAmount = (charge.amount_refunded || 0) / 100;

  const userDoc = await findUserByStripeId(customerId);

  logger.info('Processing refund', {
    customerId,
    amount: refundAmount,
    chargeId: charge.id,
    userId: userDoc?.id,
  });

  // Record refund
  await db.collection('refunds').add({
    userId: userDoc?.id || 'unknown',
    stripeCustomerId: customerId,
    chargeId: charge.id,
    amount: refundAmount,
    currency: charge.currency,
    reason: charge.refunds?.data[0]?.reason || 'requested_by_customer',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (userDoc) {
    await createNotification(userDoc.id, {
      type: 'refund_processed',
      title: 'Възстановяване на сума ✅',
      titleEn: 'Refund processed ✅',
      message: `€${refundAmount.toFixed(2)} бяха възстановени във вашата сметка.`,
      messageEn: `€${refundAmount.toFixed(2)} has been refunded to your account.`,
    });
  }
}

async function handleDispute(dispute: Stripe.Dispute) {
  const chargeId = dispute.charge as string;

  logger.error('Payment dispute created - REQUIRES ATTENTION', {
    disputeId: dispute.id,
    chargeId,
    amount: dispute.amount / 100,
    reason: dispute.reason,
  });

  // Record dispute for admin review
  await db.collection('disputes').add({
    disputeId: dispute.id,
    chargeId,
    amount: dispute.amount / 100,
    currency: dispute.currency,
    reason: dispute.reason,
    status: dispute.status,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notify admins (you should have an admin notification system)
  await db.collection('admin_alerts').add({
    type: 'payment_dispute',
    severity: 'high',
    message: `New payment dispute: €${dispute.amount / 100} - ${dispute.reason}`,
    disputeId: dispute.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ===== NOTIFICATION HELPER =====
interface NotificationData {
  type: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
}

async function createNotification(
  userId: string,
  data: NotificationData
): Promise<void> {
  try {
    await db.collection('notifications').add({
      userId,
      type: data.type,
      title: data.title,
      titleEn: data.titleEn,
      message: data.message,
      messageEn: data.messageEn,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info('Notification created', { userId, type: data.type });
  } catch (error) {
    logger.error('Failed to create notification', { userId, error });
  }
}

// ===== LISTING VISIBILITY ENFORCEMENT =====
/**
 * 🔴 CRITICAL: Deactivate excess listings when user downgrades
 *
 * Plan limits:
 * - private: 3 active listings
 * - dealer: 10 active listings
 * - company: unlimited
 *
 * When downgrading, excess listings are deactivated (not deleted)
 * to allow user to choose which ones to keep.
 */
async function deactivateExcessListings(
  userId: string,
  newPlanTier: 'free' | 'private' | 'dealer' | 'company'
): Promise<void> {
  // ✅ CRITICAL: Use correct limits matching SUBSCRIPTION_PLANS
  // Limits from subscription-plans.ts:
  // - free/private: 10 listings
  // - dealer: 100 listings
  // - company: -1 (unlimited)
  const planLimits: Record<string, number> = {
    private: 10,
    free: 10,
    dealer: 100,
    company: Infinity,
  };

  const limit = planLimits[newPlanTier];

  if (limit === Infinity) {
    logger.info('No listing limit for company plan', { userId });
    return;
  }

  logger.info('Checking listing limits on downgrade', {
    userId,
    newPlanTier,
    limit,
  });

  // Vehicle collections to check
  const vehicleCollections = [
    'passenger_cars',
    'suvs',
    'vans',
    'motorcycles',
    'trucks',
    'buses',
  ];

  let totalActiveListings = 0;
  const allActiveListings: Array<{
    ref: FirebaseFirestore.DocumentReference;
    createdAt: FirebaseFirestore.Timestamp;
  }> = [];

  // Gather all active listings across all collections
  for (const collection of vehicleCollections) {
    try {
      const snapshot = await db
        .collection(collection)
        .where('sellerId', '==', userId)
        .where('isActive', '==', true)
        .where('status', '==', 'active')
        .get();

      snapshot.docs.forEach(doc => {
        allActiveListings.push({
          ref: doc.ref,
          createdAt: doc.data().createdAt || admin.firestore.Timestamp.now(),
        });
      });

      totalActiveListings += snapshot.size;
    } catch (error) {
      logger.error(`Error checking ${collection} listings`, { userId, error });
    }
  }

  logger.info('Current active listings', {
    userId,
    totalActiveListings,
    limit,
  });

  if (totalActiveListings <= limit) {
    logger.info('No excess listings to deactivate', {
      userId,
      totalActiveListings,
      limit,
    });
    return;
  }

  // Sort by createdAt (oldest first) - deactivate newest ones
  allActiveListings.sort((a, b) => {
    return a.createdAt.toMillis() - b.createdAt.toMillis();
  });

  // Keep the oldest ones (up to limit), deactivate the rest
  const listingsToDeactivate = allActiveListings.slice(limit);

  logger.info('Deactivating excess listings', {
    userId,
    totalActive: totalActiveListings,
    limit,
    toDeactivate: listingsToDeactivate.length,
  });

  // Batch deactivate
  const BATCH_SIZE = 500;
  let batch = db.batch();
  let batchCount = 0;

  for (const listing of listingsToDeactivate) {
    batch.update(listing.ref, {
      isActive: false,
      status: 'deactivated_plan_downgrade',
      deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      previousStatus: 'active',
      deactivationReason: 'plan_downgrade',
    });

    batchCount++;

    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    await batch.commit();
  }

  logger.info('Excess listings deactivated successfully', {
    userId,
    deactivatedCount: listingsToDeactivate.length,
  });

  // Notify user about deactivated listings
  await createNotification(userId, {
    type: 'listings_deactivated',
    title: `${listingsToDeactivate.length} обяви бяха деактивирани`,
    titleEn: `${listingsToDeactivate.length} listings have been deactivated`,
    message: `Поради промяна на плана, ${listingsToDeactivate.length} от вашите обяви бяха временно скрити. Можете да ги активирате отново, като изберете кои да запазите.`,
    messageEn: `Due to plan change, ${listingsToDeactivate.length} of your listings have been temporarily hidden. You can reactivate them by choosing which ones to keep.`,
  });
}
