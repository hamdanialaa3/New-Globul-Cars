import { logger } from '../../services/logger-service';
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
        name: { bg: 'Безплатен', en: 'Free' },
        description: { bg: 'За частни продавачи - 5 автомобила на месец', en: 'For private sellers - 5 cars per month' },
        profileType: 'private',
        pricing: { monthly: 0, annual: 0 },
        listingCap: 5,  // 5 cars per month
        features: [
          'basic_listing',
          'standard_photos',
          'contact_buyers',
          'trust_score',
          'search_visibility'
        ],
        popular: false
      },
      
      // DEALER PLAN - €29/month or €300/year
      {
        id: 'dealer',
        name: { bg: 'Търговец', en: 'Dealer' },
        description: { bg: '15 автомобила месечно + 30 AI анализа', en: '15 cars monthly + 30 AI analyses' },
        profileType: 'dealer',
        pricing: { monthly: 29, annual: 300 },  // €300/year = 17% savings
        listingCap: 15,  // 15 cars per month
        features: [
          'ai_valuation_30',      // 30 AI uses per month
          'analytics_dashboard',
          'quick_replies',
          'featured_badge',
          'priority_support',
          'bulk_edit',
          'advanced_search'
        ],
        popular: true,  // Most popular choice
        recommended: false
      },
      
      // COMPANY PLAN - €199/month or €1600/year
      {
        id: 'company',
        name: { bg: 'Компания', en: 'Company' },
        description: { bg: 'Неограничени автомобили + неограничен AI', en: 'Unlimited cars + unlimited AI' },
        profileType: 'company',
        pricing: { monthly: 199, annual: 1600 },  // €1600/year = 33% savings
        listingCap: -1,  // Unlimited cars
        features: [
          'ai_unlimited',         // Unlimited AI uses
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
          'sla_guarantee'
        ],
        popular: false,
        recommended: true  // Best value for businesses
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
      logger.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Create Stripe checkout session
   * ✅ UPDATED: Using Stripe Extension (Dec 2025)
   */
  async createCheckoutSession(
    userId: string,
    planId: PlanTier,
    interval: BillingInterval
  ): Promise<{ url: string; sessionId: string }> {
    try {
      // ✅ UPDATED: Using Stripe Extension Cloud Function
      const createCheckout = httpsCallable(functions, STRIPE_FUNCTIONS.createCheckoutSession);
      
      // Get Stripe Price ID for this plan
      const priceId = getStripePriceId(
        planId as 'dealer' | 'company', 
        interval
      );
      
      const result = await createCheckout({
        price: priceId,
        success_url: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/billing/canceled`,
        client_reference_id: userId, // Track which user made the purchase
      });

      const data = result.data as { sessionId: string; url: string };
      
      return {
        url: data.url,  // Extension returns 'url' not 'checkoutUrl'
        sessionId: data.sessionId,
      };
    } catch (error: any) {
      serviceLogger.error('Error creating checkout session', error as Error);
      throw new Error(error.message || 'Failed to create checkout session');
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
      logger.error('Error canceling subscription:', error);
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

