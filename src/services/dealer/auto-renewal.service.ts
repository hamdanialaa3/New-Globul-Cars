/**
 * Auto-Renewal Service for Dealer Listings
 * Automatically republishes expired listings for subscribed dealers
 * Location: Bulgaria
 * 
 * File: src/services/dealer/auto-renewal.service.ts
 * Created: February 8, 2026
 */

import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { SUBSCRIPTION_PLANS } from '../../config/subscription-plans';
import type { PlanTier } from '../../config/subscription-plans';

export interface RenewalResult {
  userId: string;
  carId: string;
  renewedAt: Date;
  success: boolean;
  error?: string;
}

export interface RenewalReport {
  totalProcessed: number;
  totalRenewed: number;
  totalFailed: number;
  details: RenewalResult[];
  executedAt: Date;
}

class AutoRenewalService {
  private static instance: AutoRenewalService;
  private readonly EXPIRY_DAYS = 30;
  private readonly RENEWAL_PRIORITY_HOURS = 6;

  private constructor() {}

  static getInstance(): AutoRenewalService {
    if (!AutoRenewalService.instance) {
      AutoRenewalService.instance = new AutoRenewalService();
    }
    return AutoRenewalService.instance;
  }

  async processAutoRenewals(): Promise<RenewalReport> {
    const startTime = Date.now();
    const results: RenewalResult[] = [];

    try {
      serviceLogger.info('Starting auto-renewal process');

      const expiredCars = await this.findExpiredListings();
      serviceLogger.info(`Found ${expiredCars.length} expired listings`);

      for (const car of expiredCars) {
        const result = await this.renewListing(car);
        results.push(result);
      }

      const report: RenewalReport = {
        totalProcessed: results.length,
        totalRenewed: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        details: results,
        executedAt: new Date()
      };

      const duration = Date.now() - startTime;
      serviceLogger.info('Auto-renewal completed', {
        ...report,
        durationMs: duration
      });

      return report;
    } catch (error) {
      serviceLogger.error('Auto-renewal process failed', error as Error);
      throw error;
    }
  }

  private async findExpiredListings(): Promise<any[]> {
    const now = new Date();
    const expiryDate = new Date(now.getTime() - this.EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const collections = [
      'cars_basic_info',
      'cars_technical',
      'cars_condition',
      'cars_location',
      'cars_media',
      'cars_pricing'
    ];

    const expiredCars: any[] = [];

    for (const collectionName of collections) {
      try {
        const q = query(
          collection(db, collectionName),
          where('isActive', '==', true),
          where('createdAt', '<=', Timestamp.fromDate(expiryDate))
        );

        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          expiredCars.push({
            id: doc.id,
            collection: collectionName,
            data: doc.data()
          });
        });
      } catch (error) {
        serviceLogger.error(`Error querying ${collectionName}`, error as Error);
      }
    }

    return expiredCars;
  }

  private async renewListing(car: any): Promise<RenewalResult> {
    try {
      const userId = car.data.userId || car.data.sellerId;
      if (!userId) {
        return {
          userId: 'unknown',
          carId: car.id,
          renewedAt: new Date(),
          success: false,
          error: 'Missing userId'
        };
      }

      const userPlan = await this.getUserPlan(userId);
      
      if (!this.canAutoRenew(userPlan)) {
        return {
          userId,
          carId: car.id,
          renewedAt: new Date(),
          success: false,
          error: 'User plan does not support auto-renewal'
        };
      }

      await this.performRenewal(car);

      serviceLogger.info('Listing renewed', { userId, carId: car.id });

      return {
        userId,
        carId: car.id,
        renewedAt: new Date(),
        success: true
      };
    } catch (error) {
      return {
        userId: car.data.userId || 'unknown',
        carId: car.id,
        renewedAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getUserPlan(userId: string): Promise<PlanTier> {
    try {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', userId))
      );

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        return userData.subscriptionTier || 'free';
      }

      return 'free';
    } catch (error) {
      serviceLogger.error('Error getting user plan', error as Error, { userId });
      return 'free';
    }
  }

  private canAutoRenew(plan: PlanTier): boolean {
    return plan === 'dealer' || plan === 'company';
  }

  private async performRenewal(car: any): Promise<void> {
    const now = Timestamp.now();
    const docRef = doc(db, car.collection, car.id);

    await updateDoc(docRef, {
      createdAt: now,
      updatedAt: now,
      renewedAt: now,
      renewalCount: (car.data.renewalCount || 0) + 1,
      isActive: true
    });
  }

  async scheduleRenewalCheck(userId: string, carId: string): Promise<void> {
    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + this.EXPIRY_DAYS - 1);

      serviceLogger.info('Renewal scheduled', {
        userId,
        carId,
        scheduledDate: scheduledDate.toISOString()
      });
    } catch (error) {
      serviceLogger.error('Failed to schedule renewal', error as Error, { userId, carId });
    }
  }

  async getRenewalHistory(userId: string): Promise<RenewalResult[]> {
    try {
      const historyRef = collection(db, 'renewal_history');
      const q = query(historyRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => doc.data() as RenewalResult);
    } catch (error) {
      serviceLogger.error('Error fetching renewal history', error as Error, { userId });
      return [];
    }
  }
}

export const autoRenewalService = AutoRenewalService.getInstance();
