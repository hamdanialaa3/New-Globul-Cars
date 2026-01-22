/**
 * Manual Payment Service
 * Handles bank transfer transactions and verification workflow
 * 
 * @since January 9, 2026
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import type { 
  ManualPaymentTransaction, 
  PaymentStatus, 
  PaymentType,
  BankAccountType,
  PaymentVerificationRequest 
} from '../../types/payment.types';
import { generatePaymentReference } from '../../config/bank-details';

class ManualPaymentService {
  private static instance: ManualPaymentService;
  private readonly COLLECTION_NAME = 'manual_transactions';

  private constructor() {}

  public static getInstance(): ManualPaymentService {
    if (!ManualPaymentService.instance) {
      ManualPaymentService.instance = new ManualPaymentService();
    }
    return ManualPaymentService.instance;
  }

  /**
   * Create a new manual payment transaction
   */
  async createTransaction(params: {
    userId: string;
    userEmail: string;
    userName: string;
    amount: number;
    currency: 'EUR' | 'BGN';
    paymentType: PaymentType;
    itemId: string;
    itemDescription: string;
    selectedBankAccount: BankAccountType;
    userConfirmedTransfer: boolean;
    userTransferDate?: Date;
    userProvidedReference?: string;
    userNotes?: string;
    metadata?: any;
  }): Promise<{ success: boolean; transactionId: string; referenceNumber: string }> {
    try {
      const referenceNumber = generatePaymentReference(params.paymentType, params.itemId);
      
      // Calculate expiration (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const transactionData = {
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        amount: params.amount,
        currency: params.currency,
        paymentType: params.paymentType,
        itemId: params.itemId,
        itemDescription: params.itemDescription,
        referenceNumber,
        selectedBankAccount: params.selectedBankAccount,
        status: 'pending_manual_verification' as PaymentStatus,
        userConfirmedTransfer: params.userConfirmedTransfer,
        userTransferDate: params.userTransferDate || null,
        userProvidedReference: params.userProvidedReference || null,
        metadata: params.metadata || {},
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        transactionData
      );

      logger.info('Manual payment transaction created', {
        transactionId: docRef.id,
        userId: params.userId,
        amount: params.amount,
        referenceNumber
      });

      return {
        success: true,
        transactionId: docRef.id,
        referenceNumber
      };
    } catch (error) {
      logger.error('Failed to create manual payment transaction', error as Error, {
        userId: params.userId,
        amount: params.amount
      });
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<ManualPaymentTransaction | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, transactionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        verifiedAt: data.verifiedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        userTransferDate: data.userTransferDate?.toDate(),
      } as ManualPaymentTransaction;
    } catch (error) {
      logger.error('Failed to get transaction', error as Error, { transactionId });
      return null;
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: string): Promise<ManualPaymentTransaction[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        userTransferDate: doc.data().userTransferDate?.toDate(),
      })) as ManualPaymentTransaction[];
    } catch (error) {
      logger.error('Failed to get user transactions', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get pending transactions (Admin)
   */
  async getPendingTransactions(): Promise<ManualPaymentTransaction[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'pending_manual_verification'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        userTransferDate: doc.data().userTransferDate?.toDate(),
      })) as ManualPaymentTransaction[];
    } catch (error) {
      logger.error('Failed to get pending transactions', error as Error);
      return [];
    }
  }

  /**
   * Verify transaction (Admin only)
   */
  async verifyTransaction(request: PaymentVerificationRequest): Promise<{ success: boolean }> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, request.transactionId);
      const updateData: any = {
        status: request.status,
        verifiedBy: request.adminId,
        verifiedAt: serverTimestamp(),
      };

      if (request.notes) {
        updateData.verificationNotes = request.notes;
      }

      if (request.status === 'verified') {
        updateData.completedAt = serverTimestamp();
      }

      if (request.status === 'rejected') {
        updateData.rejectionReason = request.notes || 'Payment not found or invalid';
      }

      await updateDoc(docRef, updateData);

      // If verified, activate the subscription/promotion
      if (request.status === 'verified') {
        const transaction = await this.getTransaction(request.transactionId);
        if (transaction) {
          await this.activatePaymentItem(transaction);
        }
      }

      logger.info('Transaction verified', {
        transactionId: request.transactionId,
        status: request.status,
        adminId: request.adminId
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to verify transaction', error as Error, {
        transactionId: request.transactionId
      });
      throw error;
    }
  }

  /**
   * Activate subscription/promotion after verification
   */
  private async activatePaymentItem(transaction: ManualPaymentTransaction): Promise<void> {
    try {
      if (transaction.paymentType === 'subscription') {
        await this.activateSubscription(transaction);
      } else if (transaction.paymentType === 'promotion') {
        await this.activatePromotion(transaction);
      }
    } catch (error) {
      logger.error('Failed to activate payment item', error as Error, {
        transactionId: transaction.id,
        paymentType: transaction.paymentType
      });
    }
  }

  /**
   * Activate subscription
   */
  private async activateSubscription(transaction: ManualPaymentTransaction): Promise<void> {
    try {
      const userRef = doc(db, 'users', transaction.userId);
      const planTier = transaction.metadata?.planTier || 'dealer';
      
      // Calculate subscription period (30 days)
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

      await updateDoc(userRef, {
        planTier,
        profileType: planTier === 'free' ? 'private' : planTier,
        subscriptionStatus: 'active',
        subscriptionStart: serverTimestamp(),
        subscriptionCurrentPeriodEnd: Timestamp.fromDate(currentPeriodEnd),
        lastPaymentMethod: 'manual_bank_transfer',
        updatedAt: serverTimestamp()
      });

      logger.info('Subscription activated', {
        userId: transaction.userId,
        planTier,
        transactionId: transaction.id
      });

      // Create notification
      await this.createNotification(transaction.userId, {
        type: 'subscription_activated',
        title: 'Вашият абонамент е активиран! 🎉',
        titleEn: 'Your subscription is now active! 🎉',
        message: `Благодарим за плащането! Вашият ${planTier} план е активен.`,
        messageEn: `Thank you for your payment! Your ${planTier} plan is now active.`,
        metadata: {
          transactionId: transaction.id,
          amount: transaction.amount
        }
      });
    } catch (error) {
      logger.error('Failed to activate subscription', error as Error, {
        userId: transaction.userId,
        transactionId: transaction.id
      });
      throw error;
    }
  }

  /**
   * Activate promotion
   */
  private async activatePromotion(transaction: ManualPaymentTransaction): Promise<void> {
    try {
      // Logic for activating promotions (VIP badge, top of page, etc.)
      const promotionType = transaction.metadata?.promotionType;
      const listingId = transaction.itemId;

      logger.info('Promotion activated', {
        userId: transaction.userId,
        promotionType,
        listingId,
        transactionId: transaction.id
      });

      // Create notification
      await this.createNotification(transaction.userId, {
        type: 'promotion_activated',
        title: 'Промоцията е активна! ⭐',
        titleEn: 'Promotion is now active! ⭐',
        message: `Вашата ${promotionType} промоция е активирана успешно.`,
        messageEn: `Your ${promotionType} promotion has been activated successfully.`,
        metadata: {
          transactionId: transaction.id,
          listingId
        }
      });
    } catch (error) {
      logger.error('Failed to activate promotion', error as Error, {
        transactionId: transaction.id
      });
      throw error;
    }
  }

  /**
   * Create notification
   */
  private async createNotification(
    userId: string,
    notification: {
      type: string;
      title: string;
      titleEn: string;
      message: string;
      messageEn: string;
      metadata?: any;
    }
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Failed to create notification', error as Error, { userId });
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus,
    notes?: string
  ): Promise<{ success: boolean }> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, transactionId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (notes) {
        updateData.statusNotes = notes;
      }

      await updateDoc(docRef, updateData);

      logger.info('Transaction status updated', {
        transactionId,
        status
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to update transaction status', error as Error, {
        transactionId
      });
      throw error;
    }
  }

  /**
   * Check for expired transactions
   */
  async checkExpiredTransactions(): Promise<void> {
    try {
      const now = new Date();
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'pending_manual_verification'),
        where('expiresAt', '<', Timestamp.fromDate(now))
      );

      const snapshot = await getDocs(q);
      
      for (const docSnap of snapshot.docs) {
        await updateDoc(docSnap.ref, {
          status: 'expired' as PaymentStatus,
          updatedAt: serverTimestamp()
        });

        logger.info('Transaction expired', {
          transactionId: docSnap.id
        });
      }
    } catch (error) {
      logger.error('Failed to check expired transactions', error as Error);
    }
  }
}

export const manualPaymentService = ManualPaymentService.getInstance();
export default manualPaymentService;
