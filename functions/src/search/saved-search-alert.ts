// Saved Search Alert Cloud Functions
// Region: europe-west1 | Languages: BG/EN | Currency: EUR
// Purpose: Schedule periodic execution of saved searches and react to new saved search creation.
// Notes: Business logic kept light (<300 lines). Heavy query expansion can move to separate module later.

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from '../logger-service';

const db = admin.firestore();
const SAVED_SEARCHES = 'savedSearches';
const ALERT_LOGS = 'searchAlerts';
const LISTINGS = 'listings';

interface Criteria {
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
  userId: string;
  criteria: Criteria;
  notification: { channels: string[]; enabled: boolean; lastTriggeredAt?: FirebaseFirestore.Timestamp };
  createdAt: FirebaseFirestore.Timestamp;
}

// Helper: Build a Firestore query for listings based on a subset of criteria.
function buildListingQuery(criteria: Criteria): FirebaseFirestore.Query<FirebaseFirestore.DocumentData> {
  let q: FirebaseFirestore.Query = db.collection(LISTINGS).where('status', '==', 'published');
  if (criteria.make) q = q.where('make', '==', criteria.make);
  if (criteria.model) q = q.where('model', '==', criteria.model);
  if (criteria.fuelTypes && criteria.fuelTypes.length === 1) {
    q = q.where('fuel', '==', criteria.fuelTypes[0]);
  }
  // Year range handled client-side if both present (Firestore lacks compound inequality across different fields easily)
  if (criteria.maxPriceEur) {
    q = q.where('priceEur', '<=', criteria.maxPriceEur);
  }
  return q.limit(50); // limit to avoid excessive cost
}

async function executeSavedSearch(docId: string, data: SavedSearch) {
  if (!data.notification.enabled) return;
  const criteria = data.criteria;
  const listingQuery = buildListingQuery(criteria);
  const snap = await listingQuery.get();
  const matched: string[] = [];

  snap.forEach(d => {
    const l = d.data();
    // Additional client-side filters
    if (criteria.minYear && l.year < criteria.minYear) return;
    if (criteria.maxYear && l.year > criteria.maxYear) return;
    if (criteria.regionIds && criteria.regionIds.length > 0) {
      const region = l.locationData?.region;
      if (!region || !criteria.regionIds.includes(region)) return;
    }
    matched.push(d.id);
  });

  if (matched.length === 0) return;

  // Log alert execution
  const runRef = await db.collection(ALERT_LOGS).add({
    savedSearchId: docId,
    userId: data.userId,
    matchedListingIds: matched,
    triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
    delivery: {
      inapp: data.notification.channels.includes('inapp'),
      push: data.notification.channels.includes('push'),
      email: data.notification.channels.includes('email')
    },
    durationMs: 0 // basic placeholder
  });

  // Update lastTriggeredAt
  await db.collection(SAVED_SEARCHES).doc(docId).update({ 'notification.lastTriggeredAt': admin.firestore.FieldValue.serverTimestamp() });

  // Stub: In-app notification (actual implementation could enqueue message)
  if (data.notification.channels.includes('inapp')) {
    await db.collection('notifications').add({
      userId: data.userId,
      type: 'saved_search_match',
      savedSearchId: docId,
      listingIds: matched,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      seen: false
    });
  }

  // TODO: Integrate push/email sending via separate functions or third-party provider.
  logger.info('Executed saved search alert', { docId, runId: runRef.id, matches: matched.length });
}

// Scheduled function: runs every 30 minutes to process enabled saved searches.
export const savedSearchAlertScheduler = functions.region('europe-west1').pubsub.schedule('every 30 minutes').onRun(async () => {
  const snap = await db.collection(SAVED_SEARCHES).where('notification.enabled', '==', true).get();
  const tasks: Promise<void>[] = [];
  snap.forEach(doc => {
    const data = doc.data() as SavedSearch;
    // Basic throttle: skip if triggered in last 20 minutes
    const last = data.notification.lastTriggeredAt?.toDate();
    if (last && Date.now() - last.getTime() < 20 * 60 * 1000) return;
    tasks.push(executeSavedSearch(doc.id, data));
  });
  await Promise.all(tasks);
  logger.info('Completed saved search alert batch', { count: tasks.length });
});

// Trigger when a saved search is created: perform an immediate first run to give instant feedback.
export const savedSearchOnCreate = functions.region('europe-west1').firestore.document(`${SAVED_SEARCHES}/{id}`).onCreate(async (snap) => {
  try {
    const data = snap.data() as SavedSearch;
    await executeSavedSearch(snap.id, data);
  } catch (e) {
    logger.error('Error executing initial saved search', e instanceof Error ? e : new Error(String(e)));
  }
});
