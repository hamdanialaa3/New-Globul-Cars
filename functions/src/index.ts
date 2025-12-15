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
// NOTE: Stripe functions commented out until STRIPE_SECRET_KEY is configured
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

// ============================================
// 🔢 Auto ID Assignment Functions
// وظائف تعيين المعرفات الرقمية التلقائي
// ============================================
// Automatic numeric ID assignment for users and cars
// Inspired by mobile.de & AutoScout24 URL structure
export { assignUserNumericId } from './auto-id-assignment/assignUserNumericId';
export { assignCarNumericId } from './auto-id-assignment/assignCarNumericId';
