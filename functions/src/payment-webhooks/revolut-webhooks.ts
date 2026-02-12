/**
 * Revolut Payment Webhook Handler
 * Handles payment notifications from Revolut Business API
 * @since February 5, 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { 
  verifyRevolutSignature, 
  verifyWebhookTimestamp,
  generateIdempotencyKey,
  isWebhookProcessed,
  markWebhookProcessed
} from '../utils/webhook-verification';
import { 
  RevolutWebhookPayload, 
  PaymentRecord, 
  PaymentStatus 
} from '../types/payment-types';

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Map Revolut state to internal payment status
 */
function mapRevolutStatus(revolutState: string): PaymentStatus {
  switch (revolutState) {
    case 'completed':
      return 'succeeded';
    case 'failed':
    case 'declined':
      return 'failed';
    case 'pending':
      return 'processing';
    default:
      return 'pending';
  }
}

/**
 * Extract metadata from Revolut reference or merchant_order_id
 * Expected format: "ad_<ad_id>_user_<user_id>"
 */
function extractMetadata(reference?: string, merchantOrderId?: string): {
  ad_id?: string;
  user_id?: string;
} {
  const ref = reference || merchantOrderId || '';
  
  // Example: "ad_abc123_user_xyz789"
  const match = ref.match(/ad_([^_]+)_user_([^_]+)/);
  if (!match) {
    return {};
  }

  return {
    ad_id: match[1],
    user_id: match[2]
  };
}

/**
 * Process Revolut payment webhook
 * Updates ad status and creates payment record
 */
async function processRevolutPayment(payload: RevolutWebhookPayload): Promise<void> {
  const { event, data } = payload;
  const { id, state, amount, currency, reference, merchant_order_id } = data;

  // Extract ad_id and user_id from reference
  const metadata = extractMetadata(reference, merchant_order_id);
  
  if (!metadata.ad_id || !metadata.user_id) {
    throw new Error('Missing required metadata in reference (expected format: ad_<id>_user_<id>)');
  }

  const paymentStatus = mapRevolutStatus(state);
  const idempotencyKey = generateIdempotencyKey('revolut', id, event);

  // Check if already processed
  if (await isWebhookProcessed(db, idempotencyKey)) {
    logger.info('Duplicate Revolut webhook, skipping', { transactionId: id });
    return;
  }

  // Use transaction for atomicity
  await db.runTransaction(async (transaction) => {
    // 1. Create/update payment record
    const paymentRef = db.collection('payments').doc();
    const paymentRecord: PaymentRecord = {
      id: paymentRef.id,
      provider: 'revolut',
      provider_tx_id: id,
      ad_id: metadata.ad_id!,
      user_id: metadata.user_id!,
      amount,
      currency,
      status: paymentStatus,
      idempotency_key: idempotencyKey,
      metadata: {
        ...metadata,
        reference,
        merchant_order_id,
        event_type: event
      },
      raw_webhook: payload as any,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
      ...(paymentStatus === 'succeeded' && { settled_at: admin.firestore.Timestamp.now() })
    };

    transaction.set(paymentRef, paymentRecord);

    // 2. Update ad status based on payment status
    if (paymentStatus === 'succeeded') {
      const adRef = db.collection('cars').doc(metadata.ad_id!);
      transaction.update(adRef, {
        payment_status: 'paid',
        status: 'active',
        paid_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info('Revolut payment succeeded', {
        transactionId: id,
        adId: metadata.ad_id,
        amount,
        currency
      });
    } else if (paymentStatus === 'failed') {
      const adRef = db.collection('cars').doc(metadata.ad_id!);
      transaction.update(adRef, {
        payment_status: 'payment_failed',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.warn('Revolut payment failed', {
        transactionId: id,
        adId: metadata.ad_id
      });
    }

    // 3. Mark webhook as processed
    await markWebhookProcessed(db, idempotencyKey, {
      provider: 'revolut',
      transaction_id: id,
      status: paymentStatus
    });
  });

  // 4. Record metrics (outside transaction)
  await recordPaymentMetric('revolut', paymentStatus, amount, currency);
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
 * Revolut Webhook Endpoint
 * Verifies signature and processes payment notifications
 */
export const revolutWebhooks = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      logger.warn('Revolut webhook: Invalid method', { method: req.method });
      res.status(405).send('Method not allowed');
      return;
    }

    // Get signature from header
    const signature = req.headers['revolut-signature'] as string;
    if (!signature) {
      logger.error('Revolut webhook: Missing signature');
      res.status(401).send('Missing signature');
      return;
    }

    // Verify signature
    const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET || '';
    const verification = verifyRevolutSignature(req.rawBody, signature, webhookSecret);
    
    if (!verification.verified) {
      logger.error('Revolut webhook: Signature verification failed', {
        error: verification.error
      });
      res.status(401).send('Invalid signature');
      return;
    }

    // Parse payload
    let payload: RevolutWebhookPayload;
    try {
      payload = JSON.parse(req.rawBody.toString('utf8'));
    } catch (error: any) {
      logger.error('Revolut webhook: Invalid JSON payload', { error: error.message });
      res.status(400).send('Invalid JSON');
      return;
    }

    // Verify timestamp to prevent replay attacks
    if (!verifyWebhookTimestamp(payload.timestamp)) {
      logger.error('Revolut webhook: Timestamp verification failed');
      res.status(400).send('Invalid timestamp');
      return;
    }

    // Process payment
    try {
      logger.info('Processing Revolut webhook', {
        event: payload.event,
        transactionId: payload.data.id,
        state: payload.data.state
      });

      await processRevolutPayment(payload);

      logger.info('Revolut webhook processed successfully', {
        transactionId: payload.data.id
      });

      res.status(200).json({ received: true });
    } catch (error: any) {
      logger.error('Revolut webhook processing error', {
        error: error.message,
        stack: error.stack,
        transactionId: payload.data.id
      });
      
      // Return 500 so Revolut will retry
      res.status(500).send('Internal server error');
    }
  });
