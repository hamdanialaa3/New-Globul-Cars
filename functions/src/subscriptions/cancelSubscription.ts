// functions/src/subscriptions/cancelSubscription.ts
// Cloud Function: Cancel Stripe Subscription

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import Stripe from 'stripe';
import { CancelSubscriptionResult } from './types';
import { STRIPE_CONFIG } from './config';

const db = getFirestore();

// Initialize Stripe lazily to avoid errors during deployment
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe && STRIPE_CONFIG.secretKey) {
    stripe = new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2024-11-20' as const,
    });
  }
  return stripe;
};

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
export const cancelSubscription = onCall<{
  userId: string;
  immediate?: boolean;
}>({ region: 'europe-west1' }, async (request) => {
  const { userId, immediate = false } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // 2. Verify user is canceling their own subscription
  if (request.auth.uid !== userId) {
    logger.warn('User attempted to cancel subscription for different user', {
      authenticatedUid: request.auth.uid,
      requestedUserId: userId,
    });
    throw new HttpsError(
      'permission-denied',
      'Cannot cancel subscription for another user'
    );
  }

  logger.info('Canceling subscription', { userId, immediate });

  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new HttpsError('internal', 'Stripe is not configured');
  }

  try {
    // 3. Get user data
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const subscriptionId = userData?.subscription?.stripeSubscriptionId;

    if (!subscriptionId) {
      throw new HttpsError(
        'failed-precondition',
        'No active subscription found'
      );
    }

    // 4. Cancel subscription in Stripe
    let canceledSubscription: Stripe.Subscription;

    if (immediate) {
      // Cancel immediately
      canceledSubscription = await stripeInstance.subscriptions.cancel(subscriptionId);

      // Immediately update Firestore
      await db.collection('users').doc(userId).update({
        planTier: 'free', // Revert to free at root level
        'subscription.planId': 'free',
        'subscription.planTier': 'free',
        'subscription.status': 'canceled',
        'subscription.cancelAtPeriodEnd': false,
        updatedAt: FieldValue.serverTimestamp(),
      });

      logger.info('Subscription canceled immediately', { userId, subscriptionId });

      const result: CancelSubscriptionResult = {
        success: true,
        message: 'Subscription canceled immediately',
        canceledAt: new Date().toISOString(),
      };

      return result;

    } else {
      // Cancel at period end
      canceledSubscription = await stripeInstance.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update Firestore
      await db.collection('users').doc(userId).update({
        'subscription.cancelAtPeriodEnd': true,
        'subscription.status': 'active', // Still active until period end
        updatedAt: FieldValue.serverTimestamp(),
      });

      const periodEnd = (canceledSubscription as Stripe.Subscription).current_period_end;
      logger.info('Subscription set to cancel at period end', { 
        userId, 
        subscriptionId,
        periodEnd: periodEnd ? new Date(periodEnd * 1000) : null
      });

      const result: CancelSubscriptionResult = {
        success: true,
        message: 'Subscription will cancel at the end of the billing period',
        canceledAt: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString(),
      };

      return result;
    }

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Subscription cancellation failed', err);

    if (error instanceof HttpsError) {
      throw error;
    }

    // Stripe errors
    if (error && typeof error === 'object' && 'type' in error && error.type === 'StripeInvalidRequestError') {
      throw new HttpsError('not-found', 'Subscription not found in Stripe');
    }

    throw new HttpsError(
      'internal',
      `Failed to cancel subscription: ${err.message}`
    );
  }
});
