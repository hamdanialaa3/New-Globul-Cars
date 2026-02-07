/**
 * Billing Data
 * بيانات الفوترة
 *
 * This module contains all constants, configurations, and static data for the billing system.
 * يحتوي هذا الوحدة على جميع الثوابت والإعدادات والبيانات الثابتة لنظام الفوترة.
 */

import { BillingTier } from './billing-types';

/**
 * Stripe configuration
 * إعدادات Stripe
 */
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  PRICES: {
    basic: import.meta.env.VITE_STRIPE_PRICE_BASIC,
    premium: import.meta.env.VITE_STRIPE_PRICE_PREMIUM,
    enterprise: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE,
    dealer_basic: import.meta.env.VITE_STRIPE_PRICE_DEALER_BASIC,
    dealer_premium: import.meta.env.VITE_STRIPE_PRICE_DEALER_PREMIUM,
    dealer_enterprise: import.meta.env.VITE_STRIPE_PRICE_DEALER_ENTERPRISE,
    company_basic: import.meta.env.VITE_STRIPE_PRICE_COMPANY_BASIC,
    company_premium: import.meta.env.VITE_STRIPE_PRICE_COMPANY_PREMIUM,
    company_enterprise: import.meta.env.VITE_STRIPE_PRICE_COMPANY_ENTERPRISE,
  },
} as const;

/**
 * Billing tiers configuration
 * إعدادات مستويات الفوترة
 * 
 * ⚠️ LEGACY: This is an OLD billing system with different tiers (basic, premium, enterprise, etc.)
 * ✅ CURRENT SYSTEM: Use SUBSCRIPTION_PLANS from subscription-plans.ts instead
 * 
 * This file is kept for backward compatibility only.
 * For new code, always use SUBSCRIPTION_PLANS (free, dealer, company).
 */
export const BILLING_TIERS: BillingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceId: STRIPE_CONFIG.PRICES.basic,
    amount: 999, // €9.99
    currency: 'eur',
    features: ['Up to 50 listings', 'Basic support', 'Standard features'],
    maxListings: 50,
    support: 'basic'
  },
  {
    id: 'premium',
    name: 'Premium',
    priceId: STRIPE_CONFIG.PRICES.premium,
    amount: 2999, // €29.99
    currency: 'eur',
    features: ['Up to 200 listings', 'Priority support', 'Advanced features'],
    maxListings: 200,
    support: 'priority'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceId: STRIPE_CONFIG.PRICES.enterprise,
    amount: 9999, // €99.99
    currency: 'eur',
    features: ['Unlimited listings', 'Dedicated support', 'All features'],
    maxListings: -1, // unlimited
    support: 'dedicated'
  },
  {
    id: 'dealer_basic',
    name: 'Dealer Basic',
    priceId: STRIPE_CONFIG.PRICES.dealer_basic,
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
    priceId: STRIPE_CONFIG.PRICES.dealer_premium,
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
    priceId: STRIPE_CONFIG.PRICES.dealer_enterprise,
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
    priceId: STRIPE_CONFIG.PRICES.company_basic,
    amount: 7999, // €79.99
    currency: 'eur',
    features: ['Up to 1000 listings', 'Company verification', 'Priority support', 'Analytics'],
    maxListings: 1000,
    support: 'priority'
  },
  {
    id: 'company_premium',
    name: 'Company Premium',
    priceId: STRIPE_CONFIG.PRICES.company_premium,
    amount: 14999, // €149.99
    currency: 'eur',
    features: ['Up to 5000 listings', 'Advanced analytics', 'Dedicated support', 'Custom integrations'],
    maxListings: 5000,
    support: 'dedicated'
  },
  {
    id: 'company_enterprise',
    name: 'Company Enterprise',
    priceId: STRIPE_CONFIG.PRICES.company_enterprise,
    amount: 39999, // €399.99
    currency: 'eur',
    features: ['Unlimited listings', 'Full white-label', 'Custom development', '24/7 support'],
    maxListings: -1,
    support: 'dedicated'
  },
];

/**
 * Platform fees configuration
 * إعدادات رسوم المنصة
 */
export const PLATFORM_FEES = {
  DEFAULT_PERCENTAGE: 5,
  MIN_FEE: 0.50, // €0.50 minimum fee
  MAX_FEE: 50.00, // €50.00 maximum fee
} as const;

/**
 * Currency configuration
 * إعدادات العملة
 */
export const CURRENCY_CONFIG = {
  DEFAULT: 'EUR' as const,
  SUPPORTED: ['EUR', 'BGN'] as const,
  LOCALE: 'bg-BG' as const,
} as const;

/**
 * Invoice configuration
 * إعدادات الفاتورة
 */
export const INVOICE_CONFIG = {
  DEFAULT_CURRENCY: 'BGN' as const,
  DEFAULT_DUE_DAYS: 30,
  VAT_RATE: 20, // 20% VAT for Bulgaria
  NUMBER_FORMAT: 'YYYY-MM-0000',
} as const;

/**
 * Stripe Connect configuration
 * إعدادات Stripe Connect
 */
export const STRIPE_CONNECT_CONFIG = {
  COUNTRY: 'BG',
  BUSINESS_TYPE_DEFAULT: 'individual' as const,
  CURRENCY: 'eur',
  RETURN_URL_PATH: '/seller/dashboard',
  REFRESH_URL_PATH: '/seller/stripe-refresh',
} as const;

/**
 * Status colors for invoices
 * ألوان الحالات للفواتير
 */
export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: '#9e9e9e',
  sent: '#2196f3',
  paid: '#4caf50',
  cancelled: '#f44336',
} as const;

/**
 * Status translations
 * ترجمات الحالات
 */
export const INVOICE_STATUS_TRANSLATIONS: Record<string, { bg: string; en: string }> = {
  draft: { bg: 'Чернова', en: 'Draft' },
  sent: { bg: 'Изпратена', en: 'Sent' },
  paid: { bg: 'Платена', en: 'Paid' },
  cancelled: { bg: 'Отказана', en: 'Cancelled' },
} as const;

/**
 * Payment method translations
 * ترجمات طرق الدفع
 */
export const PAYMENT_METHOD_TRANSLATIONS: Record<string, { bg: string; en: string }> = {
  card: { bg: 'Карта', en: 'Card' },
  bank_transfer: { bg: 'Банков превод', en: 'Bank Transfer' },
  cash: { bg: 'В брой', en: 'Cash' },
} as const;

/**
 * Error messages
 * رسائل الخطأ
 */
export const ERROR_MESSAGES = {
  STRIPE_NOT_INITIALIZED: 'Stripe not initialized',
  INVALID_TIER: 'Invalid tier',
  ACCOUNT_CREATION_FAILED: 'Failed to create Stripe account',
  PAYMENT_CREATION_FAILED: 'Failed to create payment',
  PAYMENT_CONFIRMATION_FAILED: 'Failed to confirm payment',
  INVOICE_GENERATION_FAILED: 'Failed to generate invoice',
  INVOICE_UPDATE_FAILED: 'Failed to update invoice status',
  EMAIL_SEND_FAILED: 'Failed to send invoice email',
} as const;

/**
 * Success messages
 * رسائل النجاح
 */
export const SUCCESS_MESSAGES = {
  CHECKOUT_SESSION_CREATED: 'Checkout session created',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled',
  PAYMENT_METHOD_UPDATED: 'Payment method updated',
  ACCOUNT_CREATED: 'Stripe account created successfully',
  PAYMENT_CONFIRMED: 'Payment confirmed successfully',
  INVOICE_GENERATED: 'Invoice generated successfully',
  INVOICE_UPDATED: 'Invoice status updated',
  EMAIL_SENT: 'Invoice email sent successfully',
} as const;