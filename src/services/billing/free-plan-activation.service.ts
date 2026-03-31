/**
 * Free Plan Activation Service
 *
 * Activates a plan for a user WITHOUT requiring payment,
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

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { logger } from '../logger-service';
import type { PlanTier } from '../../types/user/bulgarian-user.types';

// ─── Types ───

export interface FreePlanActivationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  planTier: 'free' | 'dealer' | 'company';
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

  if (!['free', 'dealer', 'company'].includes(planTier)) {
    return { success: false, error: `Invalid plan tier: ${planTier}` };
  }

  try {
    // ─── 2. Server-side check: is free offer still active? ───
    // The base free plan is always available — no promo check needed.
    // Dealer/company tiers can also be activated freely when the whole site
    // is switched to free subscription mode from admin settings.
    let promoData: Record<string, unknown> | undefined;
    let source = 'free_plan';
    if (planTier !== 'free') {
      const promoRef = doc(db, 'app_settings', 'promotional_offer');
      const siteSettingsRef = doc(db, 'app_settings', 'site_settings');
      const [promoSnap, siteSettingsSnap] = await Promise.all([
        getDoc(promoRef),
        getDoc(siteSettingsRef),
      ]);
      const promoActive =
        promoSnap.exists() && Boolean(promoSnap.data()?.isActive);
      const siteWideFreeMode =
        siteSettingsSnap.exists() &&
        siteSettingsSnap.data()?.pricing?.subscriptionMode === 'free';

      if (!promoActive && !siteWideFreeMode) {
        logger.warn('Free plan activation rejected — offer no longer active', {
          userId,
          planTier,
        });
        return {
          success: false,
          error: 'FREE_OFFER_EXPIRED',
        };
      }

      if (promoActive) {
        promoData = promoSnap.data() as Record<string, unknown>;
      }

      source = siteWideFreeMode ? 'free_site_mode' : 'free_promotional_offer';
    }

    // ─── 3. Verify user exists ───
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    // ─── 4. Update user profile ───
    const profileType = planTier === 'free' ? 'private' : planTier;
    await updateDoc(userRef, {
      profileType,
      planTier,
      plan: {
        tier: planTier,
      },
      subscriptionStatus: 'active',
      subscriptionSource: source,
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
        activationSource: source,
        activatedAt: new Date().toISOString(),
        ...(promoData ? { promoSnapshot: promoData } : {}),
      });
    } catch (auditError) {
      // Audit log failure should NOT block the user's activation
      logger.warn(
        'Free plan audit log write failed (activation still succeeded)',
        auditError as Error,
        {
          activationId,
          userId,
          planTier,
        }
      );
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
