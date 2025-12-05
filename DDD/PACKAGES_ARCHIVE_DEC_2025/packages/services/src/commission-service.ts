// src/services/commission-service.ts
// Cloud Functions Integration for Commission System
// Integration with Backend P2.3 Features

import { httpsCallable } from 'firebase/functions';
import { functions } from '@globul-cars/services';
import { serviceLogger } from './logger-wrapper';

// ==================== TYPES ====================

export interface CommissionPeriod {
  id: string;
  userId: string;
  period: string; // YYYY-MM format
  totalSales: number;
  commissionAmount: number;
  commissionRate: number;
  status: 'pending' | 'calculated' | 'charged' | 'paid';
  transactions: CommissionTransaction[];
  invoiceId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionTransaction {
  transactionId: string;
  listingId: string;
  listingTitle: string;
  saleAmount: number;
  commissionAmount: number;
  saleDate: Date;
}

// ==================== COMMISSION FUNCTIONS ====================

export const getCommissionPeriods = async (params?: {
  startPeriod?: string;
  endPeriod?: string;
}): Promise<{
  success: boolean;
  periods?: CommissionPeriod[];
  error?: string;
}> => {
  try {
    const getCommissionPeriodsFn = httpsCallable(functions, 'getCommissionPeriods');
    const result = await getCommissionPeriodsFn(params || {});
    return result.data as any;
  } catch (error: any) {
    serviceLogger.error('Error getting commission periods', error as Error, { params });
    return { success: false, error: error.message };
  }
};

export const getCommissionPeriod = async (
  period: string
): Promise<{
  success: boolean;
  period?: CommissionPeriod;
  error?: string;
}> => {
  try {
    const getCommissionPeriodFn = httpsCallable(functions, 'getCommissionPeriod');
    const result = await getCommissionPeriodFn({ period });
    return result.data as any;
  } catch (error: any) {
    serviceLogger.error('Error getting commission period', error as Error, { period });
    return { success: false, error: error.message };
  }
};

export const getAllCommissionPeriods = async (params?: {
  status?: 'pending' | 'calculated' | 'charged' | 'paid';
  period?: string;
}): Promise<{
  success: boolean;
  periods?: CommissionPeriod[];
  summary?: {
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
  };
  error?: string;
}> => {
  try {
    const getAllCommissionPeriodsFn = httpsCallable(functions, 'getAllCommissionPeriods');
    const result = await getAllCommissionPeriodsFn(params || {});
    return result.data as any;
  } catch (error: any) {
    serviceLogger.error('Error getting all commission periods', error as Error, { params });
    return { success: false, error: error.message };
  }
};

export const getCommissionRate = async (): Promise<{
  success: boolean;
  rate?: number;
  userType?: 'dealer' | 'company' | 'buyer';
  error?: string;
}> => {
  try {
    const getCommissionRateFn = httpsCallable(functions, 'getCommissionRate');
    const result = await getCommissionRateFn();
    return result.data as any;
  } catch (error: any) {
    serviceLogger.error('Error getting commission rate', error as Error);
    return { success: false, error: error.message };
  }
};

export const triggerCommissionCharging = async (
  period: string
): Promise<{
  success: boolean;
  charged?: number;
  invoicesCreated?: number;
  error?: string;
}> => {
  try {
    const triggerCommissionChargingFn = httpsCallable(functions, 'triggerCommissionCharging');
    const result = await triggerCommissionChargingFn({ period });
    return result.data as any;
  } catch (error: any) {
    serviceLogger.error('Error triggering commission charging', error as Error, { period });
    return { success: false, error: error.message };
  }
};

export const markCommissionPaid = async (
  period: string,
  userId: string,
  notes?: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const markCommissionPaidFn = httpsCallable(functions, 'markCommissionPaid');
    const result = await markCommissionPaidFn({ period, userId, notes });
    return result.data as any;
  } catch (error: any) {
    serviceLogger.error('Error marking commission paid', error as Error, { period, userId });
    return { success: false, error: error.message };
  }
};

export const generateCommissionStatement = async (
  period: string,
  userId: string
): Promise<{
  success: boolean;
  html?: string;
  error?: string;
}> => {
  try {
    const generateCommissionStatementFn = httpsCallable(functions, 'generateCommissionStatement');
    const result = await generateCommissionStatementFn({ period, userId });
    return result.data as any;
  } catch (error: any) {
    serviceLogger.error('Error generating commission statement', error as Error, { period, userId });
    return { success: false, error: error.message };
  }
};

// ==================== HELPER FUNCTIONS ====================

export const formatPeriod = (period: string, language: 'bg' | 'en' = 'bg'): string => {
  const [year, month] = period.split('-');
  const monthNames: Record<string, { bg: string; en: string }> = {
    '01': { bg: 'Януари', en: 'January' },
    '02': { bg: 'Февруари', en: 'February' },
    '03': { bg: 'Март', en: 'March' },
    '04': { bg: 'Април', en: 'April' },
    '05': { bg: 'Май', en: 'May' },
    '06': { bg: 'Юни', en: 'June' },
    '07': { bg: 'Юли', en: 'July' },
    '08': { bg: 'Август', en: 'August' },
    '09': { bg: 'Септември', en: 'September' },
    '10': { bg: 'Октомври', en: 'October' },
    '11': { bg: 'Ноември', en: 'November' },
    '12': { bg: 'Декември', en: 'December' },
  };

  const monthName = monthNames[month]?.[language] || month;
  return `${monthName} ${year}`;
};

export const getCurrentPeriod = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getPreviousPeriod = (): string => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getCommissionStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#ff9800';
    case 'calculated':
      return '#2196f3';
    case 'charged':
      return '#9c27b0';
    case 'paid':
      return '#4caf50';
    default:
      return '#757575';
  }
};

export const getCommissionStatusText = (status: string, language: 'bg' | 'en' = 'bg'): string => {
  const translations: Record<string, { bg: string; en: string }> = {
    pending: { bg: 'Предстоящи', en: 'Pending' },
    calculated: { bg: 'Изчислени', en: 'Calculated' },
    charged: { bg: 'Таксувани', en: 'Charged' },
    paid: { bg: 'Платени', en: 'Paid' },
  };

  return translations[status]?.[language] || status;
};

export const formatCommissionRate = (rate: number): string => {
  return `${rate}%`;
};

export const calculateCommission = (amount: number, rate: number): number => {
  return Math.round((amount * rate) / 100 * 100) / 100;
};

export const formatCurrency = (amount: number, currency: 'BGN' | 'EUR' = 'EUR'): string => {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getPeriodsList = (count: number = 12): string[] => {
  const periods: string[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    periods.push(`${year}-${month}`);
  }

  return periods;
};
