/**
 * AI Premium Plans Service
 * Manages AI service subscriptions and monetization
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from '../logger-service';

export type AIPlan = 'free' | 'basic' | 'professional' | 'enterprise';

export interface AISubscription {
  userId: string;
  plan: AIPlan;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  
  // Usage quotas
  quotas: {
    aiAdvisor: {
      limit: number;
      used: number;
    };
    aiValuation: {
      limit: number;
      used: number;
    };
    carHistory: {
      limit: number;
      used: number;
    };
    premiumFeatures: boolean;
  };
  
  // Payment
  paymentMethod: 'bank' | 'card';
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  amount: number;
  currency: string;
}

export interface PlanFeatures {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    aiAdvisorLimit: number; // -1 = unlimited
    aiValuationLimit: number;
    carHistoryLimit: number;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    bulkOperations: boolean;
    apiAccess: boolean;
    customBranding: boolean;
  };
}

class AIPremiumPlansService {
  private static instance: AIPremiumPlansService;
  private readonly COLLECTION = 'ai_subscriptions';

  private readonly PLANS: Record<AIPlan, PlanFeatures> = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      features: {
        aiAdvisorLimit: 3,
        aiValuationLimit: 1,
        carHistoryLimit: 0,
        prioritySupport: false,
        advancedAnalytics: false,
        bulkOperations: false,
        apiAccess: false,
        customBranding: false
      }
    },
    basic: {
      name: 'Basic',
      price: { monthly: 9.99, yearly: 99 },
      features: {
        aiAdvisorLimit: 20,
        aiValuationLimit: 10,
        carHistoryLimit: 5,
        prioritySupport: false,
        advancedAnalytics: false,
        bulkOperations: false,
        apiAccess: false,
        customBranding: false
      }
    },
    professional: {
      name: 'Professional',
      price: { monthly: 29.99, yearly: 299 },
      features: {
        aiAdvisorLimit: 100,
        aiValuationLimit: 50,
        carHistoryLimit: 20,
        prioritySupport: true,
        advancedAnalytics: true,
        bulkOperations: true,
        apiAccess: false,
        customBranding: false
      }
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 99.99, yearly: 999 },
      features: {
        aiAdvisorLimit: -1, // unlimited
        aiValuationLimit: -1,
        carHistoryLimit: -1,
        prioritySupport: true,
        advancedAnalytics: true,
        bulkOperations: true,
        apiAccess: true,
        customBranding: true
      }
    }
  };

  private constructor() {}

  static getInstance(): AIPremiumPlansService {
    if (!AIPremiumPlansService.instance) {
      AIPremiumPlansService.instance = new AIPremiumPlansService();
    }
    return AIPremiumPlansService.instance;
  }

  /**
   * Get available plans
   */
  getPlans(): Record<AIPlan, PlanFeatures> {
    return this.PLANS;
  }

  /**
   * Get user's subscription
   */
  async getUserSubscription(userId: string): Promise<AISubscription | null> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create free plan for new users
        return this.createFreeSubscription(userId);
      }

      const data = docSnap.data();
      return {
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        lastPaymentDate: data.lastPaymentDate?.toDate(),
        nextPaymentDate: data.nextPaymentDate?.toDate()
      } as AISubscription;
    } catch (error) {
      serviceLogger.error('Error fetching subscription:', error);
      throw new Error('Failed to fetch subscription');
    }
  }

  /**
   * Create free subscription for new user
   */
  private async createFreeSubscription(userId: string): Promise<AISubscription> {
    const now = new Date();
    const subscription: AISubscription = {
      userId,
      plan: 'free',
      status: 'active',
      startDate: now,
      endDate: new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()), // 10 years
      autoRenew: false,
      quotas: {
        aiAdvisor: {
          limit: this.PLANS.free.features.aiAdvisorLimit,
          used: 0
        },
        aiValuation: {
          limit: this.PLANS.free.features.aiValuationLimit,
          used: 0
        },
        carHistory: {
          limit: this.PLANS.free.features.carHistoryLimit,
          used: 0
        },
        premiumFeatures: false
      },
      paymentMethod: 'bank',
      amount: 0,
      currency: 'BGN'
    };

    try {
      await setDoc(doc(db, this.COLLECTION, userId), {
        ...subscription,
        startDate: Timestamp.fromDate(subscription.startDate),
        endDate: Timestamp.fromDate(subscription.endDate)
      });

      return subscription;
    } catch (error) {
      serviceLogger.error('Error creating free subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(
    userId: string,
    newPlan: AIPlan,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<AISubscription> {
    try {
      const now = new Date();
      const planFeatures = this.PLANS[newPlan];
      const endDate = new Date(
        billingCycle === 'monthly'
          ? now.setMonth(now.getMonth() + 1)
          : now.setFullYear(now.getFullYear() + 1)
      );

      const subscription: AISubscription = {
        userId,
        plan: newPlan,
        status: 'active',
        startDate: new Date(),
        endDate,
        autoRenew: true,
        quotas: {
          aiAdvisor: {
            limit: planFeatures.features.aiAdvisorLimit,
            used: 0
          },
          aiValuation: {
            limit: planFeatures.features.aiValuationLimit,
            used: 0
          },
          carHistory: {
            limit: planFeatures.features.carHistoryLimit,
            used: 0
          },
          premiumFeatures: newPlan !== 'free'
        },
        paymentMethod: 'bank',
        lastPaymentDate: new Date(),
        nextPaymentDate: endDate,
        amount: billingCycle === 'monthly' ? planFeatures.price.monthly : planFeatures.price.yearly,
        currency: 'BGN'
      };

      await setDoc(doc(db, this.COLLECTION, userId), {
        ...subscription,
        startDate: Timestamp.fromDate(subscription.startDate),
        endDate: Timestamp.fromDate(subscription.endDate),
        lastPaymentDate: Timestamp.fromDate(subscription.lastPaymentDate!),
        nextPaymentDate: Timestamp.fromDate(subscription.nextPaymentDate!)
      });

      serviceLogger.info(`User ${userId} upgraded to ${newPlan}`);
      return subscription;
    } catch (error) {
      serviceLogger.error('Error upgrading subscription:', error);
      throw new Error('Failed to upgrade subscription');
    }
  }

  /**
   * Check if user can use feature
   */
  async canUseFeature(userId: string, feature: 'aiAdvisor' | 'aiValuation' | 'carHistory'): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;

      const quota = subscription.quotas[feature];
      if (quota.limit === -1) return true; // Unlimited
      return quota.used < quota.limit;
    } catch (error) {
      serviceLogger.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Increment feature usage
   */
  async incrementUsage(userId: string, feature: 'aiAdvisor' | 'aiValuation' | 'carHistory'): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      await updateDoc(docRef, {
        [`quotas.${feature}.used`]: increment(1)
      });
    } catch (error) {
      serviceLogger.error('Error incrementing usage:', error);
      throw new Error('Failed to update usage');
    }
  }

  /**
   * Reset monthly quotas (called by scheduled function)
   */
  async resetMonthlyQuotas(userId: string): Promise<void> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return;

      const planFeatures = this.PLANS[subscription.plan];
      
      await updateDoc(doc(db, this.COLLECTION, userId), {
        'quotas.aiAdvisor.used': 0,
        'quotas.aiValuation.used': 0,
        'quotas.carHistory.used': 0
      });

      serviceLogger.info(`Reset quotas for user ${userId}`);
    } catch (error) {
      serviceLogger.error('Error resetting quotas:', error);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION, userId), {
        status: 'cancelled',
        autoRenew: false
      });

      serviceLogger.info(`Cancelled subscription for user ${userId}`);
    } catch (error) {
      serviceLogger.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get plan comparison for UI
   */
  getPlanComparison(language: 'bg' | 'en' = 'bg') {
    const texts = {
      bg: {
        free: 'Безплатен',
        basic: 'Основен',
        professional: 'Професионален',
        enterprise: 'Корпоративен',
        perMonth: 'на месец',
        perYear: 'на година',
        unlimited: 'Неограничено',
        features: {
          aiAdvisor: 'AI Съветник',
          aiValuation: 'AI Оценка',
          carHistory: 'История на автомобила',
          prioritySupport: 'Приоритетна поддръжка',
          advancedAnalytics: 'Разширена аналитика',
          bulkOperations: 'Масови операции',
          apiAccess: 'API достъп',
          customBranding: 'Персонализиран брандинг'
        }
      },
      en: {
        free: 'Free',
        basic: 'Basic',
        professional: 'Professional',
        enterprise: 'Enterprise',
        perMonth: 'per month',
        perYear: 'per year',
        unlimited: 'Unlimited',
        features: {
          aiAdvisor: 'AI Advisor',
          aiValuation: 'AI Valuation',
          carHistory: 'Car History',
          prioritySupport: 'Priority Support',
          advancedAnalytics: 'Advanced Analytics',
          bulkOperations: 'Bulk Operations',
          apiAccess: 'API Access',
          customBranding: 'Custom Branding'
        }
      }
    };

    return { plans: this.PLANS, texts: texts[language] };
  }
}

export const aiPremiumPlansService = AIPremiumPlansService.getInstance();
