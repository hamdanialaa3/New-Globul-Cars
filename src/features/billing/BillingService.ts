import { logger } from '../../services/logger-service';
import { subscriptionService } from '../../services/billing/subscription-service';
// src/features/billing/BillingService.ts
// Billing Service - Stripe Integration via Extension

import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plan, Subscription, Invoice, PlanTier, BillingInterval } from './types';
import { SUBSCRIPTION_PLANS } from '../../config/subscription-plans';

const functions = getFunctions();

class BillingService {
  /**
   * Get all available plans
   * Updated: January 2026 - Accurate pricing from SUBSCRIPTION_PLANS
   * 
   * 3 Plans:
   * 1. Free (Private Seller) - 3 cars/month, basic features
   * 2. Dealer - €27.78/month or €278/year, 30 cars/month
   * 3. Company - €137.88/month or €1288/year, unlimited cars
   * 
   * ✅ CRITICAL: Prices are imported from subscription-plans.ts (single source of truth)
   */
  getAvailablePlans(): Plan[] {
    const featureKeys = (planFeatures: typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS]['features']): string[] => {
      const keys: string[] = [];
      if (planFeatures.canBulkUpload) keys.push('bulk_upload');
      if (planFeatures.canFeatureListings) keys.push('featured_badge');
      if (planFeatures.hasBasicAnalytics) keys.push('basic_analytics');
      if (planFeatures.hasAdvancedAnalytics) keys.push('advanced_analytics');
      if (planFeatures.canUseAPI) keys.push('api_access');
      if (planFeatures.hasWebhooks) keys.push('webhooks');
      if (planFeatures.canCreateCampaigns) keys.push('campaigns');
      if (planFeatures.hasPrioritySupport) keys.push('priority_support');
      if (planFeatures.hasAccountManager) keys.push('account_manager');
      if (planFeatures.canRequestConsultations) keys.push('consultations');
      if (planFeatures.canCustomizeBranding) keys.push('custom_branding');
      if (planFeatures.hasFeaturedBadge) keys.push('featured_listing');
      return keys;
    };

    return Object.values(SUBSCRIPTION_PLANS)
      .filter(plan => plan.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map<Plan>((plan) => ({
        id: plan.tier,
        name: plan.name,
        description: plan.description,
        profileType: plan.tier === 'free' ? 'private' : plan.tier,
        pricing: { monthly: plan.price.monthly, annual: plan.price.annual },
        listingCap: plan.features.maxListings,
        features: featureKeys(plan.features),
        popular: plan.tier === 'dealer',
        recommended: plan.tier === 'company',
      }));
  }

  /**
   * Get user's current subscription
   */
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const plan = userData.plan;

      if (!plan) {
        return null;
      }

      return {
        userId,
        planId: plan.tier,
        status: plan.status,
        interval: 'monthly',  // Default
        currentPeriodStart: new Date(),
        currentPeriodEnd: plan.renewsAt?.toDate() || new Date(),
        cancelAtPeriodEnd: false
      };
    } catch (error) {
      logger.error('Error getting subscription:', error as Error);
      return null;
    }
  }



  // ... (keep existing imports)

  /**
   * Create Stripe checkout session
   * ✅ UPDATED: Using Stripe Extension via subscriptionService
   */
  async createCheckoutSession(
    userId: string,
    planId: PlanTier,
    interval: BillingInterval
  ): Promise<{ url: string; sessionId: string }> {
    try {
      const result = await subscriptionService.createCheckoutSession({
        userId,
        planId,
        interval,
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/billing/canceled`
      });

      return {
        url: result.url,
        sessionId: result.sessionId || '',
      };
    } catch (error: unknown) {
      logger.error('Error creating checkout session', error as Error);
      throw new Error((error as Error).message || 'Failed to create checkout session');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'plan.status': 'canceled',
        'plan.canceledAt': Timestamp.now()
      });

      // TODO: Cancel in Stripe (requires Stripe API call)
      // Note: Currently cancels in Firestore only, Stripe cancellation via webhook
      logger.info('Subscription canceled for user:', { userId });
    } catch (error) {
      logger.error('Error canceling subscription:', error as Error);
      throw error;
    }
  }

  /**
   * Get invoices for user
   */
  async getInvoices(userId: string): Promise<Invoice[]> {
    // TODO: Query invoices collection
    // For now, return empty
    return [];
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    // TODO: Update in Stripe
    logger.info('Payment method updated:', { userId, paymentMethodId });
  }
}

// Export singleton instance
export const billingService = new BillingService();
export default billingService;

