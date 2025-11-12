/**
 * Data Migration Script - Phase 6
 * سكريبت ترحيل البيانات - المرحلة 6
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (you need to add your service account key)
// admin.initializeApp({
//   credential: admin.credential.cert(require('./serviceAccountKey.json'))
// });

const db = admin.firestore();

// Backup function
async function backupCollection(collectionName) {
  console.log(`📦 Backing up ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });
  
  const backupPath = path.join(__dirname, '..', 'backups', `${collectionName}_${Date.now()}.json`);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  
  console.log(`✅ Backed up ${data.length} documents to ${backupPath}`);
  return data.length;
}

// Migrate cars
async function migrateCars() {
  console.log('\n🚗 Migrating cars...');
  const carsRef = db.collection('cars');
  const snapshot = await carsRef.get();
  
  let updated = 0;
  let errors = 0;
  
  for (const doc of snapshot.docs) {
    try {
      const data = doc.data();
      const updates = {};
      
      // Add missing fields
      if (!data.status) updates.status = 'active';
      if (data.isActive === undefined) updates.isActive = true;
      if (data.isSold === undefined) updates.isSold = false;
      if (!data.views) updates.views = 0;
      if (!data.favorites) updates.favorites = 0;
      if (!data.createdAt) updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      
      // Normalize images
      if (data.images && !Array.isArray(data.images)) {
        updates.images = [data.images];
      }
      
      // Update if needed
      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates);
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error updating car ${doc.id}:`, error.message);
      errors++;
    }
  }
  
  console.log(`✅ Updated ${updated} cars, ${errors} errors`);
}

// Migrate users
async function migrateUsers() {
  console.log('\n👤 Migrating users...');
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  let updated = 0;
  let errors = 0;
  
  for (const doc of snapshot.docs) {
    try {
      const data = doc.data();
      const updates = {};
      
      // Add missing fields
      if (!data.lastActive) updates.lastActive = admin.firestore.FieldValue.serverTimestamp();
      if (!data.profileComplete) {
        updates.profileComplete = !!(data.email && data.displayName);
      }
      
      // Update if needed
      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates);
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error updating user ${doc.id}:`, error.message);
      errors++;
    }
  }
  
  console.log(`✅ Updated ${updated} users, ${errors} errors`);
}

// Main execution
async function main() {
  console.log('🚀 Starting data migration...\n');
  
  try {
    // Step 1: Backup
    console.log('📦 Step 1: Creating backups...');
    await backupCollection('cars');
    await backupCollection('users');
    
    // Step 2: Migrate
    console.log('\n🔄 Step 2: Migrating data...');
    await migrateCars();
    await migrateUsers();
    
    console.log('\n✨ Migration complete!');
    console.log('\n⚠️  Next steps:');
    console.log('1. Verify the data in Firestore');
    console.log('2. Test the application');
    console.log('3. If everything works, you can delete old backups');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\n⚠️  Restore from backup if needed');
  }
}

// Run if called directly
if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { backupCollection, migrateCars, migrateUsers };
