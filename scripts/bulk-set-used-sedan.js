/**
 * Bulk Set Used + Sedan for all cars across collections.
 * Usage: node scripts/bulk-set-used-sedan.js
 * Requires: service-account-key.json at repo root.
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'service-account-key.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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
  'buses',
];

const BATCH_LIMIT = 450; // keep headroom under 500

async function updateCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) {
    console.log(`⚠️  ${collectionName}: no documents`);
    return { processed: 0, updated: 0 };
  }

  let processed = 0;
  let updated = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    processed += 1;

    const updates = {
      condition: 'used',
      bodyType: 'sedan',
      bodyTypeOther: '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    batch.update(doc.ref, updates);
    batchCount += 1;
    updated += 1;

    if (batchCount >= BATCH_LIMIT) {
      await batch.commit();
      console.log(`✅ ${collectionName}: committed ${batchCount} updates (running total ${updated})`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`✅ ${collectionName}: committed final ${batchCount} updates (total ${updated})`);
  }

  return { processed, updated };
}

async function run() {
  console.log('🚗 Bulk updating all cars to condition=used and bodyType=sedan');
  const totals = { processed: 0, updated: 0 };

  for (const collectionName of collections) {
    console.log(`\n📦 Processing ${collectionName} ...`);
    const { processed, updated } = await updateCollection(collectionName);
    totals.processed += processed;
    totals.updated += updated;
  }

  console.log('\n============================');
  console.log('🏁 Bulk update complete');
  console.log(`Processed: ${totals.processed}`);
  console.log(`Updated:   ${totals.updated}`);
  console.log('============================');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error during bulk update:', err);
  process.exit(1);
});
