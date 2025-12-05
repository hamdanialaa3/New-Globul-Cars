/**
 * Impression Service - تتبع عرض الإعلانات
 */

import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';
import { campaignService } from './campaign.service';
import { budgetService } from './budget.service';
import { logger } from '../logger-service';

interface ImpressionData {
  campaignId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  region?: string;
  referrer?: string;
}

interface Impression {
  id: string;
  campaignId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  region?: string;
  referrer?: string;
  timestamp: Timestamp;
}

interface ImpressionAnalytics {
  totalImpressions: number;
  uniqueUsers: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserBreakdown: Record<string, number>;
  regionBreakdown: Record<string, number>;
  hourlyBreakdown: Record<number, number>;
}

class ImpressionService {
  private impressionsCollection = 'campaign_impressions';
  private clicksCollection = 'campaign_clicks';
  private costPerImpression = 0.01; // 0.01 EUR per impression
  private costPerClick = 0.10; // 0.10 EUR per click

  /**
   * Record Impression
   */
  async recordImpression(data: ImpressionData): Promise<boolean> {
    try {
      // Check if campaign is active
      const campaign = await campaignService.getCampaign(data.campaignId);
      if (!campaign || campaign.status !== 'active') {
        return false;
      }

      // Check daily budget
      const canSpend = await budgetService.checkDailyBudget(
        data.campaignId,
        this.costPerImpression
      );
      if (!canSpend) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Daily budget exhausted for campaign', { campaignId: data.campaignId });
        }
        return false;
      }

      // Detect device type
      const device = this.detectDevice(data.userAgent);
      const browser = this.detectBrowser(data.userAgent);
      const os = this.detectOS(data.userAgent);

      // Create impression record
      const impressionRef = doc(collection(db, this.impressionsCollection));
      const impression: Omit<Impression, 'id'> = {
        campaignId: data.campaignId,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        device,
        browser,
        os,
        location: data.location,
        region: data.region,
        referrer: data.referrer,
        timestamp: serverTimestamp() as Timestamp
      };

      await setDoc(impressionRef, impression);

      // Update campaign impressions
      await campaignService.recordImpression(data.campaignId);

      // Deduct budget
      await budgetService.deductBudget({
        campaignId: data.campaignId,
        amount: this.costPerImpression,
        type: 'impression'
      });

      return true;
    } catch (error) {
      logger.error('Error recording impression', error as Error);
      return false;
    }
  }

  /**
   * Record Click
   */
  async recordClick(data: ImpressionData): Promise<boolean> {
    try {
      // Check if campaign is active
      const campaign = await campaignService.getCampaign(data.campaignId);
      if (!campaign || campaign.status !== 'active') {
        return false;
      }

      // Check daily budget
      const canSpend = await budgetService.checkDailyBudget(
        data.campaignId,
        this.costPerClick
      );
      if (!canSpend) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Daily budget exhausted for campaign', { campaignId: data.campaignId });
        }
        return false;
      }

      // Detect device info
      const device = this.detectDevice(data.userAgent);
      const browser = this.detectBrowser(data.userAgent);
      const os = this.detectOS(data.userAgent);

      // Create click record
      const clickRef = doc(collection(db, this.clicksCollection));
      const click: Omit<Impression, 'id'> = {
        campaignId: data.campaignId,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        device,
        browser,
        os,
        location: data.location,
        region: data.region,
        referrer: data.referrer,
        timestamp: serverTimestamp() as Timestamp
      };

      await setDoc(clickRef, click);

      // Update campaign clicks
      await campaignService.recordClick(data.campaignId);

      // Deduct budget
      await budgetService.deductBudget({
        campaignId: data.campaignId,
        amount: this.costPerClick,
        type: 'click'
      });

      return true;
    } catch (error) {
      logger.error('Error recording click', error as Error);
      return false;
    }
  }

  /**
   * Get Campaign Impressions
   */
  async getCampaignImpressions(
    campaignId: string,
    limitCount?: number
  ): Promise<Impression[]> {
    try {
      let q = query(
        collection(db, this.impressionsCollection),
        where('campaignId', '==', campaignId),
        orderBy('timestamp', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Impression));
    } catch (error) {
      logger.error('Error getting impressions', error as Error);
      return [];
    }
  }

  /**
   * Get Campaign Clicks
   */
  async getCampaignClicks(
    campaignId: string,
    limitCount?: number
  ): Promise<Impression[]> {
    try {
      let q = query(
        collection(db, this.clicksCollection),
        where('campaignId', '==', campaignId),
        orderBy('timestamp', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Impression));
    } catch (error) {
      logger.error('Error getting clicks', error as Error);
      return [];
    }
  }

  /**
   * Get Impression Analytics
   */
  async getImpressionAnalytics(campaignId: string): Promise<ImpressionAnalytics> {
    try {
      const impressions = await this.getCampaignImpressions(campaignId);
      
      const analytics: ImpressionAnalytics = {
        totalImpressions: impressions.length,
        uniqueUsers: 0,
        deviceBreakdown: {
          desktop: 0,
          mobile: 0,
          tablet: 0
        },
        browserBreakdown: {},
        regionBreakdown: {},
        hourlyBreakdown: {}
      };

      const uniqueUserIds = new Set<string>();
      const uniqueIps = new Set<string>();

      impressions.forEach(impression => {
        // Count unique users
        if (impression.userId) {
          uniqueUserIds.add(impression.userId);
        }
        if (impression.ipAddress) {
          uniqueIps.add(impression.ipAddress);
        }

        // Device breakdown
        if (impression.device === 'mobile') {
          analytics.deviceBreakdown.mobile++;
        } else if (impression.device === 'tablet') {
          analytics.deviceBreakdown.tablet++;
        } else {
          analytics.deviceBreakdown.desktop++;
        }

        // Browser breakdown
        if (impression.browser) {
          analytics.browserBreakdown[impression.browser] = 
            (analytics.browserBreakdown[impression.browser] || 0) + 1;
        }

        // Region breakdown
        if (impression.region) {
          analytics.regionBreakdown[impression.region] = 
            (analytics.regionBreakdown[impression.region] || 0) + 1;
        }

        // Hourly breakdown
        const hour = impression.timestamp.toDate().getHours();
        analytics.hourlyBreakdown[hour] = (analytics.hourlyBreakdown[hour] || 0) + 1;
      });

      analytics.uniqueUsers = Math.max(uniqueUserIds.size, uniqueIps.size);

      return analytics;
    } catch (error) {
      logger.error('Error getting impression analytics', error as Error);
      throw error;
    }
  }

  /**
   * Detect Device Type from User Agent
   */
  private detectDevice(userAgent?: string): string {
    if (!userAgent) return 'desktop';
    
    const ua = userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * Detect Browser from User Agent
   */
  private detectBrowser(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    if (ua.includes('msie') || ua.includes('trident')) return 'IE';
    
    return 'unknown';
  }

  /**
   * Detect Operating System from User Agent
   */
  private detectOS(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('win')) return 'Windows';
    if (ua.includes('mac')) return 'MacOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return 'unknown';
  }

  /**
   * Get Cost Per Impression
   */
  getCostPerImpression(): number {
    return this.costPerImpression;
  }

  /**
   * Get Cost Per Click
   */
  getCostPerClick(): number {
    return this.costPerClick;
  }

  /**
   * Set Cost Per Impression (Admin only)
   */
  setCostPerImpression(cost: number): void {
    if (cost > 0) {
      this.costPerImpression = cost;
    }
  }

  /**
   * Set Cost Per Click (Admin only)
   */
  setCostPerClick(cost: number): void {
    if (cost > 0) {
      this.costPerClick = cost;
    }
  }
}

// Export singleton instance
export const impressionService = new ImpressionService();
