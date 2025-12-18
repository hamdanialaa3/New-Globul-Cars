// functions/src/analytics/trackEvent.ts
// Cloud Function: Track analytics events

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { AnalyticsEvent, TrackEventRequest } from './types';

const db = getFirestore();

interface EventMetadata {
  listingId?: string;
  sellerId?: string;
  profileId?: string;
  receiverId?: string;
  query?: string;
  filters?: Record<string, any>;
  deviceType?: string;
  [key: string]: any;
}

/**
 * Track Analytics Event
 * 
 * Records user interactions and updates analytics counters
 * 
 * @param eventType - Type of event (listing_view, inquiry_sent, etc.)
 * @param userId - User who triggered the event
 * @param metadata - Additional event data
 * 
 * @returns Success status
 */
export const trackEvent = onCall<TrackEventRequest>(async (request) => {
  const { eventType, userId, metadata = {} } = request.data;

  // Allow unauthenticated for view tracking
  // But require auth for inquiries, favorites, etc.
  const requiresAuth = ['inquiry_sent', 'favorite_added', 'contact_click'];
  
  if (requiresAuth.includes(eventType) && !request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required for this event');
  }

  if (!eventType || !userId) {
    throw new HttpsError('invalid-argument', 'eventType and userId are required');
  }

  logger.info('Tracking event', { eventType, userId, hasMetadata: !!metadata });

  try {
    // 1. Create event record
    const eventData = {
      userId,
      eventType,
      timestamp: FieldValue.serverTimestamp() as unknown as Timestamp,
      metadata: {
        ...metadata,
        deviceType: request.rawRequest.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
      },
    };

    await db.collection('analyticsEvents').add(eventData);

    // 2. Update counters based on event type
    switch (eventType) {
      case 'listing_view':
        await handleListingView(userId, metadata);
        break;

      case 'profile_view':
        await handleProfileView(userId, metadata);
        break;

      case 'inquiry_sent':
        await handleInquirySent(userId, metadata);
        break;

      case 'favorite_added':
        await handleFavoriteAdded(userId, metadata);
        break;

      case 'search':
        await handleSearch(userId, metadata);
        break;

      case 'contact_click':
        await handleContactClick(userId, metadata);
        break;

      default:
        logger.warn('Unknown event type', { eventType });
    }

    logger.info('Event tracked successfully', { eventType, userId });

    return { success: true, message: 'Event tracked' };

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Event tracking failed', { error: err.message });
    throw new HttpsError('internal', `Failed to track event: ${err.message}`);
  }
});

/**
 * Handle listing view event
 */
async function handleListingView(viewerId: string, metadata: EventMetadata) {
  const { listingId, sellerId } = metadata;

  if (!listingId || !sellerId) {
    logger.warn('Missing listingId or sellerId for listing_view');
    return;
  }

  // Don't count seller's own views
  if (viewerId === sellerId) {
    return;
  }

  // Update listing analytics
  await db.collection('listingAnalytics').doc(listingId).set(
    {
      listingId,
      sellerId,
      views: FieldValue.increment(1),
      viewsToday: FieldValue.increment(1),
      viewsThisWeek: FieldValue.increment(1),
      viewsThisMonth: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update seller's user analytics
  await db.collection('userAnalytics').doc(sellerId).set(
    {
      userId: sellerId,
      listingViews: FieldValue.increment(1),
      listingViewsToday: FieldValue.increment(1),
      listingViewsThisWeek: FieldValue.increment(1),
      listingViewsThisMonth: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Handle profile view event
 */
async function handleProfileView(viewerId: string, metadata: EventMetadata) {
  const { profileUserId } = metadata;

  if (!profileUserId) {
    logger.warn('Missing profileUserId for profile_view');
    return;
  }

  // Don't count own profile views
  if (viewerId === profileUserId) {
    return;
  }

  // Update profile owner's analytics
  await db.collection('userAnalytics').doc(profileUserId).set(
    {
      userId: profileUserId,
      profileViews: FieldValue.increment(1),
      profileViewsToday: FieldValue.increment(1),
      profileViewsThisWeek: FieldValue.increment(1),
      profileViewsThisMonth: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Handle inquiry sent event
 */
async function handleInquirySent(senderId: string, metadata: EventMetadata) {
  const { listingId, sellerId } = metadata;

  if (!sellerId) {
    logger.warn('Missing sellerId for inquiry_sent');
    return;
  }

  // Update seller's analytics
  await db.collection('userAnalytics').doc(sellerId).set(
    {
      userId: sellerId,
      inquiries: FieldValue.increment(1),
      inquiriesToday: FieldValue.increment(1),
      inquiriesThisWeek: FieldValue.increment(1),
      inquiriesThisMonth: FieldValue.increment(1),
      leads: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update listing analytics if provided
  if (listingId) {
    await db.collection('listingAnalytics').doc(listingId).set(
      {
        listingId,
        sellerId,
        inquiries: FieldValue.increment(1),
        lastUpdated: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
}

/**
 * Handle favorite added event
 */
async function handleFavoriteAdded(userId: string, metadata: EventMetadata) {
  const { listingId, sellerId } = metadata;

  if (!sellerId) {
    logger.warn('Missing sellerId for favorite_added');
    return;
  }

  // Update seller's analytics
  await db.collection('userAnalytics').doc(sellerId).set(
    {
      userId: sellerId,
      favorites: FieldValue.increment(1),
      favoritesToday: FieldValue.increment(1),
      favoritesThisWeek: FieldValue.increment(1),
      favoritesThisMonth: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update listing analytics if provided
  if (listingId) {
    await db.collection('listingAnalytics').doc(listingId).set(
      {
        listingId,
        sellerId,
        favorites: FieldValue.increment(1),
        lastUpdated: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
}

/**
 * Handle search event
 */
async function handleSearch(userId: string, metadata: EventMetadata) {
  // Log search for analytics (can be used for trending searches)
  logger.info('Search event', { userId, searchTerm: metadata.searchTerm });
}

/**
 * Handle contact click event
 */
async function handleContactClick(userId: string, metadata: EventMetadata) {
  const { sellerId } = metadata;

  if (!sellerId) {
    logger.warn('Missing sellerId for contact_click');
    return;
  }

  // Similar to inquiry, but lighter tracking
  await db.collection('userAnalytics').doc(sellerId).set(
    {
      userId: sellerId,
      leads: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}
