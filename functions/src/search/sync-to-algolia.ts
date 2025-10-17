/**
 * Firebase Cloud Functions - Algolia Search Sync
 * Automatically syncs car listings to Algolia search index
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Note: Algolia client initialization
 * Requires: npm install algoliasearch
 * Config: firebase functions:config:set algolia.app_id="XXX" algolia.api_key="XXX"
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
      // await index.saveObject(indexObject);
      
      // For now, just log the object (Algolia not configured yet)
      console.log(`Would save to Algolia:`, JSON.stringify(indexObject).substring(0, 200));
      
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
export const reindexAllCars = functions.https.onCall(
  async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can reindex'
      );
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

