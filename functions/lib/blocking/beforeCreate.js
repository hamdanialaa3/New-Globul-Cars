"use strict";
/**
 * ⚠️ SECURITY: Auth Blocking Function - Registration Rate Limiting
 *
 * Purpose: Prevent automated abuse/bot registrations
 * Strategy: Limit registrations to 3 per device fingerprint in 24h
 * Fingerprint: hash(IP + User-Agent)
 *
 * Applies to:
 * - Email/Password registration
 * - Google OAuth
 * - Facebook OAuth
 * - All auth provider sign-ups
 *
 * Created: January 25, 2026
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeUserCreated = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const crypto_1 = require("crypto"); // ✅ Node.js built-in module
// Rate limit configuration
const MAX_ATTEMPTS = 3;
const WINDOW_HOURS = 24;
/**
 * Generate device fingerprint from IP + User-Agent
 */
function generateFingerprint(ipAddress, userAgent) {
    const raw = `${ipAddress}|${userAgent}`;
    return (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
}
/**
 * Check if registration is allowed for this fingerprint
 */
async function checkRateLimit(fingerprint) {
    const db = admin.firestore();
    const attemptsRef = db.collection('registration_attempts');
    // Calculate 24h window
    const now = admin.firestore.Timestamp.now();
    const windowStart = admin.firestore.Timestamp.fromMillis(now.toMillis() - (WINDOW_HOURS * 60 * 60 * 1000));
    // Query attempts in the last 24h
    const recentAttempts = await attemptsRef
        .where('fingerprint', '==', fingerprint)
        .where('timestamp', '>=', windowStart)
        .get();
    const count = recentAttempts.size;
    return {
        allowed: count < MAX_ATTEMPTS,
        count
    };
}
/**
 * Record a registration attempt
 */
async function recordAttempt(fingerprint, email) {
    const db = admin.firestore();
    await db.collection('registration_attempts').add({
        fingerprint,
        email: email || 'unknown',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        blocked: false
    });
}
/**
 * Firebase Auth Blocking Function - Before User Creation
 *
 * This runs BEFORE the user account is created in Firebase Auth.
 * If we throw an error, the registration is blocked.
 */
exports.beforeUserCreated = functions
    .region('europe-west1')
    .auth
    .user()
    .beforeCreate(async (user, context) => {
    var _a, _b;
    try {
        // Extract request metadata
        const ipAddress = context.ipAddress || 'unknown';
        const userAgent = context.eventType || 'unknown';
        // Generate fingerprint
        const fingerprint = generateFingerprint(ipAddress, userAgent);
        functions.logger.info('Registration attempt', {
            fingerprint: fingerprint.substring(0, 8) + '...', // Log partial for privacy
            email: user.email,
            provider: (_b = (_a = user.providerData) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.providerId
        });
        // Check rate limit
        const { allowed, count } = await checkRateLimit(fingerprint);
        if (!allowed) {
            functions.logger.warn('Registration blocked - rate limit exceeded', {
                fingerprint: fingerprint.substring(0, 8) + '...',
                attempts: count,
                limit: MAX_ATTEMPTS
            });
            // Record blocked attempt
            await admin.firestore().collection('registration_attempts').add({
                fingerprint,
                email: user.email || 'unknown',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                blocked: true,
                reason: 'rate_limit_exceeded'
            });
            // Block the registration
            throw new functions.https.HttpsError('resource-exhausted', 'Registration limit exceeded. Please try again later or contact support.', {
                code: 'RATE_LIMIT_EXCEEDED',
                limit: MAX_ATTEMPTS,
                windowHours: WINDOW_HOURS
            });
        }
        // Record successful attempt
        await recordAttempt(fingerprint, user.email);
        functions.logger.info('Registration allowed', {
            fingerprint: fingerprint.substring(0, 8) + '...',
            email: user.email,
            attemptCount: count + 1
        });
        // Allow registration to proceed
        return;
    }
    catch (error) {
        // If it's our rate limit error, re-throw it
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        // Log unexpected errors but allow registration (fail-open for availability)
        functions.logger.error('Error in beforeUserCreated', error);
        // Don't block legitimate users due to our bugs
        return;
    }
});
//# sourceMappingURL=beforeCreate.js.map