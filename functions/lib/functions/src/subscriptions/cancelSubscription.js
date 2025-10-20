"use strict";
// functions/src/subscriptions/cancelSubscription.ts
// Cloud Function: Cancel Stripe Subscription
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
exports.cancelSubscription = void 0;
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
 * Cancel Stripe Subscription
 *
 * Cancels user's active subscription
 *
 * @param userId - The user ID to cancel subscription for
 * @param immediate - If true, cancel immediately. If false, cancel at period end
 *
 * @returns CancelSubscriptionResult with success status
 */
exports.cancelSubscription = (0, https_1.onCall)(async (request) => {
    var _a;
    const { userId, immediate = false } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // 2. Verify user is canceling their own subscription
    if (request.auth.uid !== userId) {
        logger.warn('User attempted to cancel subscription for different user', {
            authenticatedUid: request.auth.uid,
            requestedUserId: userId,
        });
        throw new https_1.HttpsError('permission-denied', 'Cannot cancel subscription for another user');
    }
    logger.info('Canceling subscription', { userId, immediate });
    try {
        // 3. Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        const subscriptionId = (_a = userData === null || userData === void 0 ? void 0 : userData.subscription) === null || _a === void 0 ? void 0 : _a.stripeSubscriptionId;
        if (!subscriptionId) {
            throw new https_1.HttpsError('failed-precondition', 'No active subscription found');
        }
        // 4. Cancel subscription in Stripe
        let canceledSubscription;
        if (immediate) {
            // Cancel immediately
            canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
            // Immediately update Firestore
            await db.collection('users').doc(userId).update({
                'subscription.planId': 'free',
                'subscription.planTier': 'free',
                'subscription.status': 'canceled',
                'subscription.cancelAtPeriodEnd': false,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            logger.info('Subscription canceled immediately', { userId, subscriptionId });
            const result = {
                success: true,
                message: 'Subscription canceled immediately',
                canceledAt: firestore_1.FieldValue.serverTimestamp(),
            };
            return result;
        }
        else {
            // Cancel at period end
            canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
            // Update Firestore
            await db.collection('users').doc(userId).update({
                'subscription.cancelAtPeriodEnd': true,
                'subscription.status': 'active', // Still active until period end
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            const periodEnd = canceledSubscription.current_period_end;
            logger.info('Subscription set to cancel at period end', {
                userId,
                subscriptionId,
                periodEnd: periodEnd ? new Date(periodEnd * 1000) : null
            });
            const result = {
                success: true,
                message: 'Subscription will cancel at the end of the billing period',
                canceledAt: periodEnd ? new Date(periodEnd * 1000) : new Date(),
            };
            return result;
        }
    }
    catch (error) {
        logger.error('Subscription cancellation failed', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        // Stripe errors
        if (error.type === 'StripeInvalidRequestError') {
            throw new https_1.HttpsError('not-found', 'Subscription not found in Stripe');
        }
        throw new https_1.HttpsError('internal', `Failed to cancel subscription: ${error.message}`);
    }
});
//# sourceMappingURL=cancelSubscription.js.map