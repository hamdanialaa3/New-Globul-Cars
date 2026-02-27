"use strict";
/**
 * Guest Token Cloud Function
 *
 * Generates a custom Firebase Auth token for returning guest users.
 * This allows the same anonymous account to be restored across sessions.
 *
 * Security:
 * - Only generates tokens for existing guest/anonymous users
 * - Validates the UID exists in Firestore with isAnonymous=true
 * - Rate limited by Firebase's built-in callable rate limiting
 *
 * Created: February 6, 2026
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuestCustomToken = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
/**
 * Callable: Generate custom token for a returning guest user
 *
 * Client sends: { guestUid: string }
 * Returns: { token: string } or throws error
 */
exports.getGuestCustomToken = functions
    .region('europe-west1')
    .https
    .onCall(async (data, context) => {
    const { guestUid } = data;
    // Validate input
    if (!guestUid || typeof guestUid !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'guestUid is required');
    }
    // Sanitize UID (Firebase UIDs are alphanumeric + some special chars)
    if (guestUid.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(guestUid)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid UID format');
    }
    // SECURITY: Rate limit — max 5 guest token requests per UID per hour
    const { enforceRateLimit } = await Promise.resolve().then(() => require('../utils/rate-limiter'));
    await enforceRateLimit(guestUid, {
        collection: 'rate_limits_guest_token',
        maxCalls: 5,
        windowSeconds: 3600 // 1 hour
    });
    try {
        const db = admin.firestore();
        // Step 1: Verify the UID exists in Firestore as a guest user
        const userDoc = await db.collection('users').doc(guestUid).get();
        if (!userDoc.exists) {
            functions.logger.warn('[GuestToken] UID not found in Firestore', { guestUid });
            throw new functions.https.HttpsError('not-found', 'Guest account not found');
        }
        const userData = userDoc.data();
        // Step 2: Verify it's actually a guest/anonymous account
        const isGuest = (userData === null || userData === void 0 ? void 0 : userData.isAnonymous) === true
            || (userData === null || userData === void 0 ? void 0 : userData.accountType) === 'guest'
            || (userData === null || userData === void 0 ? void 0 : userData.profileType) === 'private';
        if (!isGuest) {
            functions.logger.warn('[GuestToken] UID is not a guest account', { guestUid });
            throw new functions.https.HttpsError('permission-denied', 'This is not a guest account');
        }
        // Step 3: Verify the Firebase Auth user still exists
        try {
            await admin.auth().getUser(guestUid);
        }
        catch (authError) {
            if (authError.code === 'auth/user-not-found') {
                // Auth user was deleted (expired anonymous account)
                // Clean up the orphaned Firestore doc
                functions.logger.info('[GuestToken] Auth user expired, cleaning up', { guestUid });
                throw new functions.https.HttpsError('not-found', 'Guest account expired');
            }
            throw authError;
        }
        // Step 4: Generate custom token
        const customToken = await admin.auth().createCustomToken(guestUid);
        functions.logger.info('[GuestToken] Custom token generated', {
            guestUid,
            numericId: userData === null || userData === void 0 ? void 0 : userData.numericId
        });
        return {
            token: customToken,
            numericId: (userData === null || userData === void 0 ? void 0 : userData.numericId) || null
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        functions.logger.error('[GuestToken] Unexpected error', {
            guestUid,
            error: error instanceof Error ? error.message : String(error)
        });
        throw new functions.https.HttpsError('internal', 'Failed to generate guest token');
    }
});
//# sourceMappingURL=guest-token.js.map