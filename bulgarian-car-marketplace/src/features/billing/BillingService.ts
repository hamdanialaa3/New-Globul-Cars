// src/features/billing/BillingService.ts
// Billing Service - Stripe Integration (Placeholder for now)

import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { Plan, Subscription, Invoice, PlanTier, BillingInterval } from './types';

class BillingService {
  /**
   * Get all available plans
   */
  getAvailablePlans(): Plan[] {
    // This will eventually come from Stripe or Remote Config
    return [
      {
        id: 'premium',
        name: { bg: 'Премиум', en: 'Premium' },
        description: { bg: '10 обяви, приоритетна поддръжка', en: '10 listings, priority support' },
        profileType: 'private',
        pricing: { monthly: 9.99, annual: 99 },
        listingCap: 10,
        features: ['priority_support', 'featured_badge']
      },
      {
        id: 'dealer_basic',
        name: { bg: 'Дилър - Базов', en: 'Dealer - Basic' },
        description: { bg: '50 обяви, анализи, бързи отговори', en: '50 listings, analytics, quick replies' },
        profileType: 'dealer',
        pricing: { monthly: 49, annual: 490 },
        listingCap: 50,
        features: ['analytics', 'quick_replies', 'bulk_edit'],
        popular: true
      },
      {
        id: 'dealer_pro',
        name: { bg: 'Дилър - Про', en: 'Dealer - Pro' },
        description: { bg: '150 обяви, CSV импорт, API достъп', en: '150 listings, CSV import, API access' },
        profileType: 'dealer',
        pricing: { monthly: 99, annual: 990 },
        listingCap: 150,
        features: ['analytics', 'csv_import', 'advanced_analytics', 'api_access'],
        recommended: true
      },
      {
        id: 'dealer_enterprise',
        name: { bg: 'Дилър - Ентърпрайз', en: 'Dealer - Enterprise' },
        description: { bg: 'Неограничени обяви, персонален мениджър', en: 'Unlimited listings, dedicated manager' },
        profileType: 'dealer',
        pricing: { monthly: 199, annual: 1990 },
        listingCap: -1,
        features: ['everything', 'dedicated_manager', 'white_label']
      },
      {
        id: 'company_starter',
        name: { bg: 'Фирма - Стартер', en: 'Company - Starter' },
        description: { bg: '100 обяви, екип до 5 човека', en: '100 listings, team up to 5 members' },
        profileType: 'company',
        pricing: { monthly: 299, annual: 2990 },
        listingCap: 100,
        features: ['team_5', 'multi_location', 'fleet_analytics']
      },
      {
        id: 'company_pro',
        name: { bg: 'Фирма - Про', en: 'Company - Pro' },
        description: { bg: 'Неограничени обяви, неограничен екип', en: 'Unlimited listings, unlimited team' },
        profileType: 'company',
        pricing: { monthly: 599, annual: 5990 },
        listingCap: -1,
        features: ['team_unlimited', 'custom_reports', 'crm_integration']
      },
      {
        id: 'company_enterprise',
        name: { bg: 'Фирма - Ентърпрайз', en: 'Company - Enterprise' },
        description: { bg: 'Всички функции, SLA, персонализация', en: 'All features, SLA, customization' },
        profileType: 'company',
        pricing: { monthly: 999, annual: 9990 },
        listingCap: -1,
        features: ['everything', 'sla', 'custom_everything']
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
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Create Stripe checkout session (placeholder)
   * In production, this would call a Cloud Function
   */
  async createCheckoutSession(
    userId: string,
    planId: PlanTier,
    interval: BillingInterval
  ): Promise<{ url: string }> {
    // TODO: Call Cloud Function to create Stripe Checkout Session
    // For now, return placeholder
    console.log('Creating checkout session:', { userId, planId, interval });
    
    return {
      url: 'https://checkout.stripe.com/placeholder'  // Placeholder
    };
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

      // TODO: Cancel in Stripe
      console.log('Subscription canceled for user:', userId);
    } catch (error) {
      console.error('Error canceling subscription:', error);
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
    console.log('Payment method updated:', { userId, paymentMethodId });
  }
}

// Export singleton instance
export const billingService = new BillingService();
export default billingService;

