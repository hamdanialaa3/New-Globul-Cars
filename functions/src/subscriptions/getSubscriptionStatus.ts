// functions/src/subscriptions/getSubscriptionStatus.ts
// Cloud Function: Get Current Subscription Status
// Returns active subscription info for a user

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const db = getFirestore();

export const getSubscriptionStatus = onCall<{
  userId?: string;
}>({ region: 'europe-west1' }, async (request) => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.data?.userId || request.auth.uid;

  // Prevent users from viewing other users' subscriptions
  if (userId !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'You can only view your own subscription');
  }

  logger.info('Fetching subscription status', { userId });

  try {
    // 1) Primary: read our app's users/{uid}.subscription
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const subscriptionData = userData?.subscription;

    if (subscriptionData) {
      const subscription = {
        id: subscriptionData.id,
        planTier: subscriptionData.planTier || 'unknown',
        status: subscriptionData.status,
        currentPeriodStart: subscriptionData.currentPeriodStart
          ? new Date(subscriptionData.currentPeriodStart).toISOString()
          : undefined,
        currentPeriodEnd: subscriptionData.currentPeriodEnd
          ? new Date(subscriptionData.currentPeriodEnd).toISOString()
          : undefined,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
      };

      logger.info('Subscription status retrieved (users.subscription)', { userId, status: subscription.status });
      return { success: true, subscription };
    }

    // 2) Fallback: read Firebase Stripe Payments extension data
    //    Path: customers/{uid} doc with field `stripeId`, and subcollection `subscriptions`
    const customerDoc = await db.collection('customers').doc(userId).get();
    if (customerDoc.exists) {
      const stripeId = customerDoc.data()?.stripeId;
      // Read subscriptions subcollection, pick the most relevant (active > trialing > past_due)
      const subsSnap = await db.collection('customers').doc(userId).collection('subscriptions').get();

      if (!subsSnap.empty) {
        // Prefer active subscription
        const subs = subsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        const pick = (statuses: string[]) => subs.find(s => statuses.includes(s.status));
        const chosen = pick(['active']) || pick(['trialing']) || pick(['past_due']) || subs[0];

        if (chosen) {
          const periodStart = chosen.current_period_start?.toDate?.() || (chosen.current_period_start ? new Date(chosen.current_period_start) : undefined);
          const periodEnd = chosen.current_period_end?.toDate?.() || (chosen.current_period_end ? new Date(chosen.current_period_end) : undefined);

          const subscription = {
            id: chosen.id,
            planTier: chosen.items?.[0]?.price?.nickname || 'unknown',
            status: chosen.status,
            currentPeriodStart: periodStart ? periodStart.toISOString() : undefined,
            currentPeriodEnd: periodEnd ? periodEnd.toISOString() : undefined,
            cancelAtPeriodEnd: !!chosen.cancel_at_period_end,
          };

          logger.info('Subscription status retrieved (extension/customers)', { userId, stripeId, status: subscription.status });
          return { success: true, subscription };
        }
      }
    }

    // 3) Nothing found
    logger.info('No subscription found in users or extension data', { userId });
    return { success: true, subscription: null };
  } catch (error: any) {
    logger.error('Error fetching subscription status', { userId, error: error.message });
    throw new HttpsError('internal', 'Failed to fetch subscription status');
  }
});
