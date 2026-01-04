/**
 * Migration Script: Fix isActive field in old cars
 * 
 * This script:
 * 1. Finds all cars without isActive field
 * 2. Sets isActive: true if status === 'active'
 * 3. Sets isActive: false if status !== 'active'
 * 
 * Run: npx ts-node scripts/migrate-isActive.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase config (use your actual config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections to migrate
const COLLECTIONS = [
  'cars',
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses'
];

async function migrateIsActive() {
  console.log('🚀 Starting isActive migration...\n');

  let totalFixed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const collectionName of COLLECTIONS) {
    console.log(`📦 Processing collection: ${collectionName}`);
    
    try {
      // Get all cars in this collection
      const carsRef = collection(db, collectionName);
      const snapshot = await getDocs(carsRef);

      let fixed = 0;
      let skipped = 0;
      let errors = 0;

      for (const carDoc of snapshot.docs) {
        try {
          const carData = carDoc.data();
          
          // Skip if isActive already exists
          if ('isActive' in carData && carData.isActive !== undefined) {
            skipped++;
            continue;
          }

          // Determine isActive based on status
          const status = carData.status || 'draft';
          const isActive = status === 'active' && !carData.isSold;
          const isSold = carData.isSold || status === 'sold';

          // Update the document
          await updateDoc(doc(db, collectionName, carDoc.id), {
            isActive,
            isSold,
            updatedAt: new Date()
          });

          fixed++;
          console.log(`  ✅ Fixed: ${carDoc.id} (isActive: ${isActive}, isSold: ${isSold})`);
        } catch (error) {
          errors++;
          console.error(`  ❌ Error fixing ${carDoc.id}:`, error);
        }
      }

      console.log(`  📊 ${collectionName}: Fixed: ${fixed}, Skipped: ${skipped}, Errors: ${errors}\n`);
      
      totalFixed += fixed;
      totalSkipped += skipped;
      totalErrors += errors;
    } catch (error) {
      console.error(`❌ Error processing collection ${collectionName}:`, error);
      totalErrors++;
    }
  }

  console.log('🎉 Migration completed!');
  console.log(`📊 Summary:`);
  console.log(`   ✅ Fixed: ${totalFixed}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
  console.log(`   ❌ Errors: ${totalErrors}`);
}

// Run migration
migrateIsActive()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });

