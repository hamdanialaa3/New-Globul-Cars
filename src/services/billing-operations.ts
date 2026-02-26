/**
 * Billing Operations
 * عمليات الفوترة
 *
 * This module contains all core business logic operations for the billing system.
 * يحتوي هذا الوحدة على جميع عمليات منطق الأعمال الأساسية لنظام الفوترة.
 */

import { httpsCallable } from 'firebase/functions';
import { loadStripe, Stripe } from '@stripe/stripe-js/pure';
import { functions } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { normalizeError } from '../utils/error-helpers';
import {
  BillingTier,
  Invoice,
  InvoiceItem,
  PaymentIntent,
  AccountStatus,
  CreateAccountResponse,
  InvoiceGenerationParams,
  InvoiceQueryParams,
  InvoiceResponse,
  InvoicesResponse,
  StatusUpdateResponse,
  EmailSendResponse,
  InvoiceCalculation,
  BusinessType,
} from './billing-types';
import {
  STRIPE_CONFIG,
  BILLING_TIERS,
  PLATFORM_FEES,
  CURRENCY_CONFIG,
  INVOICE_CONFIG,
  STRIPE_CONNECT_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './billing-data';

/**
 * Invoice status colors
 * ألوان حالات الفواتير
 */
const INVOICE_STATUS_COLORS = {
  draft: '#6b7280',
  sent: '#3b82f6',
  paid: '#10b981',
  cancelled: '#ef4444',
};

/**
 * Invoice status translations
 * ترجمات حالات الفواتير
 */
const INVOICE_STATUS_TRANSLATIONS = {
  draft: { bg: 'Чернова', en: 'Draft' },
  sent: { bg: 'Изпратена', en: 'Sent' },
  paid: { bg: 'Платена', en: 'Paid' },
  cancelled: { bg: 'Отменена', en: 'Cancelled' },
};

/**
 * Stripe Client Operations
 * عمليات عميل Stripe
 */
export class StripeClientOperations {
  private static stripe: Stripe | null = null;
  private static stripePromise: Promise<Stripe | null> | null = null;
  private static loadingFailed = false;
  private static warnedDisabled = false;

  /**
   * Get Stripe instance
   * الحصول على مثيل Stripe
   */
  static async getStripeInstance(): Promise<Stripe | null> {
    // Disable Stripe on homepage for performance; enable only on payment pages
    const stripeEnabled = import.meta.env.VITE_ENABLE_STRIPE === 'true';
    const isHomepage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
    
    if (!stripeEnabled || isHomepage) {
      if (!this.warnedDisabled && !stripeEnabled) {
        serviceLogger.warn('Stripe disabled (VITE_ENABLE_STRIPE not set)');
        this.warnedDisabled = true;
      }
      this.loadingFailed = true;
      return null;
    }

    // If loading failed before, don't retry
    if (this.loadingFailed) {
      return null;
    }

    // Check if publishable key is configured
    if (!STRIPE_CONFIG.PUBLISHABLE_KEY || STRIPE_CONFIG.PUBLISHABLE_KEY === 'undefined') {
      if (!this.loadingFailed) {
        serviceLogger.warn('Stripe publishable key not configured - payments disabled');
        this.loadingFailed = true;
      }
      return null;
    }

    // Return cached instance if available
    if (this.stripe) {
      return this.stripe;
    }

    // Initialize Stripe promise if not already started
    if (!this.stripePromise) {
      try {
        this.stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY).catch((error) => {
          serviceLogger.error('Failed to load Stripe.js', error);
          this.loadingFailed = true;
          return null;
        });
      } catch (error) {
        serviceLogger.error('Error creating Stripe promise', error);
        this.loadingFailed = true;
        return null;
      }
    }

    // Await and cache the Stripe instance
    try {
      this.stripe = await this.stripePromise;
      if (this.stripe) {
        serviceLogger.info('Stripe loaded successfully');
      }
    } catch (error) {
      serviceLogger.error('Failed to initialize Stripe', error);
      this.loadingFailed = true;
      return null;
    }

    return this.stripe;
  }

  /**
   * Initialize Stripe
   * تهيئة Stripe
   */
  static async initializeStripe(): Promise<Stripe | null> {
    return this.getStripeInstance();
  }

  /**
   * Redirect to checkout
   * إعادة توجيه إلى الدفع
   */
  static async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error(ERROR_MESSAGES.STRIPE_NOT_INITIALIZED);
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      serviceLogger.error('Stripe checkout redirect failed', new Error(error.message));
      throw new Error(error.message);
    }
  }

  /**
   * Confirm card payment
   * تأكيد دفع البطاقة
   */
  static async confirmCardPayment(clientSecret: string, paymentDetails: any): Promise<any> {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error(ERROR_MESSAGES.STRIPE_NOT_INITIALIZED);
    }

    const result = await stripe.confirmCardPayment(clientSecret, paymentDetails);

    if (result.error) {
      serviceLogger.error('Card payment confirmation failed', new Error(result.error.message));
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  }

  /**
   * Retrieve payment intent
   * استرجاع نية الدفع
   */
  static async retrievePaymentIntent(clientSecret: string): Promise<any> {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error(ERROR_MESSAGES.STRIPE_NOT_INITIALIZED);
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    return paymentIntent;
  }
}

/**
 * Subscription Operations
 * عمليات الاشتراك
 */
export class SubscriptionOperations {
  /**
   * Create checkout session
   * إنشاء جلسة دفع
   */
  static async createCheckoutSession(
    tierId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<any> {
    try {
      const tier = BILLING_TIERS.find(t => t.id === tierId);
      if (!tier) {
        throw new Error(`${ERROR_MESSAGES.INVALID_TIER}: ${tierId}`);
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

      serviceLogger.info(SUCCESS_MESSAGES.CHECKOUT_SESSION_CREATED, { sessionId: (result.data as any).sessionId, tierId });
      return result.data;
    } catch (error) {
      serviceLogger.error('Failed to create checkout session', error, { tierId, userId });
      throw error;
    }
  }

  /**
   * Get subscription status
   * الحصول على حالة الاشتراك
   */
  static async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      const getSubscriptionStatusFn = httpsCallable(functions, 'getSubscriptionStatus');
      const result = await getSubscriptionStatusFn({ userId });
      return result.data;
    } catch (error) {
      serviceLogger.error('Failed to get subscription status', error, { userId });
      throw error;
    }
  }

  /**
   * Cancel subscription
   * إلغاء الاشتراك
   */
  static async cancelSubscription(userId: string): Promise<any> {
    try {
      const cancelSubscriptionFn = httpsCallable(functions, 'cancelSubscription');
      const result = await cancelSubscriptionFn({ userId });
      serviceLogger.info(SUCCESS_MESSAGES.SUBSCRIPTION_CANCELLED, { userId });
      return result.data;
    } catch (error) {
      serviceLogger.error('Failed to cancel subscription', error, { userId });
      throw error;
    }
  }

  /**
   * Update payment method
   * تحديث طريقة الدفع
   */
  static async updatePaymentMethod(userId: string): Promise<any> {
    try {
      const updatePaymentMethodFn = httpsCallable(functions, 'updatePaymentMethod');
      const result = await updatePaymentMethodFn({ userId });
      return result.data;
    } catch (error) {
      serviceLogger.error('Failed to update payment method', error, { userId });
      throw error;
    }
  }
}

/**
 * Stripe Connect Operations
 * عمليات Stripe Connect
 */
export class StripeConnectOperations {
  /**
   * Create seller account
   * إنشاء حساب البائع
   */
  static async createSellerAccount(
    email: string,
    businessName?: string,
    businessType: BusinessType = 'individual'
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
        country: STRIPE_CONNECT_CONFIG.COUNTRY,
        returnUrl: `${window.location.origin}${STRIPE_CONNECT_CONFIG.RETURN_URL_PATH}`,
        refreshUrl: `${window.location.origin}${STRIPE_CONNECT_CONFIG.REFRESH_URL_PATH}`
      });

      return result.data;
    } catch (error: unknown) {
      serviceLogger.error('Error creating Stripe account', error as Error, { email, businessType });
      throw new Error((error as Error).message || ERROR_MESSAGES.ACCOUNT_CREATION_FAILED);
    }
  }

  /**
   * Get account status
   * الحصول على حالة الحساب
   */
  static async getAccountStatus(): Promise<AccountStatus> {
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

  /**
   * Create payment intent
   * إنشاء نية دفع
   */
  static async createPaymentIntent(
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
        currency: CURRENCY_CONFIG.DEFAULT,
        buyerId
      });

      return result.data;
    } catch (error: unknown) {
      serviceLogger.error('Error creating payment intent', error as Error, { carId, amount, buyerId });
      throw new Error((error as Error).message || ERROR_MESSAGES.PAYMENT_CREATION_FAILED);
    }
  }

  /**
   * Confirm payment
   * تأكيد الدفع
   */
  static async confirmPayment(paymentId: string): Promise<{ success: boolean }> {
    try {
      const confirmPayment = httpsCallable<any, { success: boolean }>(
        functions,
        'confirmCarPayment'
      );

      const result = await confirmPayment({ paymentId });
      return result.data;
    } catch (error: unknown) {
      serviceLogger.error('Error confirming payment', error as Error, { paymentId });
      throw new Error((error as Error).message || ERROR_MESSAGES.PAYMENT_CONFIRMATION_FAILED);
    }
  }
}

/**
 * Invoice Operations
 * عمليات الفواتير
 */
export class InvoiceOperations {
  /**
   * Generate invoice
   * إنشاء فاتورة
   */
  static async generateInvoice(data: InvoiceGenerationParams): Promise<InvoiceResponse> {
    try {
      const generateInvoiceFn = httpsCallable(functions, 'generateInvoice');
      const result = await generateInvoiceFn(data);
      return result.data as InvoiceResponse;
    } catch (error: unknown) {
      serviceLogger.error('Error generating invoice', error as Error);
      throw error;
    }
  }

  /**
   * Get invoices
   * الحصول على الفواتير
   */
  static async getInvoices(params?: InvoiceQueryParams): Promise<InvoicesResponse> {
    try {
      const getInvoicesFn = httpsCallable(functions, 'getInvoices');
      const result = await getInvoicesFn(params || {});
      return result.data as InvoicesResponse;
    } catch (error: unknown) {
      serviceLogger.error('Error getting invoices', error as Error, { params });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get invoice by ID
   * الحصول على فاتورة بالمعرف
   */
  static async getInvoice(invoiceId: string): Promise<InvoiceResponse> {
    try {
      const getInvoiceFn = httpsCallable(functions, 'getInvoice');
      const result = await getInvoiceFn({ invoiceId });
      return result.data as InvoiceResponse;
    } catch (error: unknown) {
      serviceLogger.error('Error getting invoice', error as Error, { invoiceId });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Update invoice status
   * تحديث حالة الفاتورة
   */
  static async updateInvoiceStatus(
    invoiceId: string,
    status: string,
    notes?: string
  ): Promise<StatusUpdateResponse> {
    try {
      const updateInvoiceStatusFn = httpsCallable(functions, 'updateInvoiceStatus');
      const result = await updateInvoiceStatusFn({ invoiceId, status, notes });
      return result.data as StatusUpdateResponse;
    } catch (error: unknown) {
      serviceLogger.error('Error updating invoice status', error as Error, { invoiceId, status });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Send invoice email
   * إرسال فاتورة بالبريد الإلكتروني
   */
  static async sendInvoiceEmail(
    invoiceId: string,
    recipientEmail?: string
  ): Promise<EmailSendResponse> {
    try {
      const sendInvoiceEmailFn = httpsCallable(functions, 'sendInvoiceEmail');
      const result = await sendInvoiceEmailFn({ invoiceId, recipientEmail });
      return result.data as EmailSendResponse;
    } catch (error: unknown) {
      serviceLogger.error('Error sending invoice email', error as Error, { invoiceId, recipientEmail });
      return { success: false, error: (error as Error).message };
    }
  }
}

/**
 * Utility Operations
 * عمليات المساعدة
 */
export class UtilityOperations {
  /**
   * Calculate platform fee
   * حساب رسوم المنصة
   */
  static calculatePlatformFee(amount: number, feePercent: number = PLATFORM_FEES.DEFAULT_PERCENTAGE): number {
    return parseFloat((amount * (feePercent / 100)).toFixed(2));
  }

  /**
   * Calculate seller amount
   * حساب مبلغ البائع
   */
  static calculateSellerAmount(amount: number, feePercent: number = PLATFORM_FEES.DEFAULT_PERCENTAGE): number {
    const fee = this.calculatePlatformFee(amount, feePercent);
    return parseFloat((amount - fee).toFixed(2));
  }

  /**
   * Format currency
   * تنسيق العملة
   */
  static formatCurrency(amount: number, currency: string = CURRENCY_CONFIG.DEFAULT): string {
    return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Format invoice number
   * تنسيق رقم الفاتورة
   */
  static formatInvoiceNumber(invoiceNumber: string): string {
    return invoiceNumber;
  }

  /**
   * Calculate invoice total
   * حساب إجمالي الفاتورة
   */
  static calculateInvoiceTotal(items: InvoiceItem[]): InvoiceCalculation {
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
  }

  /**
   * Format currency for invoices
   * تنسيق العملة للفواتير
   */
  static formatInvoiceCurrency(amount: number, currency: 'BGN' | 'EUR' = INVOICE_CONFIG.DEFAULT_CURRENCY): string {
    return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format date
   * تنسيق التاريخ
   */
  static formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(CURRENCY_CONFIG.LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }

  /**
   * Get invoice status color
   * الحصول على لون حالة الفاتورة
   */
  static getInvoiceStatusColor(status: string): string {
    return INVOICE_STATUS_COLORS[status] || INVOICE_STATUS_COLORS.draft;
  }

  /**
   * Get invoice status text
   * الحصول على نص حالة الفاتورة
   */
  static getInvoiceStatusText(status: string, language: 'bg' | 'en' = 'bg'): string {
    return INVOICE_STATUS_TRANSLATIONS[status]?.[language] || status;
  }
}