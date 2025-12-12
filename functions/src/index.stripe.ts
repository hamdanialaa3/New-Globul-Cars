// Minimal index.ts for Stripe functions only
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export ONLY Stripe subscription functions
export { createCheckoutSession } from './subscriptions/createCheckoutSession';
export { verifyCheckoutSession } from './subscriptions/verifyCheckoutSession';
export { stripeWebhook } from './subscriptions/stripeWebhook';
export { cancelSubscription } from './subscriptions/cancelSubscription';
