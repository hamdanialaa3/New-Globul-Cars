"use strict";
// Cloud Function to get REAL user count from Firebase Authentication
// Not from Firestore - from the actual Firebase Auth system!
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
exports.syncAuthToFirestore = exports.getActiveAuthUsers = exports.getAuthUsersCount = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Get the REAL total number of users from Firebase Authentication
 * This reads from the actual Auth system, not from Firestore
 */
exports.getAuthUsersCount = functions.https.onCall(async (data, context) => {
    // Verify that caller is the unique owner
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Only unique owner can call this
    if (context.auth.token.email !== 'alaa.hamdani@yahoo.com') {
        throw new functions.https.HttpsError('permission-denied', 'Only unique owner can access this data');
    }
    try {
        let totalUsers = 0;
        let nextPageToken = undefined;
        const users = [];
        // List all users from Firebase Authentication
        // This reads from the REAL Firebase Auth, not Firestore!
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            listUsersResult.users.forEach((userRecord) => {
                // Exclude the super admin from the count
                if (userRecord.email !== 'alaa.hamdani@yahoo.com') {
                    totalUsers++;
                    users.push({
                        uid: userRecord.uid,
                        email: userRecord.email,
                        displayName: userRecord.displayName || 'No Name',
                        photoURL: userRecord.photoURL || null,
                        emailVerified: userRecord.emailVerified,
                        phoneNumber: userRecord.phoneNumber || null,
                        disabled: userRecord.disabled,
                        createdAt: userRecord.metadata.creationTime,
                        lastSignInTime: userRecord.metadata.lastSignInTime,
                        providers: userRecord.providerData.map(p => p.providerId)
                    });
                }
            });
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        console.log(`✅ Found ${totalUsers} REAL users in Firebase Authentication`);
        return {
            totalUsers,
            users: users.slice(0, 100), // Return first 100 users
            timestamp: new Date().toISOString(),
            source: 'Firebase Authentication (Real Data)'
        };
    }
    catch (error) {
        console.error('Error getting auth users:', error);
        throw new functions.https.HttpsError('internal', `Failed to get users: ${error.message}`);
    }
});
/**
 * Get active users (logged in within last 24 hours)
 */
exports.getActiveAuthUsers = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth || context.auth.token.email !== 'alaa.hamdani@yahoo.com') {
        throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let activeUsers = 0;
        let nextPageToken = undefined;
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            listUsersResult.users.forEach((userRecord) => {
                if (userRecord.email === 'alaa.hamdani@yahoo.com')
                    return; // Skip super admin
                const lastSignIn = userRecord.metadata.lastSignInTime;
                if (lastSignIn) {
                    const lastSignInDate = new Date(lastSignIn);
                    if (lastSignInDate > oneDayAgo) {
                        activeUsers++;
                    }
                }
            });
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        return {
            activeUsers,
            period: '24 hours',
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error('Error getting active users:', error);
        throw new functions.https.HttpsError('internal', `Failed to get active users: ${error.message}`);
    }
});
/**
 * Sync Firebase Auth users to Firestore
 * This creates/updates user documents in Firestore from Firebase Auth
 */
exports.syncAuthToFirestore = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth || context.auth.token.email !== 'alaa.hamdani@yahoo.com') {
        throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }
    try {
        let syncedUsers = 0;
        let nextPageToken = undefined;
        const batch = admin.firestore().batch();
        let batchCount = 0;
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            for (const userRecord of listUsersResult.users) {
                // Skip super admin
                if (userRecord.email === 'alaa.hamdani@yahoo.com')
                    continue;
                const userRef = admin.firestore().collection('users').doc(userRecord.uid);
                // Check if user exists in Firestore
                const userDoc = await userRef.get();
                if (!userDoc.exists) {
                    // Create new user document
                    batch.set(userRef, {
                        uid: userRecord.uid,
                        email: userRecord.email,
                        displayName: userRecord.displayName || 'User',
                        photoURL: userRecord.photoURL || null,
                        emailVerified: userRecord.emailVerified,
                        phoneNumber: userRecord.phoneNumber || null,
                        disabled: userRecord.disabled,
                        createdAt: admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.creationTime)),
                        lastLogin: userRecord.metadata.lastSignInTime
                            ? admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.lastSignInTime))
                            : null,
                        providers: userRecord.providerData.map(p => p.providerId),
                        syncedFromAuth: true,
                        syncedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    batchCount++;
                    syncedUsers++;
                    // Commit batch every 500 operations (Firestore limit is 500)
                    if (batchCount >= 500) {
                        await batch.commit();
                        batchCount = 0;
                    }
                }
            }
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        // Commit remaining operations
        if (batchCount > 0) {
            await batch.commit();
        }
        console.log(`✅ Synced ${syncedUsers} users from Auth to Firestore`);
        return {
            syncedUsers,
            timestamp: new Date().toISOString(),
            message: `Successfully synced ${syncedUsers} users to Firestore`
        };
    }
    catch (error) {
        console.error('Error syncing users:', error);
        throw new functions.https.HttpsError('internal', `Failed to sync users: ${error.message}`);
    }
});
//# sourceMappingURL=get-auth-users-count.js.map