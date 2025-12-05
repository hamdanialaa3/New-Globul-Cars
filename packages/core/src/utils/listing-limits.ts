// src/utils/listing-limits.ts
// Listing Limits - Enforce plan caps

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@globul-cars/services';
import type { PlanTier } from '@globul-cars/core/types';
import { logger } from '@globul-cars/services';

// Plan Limits Configuration
// Updated December 2025 - Simplified to 3 plans matching BillingService
const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 5,
  dealer: 15,
  company: -1  // unlimited
};

/**
 * Check if user can add another listing
 * @param userId - User ID
 * @returns Promise<boolean>
 */
export async function canAddListing(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const planTier = userData.plan?.tier || 'free';
    const limit = PLAN_LIMITS[planTier as PlanTier] || 3;

    // Unlimited
    if (limit === -1) return true;

    // Check current active listings count
    const activeCount = userData.stats?.activeListings || 0;
    
    return activeCount < limit;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error checking listing limit', error as Error);
    }
    return false;
  }
}

/**
 * Get remaining listing slots for user
 * @param userId - User ID
 * @returns Promise<number> - -1 for unlimited
 */
export async function getRemainingListings(userId: string): Promise<number> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return 0;
    }

    const userData = userDoc.data();
    const planTier = userData.plan?.tier || 'free';
    const limit = PLAN_LIMITS[planTier as PlanTier] || 3;

    // Unlimited
    if (limit === -1) return -1;

    const activeCount = userData.stats?.activeListings || 0;
    
    return Math.max(0, limit - activeCount);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error getting remaining listings', error as Error);
    }
    return 0;
  }
}

/**
 * Get plan limit for a specific tier
 * @param planTier - Plan tier
 * @returns number - -1 for unlimited
 */
export function getPlanLimit(planTier: PlanTier): number {
  return PLAN_LIMITS[planTier] || 3;
}

