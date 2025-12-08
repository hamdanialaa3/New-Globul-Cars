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
 * Updated: December 2025 - Simplified to 3 plans matching Frontend
 * 
 * IMPORTANT: Update stripePriceId with actual Stripe Price IDs after creating in Stripe Dashboard
 * Create prices at: https://dashboard.stripe.com/test/products
 * 
 * Required Stripe Prices:
 * - Dealer Monthly (€29/month)
 * - Dealer Annual (€300/year)
 * - Company Monthly (€199/month)
 * - Company Annual (€1600/year)
 */
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  // Free Plan - No payment required
  free: {
    id: 'free',
    tier: 'free',
    name: 'Безплатен',
    nameEn: 'Free',
    price: 0,
    currency: 'EUR',
    billingPeriod: 'monthly',
    stripePriceId: '', // No Stripe price for free plan
    features: ['basic_search', 'contact_sellers', 'save_favorites'],
    limits: {
      listings: 3,
      photos: 10,
      videoSupport: false,
      prioritySupport: false,
      analytics: false,
      teamMembers: 0,
    },
  },

  // Dealer Plan - Monthly & Annual billing
  dealer: {
    id: 'dealer',
    tier: 'dealer',
    name: 'Търговец',
    nameEn: 'Dealer',
    price: 29, // Monthly price
    currency: 'EUR',
    billingPeriod: 'monthly',
    stripePriceId: 'price_1SaQJCKdXsQ61OHN50bRgcvP', // Stripe Price ID: €29/month
    features: [
      'dealer_profile',
      'advanced_analytics',
      'priority_support',
      'featured_listings',
      'team_management',
    ],
    limits: {
      listings: 10,
      photos: 30,
      videoSupport: true,
      prioritySupport: true,
      analytics: true,
      teamMembers: 3,
    },
  },

  dealer_annual: {
    id: 'dealer_annual',
    tier: 'dealer',
    name: 'Търговец (Годишен)',
    nameEn: 'Dealer (Annual)',
    price: 300, // Annual price (save €48)
    currency: 'EUR',
    billingPeriod: 'yearly',
    stripePriceId: 'price_1SaQM6KdXsQ61OHNo98fp2eq', // Stripe Price ID: €300/year
    features: [
      'dealer_profile',
      'advanced_analytics',
      'priority_support',
      'featured_listings',
      'team_management',
    ],
    limits: {
      listings: 10,
      photos: 30,
      videoSupport: true,
      prioritySupport: true,
      analytics: true,
      teamMembers: 3,
    },
  },

  // Company Plan - Monthly & Annual billing
  company: {
    id: 'company',
    tier: 'company',
    name: 'Компания',
    nameEn: 'Company',
    price: 199, // Monthly price
    currency: 'EUR',
    billingPeriod: 'monthly',
    stripePriceId: 'price_1SaQPaKdXsQ61OHNrGnilxkL', // Stripe Price ID: €199/month
    features: [
      'company_profile',
      'unlimited_listings',
      'advanced_analytics',
      'priority_support',
      'featured_listings',
      'team_management',
      'api_access',
      'multi_location',
      'dedicated_support',
    ],
    limits: {
      listings: -1, // Unlimited
      photos: 50,
      videoSupport: true,
      prioritySupport: true,
      analytics: true,
      teamMembers: 10,
    },
  },

  company_annual: {
    id: 'company_annual',
    tier: 'company',
    name: 'Компания (Годишна)',
    nameEn: 'Company (Annual)',
    price: 1589, // Annual price (save €799)
    currency: 'EUR',
    billingPeriod: 'yearly',
    stripePriceId: 'price_1SaQRIKdXsQ61OHNTQyY67or', // Stripe Price ID: €1589/year
    features: [
      'company_profile',
      'unlimited_listings',
      'advanced_analytics',
      'priority_support',
      'featured_listings',
      'team_management',
      'api_access',
      'multi_location',
      'dedicated_support',
    ],
    limits: {
      listings: -1, // Unlimited
      photos: 50,
      videoSupport: true,
      prioritySupport: true,
      analytics: true,
      teamMembers: 10,
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
