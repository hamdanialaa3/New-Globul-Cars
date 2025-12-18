// src/services/subscription/UsageTrackingService.ts
// Professional Usage Tracking Service
// Monitors user resource usage against plan limits

import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { permissionsService } from '../profile/permissions-service';
import type { ProfileType, PlanTier, ProfilePermissions } from '../../types/user/bulgarian-user.types';

// ==================== TYPES ====================

export interface UsageStats {
  listings: {
    current: number;
    max: number;
    percentage: number;
    unlimited: boolean;
  };
  teamMembers: {
    current: number;
    max: number;
    percentage: number;
    unlimited: boolean;
  };
  campaigns: {
    current: number;
    max: number;
    percentage: number;
    unlimited: boolean;
  };
  apiCalls: {
    current: number;
    max: number;
    percentage: number;
    unlimited: boolean;
    resetsAt: Date;
  };
}

export type UsageType = 'listings' | 'teamMembers' | 'campaigns' | 'apiCalls';

export interface UsageWarning {
  type: UsageType;
  message: {
    bg: string;
    en: string;
  };
  severity: 'info' | 'warning' | 'error';
  percentage: number;
}

// ==================== USAGE TRACKING SERVICE ====================

class UsageTrackingService {
  private static instance: UsageTrackingService;

  // Warning thresholds
  private readonly WARNING_THRESHOLD = 80; // 80%
  private readonly CRITICAL_THRESHOLD = 95; // 95%

  private constructor() {
    serviceLogger.info('UsageTrackingService initialized');
  }

  public static getInstance(): UsageTrackingService {
    if (!UsageTrackingService.instance) {
      UsageTrackingService.instance = new UsageTrackingService();
    }
    return UsageTrackingService.instance;
  }

  /**
   * Get Current Usage Statistics
   * 
   * @param userId - User ID
   * @returns Complete usage statistics
   */
  async getCurrentUsage(userId: string): Promise<UsageStats | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        serviceLogger.warn('User not found', { userId });
        return null;
      }

      const userData = userDoc.data();
      const profileType: ProfileType = userData.profileType || 'private';
      const planTier: PlanTier = userData.planTier || 'free';

      // Get permissions for current plan
      const permissions = permissionsService.getPermissions(profileType, planTier);

      // Get current usage from stats
      const stats = userData.stats || {};
      const activeListings = stats.activeListings || 0;
      const teamMembers = stats.teamMembers || 0;
      const activeCampaigns = stats.activeCampaigns || 0;
      const apiCallsThisHour = stats.apiCallsThisHour || 0;

      // Calculate API rate limit reset time (next hour)
      const now = new Date();
      const resetsAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);

      return {
        listings: this.calculateUsageMetric(
          activeListings,
          permissions.maxListings
        ),
        teamMembers: this.calculateUsageMetric(
          teamMembers,
          permissions.maxTeamMembers
        ),
        campaigns: this.calculateUsageMetric(
          activeCampaigns,
          permissions.maxCampaigns
        ),
        apiCalls: {
          ...this.calculateUsageMetric(
            apiCallsThisHour,
            permissions.apiRateLimitPerHour
          ),
          resetsAt,
        },
      };

    } catch (error: unknown) {
      serviceLogger.error('Error getting current usage', error as Error, { userId });
      return null;
    }
  }

  /**
   * Calculate Usage Metric
   * 
   * @param current - Current usage count
   * @param max - Maximum allowed (-1 for unlimited)
   * @returns Usage metric with percentage
   */
  private calculateUsageMetric(current: number, max: number): {
    current: number;
    max: number;
    percentage: number;
    unlimited: boolean;
  } {
    const unlimited = max === -1;
    const percentage = unlimited ? 0 : (current / max) * 100;

    return {
      current,
      max,
      percentage: Math.min(percentage, 100),
      unlimited,
    };
  }

  /**
   * Check if User Should Be Warned
   * 
   * @param usage - Usage statistics
   * @returns True if any metric is >= 80%
   */
  shouldWarnUser(usage: UsageStats): boolean {
    return (
      (!usage.listings.unlimited && usage.listings.percentage >= this.WARNING_THRESHOLD) ||
      (!usage.teamMembers.unlimited && usage.teamMembers.percentage >= this.WARNING_THRESHOLD) ||
      (!usage.campaigns.unlimited && usage.campaigns.percentage >= this.WARNING_THRESHOLD) ||
      (!usage.apiCalls.unlimited && usage.apiCalls.percentage >= this.WARNING_THRESHOLD)
    );
  }

  /**
   * Check if User Should Be Blocked
   * 
   * @param usage - Usage statistics
   * @returns True if any metric is >= 100%
   */
  shouldBlockUser(usage: UsageStats): boolean {
    return (
      (!usage.listings.unlimited && usage.listings.current >= usage.listings.max) ||
      (!usage.teamMembers.unlimited && usage.teamMembers.current >= usage.teamMembers.max) ||
      (!usage.campaigns.unlimited && usage.campaigns.current >= usage.campaigns.max) ||
      (!usage.apiCalls.unlimited && usage.apiCalls.current >= usage.apiCalls.max)
    );
  }

  /**
   * Get Usage Warnings
   * 
   * @param usage - Usage statistics
   * @returns Array of usage warnings
   */
  getUsageWarnings(usage: UsageStats): UsageWarning[] {
    const warnings: UsageWarning[] = [];

    // Listings warning
    if (!usage.listings.unlimited && usage.listings.percentage >= this.WARNING_THRESHOLD) {
      warnings.push({
        type: 'listings',
        message: {
          bg: `Използвате ${usage.listings.current} от ${usage.listings.max} обяви (${usage.listings.percentage.toFixed(0)}%)`,
          en: `You're using ${usage.listings.current} of ${usage.listings.max} listings (${usage.listings.percentage.toFixed(0)}%)`,
        },
        severity: usage.listings.percentage >= this.CRITICAL_THRESHOLD ? 'error' : 'warning',
        percentage: usage.listings.percentage,
      });
    }

    // Team members warning
    if (!usage.teamMembers.unlimited && usage.teamMembers.percentage >= this.WARNING_THRESHOLD) {
      warnings.push({
        type: 'teamMembers',
        message: {
          bg: `Използвате ${usage.teamMembers.current} от ${usage.teamMembers.max} членове на екипа (${usage.teamMembers.percentage.toFixed(0)}%)`,
          en: `You're using ${usage.teamMembers.current} of ${usage.teamMembers.max} team members (${usage.teamMembers.percentage.toFixed(0)}%)`,
        },
        severity: usage.teamMembers.percentage >= this.CRITICAL_THRESHOLD ? 'error' : 'warning',
        percentage: usage.teamMembers.percentage,
      });
    }

    // Campaigns warning
    if (!usage.campaigns.unlimited && usage.campaigns.percentage >= this.WARNING_THRESHOLD) {
      warnings.push({
        type: 'campaigns',
        message: {
          bg: `Използвате ${usage.campaigns.current} от ${usage.campaigns.max} кампании (${usage.campaigns.percentage.toFixed(0)}%)`,
          en: `You're using ${usage.campaigns.current} of ${usage.campaigns.max} campaigns (${usage.campaigns.percentage.toFixed(0)}%)`,
        },
        severity: usage.campaigns.percentage >= this.CRITICAL_THRESHOLD ? 'error' : 'warning',
        percentage: usage.campaigns.percentage,
      });
    }

    // API calls warning
    if (!usage.apiCalls.unlimited && usage.apiCalls.percentage >= this.WARNING_THRESHOLD) {
      warnings.push({
        type: 'apiCalls',
        message: {
          bg: `Използвахте ${usage.apiCalls.current} от ${usage.apiCalls.max} API заявки този час (${usage.apiCalls.percentage.toFixed(0)}%)`,
          en: `You've used ${usage.apiCalls.current} of ${usage.apiCalls.max} API calls this hour (${usage.apiCalls.percentage.toFixed(0)}%)`,
        },
        severity: usage.apiCalls.percentage >= this.CRITICAL_THRESHOLD ? 'error' : 'warning',
        percentage: usage.apiCalls.percentage,
      });
    }

    return warnings;
  }

  /**
   * Increment Usage Counter
   * 
   * @param userId - User ID
   * @param type - Usage type to increment
   * @returns True if successful
   */
  async incrementUsage(userId: string, type: UsageType): Promise<boolean> {
    try {
      const statsField = this.getStatsFieldName(type);
      
      await updateDoc(doc(db, 'users', userId), {
        [`stats.${statsField}`]: increment(1),
        updatedAt: new Date(),
      });

      serviceLogger.info('Usage incremented', { userId, type });
      return true;

    } catch (error: unknown) {
      serviceLogger.error('Error incrementing usage', error as Error, { userId, type });
      return false;
    }
  }

  /**
   * Decrement Usage Counter
   * 
   * @param userId - User ID
   * @param type - Usage type to decrement
   * @returns True if successful
   */
  async decrementUsage(userId: string, type: UsageType): Promise<boolean> {
    try {
      const statsField = this.getStatsFieldName(type);
      
      await updateDoc(doc(db, 'users', userId), {
        [`stats.${statsField}`]: increment(-1),
        updatedAt: new Date(),
      });

      serviceLogger.info('Usage decremented', { userId, type });
      return true;

    } catch (error: unknown) {
      serviceLogger.error('Error decrementing usage', error as Error, { userId, type });
      return false;
    }
  }

  /**
   * Reset API Calls Counter (Hourly)
   * 
   * @param userId - User ID
   */
  async resetAPICallsCounter(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'stats.apiCallsThisHour': 0,
        'stats.apiCallsLastReset': new Date(),
        updatedAt: new Date(),
      });

      serviceLogger.info('API calls counter reset', { userId });

    } catch (error: unknown) {
      serviceLogger.error('Error resetting API calls', error as Error, { userId });
    }
  }

  /**
   * Get Stats Field Name
   * 
   * @param type - Usage type
   * @returns Firestore field name
   */
  private getStatsFieldName(type: UsageType): string {
    switch (type) {
      case 'listings':
        return 'activeListings';
      case 'teamMembers':
        return 'teamMembers';
      case 'campaigns':
        return 'activeCampaigns';
      case 'apiCalls':
        return 'apiCallsThisHour';
      default:
        return 'activeListings';
    }
  }

  /**
   * Check if Action is Allowed
   * 
   * @param userId - User ID
   * @param type - Usage type
   * @returns True if action is allowed
   */
  async canPerformAction(userId: string, type: UsageType): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const usage = await this.getCurrentUsage(userId);
    
    if (!usage) {
      return { allowed: false, reason: 'Could not fetch usage data' };
    }

    let metric;
    switch (type) {
      case 'listings':
        metric = usage.listings;
        break;
      case 'teamMembers':
        metric = usage.teamMembers;
        break;
      case 'campaigns':
        metric = usage.campaigns;
        break;
      case 'apiCalls':
        metric = usage.apiCalls;
        break;
    }

    if (metric.unlimited) {
      return { allowed: true };
    }

    if (metric.current >= metric.max) {
      return {
        allowed: false,
        reason: `You've reached your plan limit of ${metric.max} ${type}`,
      };
    }

    return { allowed: true };
  }
}

// ==================== EXPORT ====================

export const usageTrackingService = UsageTrackingService.getInstance();
export default usageTrackingService;
