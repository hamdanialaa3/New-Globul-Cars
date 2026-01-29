/**
 * Cloud Function: Check Manual Payment Expiration
 * Runs daily to expire pending payments after 7 days
 * 
 * Schedule: Every day at 00:00 UTC
 * 
 * @since January 9, 2026
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { logger } = require('firebase-functions/v2');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled Function: Check and expire pending transactions
 * Runs daily at midnight UTC
 */
exports.checkExpiredManualPayments = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 0 * * *') // Cron: Daily at 00:00 UTC
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    logger.info('Starting expired payment check...');
    
    try {
      const now = admin.firestore.Timestamp.now();
      const expiredCount = { total: 0, expired: 0, notified: 0 };

      // Query pending transactions
      const transactionsRef = db.collection('manual_transactions');
      const pendingQuery = transactionsRef
        .where('status', '==', 'pending_manual_verification')
        .where('expiresAt', '<=', now)
        .limit(100); // Process in batches

      const snapshot = await pendingQuery.get();
      expiredCount.total = snapshot.size;

      if (snapshot.empty) {
        logger.info('No expired transactions found');
        return null;
      }

      // Process each expired transaction
      const batch = db.batch();
      const notificationPromises = [];

      for (const doc of snapshot.docs) {
        const transaction = doc.data();
        
        // Update status to expired
        batch.update(doc.ref, {
          status: 'expired',
          expiredAt: now,
          metadata: {
            ...transaction.metadata,
            expiredReason: 'Automatic expiration after 7 days',
            expiredBy: 'system_cron'
          }
        });

        expiredCount.expired++;

        // Create notification for user
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId: transaction.userId,
          type: 'payment_expired',
          title: {
            bg: 'Плащането изтече',
            en: 'Payment Expired'
          },
          message: {
            bg: `Вашият превод с референция ${transaction.referenceNumber} изтече след 7 дни. Моля, опитайте отново.`,
            en: `Your transfer with reference ${transaction.referenceNumber} expired after 7 days. Please try again.`
          },
          data: {
            transactionId: doc.id,
            referenceNumber: transaction.referenceNumber,
            amount: transaction.amount,
            currency: transaction.currency
          },
          read: false,
          createdAt: now
        });

        expiredCount.notified++;

        // Send email notification (async)
        notificationPromises.push(
          sendExpirationEmail(transaction)
        );
      }

      // Commit batch update
      await batch.commit();

      // Send all email notifications
      await Promise.allSettled(notificationPromises);

      logger.info('Expired payment check completed', {
        total: expiredCount.total,
        expired: expiredCount.expired,
        notified: expiredCount.notified
      });

      return {
        success: true,
        ...expiredCount
      };
    } catch (error) {
      logger.error('Error checking expired payments', error);
      throw error;
    }
  });

/**
 * Send expiration email to user
 */
async function sendExpirationEmail(transaction) {
  try {
    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    logger.info('Sending expiration email', {
      email: transaction.userEmail,
      referenceNumber: transaction.referenceNumber
    });

    // Example email structure
    const emailData = {
      to: transaction.userEmail,
      subject: {
        bg: '⚠️ Плащането ви изтече - Globul Cars',
        en: '⚠️ Your Payment Expired - Globul Cars'
      },
      template: 'payment_expired',
      variables: {
        userName: transaction.userName,
        referenceNumber: transaction.referenceNumber,
        amount: transaction.amount,
        currency: transaction.currency,
        itemDescription: transaction.itemDescription,
        supportEmail: 'support@koli.one',
        supportPhone: '+359 87 983 9671',
        retryUrl: `https://koli.one/subscription?retry=true&plan=${transaction.metadata?.planTier}`
      }
    };

    // Uncomment when email service is configured:
    // await sendEmail(emailData);

    return { success: true };
  } catch (error) {
    logger.error('Failed to send expiration email', error);
    return { success: false, error: error.message };
  }
}

/**
 * HTTP Callable Function: Manually trigger expiration check
 * For testing or admin manual trigger
 */
exports.manualExpirePayments = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Verify admin authentication
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can trigger manual expiration checks'
      );
    }

    logger.info('Manual expiration check triggered by admin', {
      adminUid: context.auth.uid
    });

    try {
      // Run the same logic as scheduled function
      const now = admin.firestore.Timestamp.now();
      const transactionsRef = db.collection('manual_transactions');
      const pendingQuery = transactionsRef
        .where('status', '==', 'pending_manual_verification')
        .where('expiresAt', '<=', now);

      const snapshot = await pendingQuery.get();
      const count = snapshot.size;

      if (count === 0) {
        return {
          success: true,
          message: 'No expired transactions found',
          count: 0
        };
      }

      const batch = db.batch();
      
      for (const doc of snapshot.docs) {
        batch.update(doc.ref, {
          status: 'expired',
          expiredAt: now,
          metadata: {
            ...doc.data().metadata,
            expiredReason: 'Manual expiration by admin',
            expiredBy: context.auth.uid
          }
        });
      }

      await batch.commit();

      return {
        success: true,
        message: `Successfully expired ${count} transactions`,
        count
      };
    } catch (error) {
      logger.error('Manual expiration failed', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Send daily summary email to admins
 */
exports.sendDailyPaymentSummary = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 9 * * *') // Daily at 9:00 AM Sofia time
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    logger.info('Sending daily payment summary...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Query transactions from last 24 hours
      const transactionsRef = db.collection('manual_transactions');
      const snapshot = await transactionsRef
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(today))
        .get();

      const stats = {
        total: snapshot.size,
        pending: 0,
        verified: 0,
        rejected: 0,
        totalAmount: 0,
        transactions: []
      };

      snapshot.forEach((doc) => {
        const transaction = doc.data();
        stats.transactions.push({
          referenceNumber: transaction.referenceNumber,
          amount: transaction.amount,
          status: transaction.status,
          userName: transaction.userName
        });

        if (transaction.status === 'pending_manual_verification') stats.pending++;
        if (transaction.status === 'verified') {
          stats.verified++;
          stats.totalAmount += transaction.amount;
        }
        if (transaction.status === 'rejected') stats.rejected++;
      });

      logger.info('Daily summary stats', stats);

      // TODO: Send email to admins with summary
      // const adminEmails = ['admin@koli.one', 'alaa@koli.one'];
      // await sendDailySummaryEmail(adminEmails, stats);

      return { success: true, stats };
    } catch (error) {
      logger.error('Failed to send daily summary', error);
      throw error;
    }
  });

/**
 * Trigger: Auto-activate subscription after verification
 * Triggered when transaction status changes to 'verified'
 */
exports.onPaymentVerified = functions
  .region('europe-west1')
  .firestore
  .document('manual_transactions/{transactionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if status changed to 'verified'
    if (before.status !== 'verified' && after.status === 'verified') {
      logger.info('Payment verified, activating subscription', {
        transactionId: context.params.transactionId,
        userId: after.userId
      });

      try {
        // Activate subscription based on payment type
        if (after.paymentType === 'subscription') {
          await activateSubscription(after);
        } else if (after.paymentType === 'promotion') {
          await activatePromotion(after);
        }

        // Send success notification
        await db.collection('notifications').add({
          userId: after.userId,
          type: 'payment_verified',
          title: {
            bg: '🎉 Плащането е потвърдено!',
            en: '🎉 Payment Verified!'
          },
          message: {
            bg: `Вашият превод на ${after.amount} ${after.currency} е потвърден. Абонаментът ви е активиран!`,
            en: `Your transfer of ${after.amount} ${after.currency} is verified. Your subscription is now active!`
          },
          data: {
            transactionId: context.params.transactionId,
            referenceNumber: after.referenceNumber
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update transaction with completion timestamp
        await change.after.ref.update({
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'completed'
        });

        logger.info('Subscription activated successfully', {
          userId: after.userId,
          planTier: after.metadata?.planTier
        });

        return { success: true };
      } catch (error) {
        logger.error('Failed to activate subscription', error);
        // Don't throw - let transaction stay verified
        // Admin can manually intervene
        return { success: false, error: error.message };
      }
    }

    return null;
  });

/**
 * Activate user subscription
 */
async function activateSubscription(transaction) {
  const { userId, metadata } = transaction;
  const { planTier, interval } = metadata;

  const now = admin.firestore.Timestamp.now();
  const expiresAt = new Date();
  
  // Calculate expiration
  if (interval === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (interval === 'annual') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  // Update user profile
  const userRef = db.collection('users').doc(userId);
  await userRef.update({
    'subscription.status': 'active',
    'subscription.plan': planTier,
    'subscription.interval': interval,
    'subscription.activatedAt': now,
    'subscription.expiresAt': admin.firestore.Timestamp.fromDate(expiresAt),
    'subscription.paymentMethod': 'manual_bank_transfer',
    updatedAt: now
  });

  logger.info('Subscription activated', {
    userId,
    planTier,
    interval,
    expiresAt: expiresAt.toISOString()
  });
}

/**
 * Activate promotion/listing
 */
async function activatePromotion(transaction) {
  const { itemId, userId } = transaction;
  
  // Update listing with promotion
  const listingRef = db.collection('listings').doc(itemId);
  await listingRef.update({
    promoted: true,
    promotedAt: admin.firestore.FieldValue.serverTimestamp(),
    promotedBy: userId
  });

  logger.info('Promotion activated', { userId, itemId });
}
