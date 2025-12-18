// functions/src/analytics/resetCounters.ts
// Scheduled Function: Reset daily/weekly/monthly counters

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const db = getFirestore();

/**
 * Reset Daily Counters
 * 
 * Runs every day at midnight (UTC)
 * Resets "Today" counters for all users
 */
export const resetDailyCounters = onSchedule('0 0 * * *', async () => {
  logger.info('Starting daily counter reset');

  try {
    const analyticsSnapshot = await db.collection('userAnalytics').get();
    
    const batch = db.batch();
    let count = 0;

    analyticsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        profileViewsToday: 0,
        listingViewsToday: 0,
        inquiriesToday: 0,
        favoritesToday: 0,
      });
      count++;
    });

    await batch.commit();
    logger.info(`Daily counters reset for ${count} users`);

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to reset daily counters', { error: err.message });
  }
});

/**
 * Reset Weekly Counters
 * 
 * Runs every Monday at midnight (UTC)
 * Resets "This Week" counters for all users
 */
export const resetWeeklyCounters = onSchedule('0 0 * * 1', async () => {
  logger.info('Starting weekly counter reset');

  try {
    const analyticsSnapshot = await db.collection('userAnalytics').get();
    
    const batch = db.batch();
    let count = 0;

    analyticsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        profileViewsThisWeek: 0,
        listingViewsThisWeek: 0,
        inquiriesThisWeek: 0,
        favoritesThisWeek: 0,
      });
      count++;
    });

    await batch.commit();
    logger.info(`Weekly counters reset for ${count} users`);

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to reset weekly counters', { error: err.message });
  }
});

/**
 * Reset Monthly Counters
 * 
 * Runs on 1st day of every month at midnight (UTC)
 * Resets "This Month" counters for all users
 */
export const resetMonthlyCounters = onSchedule('0 0 1 * *', async () => {
  logger.info('Starting monthly counter reset');

  try {
    const analyticsSnapshot = await db.collection('userAnalytics').get();
    
    const batch = db.batch();
    let count = 0;

    analyticsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        profileViewsThisMonth: 0,
        listingViewsThisMonth: 0,
        inquiriesThisMonth: 0,
        favoritesThisMonth: 0,
      });
      count++;
    });

    await batch.commit();
    logger.info(`Monthly counters reset for ${count} users`);

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to reset monthly counters', { error: err.message });
  }
});

/**
 * Calculate Response Metrics
 * 
 * Runs daily at 2am (UTC)
 * Calculates avg response time and response rate for all users
 */
export const calculateResponseMetrics = onSchedule('0 2 * * *', async () => {
  logger.info('Starting response metrics calculation');

  try {
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Get user's conversations
      const conversationsSnapshot = await db
        .collection('conversations')
        .where('participants', 'array-contains', userId)
        .where('lastMessageAt', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        .get();

      if (conversationsSnapshot.empty) {
        continue;
      }

      let totalResponseTime = 0;
      let respondedCount = 0;
      let totalConversations = conversationsSnapshot.size;

      for (const convDoc of conversationsSnapshot.docs) {
        const conversation = convDoc.data();
        
        // Check if user responded
        const messagesSnapshot = await db
          .collection('conversations')
          .doc(convDoc.id)
          .collection('messages')
          .where('senderId', '==', userId)
          .orderBy('createdAt', 'asc')
          .limit(1)
          .get();

        if (!messagesSnapshot.empty) {
          respondedCount++;
          
          const firstMessage = messagesSnapshot.docs[0].data();
          const responseTime = firstMessage.createdAt.toMillis() - conversation.createdAt.toMillis();
          totalResponseTime += responseTime;
        }
      }

      // Calculate metrics
      const avgResponseTime = respondedCount > 0 ? totalResponseTime / respondedCount / (1000 * 60) : 0; // Convert to minutes
      const responseRate = (respondedCount / totalConversations) * 100;

      // Update user analytics
      await db.collection('userAnalytics').doc(userId).set(
        {
          userId,
          avgResponseTime: Math.round(avgResponseTime),
          responseRate: Math.round(responseRate),
        },
        { merge: true }
      );
    }

    logger.info('Response metrics calculated successfully');

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to calculate response metrics', { error: err.message });
  }
});

/**
 * Calculate Conversion Rates
 * 
 * Runs daily at 3am (UTC)
 * Calculates conversion rate (inquiries to sales) for all dealers/companies
 */
export const calculateConversionRates = onSchedule('0 3 * * *', async () => {
  logger.info('Starting conversion rate calculation');

  try {
    const analyticsSnapshot = await db.collection('userAnalytics').get();
    
    for (const analyticsDoc of analyticsSnapshot.docs) {
      const analytics = analyticsDoc.data();
      const userId = analyticsDoc.id;

      if (analytics.inquiries > 0 && analytics.leads > 0) {
        // Simple conversion: leads / inquiries * 100
        const conversionRate = (analytics.leads / analytics.inquiries) * 100;

        await analyticsDoc.ref.update({
          conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
        });
      }
    }

    logger.info('Conversion rates calculated successfully');

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to calculate conversion rates', { error: err.message });
  }
});
