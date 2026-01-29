"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRegistrationRateLimit = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto_1 = require("crypto");
// Passive deterrent for mass account creation. Not wired into auth triggers yet.
// Call this from backend-controlled signup flow before creating user records.
// TODO: MANUAL REVIEW REQUIRED - integrate with signup endpoint/auth trigger when ready.
const db = admin.firestore();
const REG_COLLECTION = 'registration_attempts';
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_ATTEMPTS = 3;
function hashFingerprint(ip, ua) {
    const input = `${ip || 'n/a'}|${ua || 'n/a'}`;
    return crypto_1.default.createHash('sha256').update(input).digest('hex');
}
exports.checkRegistrationRateLimit = functions.https.onCall(async (data, context) => {
    const ip = context.rawRequest.ip;
    const ua = context.rawRequest.headers['user-agent'];
    const fingerprint = hashFingerprint(ip, typeof ua === 'string' ? ua : Array.isArray(ua) ? ua.join(',') : '');
    const cutoff = Date.now() - WINDOW_MS;
    const attemptsRef = db.collection(REG_COLLECTION).where('fingerprint', '==', fingerprint).where('createdAt', '>=', cutoff);
    const snap = await attemptsRef.get();
    if (snap.size >= MAX_ATTEMPTS) {
        throw new functions.https.HttpsError('resource-exhausted', 'Too many registrations from this device. Try again later.');
    }
    // Record attempt (fire-and-forget to avoid user-facing latency issues)
    await db.collection(REG_COLLECTION).add({
        fingerprint,
        ip: ip || 'unknown',
        userAgent: ua || 'unknown',
        createdAt: Date.now()
    });
    return { allowed: true, remaining: Math.max(0, MAX_ATTEMPTS - snap.size - 1), windowMs: WINDOW_MS };
});
//# sourceMappingURL=registration-rate-limit.js.map