// src/services/stripe-service.ts
// Stripe Integration Service for Bulgarian Car Marketplace

import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { paymentService } from './payment-service';

export class StripeService {
  private static instance: StripeService;
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  private constructor() {}

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Initialize Stripe
   */
  public async initialize(): Promise<Stripe | null> {
    if (this.stripe) {
      return this.stripe;
    }

    try {
      const publicKey = paymentService.getStripePublicKey();
      this.stripe = await loadStripe(publicKey);
      return this.stripe;
    } catch (error) {
      console.error('[STRIPE] Failed to initialize:', error);
      return null;
    }
  }

  /**
   * Create payment elements
   */
  public async createElements(clientSecret: string): Promise<StripeElements | null> {
    const stripe = await this.initialize();
    if (!stripe) return null;

    this.elements = stripe.elements({ clientSecret });
    return this.elements;
  }

  /**
   * Get Stripe instance
   */
  public async getStripe(): Promise<Stripe | null> {
    return await this.initialize();
  }

  /**
   * Get Elements instance
   */
  public getElements(): StripeElements | null {
    return this.elements;
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance();

export default stripeService;
