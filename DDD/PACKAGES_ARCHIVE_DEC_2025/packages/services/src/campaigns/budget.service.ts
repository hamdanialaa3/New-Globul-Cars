/**
 * Budget Service - إدارة ميزانيات الحملات
 */

import { doc, updateDoc, increment, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';
import { campaignService, CampaignStatus } from './campaign.service';
import { logger } from '../logger-service';

interface BudgetUpdate {
  campaignId: string;
  amount: number;
  type: 'impression' | 'click' | 'conversion';
}

interface DailySpending {
  campaignId: string;
  date: string; // YYYY-MM-DD
  spent: number;
  impressions: number;
  clicks: number;
}

class BudgetService {
  private campaignsCollection = 'campaigns';
  private dailySpendingCollection = 'daily_spending';

  /**
   * Deduct Budget
   */
  async deductBudget(update: BudgetUpdate): Promise<boolean> {
    try {
      const campaign = await campaignService.getCampaign(update.campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Check if budget available
      const remainingBudget = campaign.budget - campaign.spent;
      if (remainingBudget < update.amount) {
        // Pause campaign if budget exhausted
        await campaignService.updateCampaignStatus(update.campaignId, CampaignStatus.PAUSED);
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Campaign ${update.campaignId} paused - budget exhausted`);
        }
        return false;
      }

      // Check daily budget
      const canSpendToday = await this.checkDailyBudget(update.campaignId, update.amount);
      if (!canSpendToday) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Campaign ${update.campaignId} reached daily budget limit`);
        }
        return false;
      }

      // Deduct budget
      const docRef = doc(db, this.campaignsCollection, update.campaignId);
      await updateDoc(docRef, {
        spent: increment(update.amount),
        lastUpdated: serverTimestamp()
      });

      // Record daily spending
      await this.recordDailySpending(update.campaignId, update.amount, update.type);

      return true;
    } catch (error) {
      logger.error('Error deducting budget', error as Error);
      throw error;
    }
  }

  /**
   * Check Daily Budget
   */
  async checkDailyBudget(campaignId: string, additionalAmount: number = 0): Promise<boolean> {
    try {
      const campaign = await campaignService.getCampaign(campaignId);
      
      if (!campaign) {
        return false;
      }

      // Get today's spending
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const todaySpending = await this.getTodaySpending(campaignId, dateStr);
      const totalTodaySpending = todaySpending + additionalAmount;

      return totalTodaySpending <= campaign.dailyBudget;
    } catch (error) {
      logger.error('Error checking daily budget', error as Error);
      return false;
    }
  }

  /**
   * Get Today's Spending
   */
  private async getTodaySpending(campaignId: string, dateStr: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.dailySpendingCollection),
        where('campaignId', '==', campaignId),
        where('date', '==', dateStr)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return 0;
      }

      const doc = snapshot.docs[0];
      const data = doc.data() as DailySpending;
      return data.spent || 0;
    } catch (error) {
      logger.error('Error getting today spending', error as Error);
      return 0;
    }
  }

  /**
   * Record Daily Spending
   */
  private async recordDailySpending(
    campaignId: string,
    amount: number,
    type: 'impression' | 'click' | 'conversion'
  ): Promise<void> {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const q = query(
        collection(db, this.dailySpendingCollection),
        where('campaignId', '==', campaignId),
        where('date', '==', dateStr)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Create new daily spending record
        const docRef = doc(collection(db, this.dailySpendingCollection));
        const spending: DailySpending = {
          campaignId,
          date: dateStr,
          spent: amount,
          impressions: type === 'impression' ? 1 : 0,
          clicks: type === 'click' ? 1 : 0
        };
        await updateDoc(docRef, spending as any);
      } else {
        // Update existing record
        const docRef = snapshot.docs[0].ref;
        const updates: any = {
          spent: increment(amount)
        };
        
        if (type === 'impression') {
          updates.impressions = increment(1);
        } else if (type === 'click') {
          updates.clicks = increment(1);
        }

        await updateDoc(docRef, updates);
      }
    } catch (error) {
      logger.error('Error recording daily spending', error as Error);
    }
  }

  /**
   * Get Budget Status
   */
  async getBudgetStatus(campaignId: string): Promise<{
    totalBudget: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    dailyBudget: number;
    dailySpent: number;
    dailyRemaining: number;
    daysRemaining: number;
  } | null> {
    try {
      const campaign = await campaignService.getCampaign(campaignId);
      
      if (!campaign) {
        return null;
      }

      const remaining = campaign.budget - campaign.spent;
      const percentUsed = (campaign.spent / campaign.budget) * 100;
      
      // Calculate daily spending
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const dailySpent = await this.getTodaySpending(campaignId, dateStr);
      const dailyRemaining = campaign.dailyBudget - dailySpent;

      // Calculate days remaining
      const now = new Date();
      const endDate = campaign.endDate.toDate();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        totalBudget: campaign.budget,
        spent: campaign.spent,
        remaining,
        percentUsed,
        dailyBudget: campaign.dailyBudget,
        dailySpent,
        dailyRemaining,
        daysRemaining
      };
    } catch (error) {
      logger.error('Error getting budget status', error as Error);
      return null;
    }
  }

  /**
   * Get Campaign Spending History
   */
  async getSpendingHistory(campaignId: string, days: number = 7): Promise<DailySpending[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, this.dailySpendingCollection),
        where('campaignId', '==', campaignId),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as DailySpending);
    } catch (error) {
      logger.error('Error getting spending history', error as Error);
      return [];
    }
  }

  /**
   * Check and Pause Expired Campaigns
   */
  async checkAndPauseExpiredCampaigns(userId: string): Promise<void> {
    try {
      const campaigns = await campaignService.getUserCampaigns(userId);
      const now = new Date();

      for (const campaign of campaigns) {
        if (campaign.status === CampaignStatus.ACTIVE) {
          const endDate = campaign.endDate.toDate();
          
          // Check if campaign expired
          if (now > endDate) {
            await campaignService.updateCampaignStatus(campaign.id, CampaignStatus.COMPLETED);
            if (process.env.NODE_ENV === 'development') {
              logger.debug(`Campaign ${campaign.id} completed - duration ended`);
            }
          }
          
          // Check if budget exhausted
          if (campaign.spent >= campaign.budget) {
            await campaignService.updateCampaignStatus(campaign.id, CampaignStatus.PAUSED);
            if (process.env.NODE_ENV === 'development') {
              logger.debug(`Campaign ${campaign.id} paused - budget exhausted`);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error checking expired campaigns', error as Error);
    }
  }

  /**
   * Estimate Campaign Duration Based on Budget
   */
  estimateDuration(budget: number, dailyBudget: number): number {
    return Math.ceil(budget / dailyBudget);
  }

  /**
   * Estimate Daily Budget Based on Duration
   */
  estimateDailyBudget(budget: number, duration: number): number {
    return budget / duration;
  }

  /**
   * Validate Budget Settings
   */
  validateBudgetSettings(budget: number, dailyBudget: number, duration: number): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (budget < 10) {
      errors.push('Minimum total budget is 10 EUR');
    }

    if (dailyBudget < 1) {
      errors.push('Minimum daily budget is 1 EUR');
    }

    if (duration < 1) {
      errors.push('Minimum duration is 1 day');
    }

    if (dailyBudget * duration < budget) {
      errors.push('Daily budget × duration must be at least equal to total budget');
    }

    if (dailyBudget > budget) {
      errors.push('Daily budget cannot exceed total budget');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const budgetService = new BudgetService();
