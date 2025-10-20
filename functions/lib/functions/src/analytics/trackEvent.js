"use strict";
// functions/src/analytics/trackEvent.ts
// Cloud Function: Track analytics events
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
exports.trackEvent = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
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
exports.trackEvent = (0, https_1.onCall)(async (request) => {
    var _a;
    const { eventType, userId, metadata = {} } = request.data;
    // Allow unauthenticated for view tracking
    // But require auth for inquiries, favorites, etc.
    const requiresAuth = ['inquiry_sent', 'favorite_added', 'contact_click'];
    if (requiresAuth.includes(eventType) && !request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required for this event');
    }
    if (!eventType || !userId) {
        throw new https_1.HttpsError('invalid-argument', 'eventType and userId are required');
    }
    logger.info('Tracking event', { eventType, userId, hasMetadata: !!metadata });
    try {
        // 1. Create event record
        const eventData = {
            userId,
            eventType: eventType,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            metadata: Object.assign(Object.assign({}, metadata), { deviceType: ((_a = request.rawRequest.headers['user-agent']) === null || _a === void 0 ? void 0 : _a.includes('Mobile')) ? 'mobile' : 'desktop' }),
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
    }
    catch (error) {
        logger.error('Event tracking failed', error);
        throw new https_1.HttpsError('internal', `Failed to track event: ${error.message}`);
    }
});
/**
 * Handle listing view event
 */
async function handleListingView(viewerId, metadata) {
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
    await db.collection('listingAnalytics').doc(listingId).set({
        listingId,
        sellerId,
        views: firestore_1.FieldValue.increment(1),
        viewsToday: firestore_1.FieldValue.increment(1),
        viewsThisWeek: firestore_1.FieldValue.increment(1),
        viewsThisMonth: firestore_1.FieldValue.increment(1),
        lastUpdated: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Update seller's user analytics
    await db.collection('userAnalytics').doc(sellerId).set({
        userId: sellerId,
        listingViews: firestore_1.FieldValue.increment(1),
        listingViewsToday: firestore_1.FieldValue.increment(1),
        listingViewsThisWeek: firestore_1.FieldValue.increment(1),
        listingViewsThisMonth: firestore_1.FieldValue.increment(1),
        lastUpdated: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
}
/**
 * Handle profile view event
 */
async function handleProfileView(viewerId, metadata) {
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
    await db.collection('userAnalytics').doc(profileUserId).set({
        userId: profileUserId,
        profileViews: firestore_1.FieldValue.increment(1),
        profileViewsToday: firestore_1.FieldValue.increment(1),
        profileViewsThisWeek: firestore_1.FieldValue.increment(1),
        profileViewsThisMonth: firestore_1.FieldValue.increment(1),
        lastUpdated: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
}
/**
 * Handle inquiry sent event
 */
async function handleInquirySent(senderId, metadata) {
    const { listingId, sellerId } = metadata;
    if (!sellerId) {
        logger.warn('Missing sellerId for inquiry_sent');
        return;
    }
    // Update seller's analytics
    await db.collection('userAnalytics').doc(sellerId).set({
        userId: sellerId,
        inquiries: firestore_1.FieldValue.increment(1),
        inquiriesToday: firestore_1.FieldValue.increment(1),
        inquiriesThisWeek: firestore_1.FieldValue.increment(1),
        inquiriesThisMonth: firestore_1.FieldValue.increment(1),
        leads: firestore_1.FieldValue.increment(1),
        lastUpdated: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Update listing analytics if provided
    if (listingId) {
        await db.collection('listingAnalytics').doc(listingId).set({
            listingId,
            sellerId,
            inquiries: firestore_1.FieldValue.increment(1),
            lastUpdated: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
}
/**
 * Handle favorite added event
 */
async function handleFavoriteAdded(userId, metadata) {
    const { listingId, sellerId } = metadata;
    if (!sellerId) {
        logger.warn('Missing sellerId for favorite_added');
        return;
    }
    // Update seller's analytics
    await db.collection('userAnalytics').doc(sellerId).set({
        userId: sellerId,
        favorites: firestore_1.FieldValue.increment(1),
        favoritesToday: firestore_1.FieldValue.increment(1),
        favoritesThisWeek: firestore_1.FieldValue.increment(1),
        favoritesThisMonth: firestore_1.FieldValue.increment(1),
        lastUpdated: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Update listing analytics if provided
    if (listingId) {
        await db.collection('listingAnalytics').doc(listingId).set({
            listingId,
            sellerId,
            favorites: firestore_1.FieldValue.increment(1),
            lastUpdated: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
}
/**
 * Handle search event
 */
async function handleSearch(userId, metadata) {
    // Log search for analytics (can be used for trending searches)
    logger.info('Search event', { userId, searchTerm: metadata.searchTerm });
}
/**
 * Handle contact click event
 */
async function handleContactClick(userId, metadata) {
    const { sellerId } = metadata;
    if (!sellerId) {
        logger.warn('Missing sellerId for contact_click');
        return;
    }
    // Similar to inquiry, but lighter tracking
    await db.collection('userAnalytics').doc(sellerId).set({
        userId: sellerId,
        leads: firestore_1.FieldValue.increment(1),
        lastUpdated: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
}
//# sourceMappingURL=trackEvent.js.map