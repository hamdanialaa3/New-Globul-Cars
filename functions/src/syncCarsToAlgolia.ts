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

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Algolia configuration from Firebase config
const ALGOLIA_APP_ID = functions.config().algolia?.app_id || process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = functions.config().algolia?.admin_key || process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_NAME = 'cars_bg_production';

// Initialize Algolia client (v4 API)
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

// All vehicle collections to monitor
const COLLECTIONS = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];

/**
 * Convert Firestore car document to Algolia record
 */
function carToAlgoliaRecord(carId: string, carData: any): any {
  return {
    objectID: carId,
    
    // Basic Info
    make: carData.make || '',
    model: carData.model || '',
    year: carData.year || 0,
    price: carData.price || 0,
    priceEUR: carData.currency === 'BGN' ? (carData.price || 0) / 1.95583 : (carData.price || 0),
    
    // Details
    fuelType: carData.fuelType || '',
    transmission: carData.transmission || '',
    bodyType: carData.bodyType || '',
    mileage: carData.mileage || 0,
    color: carData.color || carData.exteriorColor || '',
    
    // Location (for geo-search)
    _geoloc: {
      lat: carData.location?.lat || 42.6977, // Sofia coordinates as fallback
      lng: carData.location?.lng || 23.3219
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
    createdAt: carData.createdAt?._seconds || Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
    
    // Equipment (for filtering)
    safetyEquipment: carData.safetyEquipment || [],
    comfortEquipment: carData.comfortEquipment || [],
    infotainmentEquipment: carData.infotainmentEquipment || [],
    
    // Description for full-text search
    description: carData.description || '',
    
    // Image for display
    mainImageUrl: carData.images?.[0] || carData.mainImageUrl || ''
  };
}

/**
 * Sync car to Algolia on write (create/update/delete)
 * This creates separate functions for each collection
 */
export const syncPassengerCarsToAlgolia = functions.firestore
  .document('passenger_cars/{carId}')
  .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'passenger_cars');
  });

export const syncSuvsToAlgolia = functions.firestore
  .document('suvs/{carId}')
  .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'suvs');
  });

export const syncVansToAlgolia = functions.firestore
  .document('vans/{carId}')
  .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'vans');
  });

export const syncMotorcyclesToAlgolia = functions.firestore
  .document('motorcycles/{carId}')
  .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'motorcycles');
  });

export const syncTrucksToAlgolia = functions.firestore
  .document('trucks/{carId}')
  .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'trucks');
  });

export const syncBusesToAlgolia = functions.firestore
  .document('buses/{carId}')
  .onWrite(async (change, context) => {
    return syncCarHandler(change, context, 'buses');
  });

/**
 * Common handler for all sync operations
 */
async function syncCarHandler(
  change: functions.Change<functions.firestore.DocumentSnapshot>,
  context: functions.EventContext,
  collectionName: string
): Promise<void> {
  const carId = context.params.carId;
  const carData = change.after.exists ? change.after.data() : null;

  console.log(`[${collectionName}] Processing ${carId}`, {
    exists: change.after.exists,
    status: carData?.status,
    isActive: carData?.isActive
  });

  // DELETE: Car was deleted or became inactive
  if (!carData || carData.status !== 'active' || carData.isActive === false) {
    console.log(`[${collectionName}] Deleting ${carId} from Algolia`);
    try {
      await index.deleteObject(carId);
      console.log(`✅ [${collectionName}] Deleted ${carId} from Algolia`);
    } catch (error) {
      console.error(`❌ [${collectionName}] Failed to delete ${carId}:`, error);
      throw error;
    }
    return;
  }

  // CREATE/UPDATE: Sync to Algolia
  try {
    const record = carToAlgoliaRecord(carId, carData);
    record.collection = collectionName; // Add collection name for filtering
    
    console.log(`[${collectionName}] Syncing ${carId} to Algolia:`, {
      make: record.make,
      model: record.model,
      year: record.year,
      price: record.price
    });
    
    await index.saveObject(record);
    console.log(`✅ [${collectionName}] Synced ${carId} to Algolia`);
  } catch (error) {
    console.error(`❌ [${collectionName}] Failed to sync ${carId}:`, error);
    throw error;
  }
}

/**
 * Batch sync all cars (run manually when needed)
 * Usage: firebase functions:call batchSyncAllCarsToAlgolia
 */
export const batchSyncAllCarsToAlgolia = functions.https.onCall(async (data, context) => {
  // Require authentication and admin role
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin');
  }

  console.log('🚀 Starting batch sync of all cars to Algolia...');
  
  let totalSynced = 0;
  let totalErrors = 0;

  for (const collectionName of COLLECTIONS) {
    try {
      console.log(`📦 Syncing collection: ${collectionName}`);
      
      const snapshot = await admin.firestore()
        .collection(collectionName)
        .where('status', '==', 'active')
        .get();

      const records = snapshot.docs.map(doc => {
        const record = carToAlgoliaRecord(doc.id, doc.data());
        record.collection = collectionName;
        return record;
      });

      if (records.length > 0) {
        await index.saveObjects(records);
        totalSynced += records.length;
        console.log(`✅ [${collectionName}] Synced ${records.length} cars`);
      }
    } catch (error) {
      totalErrors++;
      console.error(`❌ [${collectionName}] Batch sync failed:`, error);
    }
  }

  const result = {
    success: true,
    totalSynced,
    totalErrors,
    collections: COLLECTIONS.length,
    timestamp: new Date().toISOString()
  };

  console.log('🎉 Batch sync completed:', result);
  return result;
});
