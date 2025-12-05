/**
 * Sync All 7 Collections to Algolia
 * Fixes: 14% coverage → 100% coverage
 * 
 * Collections:
 * 1. cars
 * 2. passenger_cars
 * 3. suvs
 * 4. vans
 * 5. motorcycles
 * 6. trucks
 * 7. buses
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

// Initialize Algolia
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || 'RTGDK12KTJ';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || '';

let algoliaClient: any = null;

if (ALGOLIA_ADMIN_KEY) {
  const { default: algoliasearchDefault } = require('algoliasearch');
  algoliaClient = algoliasearchDefault(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  console.log('✅ Algolia client initialized');
} else {
  console.warn('⚠️ ALGOLIA_ADMIN_KEY not set - Algolia sync disabled');
}

/**
 * Transform car data to Algolia format
 */
function transformCarForAlgolia(carId: string, carData: any, collectionName: string) {
  return {
    objectID: carId,
    
    // Collection metadata
    _collection: collectionName,
    _vehicleType: getVehicleType(collectionName),
    
    // Basic Info
    make: carData.make || '',
    model: carData.model || '',
    year: carData.year || 0,
    price: carData.price || 0,
    currency: carData.currency || 'EUR',
    
    // Technical Specs
    mileage: carData.mileage || 0,
    fuelType: carData.fuelType || carData.fuel || '',
    transmission: carData.transmission || '',
    bodyType: carData.bodyType || '',
    exteriorColor: carData.exteriorColor || carData.color || '',
    interiorColor: carData.interiorColor || '',
    power: carData.power || 0,
    engineSize: carData.engineSize || 0,
    doors: carData.doors || 0,
    seats: carData.seats || 0,
    
    // Condition & Status
    condition: carData.condition || 'used',
    status: carData.status || 'active',
    isActive: carData.isActive !== undefined ? carData.isActive : (carData.status === 'active'),
    isSold: carData.isSold || false,
    
    // Location
    region: carData.region || carData.locationData?.region || '',
    city: carData.city || carData.locationData?.cityName?.en || '',
    cityBg: carData.locationData?.cityName?.bg || '',
    postalCode: carData.locationData?.postalCode || '',
    
    // Seller Info
    sellerType: carData.sellerType || 'private',
    sellerName: carData.sellerName || '',
    sellerId: carData.sellerId || carData.userId || '',
    sellerPhone: carData.sellerPhone || '',
    
    // Images & Media
    images: carData.images || [],
    hasImages: Array.isArray(carData.images) && carData.images.length > 0,
    imageCount: Array.isArray(carData.images) ? carData.images.length : 0,
    hasVideo: Boolean(carData.videoUrl),
    videoUrl: carData.videoUrl || '',
    
    // Description
    description: carData.description || '',
    descriptionLength: (carData.description || '').length,
    
    // Features & Options
    features: carData.features || [],
    options: carData.options || [],
    equipment: carData.equipment || {},
    
    // Quality Score
    qualityScore: carData.qualityScore || 0,
    isVerified: carData.isVerified || false,
    isFeatured: carData.isFeatured || false,
    isPremium: carData.isPremium || false,
    
    // Timestamps
    createdAt: carData.createdAt?._seconds || carData.createdAt?.seconds || Date.now() / 1000,
    updatedAt: carData.updatedAt?._seconds || carData.updatedAt?.seconds || Date.now() / 1000,
    
    // Search optimization
    _tags: generateTags(carData, collectionName),
    searchableText: generateSearchableText(carData)
  };
}

/**
 * Get vehicle type from collection name
 */
function getVehicleType(collectionName: string): string {
  const typeMap: { [key: string]: string } = {
    'cars': 'car',
    'passenger_cars': 'passenger_car',
    'suvs': 'suv',
    'vans': 'van',
    'motorcycles': 'motorcycle',
    'trucks': 'truck',
    'buses': 'bus'
  };
  return typeMap[collectionName] || 'car';
}

/**
 * Generate tags for better search
 */
function generateTags(carData: any, collectionName: string): string[] {
  const tags: string[] = [];
  
  // Collection tag
  tags.push(collectionName);
  tags.push(getVehicleType(collectionName));
  
  // Make & Model
  if (carData.make) tags.push(carData.make.toLowerCase());
  if (carData.model) tags.push(carData.model.toLowerCase());
  
  // Fuel type
  if (carData.fuelType) tags.push(carData.fuelType.toLowerCase());
  if (carData.fuel) tags.push(carData.fuel.toLowerCase());
  
  // Transmission
  if (carData.transmission) tags.push(carData.transmission.toLowerCase());
  
  // Body type
  if (carData.bodyType) tags.push(carData.bodyType.toLowerCase());
  
  // Seller type
  if (carData.sellerType) tags.push(carData.sellerType);
  
  // Status tags
  if (carData.isActive) tags.push('active');
  if (carData.isSold) tags.push('sold');
  if (carData.isFeatured) tags.push('featured');
  if (carData.isPremium) tags.push('premium');
  if (carData.isVerified) tags.push('verified');
  
  return tags;
}

/**
 * Generate searchable text
 */
function generateSearchableText(carData: any): string {
  const parts: string[] = [];
  
  if (carData.year) parts.push(String(carData.year));
  if (carData.make) parts.push(carData.make);
  if (carData.model) parts.push(carData.model);
  if (carData.fuelType) parts.push(carData.fuelType);
  if (carData.fuel) parts.push(carData.fuel);
  if (carData.transmission) parts.push(carData.transmission);
  if (carData.bodyType) parts.push(carData.bodyType);
  if (carData.exteriorColor) parts.push(carData.exteriorColor);
  if (carData.color) parts.push(carData.color);
  if (carData.description) parts.push(carData.description);
  
  return parts.join(' ').toLowerCase();
}

/**
 * Create sync function for a specific collection
 */
function createSyncFunction(collectionName: string) {
  return functions
    .region('europe-west1')
    .firestore
    .document(`${collectionName}/{carId}`)
    .onWrite(async (change, context) => {
      if (!algoliaClient) {
        console.warn('⚠️ Algolia not configured - skipping sync');
        return null;
      }

      const carId = context.params.carId;
      const index = algoliaClient.initIndex(collectionName);

      console.log(`📊 Algolia Sync - ${collectionName}/${carId}`);

      // Document deleted
      if (!change.after.exists) {
        console.log(`🗑️ Deleting ${carId} from Algolia index: ${collectionName}`);
        try {
          await index.deleteObject(carId);
          console.log(`✅ Deleted ${carId} from ${collectionName}`);
          return null;
        } catch (error) {
          console.error(`❌ Error deleting ${carId}:`, error);
          throw error;
        }
      }

      // Document created or updated
      const carData = change.after.data();
      
      // Only sync active, non-sold cars
      if (carData.status !== 'active' || carData.isSold) {
        console.log(`⏭️ Skipping ${carId} - status: ${carData.status}, isSold: ${carData.isSold}`);
        
        // Remove from Algolia if exists
        try {
          await index.deleteObject(carId);
          console.log(`🗑️ Removed inactive car ${carId} from ${collectionName}`);
        } catch (error) {
          // Ignore errors if object doesn't exist
        }
        return null;
      }

      // Transform and save to Algolia
      const algoliaObject = transformCarForAlgolia(carId, carData, collectionName);
      
      console.log(`💾 Saving ${carId} to Algolia index: ${collectionName}`);
      console.log(`   Make: ${algoliaObject.make}, Model: ${algoliaObject.model}`);
      console.log(`   Year: ${algoliaObject.year}, Price: ${algoliaObject.price} ${algoliaObject.currency}`);
      
      try {
        await index.saveObject(algoliaObject);
        console.log(`✅ Synced ${carId} to ${collectionName} index`);
        return null;
      } catch (error) {
        console.error(`❌ Error syncing ${carId}:`, error);
        throw error;
      }
    });
}

// Export sync functions for all 7 collections
export const syncCarsToAlgolia = createSyncFunction('cars');
export const syncPassengerCarsToAlgolia = createSyncFunction('passenger_cars');
export const syncSuvsToAlgolia = createSyncFunction('suvs');
export const syncVansToAlgolia = createSyncFunction('vans');
export const syncMotorcyclesToAlgolia = createSyncFunction('motorcycles');
export const syncTrucksToAlgolia = createSyncFunction('trucks');
export const syncBusesToAlgolia = createSyncFunction('buses');

/**
 * Bulk sync function - re-index all existing data
 * Call this once to populate Algolia with existing Firestore data
 */
export const bulkSyncAllCollectionsToAlgolia = functions
  .region('europe-west1')
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onCall(async (data, context) => {
    // Require admin authentication
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can run bulk sync'
      );
    }

    if (!algoliaClient) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Algolia not configured'
      );
    }

    const collections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
    const results: any = {};

    console.log('🚀 Starting bulk sync for all 7 collections...');

    for (const collectionName of collections) {
      console.log(`\n📦 Processing collection: ${collectionName}`);
      
      const index = algoliaClient.initIndex(collectionName);
      const snapshot = await admin.firestore().collection(collectionName).get();
      
      console.log(`   Found ${snapshot.size} documents in ${collectionName}`);
      
      const objects: any[] = [];
      let activeCount = 0;
      let skippedCount = 0;

      snapshot.docs.forEach(doc => {
        const carData = doc.data();
        
        // Only sync active, non-sold cars
        if (carData.status === 'active' && !carData.isSold) {
          const algoliaObject = transformCarForAlgolia(doc.id, carData, collectionName);
          objects.push(algoliaObject);
          activeCount++;
        } else {
          skippedCount++;
        }
      });

      if (objects.length > 0) {
        console.log(`   💾 Saving ${objects.length} objects to Algolia...`);
        await index.saveObjects(objects);
        console.log(`   ✅ Synced ${activeCount} active cars to ${collectionName}`);
      } else {
        console.log(`   ⏭️ No active cars to sync in ${collectionName}`);
      }

      results[collectionName] = {
        total: snapshot.size,
        synced: activeCount,
        skipped: skippedCount
      };
    }

    const totalSynced = Object.values(results).reduce((sum: number, r: any) => sum + (r.synced || 0), 0) as number;
    const totalDocs = Object.values(results).reduce((sum: number, r: any) => sum + (r.total || 0), 0) as number;

    console.log(`\n✅ Bulk sync complete!`);
    console.log(`   Total documents: ${totalDocs}`);
    console.log(`   Total synced: ${totalSynced}`);
    console.log(`   Coverage: ${totalDocs > 0 ? ((totalSynced / totalDocs) * 100).toFixed(1) : 0}%`);

    return {
      success: true,
      results,
      summary: {
        totalDocuments: totalDocs,
        totalSynced: totalSynced,
        coverage: totalDocs > 0 ? ((totalSynced / totalDocs) * 100).toFixed(1) + '%' : '0%'
      }
    };
  });

/**
 * Clear all Algolia indices (use with caution!)
 */
export const clearAllAlgoliaIndices = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Require admin authentication
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can clear indices'
      );
    }

    if (!algoliaClient) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Algolia not configured'
      );
    }

    const collections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
    
    console.log('🗑️ Clearing all Algolia indices...');

    for (const collectionName of collections) {
      const index = algoliaClient.initIndex(collectionName);
      await index.clearObjects();
      console.log(`   ✅ Cleared ${collectionName} index`);
    }

    console.log('✅ All indices cleared');

    return {
      success: true,
      message: 'All Algolia indices cleared successfully'
    };
  });

console.log('✅ Algolia sync functions loaded for all 7 collections');
