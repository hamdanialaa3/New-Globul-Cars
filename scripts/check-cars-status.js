/**
 * Check Cars Status Script
 * فحص حالة السيارات في Firestore
 * 
 * هذا السكريبت يتحقق من:
 * 1. السيارات الموجودة في جميع الـ collections
 * 2. حقول status, isActive, isSold
 * 3. يعرض تفاصيل كل سيارة
 */

const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const collections = [
  'cars',
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses'
];

async function checkCarsStatus() {
  console.log('🔍 Checking cars status in all collections...\n');
  
  let totalCars = 0;
  let activeCars = 0;
  let inactiveCars = 0;
  let missingStatusCars = 0;
  
  for (const collectionName of collections) {
    console.log(`\n📦 Collection: ${collectionName}`);
    console.log('━'.repeat(60));
    
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log('   ⚠️  No documents found');
      continue;
    }
    
    console.log(`   Found ${snapshot.size} documents\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      totalCars++;
      
      // Check status fields
      const status = data.status || 'N/A';
      const isActive = data.isActive;
      const isSold = data.isSold;
      
      // Determine if car should be visible
      const isVisible = (
        status === 'active' &&
        isActive !== false &&
        isSold !== true
      );
      
      if (isVisible) {
        activeCars++;
      } else {
        inactiveCars++;
      }
      
      if (!data.status) {
        missingStatusCars++;
      }
      
      // Display car info
      console.log(`   ${index + 1}. ${data.make || 'N/A'} ${data.model || 'N/A'} (${data.year || 'N/A'})`);
      console.log(`      ID: ${doc.id}`);
      console.log(`      status: ${status}`);
      console.log(`      isActive: ${isActive === undefined ? 'undefined' : isActive}`);
      console.log(`      isSold: ${isSold === undefined ? 'undefined' : isSold}`);
      console.log(`      region: ${data.region || 'N/A'}`);
      console.log(`      createdAt: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'N/A'}`);
      console.log(`      ✅ Visible in search: ${isVisible ? 'YES' : 'NO ❌'}`);
      
      if (!isVisible) {
        console.log(`      ⚠️  Reason: ${
          status !== 'active' ? 'status is not "active"' :
          isActive === false ? 'isActive is false' :
          isSold === true ? 'isSold is true' :
          'unknown'
        }`);
      }
      console.log('');
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Total cars: ${totalCars}`);
  console.log(`Active (visible): ${activeCars} ✅`);
  console.log(`Inactive (hidden): ${inactiveCars} ❌`);
  console.log(`Missing status field: ${missingStatusCars}`);
  console.log('');
  
  if (inactiveCars > 0) {
    console.log('⚠️  WARNING: Some cars are not visible in search!');
    console.log('');
    console.log('💡 To fix, run:');
    console.log('   node scripts/fix-cars-status.js');
  } else {
    console.log('✅ All cars are properly configured!');
  }
}

// Run the check
checkCarsStatus()
  .then(() => {
    console.log('\n✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

