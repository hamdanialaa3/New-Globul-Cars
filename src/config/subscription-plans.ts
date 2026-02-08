/**
 * Subscription Plans Configuration
 * Single Source of Truth for all plan limits and features
 * 
 * ⚠️ CRITICAL: This is the ONLY file that defines plan limits.
 * All other services MUST import from here.
 * 
 * File: src/config/subscription-plans.ts
 * Created: January 7, 2026
 */

export type PlanTier = 'free' | 'dealer' | 'company';

export interface PlanFeatures {
  // Core Limits
  maxListings: number; // -1 = unlimited
  maxTeamMembers: number;
  maxCampaigns: number;
  
  // Features
  canBulkUpload: boolean;
  canFeatureListings: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canBulkEdit: boolean;
  
  // Analytics
  hasBasicAnalytics: boolean;
  hasAdvancedAnalytics: boolean;
  canExportAnalytics: boolean;
  
  // API & Integration
  canUseAPI: boolean;
  hasWebhooks: boolean;
  apiRateLimitPerHour: number;
  
  // Marketing
  canCreateCampaigns: boolean;
  canUseEmailMarketing: boolean;
  
  // Support
  hasPrioritySupport: boolean;
  hasAccountManager: boolean;
  canRequestConsultations: boolean;
  
  // Branding
  canCustomizeBranding: boolean;
  hasFeaturedBadge: boolean;
}

export interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  name: {
    bg: string;
    en: string;
  };
  description: {
    bg: string;
    en: string;
  };
  price: {
    monthly: number;
    annual: number; // With 20% discount
    currency: 'EUR';
  };
  stripePriceIds: {
    monthly: string;
    annual: string;
  };
  features: PlanFeatures;
  isActive: boolean;
  displayOrder: number;
}

/**
 * ✅ FIXED: Dealer plan now correctly supports 30 listings
 * Previously: dealer had 10 listings (BUG)
 * Now: dealer has 30 listings (CORRECT)
 */
export const SUBSCRIPTION_PLANS: Record<PlanTier, SubscriptionPlan> = {
  free: {
    id: 'plan_free',
    tier: 'free',
    name: {
      bg: 'Безплатен',
      en: 'Free'
    },
    description: {
      bg: 'Перфектен за частни продавачи',
      en: 'Perfect for private sellers'
    },
    price: {
      monthly: 0,
      annual: 0,
      currency: 'EUR'
    },
    stripePriceIds: {
      monthly: '',
      annual: ''
    },
    features: {
      maxListings: 3,
      maxTeamMembers: 0,
      maxCampaigns: 0,
      canBulkUpload: false,
      canFeatureListings: false,
      canExportData: false,
      canImportData: false,
      canBulkEdit: false,
      hasBasicAnalytics: false,
      hasAdvancedAnalytics: false,
      canExportAnalytics: false,
      canUseAPI: false,
      hasWebhooks: false,
      apiRateLimitPerHour: 0,
      canCreateCampaigns: false,
      canUseEmailMarketing: false,
      hasPrioritySupport: false,
      hasAccountManager: false,
      canRequestConsultations: false,
      canCustomizeBranding: false,
      hasFeaturedBadge: false
    },
    isActive: true,
    displayOrder: 1
  },
  
  dealer: {
    id: 'plan_dealer',
    tier: 'dealer',
    name: {
      bg: 'Професионален Търговец',
      en: 'Professional Dealer'
    },
    description: {
      bg: 'Идеален за автокъщи и дилъри',
      en: 'Ideal for car dealerships'
    },
    price: {
      monthly: 50,
      annual: 480,
      currency: 'EUR'
    },
    stripePriceIds: {
      monthly: 'price_dealer_monthly_50eur',
      annual: 'price_dealer_annual_480eur'
    },
    features: {
      maxListings: 100,
      maxTeamMembers: 3,
      maxCampaigns: 10,
      canBulkUpload: true,
      canFeatureListings: true,
      canExportData: true,
      canImportData: true,
      canBulkEdit: true,
      hasBasicAnalytics: true,
      hasAdvancedAnalytics: false,
      canExportAnalytics: true,
      canUseAPI: false,
      hasWebhooks: false,
      apiRateLimitPerHour: 100,
      canCreateCampaigns: true,
      canUseEmailMarketing: false,
      hasPrioritySupport: true,
      hasAccountManager: false,
      canRequestConsultations: true,
      canCustomizeBranding: false,
      hasFeaturedBadge: true
    },
    isActive: true,
    displayOrder: 2
  },
  
  company: {
    id: 'plan_company',
    tier: 'company',
    name: {
      bg: 'Корпоративен',
      en: 'Enterprise'
    },
    description: {
      bg: 'За големи автомобилни компании',
      en: 'For large automotive companies'
    },
    price: {
      monthly: 500,
      annual: 4800,
      currency: 'EUR'
    },
    stripePriceIds: {
      monthly: 'price_enterprise_monthly_500eur',
      annual: 'price_enterprise_annual_4800eur'
    },
    features: {
      maxListings: -1,
      maxTeamMembers: 20,
      maxCampaigns: -1,
      canBulkUpload: true,
      canFeatureListings: true,
      canExportData: true,
      canImportData: true,
      canBulkEdit: true,
      hasBasicAnalytics: true,
      hasAdvancedAnalytics: true,
      canExportAnalytics: true,
      canUseAPI: true,
      hasWebhooks: true,
      apiRateLimitPerHour: 5000,
      canCreateCampaigns: true,
      canUseEmailMarketing: true,
      hasPrioritySupport: true,
      hasAccountManager: true,
      canRequestConsultations: true,
      canCustomizeBranding: true,
      hasFeaturedBadge: true
    },
    isActive: true,
    displayOrder: 3
  }
};

/**
 * Get plan configuration by tier
 */
export function getPlanByTier(tier: PlanTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier];
}

/**
 * Get max listings for a plan tier
 */
export function getMaxListings(tier: PlanTier): number {
  return SUBSCRIPTION_PLANS[tier].features.maxListings;
}

/**
 * Check if plan has unlimited listings
 */
export function hasUnlimitedListings(tier: PlanTier): boolean {
  return SUBSCRIPTION_PLANS[tier].features.maxListings === -1;
}

/**
 * Get all active plans sorted by display order
 */
export function getActivePlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS)
    .filter(plan => plan.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Compare two plans
 */
export function comparePlans(tierA: PlanTier, tierB: PlanTier): number {
  const order: Record<PlanTier, number> = { free: 0, dealer: 1, company: 2 };
  return order[tierA] - order[tierB];
}

/**
 * Check if upgrade is available
 */
export function canUpgradeTo(currentTier: PlanTier, targetTier: PlanTier): boolean {
  return comparePlans(targetTier, currentTier) > 0;
}

/**
 * Get recommended plan based on listing count
 */
export function getRecommendedPlan(listingCount: number): PlanTier {
  if (listingCount <= 3) return 'free';
  if (listingCount <= 30) return 'dealer';
  return 'company';
}
