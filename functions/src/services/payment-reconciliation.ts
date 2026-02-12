/**
 * Payment Reconciliation Service
 * Matches internal payment records with provider statements
 * @since February 5, 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { PaymentProvider, PaymentRecord, ReconciliationReport } from '../types/payment-types';

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Generate daily reconciliation report
 * Scheduled to run every day at 2 AM
 */
export const dailyReconciliation = functions
  .region('europe-west1')
  .pubsub.schedule('0 2 * * *')
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    logger.info('Starting daily payment reconciliation');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Generate reports for each provider
      const providers: PaymentProvider[] = ['icard', 'revolut', 'stripe'];
      
      for (const provider of providers) {
        await generateReconciliationReport(provider, yesterday, today);
      }

      logger.info('Daily reconciliation completed successfully');
    } catch (error: any) {
      logger.error('Daily reconciliation failed', { error: error.message });
      throw error;
    }
  });

/**
 * Manual reconciliation trigger (callable function)
 * Allows admins to trigger reconciliation for specific period/provider
 */
export const triggerReconciliation = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verify admin authentication
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can trigger reconciliation'
      );
    }

    const { provider, startDate, endDate } = data;

    if (!provider || !startDate || !endDate) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: provider, startDate, endDate'
      );
    }

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      logger.info('Manual reconciliation triggered', {
        provider,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        triggeredBy: context.auth.uid
      });

      const report = await generateReconciliationReport(provider, start, end);

      return {
        success: true,
        reportId: report.id,
        summary: {
          matched: report.matched_transactions,
          unmatched_system: report.unmatched_system.length,
          unmatched_provider: report.unmatched_provider.length,
          discrepancy_amount: report.discrepancy_amount
        }
      };
    } catch (error: any) {
      logger.error('Manual reconciliation failed', { error: error.message });
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Generate reconciliation report for given provider and period
 */
async function generateReconciliationReport(
  provider: PaymentProvider,
  startDate: Date,
  endDate: Date
): Promise<ReconciliationReport> {
  // Fetch system transactions
  const systemTransactions = await fetchSystemTransactions(provider, startDate, endDate);

  // In production, you would fetch provider transactions from their API
  // For now, we'll use a placeholder
  const providerTransactions = await fetchProviderTransactions(provider, startDate, endDate);

  // Match transactions
  const matched: Set<string> = new Set();
  const unmatchedSystem: string[] = [];
  const unmatchedProvider: string[] = [];

  // Create lookup map for system transactions
  const systemTxMap = new Map(
    systemTransactions.map(tx => [tx.provider_tx_id, tx])
  );

  // Match provider transactions with system
  for (const providerTx of providerTransactions) {
    if (systemTxMap.has(providerTx.id)) {
      matched.add(providerTx.id);
    } else {
      unmatchedProvider.push(providerTx.id);
    }
  }

  // Find unmatched system transactions
  for (const systemTx of systemTransactions) {
    if (!matched.has(systemTx.provider_tx_id)) {
      unmatchedSystem.push(systemTx.provider_tx_id);
    }
  }

  // Calculate totals
  const totalAmountSystem = systemTransactions
    .filter(tx => tx.status === 'succeeded')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalAmountProvider = providerTransactions
    .reduce((sum, tx) => sum + tx.amount, 0);

  const discrepancy = Math.abs(totalAmountSystem - totalAmountProvider);

  // Create report
  const report: ReconciliationReport = {
    id: db.collection('reconciliation_reports').doc().id,
    provider,
    period_start: admin.firestore.Timestamp.fromDate(startDate),
    period_end: admin.firestore.Timestamp.fromDate(endDate),
    system_transactions: systemTransactions.length,
    provider_transactions: providerTransactions.length,
    matched_transactions: matched.size,
    unmatched_system: unmatchedSystem,
    unmatched_provider: unmatchedProvider,
    total_amount_system: totalAmountSystem,
    total_amount_provider: totalAmountProvider,
    discrepancy_amount: discrepancy,
    status: 'draft',
    generated_at: admin.firestore.Timestamp.now()
  };

  // Save report
  await db.collection('reconciliation_reports').doc(report.id).set(report);

  logger.info('Reconciliation report generated', {
    provider,
    reportId: report.id,
    matched: matched.size,
    unmatchedSystem: unmatchedSystem.length,
    unmatchedProvider: unmatchedProvider.length,
    discrepancy
  });

  // Send alert if discrepancy is significant
  if (discrepancy > 100) { // More than €100 discrepancy
    await sendReconciliationAlert(report);
  }

  return report;
}

/**
 * Fetch system transactions for reconciliation
 */
async function fetchSystemTransactions(
  provider: PaymentProvider,
  startDate: Date,
  endDate: Date
): Promise<PaymentRecord[]> {
  const snapshot = await db
    .collection('payments')
    .where('provider', '==', provider)
    .where('created_at', '>=', admin.firestore.Timestamp.fromDate(startDate))
    .where('created_at', '<', admin.firestore.Timestamp.fromDate(endDate))
    .get();

  return snapshot.docs.map(doc => doc.data() as PaymentRecord);
}

/**
 * Fetch provider transactions (placeholder - to be implemented with actual API)
 * In production, this would call iCard/Revolut/Stripe API to get transaction list
 */
async function fetchProviderTransactions(
  provider: PaymentProvider,
  startDate: Date,
  endDate: Date
): Promise<Array<{ id: string; amount: number; currency: string }>> {
  // TODO: Implement actual provider API calls
  // For iCard: Call iCard transaction history API
  // For Revolut: Call Revolut transactions API
  // For Stripe: Call Stripe Balance Transactions API

  logger.warn('Using placeholder provider transactions - implement actual API integration', {
    provider
  });

  return [];
}

/**
 * Send alert for reconciliation discrepancies
 */
async function sendReconciliationAlert(report: ReconciliationReport): Promise<void> {
  try {
    // Store alert in Firestore
    await db.collection('admin_alerts').add({
      type: 'reconciliation_discrepancy',
      severity: 'high',
      provider: report.provider,
      discrepancy_amount: report.discrepancy_amount,
      report_id: report.id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false
    });

    logger.warn('Reconciliation discrepancy alert created', {
      provider: report.provider,
      discrepancy: report.discrepancy_amount,
      reportId: report.id
    });

    // TODO: Implement email/Slack notification to admins
  } catch (error: any) {
    logger.error('Failed to send reconciliation alert', { error: error.message });
  }
}

/**
 * Export reconciliation report to CSV
 * Callable function for admins to download reports
 */
export const exportReconciliationReport = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verify admin authentication
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can export reports'
      );
    }

    const { reportId } = data;

    if (!reportId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing reportId');
    }

    try {
      const reportDoc = await db.collection('reconciliation_reports').doc(reportId).get();

      if (!reportDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Report not found');
      }

      const report = reportDoc.data() as ReconciliationReport;

      // Generate CSV content
      const csv = generateReconciliationCSV(report);

      return {
        success: true,
        csv,
        filename: `reconciliation_${report.provider}_${report.period_start.toDate().toISOString().split('T')[0]}.csv`
      };
    } catch (error: any) {
      logger.error('Failed to export report', { error: error.message });
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Generate CSV content from reconciliation report
 */
function generateReconciliationCSV(report: ReconciliationReport): string {
  const lines: string[] = [];

  // Header
  lines.push('Reconciliation Report');
  lines.push(`Provider,${report.provider}`);
  lines.push(`Period,${report.period_start.toDate().toISOString()} to ${report.period_end.toDate().toISOString()}`);
  lines.push(`Generated,${report.generated_at.toDate().toISOString()}`);
  lines.push('');

  // Summary
  lines.push('Summary');
  lines.push(`System Transactions,${report.system_transactions}`);
  lines.push(`Provider Transactions,${report.provider_transactions}`);
  lines.push(`Matched Transactions,${report.matched_transactions}`);
  lines.push(`Unmatched System,${report.unmatched_system.length}`);
  lines.push(`Unmatched Provider,${report.unmatched_provider.length}`);
  lines.push(`Total Amount (System),${report.total_amount_system}`);
  lines.push(`Total Amount (Provider),${report.total_amount_provider}`);
  lines.push(`Discrepancy,${report.discrepancy_amount}`);
  lines.push('');

  // Unmatched System Transactions
  if (report.unmatched_system.length > 0) {
    lines.push('Unmatched System Transactions');
    lines.push('Transaction ID');
    report.unmatched_system.forEach(id => lines.push(id));
    lines.push('');
  }

  // Unmatched Provider Transactions
  if (report.unmatched_provider.length > 0) {
    lines.push('Unmatched Provider Transactions');
    lines.push('Transaction ID');
    report.unmatched_provider.forEach(id => lines.push(id));
  }

  return lines.join('\n');
}
