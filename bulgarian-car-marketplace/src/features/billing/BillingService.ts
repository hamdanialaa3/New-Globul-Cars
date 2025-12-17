import { logger } from '../../services/logger-service';
import { subscriptionService } from '../../services/billing/subscription-service';
// src/features/billing/BillingService.ts
// Billing Service - Stripe Integration via Extension

import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plan, Subscription, Invoice, PlanTier, BillingInterval } from './types';
import { getStripePriceId, STRIPE_FUNCTIONS } from '../../config/stripe-extension.config';

const functions = getFunctions();

class BillingService {
  /**
   * Get all available plans
   * Updated: Dec 2025 - New simplified pricing structure
   * 
   * 3 Plans:
   * 1. Free (Private Seller) - 5 cars/month, basic features
   * 2. Dealer - €29/month or €300/year, 15 cars/month, 30 AI uses/month
   * 3. Company - €199/month or €1600/year, unlimited cars, unlimited AI
   */
  getAvailablePlans(): Plan[] {
    return [
      // FREE PLAN - Private Seller
      {
        id: 'free',
        name: { bg: 'Частен', en: 'Private' },
        description: { bg: 'За частни лица - 3 автомобила на месец', en: 'For private sellers - 3 cars per month' },
        profileType: 'private',
        pricing: { monthly: 0, annual: 0 },
        listingCap: 3,  // 3 cars per month
        features: [
          'basic_listing',
          'standard_photos',
          'contact_buyers',
          'trust_score',
          'search_visibility',
          'no_brand_edit' // Custom feature flag
        ],
        popular: false
      },

      // DEALER PLAN - €27.78/month or €278/year
      {
        id: 'dealer',
        name: { bg: 'Търговец', en: 'Dealer' },
        description: { bg: '€27.78/месец - 25 автомобила месечно', en: '€27.78/month - 25 cars monthly' },
        profileType: 'dealer',
        pricing: { monthly: 27.78, annual: 278 },
        listingCap: 25,  // 25 cars per month
        features: [
          'ai_valuation_30',
          'analytics_dashboard',
          'quick_replies',
          'featured_badge',
          'priority_support',
          'bulk_edit',
          'advanced_search',
          'limited_brand_edit' // Custom feature flag
        ],
        popular: true,
        recommended: false
      },

      // COMPANY PLAN - €187.88/month or €1288/year
      {
        id: 'company',
        name: { bg: 'Компания', en: 'Company' },
        description: { bg: '€187.88/месец - 200 автомобила месечно', en: '€187.88/month - 200 cars monthly' },
        profileType: 'company',
        pricing: { monthly: 187.88, annual: 1288 },
        listingCap: 200,  // 200 cars per month
        features: [
          'ai_unlimited',
          'unlimited_listings',
          'team_management',
          'multi_location',
          'api_access',
          'custom_branding',
          'dedicated_manager',
          'crm_integration',
          'advanced_analytics',
          'white_label',
          'priority_phone_support',
          'custom_reports',
          'sla_guarantee',
          'full_brand_edit' // Custom feature flag
        ],
        popular: false,
        recommended: true
      }
    ];
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
        planId: planId as 'dealer' | 'company',
        interval,
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/billing/canceled`
      });

      if (!result.checkoutUrl) throw new Error('No checkout URL returned');

      return {
        url: result.checkoutUrl,
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

