/**
 * AI Billing System
 * نظام فوترة الذكاء الاصطناعي - حساب التكاليف ومعالجة الدفعات
 * 
 * @module billing-system
 * @description نظام متكامل لإدارة فواتير استخدام AI وتحصيل الدفعات
 */

import { db } from '../../firebase/firebase-config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { logger } from '../logger-service';
import { aiQuotaService } from './ai-quota.service';
import { AITier } from '../../types/ai-quota.types';

// ================ Interfaces ================

export interface PricingPlan {
  tier: AITier;
  monthlyBaseCost: number; // بالدولار
  includedQuota: {
    imageAnalysis: number;
    priceSuggestions: number;
    chatMessages: number;
    profileAnalysis: number;
  };
  costPerExtraRequest: {
    imageAnalysis: number;
    priceSuggestions: number;
    chatMessages: number;
    profileAnalysis: number;
  };
  features: string[];
}

export interface MonthlyBill {
  userId: string;
  month: string; // YYYY-MM
  tier: AITier;
  baseCost: number;
  usage: {
    imageAnalysis: { used: number; included: number; extra: number; cost: number };
    priceSuggestions: { used: number; included: number; extra: number; cost: number };
    chatMessages: { used: number; included: number; extra: number; cost: number };
    profileAnalysis: { used: number; included: number; extra: number; cost: number };
  };
  extraCost: number;
  totalCost: number;
  currency: 'USD' | 'EUR' | 'BGN';
  generatedAt: Date;
  paidAt?: Date;
  paymentMethod?: string;
  stripeInvoiceId?: string;
}

export interface PaymentTransaction {
  id?: string;
  userId: string;
  billId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentId?: string;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

// ================ Pricing Configuration ================

const PRICING_PLANS: Record<AITier, PricingPlan> = {
  free: {
    tier: 'free',
    monthlyBaseCost: 0,
    includedQuota: {
      imageAnalysis: 10,
      priceSuggestions: 5,
      chatMessages: 20,
      profileAnalysis: 3
    },
    costPerExtraRequest: {
      imageAnalysis: 0.05,
      priceSuggestions: 0.03,
      chatMessages: 0.01,
      profileAnalysis: 0.10
    },
    features: [
      'Базов AI асистент',
      'Генериране на описания',
      'Основна ценова оценка'
    ]
  },
  pro: {
    tier: 'pro',
    monthlyBaseCost: 9.99,
    includedQuota: {
      imageAnalysis: 100,
      priceSuggestions: 50,
      chatMessages: 200,
      profileAnalysis: 20
    },
    costPerExtraRequest: {
      imageAnalysis: 0.03,
      priceSuggestions: 0.02,
      chatMessages: 0.005,
      profileAnalysis: 0.07
    },
    features: [
      'Пълен AI асистент',
      'Умни отговори',
      'Подробна ценова анализа',
      'Анализ на изображения',
      'Приоритетна поддръжка'
    ]
  },
  business: {
    tier: 'business',
    monthlyBaseCost: 49.99,
    includedQuota: {
      imageAnalysis: 500,
      priceSuggestions: 300,
      chatMessages: 1000,
      profileAnalysis: 100
    },
    costPerExtraRequest: {
      imageAnalysis: 0.02,
      priceSuggestions: 0.01,
      chatMessages: 0.003,
      profileAnalysis: 0.05
    },
    features: [
      'Неограничен достъп',
      'API интеграция',
      'Персонализирани модели',
      'Разширена аналитика',
      'Dedicated подръжка',
      'Експорт на данни'
    ]
  },
  enterprise: {
    tier: 'enterprise',
    monthlyBaseCost: 199.99,
    includedQuota: {
      imageAnalysis: -1, // Unlimited
      priceSuggestions: -1,
      chatMessages: -1,
      profileAnalysis: -1
    },
    costPerExtraRequest: {
      imageAnalysis: 0,
      priceSuggestions: 0,
      chatMessages: 0,
      profileAnalysis: 0
    },
    features: [
      'Неограничено всичко',
      'Персонализирани AI модели',
      'White-label решения',
      'On-premise опции',
      'SLA гаранции',
      '24/7 поддръжка',
      'Обучение на екип'
    ]
  }
};

// ================ Billing System Class ================

class AIBillingSystem {
  private static instance: AIBillingSystem;
  private readonly BILLS_COLLECTION = 'ai_bills';
  private readonly TRANSACTIONS_COLLECTION = 'ai_transactions';

  private constructor() {
    logger.info('AI Billing System initialized');
  }

  static getInstance(): AIBillingSystem {
    if (!this.instance) {
      this.instance = new AIBillingSystem();
    }
    return this.instance;
  }

  // ================ Bill Calculation ================

  /**
   * حساب فاتورة الشهر الحالي
   */
  async calculateMonthlyBill(userId: string): Promise<MonthlyBill> {
    try {
      // الحصول على بيانات المستخدم
      const quota = await aiQuotaService.getUserQuota(userId);
      const plan = PRICING_PLANS[quota.tier];

      const month = new Date().toISOString().slice(0, 7);

      // حساب الاستخدام الإضافي لكل ميزة
      const imageAnalysis = this.calculateFeatureUsage(
        quota.usedImageAnalysis,
        plan.includedQuota.imageAnalysis,
        plan.costPerExtraRequest.imageAnalysis
      );

      const priceSuggestions = this.calculateFeatureUsage(
        quota.usedPriceSuggestions,
        plan.includedQuota.priceSuggestions,
        plan.costPerExtraRequest.priceSuggestions
      );

      const chatMessages = this.calculateFeatureUsage(
        quota.usedChatMessages,
        plan.includedQuota.chatMessages,
        plan.costPerExtraRequest.chatMessages
      );

      const profileAnalysis = this.calculateFeatureUsage(
        quota.usedProfileAnalysis,
        plan.includedQuota.profileAnalysis,
        plan.costPerExtraRequest.profileAnalysis
      );

      // الحساب الإجمالي
      const extraCost = 
        imageAnalysis.cost +
        priceSuggestions.cost +
        chatMessages.cost +
        profileAnalysis.cost;

      const totalCost = plan.monthlyBaseCost + extraCost;

      const bill: MonthlyBill = {
        userId,
        month,
        tier: quota.tier,
        baseCost: plan.monthlyBaseCost,
        usage: {
          imageAnalysis,
          priceSuggestions,
          chatMessages,
          profileAnalysis
        },
        extraCost,
        totalCost,
        currency: 'EUR', // أو USD حسب الإعدادات
        generatedAt: new Date()
      };

      logger.info('Monthly bill calculated', {
        userId,
        month,
        totalCost,
        tier: quota.tier
      });

      return bill;

    } catch (error) {
      logger.error('Failed to calculate monthly bill', error as Error);
      throw error;
    }
  }

  /**
   * حساب استخدام ميزة واحدة
   */
  private calculateFeatureUsage(
    used: number,
    included: number,
    costPerExtra: number
  ): { used: number; included: number; extra: number; cost: number } {
    // Unlimited tier
    if (included === -1) {
      return { used, included, extra: 0, cost: 0 };
    }

    const extra = Math.max(0, used - included);
    const cost = extra * costPerExtra;

    return { used, included, extra, cost };
  }

  /**
   * حفظ الفاتورة في قاعدة البيانات
   */
  async saveBill(bill: MonthlyBill): Promise<string> {
    try {
      const billId = `${bill.userId}_${bill.month}`;
      await setDoc(doc(db, this.BILLS_COLLECTION, billId), {
        ...bill,
        generatedAt: Timestamp.fromDate(bill.generatedAt),
        paidAt: bill.paidAt ? Timestamp.fromDate(bill.paidAt) : null
      });

      logger.info('Bill saved', { billId, totalCost: bill.totalCost });
      return billId;

    } catch (error) {
      logger.error('Failed to save bill', error as Error);
      throw error;
    }
  }

  /**
   * الحصول على فاتورة معينة
   */
  async getBill(userId: string, month: string): Promise<MonthlyBill | null> {
    try {
      const billId = `${userId}_${month}`;
      const billDoc = await getDoc(doc(db, this.BILLS_COLLECTION, billId));

      if (!billDoc.exists()) {
        return null;
      }

      const data = billDoc.data();
      return {
        ...data,
        generatedAt: data.generatedAt.toDate(),
        paidAt: data.paidAt?.toDate()
      } as MonthlyBill;

    } catch (error) {
      logger.error('Failed to get bill', error as Error);
      return null;
    }
  }

  /**
   * الحصول على جميع فواتير المستخدم
   */
  async getUserBills(userId: string): Promise<MonthlyBill[]> {
    try {
      const q = query(
        collection(db, this.BILLS_COLLECTION),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          generatedAt: data.generatedAt.toDate(),
          paidAt: data.paidAt?.toDate()
        } as MonthlyBill;
      });

    } catch (error) {
      logger.error('Failed to get user bills', error as Error);
      return [];
    }
  }

  // ================ Payment Processing ================

  /**
   * معالجة الدفع (يتطلب تكامل Stripe)
   */
  async processPayment(
    userId: string,
    billId: string,
    paymentMethodId: string
  ): Promise<PaymentTransaction> {
    try {
      logger.info('Processing payment', { userId, billId });

      // الحصول على الفاتورة
      const [userIdFromBill, month] = billId.split('_');
      const bill = await this.getBill(userIdFromBill, month);

      if (!bill) {
        throw new Error('Bill not found');
      }

      if (bill.totalCost === 0) {
        // لا حاجة للدفع
        return {
          userId,
          billId,
          amount: 0,
          currency: bill.currency,
          status: 'completed',
          createdAt: new Date(),
          completedAt: new Date()
        };
      }

      // TODO: تكامل Stripe الفعلي
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(bill.totalCost * 100),
      //   currency: bill.currency.toLowerCase(),
      //   customer: userId,
      //   payment_method: paymentMethodId,
      //   confirm: true
      // });

      // محاكاة الدفع الناجح
      const transaction: PaymentTransaction = {
        userId,
        billId,
        amount: bill.totalCost,
        currency: bill.currency,
        status: 'completed',
        // stripePaymentId: paymentIntent.id,
        createdAt: new Date(),
        completedAt: new Date()
      };

      // حفظ المعاملة
      const transactionRef = await addDoc(
        collection(db, this.TRANSACTIONS_COLLECTION),
        {
          ...transaction,
          createdAt: Timestamp.fromDate(transaction.createdAt),
          completedAt: Timestamp.fromDate(transaction.completedAt!)
        }
      );

      transaction.id = transactionRef.id;

      // تحديث الفاتورة
      await updateDoc(doc(db, this.BILLS_COLLECTION, billId), {
        paidAt: Timestamp.now(),
        paymentMethod: paymentMethodId,
        status: 'paid'
      });

      logger.info('Payment processed successfully', {
        transactionId: transaction.id,
        amount: transaction.amount
      });

      return transaction;

    } catch (error) {
      logger.error('Payment processing failed', error as Error);

      // حفظ معاملة فاشلة
      const failedTransaction: PaymentTransaction = {
        userId,
        billId,
        amount: 0,
        currency: 'EUR',
        status: 'failed',
        createdAt: new Date(),
        errorMessage: (error as Error).message
      };

      await addDoc(collection(db, this.TRANSACTIONS_COLLECTION), {
        ...failedTransaction,
        createdAt: Timestamp.fromDate(failedTransaction.createdAt)
      });

      throw error;
    }
  }

  // ================ Monthly Billing Cycle ================

  /**
   * توليد فواتير نهاية الشهر (Cloud Function)
   */
  async generateMonthlyBills(): Promise<void> {
    try {
      logger.info('Starting monthly bill generation');

      // الحصول على جميع المستخدمين النشطين
      const usersSnapshot = await getDocs(collection(db, 'ai_quotas'));

      let generated = 0;
      let errors = 0;

      for (const userDoc of usersSnapshot.docs) {
        try {
          const userId = userDoc.id;
          const bill = await this.calculateMonthlyBill(userId);

          // حفظ الفاتورة فقط إذا كانت هناك تكلفة
          if (bill.totalCost > 0) {
            await this.saveBill(bill);
            generated++;
          }

        } catch (error) {
          logger.error(`Failed to generate bill for user`, error as Error);
          errors++;
        }
      }

      logger.info('Monthly bill generation completed', { generated, errors });

    } catch (error) {
      logger.error('Monthly bill generation failed', error as Error);
    }
  }

  /**
   * إعادة تعيين الحصص الشهرية
   */
  async resetMonthlyQuotas(): Promise<void> {
    try {
      logger.info('Resetting monthly quotas');

      const quotasSnapshot = await getDocs(collection(db, 'ai_quotas'));

      for (const quotaDoc of quotasSnapshot.docs) {
        await updateDoc(quotaDoc.ref, {
          usedImageAnalysis: 0,
          usedPriceSuggestions: 0,
          usedChatMessages: 0,
          usedProfileAnalysis: 0,
          lastResetDate: new Date().toISOString().split('T')[0]
        });
      }

      logger.info('Monthly quotas reset completed');

    } catch (error) {
      logger.error('Monthly quotas reset failed', error as Error);
    }
  }

  // ================ Reporting ================

  /**
   * تقرير الإيرادات الشهرية
   */
  async getMonthlyRevenue(month: string): Promise<{
    totalRevenue: number;
    billsCount: number;
    paidBillsCount: number;
    averageBill: number;
    revenueByTier: Record<AITier, number>;
  }> {
    try {
      const q = query(
        collection(db, this.BILLS_COLLECTION),
        where('month', '==', month)
      );

      const snapshot = await getDocs(q);
      const bills = snapshot.docs.map(doc => doc.data() as MonthlyBill);

      const paidBills = bills.filter(b => b.paidAt);
      const totalRevenue = paidBills.reduce((sum, b) => sum + b.totalCost, 0);
      const averageBill = paidBills.length > 0 ? totalRevenue / paidBills.length : 0;

      const revenueByTier: Record<AITier, number> = {
        free: 0,
        pro: 0,
        business: 0,
        enterprise: 0
      };

      paidBills.forEach(bill => {
        revenueByTier[bill.tier] += bill.totalCost;
      });

      return {
        totalRevenue,
        billsCount: bills.length,
        paidBillsCount: paidBills.length,
        averageBill,
        revenueByTier
      };

    } catch (error) {
      logger.error('Failed to get monthly revenue', error as Error);
      throw error;
    }
  }

  // ================ Utilities ================

  /**
   * الحصول على خطة التسعير
   */
  getPricingPlan(tier: AITier): PricingPlan {
    return PRICING_PLANS[tier];
  }

  /**
   * الحصول على جميع خطط التسعير
   */
  getAllPricingPlans(): PricingPlan[] {
    return Object.values(PRICING_PLANS);
  }

  /**
   * ترقية/تخفيض الخطة
   */
  async changePlanTier(userId: string, newTier: AITier): Promise<void> {
    try {
      const quota = await aiQuotaService.getUserQuota(userId);
      
      await updateDoc(doc(db, 'ai_quotas', userId), {
        tier: newTier,
        tierChangedAt: Timestamp.now(),
        previousTier: quota.tier
      });

      logger.info('Plan tier changed', {
        userId,
        oldTier: quota.tier,
        newTier
      });

    } catch (error) {
      logger.error('Failed to change plan tier', error as Error);
      throw error;
    }
  }
}

// ================ Export ================

export const aiBillingSystem = AIBillingSystem.getInstance();
export default aiBillingSystem;
