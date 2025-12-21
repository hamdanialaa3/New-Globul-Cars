/**
 * Migrate Dealers Collection
 * Phase 1 (P0.2): Migrate data from 'dealers' to 'dealerships'
 * 
 * Usage:
 *   npx ts-node scripts/migrate-dealers-collection.ts
 *   npx ts-node scripts/migrate-dealers-collection.ts --dry-run
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

// Firebase config (copy from firebase-config.ts or use env vars)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateDealersToNewCollection() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('🚀 Starting migration from dealers → dealerships');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('─'.repeat(60));

  try {
    // Get all documents from old 'dealers' collection
    const dealersSnapshot = await getDocs(collection(db, 'dealers'));

    console.log(`📊 Found ${dealersSnapshot.size} dealers to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const dealerDoc of dealersSnapshot.docs) {
      const uid = dealerDoc.id;
      const oldData = dealerDoc.data();

      console.log(`Processing: ${uid} - ${oldData.companyName || 'Unknown'}`);

      try {
        // Transform old structure to new DealershipInfo structure
        const newData = {
          uid,
          dealershipNameBG: oldData.companyName || '',
          dealershipNameEN: oldData.companyName || '',
          vatNumber: oldData.vatNumber || '',
          companyRegNumber: oldData.licenseNumber || '',
          legalForm: 'EOOD' as const,

          address: {
            street: oldData.address?.street || '',
            city: oldData.address?.city || '',
            number: '',
            postalCode: oldData.address?.postalCode || '',
            region: oldData.address?.region || '',
          },

          workingHours: {
            monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
            saturday: { isOpen: false },
            sunday: { isOpen: false },
          },

          primaryPhone: oldData.contactInfo?.phone || '',
          officialEmail: oldData.contactInfo?.email || '',
          website: oldData.contactInfo?.website,

          socialMedia: {
            facebook: '',
            instagram: '',
          },

          manager: {
            name: ''
          },

          vehicleTypes: {
            passenger: true,
            commercial: false,
            motorcycle: false,
            agricultural: false,
          },

          carCategories: [],
          services: {
            financing: false,
            warranty: false,
            tradeIn: false,
          },
          certifications: {
            dealerLicense: oldData.certifications || [],
          },

          totalCarsAvailable: 0,
          verified: oldData.verified || false,
          featuredDealer: false,
          logo: oldData.logo,
          galleryImages: [],
          documents: [],

          createdAt: oldData.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (!isDryRun) {
          // Write to new 'dealerships' collection
          await setDoc(doc(db, 'dealerships', uid), newData, { merge: true });
          migrated++;
          console.log(`  ✅ Migrated successfully`);
        } else {
          console.log(`  ✅ Would migrate (dry-run)`);
          migrated++;
        }
      } catch (error) {
        console.error(`  ❌ Error:`, error);
        errors++;
      }

      console.log('');
    }

    console.log('─'.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`  Total: ${dealersSnapshot.size}`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log('─'.repeat(60));

    if (isDryRun) {
      console.log('\n✅ DRY RUN COMPLETE - No data was written');
    } else {
      console.log('\n✅ MIGRATION COMPLETE');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDealersToNewCollection()
  .then(() => {
    console.log('\n🎉 Script finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

