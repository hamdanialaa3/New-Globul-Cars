// scripts/migration/assign-numeric-ids-cars.ts
// 🔢 Migration Script: Assign numeric IDs to existing cars
// 
// Purpose: Backfill numeric IDs for all existing cars in Firestore
// Safety: Transaction-safe, idempotent, resumable
// Hierarchical: Each seller has independent car numbering
// 
// Usage:
// npm run migrate:cars
// 
// Or:
// npx ts-node scripts/migration/assign-numeric-ids-cars.ts

import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require(path.resolve(__dirname, '../../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fire-new-globul',
});

const db = admin.firestore();

/**
 * Get next car numeric ID for a seller (transaction-safe)
 * Same logic as numeric-id-counter.service.ts
 */
async function getNextCarNumericId(sellerId: string): Promise<number> {
  const counterRef = db.collection('counters').doc('cars').collection('sellers').doc(sellerId);

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
        sellerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return newCount;
  });

  return result;
}

/**
 * Main migration function
 */
async function migrateCarsNumericIds() {
  console.log('🔢 Starting car numeric ID migration...\n');

  try {
    // Get all cars without numeric ID
    const carsSnapshot = await db
      .collection('cars')
      .where('numericId', '==', null)
      .get();

    if (carsSnapshot.empty) {
      console.log('✅ All cars already have numeric IDs!');
      return;
    }

    console.log(`📊 Found ${carsSnapshot.size} cars without numeric IDs\n`);

    // Group cars by seller
    const carsBySeller = new Map<string, Array<admin.firestore.QueryDocumentSnapshot>>();
    
    carsSnapshot.forEach((carDoc) => {
      const carData = carDoc.data();
      const sellerId = carData.sellerId;

      if (!sellerId) {
        console.warn(`⚠️  Car ${carDoc.id} has no sellerId, skipping...`);
        return;
      }

      if (!carsBySeller.has(sellerId)) {
        carsBySeller.set(sellerId, []);
      }

      carsBySeller.get(sellerId)!.push(carDoc);
    });

    console.log(`📊 Found ${carsBySeller.size} sellers with cars to migrate\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ carId: string; error: string }> = [];

    // Process each seller's cars
    for (const [sellerId, cars] of carsBySeller) {
      console.log(`\n👤 Processing seller ${sellerId} (${cars.length} cars)`);

      // Get seller's numeric ID
      const sellerDoc = await db.collection('users').doc(sellerId).get();
      const sellerData = sellerDoc.data();

      if (!sellerData?.numericId) {
        console.error(`❌ Seller ${sellerId} does not have numeric ID, skipping their cars...`);
        errorCount += cars.length;
        cars.forEach((carDoc) => {
          errors.push({
            carId: carDoc.id,
            error: 'Seller does not have numericId',
          });
        });
        continue;
      }

      const sellerNumericId = sellerData.numericId;
      console.log(`   Seller numericId: ${sellerNumericId}`);

      // Process cars in batches
      const BATCH_SIZE = 20;

      for (let i = 0; i < cars.length; i += BATCH_SIZE) {
        const batch = cars.slice(i, i + BATCH_SIZE);

        console.log(`   📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(cars.length / BATCH_SIZE)}`);
        console.log(`      Cars ${i + 1} to ${Math.min(i + BATCH_SIZE, cars.length)} of ${cars.length}`);

        // Process batch sequentially (to maintain counter order)
        for (const carDoc of batch) {
          const carId = carDoc.id;
          const carData = carDoc.data();

          try {
            // Skip if already has numeric ID (safety check)
            if (carData.numericId) {
              console.log(`   ⏭️  Skipping car ${carId} (already has numericId: ${carData.numericId})`);
              continue;
            }

            // Get next car number for this seller
            const carNumericId = await getNextCarNumericId(sellerId);

            // Update car document
            await db.collection('cars').doc(carId).update({
              numericId: carNumericId,
              sellerNumericId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            successCount++;
            console.log(`   ✅ Car ${carId} → /profile/${sellerNumericId}/${carNumericId}`);
          } catch (error) {
            errorCount++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push({ carId, error: errorMessage });
            console.error(`   ❌ Failed to assign numeric ID to car ${carId}: ${errorMessage}`);
          }
        }

        // Add delay between batches to avoid rate limits
        if (i + BATCH_SIZE < cars.length) {
          console.log('   ⏳ Waiting 1 second before next batch...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successfully assigned: ${successCount} cars`);
    console.log(`❌ Failed: ${errorCount} cars`);
    console.log(`📊 Total processed: ${successCount + errorCount} cars`);
    console.log('='.repeat(60));

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
