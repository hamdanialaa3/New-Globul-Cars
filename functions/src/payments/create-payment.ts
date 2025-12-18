/**
 * Firebase Cloud Functions - Payment Processing
 * Handles payment intents and transactions
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from '../logger-service';

interface CreatePaymentRequest {
  carId: string;
  amount: number;
  currency: string;
  buyerId: string;
}

interface PaymentRecord {
  id: string;
  carId: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  currency: string;
  platformFee: number;
  sellerAmount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

const PLATFORM_FEE_PERCENT = 5; // 5% commission

/**
 * Create payment intent for car purchase
 * Uses Stripe Connect to split payment between seller and platform
 */
export const createCarPaymentIntent = functions.https.onCall(
  async (data: CreatePaymentRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const buyerId = context.auth.uid;

    try {
      // Validate request
      if (!data.carId || !data.amount || data.amount <= 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid payment details'
        );
      }

      // Only EUR supported
      if (data.currency !== 'EUR') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Only EUR currency is supported'
        );
      }

      // Get car details
      const carDoc = await admin.firestore()
        .collection('cars')
        .doc(data.carId)
        .get();

      if (!carDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Car not found'
        );
      }

      const carData = carDoc.data();
      const sellerId = carData?.sellerId;

      if (!sellerId) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Car has no seller'
        );
      }

      // Prevent self-purchase
      if (buyerId === sellerId) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Cannot purchase your own car'
        );
      }

      // Get seller's Stripe account
      const sellerDoc = await admin.firestore()
        .collection('sellers')
        .doc(sellerId)
        .get();

      const sellerData = sellerDoc.data();
      const stripeAccountId = sellerData?.stripeAccountId;

      if (!stripeAccountId) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Seller has not set up payment account'
        );
      }

      // Calculate amounts
      const totalAmount = data.amount * 100; // Convert to cents
      const platformFee = Math.round(totalAmount * (PLATFORM_FEE_PERCENT / 100));
      const sellerAmount = totalAmount - platformFee;

      /*
      // Initialize Stripe
      const Stripe = require('stripe');
      const stripe = new Stripe(functions.config().stripe.secret_key);

      // Create payment intent with application fee
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'eur',
        application_fee_amount: platformFee,
        transfer_data: {
          destination: stripeAccountId
        },
        metadata: {
          carId: data.carId,
          sellerId,
          buyerId,
          platformFee: platformFee.toString(),
          sellerAmount: sellerAmount.toString()
        }
      });

      // Save payment record
      const paymentDoc = await admin.firestore().collection('payments').add({
        carId: data.carId,
        sellerId,
        buyerId,
        amount: data.amount,
        currency: data.currency,
        platformFee: platformFee / 100,
        sellerAmount: sellerAmount / 100,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Payment intent created`, { paymentIntentId: paymentIntent.id, carId: data.carId });

      return {
        success: true,
        paymentId: paymentDoc.id,
        clientSecret: paymentIntent.client_secret,
        amount: data.amount,
        platformFee: platformFee / 100,
        sellerAmount: sellerAmount / 100
      };
      */

      // Mock response (Stripe not configured)
      const mockPaymentId = `pay_${Date.now()}_${sellerId.substring(0, 8)}`;

      logger.info(`Would create payment for car ${data.carId}`, { amount: data.amount, currency: 'EUR' });

      return {
        success: true,
        message: 'Stripe not configured. Add Stripe keys to enable real payments.',
        paymentId: mockPaymentId,
        amount: data.amount,
        platformFee: platformFee / 100,
        sellerAmount: sellerAmount / 100,
        status: 'mock'
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error creating payment intent', err);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create payment',
        err.message
      );
    }
  }
);

/**
 * Confirm payment and mark car as sold
 * Called after successful payment
 */
export const confirmCarPayment = functions.https.onCall(
  async (data: { paymentId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    try {
      const paymentDoc = await admin.firestore()
        .collection('payments')
        .doc(data.paymentId)
        .get();

      if (!paymentDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Payment not found'
        );
      }

      const paymentData = paymentDoc.data() as PaymentRecord;

      // Update car status to sold
      await admin.firestore()
        .collection('cars')
        .doc(paymentData.carId)
        .update({
          status: 'sold',
          soldAt: admin.firestore.FieldValue.serverTimestamp(),
          soldTo: paymentData.buyerId,
          soldPrice: paymentData.amount
        });

      // Update payment status
      await paymentDoc.ref.update({
        status: 'succeeded',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Car marked as sold`, { carId: paymentData.carId });

      return {
        success: true,
        carId: paymentData.carId,
        status: 'sold'
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error confirming payment', err);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to confirm payment',
        err.message
      );
    }
  }
);

