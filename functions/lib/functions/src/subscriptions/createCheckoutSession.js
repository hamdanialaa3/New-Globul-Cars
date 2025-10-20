"use strict";
// functions/src/subscriptions/createCheckoutSession.ts
// Cloud Function: Create Stripe Checkout Session
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
exports.createCheckoutSession = void 0;
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
/**
 * Create Stripe Checkout Session
 *
 * Creates a Stripe checkout session for subscription purchase
 *
 * @param userId - The user ID subscribing
 * @param planId - The subscription plan ID
 * @param successUrl - Optional custom success URL
 * @param cancelUrl - Optional custom cancel URL
 *
 * @returns CheckoutSessionResult with sessionId and checkoutUrl
 */
exports.createCheckoutSession = (0, https_1.onCall)(async (request) => {
    const { userId, planId, successUrl, cancelUrl } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // 2. Verify user is authenticated user (not impersonating)
    if (request.auth.uid !== userId) {
        logger.warn('User attempted to create checkout for different user', {
            authenticatedUid: request.auth.uid,
            requestedUserId: userId,
        });
        throw new https_1.HttpsError('permission-denied', 'Cannot create checkout session for another user');
    }
    // 3. Validate plan
    if (!(0, config_1.validatePaidPlan)(planId)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid or free plan: ${planId}`);
    }
    const plan = (0, config_1.getPlanById)(planId);
    if (!plan.stripePriceId) {
        throw new https_1.HttpsError('failed-precondition', 'Stripe Price ID not configured for this plan');
    }
    logger.info('Creating checkout session', { userId, planId });
    try {
        // 4. Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        const userEmail = (userData === null || userData === void 0 ? void 0 : userData.email) || request.auth.token.email;
        // 5. Create or get Stripe customer
        let stripeCustomerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
        if (!stripeCustomerId) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    firebaseUID: userId,
                    displayName: (userData === null || userData === void 0 ? void 0 : userData.displayName) || '',
                },
            });
            stripeCustomerId = customer.id;
            // Save customer ID to Firestore
            await db.collection('users').doc(userId).update({
                stripeCustomerId,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            logger.info('Created new Stripe customer', { userId, stripeCustomerId });
        }
        // 6. Create Checkout Session
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
            success_url: successUrl || `${config_1.STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || config_1.STRIPE_CONFIG.cancelUrl,
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        const result = {
            success: true,
            sessionId: session.id,
            checkoutUrl: session.url || '',
            message: 'Checkout session created successfully',
        };
        return result;
    }
    catch (error) {
        logger.error('Checkout session creation failed', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        // Stripe errors
        if (error.type === 'StripeCardError') {
            throw new https_1.HttpsError('invalid-argument', `Payment error: ${error.message}`);
        }
        throw new https_1.HttpsError('internal', `Failed to create checkout session: ${error.message}`);
    }
});
//# sourceMappingURL=createCheckoutSession.js.map