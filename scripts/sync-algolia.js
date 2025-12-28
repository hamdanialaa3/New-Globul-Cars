/**
 * 🚀 Algolia Data Sync Script
 * ===========================
 * Syncs all cars from Firestore to Algolia for ultra-fast search
 * 
 * Usage:
 * 1. Make sure .env.local has ALGOLIA keys configured
 * 2. Run: node scripts/sync-algolia.js
 * 3. Wait for confirmation message
 * 
 * ⚠️ IMPORTANT: 
 * - This script uses ADMIN keys - keep them secure
 * - Run this from backend/server environment only
 * - DO NOT run this in frontend code
 */

const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');
require('dotenv').config({ path: '.env.local' });

// ============================================
// CONFIGURATION
// ============================================
const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID || 'RTGDK12KTJ';
const ALGOLIA_ADMIN_KEY = '47f0015ced4e86add8acc2e35ea01395'; // Write API Key
const ALGOLIA_INDEX_NAME = process.env.REACT_APP_ALGOLIA_INDEX_NAME || 'cars';

// Collections to sync (all vehicle types)
const COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses'
];

// ============================================
// INITIALIZE SERVICES
// ============================================
console.log('🔧 Initializing Firebase Admin...');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')
    ),
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

console.log('🔧 Initializing Algolia Client...');
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

// ============================================
// HELPER FUNCTIONS
// ============================================
function transformCarToAlgoliaRecord(car, collectionName) {
  return {
    objectID: car.id, // Algolia requires objectID
    // Basic Info
    id: car.id,
    make: car.make || '',
    model: car.model || '',
    year: car.year || 0,
    price: car.price || 0,
    currency: car.currency || 'EUR',
    
    // Location
    location: car.location || '',
    city: car.city || '',
    region: car.region || '',
    _geoloc: car._geoloc || null, // For geo-search
    
    // Technical Specs
    fuelType: car.fuelType || '',
    transmission: car.transmission || '',
    mileage: car.mileage || 0,
    engineSize: car.engineSize || 0,
    horsePower: car.horsePower || 0,
    color: car.color || '',
    
    // Category
    vehicleType: collectionName.replace('_', ' '),
    category: car.category || collectionName,
    
    // Seller Info
    sellerId: car.sellerId || '',
    sellerName: car.sellerName || '',
    sellerType: car.sellerType || 'private',
    sellerNumericId: car.sellerNumericId || 0,
    
    // Numeric IDs (for routing)
    carNumericId: car.carNumericId || 0,
    
    // Status
    isActive: car.isActive !== false,
    status: car.status || 'active',
    
    // Images
    images: car.images || [],
    mainImage: car.images?.[0] || '',
    
    // Timestamps
    createdAt: car.createdAt?._seconds || Date.now() / 1000,
    updatedAt: car.updatedAt?._seconds || Date.now() / 1000,
    
    // Search Optimization
    searchableText: `${car.make} ${car.model} ${car.year} ${car.location} ${car.fuelType} ${car.transmission}`.toLowerCase()
  };
}

// ============================================
// MAIN SYNC FUNCTION
// ============================================
async function syncCollection(collectionName) {
  console.log(`\n📦 Syncing collection: ${collectionName}`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    const records = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const record = transformCarToAlgoliaRecord({ id: doc.id, ...data }, collectionName);
      records.push(record);
    });
    
    if (records.length === 0) {
      console.log(`   ⚠️  No documents found in ${collectionName}`);
      return { collection: collectionName, synced: 0 };
    }
    
    console.log(`   📝 Found ${records.length} documents`);
    console.log(`   ⬆️  Uploading to Algolia...`);
    
    const result = await algoliaIndex.saveObjects(records);
    
    console.log(`   ✅ Successfully synced ${records.length} records`);
    return { collection: collectionName, synced: records.length, objectIDs: result.objectIDs };
    
  } catch (error) {
    console.error(`   ❌ Error syncing ${collectionName}:`, error.message);
    return { collection: collectionName, synced: 0, error: error.message };
  }
}

async function syncAllCollections() {
  console.log('🚀 Starting Algolia Sync...');
  console.log('================================\n');
  
  const startTime = Date.now();
  const results = [];
  
  for (const collection of COLLECTIONS) {
    const result = await syncCollection(collection);
    results.push(result);
  }
  
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
  
  console.log('\n================================');
  console.log('📊 SYNC SUMMARY');
  console.log('================================');
  results.forEach(r => {
    const status = r.error ? '❌' : '✅';
    console.log(`${status} ${r.collection}: ${r.synced} records`);
    if (r.error) {
      console.log(`   Error: ${r.error}`);
    }
  });
  console.log('--------------------------------');
  console.log(`📈 Total: ${totalSynced} records synced`);
  console.log(`⏱️  Time: ${totalTime}s`);
  console.log('================================\n');
  
  // Configure index settings
  console.log('⚙️  Configuring Algolia index settings...');
  try {
    await algoliaIndex.setSettings({
      // Searchable attributes (ranked by importance)
      searchableAttributes: [
        'make',
        'model',
        'searchableText',
        'location',
        'city'
      ],
      
      // Attributes for faceting (filters)
      attributesForFaceting: [
        'make',
        'model',
        'year',
        'fuelType',
        'transmission',
        'vehicleType',
        'city',
        'region',
        'sellerType'
      ],
      
      // Custom ranking (after text relevance)
      customRanking: [
        'desc(year)',
        'asc(price)',
        'desc(createdAt)'
      ],
      
      // Typo tolerance
      typoTolerance: true,
      
      // Pagination
      hitsPerPage: 20,
      
      // Distinct by ID (no duplicates)
      distinct: true,
      attributeForDistinct: 'id'
    });
    console.log('✅ Index settings configured successfully\n');
  } catch (error) {
    console.error('❌ Error configuring index:', error.message);
  }
  
  console.log('🎉 Sync completed successfully!');
  console.log('🔍 You can now use ultra-fast search on /cars page');
  console.log('📊 View analytics at: https://www.algolia.com/apps/RTGDK12KTJ/dashboard\n');
}

// ============================================
// RUN SYNC
// ============================================
syncAllCollections()
  .then(() => {
    console.log('✅ All done! Exiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
