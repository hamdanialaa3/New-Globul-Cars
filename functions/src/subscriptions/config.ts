// functions/src/subscriptions/config.ts
// Stripe configuration and subscription plans

import { SubscriptionPlan } from './types';

/**
 * Stripe Configuration
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - STRIPE_SECRET_KEY: Stripe secret key (sk_live_... or sk_test_...)
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret (whsec_...)
 * - STRIPE_PUBLISHABLE_KEY: Public key for frontend (pk_live_... or pk_test_...)
 * 
 * Set in Firebase:
 * firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."
 */

export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'bgn', // Bulgarian Lev
  successUrl: process.env.FRONTEND_URL + '/billing/success',
  cancelUrl: process.env.FRONTEND_URL + '/billing/canceled',
};

/**
 * Subscription Plans
 * 
 * Maps to BillingService.ts plans on frontend
 * 
 * IMPORTANT: Update stripePriceId with actual Stripe Price IDs after creating in Stripe Dashboard
 * Create prices at: https://dashboard.stripe.com/test/products
 */
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  // Private User Plans
  free: {
    id: 'free',
    tier: 'free',
    name: 'Безплатен',
    nameEn: 'Free',
    price: 0,
    currency: 'BGN',
    billingPeriod: 'monthly',
    stripePriceId: '', // No Stripe price for free plan
    features: ['basic_search', 'contact_sellers', 'save_favorites'],
    limits: {
      listings: 1,
      photos: 5,
      videoSupport: false,
      prioritySupport: false,
      analytics: false,
      teamMembers: 0,
    },
  },

  basic: {
    id: 'basic',
    tier: 'basic',
    name: 'Базов',
    nameEn: 'Basic',
    price: 9.99,
    currency: 'BGN',
    billingPeriod: 'monthly',
    stripePriceId: 'price_XXXXXXXXXX', // TODO: Replace with actual Stripe Price ID
    features: [
      'basic_search',
      'contact_sellers',
      'save_favorites',
      'ad_free',
      'email_support',
    ],
    limits: {
      listings: 3,
      photos: 10,
      videoSupport: false,
      prioritySupport: false,
      analytics: false,
      teamMembers: 0,
    },
  },

  pro: {
    id: 'pro',
    tier: 'pro',
    name: 'Про',
    nameEn: 'Pro',
    price: 19.99,
    currency: 'BGN',
    billingPeriod: 'monthly',
    stripePriceId: 'price_YYYYYYYYYY', // TODO: Replace with actual Stripe Price ID
    features: [
      'basic_search',
      'contact_sellers',
      'save_favorites',
      'ad_free',
      'priority_support',
      'advanced_analytics',
      'price_alerts',
    ],
    limits: {
      listings: 10,
      photos: 20,
      videoSupport: true,
      prioritySupport: true,
      analytics: true,
      teamMembers: 0,
    },
  },

  // Dealer Plans
  dealer_basic: {
    id: 'dealer_basic',
    tier: 'dealer_basic',
    name: 'Търговец Базов',
    nameEn: 'Dealer Basic',
    price: 49.99,
    currency: 'BGN',
    billingPeriod: 'monthly',
    stripePriceId: 'price_ZZZZZZZZZZ', // TODO: Replace with actual Stripe Price ID
    features: [
      'unlimited_listings',
      'dealer_profile',
      'advanced_analytics',
      'priority_support',
      'featured_listings',
      'custom_branding',
    ],
    limits: {
      listings: 50,
      photos: 30,
      videoSupport: true,
      prioritySupport: true,
      analytics: true,
      teamMembers: 2,
    },
  },

  dealer_premium: {
    id: 'dealer_premium',
    tier: 'dealer_premium',
    name: 'Търговец Премиум',
    nameEn: 'Dealer Premium',
    price: 99.99,
    currency: 'BGN',
    billingPeriod: 'monthly',
    stripePriceId: 'price_AAAAAAAAAA', // TODO: Replace with actual Stripe Price ID
    features: [
      'unlimited_listings',
      'dealer_profile',
      'advanced_analytics',
      'priority_support',
      'featured_listings',
      'custom_branding',
      'api_access',
      'white_label',
      'dedicated_manager',
    ],
    limits: {
      listings: 200,
      photos: 50,
      videoSupport: true,
      prioritySupport: true,
      analytics: true,
      teamMembers: 5,
    },
  },

  // Company Plans
  enterprise: {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Предприятие',
    nameEn: 'Enterprise',
    price: 299.99,
    currency: 'BGN',
    billingPeriod: 'monthly',
    stripePriceId: 'price_BBBBBBBBBB', // TODO: Replace with actual Stripe Price ID
    features: [
      'unlimited_listings',
      'company_profile',
      'advanced_analytics',
      'priority_support',
      'featured_listings',
      'custom_branding',
      'api_access',
      'white_label',
      'dedicated_manager',
      'multi_location',
      'custom_integration',
    ],
    limits: {
      listings: -1, // Unlimited
      photos: 100,
      videoSupport: true,
      prioritySupport: true,
      analytics: true,
      teamMembers: 20,
    },
  },
};

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS[planId] || null;
}

/**
 * Get plan by Stripe Price ID
 */
export function getPlanByStripePriceId(priceId: string): SubscriptionPlan | null {
  return Object.values(SUBSCRIPTION_PLANS).find(
    (plan) => plan.stripePriceId === priceId
  ) || null;
}

/**
 * Validate plan exists and is not free
 */
export function validatePaidPlan(planId: string): boolean {
  const plan = getPlanById(planId);
  return plan !== null && plan.price > 0;
}
