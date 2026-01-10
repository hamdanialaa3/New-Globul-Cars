"use strict";
/**
 * Algolia Sync Cloud Function - مزامنة السيارات مع Algolia
 * Automatically syncs car data to Algolia on every create/update/delete
 *
 * Deployment:
 * 1. cd functions
 * 2. npm install algoliasearch
 * 3. firebase functions:config:set algolia.app_id="YOUR_APP_ID" algolia.admin_key="YOUR_ADMIN_KEY"
 * 4. firebase deploy --only functions:syncCarToAlgolia
 *
 * @since December 2025
 */
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchSyncAllCarsToAlgolia = exports.syncBusesToAlgolia = exports.syncTrucksToAlgolia = exports.syncMotorcyclesToAlgolia = exports.syncVansToAlgolia = exports.syncSuvsToAlgolia = exports.syncPassengerCarsToAlgolia = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const algoliasearch_1 = require("algoliasearch");
// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
    admin.initializeApp();
}
// Algolia configuration from Firebase config
const ALGOLIA_APP_ID = ((_a = functions.config().algolia) === null || _a === void 0 ? void 0 : _a.app_id) || process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = ((_b = functions.config().algolia) === null || _b === void 0 ? void 0 : _b.admin_key) || process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_NAME = 'cars_bg_production';
// Initialize Algolia client (v4 API)
const client = (0, algoliasearch_1.default)(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);
// All vehicle collections to monitor
const COLLECTIONS = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
/**
 * Fetch seller's trust score from users collection
 * استرجاع درجة الثقة للبائع
 */
async function getSellerTrustScore(sellerId) {
    var _a;
    if (!sellerId)
        return 0;
    try {
        const userDoc = await admin.firestore().collection('users').doc(sellerId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            // trustScore is 0-100, default to 50 for new sellers
            return (_a = userData === null || userData === void 0 ? void 0 : userData.trustScore) !== null && _a !== void 0 ? _a : 50;
        }
        return 50; // Default score for sellers without profile
    }
    catch (error) {
        logger.warn('Failed to fetch seller trust score', { sellerId, error });
        return 50; // Default on error
    }
}
/**
 * Convert Firestore car document to Algolia record
 * ✅ ENHANCED: Includes sellerTrustScore for ranking boost
 */
async function carToAlgoliaRecord(carId, carData) {
    var _a, _b, _c, _d;
    // Fetch seller's trust score for ranking
    const sellerTrustScore = await getSellerTrustScore(carData.sellerId);
    return {
        objectID: carId,
        // Basic Info
        make: carData.make || '',
        model: carData.model || '',
        year: carData.year || 0,
        price: carData.price || 0,
        priceEUR: carData.currency === 'BGN' ? (carData.price || 0) / 1.95583 : (carData.price || 0),
        // ✅ REVENUE FIX: TrustScore for search ranking boost
        sellerTrustScore,
        // Details
        fuelType: carData.fuelType || '',
        transmission: carData.transmission || '',
        bodyType: carData.bodyType || '',
        mileage: carData.mileage || 0,
        color: carData.color || carData.exteriorColor || '',
        // Location (for geo-search)
        _geoloc: {
            lat: ((_a = carData.location) === null || _a === void 0 ? void 0 : _a.lat) || 42.6977,
            lng: ((_b = carData.location) === null || _b === void 0 ? void 0 : _b.lng) || 23.3219
        },
        city: carData.city || '',
        // Tags for faceted search
        _tags: [
            carData.make,
            carData.bodyType,
            carData.fuelType,
            carData.year > 2020 ? 'new_car' : 'used_car',
            carData.sellerType || 'private',
            carData.isVerified ? 'verified' : 'unverified'
        ].filter(Boolean),
        // IDs
        sellerNumericId: carData.sellerNumericId || 0,
        carNumericId: carData.carNumericId || 0,
        sellerId: carData.sellerId || '',
        // Status
        status: carData.status || 'active',
        isActive: carData.isActive !== false,
        // Timestamps (convert Firestore timestamp to Unix timestamp)
        createdAt: ((_c = carData.createdAt) === null || _c === void 0 ? void 0 : _c._seconds) || Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        // Equipment (for filtering)
        safetyEquipment: carData.safetyEquipment || [],
        comfortEquipment: carData.comfortEquipment || [],
        infotainmentEquipment: carData.infotainmentEquipment || [],
        // Description for full-text search
        description: carData.description || '',
        // Image for display
        mainImageUrl: ((_d = carData.images) === null || _d === void 0 ? void 0 : _d[0]) || carData.mainImageUrl || ''
    };
}
/**
 * Sync car to Algolia on write (create/update/delete)
 * This creates separate functions for each collection
 */
exports.syncPassengerCarsToAlgolia = functions.firestore
    .document('passenger_cars/{carId}')
    .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'passenger_cars');
});
exports.syncSuvsToAlgolia = functions.firestore
    .document('suvs/{carId}')
    .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'suvs');
});
exports.syncVansToAlgolia = functions.firestore
    .document('vans/{carId}')
    .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'vans');
});
exports.syncMotorcyclesToAlgolia = functions.firestore
    .document('motorcycles/{carId}')
    .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'motorcycles');
});
exports.syncTrucksToAlgolia = functions.firestore
    .document('trucks/{carId}')
    .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'trucks');
});
exports.syncBusesToAlgolia = functions.firestore
    .document('buses/{carId}')
    .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'buses');
});
/**
 * Common handler for all sync operations
 */
async function syncCarHandler(change, context, collectionName) {
    const carId = context.params.carId;
    const carData = change.after.exists ? change.after.data() : null;
    logger.info(`[${collectionName}] Processing car`, {
        carId,
        exists: change.after.exists,
        status: carData === null || carData === void 0 ? void 0 : carData.status,
        isActive: carData === null || carData === void 0 ? void 0 : carData.isActive
    });
    // DELETE: Car was deleted or became inactive
    if (!carData || carData.status !== 'active' || carData.isActive === false) {
        logger.info(`[${collectionName}] Deleting from Algolia`, { carId });
        try {
            await index.deleteObject(carId);
            logger.info(`[${collectionName}] Successfully deleted from Algolia`, { carId });
        }
        catch (error) {
            logger.error(`[${collectionName}] Failed to delete from Algolia`, { carId, error });
            throw error;
        }
        return;
    }
    // CREATE/UPDATE: Sync to Algolia
    try {
        const record = await carToAlgoliaRecord(carId, carData);
        record.collection = collectionName; // Add collection name for filtering
        logger.info(`[${collectionName}] Syncing to Algolia`, {
            carId,
            make: record.make,
            model: record.model,
            year: record.year,
            price: record.price
        });
        await index.saveObject(record);
        logger.info(`[${collectionName}] Successfully synced to Algolia`, { carId });
    }
    catch (error) {
        logger.error(`[${collectionName}] Failed to sync to Algolia`, { carId, error });
        throw error;
    }
}
/**
 * Batch sync all cars (run manually when needed)
 * Usage: firebase functions:call batchSyncAllCarsToAlgolia
 */
exports.batchSyncAllCarsToAlgolia = functions.https.onCall(async (data, context) => {
    // Require authentication and admin role
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Must be admin');
    }
    logger.info('Starting batch sync of all cars to Algolia');
    let totalSynced = 0;
    let totalErrors = 0;
    for (const collectionName of COLLECTIONS) {
        try {
            logger.info('Syncing collection to Algolia', { collectionName });
            const snapshot = await admin.firestore()
                .collection(collectionName)
                .where('status', '==', 'active')
                .get();
            const records = await Promise.all(snapshot.docs.map(async (doc) => {
                const record = await carToAlgoliaRecord(doc.id, doc.data());
                record.collection = collectionName;
                return record;
            }));
            if (records.length > 0) {
                await index.saveObjects(records);
                totalSynced += records.length;
                logger.info('Collection batch synced', { collectionName, count: records.length });
            }
        }
        catch (error) {
            totalErrors++;
            logger.error('Collection batch sync failed', { collectionName, error });
        }
    }
    const result = {
        success: true,
        totalSynced,
        totalErrors,
        collections: COLLECTIONS.length,
        timestamp: new Date().toISOString()
    };
    logger.info('Batch sync completed', result);
    return result;
});
//# sourceMappingURL=syncCarsToAlgolia.js.map