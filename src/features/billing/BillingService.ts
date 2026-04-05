import { logger } from '../../services/logger-service';
import { subscriptionService } from '../../services/billing/subscription-service';
// src/features/billing/BillingService.ts
// Billing Service - Stripe Integration via Extension

import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Plan,
  Subscription,
  Invoice,
  PlanTier,
  BillingInterval,
} from './types';
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
    const featureKeys = (
      planFeatures: (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS]['features']
    ): string[] => {
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
      .map<Plan>(plan => ({
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
        interval: 'monthly', // Default
        currentPeriodStart: new Date(),
        currentPeriodEnd: plan.renewsAt?.toDate() || new Date(),
        cancelAtPeriodEnd: false,
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
        cancelUrl: `${window.location.origin}/billing/canceled`,
      });

      return {
        url: result.url,
        sessionId: result.sessionId || '',
      };
    } catch (error: unknown) {
      logger.error('Error creating checkout session', error as Error);
      throw new Error(
        (error as Error).message || 'Failed to create checkout session'
      );
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      // Update user's subscription status in Firestore
      await updateDoc(doc(db, 'users', userId), {
        'plan.status': 'canceled',
        'plan.canceledAt': Timestamp.now(),
        'plan.renewsAt': Timestamp.now(), // Stop renewal immediately
      });

      // Call Stripe Extension Cloud Function to handle Stripe-side cancellation
      const cancelSubscription = httpsCallable(
        functions,
        'ext-firestore-stripe-payments-cancelSubscription'
      );

      try {
        await cancelSubscription({ userId });
      } catch (stripeError) {
        // Log Stripe cancellation error but continue - Firestore is already updated
        logger.warn(
          'Stripe cancellation failed (Firestore updated):',
          stripeError as Error
        );
      }

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
    try {
      const invoicesCollection = collection(db, 'users', userId, 'invoices');
      const invoicesQuery = query(
        invoicesCollection,
        where('status', '!=', 'draft')
      );

      const invoiceSnaps = await getDocs(invoicesQuery);

      return invoiceSnaps.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId,
            planId: data.planId,
            amount: data.amount,
            currency: data.currency || 'BGN',
            status: data.status || 'paid',
            issuedAt: data.issuedAt?.toDate() || new Date(),
            dueDate: data.dueDate?.toDate() || new Date(),
            pdfUrl: data.pdfUrl || '',
            description: data.description || '',
          };
        })
        .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
    } catch (error) {
      logger.error('Error fetching invoices:', error as Error);
      return [];
    }
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(userId: string, invoiceId: string): Promise<void> {
    try {
      const invoiceDoc = await getDoc(
        doc(db, 'users', userId, 'invoices', invoiceId)
      );

      if (!invoiceDoc.exists()) {
        throw new Error('Invoice not found');
      }

      const data = invoiceDoc.data();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      } else {
        throw new Error('PDF URL not available');
      }
    } catch (error) {
      logger.error('Error downloading invoice:', error as Error);
      throw error;
    }
  }

  /**
   * Retry failed payment for invoice
   */
  async retryInvoicePayment(
    userId: string,
    invoiceId: string
  ): Promise<{ url: string; sessionId: string }> {
    try {
      const invoiceDoc = await getDoc(
        doc(db, 'users', userId, 'invoices', invoiceId)
      );

      if (!invoiceDoc.exists()) {
        throw new Error('Invoice not found');
      }

      const invoiceData = invoiceDoc.data();

      // Create a new checkout session for the invoice
      const result = await subscriptionService.createCheckoutSession({
        userId,
        planId: invoiceData.planId,
        interval: invoiceData.interval || 'monthly',
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}`,
        cancelUrl: `${window.location.origin}/billing/invoices`,
      });

      return {
        url: result.url,
        sessionId: result.sessionId || '',
      };
    } catch (error) {
      logger.error('Error retrying invoice payment:', error as Error);
      throw error;
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      const userBillingRef = doc(db, 'users', userId, 'billing', 'profile');
      await updateDoc(userBillingRef, {
        preferredPaymentMethodId: paymentMethodId,
        updatedAt: Timestamp.now(),
      });

      const updatePaymentMethodFn = httpsCallable(
        functions,
        'updatePaymentMethod'
      );
      await updatePaymentMethodFn({ userId, paymentMethodId });

      logger.info('Payment method updated in Firestore and Stripe callable', {
        userId,
      });
    } catch (error) {
      logger.error('Error updating payment method:', error as Error, {
        userId,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const billingService = new BillingService();
export default billingService;
