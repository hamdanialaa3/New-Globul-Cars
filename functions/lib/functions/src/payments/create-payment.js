"use strict";
/**
 * Firebase Cloud Functions - Payment Processing
 * Handles payment intents and transactions
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmCarPayment = exports.createCarPaymentIntent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const PLATFORM_FEE_PERCENT = 5; // 5% commission
/**
 * Create payment intent for car purchase
 * Uses Stripe Connect to split payment between seller and platform
 */
exports.createCarPaymentIntent = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const buyerId = context.auth.uid;
    try {
        // Validate request
        if (!data.carId || !data.amount || data.amount <= 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid payment details');
        }
        // Only EUR supported
        if (data.currency !== 'EUR') {
            throw new functions.https.HttpsError('invalid-argument', 'Only EUR currency is supported');
        }
        // Get car details
        const carDoc = await admin.firestore()
            .collection('cars')
            .doc(data.carId)
            .get();
        if (!carDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Car not found');
        }
        const carData = carDoc.data();
        const sellerId = carData === null || carData === void 0 ? void 0 : carData.sellerId;
        if (!sellerId) {
            throw new functions.https.HttpsError('failed-precondition', 'Car has no seller');
        }
        // Prevent self-purchase
        if (buyerId === sellerId) {
            throw new functions.https.HttpsError('failed-precondition', 'Cannot purchase your own car');
        }
        // Get seller's Stripe account
        const sellerDoc = await admin.firestore()
            .collection('sellers')
            .doc(sellerId)
            .get();
        const sellerData = sellerDoc.data();
        const stripeAccountId = sellerData === null || sellerData === void 0 ? void 0 : sellerData.stripeAccountId;
        if (!stripeAccountId) {
            throw new functions.https.HttpsError('failed-precondition', 'Seller has not set up payment account');
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
  
        console.log(`Payment intent created: ${paymentIntent.id} for car ${data.carId}`);
  
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
        console.log(`Would create payment for car ${data.carId}: EUR ${data.amount}`);
        return {
            success: true,
            message: 'Stripe not configured. Add Stripe keys to enable real payments.',
            paymentId: mockPaymentId,
            amount: data.amount,
            platformFee: platformFee / 100,
            sellerAmount: sellerAmount / 100,
            status: 'mock'
        };
    }
    catch (error) {
        console.error('Error creating payment intent:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to create payment', error.message);
    }
});
/**
 * Confirm payment and mark car as sold
 * Called after successful payment
 */
exports.confirmCarPayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        const paymentDoc = await admin.firestore()
            .collection('payments')
            .doc(data.paymentId)
            .get();
        if (!paymentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Payment not found');
        }
        const paymentData = paymentDoc.data();
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
        console.log(`Car ${paymentData.carId} marked as sold`);
        return {
            success: true,
            carId: paymentData.carId,
            status: 'sold'
        };
    }
    catch (error) {
        console.error('Error confirming payment:', error);
        throw new functions.https.HttpsError('internal', 'Failed to confirm payment', error.message);
    }
});
//# sourceMappingURL=create-payment.js.map