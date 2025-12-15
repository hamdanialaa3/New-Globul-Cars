// scripts/migration/assign-numeric-ids-users.ts
// 🔢 Migration Script: Assign numeric IDs to existing users
// 
// Purpose: Backfill numeric IDs for all existing users in Firestore
// Safety: Transaction-safe, idempotent, resumable
// 
// Usage:
// npm run migrate:users
// 
// Or:
// npx ts-node scripts/migration/assign-numeric-ids-users.ts

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
 * Get next user numeric ID (transaction-safe)
 * Same logic as numeric-id-counter.service.ts
 */
async function getNextUserNumericId(): Promise<number> {
  const counterRef = db.collection('counters').doc('users');

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
async function migrateUsersNumericIds() {
  console.log('🔢 Starting user numeric ID migration...\n');

  try {
    // Get all users without numeric ID
    const usersSnapshot = await db
      .collection('users')
      .where('numericId', '==', null)
      .get();

    if (usersSnapshot.empty) {
      console.log('✅ All users already have numeric IDs!');
      return;
    }

    console.log(`📊 Found ${usersSnapshot.size} users without numeric IDs\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    // Process users in batches (avoid quota limits)
    const BATCH_SIZE = 50;
    const users = usersSnapshot.docs;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(users.length / BATCH_SIZE)}`);
      console.log(`   Users ${i + 1} to ${Math.min(i + BATCH_SIZE, users.length)} of ${users.length}`);

      // Process batch in parallel
      const promises = batch.map(async (userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();

        try {
          // Skip if already has numeric ID (safety check)
          if (userData.numericId) {
            console.log(`⏭️  Skipping user ${userId} (already has numericId: ${userData.numericId})`);
            return;
          }

          // Get next numeric ID
          const numericId = await getNextUserNumericId();

          // Update user document
          await db.collection('users').doc(userId).update({
            numericId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          successCount++;
          console.log(`✅ User ${userId} → numericId: ${numericId}`);
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push({ userId, error: errorMessage });
          console.error(`❌ Failed to assign numeric ID to user ${userId}: ${errorMessage}`);
        }
      });

      await Promise.all(promises);

      // Add delay between batches to avoid rate limits
      if (i + BATCH_SIZE < users.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successfully assigned: ${successCount} users`);
    console.log(`❌ Failed: ${errorCount} users`);
    console.log(`📊 Total processed: ${successCount + errorCount} users`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(({ userId, error }) => {
        console.log(`   - User ${userId}: ${error}`);
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
migrateUsersNumericIds()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
