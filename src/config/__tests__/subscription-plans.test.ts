/**
 * Subscription Plans Tests
 * Verifies the critical bug fix (dealer: 10 → 30 listings)
 * 
 * File: src/config/__tests__/subscription-plans.test.ts
 * Created: January 7, 2026
 */

import {
  SUBSCRIPTION_PLANS,
  getPlanByTier,
  getMaxListings,
  hasUnlimitedListings,
  getActivePlans,
  comparePlans,
  canUpgradeTo,
  getRecommendedPlan
} from '../subscription-plans';

describe('Subscription Plans Configuration', () => {
  describe('Plan Limits - Critical Bug Fix', () => {
    it('🚨 CRITICAL: Dealer plan must have 30 listings (was 10)', () => {
      const dealerPlan = SUBSCRIPTION_PLANS.dealer;
      expect(dealerPlan.features.maxListings).toBe(30);
    });

    it('Free plan should have 3 listings', () => {
      const freePlan = SUBSCRIPTION_PLANS.free;
      expect(freePlan.features.maxListings).toBe(3);
    });

    it('Company plan should have unlimited listings (-1)', () => {
      const companyPlan = SUBSCRIPTION_PLANS.company;
      expect(companyPlan.features.maxListings).toBe(-1);
    });
  });

  describe('Plan Prices', () => {
    it('Free plan should be 0 EUR', () => {
      expect(SUBSCRIPTION_PLANS.free.price.monthly).toBe(0);
      expect(SUBSCRIPTION_PLANS.free.price.annual).toBe(0);
    });

    it('Dealer plan should be 20.11 EUR/month', () => {
      expect(SUBSCRIPTION_PLANS.dealer.price.monthly).toBe(20.11);
    });

    it('Dealer annual should have 20% discount', () => {
      const monthly = SUBSCRIPTION_PLANS.dealer.price.monthly;
      const annual = SUBSCRIPTION_PLANS.dealer.price.annual;
      const expectedAnnual = Math.round(monthly * 12 * 0.8); // 20% off
      expect(annual).toBe(expectedAnnual);
    });

    it('Company plan should be 100.11 EUR/month', () => {
      expect(SUBSCRIPTION_PLANS.company.price.monthly).toBe(100.11);
    });

    it('All prices should be in EUR', () => {
      Object.values(SUBSCRIPTION_PLANS).forEach(plan => {
        expect(plan.price.currency).toBe('EUR');
      });
    });
  });

  describe('Helper Functions', () => {
    describe('getMaxListings', () => {
      it('should return correct limits for each tier', () => {
        expect(getMaxListings('free')).toBe(3);
        expect(getMaxListings('dealer')).toBe(30); // ✅ Critical check
        expect(getMaxListings('company')).toBe(-1);
      });
    });

    describe('hasUnlimitedListings', () => {
      it('should return false for free and dealer', () => {
        expect(hasUnlimitedListings('free')).toBe(false);
        expect(hasUnlimitedListings('dealer')).toBe(false);
      });

      it('should return true for company', () => {
        expect(hasUnlimitedListings('company')).toBe(true);
      });
    });

    describe('getPlanByTier', () => {
      it('should return correct plan object', () => {
        const dealerPlan = getPlanByTier('dealer');
        expect(dealerPlan.tier).toBe('dealer');
        expect(dealerPlan.features.maxListings).toBe(30);
      });
    });

    describe('getActivePlans', () => {
      it('should return all active plans sorted', () => {
        const plans = getActivePlans();
        expect(plans).toHaveLength(3);
        expect(plans[0].tier).toBe('free');
        expect(plans[1].tier).toBe('dealer');
        expect(plans[2].tier).toBe('company');
      });
    });

    describe('comparePlans', () => {
      it('should correctly compare plan tiers', () => {
        expect(comparePlans('free', 'dealer')).toBeLessThan(0);
        expect(comparePlans('dealer', 'company')).toBeLessThan(0);
        expect(comparePlans('company', 'free')).toBeGreaterThan(0);
        expect(comparePlans('dealer', 'dealer')).toBe(0);
      });
    });

    describe('canUpgradeTo', () => {
      it('should allow upgrades to higher tiers', () => {
        expect(canUpgradeTo('free', 'dealer')).toBe(true);
        expect(canUpgradeTo('free', 'company')).toBe(true);
        expect(canUpgradeTo('dealer', 'company')).toBe(true);
      });

      it('should not allow downgrades', () => {
        expect(canUpgradeTo('dealer', 'free')).toBe(false);
        expect(canUpgradeTo('company', 'dealer')).toBe(false);
      });

      it('should not allow upgrading to same tier', () => {
        expect(canUpgradeTo('dealer', 'dealer')).toBe(false);
      });
    });

    describe('getRecommendedPlan', () => {
      it('should recommend free for 3 or fewer listings', () => {
        expect(getRecommendedPlan(1)).toBe('free');
        expect(getRecommendedPlan(3)).toBe('free');
      });

      it('should recommend dealer for 4-30 listings', () => {
        expect(getRecommendedPlan(4)).toBe('dealer');
        expect(getRecommendedPlan(15)).toBe('dealer');
        expect(getRecommendedPlan(30)).toBe('dealer');
      });

      it('should recommend company for 31+ listings', () => {
        expect(getRecommendedPlan(31)).toBe('company');
        expect(getRecommendedPlan(100)).toBe('company');
      });
    });
  });

  describe('Plan Features', () => {
    it('Free plan should have basic features only', () => {
      const features = SUBSCRIPTION_PLANS.free.features;
      expect(features.canBulkUpload).toBe(false);
      expect(features.canUseAPI).toBe(false);
      expect(features.hasAdvancedAnalytics).toBe(false);
      expect(features.maxTeamMembers).toBe(0);
    });

    it('Dealer plan should have advanced features', () => {
      const features = SUBSCRIPTION_PLANS.dealer.features;
      expect(features.canBulkUpload).toBe(true);
      expect(features.canFeatureListings).toBe(true);
      expect(features.hasBasicAnalytics).toBe(true);
      expect(features.maxTeamMembers).toBe(3);
      expect(features.hasPrioritySupport).toBe(true);
    });

    it('Company plan should have all features', () => {
      const features = SUBSCRIPTION_PLANS.company.features;
      expect(features.canUseAPI).toBe(true);
      expect(features.hasWebhooks).toBe(true);
      expect(features.hasAdvancedAnalytics).toBe(true);
      expect(features.maxTeamMembers).toBe(10);
      expect(features.hasAccountManager).toBe(true);
      expect(features.apiRateLimitPerHour).toBe(1000);
    });
  });

  describe('Multi-language Support', () => {
    it('should have Bulgarian and English names', () => {
      Object.values(SUBSCRIPTION_PLANS).forEach(plan => {
        expect(plan.name).toHaveProperty('bg');
        expect(plan.name).toHaveProperty('en');
        expect(typeof plan.name.bg).toBe('string');
        expect(typeof plan.name.en).toBe('string');
      });
    });

    it('should have Bulgarian and English descriptions', () => {
      Object.values(SUBSCRIPTION_PLANS).forEach(plan => {
        expect(plan.description).toHaveProperty('bg');
        expect(plan.description).toHaveProperty('en');
      });
    });
  });

  describe('Stripe Integration', () => {
    it('should have Stripe price IDs for paid plans', () => {
      expect(SUBSCRIPTION_PLANS.dealer.stripePriceIds.monthly).toBeTruthy();
      expect(SUBSCRIPTION_PLANS.dealer.stripePriceIds.annual).toBeTruthy();
      expect(SUBSCRIPTION_PLANS.company.stripePriceIds.monthly).toBeTruthy();
      expect(SUBSCRIPTION_PLANS.company.stripePriceIds.annual).toBeTruthy();
    });

    it('free plan should have empty Stripe IDs', () => {
      expect(SUBSCRIPTION_PLANS.free.stripePriceIds.monthly).toBe('');
      expect(SUBSCRIPTION_PLANS.free.stripePriceIds.annual).toBe('');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain the same plan tier keys', () => {
      expect(SUBSCRIPTION_PLANS).toHaveProperty('free');
      expect(SUBSCRIPTION_PLANS).toHaveProperty('dealer');
      expect(SUBSCRIPTION_PLANS).toHaveProperty('company');
    });

    it('should have all required properties', () => {
      Object.values(SUBSCRIPTION_PLANS).forEach(plan => {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('tier');
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('description');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('features');
        expect(plan).toHaveProperty('isActive');
        expect(plan).toHaveProperty('displayOrder');
      });
    });
  });

  describe('Regression Tests', () => {
    it('🚨 REGRESSION: Ensure dealer limit never goes back to 10', () => {
      const dealerLimit = getMaxListings('dealer');
      expect(dealerLimit).toBeGreaterThanOrEqual(30);
      expect(dealerLimit).not.toBe(10); // Never allow this bug again!
    });

    it('should maintain consistent team member limits', () => {
      expect(SUBSCRIPTION_PLANS.free.features.maxTeamMembers).toBe(0);
      expect(SUBSCRIPTION_PLANS.dealer.features.maxTeamMembers).toBe(3);
      expect(SUBSCRIPTION_PLANS.company.features.maxTeamMembers).toBe(10);
    });

    it('should maintain API rate limits', () => {
      expect(SUBSCRIPTION_PLANS.free.features.apiRateLimitPerHour).toBe(0);
      expect(SUBSCRIPTION_PLANS.dealer.features.apiRateLimitPerHour).toBe(100);
      expect(SUBSCRIPTION_PLANS.company.features.apiRateLimitPerHour).toBe(1000);
    });
  });
});
