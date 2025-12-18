// ARCHIVED: This file was moved to DDD folder on 2025-12-18
// Reason: Consolidated into unified billing-service.ts per Phase 2.2
// Original location: bulgarian-car-marketplace/src/services/payments/stripe.service.ts
// This file contained Stripe Connect account management and payment intent creation

import { logger } from '@/services/logger-service';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '@/firebase/config';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

export interface StripeConnectAccount {
  id: string;
  userId: string;
  accountId: string;
  status: 'pending' | 'active' | 'restricted' | 'disabled';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  sellerAccountId?: string;
  buyerId: string;
  carId: string;
  createdAt: Date;
}

export class StripeService {
  async createSellerAccount(
    userId: string,
    email: string,
    businessName?: string,
    businessType: 'individual' | 'company' = 'individual'
  ): Promise<{
    success: boolean;
    accountId?: string;
    onboardingUrl?: string;
    error?: string;
  }> {
    try {
      logger.debug('Creating seller account', { userId, email, businessType });

      const functions = getFunctions();
      const createSellerAccountFn = httpsCallable(functions, 'createSellerAccount');

      const result = await createSellerAccountFn({
        userId,
        email,
        businessName,
        businessType
      });

      if (result.data.success) {
        // Store account info in Firestore
        await setDoc(doc(db, 'stripeAccounts', userId), {
          userId,
          accountId: result.data.accountId,
          status: 'pending',
          chargesEnabled: false,
          payoutsEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        logger.info('Seller account created', { userId, accountId: result.data.accountId });
        return result.data;
      } else {
        throw new Error(result.data.error || 'Failed to create seller account');
      }
    } catch (error) {
      logger.error('Failed to create seller account', error, { userId });
      return { success: false, error: error.message };
    }
  }

  async getAccountStatus(userId: string): Promise<StripeConnectAccount | null> {
    try {
      logger.debug('Getting account status', { userId });

      const accountDoc = await getDoc(doc(db, 'stripeAccounts', userId));
      if (!accountDoc.exists()) {
        return null;
      }

      const data = accountDoc.data();
      return {
        id: accountDoc.id,
        userId: data.userId,
        accountId: data.accountId,
        status: data.status,
        chargesEnabled: data.chargesEnabled,
        payoutsEnabled: data.payoutsEnabled,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    } catch (error) {
      logger.error('Failed to get account status', error, { userId });
      throw error;
    }
  }

  async createPaymentIntent(
    carId: string,
    amount: number,
    buyerId: string,
    sellerAccountId?: string
  ): Promise<{
    success: boolean;
    clientSecret?: string;
    paymentIntentId?: string;
    error?: string;
  }> {
    try {
      logger.debug('Creating payment intent', { carId, amount, buyerId });

      const functions = getFunctions();
      const createPaymentIntentFn = httpsCallable(functions, 'createPaymentIntent');

      const result = await createPaymentIntentFn({
        carId,
        amount,
        buyerId,
        sellerAccountId
      });

      if (result.data.success) {
        // Store payment intent info
        await setDoc(doc(db, 'paymentIntents', result.data.paymentIntentId), {
          id: result.data.paymentIntentId,
          amount,
          currency: 'eur',
          status: 'requires_payment_method',
          clientSecret: result.data.clientSecret,
          sellerAccountId,
          buyerId,
          carId,
          createdAt: new Date()
        });

        logger.info('Payment intent created', {
          paymentIntentId: result.data.paymentIntentId,
          carId,
          buyerId
        });

        return result.data;
      } else {
        throw new Error(result.data.error || 'Failed to create payment intent');
      }
    } catch (error) {
      logger.error('Failed to create payment intent', error, { carId, buyerId });
      return { success: false, error: error.message };
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('Confirming payment', { paymentIntentId });

      const functions = getFunctions();
      const confirmPaymentFn = httpsCallable(functions, 'confirmPayment');

      const result = await confirmPaymentFn({ paymentIntentId });
      return result.data;
    } catch (error) {
      logger.error('Failed to confirm payment', error, { paymentIntentId });
      return { success: false, error: error.message };
    }
  }

  calculatePlatformFee(amount: number, feePercent: number = 5): number {
    return Math.round(amount * (feePercent / 100));
  }

  calculateSellerAmount(amount: number, feePercent: number = 5): number {
    return amount - this.calculatePlatformFee(amount, feePercent);
  }

  async updateAccountStatus(userId: string, status: StripeConnectAccount['status']): Promise<void> {
    try {
      logger.debug('Updating account status', { userId, status });

      await updateDoc(doc(db, 'stripeAccounts', userId), {
        status,
        updatedAt: new Date()
      });

      logger.info('Account status updated', { userId, status });
    } catch (error) {
      logger.error('Failed to update account status', error, { userId });
      throw error;
    }
  }
}

export const stripeService = new StripeService();