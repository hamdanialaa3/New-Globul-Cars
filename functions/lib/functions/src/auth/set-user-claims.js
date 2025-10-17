"use strict";
/**
 * Firebase Cloud Functions - User Claims Management
 * Automatically assigns default role to new users
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */
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
exports.handleTokenRefresh = exports.setDefaultUserRole = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Triggers when a new user is created via Firebase Authentication
 * Assigns default role 'buyer' using Custom Claims
 * Also creates a user profile document in Firestore
 */
exports.setDefaultUserRole = functions.auth.user().onCreate(async (user) => {
    const uid = user.uid;
    const email = user.email || '';
    // Default Custom Claims for new users
    const customClaims = {
        role: 'buyer',
        seller: false,
        admin: false,
        createdAt: Date.now()
    };
    try {
        // 1. Set Custom Claims in Auth Token
        await admin.auth().setCustomUserClaims(uid, customClaims);
        console.log(`Custom claims set for user ${uid}: role='buyer'`);
        // 2. Create user profile in Firestore
        await admin.firestore().collection('users').doc(uid).set({
            uid,
            email,
            role: 'buyer',
            accountType: 'individual',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            phoneNumber: user.phoneNumber || '',
            preferredLanguage: 'bg',
            currency: 'EUR',
            location: {
                country: 'Bulgaria',
                city: '',
                region: ''
            },
            isActive: true,
            emailVerified: user.emailVerified,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`User profile created in Firestore for ${uid}`);
        // 3. Force token refresh using Realtime Database
        // This ensures the new claims are available immediately
        await admin.database().ref(`metadata/${uid}/refreshTime`).set(admin.database.ServerValue.TIMESTAMP);
        console.log(`Token refresh triggered for user ${uid}`);
        return { success: true, uid, role: 'buyer' };
    }
    catch (error) {
        console.error(`Error setting up new user ${uid}:`, error);
        throw new functions.https.HttpsError('internal', 'Failed to set up user account', error);
    }
});
/**
 * Handles token refresh when metadata changes
 * Monitors Realtime Database for refresh signals
 */
exports.handleTokenRefresh = functions.database
    .ref('/metadata/{uid}/refreshTime')
    .onUpdate(async (change, context) => {
    const uid = context.params.uid;
    console.log(`Token refresh signal detected for user ${uid}`);
    // The client SDK will automatically refresh the token when it detects this change
    return { success: true, uid, timestamp: change.after.val() };
});
//# sourceMappingURL=set-user-claims.js.map