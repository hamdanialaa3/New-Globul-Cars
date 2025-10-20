"use strict";
// functions/src/subscriptions/stripeWebhook.ts
// Stripe Webhook Handler - Process subscription events
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("./config");
const db = (0, firestore_1.getFirestore)();
// Initialize Stripe
const stripe = new stripe_1.default(config_1.STRIPE_CONFIG.secretKey, {
    apiVersion: '2025-09-30.clover',
});
// Helper to safely access Stripe properties that may not be in type definitions
const getSubscriptionPeriod = (sub) => ({
    start: sub.current_period_start,
    end: sub.current_period_end,
});
const getInvoiceSubscription = (invoice) => {
    return invoice.subscription;
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
exports.stripeWebhook = (0, https_1.onRequest)(async (request, response) => {
    const sig = request.headers['stripe-signature'];
    if (!sig) {
        logger.error('No Stripe signature in webhook');
        response.status(400).send('No signature');
        return;
    }
    let event;
    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(request.rawBody, sig, config_1.STRIPE_CONFIG.webhookSecret);
    }
    catch (err) {
        logger.error('Webhook signature verification failed', err);
        response.status(400).send(`Webhook Error: ${err.message}`);
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
                await handleCheckoutCompleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            default:
                logger.info(`Unhandled event type: ${event.type}`);
        }
        response.json({ received: true });
    }
    catch (error) {
        logger.error('Error processing webhook', error);
        response.status(500).send('Webhook processing failed');
    }
});
/**
 * Handle checkout.session.completed
 * Activate subscription when payment successful
 */
async function handleCheckoutCompleted(session) {
    var _a, _b, _c;
    const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.firebaseUID;
    const planId = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.planId;
    const planTier = (_c = session.metadata) === null || _c === void 0 ? void 0 : _c.planTier;
    if (!userId || !planId) {
        logger.error('Missing metadata in checkout session', { sessionId: session.id });
        return;
    }
    logger.info('Processing checkout completion', { userId, planId, sessionId: session.id });
    try {
        // Get subscription details
        const subscriptionId = session.subscription;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        // Update user subscription in Firestore
        const period = getSubscriptionPeriod(subscription);
        await db.collection('users').doc(userId).update({
            'subscription.planId': planId,
            'subscription.planTier': planTier,
            'subscription.status': 'active',
            'subscription.stripeCustomerId': session.customer,
            'subscription.stripeSubscriptionId': subscriptionId,
            'subscription.stripePriceId': subscription.items.data[0].price.id,
            'subscription.currentPeriodStart': firestore_1.FieldValue.serverTimestamp(),
            'subscription.currentPeriodEnd': period.end ? new Date(period.end * 1000) : firestore_1.FieldValue.serverTimestamp(),
            'subscription.cancelAtPeriodEnd': false,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // Update checkout session status
        await db.collection('checkoutSessions')
            .where('sessionId', '==', session.id)
            .get()
            .then((snapshot) => {
            snapshot.forEach((doc) => {
                doc.ref.update({
                    status: 'completed',
                    completedAt: firestore_1.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        logger.error('Error handling checkout completion', error);
        throw error;
    }
}
/**
 * Handle invoice.payment_succeeded
 * Renew subscription when payment successful
 */
async function handlePaymentSucceeded(invoice) {
    const customerId = invoice.customer;
    const subscriptionId = getInvoiceSubscription(invoice);
    if (!subscriptionId) {
        logger.info('Invoice not related to subscription', { invoiceId: invoice.id });
        return;
    }
    logger.info('Processing payment success', { customerId, subscriptionId });
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
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const period = getSubscriptionPeriod(subscription);
        // Update subscription period
        await db.collection('users').doc(userId).update({
            'subscription.status': 'active',
            'subscription.currentPeriodStart': period.start ? new Date(period.start * 1000) : firestore_1.FieldValue.serverTimestamp(),
            'subscription.currentPeriodEnd': period.end ? new Date(period.end * 1000) : firestore_1.FieldValue.serverTimestamp(),
            'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Subscription renewed', { userId, subscriptionId });
    }
    catch (error) {
        logger.error('Error handling payment success', error);
        throw error;
    }
}
/**
 * Handle customer.subscription.deleted
 * Cancel subscription
 */
async function handleSubscriptionDeleted(subscription) {
    const customerId = subscription.customer;
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
            'subscription.planId': 'free',
            'subscription.planTier': 'free',
            'subscription.status': 'canceled',
            'subscription.cancelAtPeriodEnd': false,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        logger.error('Error handling subscription deletion', error);
        throw error;
    }
}
/**
 * Handle customer.subscription.updated
 * Update subscription details
 */
async function handleSubscriptionUpdated(subscription) {
    const customerId = subscription.customer;
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
            'subscription.currentPeriodStart': period.start ? new Date(period.start * 1000) : firestore_1.FieldValue.serverTimestamp(),
            'subscription.currentPeriodEnd': period.end ? new Date(period.end * 1000) : firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Subscription updated', { userId, subscriptionId, status: subscription.status });
    }
    catch (error) {
        logger.error('Error handling subscription update', error);
        throw error;
    }
}
/**
 * Handle invoice.payment_failed
 * Mark subscription as past_due
 */
async function handlePaymentFailed(invoice) {
    const customerId = invoice.customer;
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
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        logger.error('Error handling payment failure', error);
        throw error;
    }
}
//# sourceMappingURL=stripeWebhook.js.map