// src/features/billing/BillingService.ts
// Billing Service - Stripe Integration (Placeholder for now)

import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';
import { Plan, Subscription, Invoice, PlanTier, BillingInterval } from './types';

class BillingService {
  /**
   * Get all available plans
   * Updated: December 2025 - Simplified to 3 plans matching main BillingService
   */
  getAvailablePlans(): Plan[] {
    // This matches bulgarian-car-marketplace/src/features/billing/BillingService.ts
    return [
      // FREE PLAN
      {
        id: 'free',
        name: { bg: 'Безплатен', en: 'Free' },
        description: { bg: 'За частни продавачи - 5 автомобила на месец', en: 'For private sellers - 5 cars per month' },
        profileType: 'private',
        pricing: { monthly: 0, annual: 0 },
        listingCap: 5,
        features: ['basic_listing', 'standard_photos', 'contact_buyers']
      },
      
      // DEALER PLAN
      {
        id: 'dealer',
        name: { bg: 'Търговец', en: 'Dealer' },
        description: { bg: '15 автомобила месечно + анализи', en: '15 cars monthly + analytics' },
        profileType: 'dealer',
        pricing: { monthly: 29, annual: 300 },
        listingCap: 15,
        features: ['analytics', 'quick_replies', 'bulk_edit', 'team_management'],
        popular: true
      },
      
      // COMPANY PLAN
      {
        id: 'company',
        name: { bg: 'Компания', en: 'Company' },
        description: { bg: 'Неограничени автомобили + API достъп', en: 'Unlimited cars + API access' },
        profileType: 'company',
        pricing: { monthly: 199, annual: 1600 },
        listingCap: -1, // Unlimited
        features: ['everything', 'api_access', 'dedicated_manager', 'custom_reports'],
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

