// Cloud Function: Saved Search Alert System
// Scheduled function runs periodically to check saved searches and send alerts
// Also provides on-demand trigger endpoint
// English/Bulgarian bilingual. No emojis. <300 lines.

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface SavedSearchCriteria {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  maxPriceEur?: number;
  fuelTypes?: string[];
  transmission?: string;
  regionIds?: string[];
}

interface SavedSearch {
  id: string;
  userId: string;
  criteria: SavedSearchCriteria;
  notification: {
    channels: string[];
    enabled: boolean;
    lastTriggeredAt?: admin.firestore.Timestamp;
  };
}

// Run every 6 hours
export const scheduledSavedSearchAlerts = functions
  .region('europe-west1')
  .pubsub.schedule('0 */6 * * *')
  .timeZone('Europe/Sofia')
  .onRun(async () => {
    functions.logger.info('Starting scheduled saved search alerts check');
    await processAllSavedSearches();
    return null;
  });

// On-demand trigger (callable by authenticated users for their own searches)
export const triggerSavedSearchAlert = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { savedSearchId } = data;
    if (!savedSearchId) {
      throw new functions.https.HttpsError('invalid-argument', 'savedSearchId required');
    }
    
    const doc = await db.collection('savedSearches').doc(savedSearchId).get();
    if (!doc.exists) {
      throw new functions.https.HttpsError('not-found', 'Saved search not found');
    }
    const search = { id: doc.id, ...doc.data() } as SavedSearch;
    if (search.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not your search');
    }

    const matches = await executeSearch(search);
    if (matches.length > 0) {
      await sendAlert(search, matches);
      await updateLastTriggered(search.id);
    }
    return { matchCount: matches.length };
  });

async function processAllSavedSearches(): Promise<void> {
  const snapshot = await db.collection('savedSearches')
    .where('notification.enabled', '==', true)
    .get();
  
  const searches = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SavedSearch));
  functions.logger.info(`Processing ${searches.length} active saved searches`);

  for (const search of searches) {
    try {
      const matches = await executeSearch(search);
      if (matches.length > 0) {
        await sendAlert(search, matches);
        await updateLastTriggered(search.id);
      }
    } catch (err) {
      functions.logger.error(`Error processing search ${search.id}:`, err);
    }
  }
}

async function executeSearch(search: SavedSearch): Promise<string[]> {
  const { criteria } = search;
  let query: admin.firestore.Query = db.collection('listings')
    .where('status', '==', 'published');

  // Apply criteria filters
  if (criteria.make) query = query.where('make', '==', criteria.make);
  if (criteria.model) query = query.where('model', '==', criteria.model);
  if (criteria.transmission) query = query.where('transmission', '==', criteria.transmission);
  
  // Fetch and apply client-side filters for ranges (year, price)
  const snapshot = await query.limit(100).get();
  const lastTriggered = search.notification.lastTriggeredAt?.toDate();
  
  const matches = snapshot.docs.filter(doc => {
    const data = doc.data();
    
    // Only alert on new listings since last trigger
    if (lastTriggered && data.publishedAt?.toDate() <= lastTriggered) return false;
    
    // Year range
    if (criteria.minYear && data.year < criteria.minYear) return false;
    if (criteria.maxYear && data.year > criteria.maxYear) return false;
    
    // Price filter
    if (criteria.maxPriceEur && data.priceEur > criteria.maxPriceEur) return false;
    
    // Fuel types
    if (criteria.fuelTypes?.length && !criteria.fuelTypes.includes(data.fuelType)) return false;
    
    return true;
  });

  return matches.map(d => d.id);
}

async function sendAlert(search: SavedSearch, matchedListingIds: string[]): Promise<void> {
  const { userId, notification } = search;
  const channels = notification.channels || [];

  // Log alert execution
  await db.collection('searchAlerts').add({
    savedSearchId: search.id,
    userId,
    matchedListingIds,
    triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
    delivery: {
      inapp: channels.includes('inapp'),
      push: channels.includes('push'),
      email: channels.includes('email')
    },
    durationMs: 0 // Placeholder
  });

  // In-app notification
  if (channels.includes('inapp')) {
    await db.collection('notifications').add({
      userId,
      type: 'saved_search_alert',
      title: { bg: 'Нови обяви за вашето търсене', en: 'New listings for your search' },
      body: {
        bg: `Намерени ${matchedListingIds.length} нови обяви`,
        en: `Found ${matchedListingIds.length} new listings`
      },
      data: { savedSearchId: search.id, listingIds: matchedListingIds },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Push notification (via FCM)
  if (channels.includes('push')) {
    const userDoc = await db.collection('users').doc(userId).get();
    const fcmTokens = userDoc.data()?.fcmTokens || [];
    if (fcmTokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens: fcmTokens,
        notification: {
          title: 'Нови обяви / New listings',
          body: `${matchedListingIds.length} нови обяви / new listings`
        },
        data: { type: 'saved_search_alert', savedSearchId: search.id }
      });
    }
  }

  // Email notification (stub - integrate with SendGrid/AWS SES)
  if (channels.includes('email')) {
    functions.logger.info(`Email alert stub for user ${userId}: ${matchedListingIds.length} matches`);
    // TODO: Send email via email service
  }
}

async function updateLastTriggered(savedSearchId: string): Promise<void> {
  await db.collection('savedSearches').doc(savedSearchId).update({
    'notification.lastTriggeredAt': admin.firestore.FieldValue.serverTimestamp()
  });
}
