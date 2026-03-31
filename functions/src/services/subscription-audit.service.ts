/**
 * Subscription Audit Log Service
 * Append-only log of all subscription state changes.
 * Collection: users/{uid}/subscription_events
 */
import * as admin from 'firebase-admin';

const db = admin.firestore();

export type SubscriptionEventType =
  | 'created'
  | 'upgraded'
  | 'downgraded'
  | 'cancelled'
  | 'renewed'
  | 'payment_failed'
  | 'payment_succeeded'
  | 'grace_started'
  | 'grace_ended'
  | 'reactivated'
  | 'trial_started'
  | 'trial_ended'
  | 'manual_payment_submitted'
  | 'manual_payment_verified'
  | 'manual_payment_rejected'
  | 'auto_downgraded';

export interface SubscriptionEvent {
  timestamp: FirebaseFirestore.FieldValue;
  type: SubscriptionEventType;
  fromTier?: string;
  toTier?: string;
  fromStatus?: string;
  toStatus?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a subscription event to the user's audit trail.
 * This is an append-only collection — events are never modified or deleted.
 */
export async function logSubscriptionEvent(
  userId: string,
  type: SubscriptionEventType,
  details: {
    fromTier?: string;
    toTier?: string;
    fromStatus?: string;
    toStatus?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  const event: SubscriptionEvent = {
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    type,
    ...details,
  };

  await db
    .collection('users')
    .doc(userId)
    .collection('subscription_events')
    .add(event);
}
