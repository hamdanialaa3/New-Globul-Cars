/**
 * CLI Runner for Legacy Cars Migration
 * أداة سطر الأوامر لترحيل السيارات القديمة
 * 
 * Usage: node scripts/run-migration.js
 * الاستخدام: من terminal، شغّل الأمر أعلاه
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Vehicle collections
const VEHICLE_COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses',
  'cars'
];

async function migrateLegacyCars() {
  console.log('🚀 Starting legacy cars migration...\n');
  
  const stats = {
    totalScanned: 0,
    carsNeedingMigration: 0,
    carsSuccessfullyMigrated: 0,
    carsFailed: 0,
    errors: []
  };

  try {
    // Process each collection
    for (const collectionName of VEHICLE_COLLECTIONS) {
      console.log(`📂 Scanning collection: ${collectionName}`);
      await migrateCollection(collectionName, stats);
    }

    // Print final report
    printReport(stats);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function migrateCollection(collectionName, stats) {
  try {
    // Find cars without carNumericId
    const snapshot = await db.collection(collectionName)
      .where('carNumericId', '==', null)
      .get();
    
    stats.totalScanned += snapshot.size;

    if (snapshot.empty) {
      console.log(`  ✅ No cars need migration\n`);
      return;
    }

    console.log(`  Found ${snapshot.size} cars to migrate`);
    stats.carsNeedingMigration += snapshot.size;

    // Migrate in batches of 10
    const batchSize = 10;
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      await migrateBatch(collectionName, batch, stats);
    }

  } catch (error) {
    console.error(`  ❌ Error in ${collectionName}:`, error.message);
  }
}

async function migrateBatch(collectionName, docs, stats) {
  try {
    await db.runTransaction(async (transaction) => {
      // Get current counter
      const counterRef = db.collection('counters').doc('carNumericId');
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = counterDoc.exists ? counterDoc.data().count : 1000;

      // Assign numeric IDs
      for (const doc of docs) {
        currentCount++;
        const carRef = db.collection(collectionName).doc(doc.id);
        
        transaction.update(carRef, {
          carNumericId: currentCount,
          updatedAt: new Date(),
          migratedAt: new Date(),
          migrationVersion: '1.0'
        });

        console.log(`    ✅ Car ${doc.id} → #${currentCount}`);
      }

      // Update counter
      transaction.set(counterRef, { count: currentCount }, { merge: true });

      stats.carsSuccessfullyMigrated += docs.length;
    });

  } catch (error) {
    console.error(`    ❌ Batch failed:`, error.message);
    stats.carsFailed += docs.length;
    
    docs.forEach(doc => {
      stats.errors.push({
        carId: doc.id,
        error: error.message
      });
    });
  }
}

function printReport(stats) {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 MIGRATION REPORT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Total scanned:         ${stats.totalScanned}`);
  console.log(`Needed migration:      ${stats.carsNeedingMigration}`);
  console.log(`Successfully migrated: ${stats.carsSuccessfullyMigrated} ✅`);
  console.log(`Failed:                ${stats.carsFailed} ❌`);
  console.log('═══════════════════════════════════════════════════');
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️ ERRORS:');
    stats.errors.forEach(err => {
      console.log(`  - Car ${err.carId}: ${err.error}`);
    });
  }
  
  if (stats.carsSuccessfullyMigrated === stats.carsNeedingMigration) {
    console.log('\n🎉 Migration completed successfully!\n');
  } else {
    console.log('\n⚠️ Migration completed with errors. Please review.\n');
  }
}

// Run migration
migrateLegacyCars()
  .then(() => {
    console.log('✅ Script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
