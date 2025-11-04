/**
 * Firebase Cloud Functions - Algolia Search Sync
 * Automatically syncs car listings to Algolia search index
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

/**
 * Note: Algolia client initialization
 * Requires: npm install algoliasearch (within functions/)
 * Config options (choose one):
 *  A) Firebase Functions config:
 *     firebase functions:config:set algolia.app_id="<APP_ID>" algolia.api_key="<ADMIN_KEY>" algolia.index="cars_bg"
 *  B) Environment variables (emulator/local):
 *     ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY, ALGOLIA_INDEX_NAME
 */

interface CarIndexObject {
  objectID: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  vehicleType: string;
  bodyType: string;
  color: string;
  city: string;
  region: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  description: string;
  features: string[];
  condition: string;
  status: string;
  views: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Syncs car document to Algolia search index
 * Triggers on create, update, or delete
 */
export const syncCarToAlgolia = functions.firestore
  .document('cars/{carId}')
  .onWrite(async (change, context) => {
    const carId = context.params.carId;
    
    try {
      const index = getAlgoliaIndex();
      if (!index) {
        console.warn('Algolia not configured. Skipping sync for car:', carId);
        return null;
      }
      
      // Handle deletion
      if (!change.after.exists) {
        console.log(`Car ${carId} deleted, removing from Algolia index`);
        await index.deleteObject(carId);
        return null;
      }
      
      // Get car data
  const carData = change.after.data() as FirebaseFirestore.DocumentData | undefined;
      
      // Skip if not active (don't index inactive cars)
      if (!carData || carData.status !== 'active') {
        console.log(`Car ${carId} not active, ensuring removal from Algolia`);
        await index.deleteObject(carId); // Remove from index if exists
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
          sellerName = sellerData?.displayName || sellerData?.businessName || 'Unknown';
        }
        
        // Get seller rating
        const sellerStatsDoc = await admin.firestore()
          .collection('sellers')
          .doc(carData.sellerId)
          .get();
        
        if (sellerStatsDoc.exists) {
          sellerRating = sellerStatsDoc.data()?.averageRating || 0;
        }
      } catch (error) {
        console.error('Error fetching seller info:', error);
      }
      
      // Build search index object
      const indexObject: CarIndexObject = {
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
        city: carData.location?.city || '',
        region: carData.location?.region || carData.region || '',
        sellerId: carData.sellerId || '',
        sellerName,
        sellerRating,
        description: carData.description || '',
        features: carData.features || [],
        condition: carData.condition || '',
        status: carData.status || '',
        views: carData.views || 0,
        createdAt: carData.createdAt?.toMillis() || Date.now(),
        updatedAt: carData.updatedAt?.toMillis() || Date.now()
      };
      
      console.log(`Syncing car ${carId} to Algolia:`, {
        make: indexObject.make,
        model: indexObject.model,
        price: indexObject.price,
        region: indexObject.region
      });
      
  // Save to Algolia
  await index.saveObject(indexObject);
      
      return { success: true, carId, action: 'indexed' };
      
    } catch (error) {
      console.error(`Error syncing car ${carId} to Algolia:`, error);
      return null;
    }
  });

/**
 * Bulk re-index all active cars to Algolia
 * Callable function for admin use
 */
export const reindexAllCars = functions.region('europe-west1').https.onCall(
  async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can reindex'
      );
    }
    
    try {
      const index = getAlgoliaIndex();
      if (!index) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Algolia is not configured (missing app_id/api_key/index).'
        );
      }
      // Get all active cars
      const carsSnapshot = await admin.firestore()
        .collection('cars')
        .where('status', '==', 'active')
        .get();
      
      console.log(`Found ${carsSnapshot.size} active cars to reindex`);
      
      const objects: CarIndexObject[] = carsSnapshot.docs.map(doc => {
        const carData = doc.data() as any;
        return {
          objectID: doc.id,
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
          city: carData.location?.city || '',
          region: carData.location?.region || carData.region || '',
          sellerId: carData.sellerId || '',
          sellerName: carData.sellerName || 'Unknown',
          sellerRating: carData.sellerRating || 0,
          description: carData.description || '',
          features: carData.features || [],
          condition: carData.condition || '',
          status: carData.status || '',
          views: carData.views || 0,
          createdAt: carData.createdAt?.toMillis?.() || Date.now(),
          updatedAt: carData.updatedAt?.toMillis?.() || Date.now()
        };
      });

      // Batch in chunks to avoid payload limits
      const chunkSize = 1000;
      for (let i = 0; i < objects.length; i += chunkSize) {
        const chunk = objects.slice(i, i + chunkSize);
        await index.saveObjects(chunk);
        console.log(`Indexed ${Math.min(i + chunkSize, objects.length)} / ${objects.length}`);
      }

      return {
        success: true,
        totalCars: carsSnapshot.size,
        message: `Reindexed ${carsSnapshot.size} cars to Algolia`
      };
      
    } catch (error: any) {
      console.error('Error reindexing cars:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to reindex cars',
        error.message
      );
    }
  }
);

/**
 * Helper: Initialize Algolia index using Functions config or env vars
 */
function getAlgoliaIndex(): any | null {
  try {
    // Prefer Functions config
    const cfg = functions.config && (functions.config() as any);
    const appId: string = cfg?.algolia?.app_id || process.env.ALGOLIA_APP_ID || process.env.ALGOLIA_APPID || '';
    const adminKey: string = cfg?.algolia?.api_key || process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_API_KEY || '';
    const indexName: string = cfg?.algolia?.index || process.env.ALGOLIA_INDEX_NAME || 'cars_bg';

    if (!appId || !adminKey) {
      console.warn('Algolia credentials missing');
      return null;
    }

  const client = (algoliasearch as any)(appId, adminKey);
    return client.initIndex(indexName);
  } catch (e) {
    console.warn('Failed to initialize Algolia client', e);
    return null;
  }
}

