/**
 * Payment Webhook Handler - Firebase Cloud Function
 * Processes payment notifications from ePay.bg and EasyPay
 * Updates user subscription status in Firestore
 * Location: Bulgaria
 * 
 * File: functions/src/payment-webhook.ts
 * Created: February 8, 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface PaymentNotification {
  provider: 'epay' | 'easypay';
  orderId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  timestamp: Date;
  signature?: string;
}

export const handleEpayWebhook = functions
  .region('europe-west1')
  .https.onRequest(async (req: functions.https.Request, res: functions.Response) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { EPAY_SECRET_KEY } = process.env;
      if (!EPAY_SECRET_KEY) {
        throw new Error('EPAY_SECRET_KEY not configured');
      }

      const notification = parseEpayNotification(req.body, EPAY_SECRET_KEY);

      if (!verifyEpaySignature(req.body, EPAY_SECRET_KEY)) {
        console.error('Invalid ePay.bg signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      await processPayment(notification);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('ePay webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

export const handleEasypayWebhook = functions
  .region('europe-west1')
  .https.onRequest(async (req: functions.https.Request, res: functions.Response) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { EASYPAY_SECRET_KEY } = process.env;
      if (!EASYPAY_SECRET_KEY) {
        throw new Error('EASYPAY_SECRET_KEY not configured');
      }

      if (!verifyEasypaySignature(req.body, EASYPAY_SECRET_KEY)) {
        console.error('Invalid EasyPay signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      const notification = parseEasypayNotification(req.body);
      await processPayment(notification);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('EasyPay webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

function verifyEpaySignature(body: any, secretKey: string): boolean {
  try {
    const { checksum, ...data } = body;
    const dataString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('');

    const hash = crypto
      .createHmac('sha1', secretKey)
      .update(dataString)
      .digest('hex');

    return hash === checksum;
  } catch (error) {
    console.error('ePay signature verification failed:', error);
    return false;
  }
}

function verifyEasypaySignature(body: any, secretKey: string): boolean {
  try {
    const { signature, ...data } = body;
    const dataString = JSON.stringify(data);

    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataString)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('EasyPay signature verification failed:', error);
    return false;
  }
}

function parseEpayNotification(body: any, secretKey: string): PaymentNotification {
  const epayStatus = body.STATUS;
  let status: 'success' | 'failed' | 'pending' = 'pending';

  if (epayStatus === '0') {
    status = 'pending';
  } else if (epayStatus === '1') {
    status = 'success';
  } else if (epayStatus === '2') {
    status = 'failed';
  }

  return {
    provider: 'epay',
    orderId: body.INVOICE,
    amount: parseFloat(body.AMOUNT),
    status,
    transactionId: body.PAYER_EMAIL || body.INVOICE,
    timestamp: new Date(body.DATE || Date.now()),
    signature: body.checksum
  };
}

function parseEasypayNotification(body: any): PaymentNotification {
  const easypayStatus = body.status;
  let status: 'success' | 'failed' | 'pending' = 'pending';

  if (easypayStatus === 'success') {
    status = 'success';
  } else if (easypayStatus === 'failed') {
    status = 'failed';
  }

  return {
    provider: 'easypay',
    orderId: body.order_id,
    amount: parseFloat(body.amount),
    status,
    transactionId: body.transaction_id,
    timestamp: new Date(body.timestamp || Date.now()),
    signature: body.signature
  };
}

async function processPayment(notification: PaymentNotification): Promise<void> {
  console.log('Processing payment:', notification);

  if (notification.status !== 'success') {
    console.warn('Payment not successful:', notification.status);
    return;
  }

  const orderId = notification.orderId;
  const parts = orderId.split('_');

  if (parts.length < 3) {
    throw new Error('Invalid order ID format');
  }

  const userId = parts[1];
  const planTier = parts[3] || 'dealer';

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error(`User not found: ${userId}`);
    }

    const userData = userDoc.data();
    const currentSubscription = userData?.subscriptionTier || 'free';

    const now = admin.firestore.Timestamp.now();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    await userRef.update({
      subscriptionTier: planTier,
      subscriptionStatus: 'active',
      subscriptionStartDate: now,
      subscriptionEndDate: admin.firestore.Timestamp.fromDate(subscriptionEndDate),
      lastPaymentDate: now,
      paymentMethod: notification.provider,
      transactionId: notification.transactionId,
      totalSpent: admin.firestore.FieldValue.increment(notification.amount),
      updatedAt: now
    });

    await logPayment({
      userId,
      orderId,
      amount: notification.amount,
      planTier,
      provider: notification.provider,
      transactionId: notification.transactionId,
      status: 'completed',
      timestamp: now,
      previousPlan: currentSubscription
    });

    await sendConfirmationEmail(userId, userData?.email, planTier, notification.amount);

    console.log('Payment processed successfully:', { userId, planTier, amount: notification.amount });
  } catch (error) {
    console.error('Failed to process payment:', error);

    await logPayment({
      userId: userId,
      orderId: notification.orderId,
      amount: notification.amount,
      planTier: planTier,
      provider: notification.provider,
      transactionId: notification.transactionId,
      status: 'error',
      timestamp: admin.firestore.Timestamp.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
}

async function logPayment(paymentData: any): Promise<void> {
  try {
    await db.collection('payment_logs').add(paymentData);
  } catch (error) {
    console.error('Failed to log payment:', error);
  }
}

async function sendConfirmationEmail(
  userId: string,
  email: string | undefined,
  planTier: string,
  amount: number
): Promise<void> {
  try {
    if (!email) {
      console.warn('No email found for user:', userId);
      return;
    }

    await db.collection('mail').add({
      to: email,
      template: {
        name: 'subscription-confirmation',
        data: {
          userId,
          planTier,
          amount,
          currency: 'EUR',
          subscriptionUrl: `https://kolioneauction.com/dealer/dashboard`,
          supportEmail: 'support@kolioneauction.com',
          timestamp: new Date().toISOString()
        }
      }
    });

    console.log('Confirmation email queued:', { userId, email });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

export const verifyPaymentStatus = functions
  .region('europe-west1')
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { orderId } = data;
      const userId = context.auth.uid;

      const paymentLog = await db
        .collection('payment_logs')
        .where('orderId', '==', orderId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (paymentLog.empty) {
        return { found: false, status: 'unknown' };
      }

      const payment = paymentLog.docs[0].data();
      return {
        found: true,
        status: payment.status,
        planTier: payment.planTier,
        amount: payment.amount,
        timestamp: payment.timestamp
      };
    } catch (error) {
      console.error('Error verifying payment status:', error);
      throw new functions.https.HttpsError('internal', 'Failed to verify payment status');
    }
  });
