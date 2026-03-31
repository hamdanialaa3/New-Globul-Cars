// src/types/subscription.ts

export type PlanTier = 'free' | 'dealer' | 'company';

// Subscription Status Enum — single source of truth for all status values
export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  UNPAID = 'unpaid',
  GRACE_PERIOD = 'grace_period',
}

// Valid state transitions map
const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  [SubscriptionStatus.TRIALING]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.CANCELED,
    SubscriptionStatus.INCOMPLETE,
  ],
  [SubscriptionStatus.ACTIVE]: [
    SubscriptionStatus.PAST_DUE,
    SubscriptionStatus.CANCELED,
    SubscriptionStatus.GRACE_PERIOD,
  ],
  [SubscriptionStatus.PAST_DUE]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.CANCELED,
    SubscriptionStatus.UNPAID,
    SubscriptionStatus.GRACE_PERIOD,
  ],
  [SubscriptionStatus.GRACE_PERIOD]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.CANCELED,
    SubscriptionStatus.UNPAID,
  ],
  [SubscriptionStatus.CANCELED]: [
    SubscriptionStatus.ACTIVE, // resubscribe
  ],
  [SubscriptionStatus.INCOMPLETE]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.INCOMPLETE_EXPIRED,
  ],
  [SubscriptionStatus.INCOMPLETE_EXPIRED]: [
    // Terminal state — no valid forward transitions
  ],
  [SubscriptionStatus.UNPAID]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.CANCELED,
  ],
};

/**
 * Check if a transition from one status to another is valid.
 */
export function isValidTransition(
  from: SubscriptionStatus,
  to: SubscriptionStatus
): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Attempt a state transition. Returns the new status if valid, throws if invalid.
 */
export function transitionSubscription(
  from: SubscriptionStatus,
  to: SubscriptionStatus
): SubscriptionStatus {
  if (!isValidTransition(from, to)) {
    throw new Error(
      `Invalid subscription transition: ${from} → ${to}. ` +
        `Allowed transitions from ${from}: [${(VALID_TRANSITIONS[from] || []).join(', ')}]`
    );
  }
  return to;
}

export interface SubscriptionInfo {
  id: string;
  planTier: PlanTier | 'unknown';
  status: SubscriptionStatus | string;
  currentPeriodStart?: string; // ISO
  currentPeriodEnd?: string; // ISO
  cancelAtPeriodEnd?: boolean;
}

export interface CheckoutSessionResponse {
  success: boolean;
  sessionId: string;
  checkoutUrl: string;
  message?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  canceledAt?: string | Date;
}
