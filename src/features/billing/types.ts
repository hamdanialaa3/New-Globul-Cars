// src/features/billing/types.ts
// Billing System Types
// Updated: December 2025 - Simplified to 3 plans

export type PlanTier = 'free' | 'dealer' | 'company';

export type PlanStatus = 'active' | 'trial' | 'past_due' | 'canceled';

export type BillingInterval = 'monthly' | 'annual';

export interface Plan {
  id: PlanTier;
  name: {
    bg: string;
    en: string;
  };
  description: {
    bg: string;
    en: string;
  };
  profileType: 'private' | 'dealer' | 'company';
  pricing: {
    monthly: number;  // in EUR
    annual: number;   // in EUR
  };
  listingCap: number;  // -1 for unlimited
  features: string[];  // Feature keys
  popular?: boolean;
  recommended?: boolean;
}

export interface Subscription {
  userId: string;
  planId: PlanTier;
  status: PlanStatus;
  interval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;  // in EUR cents
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  created: Date;
  dueDate?: Date;
  paidAt?: Date;
  invoiceUrl?: string;
  invoicePdf?: string;
  stripeInvoiceId?: string;
}

