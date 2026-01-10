/**
 * Billing Configuration
 * ⚠️ DEPRECATED: Please use subscription-plans.ts instead
 * This file is kept for backward compatibility only
 * 
 * ✅ FIXED January 7, 2026: Now imports from single source of truth
 */

import { SUBSCRIPTION_PLANS, type SubscriptionPlan as NewSubscriptionPlan } from './subscription-plans';

// Re-export for backward compatibility
export { SUBSCRIPTION_PLANS } from './subscription-plans';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    limits: {
        listings: number;
        flexEdits: number;
    };
}

// ✅ FIXED: Dealer now correctly has 30 listings (was 10)
export const SUBSCRIPTION_PLANS_LEGACY: Record<'dealer' | 'company', SubscriptionPlan> = {
    dealer: {
        id: SUBSCRIPTION_PLANS.dealer.stripePriceIds.monthly,
        name: 'Professional Dealer',
        price: SUBSCRIPTION_PLANS.dealer.price.monthly,
        limits: { 
            listings: SUBSCRIPTION_PLANS.dealer.features.maxListings, // ✅ Now 30
            flexEdits: 10 
        }
    },
    company: {
        id: SUBSCRIPTION_PLANS.company.stripePriceIds.monthly,
        name: 'Enterprise',
        price: SUBSCRIPTION_PLANS.company.price.monthly,
        limits: { 
            listings: 200, // Company has unlimited, but set reasonable limit for UI
            flexEdits: 9999 
        }
    }
};
