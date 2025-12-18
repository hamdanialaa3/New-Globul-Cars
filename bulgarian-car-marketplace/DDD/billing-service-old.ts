// Unified Billing Service - Consolidated Billing & Payment System
// خدمة الفوترة الموحدة - نظام دفع وفوترة موحد
// Location: Bulgaria | Languages: BG/EN | Currency: EUR/BGN

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { serviceLogger } from './logger-service';

// ==================== STRIPE CONFIGURATION ====================

const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const STRIPE_PRICES = {
  basic: process.env.REACT_APP_STRIPE_PRICE_BASIC,
  premium: process.env.REACT_APP_STRIPE_PRICE_PREMIUM,
  enterprise: process.env.REACT_APP_STRIPE_PRICE_ENTERPRISE,
  dealer_basic: process.env.REACT_APP_STRIPE_PRICE_DEALER_BASIC,
  dealer_premium: process.env.REACT_APP_STRIPE_PRICE_DEALER_PREMIUM,
  dealer_enterprise: process.env.REACT_APP_STRIPE_PRICE_DEALER_ENTERPRISE,
  company_basic: process.env.REACT_APP_STRIPE_PRICE_COMPANY_BASIC,
  company_premium: process.env.REACT_APP_STRIPE_PRICE_COMPANY_PREMIUM,
  company_enterprise: process.env.REACT_APP_STRIPE_PRICE_COMPANY_ENTERPRISE,
};

// ==================== INTERFACES ====================

export interface BillingTier {
  id: string;
  name: string;
  priceId: string;
  amount: number;
  currency: string;
  features: string[];
  maxListings?: number;
  teamSize?: number;
  support: 'basic' | 'priority' | 'dedicated';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  seller: {
    name: string;
    address: string;
    eik: string;
    vatNumber?: string;
    mol: string;
    phone?: string;
    email?: string;
  };
  buyer: {
    name: string;
    address: string;
    eik?: string;
    vatNumber?: string;
    mol?: string;
    phone?: string;
    email?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  currency: 'BGN' | 'EUR';
  issueDate: Date;
  dueDate: Date;
  paymentMethod: 'card' | 'bank_transfer' | 'cash';
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  notes?: string;
  userId: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  amount: number;
}

export interface PaymentIntent {
  success: boolean;
  paymentId: string;
  clientSecret?: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
  message?: string;
}

export interface AccountStatus {
  hasAccount: boolean;
  onboardingComplete: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirements?: any;
}

export interface CreateAccountResponse {
  success: boolean;
  accountId: string;
  onboardingUrl: string;
  message?: string;
}

// ==================== BILLING TIERS ====================

export const billingTiers: BillingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceId: STRIPE_PRICES.basic,
    amount: 999, // €9.99
    currency: 'eur',
    features: ['Up to 50 listings', 'Basic support', 'Standard features'],
    maxListings: 50,
    support: 'basic'
  },
  {
    id: 'premium',
    name: 'Premium',
    priceId: STRIPE_PRICES.premium,
    amount: 2999, // €29.99
    currency: 'eur',
    features: ['Up to 200 listings', 'Priority support', 'Advanced features'],
    maxListings: 200,
    support: 'priority'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceId: STRIPE_PRICES.enterprise,
    amount: 9999, // €99.99
    currency: 'eur',
    features: ['Unlimited listings', 'Dedicated support', 'All features'],
    maxListings: -1, // unlimited
    support: 'dedicated'
  },
  {
    id: 'dealer_basic',
    name: 'Dealer Basic',
    priceId: STRIPE_PRICES.dealer_basic,
    amount: 4999, // €49.99
    currency: 'eur',
    features: ['Up to 500 listings', 'Team of 3', 'Priority support', 'Dealer features'],
    maxListings: 500,
    teamSize: 3,
    support: 'priority'
  },
  {
    id: 'dealer_premium',
    name: 'Dealer Premium',
    priceId: STRIPE_PRICES.dealer_premium,
    amount: 9999, // €99.99
    currency: 'eur',
    features: ['Up to 2000 listings', 'Team of 10', 'Dedicated support', 'Advanced dealer features'],
    maxListings: 2000,
    teamSize: 10,
    support: 'dedicated'
  },
  {
    id: 'dealer_enterprise',
    name: 'Dealer Enterprise',
    priceId: STRIPE_PRICES.dealer_enterprise,
    amount: 24999, // €249.99
    currency: 'eur',
    features: ['Unlimited listings', 'Unlimited team', 'White-label solution', 'API access'],
    maxListings: -1,
    teamSize: -1,
    support: 'dedicated'
  },
  {
    id: 'company_basic',
    name: 'Company Basic',
    priceId: STRIPE_PRICES.company_basic,
    amount: 7999, // €79.99
    currency: 'eur',
    features: ['Up to 1000 listings', 'Company verification', 'Priority support', 'Analytics'],
    maxListings: 1000,
    support: 'priority'
  },
  {
    id: 'company_premium',
    name: 'Company Premium',
    priceId: STRIPE_PRICES.company_premium,
    amount: 14999, // €149.99
    currency: 'eur',
    features: ['Up to 5000 listings', 'Advanced analytics', 'Dedicated support', 'Custom integrations'],
    maxListings: 5000,
    support: 'dedicated'
  },
  {
    id: 'company_enterprise',
    name: 'Company Enterprise',
    priceId: STRIPE_PRICES.company_enterprise,
    amount: 39999, // €399.99
    currency: 'eur',
    features: ['Unlimited listings', 'Full white-label', 'Custom development', '24/7 support'],
    maxListings: -1,
    support: 'dedicated'
  },
];

// ==================== UNIFIED BILLING SERVICE ====================

class UnifiedBillingService {
  private stripe: Stripe | null = null;
  private stripePromise: Promise<Stripe | null> | null = null;

  // ==================== STRIPE CLIENT METHODS ====================

  async getStripeInstance(): Promise<Stripe | null> {
    if (!STRIPE_PUBLISHABLE_KEY) {
      serviceLogger.warn('Stripe publishable key not configured');
      return null;
    }

    if (!this.stripePromise) {
      this.stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }

    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }

    return this.stripe;
  }

  async initializeStripe() {
    if (!this.stripe && STRIPE_PUBLISHABLE_KEY) {
      try {
        this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        serviceLogger.info('Stripe initialized successfully');
      } catch (error) {
        serviceLogger.error('Failed to initialize Stripe', error);
        throw error;
      }
    }
    return this.stripe;
  }

  async redirectToCheckout(sessionId: string) {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      serviceLogger.error('Stripe checkout redirect failed', error);
      throw new Error(error.message);
    }
  }

  async confirmCardPayment(clientSecret: string, paymentDetails: any) {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const result = await stripe.confirmCardPayment(clientSecret, paymentDetails);

    if (result.error) {
      serviceLogger.error('Card payment confirmation failed', result.error);
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  }

  async retrievePaymentIntent(clientSecret: string) {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    return paymentIntent;
  }

  // ==================== SUBSCRIPTION METHODS ====================

  async createCheckoutSession(tierId: string, userId: string, successUrl: string, cancelUrl: string) {
    try {
      const tier = billingTiers.find(t => t.id === tierId);
      if (!tier) {
        throw new Error(`Invalid tier: ${tierId}`);
      }

      const createCheckoutSessionFn = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSessionFn({
        priceId: tier.priceId,
        userId,
        successUrl,
        cancelUrl,
        metadata: {
          tierId,
          userEmail: ''
        }
      });

      serviceLogger.info('Checkout session created', { sessionId: result.data.sessionId, tierId });
      return result.data;
    } catch (error) {
      serviceLogger.error('Failed to create checkout session', error, { tierId, userId });
      throw error;
    }
  }

  async getSubscriptionStatus(userId: string) {
    try {
      const getSubscriptionStatusFn = httpsCallable(functions, 'getSubscriptionStatus');
      const result = await getSubscriptionStatusFn({ userId });
      return result.data;
    } catch (error) {
      serviceLogger.error('Failed to get subscription status', error, { userId });
      throw error;
    }
  }

  async cancelSubscription(userId: string) {
    try {
      const cancelSubscriptionFn = httpsCallable(functions, 'cancelSubscription');
      const result = await cancelSubscriptionFn({ userId });
      serviceLogger.info('Subscription cancelled', { userId });
      return result.data;
    } catch (error) {
      serviceLogger.error('Failed to cancel subscription', error, { userId });
      throw error;
    }
  }

  async updatePaymentMethod(userId: string) {
    try {
      const updatePaymentMethodFn = httpsCallable(functions, 'updatePaymentMethod');
      const result = await updatePaymentMethodFn({ userId });
      return result.data;
    } catch (error) {
      serviceLogger.error('Failed to update payment method', error, { userId });
      throw error;
    }
  }

  getTierById(tierId: string): BillingTier | undefined {
    return billingTiers.find(tier => tier.id === tierId);
  }

  getAllTiers(): BillingTier[] {
    return billingTiers;
  }

  // ==================== STRIPE CONNECT METHODS ====================

  async createSellerAccount(
    email: string,
    businessName?: string,
    businessType: 'individual' | 'company' = 'individual'
  ): Promise<CreateAccountResponse> {
    try {
      const createAccount = httpsCallable<any, CreateAccountResponse>(
        functions,
        'createStripeSellerAccount'
      );

      const result = await createAccount({
        email,
        businessName,
        businessType,
        country: 'BG',
        returnUrl: `${window.location.origin}/seller/dashboard`,
        refreshUrl: `${window.location.origin}/seller/stripe-refresh`
      });

      return result.data;
    } catch (error: unknown) {
      serviceLogger.error('Error creating Stripe account', error as Error, { email, businessType });
      throw new Error((error as Error).message || 'Failed to create Stripe account');
    }
  }

  async getAccountStatus(): Promise<AccountStatus> {
    try {
      const getStatus = httpsCallable<any, AccountStatus>(
        functions,
        'getStripeAccountStatus'
      );

      const result = await getStatus();
      return result.data;
    } catch (error: unknown) {
      serviceLogger.error('Error getting account status', error as Error);
      throw new Error((error as Error).message || 'Failed to get account status');
    }
  }

  async createPaymentIntent(
    carId: string,
    amount: number,
    buyerId: string
  ): Promise<PaymentIntent> {
    try {
      const createPayment = httpsCallable<any, PaymentIntent>(
        functions,
        'createCarPaymentIntent'
      );

      const result = await createPayment({
        carId,
        amount,
        currency: 'EUR',
        buyerId
      });

      return result.data;
    } catch (error: unknown) {
      serviceLogger.error('Error creating payment intent', error as Error, { carId, amount, buyerId });
      throw new Error((error as Error).message || 'Failed to create payment');
    }
  }

  async confirmPayment(paymentId: string): Promise<{ success: boolean }> {
    try {
      const confirmPayment = httpsCallable<any, { success: boolean }>(
        functions,
        'confirmCarPayment'
      );

      const result = await confirmPayment({ paymentId });
      return result.data;
    } catch (error: unknown) {
      serviceLogger.error('Error confirming payment', error as Error, { paymentId });
      throw new Error((error as Error).message || 'Failed to confirm payment');
    }
  }

  calculatePlatformFee(amount: number, feePercent: number = 5): number {
    return parseFloat((amount * (feePercent / 100)).toFixed(2));
  }

  calculateSellerAmount(amount: number, feePercent: number = 5): number {
    const fee = this.calculatePlatformFee(amount, feePercent);
    return parseFloat((amount - fee).toFixed(2));
  }

  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency
    }).format(amount);
  }
}

// ==================== INVOICE FUNCTIONS ====================

export const generateInvoice = async (data: {
  buyerName: string;
  buyerAddress: string;
  buyerEIK?: string;
  buyerVATNumber?: string;
  buyerMOL?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  items: InvoiceItem[];
  currency?: 'BGN' | 'EUR';
  paymentMethod: 'card' | 'bank_transfer' | 'cash';
  dueDate?: string;
  notes?: string;
  transactionId?: string;
}): Promise<{
  success: boolean;
  invoice?: Invoice;
  invoiceId?: string;
  error?: string;
}> => {
  try {
    const generateInvoiceFn = httpsCallable(functions, 'generateInvoice');
    const result = await generateInvoiceFn(data);
    return result.data as any;
  } catch (error: unknown) {
    serviceLogger.error('Error generating invoice', error as Error);
    throw error;
  }
};

export const getInvoices = async (params?: {
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  invoices?: Invoice[];
  total?: number;
  error?: string;
}> => {
  try {
    const getInvoicesFn = httpsCallable(functions, 'getInvoices');
    const result = await getInvoicesFn(params || {});
    return result.data as any;
  } catch (error: unknown) {
    serviceLogger.error('Error getting invoices', error as Error, { params });
    return { success: false, error: (error as Error).message };
  }
};

export const getInvoice = async (
  invoiceId: string
): Promise<{
  success: boolean;
  invoice?: Invoice;
  error?: string;
}> => {
  try {
    const getInvoiceFn = httpsCallable(functions, 'getInvoice');
    const result = await getInvoiceFn({ invoiceId });
    return result.data as any;
  } catch (error: unknown) {
    serviceLogger.error('Error getting invoice', error as Error, { invoiceId });
    return { success: false, error: (error as Error).message };
  }
};

export const updateInvoiceStatus = async (
  invoiceId: string,
  status: 'draft' | 'sent' | 'paid' | 'cancelled',
  notes?: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const updateInvoiceStatusFn = httpsCallable(functions, 'updateInvoiceStatus');
    const result = await updateInvoiceStatusFn({ invoiceId, status, notes });
    return result.data as any;
  } catch (error: unknown) {
    serviceLogger.error('Error updating invoice status', error as Error, { invoiceId, status });
    return { success: false, error: (error as Error).message };
  }
};

export const sendInvoiceEmail = async (
  invoiceId: string,
  recipientEmail?: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const sendInvoiceEmailFn = httpsCallable(functions, 'sendInvoiceEmail');
    const result = await sendInvoiceEmailFn({ invoiceId, recipientEmail });
    return result.data as any;
  } catch (error: unknown) {
    serviceLogger.error('Error sending invoice email', error as Error, { invoiceId, recipientEmail });
    return { success: false, error: (error as Error).message };
  }
};

// ==================== HELPER FUNCTIONS ====================

export const formatInvoiceNumber = (invoiceNumber: string): string => {
  // Format: 2025-10-0001 -> 2025-10-0001
  return invoiceNumber;
};

export const calculateInvoiceTotal = (items: InvoiceItem[]): {
  subtotal: number;
  vatAmount: number;
  total: number;
} => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = items.reduce((sum, item) => {
    const itemVat = (item.amount * item.vatRate) / 100;
    return sum + itemVat;
  }, 0);
  const total = subtotal + vatAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

export const formatCurrency = (amount: number, currency: 'BGN' | 'EUR'): string => {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

export const getInvoiceStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return '#9e9e9e';
    case 'sent':
      return '#2196f3';
    case 'paid':
      return '#4caf50';
    case 'cancelled':
      return '#f44336';
    default:
      return '#757575';
  }
};

export const getInvoiceStatusText = (status: string, language: 'bg' | 'en' = 'bg'): string => {
  const translations: Record<string, { bg: string; en: string }> = {
    draft: { bg: 'Чернова', en: 'Draft' },
    sent: { bg: 'Изпратена', en: 'Sent' },
    paid: { bg: 'Платена', en: 'Paid' },
    cancelled: { bg: 'Отказана', en: 'Cancelled' },
  };

  return translations[status]?.[language] || status;
};

// ==================== EXPORTS ====================

export const unifiedBillingService = new UnifiedBillingService();

// Legacy exports for backward compatibility
export const stripeService = unifiedBillingService;
export const stripeClientService = unifiedBillingService;
export const getStripeInstance = () => unifiedBillingService.getStripeInstance();

export default unifiedBillingService;
