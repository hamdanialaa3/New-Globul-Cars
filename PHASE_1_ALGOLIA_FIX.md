# المرحلة 1 - يوم 1: إصلاح Algolia Sync

## المهمة 1.1: إنشاء Cloud Functions موحدة لجميع Collections

### الكود المطلوب

#### ملف: `functions/src/search/sync-all-collections-to-algolia.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

// Algolia configuration
const ALGOLIA_APP_ID = functions.config().algolia?.app_id || process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = functions.config().algolia?.admin_key || process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_NAME = 'cars_bg';

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

// ✅ COMPLETE LIST: All 7 collections
const VEHICLE_COLLECTIONS = [
  'cars',           // Legacy collection
  'passenger_cars', // Personal cars
  'suvs',           // SUVs/Jeeps
  'vans',           // Vans/Cargo
  'motorcycles',    // Motorcycles
  'trucks',         // Trucks
  'buses'           // Buses
];

/**
 * Transform Firestore document to Algolia object
 */
function transformToAlgoliaObject(
  carData: any,
  carId: string,
  collectionName: string
): any {
  // Ensure isActive and isSold have values
  const isActive = carData.isActive !== undefined 
    ? carData.isActive 
    : carData.status === 'active';
  
  const isSold = carData.isSold !== undefined
    ? carData.isSold
    : carData.status === 'sold';

  return {
    objectID: carId,
    
    // ✅ CRITICAL: Add collection info for filtering
    collection: collectionName,
    vehicleType: carData.vehicleType || collectionName.replace(/_/g, '-'),
    
    // Basic info
    make: carData.make || '',
    model: carData.model || '',
    year: carData.year || 0,
    price: carData.price || 0,
    currency: carData.currency || 'EUR',
    
    // Status
    status: carData.status || 'active',
    isActive: isActive,
    isSold: isSold,
    
    // Location (for geo-search)
    _geoloc: carData.locationData?.coordinates ? {
      lat: carData.locationData.coordinates.lat,
      lng: carData.locationData.coordinates.lng
    } : undefined,
    
    region: carData.region || carData.locationData?.region || '',
    city: carData.city || carData.locationData?.cityName?.bg || '',
    
    // Details
    fuelType: carData.fuelType || '',
    transmission: carData.transmission || '',
    mileage: carData.mileage || 0,
    power: carData.power || 0,
    
    // Seller
    sellerType: carData.sellerType || 'private',
    sellerName: carData.sellerName || '',
    
    // Images
    images: carData.images || [],
    thumbnail: carData.images?.[0] || '',
    
    // Timestamps (convert to Unix timestamp for Algolia)
    createdAt: carData.createdAt?._seconds 
      ? carData.createdAt._seconds 
      : Math.floor(Date.now() / 1000),
    
    updatedAt: carData.updatedAt?._seconds
      ? carData.updatedAt._seconds
      : Math.floor(Date.now() / 1000),
    
    // Additional fields for search
    description: carData.description || '',
    features: carData.features || [],
    
    // Searchable string (for full-text search)
    searchableText: `${carData.make} ${carData.model} ${carData.year} ${carData.fuelType} ${carData.transmission}`.toLowerCase()
  };
}

/**
 * Generic sync function for any collection
 */
async function syncToAlgolia(
  change: functions.Change<functions.firestore.DocumentSnapshot>,
  context: functions.EventContext,
  collectionName: string
): Promise<void> {
  const carId = context.params.carId;
  
  try {
    // ✅ DELETE: If document was deleted
    if (!change.after.exists) {
      console.log(`🗑️ Deleting ${carId} from Algolia (collection: ${collectionName})`);
      await algoliaIndex.deleteObject(carId);
      console.log(`✅ Deleted ${carId} from Algolia`);
      return;
    }
    
    const carData = change.after.data();
    
    if (!carData) {
      console.warn(`⚠️ No data found for ${carId} in ${collectionName}`);
      return;
    }
    
    // ✅ UPDATE/CREATE: Transform and save to Algolia
    const algoliaObject = transformToAlgoliaObject(carData, carId, collectionName);
    
    console.log(`📤 Syncing ${carId} to Algolia (collection: ${collectionName}):`, {
      make: algoliaObject.make,
      model: algoliaObject.model,
      year: algoliaObject.year,
      isActive: algoliaObject.isActive,
      isSold: algoliaObject.isSold
    });
    
    await algoliaIndex.saveObject(algoliaObject);
    
    console.log(`✅ Successfully synced ${carId} to Algolia`);
    
  } catch (error) {
    console.error(`❌ Error syncing ${carId} from ${collectionName} to Algolia:`, error);
    throw error;
  }
}

// ✅ GENERATE CLOUD FUNCTIONS FOR ALL COLLECTIONS
const exportedFunctions: { [key: string]: functions.CloudFunction<functions.Change<functions.firestore.DocumentSnapshot>> } = {};

VEHICLE_COLLECTIONS.forEach(collectionName => {
  // Convert collection name to camelCase for function name
  // e.g., 'passenger_cars' → 'syncPassengerCarsToAlgolia'
  const functionName = `sync${
    collectionName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  }ToAlgolia`;
  
  console.log(`📋 Registering Cloud Function: ${functionName} for collection: ${collectionName}`);
  
  exportedFunctions[functionName] = functions
    .region('europe-west1')
    .firestore
    .document(`${collectionName}/{carId}`)
    .onWrite(async (change, context) => {
      return syncToAlgolia(change, context, collectionName);
    });
});

// Export all functions
export const syncCarsToAlgolia = exportedFunctions.syncCarsToAlgolia;
export const syncPassengerCarsToAlgolia = exportedFunctions.syncPassengerCarsToAlgolia;
export const syncSuvsToAlgolia = exportedFunctions.syncSuvsToAlgolia;
export const syncVansToAlgolia = exportedFunctions.syncVansToAlgolia;
export const syncMotorcyclesToAlgolia = exportedFunctions.syncMotorcyclesToAlgolia;
export const syncTrucksToAlgolia = exportedFunctions.syncTrucksToAlgolia;
export const syncBusesToAlgolia = exportedFunctions.syncBusesToAlgolia;

console.log('✅ All Algolia sync functions registered:', Object.keys(exportedFunctions));
```

#### ملف: `functions/src/index.ts` (تحديث)

```typescript
// ... existing imports ...

// ✅ NEW: Import all Algolia sync functions
import {
  syncCarsToAlgolia,
  syncPassengerCarsToAlgolia,
  syncSuvsToAlgolia,
  syncVansToAlgolia,
  syncMotorcyclesToAlgolia,
  syncTrucksToAlgolia,
  syncBusesToAlgolia
} from './search/sync-all-collections-to-algolia';

// ✅ Export all Algolia sync functions
export {
  syncCarsToAlgolia,
  syncPassengerCarsToAlgolia,
  syncSuvsToAlgolia,
  syncVansToAlgolia,
  syncMotorcyclesToAlgolia,
  syncTrucksToAlgolia,
  syncBusesToAlgolia
};

// ... rest of exports ...
```

### خطوات التنفيذ

#### 1. إنشاء الملف الجديد
```bash
cd functions/src/search
# احذف الملف القديم (اعمل backup أولاً)
mv sync-to-algolia.ts sync-to-algolia.ts.backup
# أنشئ الملف الجديد
# (انسخ الكود أعلاه)
```

#### 2. تحديث index.ts
```bash
# افتح functions/src/index.ts
# أضف الـ imports والـ exports كما في الكود أعلاه
```

#### 3. Deploy
```bash
cd functions
npm run build
firebase deploy --only functions
```

### التحقق من النجاح

#### في Firebase Console:
```
https://console.firebase.google.com
→ Functions
→ يجب أن ترى 7 functions:
  ✅ syncCarsToAlgolia
  ✅ syncPassengerCarsToAlgolia
  ✅ syncSuvsToAlgolia
  ✅ syncVansToAlgolia
  ✅ syncMotorcyclesToAlgolia
  ✅ syncTrucksToAlgolia
  ✅ syncBusesToAlgolia
```

#### اختبار:
```bash
# أضف سيارة جديدة إلى passenger_cars
# تحقق من Algolia Dashboard
# يجب أن تظهر السيارة في Index
```

### الوقت المتوقع
- إنشاء الملف: 30 دقيقة
- التعديلات: 30 دقيقة
- Deploy والاختبار: 1 ساعة
- **المجموع: 2 ساعة**

---

## المهمة 1.2: إعادة فهرسة البيانات الموجودة (Bulk Sync)

### الكود المطلوب

#### ملف: `functions/src/search/bulk-sync-to-algolia.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

const ALGOLIA_APP_ID = functions.config().algolia?.app_id || process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = functions.config().algolia?.admin_key || process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_NAME = 'cars_bg';

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

const VEHICLE_COLLECTIONS = [
  'cars',
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses'
];

/**
 * Bulk sync all cars from all collections to Algolia
 * استدعاء: POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/bulkSyncToAlgolia
 */
export const bulkSyncToAlgolia = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540, // 9 minutes (max allowed)
    memory: '2GB'
  })
  .https.onRequest(async (req, res) => {
    try {
      console.log('🚀 Starting bulk sync to Algolia...');
      
      let totalSynced = 0;
      let totalErrors = 0;
      const results: any = {};
      
      // Loop through all collections
      for (const collectionName of VEHICLE_COLLECTIONS) {
        try {
          console.log(`📦 Syncing collection: ${collectionName}...`);
          
          const snapshot = await admin.firestore()
            .collection(collectionName)
            .get();
          
          console.log(`  Found ${snapshot.size} documents in ${collectionName}`);
          
          if (snapshot.empty) {
            results[collectionName] = { synced: 0, errors: 0 };
            continue;
          }
          
          // Prepare batch for Algolia (max 1000 per batch)
          const batch: any[] = [];
          let synced = 0;
          let errors = 0;
          
          snapshot.docs.forEach(doc => {
            try {
              const carData = doc.data();
              const carId = doc.id;
              
              // Transform to Algolia object (same as sync function)
              const algoliaObject = {
                objectID: carId,
                collection: collectionName,
                vehicleType: carData.vehicleType || collectionName.replace(/_/g, '-'),
                make: carData.make || '',
                model: carData.model || '',
                year: carData.year || 0,
                price: carData.price || 0,
                currency: carData.currency || 'EUR',
                status: carData.status || 'active',
                isActive: carData.isActive !== undefined 
                  ? carData.isActive 
                  : carData.status === 'active',
                isSold: carData.isSold !== undefined
                  ? carData.isSold
                  : carData.status === 'sold',
                _geoloc: carData.locationData?.coordinates ? {
                  lat: carData.locationData.coordinates.lat,
                  lng: carData.locationData.coordinates.lng
                } : undefined,
                region: carData.region || carData.locationData?.region || '',
                city: carData.city || carData.locationData?.cityName?.bg || '',
                fuelType: carData.fuelType || '',
                transmission: carData.transmission || '',
                mileage: carData.mileage || 0,
                power: carData.power || 0,
                sellerType: carData.sellerType || 'private',
                sellerName: carData.sellerName || '',
                images: carData.images || [],
                thumbnail: carData.images?.[0] || '',
                createdAt: carData.createdAt?._seconds 
                  ? carData.createdAt._seconds 
                  : Math.floor(Date.now() / 1000),
                updatedAt: carData.updatedAt?._seconds
                  ? carData.updatedAt._seconds
                  : Math.floor(Date.now() / 1000),
                description: carData.description || '',
                features: carData.features || [],
                searchableText: `${carData.make} ${carData.model} ${carData.year} ${carData.fuelType} ${carData.transmission}`.toLowerCase()
              };
              
              batch.push(algoliaObject);
              synced++;
              
            } catch (error) {
              console.error(`  ❌ Error preparing ${doc.id}:`, error);
              errors++;
            }
          });
          
          // Send batch to Algolia
          if (batch.length > 0) {
            console.log(`  📤 Sending ${batch.length} objects to Algolia...`);
            await algoliaIndex.saveObjects(batch);
            console.log(`  ✅ Successfully synced ${batch.length} objects`);
          }
          
          totalSynced += synced;
          totalErrors += errors;
          
          results[collectionName] = { synced, errors };
          
        } catch (error) {
          console.error(`❌ Error syncing collection ${collectionName}:`, error);
          results[collectionName] = { error: error.message };
        }
      }
      
      const response = {
        success: true,
        totalSynced,
        totalErrors,
        results,
        message: `Successfully synced ${totalSynced} cars from ${VEHICLE_COLLECTIONS.length} collections`
      };
      
      console.log('✅ Bulk sync completed:', response);
      
      res.status(200).json(response);
      
    } catch (error) {
      console.error('❌ Bulk sync failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
```

#### إضافة إلى `functions/src/index.ts`:
```typescript
import { bulkSyncToAlgolia } from './search/bulk-sync-to-algolia';

export { bulkSyncToAlgolia };
```

### Deploy والتنفيذ

```bash
# 1. Deploy الـ function
cd functions
npm run build
firebase deploy --only functions:bulkSyncToAlgolia

# 2. تنفيذ الـ bulk sync (مرة واحدة)
# احصل على الـ URL من Firebase Console
curl -X POST https://europe-west1-YOUR_PROJECT.cloudfunctions.net/bulkSyncToAlgolia

# أو استخدم Firebase CLI:
firebase functions:config:get
```

### النتيجة المتوقعة

```json
{
  "success": true,
  "totalSynced": 3500,
  "totalErrors": 0,
  "results": {
    "cars": { "synced": 500, "errors": 0 },
    "passenger_cars": { "synced": 2000, "errors": 0 },
    "suvs": { "synced": 600, "errors": 0 },
    "vans": { "synced": 200, "errors": 0 },
    "motorcycles": { "synced": 100, "errors": 0 },
    "trucks": { "synced": 80, "errors": 0 },
    "buses": { "synced": 20, "errors": 0 }
  },
  "message": "Successfully synced 3500 cars from 7 collections"
}
```

### الوقت المتوقع
- إنشاء الملف: 45 دقيقة
- Deploy: 15 دقيقة
- التنفيذ والتحقق: 30 دقيقة
- **المجموع: 1.5 ساعة**

---

## ✅ اليوم 1 - Checklist

- [ ] إنشاء `sync-all-collections-to-algolia.ts`
- [ ] تحديث `functions/src/index.ts`
- [ ] Deploy الـ 7 Cloud Functions
- [ ] التحقق من Firebase Console
- [ ] إنشاء `bulk-sync-to-algolia.ts`
- [ ] Deploy bulk sync function
- [ ] تنفيذ bulk sync مرة واحدة
- [ ] التحقق من Algolia Dashboard (يجب أن تكون 100% من السيارات موجودة)
- [ ] اختبار البحث في التطبيق

**الوقت الإجمالي: 4 ساعات**
**النتيجة: 100% Algolia coverage** ✅
