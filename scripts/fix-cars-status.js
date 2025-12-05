/**
 * Fix Cars Status Script
 * إصلاح حالة السيارات في Firestore
 * 
 * هذا السكريبت:
 * 1. يبحث عن جميع السيارات في الـ 7 collections
 * 2. يضيف/يحدّث الحقول المفقودة:
 *    - status: 'active'
 *    - isActive: true
 *    - isSold: false
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

async function fixCarsStatus() {
  console.log('🔧 Fixing cars status in all collections...\n');
  
  let totalCars = 0;
  let fixedCars = 0;
  let skippedCars = 0;
  
  for (const collectionName of collections) {
    console.log(`\n📦 Processing: ${collectionName}`);
    console.log('━'.repeat(60));
    
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log('   ⚠️  No documents found');
      continue;
    }
    
    console.log(`   Found ${snapshot.size} documents\n`);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      totalCars++;
      
      const updates = {};
      let needsUpdate = false;
      
      // Check and fix status
      if (!data.status || data.status !== 'active') {
        updates.status = 'active';
        needsUpdate = true;
      }
      
      // Check and fix isActive
      if (data.isActive === undefined || data.isActive !== true) {
        updates.isActive = true;
        needsUpdate = true;
      }
      
      // Check and fix isSold
      if (data.isSold === undefined || data.isSold !== false) {
        updates.isSold = false;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        try {
          await db.collection(collectionName).doc(doc.id).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          fixedCars++;
          console.log(`   ✅ Fixed: ${data.make} ${data.model} (${doc.id})`);
          console.log(`      Updates: ${JSON.stringify(updates)}`);
        } catch (error) {
          console.error(`   ❌ Failed to fix: ${doc.id}`, error.message);
        }
      } else {
        skippedCars++;
        console.log(`   ⏭️  Skipped (already correct): ${data.make} ${data.model}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Total cars: ${totalCars}`);
  console.log(`Fixed: ${fixedCars} ✅`);
  console.log(`Skipped (already correct): ${skippedCars} ⏭️`);
  console.log('');
  
  if (fixedCars > 0) {
    console.log('🎉 Success! All cars are now properly configured.');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Test search: http://localhost:3000/cars');
    console.log('   2. Search for your car brand (e.g., "kia")');
    console.log('   3. Cars should now appear! ✨');
  } else {
    console.log('✅ All cars were already properly configured!');
  }
}

// Run the fix
fixCarsStatus()
  .then(() => {
    console.log('\n✅ Fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

