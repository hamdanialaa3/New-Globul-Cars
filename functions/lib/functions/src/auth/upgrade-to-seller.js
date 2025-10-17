"use strict";
/**
 * Firebase Cloud Functions - Seller Upgrade System
 * Allows users to upgrade from buyer to seller
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
exports.checkSellerEligibility = exports.upgradeToSeller = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Callable function to upgrade user from buyer to seller
 * Requires authentication and acceptance of terms
 */
exports.upgradeToSeller = functions.https.onCall(async (data, context) => {
    // 1. Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to upgrade to seller');
    }
    const uid = context.auth.uid;
    // 2. Check if terms are accepted
    if (!data.acceptedTerms) {
        throw new functions.https.HttpsError('failed-precondition', 'User must accept terms and conditions');
    }
    try {
        // 3. Check current user status
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User profile not found');
        }
        const userData = userDoc.data();
        // Prevent duplicate upgrades
        if ((userData === null || userData === void 0 ? void 0 : userData.role) === 'seller' || (userData === null || userData === void 0 ? void 0 : userData.accountType) === 'business') {
            throw new functions.https.HttpsError('already-exists', 'User is already a seller');
        }
        // 4. Update Custom Claims
        const newClaims = {
            role: 'seller',
            seller: true,
            admin: false,
            upgradedAt: Date.now()
        };
        await admin.auth().setCustomUserClaims(uid, newClaims);
        console.log(`Upgraded user ${uid} to seller role`);
        // 5. Update Firestore user profile
        const updateData = {
            role: 'seller',
            accountType: 'business',
            upgradedToSellerAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        // Add business information if provided
        if (data.businessName)
            updateData.businessName = data.businessName;
        if (data.bulstat)
            updateData.bulstat = data.bulstat;
        if (data.vatNumber)
            updateData.vatNumber = data.vatNumber;
        if (data.businessType)
            updateData.businessType = data.businessType;
        if (data.businessAddress)
            updateData.businessAddress = data.businessAddress;
        if (data.businessCity)
            updateData.businessCity = data.businessCity;
        if (data.businessPostalCode)
            updateData.businessPostalCode = data.businessPostalCode;
        if (data.website)
            updateData.website = data.website;
        if (data.businessPhone)
            updateData.businessPhone = data.businessPhone;
        if (data.businessEmail)
            updateData.businessEmail = data.businessEmail;
        await admin.firestore().collection('users').doc(uid).update(updateData);
        // 6. Create seller document for stats/metrics
        await admin.firestore().collection('sellers').doc(uid).set({
            uid,
            email: context.auth.token.email,
            displayName: (userData === null || userData === void 0 ? void 0 : userData.displayName) || '',
            businessName: data.businessName || '',
            averageRating: 0,
            totalReviews: 0,
            totalCars: 0,
            activeCars: 0,
            soldCars: 0,
            totalViews: 0,
            joinedAsSellerAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // 7. Force token refresh
        await admin.database().ref(`metadata/${uid}/refreshTime`).set(admin.database.ServerValue.TIMESTAMP);
        console.log(`Seller account fully set up for user ${uid}`);
        return {
            success: true,
            message: 'Successfully upgraded to seller',
            role: 'seller',
            accountType: 'business'
        };
    }
    catch (error) {
        console.error(`Error upgrading user ${uid} to seller:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to upgrade to seller account', error.message);
    }
});
/**
 * Callable function to check if user can upgrade to seller
 * Returns eligibility status and required steps
 */
exports.checkSellerEligibility = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const uid = context.auth.uid;
    try {
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return {
                eligible: false,
                reason: 'User profile not found'
            };
        }
        const userData = userDoc.data();
        // Check if already a seller
        if ((userData === null || userData === void 0 ? void 0 : userData.role) === 'seller') {
            return {
                eligible: false,
                reason: 'Already a seller',
                currentRole: 'seller'
            };
        }
        // Check email verification
        if (!(userData === null || userData === void 0 ? void 0 : userData.emailVerified)) {
            return {
                eligible: false,
                reason: 'Email not verified',
                requiredSteps: ['Verify email address']
            };
        }
        // All checks passed
        return {
            eligible: true,
            currentRole: 'buyer',
            requiredInformation: [
                'Business name (optional)',
                'BULSTAT number (optional)',
                'Business address (optional)',
                'Accept terms and conditions (required)'
            ]
        };
    }
    catch (error) {
        console.error(`Error checking seller eligibility for ${uid}:`, error);
        throw new functions.https.HttpsError('internal', 'Failed to check eligibility', error.message);
    }
});
//# sourceMappingURL=upgrade-to-seller.js.map