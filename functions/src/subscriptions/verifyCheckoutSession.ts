// functions/src/subscriptions/verifyCheckoutSession.ts
// Cloud Function: Verify Stripe Checkout Session
// Called after successful checkout to retrieve subscription details

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import Stripe from 'stripe';
import { STRIPE_CONFIG } from './config';

const db = getFirestore();

// Initialize Stripe
const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-09-30.clover' as any,
});

/**
 * Verify Checkout Session
 * 
 * Retrieves and verifies a Stripe checkout session
 * Returns subscription details if successful
 * 
 * @param sessionId - The Stripe checkout session ID
 * @returns Subscription details
 */
export const verifyCheckoutSession = onCall<{
  sessionId: string;
}>({ region: 'europe-west1' }, async (request) => {
  const { sessionId } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  logger.info('Verifying checkout session', { userId, sessionId });

  try {
    // 2. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    // 3. Verify session belongs to authenticated user
    const sessionMetadata = session.metadata || {};
    if (sessionMetadata.firebaseUID !== userId) {
      logger.warn('Session does not belong to authenticated user', {
        sessionUserId: sessionMetadata.firebaseUID,
        authenticatedUserId: userId,
      });
      throw new HttpsError(
        'permission-denied',
        'This session does not belong to you'
      );
    }

    // 4. Check if session was completed
    if (session.payment_status !== 'paid') {
      throw new HttpsError(
        'failed-precondition',
        `Payment not completed. Status: ${session.payment_status}`
      );
    }

    // 5. Get subscription details
    const subscription = session.subscription as Stripe.Subscription;
    
    if (!subscription) {
      throw new HttpsError(
        'not-found',
        'No subscription found for this session'
      );
    }

    // 6. Get subscription data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const subscriptionData = userData?.subscription;

    if (!subscriptionData) {
      // This might happen if webhook hasn't processed yet
      logger.warn('Subscription not found in Firestore yet', { userId });
      
      // Return basic info from Stripe
      return {
        success: true,
        subscription: {
          id: subscription.id,
          planTier: sessionMetadata.planTier || 'unknown',
          status: subscription.status,
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
        },
      };
    }

    // 7. Return full subscription details
    logger.info('Checkout session verified successfully', { 
      userId, 
      sessionId,
      subscriptionId: subscription.id 
    });

    return {
      success: true,
      subscription: {
        id: subscriptionData.stripeSubscriptionId,
        planTier: subscriptionData.planTier,
        status: subscriptionData.status,
        currentPeriodEnd: subscriptionData.currentPeriodEnd.toDate().toISOString(),
        currentPeriodStart: subscriptionData.currentPeriodStart?.toDate().toISOString(),
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
      },
    };

  } catch (error: any) {
    logger.error('Checkout session verification failed', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    // Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      throw new HttpsError('not-found', `Invalid session ID: ${error.message}`);
    }

    throw new HttpsError(
      'internal',
      `Failed to verify checkout session: ${error.message}`
    );
  }
});
