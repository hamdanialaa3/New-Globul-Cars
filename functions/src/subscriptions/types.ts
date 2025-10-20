// functions/src/subscriptions/types.ts
// Subscription System Types for Cloud Functions

export interface SubscriptionPlan {
  id: string;
  tier: 'free' | 'basic' | 'pro' | 'premium' | 'dealer_basic' | 'dealer_premium' | 'enterprise';
  name: string;
  nameEn: string;
  price: number;
  currency: 'BGN' | 'EUR';
  billingPeriod: 'monthly' | 'yearly';
  stripePriceId: string; // Stripe Price ID
  features: string[];
  limits: {
    listings: number;
    photos: number;
    videoSupport: boolean;
    prioritySupport: boolean;
    analytics: boolean;
    teamMembers: number;
  };
}

export interface UserSubscription {
  planId: string;
  planTier: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused';
  currentPeriodStart: FirebaseFirestore.Timestamp;
  currentPeriodEnd: FirebaseFirestore.Timestamp;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
}

export interface CheckoutSessionResult {
  success: boolean;
  sessionId: string;
  checkoutUrl: string;
  message?: string;
}

export interface CancelSubscriptionResult {
  success: boolean;
  message: string;
  canceledAt?: FirebaseFirestore.Timestamp;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}
