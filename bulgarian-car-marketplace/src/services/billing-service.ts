// src/services/billing-service.ts
// Cloud Functions Integration for Billing & Invoices
// Integration with Backend P2.2 Features

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';

// ==================== TYPES ====================

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
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error('Error getting invoices:', error);
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error('Error getting invoice:', error);
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error.message };
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
