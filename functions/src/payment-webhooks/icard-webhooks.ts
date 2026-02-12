/**
 * iCard Payment Webhook Handler
 * Handles payment notifications from iCard payment gateway
 * @since February 5, 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { 
  verifyICardSignature, 
  verifyWebhookTimestamp,
  generateIdempotencyKey,
  isWebhookProcessed,
  markWebhookProcessed
} from '../utils/webhook-verification';
import { 
  ICardWebhookPayload, 
  PaymentRecord, 
  PaymentStatus 
} from '../types/payment-types';

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Map iCard status to internal payment status
 */
function mapICardStatus(icardStatus: string): PaymentStatus {
  switch (icardStatus) {
    case 'SUCCESS':
      return 'succeeded';
    case 'FAILED':
      return 'failed';
    case 'PENDING':
      return 'processing';
    default:
      return 'pending';
  }
}

/**
 * Process iCard payment webhook
 * Updates ad status and creates payment record
 */
async function processICardPayment(payload: ICardWebhookPayload): Promise<void> {
  const { transactionId, amount, currency, status, metadata } = payload;
  
  if (!metadata?.ad_id || !metadata?.user_id) {
    throw new Error('Missing required metadata (ad_id or user_id)');
  }

  // Type assertion after validation
  const adId = metadata.ad_id!;
  const userId = metadata.user_id!;

  const paymentStatus = mapICardStatus(status);
  const idempotencyKey = generateIdempotencyKey('icard', transactionId, status);

  // Check if already processed
  if (await isWebhookProcessed(db, idempotencyKey)) {
    logger.info('Duplicate iCard webhook, skipping', { transactionId });
    return;
  }

  // Use transaction for atomicity
  await db.runTransaction(async (transaction) => {
    // 1. Create/update payment record
    const paymentRef = db.collection('payments').doc();
    const paymentRecord: PaymentRecord = {
      id: paymentRef.id,
      provider: 'icard',
      provider_tx_id: transactionId,
      ad_id: adId,
      user_id: userId,
      amount,
      currency,
      status: paymentStatus,
      idempotency_key: idempotencyKey,
      metadata,
      raw_webhook: payload as any,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
      ...(paymentStatus === 'succeeded' && { settled_at: admin.firestore.Timestamp.now() })
    };

    transaction.set(paymentRef, paymentRecord);

    // 2. Update ad status based on payment status
    if (paymentStatus === 'succeeded') {
      const adRef = db.collection('cars').doc(adId);
      transaction.update(adRef, {
        payment_status: 'paid',
        status: 'active',
        paid_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info('iCard payment succeeded', {
        transactionId,
        adId,
        amount,
        currency
      });
    } else if (paymentStatus === 'failed') {
      const adRef = db.collection('cars').doc(adId);
      transaction.update(adRef, {
        payment_status: 'payment_failed',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.warn('iCard payment failed', {
        transactionId,
        adId
      });
    }

    // 3. Mark webhook as processed
    await markWebhookProcessed(db, idempotencyKey, {
      provider: 'icard',
      transaction_id: transactionId,
      status: paymentStatus
    });
  });

  // 4. Record metrics (outside transaction)
  await recordPaymentMetric('icard', paymentStatus, amount, currency);
}

/**
 * Record payment metrics for monitoring
 */
async function recordPaymentMetric(
  provider: string,
  status: PaymentStatus,
  amount: number,
  currency: string
): Promise<void> {
  try {
    const metricsRef = db.collection('payment_metrics').doc();
    await metricsRef.set({
      provider,
      status,
      amount,
      currency,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error: any) {
    logger.error('Failed to record payment metric', { error: error.message });
    // Don't throw - metrics failure shouldn't block payment processing
  }
}

/**
 * iCard Webhook Endpoint
 * Verifies signature and processes payment notifications
 */
export const icardWebhooks = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      logger.warn('iCard webhook: Invalid method', { method: req.method });
      res.status(405).send('Method not allowed');
      return;
    }

    // Get signature from header
    const signature = req.headers['x-icard-signature'] as string;
    if (!signature) {
      logger.error('iCard webhook: Missing signature');
      res.status(401).send('Missing signature');
      return;
    }

    // Verify signature
    const webhookSecret = process.env.ICARD_WEBHOOK_SECRET || '';
    const verification = verifyICardSignature(req.rawBody, signature, webhookSecret);
    
    if (!verification.verified) {
      logger.error('iCard webhook: Signature verification failed', {
        error: verification.error
      });
      res.status(401).send('Invalid signature');
      return;
    }

    // Parse payload
    let payload: ICardWebhookPayload;
    try {
      payload = JSON.parse(req.rawBody.toString('utf8'));
    } catch (error: any) {
      logger.error('iCard webhook: Invalid JSON payload', { error: error.message });
      res.status(400).send('Invalid JSON');
      return;
    }

    // Verify timestamp to prevent replay attacks
    if (!verifyWebhookTimestamp(payload.timestamp)) {
      logger.error('iCard webhook: Timestamp verification failed');
      res.status(400).send('Invalid timestamp');
      return;
    }

    // Process payment
    try {
      logger.info('Processing iCard webhook', {
        transactionId: payload.transactionId,
        status: payload.status
      });

      await processICardPayment(payload);

      logger.info('iCard webhook processed successfully', {
        transactionId: payload.transactionId
      });

      res.status(200).json({ received: true });
    } catch (error: any) {
      logger.error('iCard webhook processing error', {
        error: error.message,
        stack: error.stack,
        transactionId: payload.transactionId
      });
      
      // Return 500 so iCard will retry
      res.status(500).send('Internal server error');
    }
  });
