"use strict";
// Facebook Data Deletion Webhook Handler
// Processes data deletion requests from Facebook users
// GDPR and Facebook Platform Policy compliant
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
exports.handleFacebookDataDeletion = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
/**
 * Verify and decode Facebook signed request
 */
function parseSignedRequest(signedRequest, appSecret) {
    try {
        const [encodedSig, payload] = signedRequest.split('.');
        // Decode payload
        const jsonPayload = Buffer.from(payload, 'base64').toString('utf8');
        const data = JSON.parse(jsonPayload);
        // Verify signature
        const expectedSig = crypto
            .createHmac('sha256', appSecret)
            .update(payload)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        if (encodedSig !== expectedSig) {
            console.error('Invalid signature');
            return null;
        }
        return data;
    }
    catch (error) {
        console.error('Error parsing signed request:', error);
        return null;
    }
}
/**
 * Delete user data from Firestore
 */
async function deleteUserData(userId) {
    try {
        const db = admin.firestore();
        // Find user by Facebook ID
        const usersSnapshot = await db.collection('users')
            .where('facebookId', '==', userId)
            .get();
        if (usersSnapshot.empty) {
            console.log(`No user found with Facebook ID: ${userId}`);
            return true; // Consider successful if no data exists
        }
        const batch = db.batch();
        // Delete user documents
        usersSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        // Delete related data (cars, messages, etc.)
        for (const userDoc of usersSnapshot.docs) {
            const uid = userDoc.id;
            // Delete user's car listings
            const carsSnapshot = await db.collection('cars')
                .where('sellerId', '==', uid)
                .get();
            carsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Delete user's messages
            const messagesSnapshot = await db.collection('messages')
                .where('userId', '==', uid)
                .get();
            messagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Delete user's saved searches
            const searchesSnapshot = await db.collection('savedSearches')
                .where('userId', '==', uid)
                .get();
            searchesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        await batch.commit();
        console.log(`Successfully deleted data for Facebook user: ${userId}`);
        return true;
    }
    catch (error) {
        console.error('Error deleting user data:', error);
        return false;
    }
}
/**
 * Generate confirmation code for Facebook
 */
function generateConfirmationCode(userId) {
    const timestamp = Date.now();
    return crypto
        .createHash('sha256')
        .update(`${userId}_${timestamp}_deleted`)
        .digest('hex')
        .substring(0, 16);
}
/**
 * Data Deletion Webhook Handler
 * Called by Facebook when user requests data deletion
 */
exports.handleFacebookDataDeletion = (0, https_1.onRequest)({ cors: true }, async (request, response) => {
    try {
        // Only accept POST requests
        if (request.method !== 'POST') {
            response.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const { signed_request } = request.body;
        if (!signed_request) {
            response.status(400).json({ error: 'Missing signed_request' });
            return;
        }
        // Get Facebook App Secret from environment
        const appSecret = process.env.FACEBOOK_APP_SECRET;
        if (!appSecret) {
            console.error('FACEBOOK_APP_SECRET not configured');
            response.status(500).json({ error: 'Server configuration error' });
            return;
        }
        // Decode and verify the request
        const decodedRequest = parseSignedRequest(signed_request, appSecret);
        if (!decodedRequest) {
            response.status(400).json({ error: 'Invalid signed request' });
            return;
        }
        const { user_id } = decodedRequest;
        // Delete user data
        const deleted = await deleteUserData(user_id);
        if (!deleted) {
            response.status(500).json({ error: 'Failed to delete user data' });
            return;
        }
        // Generate confirmation code
        const confirmationCode = generateConfirmationCode(user_id);
        // Log the deletion for audit
        await admin.firestore().collection('audit_logs').add({
            type: 'facebook_data_deletion',
            userId: user_id,
            confirmationCode,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'completed'
        });
        // Return confirmation to Facebook
        response.status(200).json({
            url: `https://globul.net/data-deletion?confirmation=${confirmationCode}`,
            confirmation_code: confirmationCode
        });
    }
    catch (error) {
        console.error('Error in data deletion handler:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=data-deletion.js.map