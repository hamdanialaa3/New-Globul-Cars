"use strict";
/**
 * Create Stripe Payment Intent for Promotions
 * Endpoint: /api/create-promotion-payment-intent
 * Called by: PromotionPurchaseModal.tsx
 *
 * @since January 8, 2026
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPromotionPaymentSucceeded = exports.createPromotionPaymentIntent = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
const logger = require("firebase-functions/logger");
const db = admin.firestore();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover'
});
// Promotion pricing configuration (in cents, EUR)
const PROMOTION_PRICES = {
    vip_badge: 200,
    top_of_page: 500,
    instant_refresh: 100 // 1.00 EUR
};
const PROMOTION_NAMES = {
    vip_badge: { bg: 'VIP Значка', en: 'VIP Badge' },
    top_of_page: { bg: 'Върху Страницата', en: 'Top of Page' },
    instant_refresh: { bg: 'Моментално Обновяване', en: 'Instant Refresh' }
};
/**
 * ✅ CREATE PAYMENT INTENT ENDPOINT
 * Validates user and listing ownership, then creates Stripe payment intent
 */
exports.createPromotionPaymentIntent = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    var _a;
    // =========================
    // 1️⃣ Validate Authentication
    // =========================
    if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { promotionType, listingId } = data;
    // =========================
    // 2️⃣ Validate Input Parameters
    // =========================
    if (!promotionType || !listingId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters: promotionType or listingId');
    }
    if (!PROMOTION_PRICES[promotionType]) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid promotion type: ${promotionType}`);
    }
    const amount = PROMOTION_PRICES[promotionType];
    logger.info('Creating payment intent', {
        userId,
        listingId,
        promotionType,
        amount
    });
    try {
        // =========================
        // 3️⃣ Verify Listing Ownership
        // =========================
        let listingDoc = null;
        let collectionName = '';
        // Check all 6 car collections
        const collections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
        for (const collection of collections) {
            const doc = await db.collection(collection).doc(listingId).get();
            if (doc.exists) {
                const data = doc.data();
                // Check if user owns this listing
                if ((data === null || data === void 0 ? void 0 : data.userId) === userId || (data === null || data === void 0 ? void 0 : data.sellerId) === userId || (data === null || data === void 0 ? void 0 : data.ownerId) === userId) {
                    listingDoc = doc;
                    collectionName = collection;
                    break;
                }
            }
        }
        if (!listingDoc) {
            logger.warn('Listing not found or not owned by user', {
                userId,
                listingId
            });
            throw new functions.https.HttpsError('not-found', 'Listing not found or you do not own this listing');
        }
        const listingData = listingDoc.data();
        // =========================
        // 4️⃣ Verify User Document & Get/Create Stripe Customer
        // =========================
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            logger.warn('User document not found', { userId });
            throw new functions.https.HttpsError('not-found', 'User profile not found');
        }
        const userData = userDoc.data();
        let stripeCustomerId = userData.stripeCustomerId;
        // Create Stripe customer if doesn't exist
        if (!stripeCustomerId) {
            try {
                const customer = await stripe.customers.create({
                    email: userData.email,
                    metadata: {
                        firebaseUID: userId,
                        displayName: userData.displayName || 'Unknown'
                    }
                });
                stripeCustomerId = customer.id;
                // Save customer ID back to Firestore
                await userRef.update({
                    stripeCustomerId: stripeCustomerId,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                logger.info('Created new Stripe customer', {
                    userId,
                    stripeCustomerId
                });
            }
            catch (error) {
                logger.error('Failed to create Stripe customer', {
                    userId,
                    error: error.message
                });
                throw new functions.https.HttpsError('internal', 'Failed to create payment customer');
            }
        }
        // =========================
        // 5️⃣ Create Payment Intent
        // =========================
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'eur',
            customer: stripeCustomerId,
            description: `${PROMOTION_NAMES[promotionType].en} for listing ${listingId}`,
            metadata: {
                userId,
                listingId,
                collectionName,
                promotionType,
                listingTitle: listingData.title || 'Car Listing'
            },
            receipt_email: userData.email,
            automatic_payment_methods: {
                enabled: true
            }
        });
        // =========================
        // 6️⃣ Log Transaction Intent
        // =========================
        const intentRef = await db.collection('users').doc(userId).collection('promotion_intents').add({
            paymentIntentId: paymentIntent.id,
            listingId,
            collectionName,
            promotionType,
            amount,
            currency: 'eur',
            status: 'created',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        logger.info('Payment intent created successfully', {
            userId,
            paymentIntentId: paymentIntent.id,
            amount
        });
        // =========================
        // 7️⃣ Return Response
        // =========================
        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            intentDocId: intentRef.id,
            amount: amount / 100,
            currency: 'eur',
            promotionType,
            promotionName: PROMOTION_NAMES[promotionType].en
        };
    }
    catch (error) {
        // Handle Stripe-specific errors
        if (error instanceof stripe_1.default.errors.StripeError) {
            logger.error('Stripe API error', {
                userId,
                error: error.message,
                type: error.type,
                code: error.code
            });
            throw new functions.https.HttpsError('internal', `Payment service error: ${error.message}`);
        }
        // Handle other errors
        logger.error('Unexpected error creating payment intent', {
            userId,
            error: error.message || String(error)
        });
        throw new functions.https.HttpsError('internal', 'Failed to create payment intent');
    }
});
/**
 * ✅ WEBHOOK HANDLER FOR SUCCESSFUL PROMOTION PURCHASES
 * Updates listing with promotion details when payment succeeds
 */
exports.onPromotionPaymentSucceeded = functions
    .region('europe-west1')
    .firestore
    .document('users/{userId}/promotion_intents/{intentId}')
    .onUpdate(async (change, context) => {
    var _a;
    const intentBefore = change.before.data();
    const intentAfter = change.after.data();
    // Only process when status changes to 'succeeded'
    if ((intentBefore === null || intentBefore === void 0 ? void 0 : intentBefore.status) === (intentAfter === null || intentAfter === void 0 ? void 0 : intentAfter.status) || (intentAfter === null || intentAfter === void 0 ? void 0 : intentAfter.status) !== 'succeeded') {
        return;
    }
    const { userId } = context.params;
    const { listingId, collectionName, promotionType } = intentAfter;
    logger.info('Processing promotion purchase', {
        userId,
        listingId,
        promotionType
    });
    try {
        const listingRef = db.collection(collectionName).doc(listingId);
        const listingDoc = await listingRef.get();
        if (!listingDoc.exists) {
            logger.warn('Listing not found for promotion update', { listingId });
            return;
        }
        // Calculate promotion end date based on type
        const now = new Date();
        const promotionDurations = {
            vip_badge: 7 * 24 * 60 * 60 * 1000,
            top_of_page: 3 * 24 * 60 * 60 * 1000,
            instant_refresh: 0 // Instant (no duration)
        };
        const durationMs = promotionDurations[promotionType] || 0;
        const expiresAt = durationMs > 0 ? new Date(now.getTime() + durationMs) : null;
        // Update listing with promotion
        const promotionsArray = ((_a = listingDoc.data()) === null || _a === void 0 ? void 0 : _a.promotions) || [];
        promotionsArray.push({
            type: promotionType,
            purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(expiresAt) : null,
            userId
        });
        await listingRef.update({
            promotions: promotionsArray,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        logger.info('Promotion applied to listing', {
            listingId,
            promotionType,
            expiresAt
        });
    }
    catch (error) {
        logger.error('Error processing promotion purchase', {
            userId,
            listingId,
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
//# sourceMappingURL=create-payment-intent.js.map