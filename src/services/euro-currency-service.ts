import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

// Euro Currency Interfaces
export interface CurrencyConfig {
  id: string;
  primaryCurrency: 'EUR';
  displayCurrency: 'EUR';
  exchangeRates: ExchangeRate[];
  lastUpdated: Date;
  isActive: boolean;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: Date;
  source: 'ecb' | 'manual' | 'api';
}

export interface PriceDisplay {
  amount: number;
  currency: 'EUR';
  formatted: string;
  symbol: '€';
  locale: 'bg-BG' | 'en-US';
}

export interface FinancialTransaction {
  id: string;
  type: 'sale' | 'commission' | 'refund' | 'fee';
  amount: number;
  currency: 'EUR';
  description: string;
  descriptionBg: string;
  userId: string;
  carId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  paymentMethod?: string;
  transactionId?: string;
}

export interface TaxCalculation {
  baseAmount: number;
  vatRate: number; // 20% in Bulgaria
  vatAmount: number;
  totalAmount: number;
  currency: 'EUR';
  breakdown: {
    subtotal: number;
    vat: number;
    total: number;
  };
}

export interface CommissionStructure {
  id: string;
  name: string;
  nameBg: string;
  type: 'percentage' | 'fixed';
  value: number;
  currency: 'EUR';
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
  applicableTo: 'all' | 'premium' | 'standard';
}

class EuroCurrencyService {
  private static instance: EuroCurrencyService;
  private readonly EUR_SYMBOL = '€';
  private readonly BULGARIAN_VAT_RATE = 0.20; // 20% VAT in Bulgaria

  private constructor() {}

  public static getInstance(): EuroCurrencyService {
    if (!EuroCurrencyService.instance) {
      EuroCurrencyService.instance = new EuroCurrencyService();
    }
    return EuroCurrencyService.instance;
  }

  // Format price in EUR
  public formatPrice(amount: number, locale: 'bg-BG' | 'en-US' = 'bg-BG'): PriceDisplay {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    return {
      amount,
      currency: 'EUR',
      formatted,
      symbol: this.EUR_SYMBOL,
      locale
    };
  }

  // Convert from BGN to EUR (Bulgaria uses BGN but we display in EUR)
  public convertBgnToEur(bgnAmount: number, rate: number = 0.511292): number {
    return Math.round(bgnAmount * rate * 100) / 100; // Round to 2 decimal places
  }

  // Convert from EUR to BGN
  public convertEurToBgn(eurAmount: number, rate: number = 1.95583): number {
    return Math.round(eurAmount * rate * 100) / 100;
  }

  // Calculate VAT for Bulgarian market
  public calculateVAT(amount: number): TaxCalculation {
    const vatAmount = Math.round(amount * this.BULGARIAN_VAT_RATE * 100) / 100;
    const totalAmount = amount + vatAmount;

    return {
      baseAmount: amount,
      vatRate: this.BULGARIAN_VAT_RATE,
      vatAmount,
      totalAmount,
      currency: 'EUR',
      breakdown: {
        subtotal: amount,
        vat: vatAmount,
        total: totalAmount
      }
    };
  }

  // Calculate commission
  public calculateCommission(
    saleAmount: number, 
    commissionStructure: CommissionStructure
  ): number {
    if (!commissionStructure.isActive) {
      return 0;
    }

    let commission = 0;

    if (commissionStructure.type === 'percentage') {
      commission = Math.round(saleAmount * (commissionStructure.value / 100) * 100) / 100;
    } else {
      commission = commissionStructure.value;
    }

    // Apply min/max limits
    if (commissionStructure.minAmount && commission < commissionStructure.minAmount) {
      commission = commissionStructure.minAmount;
    }
    
    if (commissionStructure.maxAmount && commission > commissionStructure.maxAmount) {
      commission = commissionStructure.maxAmount;
    }

    return commission;
  }

  // Get commission structures
  public async getCommissionStructures(): Promise<CommissionStructure[]> {
    try {
      const q = query(
        collection(db, 'commission_structures'),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ 
        ...doc.data(), 
        id: doc.id
      } as CommissionStructure));
    } catch (error) {
      serviceLogger.error('Error getting commission structures', error as Error);
      return [];
    }
  }

  // Create commission structure
  public async createCommissionStructure(
    structure: Omit<CommissionStructure, 'id'>,
    createdBy: string
  ): Promise<CommissionStructure> {
    try {
      const structureRef = doc(collection(db, 'commission_structures'));
      const newStructure: CommissionStructure = {
        id: structureRef.id,
        ...structure,
        currency: 'EUR'
      };

      await setDoc(structureRef, {
        ...newStructure,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return newStructure;
    } catch (error) {
      serviceLogger.error('Error creating commission structure', error as Error, { createdBy });
      throw error;
    }
  }

  // Record financial transaction
  public async recordTransaction(
    transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>
  ): Promise<FinancialTransaction> {
    try {
      const transactionRef = doc(collection(db, 'financial_transactions'));
      const newTransaction: FinancialTransaction = {
        id: transactionRef.id,
        ...transaction,
        currency: 'EUR',
        createdAt: new Date()
      };

      await setDoc(transactionRef, {
        ...newTransaction,
        createdAt: serverTimestamp()
      });

      return newTransaction;
    } catch (error) {
      serviceLogger.error('Error recording financial transaction', error as Error, { transaction });
      throw error;
    }
  }

  // Get financial transactions
  public async getFinancialTransactions(
    userId?: string,
    type?: string,
    status?: string,
    limitCount: number = 50
  ): Promise<FinancialTransaction[]> {
    try {
      let q = query(collection(db, 'financial_transactions'), orderBy('createdAt', 'desc'));

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      if (type) {
        q = query(q, where('type', '==', type));
      }

      if (status) {
        q = query(q, where('status', '==', status));
      }

      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate()
      } as FinancialTransaction));
    } catch (error) {
      serviceLogger.error('Error getting financial transactions', error as Error, { userId, type, status });
      return [];
    }
  }

  // Get financial summary
  public async getFinancialSummary(
    userId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    totalRevenue: number;
    totalCommission: number;
    totalTransactions: number;
    averageTransactionValue: number;
    currency: 'EUR';
  }> {
    try {
      let q = query(
        collection(db, 'financial_transactions'),
        where('status', '==', 'completed')
      );

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      if (dateFrom) {
        q = query(q, where('createdAt', '>=', dateFrom));
      }

      if (dateTo) {
        q = query(q, where('createdAt', '<=', dateTo));
      }

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map((doc: any) => doc.data() as FinancialTransaction);

      const totalRevenue = transactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalCommission = transactions
        .filter(t => t.type === 'commission')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalTransactions = transactions.length;
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalTransactions,
        averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
        currency: 'EUR'
      };
    } catch (error) {
      serviceLogger.error('Error getting financial summary', error as Error, { userId, dateFrom, dateTo });
      return {
        totalRevenue: 0,
        totalCommission: 0,
        totalTransactions: 0,
        averageTransactionValue: 0,
        currency: 'EUR'
      };
    }
  }

  // Initialize default commission structures
  public async initializeDefaultCommissionStructures(): Promise<void> {
    try {
      const defaultStructures: Omit<CommissionStructure, 'id'>[] = [
        {
          name: 'Standard Commission',
          nameBg: 'Стандартна комисионна',
          type: 'percentage',
          value: 5, // 5%
          currency: 'EUR',
          minAmount: 50,
          maxAmount: 5000,
          isActive: true,
          applicableTo: 'all'
        },
        {
          name: 'Premium Commission',
          nameBg: 'Премиум комисионна',
          type: 'percentage',
          value: 3, // 3%
          currency: 'EUR',
          minAmount: 100,
          maxAmount: 10000,
          isActive: true,
          applicableTo: 'premium'
        },
        {
          name: 'Fixed Listing Fee',
          nameBg: 'Фиксирана такса за обява',
          type: 'fixed',
          value: 25, // €25
          currency: 'EUR',
          isActive: true,
          applicableTo: 'standard'
        }
      ];

      const batch = writeBatch(db);
      
      for (const structure of defaultStructures) {
        const structureRef = doc(collection(db, 'commission_structures'));
        batch.set(structureRef, {
          ...structure,
          createdBy: 'system',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      serviceLogger.info('Default commission structures initialized');
    } catch (error) {
      serviceLogger.error('Error initializing commission structures', error as Error);
      throw error;
    }
  }

  // Get currency configuration
  public async getCurrencyConfig(): Promise<CurrencyConfig | null> {
    try {
      const q = query(collection(db, 'currency_config'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        primaryCurrency: 'EUR',
        displayCurrency: 'EUR',
        exchangeRates: data.exchangeRates || [],
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        isActive: data.isActive || true
      };
    } catch (error) {
      serviceLogger.error('Error getting currency config', error as Error);
      return null;
    }
  }

  // Update currency configuration
  public async updateCurrencyConfig(
    config: Partial<CurrencyConfig>,
    updatedBy: string
  ): Promise<void> {
    try {
      const configRef = doc(collection(db, 'currency_config'));
      const currencyConfig: Omit<CurrencyConfig, 'id'> = {
        primaryCurrency: 'EUR',
        displayCurrency: 'EUR',
        exchangeRates: [],
        lastUpdated: new Date(),
        isActive: true,
        ...config
      };

      await setDoc(configRef, {
        ...currencyConfig,
        updatedBy,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error updating currency config', error as Error, { updatedBy });
      throw error;
    }
  }

  // Validate price format
  public validatePrice(price: string | number): {
    isValid: boolean;
    amount: number;
    formatted: string;
    error?: string;
  } {
    try {
      let amount: number;
      
      if (typeof price === 'string') {
        // Remove currency symbols and spaces
        const cleanPrice = price.replace(/[€$£,\s]/g, '');
        amount = parseFloat(cleanPrice);
      } else {
        amount = price;
      }

      if (isNaN(amount) || amount < 0) {
        return {
          isValid: false,
          amount: 0,
          formatted: '',
          error: 'Invalid price format'
        };
      }

      const formatted = this.formatPrice(amount).formatted;

      return {
        isValid: true,
        amount,
        formatted
      };
    } catch (error) {
      return {
        isValid: false,
        amount: 0,
        formatted: '',
        error: 'Price validation failed'
      };
    }
  }

  // Get price range for Bulgarian market
  public getPriceRange(): {
    min: number;
    max: number;
    currency: 'EUR';
    formatted: {
      min: string;
      max: string;
    };
  } {
    const min = 100; // €100 minimum
    const max = 100000; // €100,000 maximum

    return {
      min,
      max,
      currency: 'EUR',
      formatted: {
        min: this.formatPrice(min).formatted,
        max: this.formatPrice(max).formatted
      }
    };
  }
}

export const euroCurrencyService = EuroCurrencyService.getInstance();
