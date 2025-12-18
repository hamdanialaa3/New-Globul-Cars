// ARCHIVED: This file was moved to DDD folder on 2025-12-18
// Reason: Consolidated into unified billing-service.ts per Phase 2.2
// Original location: bulgarian-car-marketplace/src/services/stripe-client-service.ts
// This file contained client-side Stripe initialization and checkout operations

import { logger } from '@/services/logger-service';

const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

export interface PaymentConfirmation {
  paymentIntent: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
  error?: string;
}

export class StripeClientService {
  private stripe: any = null;

  async initializeStripe(): Promise<any> {
    if (!this.stripe && STRIPE_PUBLISHABLE_KEY) {
      try {
        const { loadStripe } = await import('@stripe/stripe-js');
        this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        logger.info('Stripe initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Stripe', error);
        throw error;
      }
    }
    return this.stripe;
  }

  async redirectToCheckout(sessionId: string): Promise<{ error?: string }> {
    try {
      logger.debug('Redirecting to Stripe checkout', { sessionId });

      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) {
        logger.error('Stripe redirect error', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      logger.error('Failed to redirect to checkout', error, { sessionId });
      return { error: error.message };
    }
  }

  async confirmCardPayment(clientSecret: string): Promise<PaymentConfirmation> {
    try {
      logger.debug('Confirming card payment', { clientSecret: clientSecret.substring(0, 10) + '...' });

      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret);

      if (error) {
        logger.error('Payment confirmation error', error);
        return {
          paymentIntent: null,
          error: error.message
        };
      }

      logger.info('Payment confirmed successfully', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      });

      return {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      };
    } catch (error) {
      logger.error('Failed to confirm card payment', error);
      return {
        paymentIntent: null,
        error: error.message
      };
    }
  }

  async createPaymentMethod(cardElement: any): Promise<{
    paymentMethod?: any;
    error?: string;
  }> {
    try {
      logger.debug('Creating payment method');

      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      });

      if (error) {
        logger.error('Payment method creation error', error);
        return { error: error.message };
      }

      logger.info('Payment method created', { paymentMethodId: paymentMethod.id });
      return { paymentMethod };
    } catch (error) {
      logger.error('Failed to create payment method', error);
      return { error: error.message };
    }
  }

  getStripeInstance(): any {
    return this.stripe;
  }

  async handleCardAction(clientSecret: string): Promise<PaymentConfirmation> {
    try {
      logger.debug('Handling card action', { clientSecret: clientSecret.substring(0, 10) + '...' });

      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { paymentIntent, error } = await stripe.handleCardAction(clientSecret);

      if (error) {
        logger.error('Card action error', error);
        return {
          paymentIntent: null,
          error: error.message
        };
      }

      return {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      };
    } catch (error) {
      logger.error('Failed to handle card action', error);
      return {
        paymentIntent: null,
        error: error.message
      };
    }
  }
}

export const stripeClientService = new StripeClientService();

export const getStripeInstance = () => stripeClientService.getStripeInstance();