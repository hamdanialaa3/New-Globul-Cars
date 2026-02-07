// src/services/payment-service.ts
// Complete Payment Service for Koli One

import { db } from '../firebase/firebase-config';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { errorHandler } from './error-handling-service';
import { monitoring } from './monitoring-service';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  customerId: string;
  carId?: string;
  subscriptionId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'cash';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'purchase' | 'subscription' | 'commission' | 'payout';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export class PaymentService {
  private static instance: PaymentService;
  private readonly STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create payment intent for car purchase
   */
  public async createCarPaymentIntent(
    carId: string,
    amount: number,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      monitoring.trackUserAction('create_payment_intent', 'payment', {
        carId,
        amount,
        userId
      });

      // In production, this would call Stripe API
      // For now, we create a payment intent in Firebase
      const paymentData = {
        amount,
        currency: 'EUR',
        status: 'pending' as const,
        customerId: userId,
        carId,
        metadata: {
          ...metadata,
          type: 'car_purchase'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'payment_intents'), paymentData);

      return {
        id: docRef.id,
        ...paymentData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      errorHandler.logError(error, {
        action: 'create_payment_intent',
        severity: 'high',
        additionalData: { carId, amount, userId }
      });
      throw error;
    }
  }

  /**
   * Process payment
   */
  public async processPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      monitoring.trackUserAction('process_payment', 'payment', {
        paymentIntentId,
        paymentMethodId
      });

      // Get payment intent
      const intentDoc = await getDoc(doc(db, 'payment_intents', paymentIntentId));
      if (!intentDoc.exists()) {
        throw new Error('Payment intent not found');
      }

      const intentData = intentDoc.data();

      // In production, this would call Stripe API to process payment
      // For now, we simulate successful payment
      
      // Update payment intent status
      await updateDoc(doc(db, 'payment_intents', paymentIntentId), {
        status: 'succeeded',
        paymentMethodId,
        processedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create transaction record
      const transaction: Omit<Transaction, 'id'> = {
        userId: intentData.customerId,
        amount: intentData.amount,
        currency: intentData.currency,
        type: 'purchase',
        status: 'completed',
        paymentMethod: paymentMethodId,
        description: `Car purchase - ${intentData.carId}`,
        metadata: intentData.metadata,
        createdAt: new Date()
      };

      const transactionRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        createdAt: serverTimestamp()
      });

      monitoring.trackUserAction('payment_success', 'payment', {
        paymentIntentId,
        transactionId: transactionRef.id,
        amount: intentData.amount
      });

      return {
        success: true,
        transactionId: transactionRef.id
      };
    } catch (error) {
      errorHandler.logError(error, {
        action: 'process_payment',
        severity: 'critical',
        additionalData: { paymentIntentId, paymentMethodId }
      });

      monitoring.trackUserAction('payment_failed', 'payment', {
        paymentIntentId,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Payment failed'
      };
    }
  }

  /**
   * Get user transactions
   */
  public async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      // In production, query Firebase for user transactions
      // For now, return empty array
      return [];
    } catch (error) {
      errorHandler.logError(error, {
        action: 'get_user_transactions',
        severity: 'medium',
        additionalData: { userId }
      });
      return [];
    }
  }

  /**
   * Refund payment
   */
  public async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      monitoring.trackUserAction('refund_payment', 'payment', {
        transactionId,
        amount,
        reason
      });

      // In production, this would call Stripe API to create refund
      // For now, we update transaction status

      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'refunded',
        refundedAt: serverTimestamp(),
        refundReason: reason
      });

      return {
        success: true,
        refundId: `refund_${Date.now()}`
      };
    } catch (error) {
      errorHandler.logError(error, {
        action: 'refund_payment',
        severity: 'high',
        additionalData: { transactionId, amount, reason }
      });

      return {
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Refund failed'
      };
    }
  }

  /**
   * Calculate commission
   */
  public calculateCommission(
    amount: number,
    commissionRate: number
  ): {
    subtotal: number;
    commission: number;
    vendorEarnings: number;
  } {
    const commission = amount * (commissionRate / 100);
    const vendorEarnings = amount - commission;

    return {
      subtotal: amount,
      commission,
      vendorEarnings
    };
  }

  /**
   * Get Stripe publishable key
   * @throws Error if REACT_APP_STRIPE_PUBLIC_KEY is not configured
   */
  public getStripePublicKey(): string {
    if (!this.STRIPE_PUBLIC_KEY) {
      throw new Error(
        'Stripe public key is not configured. Please set REACT_APP_STRIPE_PUBLIC_KEY in your environment variables.'
      );
    }
    return this.STRIPE_PUBLIC_KEY;
  }

  /**
   * Check if Stripe is properly configured
   */
  public isStripeConfigured(): boolean {
    return !!this.STRIPE_PUBLIC_KEY && this.STRIPE_PUBLIC_KEY.startsWith('pk_');
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();

// Helper functions
export const createPaymentIntent = (
  carId: string,
  amount: number,
  userId: string,
  metadata?: Record<string, any>
) => {
  return paymentService.createCarPaymentIntent(carId, amount, userId, metadata);
};

export const processPayment = (paymentIntentId: string, paymentMethodId: string) => {
  return paymentService.processPayment(paymentIntentId, paymentMethodId);
};

export const calculateCommission = (amount: number, rate: number) => {
  return paymentService.calculateCommission(amount, rate);
};
