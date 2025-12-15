// scripts/migration/assign-numeric-ids-cars-cli.js
// 🔢 Migration Script: Assign numeric IDs to existing cars (using Firebase CLI)
// 
// Purpose: Backfill numeric IDs for all existing cars in Firestore
// Safety: Transaction-safe, idempotent, resumable
// 
// Usage:
// node scripts/migration/assign-numeric-ids-cars-cli.js

const admin = require('firebase-admin');

// Initialize Firebase Admin with default credentials (uses Firebase CLI auth)
admin.initializeApp({
  projectId: 'fire-new-globul',
});

const db = admin.firestore();

/**
 * Get next car numeric ID for a specific seller (transaction-safe)
 */
async function getNextCarNumericId(sellerUid) {
  const counterRef = db.collection('counters').doc(`cars_${sellerUid}`);

  const result = await db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let currentCount = 0;
    if (counterDoc.exists) {
      currentCount = counterDoc.data()?.count || 0;
    }

    const newCount = currentCount + 1;

    if (counterDoc.exists) {
      transaction.update(counterRef, {
        count: newCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      transaction.set(counterRef, {
        count: newCount,
        sellerId: sellerUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return newCount;
  });

  return result;
}

/**
 * Get user's numeric ID by Firebase UID
 */
async function getUserNumericId(firebaseUid) {
  try {
    const userDoc = await db.collection('users').doc(firebaseUid).get();
    
    if (!userDoc.exists) {
      throw new Error(`User ${firebaseUid} not found`);
    }

    const numericId = userDoc.data()?.numericId;
    
    if (!numericId) {
      throw new Error(`User ${firebaseUid} doesn't have numericId yet. Run user migration first!`);
    }

    return numericId;
  } catch (error) {
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrateCarsNumericIds() {
  console.log('🚗 Starting car numeric ID migration...\n');

  try {
    // Get all cars (check for those without numeric ID)
    const carsSnapshot = await db.collection('cars').get();

    if (carsSnapshot.empty) {
      console.log('⚠️  No cars found in database!');
      return;
    }

    console.log(`📊 Found ${carsSnapshot.size} total cars\n`);

    // Filter cars without numeric ID
    const carsWithoutId = [];
    carsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.numericId) {
        carsWithoutId.push({ id: doc.id, data });
      }
    });

    if (carsWithoutId.length === 0) {
      console.log('✅ All cars already have numeric IDs!');
      return;
    }

    console.log(`📊 Found ${carsWithoutId.length} cars without numeric IDs\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Process cars in batches (avoid quota limits)
    const BATCH_SIZE = 50;

    for (let i = 0; i < carsWithoutId.length; i += BATCH_SIZE) {
      const batch = carsWithoutId.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(carsWithoutId.length / BATCH_SIZE)}`);
      console.log(`   Cars ${i + 1} to ${Math.min(i + BATCH_SIZE, carsWithoutId.length)} of ${carsWithoutId.length}`);

      // Process batch in parallel
      const promises = batch.map(async (car) => {
        const carId = car.id;
        const carData = car.data;

        try {
          // Double-check (safety)
          if (carData.numericId) {
            console.log(`⏭️  Skipping car ${carId} (already has numericId: ${carData.numericId})`);
            return;
          }

          // Get seller info
          const sellerId = carData.sellerId || carData.userId;
          
          if (!sellerId) {
            throw new Error('Car has no sellerId or userId');
          }

          // Get seller's numeric ID
          let sellerNumericId;
          try {
            sellerNumericId = await getUserNumericId(sellerId);
          } catch (error) {
            skippedCount++;
            console.log(`⏭️  Skipping car ${carId.substring(0, 8)}... (seller ${sellerId.substring(0, 8)}... doesn't have numericId yet)`);
            return;
          }

          // Get next car numeric ID for this seller
          const numericId = await getNextCarNumericId(sellerId);

          // Update car document
          await db.collection('cars').doc(carId).update({
            numericId,
            sellerNumericId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          successCount++;
          console.log(`✅ Car ${carId.substring(0, 8)}... → numericId: ${numericId}, sellerNumericId: ${sellerNumericId}`);
        } catch (error) {
          errorCount++;
          const errorMessage = error?.message || String(error);
          errors.push({ carId, error: errorMessage });
          console.error(`❌ Failed to assign numeric ID to car ${carId}: ${errorMessage}`);
        }
      });

      await Promise.all(promises);

      // Add delay between batches to avoid rate limits
      if (i + BATCH_SIZE < carsWithoutId.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successfully assigned: ${successCount} cars`);
    console.log(`⏭️  Skipped (seller needs numericId first): ${skippedCount} cars`);
    console.log(`❌ Failed: ${errorCount} cars`);
    console.log(`📊 Total processed: ${successCount + errorCount + skippedCount} cars`);
    console.log('='.repeat(60));

    if (skippedCount > 0) {
      console.log('\n⚠️  Some cars were skipped because their sellers don\'t have numericId yet.');
      console.log('   Run the user migration script first: node scripts/migration/assign-numeric-ids-users-cli.js');
    }

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(({ carId, error }) => {
        console.log(`   - Car ${carId}: ${error}`);
      });
    }

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close admin app
    await admin.app().delete();
  }
}

// Run migration
migrateCarsNumericIds()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
