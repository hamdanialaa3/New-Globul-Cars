"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhooks = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
const logger = require("firebase-functions/logger");
const db = admin.firestore();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover", // Updated to latest
});
/**
 * Stripe Webhook Handler - Complete Payment Lifecycle Management
 * Handles: subscriptions, payments, refunds, and plan downgrades
 *
 * @since January 6, 2026 - Enhanced with refunds and proper logging
 */
exports.stripeWebhooks = functions
    .region("europe-west1")
    .https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        logger.error("Missing Stripe signature or webhook secret");
        res.status(400).send("Missing signature or secret");
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        logger.error("Webhook signature verification failed", { error: err.message });
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    try {
        logger.info("Processing Stripe event", { type: event.type, id: event.id });
        switch (event.type) {
            // ===== SUBSCRIPTION EVENTS =====
            case "customer.subscription.created": {
                const subscription = event.data.object;
                await handleSubscriptionCreated(subscription);
                break;
            }
            case "customer.subscription.updated": {
                const subscription = event.data.object;
                await handleSubscriptionChange(subscription);
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                await handleSubscriptionCancelled(subscription);
                break;
            }
            case "customer.subscription.paused": {
                const subscription = event.data.object;
                await handleSubscriptionPaused(subscription);
                break;
            }
            // ===== PAYMENT EVENTS =====
            case "invoice.payment_succeeded": {
                const invoice = event.data.object;
                await handlePaymentSucceeded(invoice);
                break;
            }
            case "invoice.payment_failed": {
                const invoice = event.data.object;
                await handlePaymentFailed(invoice);
                break;
            }
            // ===== REFUND EVENTS =====
            case "charge.refunded": {
                const charge = event.data.object;
                await handleRefund(charge);
                break;
            }
            case "charge.dispute.created": {
                const dispute = event.data.object;
                await handleDispute(dispute);
                break;
            }
            default:
                logger.info("Unhandled Stripe event type", { type: event.type });
        }
        res.json({ received: true });
    }
    catch (error) {
        logger.error("Error handling Stripe webhook", { error, eventType: event.type });
        res.status(500).send("Internal Server Error");
    }
});
// ===== HELPER: Find User by Stripe Customer ID =====
async function findUserByStripeId(customerId) {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("stripeId", "==", customerId).limit(1).get();
    if (snapshot.empty) {
        logger.warn("No user found for Stripe Customer", { customerId });
        return null;
    }
    return snapshot.docs[0];
}
// ===== HELPER: Map Stripe Product to Plan Tier =====
function mapProductToPlanTier(productId) {
    // These should match your Stripe Product IDs
    const productMapping = {
        'prod_dealer_monthly': 'dealer',
        'prod_dealer_yearly': 'dealer',
        'prod_company_monthly': 'company',
        'prod_company_yearly': 'company',
        // Add your actual Stripe product IDs here
    };
    return productId ? (productMapping[productId] || 'private') : 'private';
}
// ===== SUBSCRIPTION HANDLERS =====
async function handleSubscriptionCreated(subscription) {
    var _a, _b;
    const customerId = subscription.customer;
    const userDoc = await findUserByStripeId(customerId);
    if (!userDoc)
        return;
    const productId = (_b = (_a = subscription.items.data[0]) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.product;
    const newTier = mapProductToPlanTier(productId);
    logger.info("New subscription created", {
        userId: userDoc.id,
        tier: newTier,
        subscriptionId: subscription.id
    });
    await userDoc.ref.update({
        planTier: newTier,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionStart: admin.firestore.Timestamp.fromMillis(subscription.start_date * 1000),
        subscriptionCurrentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.currentPeriodEnd * 1000),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // Send welcome notification
    await createNotification(userDoc.id, {
        type: 'subscription_activated',
        title: 'Вашият абонамент е активиран! 🎉',
        titleEn: 'Your subscription is now active! 🎉',
        message: `Вие сте ${newTier === 'dealer' ? 'Дилър' : 'Компания'} план.`,
        messageEn: `You are now on the ${newTier} plan.`
    });
}
async function handleSubscriptionChange(subscription) {
    var _a, _b;
    const customerId = subscription.customer;
    const status = subscription.status;
    const userDoc = await findUserByStripeId(customerId);
    if (!userDoc)
        return;
    const currentData = userDoc.data();
    const currentTier = (currentData === null || currentData === void 0 ? void 0 : currentData.planTier) || 'private';
    // If subscription is no longer active, downgrade to free
    if (status !== 'active' && status !== 'trialing') {
        if (currentTier !== 'private') {
            logger.info("Downgrading user due to subscription status", {
                userId: userDoc.id,
                from: currentTier,
                to: 'private',
                reason: status
            });
            await userDoc.ref.update({
                planTier: 'private',
                subscriptionStatus: status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // 🔴 CRITICAL: Deactivate excess listings on downgrade
            await deactivateExcessListings(userDoc.id, 'private');
            await createNotification(userDoc.id, {
                type: 'subscription_downgraded',
                title: 'Абонаментът ви е прекратен',
                titleEn: 'Your subscription has been downgraded',
                message: 'Моля, подновете плащането за да възстановите достъпа.',
                messageEn: 'Please renew your payment to restore access.'
            });
        }
    }
    else {
        // Update subscription details
        const productId = (_b = (_a = subscription.items.data[0]) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.product;
        const newTier = mapProductToPlanTier(productId);
        // Check if this is a downgrade (e.g., company -> dealer)
        const tierPriority = { 'private': 0, 'dealer': 1, 'company': 2 };
        const isDowngrade = tierPriority[newTier] < tierPriority[currentTier];
        await userDoc.ref.update({
            planTier: newTier,
            subscriptionStatus: status,
            subscriptionCurrentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.currentPeriodEnd * 1000),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // 🔴 CRITICAL: Handle tier downgrade (e.g., company -> dealer)
        if (isDowngrade) {
            logger.info("Plan tier downgrade detected", { userId: userDoc.id, from: currentTier, to: newTier });
            await deactivateExcessListings(userDoc.id, newTier);
        }
    }
}
async function handleSubscriptionCancelled(subscription) {
    var _a;
    const customerId = subscription.customer;
    const userDoc = await findUserByStripeId(customerId);
    if (!userDoc)
        return;
    const userId = userDoc.id;
    const previousTier = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.planTier) || 'dealer';
    logger.info("Subscription cancelled", { userId, subscriptionId: subscription.id, previousTier });
    await userDoc.ref.update({
        planTier: 'private',
        subscriptionStatus: 'cancelled',
        subscriptionEndedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // 🔴 CRITICAL: Deactivate excess listings on downgrade
    if (previousTier !== 'private') {
        await deactivateExcessListings(userId, 'private');
    }
    await createNotification(userId, {
        type: 'subscription_cancelled',
        title: 'Абонаментът ви е отменен',
        titleEn: 'Your subscription has been cancelled',
        message: 'Благодарим ви, че използвахте нашата платформа!',
        messageEn: 'Thank you for using our platform!'
    });
}
async function handleSubscriptionPaused(subscription) {
    const customerId = subscription.customer;
    const userDoc = await findUserByStripeId(customerId);
    if (!userDoc)
        return;
    logger.info("Subscription paused", { userId: userDoc.id });
    await userDoc.ref.update({
        subscriptionStatus: 'paused',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await createNotification(userDoc.id, {
        type: 'subscription_paused',
        title: 'Абонаментът ви е на пауза',
        titleEn: 'Your subscription is paused',
        message: 'Можете да го възстановите по всяко време.',
        messageEn: 'You can resume it at any time.'
    });
}
// ===== PAYMENT HANDLERS =====
async function handlePaymentSucceeded(invoice) {
    const customerId = invoice.customer;
    const userDoc = await findUserByStripeId(customerId);
    if (!userDoc)
        return;
    const amountPaid = (invoice.amount_paid || 0) / 100; // Convert cents to EUR
    logger.info("Payment succeeded", {
        userId: userDoc.id,
        amount: amountPaid,
        invoiceId: invoice.id
    });
    // Record payment in history
    await db.collection("payments").add({
        userId: userDoc.id,
        stripeCustomerId: customerId,
        invoiceId: invoice.id,
        amount: amountPaid,
        currency: invoice.currency,
        status: 'succeeded',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    await createNotification(userDoc.id, {
        type: 'payment_succeeded',
        title: 'Плащането е успешно ✅',
        titleEn: 'Payment successful ✅',
        message: `Получихме €${amountPaid.toFixed(2)} за вашия абонамент.`,
        messageEn: `We received €${amountPaid.toFixed(2)} for your subscription.`
    });
}
async function handlePaymentFailed(invoice) {
    var _a;
    const customerId = invoice.customer;
    const userDoc = await findUserByStripeId(customerId);
    if (!userDoc)
        return;
    const attemptCount = invoice.attempt_count || 1;
    logger.warn("Payment failed", {
        userId: userDoc.id,
        invoiceId: invoice.id,
        attemptCount
    });
    // Record failed payment
    await db.collection("payments").add({
        userId: userDoc.id,
        stripeCustomerId: customerId,
        invoiceId: invoice.id,
        amount: (invoice.amount_due || 0) / 100,
        currency: invoice.currency,
        status: 'failed',
        attemptCount,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    // Update user record
    await userDoc.ref.update({
        paymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentFailedCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // Notify user with urgency based on attempt count
    const urgency = attemptCount >= 3 ? '🚨' : '⚠️';
    await createNotification(userDoc.id, {
        type: 'payment_failed',
        title: `${urgency} Неуспешно плащане`,
        titleEn: `${urgency} Payment failed`,
        message: attemptCount >= 3
            ? 'Моля, актуализирайте платежния метод незабавно!'
            : 'Моля, проверете платежните си данни.',
        messageEn: attemptCount >= 3
            ? 'Please update your payment method immediately!'
            : 'Please check your payment details.'
    });
    // If 3+ failed attempts, downgrade immediately
    if (attemptCount >= 3) {
        const currentTier = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.planTier;
        if (currentTier !== 'private') {
            logger.warn("Auto-downgrading due to multiple payment failures", { userId: userDoc.id });
            await userDoc.ref.update({
                planTier: 'private',
                subscriptionStatus: 'past_due',
                autoDowngradedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}
// ===== REFUND HANDLERS =====
async function handleRefund(charge) {
    var _a, _b;
    const customerId = charge.customer;
    const refundAmount = (charge.amount_refunded || 0) / 100;
    const userDoc = await findUserByStripeId(customerId);
    logger.info("Processing refund", {
        customerId,
        amount: refundAmount,
        chargeId: charge.id,
        userId: userDoc === null || userDoc === void 0 ? void 0 : userDoc.id
    });
    // Record refund
    await db.collection("refunds").add({
        userId: (userDoc === null || userDoc === void 0 ? void 0 : userDoc.id) || 'unknown',
        stripeCustomerId: customerId,
        chargeId: charge.id,
        amount: refundAmount,
        currency: charge.currency,
        reason: ((_b = (_a = charge.refunds) === null || _a === void 0 ? void 0 : _a.data[0]) === null || _b === void 0 ? void 0 : _b.reason) || 'requested_by_customer',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    if (userDoc) {
        await createNotification(userDoc.id, {
            type: 'refund_processed',
            title: 'Възстановяване на сума ✅',
            titleEn: 'Refund processed ✅',
            message: `€${refundAmount.toFixed(2)} бяха възстановени във вашата сметка.`,
            messageEn: `€${refundAmount.toFixed(2)} has been refunded to your account.`
        });
    }
}
async function handleDispute(dispute) {
    const chargeId = dispute.charge;
    logger.error("Payment dispute created - REQUIRES ATTENTION", {
        disputeId: dispute.id,
        chargeId,
        amount: dispute.amount / 100,
        reason: dispute.reason
    });
    // Record dispute for admin review
    await db.collection("disputes").add({
        disputeId: dispute.id,
        chargeId,
        amount: dispute.amount / 100,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // Notify admins (you should have an admin notification system)
    await db.collection("admin_alerts").add({
        type: 'payment_dispute',
        severity: 'high',
        message: `New payment dispute: €${dispute.amount / 100} - ${dispute.reason}`,
        disputeId: dispute.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}
async function createNotification(userId, data) {
    try {
        await db.collection("notifications").add({
            userId,
            type: data.type,
            title: data.title,
            titleEn: data.titleEn,
            message: data.message,
            messageEn: data.messageEn,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        logger.info("Notification created", { userId, type: data.type });
    }
    catch (error) {
        logger.error("Failed to create notification", { userId, error });
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
async function deactivateExcessListings(userId, newPlanTier) {
    const planLimits = {
        'private': 3,
        'dealer': 10,
        'company': Infinity
    };
    const limit = planLimits[newPlanTier];
    if (limit === Infinity) {
        logger.info("No listing limit for company plan", { userId });
        return;
    }
    logger.info("Checking listing limits on downgrade", { userId, newPlanTier, limit });
    // Vehicle collections to check
    const vehicleCollections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
    let totalActiveListings = 0;
    const allActiveListings = [];
    // Gather all active listings across all collections
    for (const collection of vehicleCollections) {
        try {
            const snapshot = await db.collection(collection)
                .where('sellerId', '==', userId)
                .where('isActive', '==', true)
                .where('status', '==', 'active')
                .get();
            snapshot.docs.forEach(doc => {
                allActiveListings.push({
                    ref: doc.ref,
                    createdAt: doc.data().createdAt || admin.firestore.Timestamp.now()
                });
            });
            totalActiveListings += snapshot.size;
        }
        catch (error) {
            logger.error(`Error checking ${collection} listings`, { userId, error });
        }
    }
    logger.info("Current active listings", { userId, totalActiveListings, limit });
    if (totalActiveListings <= limit) {
        logger.info("No excess listings to deactivate", { userId, totalActiveListings, limit });
        return;
    }
    // Sort by createdAt (oldest first) - deactivate newest ones
    allActiveListings.sort((a, b) => {
        return a.createdAt.toMillis() - b.createdAt.toMillis();
    });
    // Keep the oldest ones (up to limit), deactivate the rest
    const listingsToDeactivate = allActiveListings.slice(limit);
    logger.info("Deactivating excess listings", {
        userId,
        totalActive: totalActiveListings,
        limit,
        toDeactivate: listingsToDeactivate.length
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
            deactivationReason: 'plan_downgrade'
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
    logger.info("Excess listings deactivated successfully", {
        userId,
        deactivatedCount: listingsToDeactivate.length
    });
    // Notify user about deactivated listings
    await createNotification(userId, {
        type: 'listings_deactivated',
        title: `${listingsToDeactivate.length} обяви бяха деактивирани`,
        titleEn: `${listingsToDeactivate.length} listings have been deactivated`,
        message: `Поради промяна на плана, ${listingsToDeactivate.length} от вашите обяви бяха временно скрити. Можете да ги активирате отново, като изберете кои да запазите.`,
        messageEn: `Due to plan change, ${listingsToDeactivate.length} of your listings have been temporarily hidden. You can reactivate them by choosing which ones to keep.`
    });
}
//# sourceMappingURL=stripe-webhooks.js.map