// src/services/compliance/dac7-reporting.service.ts
// DAC7 Directive Tax Reporting Service
// EU Council Directive 2021/514 — Automated reporting for platform sellers

import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

// ─── Types ───────────────────────────────────────────────────────────

export interface DAC7SellerProfile {
  userId: string;
  legalName: string;
  legalNameBg: string;
  taxIdentificationNumber: string; // EGN (personal) or EIK (business)
  taxIdType: 'egn' | 'eik' | 'vat';
  vatNumber?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: 'BG';
  };
  dateOfBirth?: string;
  isBusinessEntity: boolean;
  businessRegistrationNumber?: string;
  reportingPeriod: string; // e.g., '2026'
  totalTransactions: number;
  totalRevenue: number; // EUR
  currency: 'EUR';
  thresholdExceeded: boolean;
  lastUpdated: Date;
}

export interface DAC7Transaction {
  id: string;
  sellerId: string;
  buyerId: string;
  carId: string;
  amount: number;
  currency: 'EUR';
  transactionDate: Date;
  transactionType: 'sale' | 'service' | 'commission';
  platformFee: number;
  reportingQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  reportingYear: number;
  reported: boolean;
}

export interface DAC7Report {
  id: string;
  reportingPeriod: string;
  reportingYear: number;
  platformOperator: {
    name: 'Koli One EOOD';
    taxId: string;
    country: 'BG';
    registrationNumber: string;
  };
  sellers: DAC7SellerProfile[];
  totalSellersReported: number;
  totalTransactionsReported: number;
  totalRevenueReported: number;
  currency: 'EUR';
  generatedAt: Date;
  submittedAt?: Date;
  status: 'draft' | 'generated' | 'submitted' | 'accepted' | 'rejected';
  xmlPayload?: string;
}

// DAC7 Thresholds (EU-wide per calendar year)
const DAC7_THRESHOLDS = {
  minTransactions: 30,
  minRevenue: 2000, // EUR
  reportingDeadlineMonth: 1, // January of following year
  reportingDeadlineDay: 31,
} as const;

// ─── Service ─────────────────────────────────────────────────────────

class DAC7ReportingService {
  private static instance: DAC7ReportingService;

  private constructor() {}

  static getInstance(): DAC7ReportingService {
    if (!DAC7ReportingService.instance) {
      DAC7ReportingService.instance = new DAC7ReportingService();
    }
    return DAC7ReportingService.instance;
  }

  /**
   * Check if a seller exceeds DAC7 reporting thresholds
   * Sellers with ≥30 transactions OR ≥€2,000 revenue must be reported
   */
  async checkSellerThreshold(
    userId: string,
    year: number
  ): Promise<{
    exceeds: boolean;
    transactions: number;
    revenue: number;
    reason?: string;
  }> {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const q = query(
        collection(db, 'dac7_transactions'),
        where('sellerId', '==', userId),
        where('transactionDate', '>=', Timestamp.fromDate(startDate)),
        where('transactionDate', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(d => d.data() as DAC7Transaction);

      const totalTransactions = transactions.length;
      const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

      const exceedsTransactions =
        totalTransactions >= DAC7_THRESHOLDS.minTransactions;
      const exceedsRevenue = totalRevenue >= DAC7_THRESHOLDS.minRevenue;
      const exceeds = exceedsTransactions || exceedsRevenue;

      let reason: string | undefined;
      if (exceedsTransactions && exceedsRevenue) {
        reason = 'Exceeds both transaction count and revenue thresholds';
      } else if (exceedsTransactions) {
        reason = `Exceeds transaction threshold (${totalTransactions}/${DAC7_THRESHOLDS.minTransactions})`;
      } else if (exceedsRevenue) {
        reason = `Exceeds revenue threshold (€${totalRevenue.toFixed(2)}/€${DAC7_THRESHOLDS.minRevenue})`;
      }

      return {
        exceeds,
        transactions: totalTransactions,
        revenue: totalRevenue,
        reason,
      };
    } catch (error) {
      serviceLogger.error(
        'DAC7: Error checking seller threshold',
        error as Error,
        { userId }
      );
      return { exceeds: false, transactions: 0, revenue: 0 };
    }
  }

  /**
   * Record a transaction for DAC7 tracking
   */
  async recordTransaction(
    transaction: Omit<DAC7Transaction, 'id' | 'reported'>
  ): Promise<string> {
    try {
      const id = `dac7_${transaction.sellerId}_${Date.now()}`;
      const quarter = this.getQuarter(transaction.transactionDate);

      await setDoc(doc(db, 'dac7_transactions', id), {
        ...transaction,
        id,
        reportingQuarter: quarter,
        reportingYear: transaction.transactionDate.getFullYear(),
        reported: false,
        createdAt: serverTimestamp(),
      });

      serviceLogger.info('DAC7: Transaction recorded', {
        id,
        sellerId: transaction.sellerId,
      });
      return id;
    } catch (error) {
      serviceLogger.error('DAC7: Error recording transaction', error as Error);
      throw error;
    }
  }

  /**
   * Generate DAC7 report for a specific year
   * Identifies all sellers exceeding thresholds and compiles report
   */
  async generateAnnualReport(year: number): Promise<DAC7Report> {
    try {
      serviceLogger.info('DAC7: Generating annual report', { year });

      // Get all sellers with transactions in this year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const q = query(
        collection(db, 'dac7_transactions'),
        where('transactionDate', '>=', Timestamp.fromDate(startDate)),
        where('transactionDate', '<=', Timestamp.fromDate(endDate)),
        where('reported', '==', false)
      );

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(d => d.data() as DAC7Transaction);

      // Group by seller
      const sellerMap = new Map<string, DAC7Transaction[]>();
      for (const tx of transactions) {
        const existing = sellerMap.get(tx.sellerId) || [];
        existing.push(tx);
        sellerMap.set(tx.sellerId, existing);
      }

      // Check thresholds for each seller
      const reportableSellers: DAC7SellerProfile[] = [];

      for (const [sellerId, sellerTxs] of sellerMap.entries()) {
        const totalRevenue = sellerTxs.reduce((sum, t) => sum + t.amount, 0);
        const totalTransactions = sellerTxs.length;

        if (
          totalTransactions >= DAC7_THRESHOLDS.minTransactions ||
          totalRevenue >= DAC7_THRESHOLDS.minRevenue
        ) {
          // Fetch seller profile
          const profileDoc = await import('firebase/firestore').then(
            ({ getDoc }) => getDoc(doc(db, 'dac7_seller_profiles', sellerId))
          );

          if (profileDoc.exists()) {
            const profile = profileDoc.data() as DAC7SellerProfile;
            profile.totalTransactions = totalTransactions;
            profile.totalRevenue = totalRevenue;
            profile.thresholdExceeded = true;
            reportableSellers.push(profile);
          }
        }
      }

      const reportId = `dac7_report_${year}_${Date.now()}`;
      const report: DAC7Report = {
        id: reportId,
        reportingPeriod: `${year}`,
        reportingYear: year,
        platformOperator: {
          name: 'Koli One EOOD',
          taxId: '', // Set from env
          country: 'BG',
          registrationNumber: '',
        },
        sellers: reportableSellers,
        totalSellersReported: reportableSellers.length,
        totalTransactionsReported: transactions.length,
        totalRevenueReported: transactions.reduce(
          (sum, t) => sum + t.amount,
          0
        ),
        currency: 'EUR',
        generatedAt: new Date(),
        status: 'generated',
      };

      // Store report
      await setDoc(doc(db, 'dac7_reports', reportId), {
        ...report,
        generatedAt: serverTimestamp(),
      });

      serviceLogger.info('DAC7: Report generated', {
        reportId,
        sellersReported: reportableSellers.length,
        totalRevenue: report.totalRevenueReported,
      });

      return report;
    } catch (error) {
      serviceLogger.error('DAC7: Error generating report', error as Error);
      throw error;
    }
  }

  /**
   * Get all DAC7 reports
   */
  async getReports(year?: number): Promise<DAC7Report[]> {
    try {
      let q;
      if (year) {
        q = query(
          collection(db, 'dac7_reports'),
          where('reportingYear', '==', year),
          orderBy('generatedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'dac7_reports'),
          orderBy('generatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as DAC7Report);
    } catch (error) {
      serviceLogger.error('DAC7: Error getting reports', error as Error);
      return [];
    }
  }

  /**
   * Register/update a seller's DAC7 profile
   */
  async registerSellerProfile(
    profile: Omit<
      DAC7SellerProfile,
      'lastUpdated' | 'totalTransactions' | 'totalRevenue' | 'thresholdExceeded'
    >
  ): Promise<void> {
    try {
      await setDoc(
        doc(db, 'dac7_seller_profiles', profile.userId),
        {
          ...profile,
          totalTransactions: 0,
          totalRevenue: 0,
          thresholdExceeded: false,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      serviceLogger.info('DAC7: Seller profile registered', {
        userId: profile.userId,
      });
    } catch (error) {
      serviceLogger.error(
        'DAC7: Error registering seller profile',
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get reporting deadline for a year
   */
  getReportingDeadline(year: number): Date {
    return new Date(
      year + 1,
      DAC7_THRESHOLDS.reportingDeadlineMonth - 1,
      DAC7_THRESHOLDS.reportingDeadlineDay
    );
  }

  /**
   * Check if reporting deadline is approaching (within 30 days)
   */
  isDeadlineApproaching(year: number): boolean {
    const deadline = this.getReportingDeadline(year);
    const now = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline > 0 && daysUntilDeadline <= 30;
  }

  private getQuarter(date: Date): 'Q1' | 'Q2' | 'Q3' | 'Q4' {
    const month = date.getMonth();
    if (month < 3) return 'Q1';
    if (month < 6) return 'Q2';
    if (month < 9) return 'Q3';
    return 'Q4';
  }
}

export const dac7ReportingService = DAC7ReportingService.getInstance();
