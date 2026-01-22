import { logger } from '../logger-service';
/**
 * Campaign Service - نظام إدارة الحملات الإعلانية
 * Location: Bulgaria | Currency: EUR | Languages: BG/EN
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

// ==================== TYPES ====================

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CampaignType {
  CAR_LISTING = 'car_listing',      // ترويج إعلان سيارة
  PROFILE_BOOST = 'profile_boost',   // رفع ظهور البروفايل
  FEATURED = 'featured',             // ظهور في القائمة المميزة
  HOMEPAGE = 'homepage'               // ظهور في الصفحة الرئيسية
}

export interface Campaign {
  id: string;
  userId: string;
  carId?: string; // optional - for car-specific campaigns
  type: CampaignType;
  status: CampaignStatus;
  
  // Budget & Duration
  budget: number; // EUR
  spent: number; // EUR
  dailyBudget: number; // EUR per day
  startDate: Timestamp;
  endDate: Timestamp;
  duration: number; // days
  
  // Targeting
  targetRegions: string[]; // ['Sofia', 'Plovdiv', ...]
  targetAudience?: {
    minAge?: number;
    maxAge?: number;
    interests?: string[];
    carBrands?: string[];
  };
  
  // Performance
  impressions: number;
  clicks: number;
  views: number;
  inquiries: number;
  conversions: number;
  ctr: number; // Click-Through Rate (%)
  cpc: number; // Cost Per Click (EUR)
  cpa: number; // Cost Per Acquisition (EUR)
  roi: number; // Return on Investment (%)
  
  // Metadata
  title: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastUpdated: Timestamp;
}

export interface CampaignCreateData {
  type: CampaignType;
  carId?: string;
  budget: number;
  duration: number;
  dailyBudget: number;
  targetRegions: string[];
  targetAudience?: Campaign['targetAudience'];
  title: string;
  description: string;
}

export interface CampaignAnalytics {
  totalBudget: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageROI: number;
  activeCampaigns: number;
  completedCampaigns: number;
}

// ==================== SERVICE CLASS ====================

class CampaignService {
  private campaignsCollection = 'campaigns';
  private impressionsCollection = 'campaign_impressions';
  
  /**
   * Create New Campaign
   */
  async createCampaign(
    userId: string,
    data: CampaignCreateData
  ): Promise<string> {
    try {
      // Validation
      if (data.budget < 10) {
        throw new Error('Minimum budget is 10 EUR');
      }
      if (data.duration < 1) {
        throw new Error('Minimum duration is 1 day');
      }
      if (data.dailyBudget > data.budget) {
        throw new Error('Daily budget cannot exceed total budget');
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + data.duration);

      // Create campaign document
      const campaignRef = doc(collection(db, this.campaignsCollection));
      const campaignId = campaignRef.id;

      const campaign: Omit<Campaign, 'id'> = {
        userId,
        carId: data.carId,
        type: data.type,
        status: CampaignStatus.DRAFT,
        budget: data.budget,
        spent: 0,
        dailyBudget: data.dailyBudget,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        duration: data.duration,
        targetRegions: data.targetRegions,
        targetAudience: data.targetAudience,
        impressions: 0,
        clicks: 0,
        views: 0,
        inquiries: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpa: 0,
        roi: 0,
        title: data.title,
        description: data.description,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        lastUpdated: serverTimestamp() as Timestamp
      };

      await setDoc(campaignRef, campaign);
      return campaignId;
    } catch (error) {
      logger.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Get User Campaigns
   */
  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    try {
      const q = query(
        collection(db, this.campaignsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Campaign));
    } catch (error) {
      logger.error('Error getting user campaigns:', error);
      return [];
    }
  }

  /**
   * Get Campaign by ID
   */
  async getCampaign(campaignId: string): Promise<Campaign | null> {
    try {
      const docRef = doc(db, this.campaignsCollection, campaignId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Campaign;
      }
      return null;
    } catch (error) {
      logger.error('Error getting campaign:', error);
      return null;
    }
  }

  /**
   * Update Campaign Status
   */
  async updateCampaignStatus(
    campaignId: string,
    status: CampaignStatus
  ): Promise<void> {
    try {
      const docRef = doc(db, this.campaignsCollection, campaignId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error updating campaign status:', error);
      throw error;
    }
  }

  /**
   * Record Impression
   */
  async recordImpression(campaignId: string): Promise<void> {
    try {
      const docRef = doc(db, this.campaignsCollection, campaignId);
      await updateDoc(docRef, {
        impressions: increment(1),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error recording impression:', error);
    }
  }

  /**
   * Record Click
   */
  async recordClick(campaignId: string): Promise<void> {
    try {
      const docRef = doc(db, this.campaignsCollection, campaignId);
      const campaign = await this.getCampaign(campaignId);
      
      if (campaign) {
        const newClicks = campaign.clicks + 1;
        const ctr = (newClicks / campaign.impressions) * 100;
        const cpc = campaign.spent / newClicks;

        await updateDoc(docRef, {
          clicks: increment(1),
          ctr,
          cpc,
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      logger.error('Error recording click:', error);
    }
  }

  /**
   * Record Conversion
   */
  async recordConversion(campaignId: string): Promise<void> {
    try {
      const docRef = doc(db, this.campaignsCollection, campaignId);
      const campaign = await this.getCampaign(campaignId);
      
      if (campaign) {
        const newConversions = campaign.conversions + 1;
        const cpa = campaign.spent / newConversions;
        const roi = ((campaign.budget - campaign.spent) / campaign.spent) * 100;

        await updateDoc(docRef, {
          conversions: increment(1),
          cpa,
          roi,
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      logger.error('Error recording conversion:', error);
    }
  }

  /**
   * Get Campaign Analytics
   */
  async getCampaignAnalytics(userId: string): Promise<CampaignAnalytics> {
    try {
      const campaigns = await this.getUserCampaigns(userId);
      
      const analytics: CampaignAnalytics = {
        totalBudget: 0,
        totalSpent: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        averageCTR: 0,
        averageCPC: 0,
        averageROI: 0,
        activeCampaigns: 0,
        completedCampaigns: 0
      };

      campaigns.forEach(campaign => {
        analytics.totalBudget += campaign.budget;
        analytics.totalSpent += campaign.spent;
        analytics.totalImpressions += campaign.impressions;
        analytics.totalClicks += campaign.clicks;
        analytics.totalConversions += campaign.conversions;
        
        if (campaign.status === CampaignStatus.ACTIVE) {
          analytics.activeCampaigns++;
        } else if (campaign.status === CampaignStatus.COMPLETED) {
          analytics.completedCampaigns++;
        }
      });

      // Calculate averages
      if (analytics.totalImpressions > 0) {
        analytics.averageCTR = (analytics.totalClicks / analytics.totalImpressions) * 100;
      }
      if (analytics.totalClicks > 0) {
        analytics.averageCPC = analytics.totalSpent / analytics.totalClicks;
      }
      if (analytics.totalSpent > 0) {
        analytics.averageROI = ((analytics.totalBudget - analytics.totalSpent) / analytics.totalSpent) * 100;
      }

      return analytics;
    } catch (error) {
      logger.error('Error getting campaign analytics:', error);
      throw error;
    }
  }

  /**
   * Update Campaign
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<Campaign>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.campaignsCollection, campaignId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error updating campaign:', error);
      throw error;
    }
  }

  /**
   * Delete Campaign
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.campaignsCollection, campaignId));
    } catch (error) {
      logger.error('Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Get Active Campaigns for Car
   */
  async getActiveCampaignsForCar(carId: string): Promise<Campaign[]> {
    try {
      const q = query(
        collection(db, this.campaignsCollection),
        where('carId', '==', carId),
        where('status', '==', CampaignStatus.ACTIVE)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Campaign));
    } catch (error) {
      logger.error('Error getting active campaigns for car:', error);
      return [];
    }
  }

  /**
   * Check if Car has Active Campaign
   */
  async hasActiveCampaign(carId: string): Promise<boolean> {
    try {
      const campaigns = await this.getActiveCampaignsForCar(carId);
      return campaigns.length > 0;
    } catch (error) {
      logger.error('Error checking active campaign:', error);
      return false;
    }
  }
}

// Export singleton instance
export const campaignService = new CampaignService();
