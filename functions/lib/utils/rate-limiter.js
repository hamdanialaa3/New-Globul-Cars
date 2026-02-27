"use strict";
/**
 * Reusable Rate Limiter for Cloud Functions
 *
 * Uses Firestore to track per-user/per-IP call counts within a sliding window.
 * Designed for expensive operations (AI calls, token generation, etc.)
 *
 * @since Phase 3 – Performance & Security hardening
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceRateLimit = enforceRateLimit;
exports.cleanupRateLimitRecords = cleanupRateLimitRecords;
const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");
/**
 * Check and enforce rate limit for a given key (userId, IP, etc.)
 *
 * @param key - Unique identifier (e.g. userId, IP address)
 * @param config - Rate limit configuration
 * @throws functions.https.HttpsError if rate limit exceeded
 */
async function enforceRateLimit(key, config) {
    const db = admin.firestore();
    const ref = db.collection(config.collection);
    const now = admin.firestore.Timestamp.now();
    const windowStart = admin.firestore.Timestamp.fromMillis(now.toMillis() - (config.windowSeconds * 1000));
    // Count recent calls
    const recentCalls = await ref
        .where('key', '==', key)
        .where('timestamp', '>=', windowStart)
        .get();
    if (recentCalls.size >= config.maxCalls) {
        functions.logger.warn('[RateLimiter] Rate limit exceeded', {
            key,
            collection: config.collection,
            count: recentCalls.size,
            maxCalls: config.maxCalls,
            windowSeconds: config.windowSeconds
        });
        throw new functions.https.HttpsError('resource-exhausted', `Rate limit exceeded. Maximum ${config.maxCalls} calls per ${Math.round(config.windowSeconds / 60)} minutes.`);
    }
    // Record this call
    await ref.add({
        key,
        timestamp: now
    });
}
/**
 * Clean up expired rate limit records (call from a scheduled function)
 */
async function cleanupRateLimitRecords(collectionName, maxAgeSeconds = 86400 // 24 hours
) {
    const db = admin.firestore();
    const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - (maxAgeSeconds * 1000));
    const oldRecords = await db.collection(collectionName)
        .where('timestamp', '<', cutoff)
        .limit(500) // Batch limit
        .get();
    if (oldRecords.empty)
        return 0;
    const batch = db.batch();
    oldRecords.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return oldRecords.size;
}
//# sourceMappingURL=rate-limiter.js.map