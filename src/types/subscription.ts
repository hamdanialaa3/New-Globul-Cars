// src/types/subscription.ts

export type PlanTier = 'free' | 'dealer' | 'company';

export interface SubscriptionInfo {
  id: string;
  planTier: PlanTier | 'unknown';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | string;
  currentPeriodStart?: string; // ISO
  currentPeriodEnd?: string;   // ISO
  cancelAtPeriodEnd?: boolean;
}

export interface CheckoutSessionResponse {
  success: boolean;
  sessionId: string;
  checkoutUrl: string;
  message?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  canceledAt?: string | Date;
}
