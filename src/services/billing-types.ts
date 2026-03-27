/**
 * Billing Types
 * أنواع الفوترة
 *
 * This module contains all TypeScript interfaces and types for the billing system.
 * يحتوي هذا الوحدة على جميع واجهات TypeScript لنظام الفوترة.
 */

/**
 * Billing tier interface
 * واجهة مستوى الفوترة
 */
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

/**
 * Invoice interface
 * واجهة الفاتورة
 */
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

/**
 * Invoice item interface
 * واجهة عنصر الفاتورة
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  amount: number;
}

/**
 * Payment intent interface
 * واجهة نية الدفع
 */
export interface PaymentIntent {
  success: boolean;
  paymentId: string;
  clientSecret?: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
  message?: string;
}

/**
 * Account status interface
 * واجهة حالة الحساب
 */
export interface AccountStatus {
  hasAccount: boolean;
  onboardingComplete: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirements?: any;
}

/**
 * Create account response interface
 * واجهة استجابة إنشاء الحساب
 */
export interface CreateAccountResponse {
  success: boolean;
  accountId: string;
  onboardingUrl: string;
  message?: string;
}

/**
 * Invoice generation parameters
 * معاملات إنشاء الفاتورة
 */
export interface InvoiceGenerationParams {
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
}

/**
 * Invoice query parameters
 * معاملات استعلام الفواتير
 */
export interface InvoiceQueryParams {
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Invoice response
 * استجابة الفاتورة
 */
export interface InvoiceResponse {
  success: boolean;
  invoice?: Invoice;
  invoiceId?: string;
  error?: string;
}

/**
 * Invoices response
 * استجابة الفواتير
 */
export interface InvoicesResponse {
  success: boolean;
  invoices?: Invoice[];
  total?: number;
  error?: string;
}

/**
 * Status update response
 * استجابة تحديث الحالة
 */
export interface StatusUpdateResponse {
  success: boolean;
  error?: string;
}

/**
 * Email send response
 * استجابة إرسال البريد الإلكتروني
 */
export interface EmailSendResponse {
  success: boolean;
  error?: string;
}

/**
 * Invoice calculation result
 * نتيجة حساب الفاتورة
 */
export interface InvoiceCalculation {
  subtotal: number;
  vatAmount: number;
  total: number;
}

/**
 * Language type
 * نوع اللغة
 */
export type Language = 'bg' | 'en';

/**
 * Currency type
 * نوع العملة
 */
export type Currency = 'BGN' | 'EUR';

/**
 * Payment method type
 * نوع طريقة الدفع
 */
export type PaymentMethod = 'card' | 'bank_transfer' | 'cash';

/**
 * Invoice status type
 * نوع حالة الفاتورة
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

/**
 * Business type for Stripe
 * نوع العمل لـ Stripe
 */
export type BusinessType = 'individual' | 'company';

/**
 * Support level type
 * نوع مستوى الدعم
 */
export type SupportLevel = 'basic' | 'priority' | 'dedicated';
