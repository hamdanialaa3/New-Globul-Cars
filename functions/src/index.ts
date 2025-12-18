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

// ============================================
// 🧠 AI & Smart Features (Phase 2 Activation)
// وظائف الذكاء الاصطناعي
// ============================================
// Chat with Gemini AI for car advice
export { geminiChat } from './ai/gemini-chat-endpoint';

// AI Price Suggestion based on car details
export { suggestPriceAI } from './ai/price-suggestion-endpoint';

// AI Profile Analysis for trust score
export { analyzeProfileAI } from './ai/profile-analysis-endpoint';

// AI Image Analysis (Vision) works via trigger, ensuring it's imported
import './vision';
