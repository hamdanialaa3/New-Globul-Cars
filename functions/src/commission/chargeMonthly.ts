// functions/src/commission/chargeMonthly.ts
// Monthly Commission Charging System

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Scheduled function to charge monthly commissions
 * Runs on the 1st of every month at 00:00
 */
export const chargeMonthlyCommissions = onSchedule(
  {
    schedule: '0 0 1 * *', // 00:00 on the 1st of every month
    timeZone: 'Europe/Sofia',
  },
  async (event) => {
    console.log('Starting monthly commission charging...');

    try {
      // Get last month's period
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const period = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

      // Get all pending commission periods for last month
      const periodsSnapshot = await db
        .collection('commissionPeriods')
        .where('period', '==', period)
        .where('status', '==', 'pending')
        .get();

      console.log(`Found ${periodsSnapshot.size} commission periods to charge`);

      let charged = 0;
      let failed = 0;

      for (const periodDoc of periodsSnapshot.docs) {
        try {
          const periodData = periodDoc.data();
          const userId = periodData.userId;

          // Generate invoice for commission
          const invoiceRef = db.collection('invoices').doc();
          
          // Get user data
          const userDoc = await db.collection('users').doc(userId).get();
          const userData = userDoc.data();

          // Create invoice (simplified - would use generateInvoice function in production)
          await invoiceRef.set({
            id: invoiceRef.id,
            invoiceNumber: `COM-${period}-${userId.substring(0, 8)}`,
            type: 'standard',
            status: 'sent',
            buyerId: userId,
            buyerName: userData?.businessName || userData?.displayName || 'Unknown',
            buyerEmail: userData?.email || '',
            items: [
              {
                description: `Commission for period ${period}`,
                quantity: 1,
                unitPrice: periodData.commissionAmount,
                vat: 20,
                total: periodData.commissionAmount * 1.2,
              },
            ],
            subtotal: periodData.commissionAmount,
            totalVAT: periodData.commissionAmount * 0.2,
            total: periodData.commissionAmount * 1.2,
            currency: 'BGN',
            paymentDueDate: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 15)), // 15th of current month
            issueDate: Timestamp.now(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });

          // Update commission period
          await periodDoc.ref.update({
            status: 'charged',
            invoiceId: invoiceRef.id,
            chargedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });

          // Send email notification
          await db.collection('mail').add({
            to: userData?.email || '',
            message: {
              subject: `Commission Invoice for ${period}`,
              html: `
                <h2>Commission Invoice</h2>
                <p>Dear ${userData?.displayName || 'User'},</p>
                <p>Your commission for period ${period} has been calculated.</p>
                <p><strong>Total Sales:</strong> ${periodData.totalSales.toFixed(2)} BGN</p>
                <p><strong>Commission Rate:</strong> ${(periodData.commissionRate * 100).toFixed(2)}%</p>
                <p><strong>Commission Amount:</strong> ${periodData.commissionAmount.toFixed(2)} BGN</p>
                <p><strong>Invoice Number:</strong> COM-${period}-${userId.substring(0, 8)}</p>
                <p>Please log in to your account to view the full invoice.</p>
                <p>Thank you for using Globul Cars!</p>
              `,
            },
          });

          charged++;
        } catch (error) {
          console.error(`Failed to charge commission for period ${periodDoc.id}:`, error);
          failed++;
        }
      }

      console.log(`Commission charging completed: ${charged} charged, ${failed} failed`);

      // Log activity
      await db.collection('activities').add({
        userId: 'system',
        type: 'monthly_commission_charged',
        description: `Charged monthly commissions for ${period}: ${charged} succeeded, ${failed} failed`,
        metadata: { period, charged, failed },
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error charging monthly commissions:', error);
    }
  }
);

/**
 * Manually trigger commission charging (admin only)
 */
export const triggerCommissionCharging = onCall<{ period: string }>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins
  const adminDoc = await db.collection('admins').doc(auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError('permission-denied', 'Only admins can trigger commission charging');
  }

  const { period } = data;

  if (!period) {
    throw new HttpsError('invalid-argument', 'Period is required (format: YYYY-MM)');
  }

  try {
    // Get all pending commission periods for the specified period
    const periodsSnapshot = await db
      .collection('commissionPeriods')
      .where('period', '==', period)
      .where('status', '==', 'pending')
      .get();

    if (periodsSnapshot.empty) {
      return {
        success: true,
        message: 'No pending commission periods found for this period',
        charged: 0,
      };
    }

    let charged = 0;
    let failed = 0;

    for (const periodDoc of periodsSnapshot.docs) {
      try {
        const periodData = periodDoc.data();

        // Update to charged status
        await periodDoc.ref.update({
          status: 'charged',
          chargedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        charged++;
      } catch (error) {
        console.error(`Failed to charge period ${periodDoc.id}:`, error);
        failed++;
      }
    }

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'manual_commission_charged',
      description: `Manually charged commissions for ${period}: ${charged} succeeded, ${failed} failed`,
      metadata: { period, charged, failed },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: `Commission charging completed`,
      charged,
      failed,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error triggering commission charging:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Mark commission period as paid
 */
export const markCommissionPaid = onCall<{ periodId: string }>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins
  const adminDoc = await db.collection('admins').doc(auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError('permission-denied', 'Only admins can mark commissions as paid');
  }

  const { periodId } = data;

  if (!periodId) {
    throw new HttpsError('invalid-argument', 'Period ID is required');
  }

  try {
    const periodRef = db.collection('commissionPeriods').doc(periodId);
    const periodDoc = await periodRef.get();

    if (!periodDoc.exists) {
      throw new HttpsError('not-found', 'Commission period not found');
    }

    await periodRef.update({
      status: 'paid',
      paidAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'commission_marked_paid',
      description: `Marked commission period as paid: ${periodId}`,
      metadata: { periodId },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Commission period marked as paid',
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error marking commission as paid:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Generate commission statement
 */
export const generateCommissionStatement = onCall<{ periodId: string }>(async (request) => {
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
        throw new HttpsError('permission-denied', 'You can only view your own commission statements');
      }
    }

    // Generate statement HTML
    const statement = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commission Statement - ${periodData?.period}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
          .total { font-weight: bold; background: #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Commission Statement</h1>
          <h2>Period: ${periodData?.period}</h2>
        </div>
        
        <div class="info">
          <p><strong>Status:</strong> ${periodData?.status}</p>
          <p><strong>Commission Rate:</strong> ${((periodData?.commissionRate || 0) * 100).toFixed(2)}%</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Listing</th>
              <th>Sale Price</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            ${(periodData?.transactions || []).map((t: any) => `
              <tr>
                <td>${t.date?.toDate().toLocaleDateString('bg-BG')}</td>
                <td>${t.listingTitle}</td>
                <td>${t.salePrice.toFixed(2)} BGN</td>
                <td>${t.commissionAmount.toFixed(2)} BGN</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="2">TOTAL</td>
              <td>${(periodData?.totalSales || 0).toFixed(2)} BGN</td>
              <td>${(periodData?.commissionAmount || 0).toFixed(2)} BGN</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    return {
      success: true,
      statement,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error generating commission statement:', err.message);
    throw new HttpsError('internal', err.message);
  }
});
