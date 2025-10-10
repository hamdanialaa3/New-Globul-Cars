// functions/src/subscriptions.ts
// B2B Subscription Management for Bulgarian Car Marketplace

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { BigQuery } from '@google-cloud/bigquery';

const db = getFirestore();
const bigquery = new BigQuery();

// Subscription tiers and pricing (EUR)
const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic Analytics',
    price: 49.99,
    features: ['basic_analytics', 'market_trends', 'price_history'],
    limits: { requests_per_month: 1000, concurrent_users: 2 }
  },
  premium: {
    name: 'Premium Analytics',
    price: 149.99,
    features: ['basic_analytics', 'advanced_analytics', 'car_valuation', 'dealer_insights', 'export_data'],
    limits: { requests_per_month: 10000, concurrent_users: 10 }
  },
  enterprise: {
    name: 'Enterprise Analytics',
    price: 499.99,
    features: ['premium_analytics', 'custom_analytics', 'api_access', 'priority_support', 'white_label'],
    limits: { requests_per_month: 100000, concurrent_users: 50 }
  }
};

// Subscription interface
interface B2BSubscription {
  dealerId: string;
  tier: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;
  autoRenew: boolean;
  paymentMethod: string;
  billingInfo: {
    companyName: string;
    address: string;
    taxId?: string;
    contactEmail: string;
  };
  usage: {
    requestsThisMonth: number;
    lastResetDate: FirebaseFirestore.Timestamp;
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Create new B2B subscription
export const createB2BSubscription = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  try {
    const subscriptionData = request.data;
    const { tier, billingInfo, paymentMethod, autoRenew = true } = subscriptionData;

    // Validate tier
    if (!SUBSCRIPTION_TIERS[tier]) {
      throw new Error('Invalid subscription tier');
    }

    // Check if user already has an active subscription
    const existingSubscription = await db.collection('b2bSubscriptions')
      .where('dealerId', '==', request.auth.uid)
      .where('status', 'in', ['active', 'pending'])
      .limit(1)
      .get();

    if (!existingSubscription.empty) {
      throw new Error('User already has an active subscription');
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    const subscription: B2BSubscription = {
      dealerId: request.auth.uid,
      tier,
      status: 'pending', // Will be activated after payment
      startDate: FirebaseFirestore.Timestamp.fromDate(startDate),
      endDate: FirebaseFirestore.Timestamp.fromDate(endDate),
      autoRenew,
      paymentMethod,
      billingInfo,
      usage: {
        requestsThisMonth: 0,
        lastResetDate: FirebaseFirestore.Timestamp.fromDate(startDate)
      },
      createdAt: FirebaseFirestore.Timestamp.fromDate(startDate),
      updatedAt: FirebaseFirestore.Timestamp.fromDate(startDate)
    };

    // Save subscription
    const docRef = await db.collection('b2bSubscriptions').add(subscription);

    // Log subscription creation
    await bigquery.dataset('car_marketplace_analytics').table('subscription_events').insert([{
      event_type: 'subscription_created',
      dealer_id: request.auth.uid,
      tier: tier,
      amount: SUBSCRIPTION_TIERS[tier].price,
      currency: 'EUR',
      timestamp: startDate.toISOString()
    }]);

    logger.info('B2B subscription created', {
      dealerId: request.auth.uid,
      tier,
      subscriptionId: docRef.id
    });

    return {
      success: true,
      subscriptionId: docRef.id,
      tier: SUBSCRIPTION_TIERS[tier],
      status: 'pending',
      message: 'Subscription created. Please complete payment to activate.'
    };

  } catch (error) {
    logger.error('Error creating B2B subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create subscription: ${errorMessage}`);
  }
});

// Get subscription details
export const getB2BSubscription = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  try {
    const subscriptionDoc = await db.collection('b2bSubscriptions')
      .where('dealerId', '==', request.auth.uid)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (subscriptionDoc.empty) {
      return {
        hasSubscription: false,
        message: 'No active subscription found'
      };
    }

    const subscription = subscriptionDoc.docs[0].data() as B2BSubscription;
    const subscriptionId = subscriptionDoc.docs[0].id;

    // Check if subscription is still active
    const now = new Date();
    const endDate = subscription.endDate.toDate();
    const isActive = subscription.status === 'active' && endDate > now;

    return {
      hasSubscription: true,
      subscriptionId,
      tier: subscription.tier,
      status: subscription.status,
      isActive,
      startDate: subscription.startDate.toDate(),
      endDate: endDate,
      autoRenew: subscription.autoRenew,
      billingInfo: subscription.billingInfo,
      usage: subscription.usage,
      features: SUBSCRIPTION_TIERS[subscription.tier].features,
      limits: SUBSCRIPTION_TIERS[subscription.tier].limits
    };

  } catch (error) {
    logger.error('Error getting B2B subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get subscription: ${errorMessage}`);
  }
});

// Cancel subscription
export const cancelB2BSubscription = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  try {
    const subscriptionDoc = await db.collection('b2bSubscriptions')
      .where('dealerId', '==', request.auth.uid)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (subscriptionDoc.empty) {
      throw new Error('No active subscription found');
    }

    const subscriptionRef = subscriptionDoc.docs[0].ref;
    const subscriptionId = subscriptionDoc.docs[0].id;

    // Update subscription status
    await subscriptionRef.update({
      status: 'cancelled',
      updatedAt: FirebaseFirestore.Timestamp.fromDate(new Date())
    });

    // Log cancellation
    await bigquery.dataset('car_marketplace_analytics').table('subscription_events').insert([{
      event_type: 'subscription_cancelled',
      dealer_id: request.auth.uid,
      subscription_id: subscriptionId,
      timestamp: new Date().toISOString()
    }]);

    logger.info('B2B subscription cancelled', {
      dealerId: request.auth.uid,
      subscriptionId
    });

    return {
      success: true,
      message: 'Subscription cancelled successfully'
    };

  } catch (error) {
    logger.error('Error cancelling B2B subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to cancel subscription: ${errorMessage}`);
  }
});

// Upgrade subscription
export const upgradeB2BSubscription = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { newTier } = request.data;

    if (!SUBSCRIPTION_TIERS[newTier]) {
      throw new Error('Invalid subscription tier');
    }

    const subscriptionDoc = await db.collection('b2bSubscriptions')
      .where('dealerId', '==', request.auth.uid)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (subscriptionDoc.empty) {
      throw new Error('No active subscription found');
    }

    const subscriptionRef = subscriptionDoc.docs[0].ref;
    const currentSubscription = subscriptionDoc.docs[0].data() as B2BSubscription;

    // Check if it's actually an upgrade
    const tierOrder = { basic: 1, premium: 2, enterprise: 3 };
    if (tierOrder[newTier] <= tierOrder[currentSubscription.tier]) {
      throw new Error('New tier must be higher than current tier');
    }

    // Update subscription
    await subscriptionRef.update({
      tier: newTier,
      updatedAt: FirebaseFirestore.Timestamp.fromDate(new Date())
    });

    // Log upgrade
    await bigquery.dataset('car_marketplace_analytics').table('subscription_events').insert([{
      event_type: 'subscription_upgraded',
      dealer_id: request.auth.uid,
      old_tier: currentSubscription.tier,
      new_tier: newTier,
      timestamp: new Date().toISOString()
    }]);

    logger.info('B2B subscription upgraded', {
      dealerId: request.auth.uid,
      oldTier: currentSubscription.tier,
      newTier
    });

    return {
      success: true,
      message: `Subscription upgraded to ${newTier}`,
      newTier,
      features: SUBSCRIPTION_TIERS[newTier].features,
      limits: SUBSCRIPTION_TIERS[newTier].limits
    };

  } catch (error) {
    logger.error('Error upgrading B2B subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upgrade subscription: ${errorMessage}`);
  }
});

// Track API usage (called by other functions)
export async function trackAPIUsage(dealerId: string, endpoint: string): Promise<void> {
  try {
    const subscriptionDoc = await db.collection('b2bSubscriptions')
      .where('dealerId', '==', dealerId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (subscriptionDoc.empty) {
      return; // No active subscription, but don't throw error
    }

    const subscriptionRef = subscriptionDoc.docs[0].ref;
    const subscription = subscriptionDoc.docs[0].data() as B2BSubscription;

    // Check monthly reset
    const now = new Date();
    const lastReset = subscription.usage.lastResetDate.toDate();
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

    let requestsThisMonth = subscription.usage.requestsThisMonth;

    if (daysSinceReset >= 30) {
      // Reset counter
      requestsThisMonth = 0;
      await subscriptionRef.update({
        'usage.requestsThisMonth': 0,
        'usage.lastResetDate': FirebaseFirestore.Timestamp.fromDate(now)
      });
    } else {
      // Increment counter
      requestsThisMonth += 1;
      await subscriptionRef.update({
        'usage.requestsThisMonth': requestsThisMonth
      });
    }

    // Log usage
    await bigquery.dataset('car_marketplace_analytics').table('api_usage').insert([{
      dealer_id: dealerId,
      endpoint: endpoint,
      timestamp: now.toISOString(),
      requests_this_month: requestsThisMonth
    }]);

  } catch (error) {
    logger.error('Error tracking API usage:', error);
    // Don't throw error for usage tracking failures
  }
}