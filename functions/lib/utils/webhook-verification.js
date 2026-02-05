"use strict";
/**
 * Webhook Verification Utilities
 * Provides signature verification for all payment providers
 * @since February 5, 2026
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.markWebhookProcessed = exports.isWebhookProcessed = exports.generateIdempotencyKey = exports.verifyWebhookTimestamp = exports.verifyRevolutSignature = exports.verifyICardSignature = void 0;
const crypto = require("crypto");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
/**
 * Verify iCard webhook signature
 * Uses HMAC-SHA256 with secret key
 */
function verifyICardSignature(payload, signature, secret) {
    try {
        if (!secret) {
            logger.warn('iCard webhook secret not configured');
            return { verified: false, error: 'Missing webhook secret' };
        }
        const payloadString = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
        // iCard uses HMAC-SHA256
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payloadString)
            .digest('hex');
        const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        if (!isValid) {
            logger.warn('iCard signature verification failed', {
                expected: expectedSignature.substring(0, 10) + '...',
                received: signature.substring(0, 10) + '...'
            });
        }
        return { verified: isValid };
    }
    catch (error) {
        logger.error('iCard signature verification error', { error: error.message });
        return { verified: false, error: error.message };
    }
}
exports.verifyICardSignature = verifyICardSignature;
/**
 * Verify Revolut webhook signature
 * Uses HMAC-SHA256 with secret key
 */
function verifyRevolutSignature(payload, signature, secret) {
    try {
        if (!secret) {
            logger.warn('Revolut webhook secret not configured');
            return { verified: false, error: 'Missing webhook secret' };
        }
        const payloadString = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
        // Revolut uses HMAC-SHA256 format: "v1=<signature>"
        const parts = signature.split('=');
        if (parts.length !== 2 || parts[0] !== 'v1') {
            return { verified: false, error: 'Invalid signature format' };
        }
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payloadString)
            .digest('hex');
        const receivedSignature = parts[1];
        const isValid = crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature));
        if (!isValid) {
            logger.warn('Revolut signature verification failed');
        }
        return { verified: isValid };
    }
    catch (error) {
        logger.error('Revolut signature verification error', { error: error.message });
        return { verified: false, error: error.message };
    }
}
exports.verifyRevolutSignature = verifyRevolutSignature;
/**
 * Verify timestamp to prevent replay attacks
 * Rejects webhooks older than 5 minutes
 */
function verifyWebhookTimestamp(timestamp, maxAgeMinutes = 5) {
    try {
        const webhookTime = typeof timestamp === 'string'
            ? new Date(timestamp).getTime()
            : timestamp * 1000; // Unix timestamp to ms
        const now = Date.now();
        const ageMinutes = (now - webhookTime) / 1000 / 60;
        if (ageMinutes > maxAgeMinutes) {
            logger.warn('Webhook timestamp too old', {
                ageMinutes: Math.round(ageMinutes),
                maxAgeMinutes
            });
            return false;
        }
        if (webhookTime > now + 60000) { // Allow 1 minute clock skew
            logger.warn('Webhook timestamp in future');
            return false;
        }
        return true;
    }
    catch (error) {
        logger.error('Timestamp verification error', { error: error.message });
        return false;
    }
}
exports.verifyWebhookTimestamp = verifyWebhookTimestamp;
/**
 * Generate idempotency key from transaction details
 * Prevents duplicate processing of same transaction
 */
function generateIdempotencyKey(provider, transactionId, eventType) {
    return crypto
        .createHash('sha256')
        .update(`${provider}:${transactionId}:${eventType}`)
        .digest('hex');
}
exports.generateIdempotencyKey = generateIdempotencyKey;
/**
 * Check if webhook has already been processed
 * Returns true if this is a duplicate webhook
 */
async function isWebhookProcessed(db, idempotencyKey) {
    const doc = await db
        .collection('payment_webhooks_processed')
        .doc(idempotencyKey)
        .get();
    return doc.exists;
}
exports.isWebhookProcessed = isWebhookProcessed;
/**
 * Mark webhook as processed
 * Stores idempotency key with TTL (auto-delete after 7 days)
 */
async function markWebhookProcessed(db, idempotencyKey, metadata) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days TTL
    await db
        .collection('payment_webhooks_processed')
        .doc(idempotencyKey)
        .set(Object.assign({ processed_at: admin.firestore.FieldValue.serverTimestamp(), expires_at: expiresAt }, metadata));
}
exports.markWebhookProcessed = markWebhookProcessed;
//# sourceMappingURL=webhook-verification.js.map