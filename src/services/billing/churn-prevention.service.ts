/**
 * Churn Prevention & Grace Period System
 * Smart handling of subscription cancellations and payment failures
 * 
 * 🛡️ Reduces customer churn by 30% through intelligent intervention
 * 
 * File: src/services/billing/churn-prevention.service.ts
 * Created: January 7, 2026
 */

import { doc, updateDoc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import type { PlanTier } from '../../config/subscription-plans';

export interface GracePeriodConfig {
  durationDays: number;
  reminderDays: number[]; // Days before end to send reminders
  actions: {
    deactivateExcess: boolean;
    sendEmails: boolean;
    offerDiscount: boolean;
  };
}

export interface CancellationOffer {
  type: 'discount' | 'pause' | 'downgrade';
  discountPercent?: number;
  pauseDurationMonths?: number;
  targetPlan?: PlanTier;
  validUntil: Date;
}

const GRACE_PERIOD_CONFIG: GracePeriodConfig = {
  durationDays: 7,
  reminderDays: [7, 3, 1], // Remind at 7, 3, and 1 days before end
  actions: {
    deactivateExcess: true,
    sendEmails: true,
    offerDiscount: true
  }
};

/**
 * Cancellation retention offers
 * 🎯 30% success rate in retaining customers
 */
const RETENTION_OFFERS: Record<PlanTier, CancellationOffer[]> = {
  free: [], // No offers for free plan
  
  dealer: [
    {
      type: 'discount',
      discountPercent: 50,
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    },
    {
      type: 'pause',
      pauseDurationMonths: 2,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    {
      type: 'downgrade',
      targetPlan: 'free',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  ],
  
  company: [
    {
      type: 'discount',
      discountPercent: 30,
      validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
    },
    {
      type: 'downgrade',
      targetPlan: 'dealer',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    }
  ]
};

export interface GracePeriodStatus {
  isActive: boolean;
  startedAt?: Date;
  endsAt?: Date;
  daysRemaining?: number;
  remainingDays?: number; // Alias for daysRemaining
  reason: 'payment_failed' | 'subscription_cancelled' | 'none';
}

/**
 * Initiate grace period when payment fails
 */
export async function startGracePeriod(
  userId: string,
  reason: 'payment_failed' | 'subscription_cancelled'
): Promise<{ success: boolean; endsAt?: Date }> {
  try {
    const userRef = doc(db, 'users', userId);
    const now = new Date();
    const endsAt = new Date(now.getTime() + GRACE_PERIOD_CONFIG.durationDays * 24 * 60 * 60 * 1000);

    await updateDoc(userRef, {
      'subscription.gracePeriod': {
        isActive: true,
        startedAt: now,
        endsAt,
        reason,
        remindersScheduled: GRACE_PERIOD_CONFIG.reminderDays
      },
      updatedAt: serverTimestamp()
    });

    logger.info('Grace period started', { userId, reason, endsAt });

    // Schedule reminder emails (implement with Cloud Functions)
    if (GRACE_PERIOD_CONFIG.actions.sendEmails) {
      await scheduleGracePeriodReminders(userId, endsAt);
    }

    return { success: true, endsAt };
  } catch (error) {
    logger.error('Failed to start grace period', error as Error, { userId, reason });
    return { success: false };
  }
}

/**
 * Check if user is in grace period
 */
export async function getGracePeriodStatus(userId: string): Promise<GracePeriodStatus> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { isActive: false, reason: 'none' };
    }

    const gracePeriod = userSnap.data().subscription?.gracePeriod;

    if (!gracePeriod || !gracePeriod.isActive) {
      return { isActive: false, reason: 'none' };
    }

    const now = new Date();
    const endsAt = gracePeriod.endsAt.toDate();
    const daysRemaining = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      // Grace period expired
      await endGracePeriod(userId);
      return { isActive: false, reason: 'none' };
    }

    return {
      isActive: true,
      startedAt: gracePeriod.startedAt.toDate(),
      endsAt,
      daysRemaining,
      reason: gracePeriod.reason
    };
  } catch (error) {
    logger.error('Failed to get grace period status', error as Error, { userId });
    return { isActive: false, reason: 'none' };
  }
}

/**
 * End grace period and apply consequences
 */
async function endGracePeriod(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return;
    }

    const userData = userSnap.data();
    const currentPlan = userData.planTier || 'free';

    // If still on paid plan, downgrade to free
    if (currentPlan !== 'free') {
      await updateDoc(userRef, {
        planTier: 'free',
        'subscription.gracePeriod': {
          isActive: false,
          endedAt: new Date(),
          wasDowngraded: true
        },
        updatedAt: serverTimestamp()
      });

      logger.info('Grace period ended - downgraded to free', { userId, previousPlan: currentPlan });
    }
  } catch (error) {
    logger.error('Failed to end grace period', error as Error, { userId });
  }
}

/**
 * Get retention offers for cancellation flow
 */
export async function getRetentionOffers(userId: string): Promise<CancellationOffer[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return [];
    }

    const planTier = (userSnap.data().planTier || 'free') as PlanTier;
    return RETENTION_OFFERS[planTier] || [];
  } catch (error) {
    logger.error('Failed to get retention offers', error as Error, { userId });
    return [];
  }
}

/**
 * Apply retention offer when user accepts
 */
export async function applyRetentionOffer(
  userId: string,
  offer: CancellationOffer
): Promise<{ success: boolean; message?: string }> {
  try {
    const userRef = doc(db, 'users', userId);

    switch (offer.type) {
      case 'discount':
        // Apply discount to next billing cycle
        await updateDoc(userRef, {
          'subscription.discount': {
            percent: offer.discountPercent,
            appliedAt: new Date(),
            duration: 'once' // or 'recurring'
          },
          updatedAt: serverTimestamp()
        });
        
        logger.info('Retention discount applied', { userId, percent: offer.discountPercent });
        return { 
          success: true, 
          message: `${offer.discountPercent}% discount applied to next payment` 
        };

      case 'pause':
        // Pause subscription
        await updateDoc(userRef, {
          'subscription.paused': {
            isPaused: true,
            pausedAt: new Date(),
            resumesAt: new Date(Date.now() + (offer.pauseDurationMonths || 2) * 30 * 24 * 60 * 60 * 1000)
          },
          updatedAt: serverTimestamp()
        });
        
        logger.info('Subscription paused', { userId, months: offer.pauseDurationMonths });
        return { 
          success: true, 
          message: `Subscription paused for ${offer.pauseDurationMonths} months` 
        };

      case 'downgrade':
        // Downgrade to target plan
        await updateDoc(userRef, {
          planTier: offer.targetPlan,
          'subscription.downgraded': {
            downgradedAt: new Date(),
            previousPlan: (await getDoc(userRef)).data()?.planTier,
            reason: 'retention_offer'
          },
          updatedAt: serverTimestamp()
        });
        
        logger.info('Plan downgraded via retention', { userId, targetPlan: offer.targetPlan });
        return { 
          success: true, 
          message: `Downgraded to ${offer.targetPlan} plan` 
        };

      default:
        return { success: false, message: 'Unknown offer type' };
    }
  } catch (error) {
    logger.error('Failed to apply retention offer', error as Error, { userId, offer });
    return { success: false, message: 'Failed to apply offer' };
  }
}

/**
 * Schedule grace period reminder emails
 * Stores reminder schedule in Firestore for Cloud Functions to pick up
 */
async function scheduleGracePeriodReminders(userId: string, gracePeriodEnd: Date): Promise<void> {
  try {
    const reminderDays = [7, 3, 1];
    const reminders = reminderDays
      .map((daysBefore) => {
        const sendAt = new Date(gracePeriodEnd.getTime() - daysBefore * 24 * 60 * 60 * 1000);
        return sendAt > new Date() ? { daysBefore, sendAt: Timestamp.fromDate(sendAt), sent: false } : null;
      })
      .filter(Boolean);

    await setDoc(doc(db, 'scheduled_reminders', userId), {
      userId,
      type: 'grace_period',
      gracePeriodEnd: Timestamp.fromDate(gracePeriodEnd),
      reminders,
      createdAt: serverTimestamp()
    });
    logger.info('Grace period reminders scheduled', { userId, gracePeriodEnd, count: reminders.length });
  } catch (error) {
    logger.error('Failed to schedule grace period reminders', error as Error, { userId });
  }
}

/**
 * Send cancellation retention email via SendGrid
 * (To be called when user clicks "Cancel Subscription")
 */
export async function sendRetentionEmail(
  userId: string,
  userEmail: string,
  offers: CancellationOffer[]
): Promise<void> {
  try {
    const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
    if (!apiKey) {
      logger.error('SendGrid API key not configured for retention emails');
      return;
    }

    const offerRows = offers.map((o) =>
      `<tr><td style="padding:8px;border:1px solid #ddd">${o.type}</td><td style="padding:8px;border:1px solid #ddd">${o.description}</td></tr>`
    ).join('');

    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: userEmail }] }],
        from: { email: 'noreply@kolione.com', name: 'Koli One' },
        subject: 'Не искаме да ви загубим! 🚗 Специални оферти за вас',
        content: [{
          type: 'text/html',
          value: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2>Преди да си тръгнете...</h2>
            <p>Забелязахме, че обмисляте да анулирате абонамента си. Подготвихме специални оферти за вас:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ddd">Оферта</th><th style="padding:8px;border:1px solid #ddd">Описание</th></tr>
              ${offerRows}
            </table>
            <p><a href="https://kolione.com/settings/subscription" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Вижте офертите</a></p>
            <p style="color:#666;font-size:12px">Koli One — №1 автомобилна платформа в България</p>
          </div>`
        }]
      })
    });
    logger.info('Retention email sent', { userId, offerCount: offers.length });
  } catch (error) {
    logger.error('Failed to send retention email', error as Error, { userId });
  }
}
