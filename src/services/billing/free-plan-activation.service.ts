/**
 * Free Plan Activation Service
 *
 * Activates a dealer or company plan for a user WITHOUT requiring payment,
 * used when the admin has enabled the promotional "Free Offer" toggle.
 *
 * Safety checks:
 *  1. Re-reads the promotional_offer Firestore doc server-side to confirm
 *     the free offer is still active (prevents race conditions).
 *  2. Validates the requested plan tier.
 *  3. Updates the user's profileType + planTier in the users collection.
 *  4. Logs the activation in a dedicated free_plan_activations collection
 *     for auditing.
 *
 * @since February 2026
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { logger } from '../logger-service';
import type { PlanTier } from '../../types/user/bulgarian-user.types';

// ─── Types ───

export interface FreePlanActivationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  planTier: 'dealer' | 'company';
}

export interface FreePlanActivationResult {
  success: boolean;
  error?: string;
  activationId?: string;
}

// ─── Service ───

/**
 * Activate a plan for free (promotional offer).
 *
 * CRITICAL: This function re-verifies that the promotional offer is still
 * active in Firestore before making any changes. This prevents the scenario
 * where an admin disabled the offer while the user was on the page.
 */
export async function activateFreePlan(
  request: FreePlanActivationRequest
): Promise<FreePlanActivationResult> {
  const { userId, userEmail, userName, planTier } = request;

  // ─── 1. Validate input ───
  if (!userId || !planTier) {
    return { success: false, error: 'Missing userId or planTier' };
  }

  if (!['dealer', 'company'].includes(planTier)) {
    return { success: false, error: `Invalid plan tier: ${planTier}` };
  }

  try {
    // ─── 2. Server-side check: is free offer still active? ───
    const promoRef = doc(db, 'app_settings', 'promotional_offer');
    const promoSnap = await getDoc(promoRef);

    if (!promoSnap.exists() || !promoSnap.data()?.isActive) {
      logger.warn('Free plan activation rejected — offer no longer active', {
        userId,
        planTier,
      });
      return {
        success: false,
        error: 'FREE_OFFER_EXPIRED',
      };
    }

    // ─── 3. Verify user exists ───
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    // ─── 4. Update user profile ───
    const profileType = planTier; // 'dealer' or 'company' maps 1:1 to profileType
    await updateDoc(userRef, {
      profileType,
      planTier,
      subscriptionStatus: 'active',
      subscriptionSource: 'free_promotional_offer',
      subscriptionActivatedAt: new Date().toISOString(),
      updatedAt: new Date(),
    });

    // ─── 5. Audit log (non-blocking — don't fail activation if audit write fails) ───
    const activationId = `FPA-${Date.now()}-${userId.slice(0, 6)}`;
    try {
      const auditRef = doc(db, 'free_plan_activations', activationId);
      await setDoc(auditRef, {
        activationId,
        userId,
        userEmail,
        userName,
        planTier,
        profileType,
        activatedAt: new Date().toISOString(),
        promoSnapshot: promoSnap.data(),
      });
    } catch (auditError) {
      // Audit log failure should NOT block the user's activation
      logger.warn('Free plan audit log write failed (activation still succeeded)', auditError as Error, {
        activationId,
        userId,
        planTier,
      });
    }

    logger.info('Free plan activated successfully', {
      activationId,
      userId,
      planTier,
    });

    return { success: true, activationId };
  } catch (error) {
    logger.error('Free plan activation failed', error as Error, {
      userId,
      planTier,
    });
    return { success: false, error: 'ACTIVATION_FAILED' };
  }
}
