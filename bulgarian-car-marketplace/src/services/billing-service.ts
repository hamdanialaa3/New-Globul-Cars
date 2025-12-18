/**
 * Billing Service
 * خدمة الفوترة
 *
 * This module provides the main orchestrator for the billing system using the singleton pattern.
 * يوفر هذا الوحدة المنسق الرئيسي لنظام الفوترة باستخدام نمط الـ singleton.
 */

import { StripeClientOperations, SubscriptionOperations, StripeConnectOperations, InvoiceOperations, UtilityOperations } from './billing-operations';
import { BILLING_TIERS } from './billing-data';
import {
  BillingTier,
  InvoiceGenerationParams,
  InvoiceQueryParams,
  InvoiceResponse,
  InvoicesResponse,
  StatusUpdateResponse,
  EmailSendResponse,
  BusinessType,
} from './billing-types';

/**
 * Unified Billing Service Class
 * فئة خدمة الفوترة الموحدة
 */
class UnifiedBillingService {
  private static instance: UnifiedBillingService;

  private constructor() {}

  /**
   * Get singleton instance
   * الحصول على مثيل singleton
   */
  static getInstance(): UnifiedBillingService {
    if (!UnifiedBillingService.instance) {
      UnifiedBillingService.instance = new UnifiedBillingService();
    }
    return UnifiedBillingService.instance;
  }

  // ==================== STRIPE CLIENT METHODS ====================

  /**
   * Get Stripe instance
   * الحصول على مثيل Stripe
   */
  async getStripeInstance() {
    return StripeClientOperations.getStripeInstance();
  }

  /**
   * Initialize Stripe
   * تهيئة Stripe
   */
  async initializeStripe() {
    return StripeClientOperations.initializeStripe();
  }

  /**
   * Redirect to checkout
   * إعادة توجيه إلى الدفع
   */
  async redirectToCheckout(sessionId: string) {
    return StripeClientOperations.redirectToCheckout(sessionId);
  }

  /**
   * Confirm card payment
   * تأكيد دفع البطاقة
   */
  async confirmCardPayment(clientSecret: string, paymentDetails: any) {
    return StripeClientOperations.confirmCardPayment(clientSecret, paymentDetails);
  }

  /**
   * Retrieve payment intent
   * استرجاع نية الدفع
   */
  async retrievePaymentIntent(clientSecret: string) {
    return StripeClientOperations.retrievePaymentIntent(clientSecret);
  }

  // ==================== SUBSCRIPTION METHODS ====================

  /**
   * Create checkout session
   * إنشاء جلسة دفع
   */
  async createCheckoutSession(tierId: string, userId: string, successUrl: string, cancelUrl: string) {
    return SubscriptionOperations.createCheckoutSession(tierId, userId, successUrl, cancelUrl);
  }

  /**
   * Get subscription status
   * الحصول على حالة الاشتراك
   */
  async getSubscriptionStatus(userId: string) {
    return SubscriptionOperations.getSubscriptionStatus(userId);
  }

  /**
   * Cancel subscription
   * إلغاء الاشتراك
   */
  async cancelSubscription(userId: string) {
    return SubscriptionOperations.cancelSubscription(userId);
  }

  /**
   * Update payment method
   * تحديث طريقة الدفع
   */
  async updatePaymentMethod(userId: string) {
    return SubscriptionOperations.updatePaymentMethod(userId);
  }

  /**
   * Get tier by ID
   * الحصول على المستوى بالمعرف
   */
  getTierById(tierId: string): BillingTier | undefined {
    return BILLING_TIERS.find(tier => tier.id === tierId);
  }

  /**
   * Get all tiers
   * الحصول على جميع المستويات
   */
  getAllTiers(): BillingTier[] {
    return BILLING_TIERS;
  }

  // ==================== STRIPE CONNECT METHODS ====================

  /**
   * Create seller account
   * إنشاء حساب البائع
   */
  async createSellerAccount(
    email: string,
    businessName?: string,
    businessType: BusinessType = 'individual'
  ) {
    return StripeConnectOperations.createSellerAccount(email, businessName, businessType);
  }

  /**
   * Get account status
   * الحصول على حالة الحساب
   */
  async getAccountStatus() {
    return StripeConnectOperations.getAccountStatus();
  }

  /**
   * Create payment intent
   * إنشاء نية دفع
   */
  async createPaymentIntent(carId: string, amount: number, buyerId: string) {
    return StripeConnectOperations.createPaymentIntent(carId, amount, buyerId);
  }

  /**
   * Confirm payment
   * تأكيد الدفع
   */
  async confirmPayment(paymentId: string) {
    return StripeConnectOperations.confirmPayment(paymentId);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Calculate platform fee
   * حساب رسوم المنصة
   */
  calculatePlatformFee(amount: number, feePercent: number = 5) {
    return UtilityOperations.calculatePlatformFee(amount, feePercent);
  }

  /**
   * Calculate seller amount
   * حساب مبلغ البائع
   */
  calculateSellerAmount(amount: number, feePercent: number = 5) {
    return UtilityOperations.calculateSellerAmount(amount, feePercent);
  }

  /**
   * Format currency
   * تنسيق العملة
   */
  formatCurrency(amount: number, currency: string = 'EUR') {
    return UtilityOperations.formatCurrency(amount, currency);
  }
}

// ==================== INVOICE FUNCTIONS ====================

/**
 * Generate invoice
 * إنشاء فاتورة
 */
export const generateInvoice = async (data: InvoiceGenerationParams): Promise<InvoiceResponse> => {
  return InvoiceOperations.generateInvoice(data);
};

/**
 * Get invoices
 * الحصول على الفواتير
 */
export const getInvoices = async (params?: InvoiceQueryParams): Promise<InvoicesResponse> => {
  return InvoiceOperations.getInvoices(params);
};

/**
 * Get invoice
 * الحصول على فاتورة
 */
export const getInvoice = async (invoiceId: string): Promise<InvoiceResponse> => {
  return InvoiceOperations.getInvoice(invoiceId);
};

/**
 * Update invoice status
 * تحديث حالة الفاتورة
 */
export const updateInvoiceStatus = async (
  invoiceId: string,
  status: 'draft' | 'sent' | 'paid' | 'cancelled',
  notes?: string
): Promise<StatusUpdateResponse> => {
  return InvoiceOperations.updateInvoiceStatus(invoiceId, status, notes);
};

/**
 * Send invoice email
 * إرسال فاتورة بالبريد الإلكتروني
 */
export const sendInvoiceEmail = async (
  invoiceId: string,
  recipientEmail?: string
): Promise<EmailSendResponse> => {
  return InvoiceOperations.sendInvoiceEmail(invoiceId, recipientEmail);
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format invoice number
 * تنسيق رقم الفاتورة
 */
export const formatInvoiceNumber = (invoiceNumber: string): string => {
  return UtilityOperations.formatInvoiceNumber(invoiceNumber);
};

/**
 * Calculate invoice total
 * حساب إجمالي الفاتورة
 */
export const calculateInvoiceTotal = (items: any[]) => {
  return UtilityOperations.calculateInvoiceTotal(items);
};

/**
 * Format currency for invoices
 * تنسيق العملة للفواتير
 */
export const formatCurrency = (amount: number, currency: 'BGN' | 'EUR' = 'BGN'): string => {
  return UtilityOperations.formatInvoiceCurrency(amount, currency);
};

/**
 * Format date
 * تنسيق التاريخ
 */
export const formatDate = (date: Date | string): string => {
  return UtilityOperations.formatDate(date);
};

/**
 * Get invoice status color
 * الحصول على لون حالة الفاتورة
 */
export const getInvoiceStatusColor = (status: string): string => {
  return UtilityOperations.getInvoiceStatusColor(status);
};

/**
 * Get invoice status text
 * الحصول على نص حالة الفاتورة
 */
export const getInvoiceStatusText = (status: string, language: 'bg' | 'en' = 'bg'): string => {
  return UtilityOperations.getInvoiceStatusText(status, language);
};

// ==================== EXPORTS ====================

export const unifiedBillingService = UnifiedBillingService.getInstance();

// Legacy exports for backward compatibility
export const stripeService = unifiedBillingService;
export const stripeClientService = unifiedBillingService;
export const getStripeInstance = () => unifiedBillingService.getStripeInstance();

export default unifiedBillingService;
