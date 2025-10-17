"use strict";
/**
 * Firebase Cloud Functions - Algolia Search Sync
 * Automatically syncs car listings to Algolia search index
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
exports.reindexAllCars = exports.syncCarToAlgolia = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Syncs car document to Algolia search index
 * Triggers on create, update, or delete
 */
exports.syncCarToAlgolia = functions.firestore
    .document('cars/{carId}')
    .onWrite(async (change, context) => {
    var _a, _b, _c, _d, _e;
    const carId = context.params.carId;
    try {
        // Initialize Algolia client
        // Note: In production, uncomment and configure
        /*
        const algoliasearch = require('algoliasearch');
        const client = algoliasearch(
          functions.config().algolia.app_id,
          functions.config().algolia.api_key
        );
        const index = client.initIndex('cars');
        */
        // Handle deletion
        if (!change.after.exists) {
            console.log(`Car ${carId} deleted, removing from Algolia index`);
            // await index.deleteObject(carId);
            // For now, just log (Algolia not configured yet)
            console.log(`Would delete from Algolia: ${carId}`);
            return null;
        }
        // Get car data
        const carData = change.after.data();
        // Skip if not active (don't index inactive cars)
        if (carData.status !== 'active') {
            console.log(`Car ${carId} not active, skipping Algolia sync`);
            // await index.deleteObject(carId); // Remove from index if exists
            return null;
        }
        // Get seller information
        let sellerName = 'Unknown';
        let sellerRating = 0;
        try {
            const sellerDoc = await admin.firestore()
                .collection('users')
                .doc(carData.sellerId)
                .get();
            if (sellerDoc.exists) {
                const sellerData = sellerDoc.data();
                sellerName = (sellerData === null || sellerData === void 0 ? void 0 : sellerData.displayName) || (sellerData === null || sellerData === void 0 ? void 0 : sellerData.businessName) || 'Unknown';
            }
            // Get seller rating
            const sellerStatsDoc = await admin.firestore()
                .collection('sellers')
                .doc(carData.sellerId)
                .get();
            if (sellerStatsDoc.exists) {
                sellerRating = ((_a = sellerStatsDoc.data()) === null || _a === void 0 ? void 0 : _a.averageRating) || 0;
            }
        }
        catch (error) {
            console.error('Error fetching seller info:', error);
        }
        // Build search index object
        const indexObject = {
            objectID: carId,
            make: carData.make || '',
            model: carData.model || '',
            year: carData.year || 0,
            price: carData.price || 0,
            mileage: carData.mileage || 0,
            fuelType: carData.fuelType || '',
            transmission: carData.transmission || '',
            vehicleType: carData.vehicleType || '',
            bodyType: carData.bodyType || '',
            color: carData.color || '',
            city: ((_b = carData.location) === null || _b === void 0 ? void 0 : _b.city) || '',
            region: ((_c = carData.location) === null || _c === void 0 ? void 0 : _c.region) || carData.region || '',
            sellerId: carData.sellerId || '',
            sellerName,
            sellerRating,
            description: carData.description || '',
            features: carData.features || [],
            condition: carData.condition || '',
            status: carData.status || '',
            views: carData.views || 0,
            createdAt: ((_d = carData.createdAt) === null || _d === void 0 ? void 0 : _d.toMillis()) || Date.now(),
            updatedAt: ((_e = carData.updatedAt) === null || _e === void 0 ? void 0 : _e.toMillis()) || Date.now()
        };
        console.log(`Syncing car ${carId} to Algolia:`, {
            make: indexObject.make,
            model: indexObject.model,
            price: indexObject.price,
            region: indexObject.region
        });
        // Save to Algolia
        // await index.saveObject(indexObject);
        // For now, just log the object (Algolia not configured yet)
        console.log(`Would save to Algolia:`, JSON.stringify(indexObject).substring(0, 200));
        return { success: true, carId, action: 'indexed' };
    }
    catch (error) {
        console.error(`Error syncing car ${carId} to Algolia:`, error);
        return null;
    }
});
/**
 * Bulk re-index all active cars to Algolia
 * Callable function for admin use
 */
exports.reindexAllCars = functions.https.onCall(async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can reindex');
    }
    try {
        // Get all active cars
        const carsSnapshot = await admin.firestore()
            .collection('cars')
            .where('status', '==', 'active')
            .get();
        console.log(`Found ${carsSnapshot.size} active cars to reindex`);
        // In production, would batch index to Algolia here
        // const objects = carsSnapshot.docs.map(doc => ({ objectID: doc.id, ...doc.data() }));
        // await index.saveObjects(objects);
        return {
            success: true,
            totalCars: carsSnapshot.size,
            message: `Would reindex ${carsSnapshot.size} cars to Algolia`
        };
    }
    catch (error) {
        console.error('Error reindexing cars:', error);
        throw new functions.https.HttpsError('internal', 'Failed to reindex cars', error.message);
    }
});
//# sourceMappingURL=sync-to-algolia.js.map