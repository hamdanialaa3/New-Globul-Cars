/**
 * Transaction History Service
 * Manages user transaction history
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import type { Transaction, TransactionStats } from '../../types/profile-enhancements.types';

export class TransactionsService {
  private static instance: TransactionsService;
  private readonly collectionName = 'transactions';

  private constructor() {}

  public static getInstance(): TransactionsService {
    if (!TransactionsService.instance) {
      TransactionsService.instance = new TransactionsService();
    }
    return TransactionsService.instance;
  }

  /**
   * Create a new transaction
   */
  async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      if (!transactionData.userId) {
        throw new Error('Invalid userId');
      }

      const transactionRef = doc(collection(db, this.collectionName));
      const transaction: Transaction = {
        id: transactionRef.id,
        ...transactionData,
        createdAt: serverTimestamp() as any
      };

      await setDoc(transactionRef, transaction);
      serviceLogger.info(`Transaction created: ${transactionRef.id}`);
      return transactionRef.id;
    } catch (error) {
      serviceLogger.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Get user's transactions
   */
  async getUserTransactions(
    userId: string,
    options?: {
      status?: Transaction['status'];
      limitCount?: number;
      startAfter?: Timestamp;
    }
  ): Promise<Transaction[]> {
    try {
      if (!userId) return [];

      const {
        status,
        limitCount = 50,
        startAfter
      } = options || {};

      let q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('saleDate', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
    } catch (error) {
      serviceLogger.error('Error getting user transactions:', error);
      return [];
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      if (!transactionId) return null;

      const transactionRef = doc(db, this.collectionName, transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
        return null;
      }

      return {
        id: transactionSnap.id,
        ...transactionSnap.data()
      } as Transaction;
    } catch (error) {
      serviceLogger.error('Error getting transaction:', error);
      return null;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: Transaction['status']
  ): Promise<void> {
    try {
      const transactionRef = doc(db, this.collectionName, transactionId);
      await updateDoc(transactionRef, {
        status,
        updatedAt: serverTimestamp()
      });
      serviceLogger.info(`Transaction status updated: ${transactionId} to ${status}`);
    } catch (error) {
      serviceLogger.error('Error updating transaction status:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(userId: string): Promise<TransactionStats> {
    try {
      if (!userId) {
        return {
          totalSales: 0,
          totalRevenue: 0,
          averagePrice: 0,
          thisMonthSales: 0,
          thisMonthRevenue: 0
        };
      }

      const allTransactions = await this.getUserTransactions(userId, {
        status: 'completed',
        limitCount: 1000
      });

      const completedTransactions = allTransactions.filter(t => t.status === 'completed');

      // Calculate totals
      const totalSales = completedTransactions.length;
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.salePrice || 0), 0);
      const averagePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calculate this month
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthTransactions = completedTransactions.filter(t => {
        const saleDate = t.saleDate?.toDate ? t.saleDate.toDate() : new Date(t.saleDate);
        return saleDate >= thisMonthStart;
      });

      const thisMonthSales = thisMonthTransactions.length;
      const thisMonthRevenue = thisMonthTransactions.reduce((sum, t) => sum + (t.salePrice || 0), 0);

      // Get last sale date
      const lastSale = completedTransactions.length > 0
        ? completedTransactions[0].saleDate
        : undefined;

      return {
        totalSales,
        totalRevenue,
        averagePrice,
        thisMonthSales,
        thisMonthRevenue,
        lastSaleDate: lastSale
      };
    } catch (error) {
      serviceLogger.error('Error getting transaction stats:', error);
      return {
        totalSales: 0,
        totalRevenue: 0,
        averagePrice: 0,
        thisMonthSales: 0,
        thisMonthRevenue: 0
      };
    }
  }

  /**
   * Create transaction from car sale
   */
  async createTransactionFromSale(
    userId: string,
    carId: string,
    carData: {
      make: string;
      model: string;
      year: number;
      price: number;
    },
    buyerId?: string,
    buyerName?: string
  ): Promise<string> {
    try {
      return await this.createTransaction({
        userId,
        carId,
        carMake: carData.make,
        carModel: carData.model,
        carYear: carData.year,
        salePrice: carData.price,
        currency: 'EUR',
        saleDate: Timestamp.now(),
        buyerId,
        buyerName,
        status: 'completed'
      });
    } catch (error) {
      serviceLogger.error('Error creating transaction from sale:', error);
      throw error;
    }
  }
}

export const transactionsService = TransactionsService.getInstance();

