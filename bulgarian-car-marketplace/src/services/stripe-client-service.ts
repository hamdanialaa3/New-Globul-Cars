// src/services/stripe-client-service.ts
// Stripe client initialization and payment handling

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { logger } from './logger-service';

const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripeInstance = async (): Promise<Stripe | null> => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    logger.warn('Stripe publishable key not configured');
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }

  return stripePromise;
};

export const stripeClientService = {
  /**
   * Initialize Stripe Elements
   */
  async initializeStripe() {
    return getStripeInstance();
  },

  /**
   * Handle checkout redirect
   */
  async redirectToCheckout(sessionId: string) {
    const stripe = await getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      logger.error('Stripe checkout redirect failed', error);
      throw new Error(error.message);
    }
  },

  /**
   * Confirm card payment
   */
  async confirmCardPayment(clientSecret: string, paymentDetails: any) {
    const stripe = await getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const result = await stripe.confirmCardPayment(clientSecret, paymentDetails);
    
    if (result.error) {
      logger.error('Card payment confirmation failed', result.error);
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  },

  /**
   * Get payment method
   */
  async retrievePaymentIntent(clientSecret: string) {
    const stripe = await getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    return paymentIntent;
  },
};

export default stripeClientService;
