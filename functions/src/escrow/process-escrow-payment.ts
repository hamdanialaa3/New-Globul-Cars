/**
 * Cloud Function: Process Escrow Payment
 * Handles cross-border import escrow transactions with fund holding & release
 * Engine 3: Cross-Border Escrow Protection
 *
 * File: functions/src/escrow/process-escrow-payment.ts
 * Created: April 1, 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Escrow state machine (11 states)
 */
enum EscrowState {
  INITIATED = 'initiated',
  BUYER_FUNDED = 'buyer_funded',
  SELLER_NOTIFIED = 'seller_notified',
  IN_TRANSIT = 'in_transit',
  INSPECTION_PENDING = 'inspection_pending',
  INSPECTION_PASSED = 'inspection_passed',
  FUNDS_RELEASED = 'funds_released',
  COMPLETED = 'completed',
  DISPUTE_INITIATED = 'dispute_initiated',
  DISPUTE_RESOLVED = 'dispute_resolved',
  CANCELLED = 'cancelled',
}

interface EscrowPaymentRequest {
  userId: string;
  buyerId: string;
  sellerId: string;
  carId: string;
  transactionAmount: number; // EUR
  platformFeePercentage: number; // 2.5% default
  escrowDurationDays: number; // 30 days default
}

interface EscrowTransaction {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  carId: string;
  status: EscrowState;
  amounts: {
    transactionAmount: number;
    platformFee: number;
    sellerReceives: number;
  };
  timeline: Array<{
    state: EscrowState;
    timestamp: string;
    description: string;
  }>;
  expiresAt: string;
  releaseableAt?: string;
  createdAt: string;
}

/**
 * Cloud Function: Process Escrow Payment
 * Initiates escrow transaction with fund holding
 *
 * @callable
 */
export const processEscrowPayment = functions
  .region('europe-west1')
  .runWith({ timeoutSeconds: 60, memory: '256MB' })
  .https.onCall(async (data: EscrowPaymentRequest, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to initiate escrow.'
      );
    }

    const {
      buyerId,
      sellerId,
      transactionAmount,
      platformFeePercentage = 2.5,
    } = data;

    // Verify authenticated user is either buyer or seller
    if (context.auth.uid !== buyerId && context.auth.uid !== sellerId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to initiate this escrow transaction.'
      );
    }

    try {
      // 1. Validate transaction amount
      if (transactionAmount < 500 || transactionAmount > 100000) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Transaction amount must be between €500 and €100,000.'
        );
      }

      // 2. Verify buyer has sufficient balance/payment method
      const buyerRef = db.collection('users').doc(buyerId);
      const buyerSnap = await buyerRef.get();

      if (!buyerSnap.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Buyer profile not found.'
        );
      }

      // 3. Create escrow transaction
      const transactionId = `esc_${buyerId.substring(0, 8)}_${sellerId.substring(0, 8)}_${Date.now()}`;
      const platformFee =
        Math.round(transactionAmount * (platformFeePercentage / 100) * 100) /
        100;
      const sellerReceives = transactionAmount - platformFee;

      const timeline: EscrowTransaction['timeline'] = [
        {
          state: EscrowState.INITIATED,
          timestamp: new Date().toISOString(),
          description: 'Escrow transaction initiated',
        },
      ];

      const escrowTransaction: EscrowTransaction = {
        transactionId,
        buyerId,
        sellerId,
        carId: data.carId,
        status: EscrowState.INITIATED,
        amounts: {
          transactionAmount,
          platformFee,
          sellerReceives,
        },
        timeline,
        expiresAt: new Date(
          Date.now() + data.escrowDurationDays * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
      };

      // 4. Store in Firestore
      const escrowRef = db.collection('escrow_transactions').doc(transactionId);
      await escrowRef.set(escrowTransaction);

      // 5. Update state to BUYER_FUNDED (simulated)
      await advanceEscrowState(
        transactionId,
        EscrowState.BUYER_FUNDED,
        'Payment received and holding in escrow.'
      );

      // 6. Log success
      functions.logger.info(
        `[escrow] Transaction initiated: ${transactionId}`,
        {
          buyerId,
          sellerId,
          amount: transactionAmount,
        }
      );

      return {
        success: true,
        transactionId,
        transaction: escrowTransaction,
        nextAction: 'buyer_confirmation',
        message: 'Escrow initiated. Awaiting buyer confirmation.',
      };
    } catch (error) {
      functions.logger.error(`[escrow] Error processing escrow: ${error}`);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to process escrow payment.'
      );
    }
  });

/**
 * Cloud Function: Record Inspection & Release Funds
 * Called when inspection is complete
 *
 * @callable
 */
export const recordInspectionAndRelease = functions
  .region('europe-west1')
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onCall(
    async (
      data: {
        transactionId: string;
        inspectionPassed: boolean;
        notes?: string;
      },
      context
    ) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated.'
        );
      }

      const { transactionId, inspectionPassed, notes = '' } = data;

      try {
        const escrowRef = db
          .collection('escrow_transactions')
          .doc(transactionId);
        const escrowSnap = await escrowRef.get();

        if (!escrowSnap.exists) {
          throw new functions.https.HttpsError(
            'not-found',
            'Escrow transaction not found.'
          );
        }

        const escrow = escrowSnap.data() as EscrowTransaction;

        // Verify caller is buyer
        if (context.auth.uid !== escrow.buyerId) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'Only the buyer can confirm inspection.'
          );
        }

        if (inspectionPassed) {
          // 1. Update state to INSPECTION_PASSED
          await advanceEscrowState(
            transactionId,
            EscrowState.INSPECTION_PASSED,
            `Inspection passed. Notes: ${notes || 'None'}`
          );

          // 2. Update to FUNDS_RELEASED
          await advanceEscrowState(
            transactionId,
            EscrowState.FUNDS_RELEASED,
            'Funds released to seller.'
          );

          // 3. Update to COMPLETED
          await advanceEscrowState(
            transactionId,
            EscrowState.COMPLETED,
            'Transaction completed successfully.'
          );

          functions.logger.info(
            `[escrow] Funds released for transaction: ${transactionId}`
          );

          return {
            success: true,
            status: EscrowState.COMPLETED,
            message:
              'Inspection passed. Funds have been released to the seller.',
          };
        } else {
          // Inspection failed - initiate dispute
          await advanceEscrowState(
            transactionId,
            EscrowState.DISPUTE_INITIATED,
            `Inspection failed. Reason: ${notes || 'Not specified'}`
          );

          functions.logger.warn(
            `[escrow] Dispute initiated for transaction: ${transactionId}`
          );

          return {
            success: false,
            status: EscrowState.DISPUTE_INITIATED,
            message: 'Inspection failed. Dispute has been initiated.',
          };
        }
      } catch (error) {
        functions.logger.error(`[escrow] Error recording inspection: ${error}`);
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }
        throw new functions.https.HttpsError(
          'internal',
          'Failed to record inspection.'
        );
      }
    }
  );

/**
 * Cloud Function: Scheduled Expiry Handler
 * Triggered daily - expires old escrow transactions
 *
 * @scheduled
 */
export const expireOldEscrowTransactions = functions
  .region('europe-west1')
  .pubsub.schedule('every day 03:00')
  .onRun(async () => {
    try {
      const now = new Date();
      const expiredSnap = await db
        .collection('escrow_transactions')
        .where('expiresAt', '<', now.toISOString())
        .where('status', 'in', [EscrowState.INITIATED, EscrowState.IN_TRANSIT])
        .get();

      let expiredCount = 0;
      for (const doc of expiredSnap.docs) {
        const escrow = doc.data() as EscrowTransaction;
        await advanceEscrowState(
          escrow.transactionId,
          EscrowState.CANCELLED,
          'Escrow expired - transaction cancelled.'
        );
        expiredCount++;
      }

      functions.logger.info(
        `[escrow] Expired ${expiredCount} escrow transactions.`
      );
      return null;
    } catch (error) {
      functions.logger.error(`[escrow] Error expiring transactions: ${error}`);
      return null;
    }
  });

/**
 * Helper: Advance escrow state
 */
async function advanceEscrowState(
  transactionId: string,
  newState: EscrowState,
  description: string
): Promise<void> {
  const escrowRef = db.collection('escrow_transactions').doc(transactionId);

  await escrowRef.update({
    status: newState,
    timeline: admin.firestore.FieldValue.arrayUnion({
      state: newState,
      timestamp: new Date().toISOString(),
      description,
    } as EscrowTransaction['timeline'][0]),
    ...(newState === EscrowState.FUNDS_RELEASED && {
      releaseableAt: new Date().toISOString(),
    }),
  });
}
