// Firebase Cloud Functions Entry Point
// TEMPORARY: Stripe Functions Only
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// ============================================
// Subscription & Billing Functions (Stripe Integration)
// وظائف الاشتراكات والفواتير (تكامل Stripe)
// ============================================
export { createCheckoutSession } from './subscriptions/createCheckoutSession';
export { verifyCheckoutSession } from './subscriptions/verifyCheckoutSession';
export { stripeWebhook } from './subscriptions/stripeWebhook';
export { cancelSubscription } from './subscriptions/cancelSubscription';
export { getSubscriptionStatus } from './subscriptions/getSubscriptionStatus';

// ============================================
// Verification Functions
// وظائف التحقق
// ============================================
export { verifyEIK } from './verification/verifyEIK';
