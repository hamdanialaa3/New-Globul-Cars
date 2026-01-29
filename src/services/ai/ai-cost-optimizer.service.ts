/**
 * AI Cost Optimizer Service
 * Tracks costs, manages budgets, auto-switches providers
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import { db } from '../../firebase/firebase-config';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { logger } from '../logger-service';

interface BudgetStatus {
  geminiExceeded: boolean;
  deepseekExceeded: boolean;
  geminiRemaining: number;
  deepseekRemaining: number;
  currentMonth: string;
}

class AICostOptimizerService {
  private static instance: AICostOptimizerService;
  
  private readonly COLLECTION = 'ai_cost_tracking';
  private readonly STATS_DOC = 'monthly_stats';

  private readonly DEFAULT_LIMITS = {
    gemini: 50.0, // $50/month
    deepseek: 30.0 // $30/month
  };

  private constructor() {}

  static getInstance(): AICostOptimizerService {
    if (!this.instance) {
      this.instance = new AICostOptimizerService();
    }
    return this.instance;
  }

  /**
   * Track AI cost for a request
   */
  async trackCost(provider: 'gemini' | 'deepseek', cost: number): Promise<void> {
    try {
      const currentMonth = this.getCurrentMonth();
      const statsRef = doc(db, this.COLLECTION, this.STATS_DOC);

      await setDoc(statsRef, {
        [provider]: {
          monthlySpent: increment(cost),
          requestCount: increment(1),
          lastReset: currentMonth,
          lastUpdate: serverTimestamp()
        }
      }, { merge: true });

      logger.info('AI cost tracked', { provider, cost, currentMonth });

      // Check if warning threshold reached
      await this.checkThresholds(provider);

    } catch (error) {
      logger.error('Cost tracking failed', error as Error, { provider, cost });
    }
  }

  /**
   * Check budget status
   */
  async checkBudgetStatus(): Promise<BudgetStatus> {
    try {
      const currentMonth = this.getCurrentMonth();
      const statsRef = doc(db, this.COLLECTION, this.STATS_DOC);

      const statsDoc = await getDoc(statsRef);
      const stats = statsDoc.data();

      // Reset if new month
      const geminiSpent = stats?.gemini?.monthlySpent || 0;
      const deepseekSpent = stats?.deepseek?.monthlySpent || 0;

      return {
        geminiExceeded: geminiSpent >= this.DEFAULT_LIMITS.gemini,
        deepseekExceeded: deepseekSpent >= this.DEFAULT_LIMITS.deepseek,
        geminiRemaining: Math.max(0, this.DEFAULT_LIMITS.gemini - geminiSpent),
        deepseekRemaining: Math.max(0, this.DEFAULT_LIMITS.deepseek - deepseekSpent),
        currentMonth
      };

    } catch (error) {
      logger.error('Budget status check failed', error as Error);
      
      // Return safe defaults
      return {
        geminiExceeded: false,
        deepseekExceeded: false,
        geminiRemaining: this.DEFAULT_LIMITS.gemini,
        deepseekRemaining: this.DEFAULT_LIMITS.deepseek,
        currentMonth: this.getCurrentMonth()
      };
    }
  }

  /**
   * Get cost report for admins
   */
  async getCostReport(): Promise<{
    gemini: {
      spent: number;
      remaining: number;
      requestCount: number;
      averageCost: number;
    };
    deepseek: {
      spent: number;
      remaining: number;
      requestCount: number;
      averageCost: number;
    };
    total: {
      spent: number;
      saved: number;
    };
    month: string;
  }> {
    const statsRef = doc(db, this.COLLECTION, this.STATS_DOC);
    const statsDoc = await getDoc(statsRef);
    const stats = statsDoc.data();

    const geminiSpent = stats?.gemini?.monthlySpent || 0;
    const geminiCount = stats?.gemini?.requestCount || 0;
    const deepseekSpent = stats?.deepseek?.monthlySpent || 0;
    const deepseekCount = stats?.deepseek?.requestCount || 0;

    const geminiAvg = geminiCount > 0 ? geminiSpent / geminiCount : 0;
    const deepseekAvg = deepseekCount > 0 ? deepseekSpent / deepseekCount : 0;

    const totalSpent = geminiSpent + deepseekSpent;
    const totalRequests = geminiCount + deepseekCount;
    
    // Calculate savings (if all requests were Gemini)
    const geminiEquivalent = totalRequests * 0.002;
    const saved = Math.max(0, geminiEquivalent - totalSpent);

    return {
      gemini: {
        spent: geminiSpent,
        remaining: this.DEFAULT_LIMITS.gemini - geminiSpent,
        requestCount: geminiCount,
        averageCost: geminiAvg
      },
      deepseek: {
        spent: deepseekSpent,
        remaining: this.DEFAULT_LIMITS.deepseek - deepseekSpent,
        requestCount: deepseekCount,
        averageCost: deepseekAvg
      },
      total: {
        spent: totalSpent,
        saved
      },
      month: this.getCurrentMonth()
    };
  }

  /**
   * Check thresholds and log warnings
   */
  private async checkThresholds(provider: 'gemini' | 'deepseek'): Promise<void> {
    const statsRef = doc(db, this.COLLECTION, this.STATS_DOC);
    const statsDoc = await getDoc(statsRef);
    const stats = statsDoc.data();

    if (!stats) return;

    const spent = stats[provider]?.monthlySpent || 0;
    const limit = this.DEFAULT_LIMITS[provider];
    const warningThreshold = limit * 0.8;

    // Warning threshold
    if (spent >= warningThreshold && spent < limit) {
      logger.warn('AI budget warning threshold reached', {
        provider,
        spent,
        limit,
        remaining: limit - spent
      });
    }

    // Limit exceeded
    if (spent >= limit) {
      logger.error('AI budget limit exceeded', {
        provider,
        spent,
        limit
      });
    }
  }

  /**
   * Get current month string (YYYY-MM)
   */
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}

export const aiCostOptimizerService = AICostOptimizerService.getInstance();
export { AICostOptimizerService };
