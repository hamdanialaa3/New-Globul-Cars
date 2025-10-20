// functions/src/commission/calculateCommission.ts
// Commission Calculation System
// Dealer: 2% | Company: 1.5% per sale

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CommissionPeriod } from '../billing/types';

const db = getFirestore();

// Commission rates
const COMMISSION_RATES = {
  dealer: 0.02, // 2%
  company: 0.015, // 1.5%
  buyer: 0, // No commission
};

/**
 * Calculate commission for a sale
 */
function calculateCommissionAmount(salePrice: number, profileType: string): number {
  const rate = COMMISSION_RATES[profileType as keyof typeof COMMISSION_RATES] || 0;
  return salePrice * rate;
}

/**
 * Auto-calculate commission when a sale is completed
 */
export const onSaleCompleted = onDocumentCreated('transactions/{transactionId}', async (event) => {
  const transactionData = event.data?.data();
  if (!transactionData) return;

  const { sellerId, listingId, amount, status } = transactionData;

  // Only process completed sales
  if (status !== 'completed') return;

  try {
    // Get seller info
    const sellerDoc = await db.collection('users').doc(sellerId).get();
    if (!sellerDoc.exists) {
      console.error('Seller not found:', sellerId);
      return;
    }

    const sellerData = sellerDoc.data();
    const profileType = sellerData?.profileType;

    // Only dealers and companies pay commission
    if (!['dealer', 'company'].includes(profileType)) {
      return;
    }

    const commissionRate = COMMISSION_RATES[profileType as keyof typeof COMMISSION_RATES];
    const commissionAmount = calculateCommissionAmount(amount, profileType);

    // Get listing info
    const listingDoc = await db.collection('cars').doc(listingId).get();
    const listingTitle = listingDoc.exists
      ? `${listingDoc.data()?.make} ${listingDoc.data()?.model} ${listingDoc.data()?.year}`
      : 'Unknown';

    // Get current period (YYYY-MM)
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get or create commission period document
    const periodRef = db.collection('commissionPeriods').doc(`${sellerId}_${period}`);
    const periodDoc = await periodRef.get();

    if (!periodDoc.exists) {
      // Create new period
      const newPeriod: CommissionPeriod = {
        id: periodRef.id,
        userId: sellerId,
        period,
        totalSales: amount,
        commissionRate,
        commissionAmount,
        transactions: [
          {
            transactionId: event.params.transactionId,
            listingId,
            listingTitle,
            salePrice: amount,
            commissionAmount,
            date: Timestamp.now(),
          },
        ],
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await periodRef.set(newPeriod);
    } else {
      // Update existing period
      const existingPeriod = periodDoc.data() as CommissionPeriod;
      const newTotalSales = existingPeriod.totalSales + amount;
      const newCommissionAmount = existingPeriod.commissionAmount + commissionAmount;

      await periodRef.update({
        totalSales: newTotalSales,
        commissionAmount: newCommissionAmount,
        transactions: [
          ...existingPeriod.transactions,
          {
            transactionId: event.params.transactionId,
            listingId,
            listingTitle,
            salePrice: amount,
            commissionAmount,
            date: Timestamp.now(),
          },
        ],
        updatedAt: Timestamp.now(),
      });
    }

    console.log(`Commission calculated for ${sellerId}: ${commissionAmount} BGN (${commissionRate * 100}%)`);
  } catch (error) {
    console.error('Error calculating commission:', error);
  }
});

/**
 * Get commission periods for a user
 */
export const getCommissionPeriods = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Get user's commission periods
    const periodsSnapshot = await db
      .collection('commissionPeriods')
      .where('userId', '==', auth.uid)
      .orderBy('period', 'desc')
      .limit(12) // Last 12 months
      .get();

    const periods = periodsSnapshot.docs.map((doc) => doc.data());

    // Calculate totals
    const totals = {
      totalSales: periods.reduce((sum, p) => sum + (p.totalSales || 0), 0),
      totalCommission: periods.reduce((sum, p) => sum + (p.commissionAmount || 0), 0),
      pending: periods.filter((p) => p.status === 'pending').length,
      paid: periods.filter((p) => p.status === 'paid').length,
    };

    return {
      success: true,
      periods,
      totals,
    };
  } catch (error: any) {
    console.error('Error getting commission periods:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Get commission period details
 */
export const getCommissionPeriod = onCall<{ periodId: string }>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { periodId } = data;

  if (!periodId) {
    throw new HttpsError('invalid-argument', 'Period ID is required');
  }

  try {
    const periodDoc = await db.collection('commissionPeriods').doc(periodId).get();
    if (!periodDoc.exists) {
      throw new HttpsError('not-found', 'Commission period not found');
    }

    const periodData = periodDoc.data();

    // Check permission
    if (periodData?.userId !== auth.uid) {
      const adminDoc = await db.collection('admins').doc(auth.uid).get();
      if (!adminDoc.exists) {
        throw new HttpsError('permission-denied', 'You can only view your own commission periods');
      }
    }

    return {
      success: true,
      period: {
        id: periodDoc.id,
        ...periodData,
      },
    };
  } catch (error: any) {
    console.error('Error getting commission period:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Admin: Get all commission periods (for charging)
 */
export const getAllCommissionPeriods = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins
  const adminDoc = await db.collection('admins').doc(auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError('permission-denied', 'Only admins can view all commission periods');
  }

  try {
    const periodsSnapshot = await db
      .collection('commissionPeriods')
      .where('status', '==', 'pending')
      .orderBy('period', 'desc')
      .get();

    const periods = periodsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate totals
    const totals = {
      totalPeriods: periods.length,
      totalCommission: periods.reduce((sum, p: any) => sum + (p.commissionAmount || 0), 0),
    };

    return {
      success: true,
      periods,
      totals,
    };
  } catch (error: any) {
    console.error('Error getting all commission periods:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Calculate commission rate for a user
 */
export const getCommissionRate = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const userDoc = await db.collection('users').doc(auth.uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const profileType = userData?.profileType;
    const rate = COMMISSION_RATES[profileType as keyof typeof COMMISSION_RATES] || 0;

    return {
      success: true,
      rate,
      percentage: rate * 100,
      profileType,
    };
  } catch (error: any) {
    console.error('Error getting commission rate:', error);
    throw new HttpsError('internal', error.message);
  }
});
