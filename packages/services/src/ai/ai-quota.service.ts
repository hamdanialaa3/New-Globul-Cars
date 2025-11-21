// AI Quota Management Service
// خدمة إدارة حصص الذكاء الاصطناعي

import { db } from '@globul-cars/services';
import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { AIQuota, AIUsageLog, AITier } from '@globul-cars/core/typesai-quota.types';
import { AI_TIER_CONFIGS, hasExceededQuota, calculateAICost } from '@globul-cars/core/config/ai-tiers.config';
import { logger } from '../logger-service';

class AIQuotaService {
  private readonly COLLECTION = 'ai_quotas';
  private readonly USAGE_LOGS = 'ai_usage_logs';

  // Get or create user quota
  async getUserQuota(userId: string): Promise<AIQuota> {
    try {
      const quotaRef = doc(db, this.COLLECTION, userId);
      const quotaSnap = await getDoc(quotaRef);

      if (quotaSnap.exists()) {
        const quota = quotaSnap.data() as AIQuota;
        
        // Reset daily quota if new day
        if (this.shouldResetQuota(quota.lastResetDate)) {
          return await this.resetDailyQuota(userId, quota.tier);
        }
        
        return quota;
      }

      // Create new quota for new user
      return await this.createUserQuota(userId, 'free');
      
    } catch (error) {
      logger.error('Error getting user quota', error as Error);
      throw error;
    }
  }

  // Create new user quota
  private async createUserQuota(userId: string, tier: AITier = 'free'): Promise<AIQuota> {
    const config = AI_TIER_CONFIGS[tier];
    const today = new Date().toISOString().split('T')[0];
    
    const newQuota: AIQuota = {
      userId,
      tier,
      dailyImageAnalysis: config.limits.dailyImageAnalysis,
      dailyPriceSuggestions: config.limits.dailyPriceSuggestions,
      dailyChatMessages: config.limits.dailyChatMessages,
      dailyProfileAnalysis: config.limits.dailyProfileAnalysis,
      usedImageAnalysis: 0,
      usedPriceSuggestions: 0,
      usedChatMessages: 0,
      usedProfileAnalysis: 0,
      lastResetDate: today,
      totalCost: 0,
      lastBillingDate: today
    };

    await setDoc(doc(db, this.COLLECTION, userId), newQuota);
    logger.info('Created new AI quota', { userId, tier });
    
    return newQuota;
  }

  // Check if user can use feature
  async canUseFeature(
    userId: string, 
    feature: 'image_analysis' | 'price_suggestion' | 'chat' | 'profile_analysis'
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    try {
      const quota = await this.getUserQuota(userId);
      
      const featureMap = {
        image_analysis: { used: quota.usedImageAnalysis, limit: quota.dailyImageAnalysis },
        price_suggestion: { used: quota.usedPriceSuggestions, limit: quota.dailyPriceSuggestions },
        chat: { used: quota.usedChatMessages, limit: quota.dailyChatMessages },
        profile_analysis: { used: quota.usedProfileAnalysis, limit: quota.dailyProfileAnalysis }
      };

      const { used, limit } = featureMap[feature];
      
      // Unlimited for enterprise
      if (limit === -1) {
        return { allowed: true, remaining: -1 };
      }

      if (hasExceededQuota(used, limit)) {
        return { 
          allowed: false, 
          reason: `Daily limit reached (${limit}). Upgrade for more.`,
          remaining: 0
        };
      }

      return { 
        allowed: true, 
        remaining: limit - used 
      };
      
    } catch (error) {
      logger.error('Error checking feature access', error as Error);
      return { allowed: false, reason: 'Error checking quota' };
    }
  }

  // Track feature usage
  async trackUsage(
    userId: string,
    feature: 'image_analysis' | 'price_suggestion' | 'chat' | 'profile_analysis',
    success: boolean,
    metadata?: any
  ): Promise<void> {
    try {
      const quota = await this.getUserQuota(userId);
      const cost = calculateAICost(quota.tier, 1);

      // Update quota usage
      const quotaRef = doc(db, this.COLLECTION, userId);
      const updateField = {
        image_analysis: 'usedImageAnalysis',
        price_suggestion: 'usedPriceSuggestions',
        chat: 'usedChatMessages',
        profile_analysis: 'usedProfileAnalysis'
      }[feature];

      await updateDoc(quotaRef, {
        [updateField]: increment(1),
        totalCost: increment(cost)
      });

      // Log usage
      const usageLog: Omit<AIUsageLog, 'id'> = {
        userId,
        feature,
        timestamp: Date.now(),
        cost,
        tier: quota.tier,
        success,
        metadata
      };

      await addDoc(collection(db, this.USAGE_LOGS), usageLog);
      
      logger.debug('AI usage tracked', { userId, feature, cost });
      
    } catch (error) {
      logger.error('Error tracking usage', error as Error);
    }
  }

  // Upgrade user tier
  async upgradeTier(userId: string, newTier: AITier): Promise<void> {
    try {
      // Get or create quota first
      const quota = await this.getUserQuota(userId);
      const config = AI_TIER_CONFIGS[newTier];
      const quotaRef = doc(db, this.COLLECTION, userId);

      await updateDoc(quotaRef, {
        tier: newTier,
        dailyImageAnalysis: config.limits.dailyImageAnalysis,
        dailyPriceSuggestions: config.limits.dailyPriceSuggestions,
        dailyChatMessages: config.limits.dailyChatMessages,
        dailyProfileAnalysis: config.limits.dailyProfileAnalysis
      });

      logger.info('User tier upgraded', { userId, newTier });
      
    } catch (error) {
      logger.error('Error upgrading tier', error as Error);
      throw error;
    }
  }

  // Reset daily quota
  private async resetDailyQuota(userId: string, tier: AITier): Promise<AIQuota> {
    const config = AI_TIER_CONFIGS[tier];
    const today = new Date().toISOString().split('T')[0];
    
    const quotaRef = doc(db, this.COLLECTION, userId);
    await updateDoc(quotaRef, {
      usedImageAnalysis: 0,
      usedPriceSuggestions: 0,
      usedChatMessages: 0,
      usedProfileAnalysis: 0,
      lastResetDate: today
    });

    logger.info('Daily quota reset', { userId });
    
    return await this.getUserQuota(userId);
  }

  // Check if quota should be reset
  private shouldResetQuota(lastResetDate: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return lastResetDate !== today;
  }

  // Get usage statistics
  async getUsageStats(userId: string, days: number = 30): Promise<any> {
    try {
      const quota = await this.getUserQuota(userId);
      
      return {
        tier: quota.tier,
        totalCost: quota.totalCost,
        currentUsage: {
          imageAnalysis: `${quota.usedImageAnalysis}/${quota.dailyImageAnalysis}`,
          priceSuggestions: `${quota.usedPriceSuggestions}/${quota.dailyPriceSuggestions}`,
          chatMessages: `${quota.usedChatMessages}/${quota.dailyChatMessages}`,
          profileAnalysis: `${quota.usedProfileAnalysis}/${quota.dailyProfileAnalysis}`
        },
        lastReset: quota.lastResetDate
      };
      
    } catch (error) {
      logger.error('Error getting usage stats', error as Error);
      throw error;
    }
  }
}

export const aiQuotaService = new AIQuotaService();
export default aiQuotaService;
