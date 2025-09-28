// Compiled version of src/subscriptions.ts with CORS enabled
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { logger } = require('firebase-functions');

// Initialize Firebase Admin (check if already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = getFirestore();

// Subscription tier definitions
const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic',
    price: 29.99,
    features: ['Up to 100 requests/month', 'Basic analytics', 'Email support'],
    limits: {
      requests_per_month: 100,
      concurrent_users: 1
    }
  },
  premium: {
    name: 'Premium', 
    price: 89.99,
    features: ['Up to 1000 requests/month', 'Advanced analytics', 'Priority support'],
    limits: {
      requests_per_month: 1000,
      concurrent_users: 5
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 299.99,
    features: ['Unlimited requests', 'Full analytics suite', 'Dedicated support'],
    limits: {
      requests_per_month: -1,
      concurrent_users: -1
    }
  }
};

// Get subscription details (with CORS enabled)
exports.getB2BSubscription = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  try {
    const subscriptionDoc = await db.collection('b2bSubscriptions').doc(request.auth.uid).get();
    
    if (!subscriptionDoc.exists) {
      return {
        hasSubscription: false,
        tier: null,
        status: null,
        expiresAt: null
      };
    }

    const subscription = subscriptionDoc.data();
    const now = new Date();
    const expiresAt = subscription.expiresAt.toDate();
    
    return {
      hasSubscription: true,
      tier: subscription.tier,
      status: subscription.status,
      expiresAt: expiresAt,
      isActive: subscription.status === 'active' && expiresAt > now,
      features: SUBSCRIPTION_TIERS[subscription.tier]?.features || [],
      limits: SUBSCRIPTION_TIERS[subscription.tier]?.limits || {}
    };
  } catch (error) {
    logger.error('Error getting subscription:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    throw new Error(`Failed to get subscription: ${errorMessage}`);
  }
});

// Create new B2B subscription (with CORS enabled)
exports.createB2BSubscription = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  try {
    const subscriptionData = request.data;
    const { tier, billingInfo, paymentMethod, autoRenew = true } = subscriptionData;

    if (!SUBSCRIPTION_TIERS[tier]) {
      throw new Error(`Invalid subscription tier: ${tier}`);
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const subscription = {
      dealerId: request.auth.uid,
      tier: tier,
      status: 'active',
      expiresAt: expiresAt,
      billingInfo: billingInfo,
      paymentMethod: paymentMethod,
      autoRenew: autoRenew,
      createdAt: new Date(),
      amount: SUBSCRIPTION_TIERS[tier].price,
      currency: 'EUR'
    };

    await db.collection('b2bSubscriptions').doc(request.auth.uid).set(subscription);

    return {
      success: true,
      subscriptionId: request.auth.uid,
      tier: SUBSCRIPTION_TIERS[tier],
      expiresAt: expiresAt
    };
  } catch (error) {
    logger.error('Error creating subscription:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    throw new Error(`Failed to create subscription: ${errorMessage}`);
  }
});

// Cancel subscription (with CORS enabled)
exports.cancelB2BSubscription = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  try {
    const subscriptionDoc = await db.collection('b2bSubscriptions').doc(request.auth.uid).get();
    
    if (!subscriptionDoc.exists) {
      throw new Error('No subscription found');
    }

    await db.collection('b2bSubscriptions').doc(request.auth.uid).update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    return {
      success: true,
      message: 'Subscription cancelled successfully'
    };
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    throw new Error(`Failed to cancel subscription: ${errorMessage}`);
  }
});

// Upgrade subscription (with CORS enabled) 
exports.upgradeB2BSubscription = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { newTier } = request.data;

    if (!SUBSCRIPTION_TIERS[newTier]) {
      throw new Error(`Invalid subscription tier: ${newTier}`);
    }

    const subscriptionDoc = await db.collection('b2bSubscriptions').doc(request.auth.uid).get();
    
    if (!subscriptionDoc.exists) {
      throw new Error('No existing subscription found');
    }

    const currentSubscription = subscriptionDoc.data();
    const tierOrder = { basic: 1, premium: 2, enterprise: 3 };

    if (tierOrder[newTier] <= tierOrder[currentSubscription.tier]) {
      throw new Error('Can only upgrade to a higher tier');
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await db.collection('b2bSubscriptions').doc(request.auth.uid).update({
      tier: newTier,
      upgradedAt: new Date(),
      expiresAt: expiresAt,
      amount: SUBSCRIPTION_TIERS[newTier].price
    });

    return {
      success: true,
      message: 'Subscription upgraded successfully',
      newTier: newTier,
      features: SUBSCRIPTION_TIERS[newTier].features,
      limits: SUBSCRIPTION_TIERS[newTier].limits
    };
  } catch (error) {
    logger.error('Error upgrading subscription:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    throw new Error(`Failed to upgrade subscription: ${errorMessage}`);
  }
});