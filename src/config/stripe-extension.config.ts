// src/config/stripe-extension.config.ts
// Stripe Extension Configuration
// Maps Globul Cars plans to Stripe Price IDs

/**
 * Stripe Price IDs for Globul Cars Subscriptions
 * 
 * These IDs are from your Stripe Dashboard (Test Mode):
 * https://dashboard.stripe.com/test/products
 */
export const STRIPE_PRICE_IDS = {
  // DEALER PLAN (€27.78/month or €278/year - Live)
  // ✅ Prices match SUBSCRIPTION_PLANS.dealer.price
  dealer: {
    monthly: 'price_1Sf7iU3EuPQhDyrBtP0bEc4B',
    annual: 'price_1Sf7l83EuPQhDyrB3Z3zIpZv',
  },

  // COMPANY PLAN (€137.88/month or €1288/year - Live)
  // ✅ Prices match SUBSCRIPTION_PLANS.company.price
  company: {
    monthly: 'price_1Sf7oK3EuPQhDyrBQ6duG8a',
    annual: 'price_1Sf7pE3EuPQhDyrBfAdjEDFi',
  },
} as const;

/**
 * Stripe Product IDs
 */
export const STRIPE_PRODUCT_IDS = {
  dealer: 'prod_TcMRPH1acbKwsJ',   // Mobilebg Cars - Dealer
  company: 'prod_TcMX8XZcmlddRd', // MobileBG Cars - Company
} as const;

/**
 * Helper: Get Stripe Price ID from plan tier and billing interval
 * 
 * @param planTier - 'dealer' or 'company'
 * @param interval - 'monthly' or 'annual'
 * @returns Stripe Price ID
 */
export function getStripePriceId(
  planTier: 'dealer' | 'company',
  interval: 'monthly' | 'annual'
): string {
  const priceId = STRIPE_PRICE_IDS[planTier]?.[interval];

  if (!priceId) {
    throw new Error(`No Stripe Price ID found for: ${planTier}-${interval}`);
  }

  return priceId;
}

/**
 * Helper: Get plan details from Stripe Price ID (reverse lookup)
 * 
 * @param priceId - Stripe Price ID
 * @returns Plan tier and interval, or null if not found
 */
export function getPlanFromPriceId(priceId: string): {
  tier: 'dealer' | 'company';
  interval: 'monthly' | 'annual';
} | null {
  // Reverse lookup map
  const priceMap: Record<string, { tier: 'dealer' | 'company'; interval: 'monthly' | 'annual' }> = {
    [STRIPE_PRICE_IDS.dealer.monthly]: { tier: 'dealer', interval: 'monthly' },
    [STRIPE_PRICE_IDS.dealer.annual]: { tier: 'dealer', interval: 'annual' },
    [STRIPE_PRICE_IDS.company.monthly]: { tier: 'company', interval: 'monthly' },
    [STRIPE_PRICE_IDS.company.annual]: { tier: 'company', interval: 'annual' },
  };

  return priceMap[priceId] || null;
}

/**
 * Firestore Extension Configuration
 * 
 * The firestore-stripe-payments extension uses these collections:
 * - customers/{userId}/checkout_sessions - Checkout sessions
 * - customers/{userId}/subscriptions - Active subscriptions
 * - customers/{userId}/payments - Payment history
 * - products - Stripe products (synced from Stripe)
 * - products/{productId}/prices - Stripe prices
 */
export const STRIPE_COLLECTIONS = {
  customers: 'customers',
  products: 'products',
  prices: 'prices',
} as const;

/**
 * Stripe Extension Cloud Functions
 */
export const STRIPE_FUNCTIONS = {
  createCheckoutSession: 'ext-firestore-stripe-payments-createCheckoutSession',
  createPortalLink: 'ext-firestore-stripe-payments-createPortalLink',
  handleWebhookEvents: 'ext-firestore-stripe-payments-handleWebhookEvents',
} as const;

/**
 * Success/Cancel URLs for Stripe Checkout
 */
export const getStripeRedirectUrls = (origin: string = window.location.origin) => ({
  success: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel: `${origin}/billing/canceled`,
});
