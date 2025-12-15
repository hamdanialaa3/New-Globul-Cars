/**
 * Fix missing profileVisibility field for existing users
 * Allows other users to view their profiles
 * 
 * Usage: node functions/src/batch-operations/fix-profile-visibility.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Check for service account key
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '../../service-account-key.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.log('\n❌ Service account file not found at:', serviceAccountPath);
  console.log('\n💡 You can use the Firestore Emulator instead:');
  console.log('   1. Start the emulator: npm run emulate');
  console.log('   2. Then run this script\n');
  process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = getFirestore(app);

async function fixProfileVisibility() {
  console.log('\n🔧 Fixing missing profileVisibility field...\n');

  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Total users found: ${usersSnapshot.size}`);

    let updated = 0;
    let skipped = 0;

    // Update each user
    const batch = db.batch();

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Check if profileVisibility is missing or null
      if (!('profileVisibility' in data) || data.profileVisibility === null) {
        console.log(`   ✅ Updating user: ${data.email || data.displayName || doc.id}`);
        batch.update(doc.ref, {
          profileVisibility: 'public',
          lastUpdated: new Date(),
          updatedReason: 'Batch fix: added missing profileVisibility field'
        });
        updated++;
      } else {
        console.log(`   ⏭️  Skipping user: ${data.email || data.displayName || doc.id} (already has profileVisibility)`);
        skipped++;
      }
    });

    // Commit the batch
    if (updated > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully updated ${updated} users`);
    } else {
      console.log(`\n✅ No users needed updating`);
    }
    
    console.log(`⏭️  Skipped ${skipped} users\n`);
    
    // Close the app
    await app.delete();
    console.log('✅ Done!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await app.delete();
    process.exit(1);
  }
}

fixProfileVisibility();
