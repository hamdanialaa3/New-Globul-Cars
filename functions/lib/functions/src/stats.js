"use strict";
// functions/src/stats.ts
// Cloud Functions for marketplace statistics and counters.
// Adheres to the project constitution.
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
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
exports.onUserDelete = exports.onUserCreate = exports.onCarDelete = exports.onCarCreate = exports.incrementCarViewCount = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
const statsRef = db.collection('market').doc('stats');
/**
 * Increments the view count for a car and the total market views.
 * This is a callable function invoked from the frontend.
 */
exports.incrementCarViewCount = functions.region('europe-west1').https.onCall(async (data, context) => {
    var _a;
    const carId = data.carId;
    if (!carId) {
        throw new functions.https.HttpsError('invalid-argument', 'A "carId" must be provided.');
    }
    const carRef = db.collection('cars').doc(carId);
    try {
        await db.runTransaction(async (transaction) => {
            var _a;
            const carDoc = await transaction.get(carRef);
            if (!carDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Car document not found.');
            }
            // Increment view count on the car document
            const newViewCount = (((_a = carDoc.data()) === null || _a === void 0 ? void 0 : _a.viewCount) || 0) + 1;
            transaction.update(carRef, { viewCount: newViewCount });
            // Increment total market views in the stats document
            transaction.set(statsRef, {
                totalViews: admin.firestore.FieldValue.increment(1)
            }, { merge: true });
        });
        return { success: true, newViewCount: (_a = (await carRef.get()).data()) === null || _a === void 0 ? void 0 : _a.viewCount };
    }
    catch (error) {
        console.error('Error incrementing view count:', error);
        throw new functions.https.HttpsError('internal', 'Failed to increment view count.');
    }
});
/**
 * Updates total car count when a new car document is created.
 * This is a Firestore trigger.
 */
exports.onCarCreate = functions.region('europe-west1').firestore
    .document('cars/{carId}')
    .onCreate(async (snap, context) => {
    return statsRef.set({
        totalCars: admin.firestore.FieldValue.increment(1)
    }, { merge: true });
});
/**
 * Updates total car count when a car document is deleted.
 * This is a Firestore trigger.
 */
exports.onCarDelete = functions.region('europe-west1').firestore
    .document('cars/{carId}')
    .onDelete(async (snap, context) => {
    return statsRef.set({
        totalCars: admin.firestore.FieldValue.increment(-1)
    }, { merge: true });
});
/**
 * Updates total user count when a new user is created.
 * This is an Auth trigger.
 */
exports.onUserCreate = functions.region('europe-west1').auth
    .user()
    .onCreate(async (user) => {
    return statsRef.set({
        totalUsers: admin.firestore.FieldValue.increment(1)
    }, { merge: true });
});
/**
 * Updates total user count when a user is deleted.
 * This is an Auth trigger.
 */
exports.onUserDelete = functions.region('europe-west1').auth
    .user()
    .onDelete(async (user) => {
    return statsRef.set({
        totalUsers: admin.firestore.FieldValue.increment(-1)
    }, { merge: true });
});
//# sourceMappingURL=stats.js.map