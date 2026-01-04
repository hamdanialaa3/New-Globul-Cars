// Migration Script: Unified Location Structure
// سكريبت الترحيل: توحيد بنية الموقع

import * as admin from 'firebase-admin';
import * as serviceAccount from '../../secrets/fire-new-globul-firebase-adminsdk.json';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://fire-new-globul.firebaseio.com'
});

const db = admin.firestore();

// Import location data (you'll need to adapt these imports)
import { BULGARIAN_CITIES } from '../src/constants/bulgarianCities';
import { BULGARIA_REGIONS } from '../src/data/bulgaria-locations';

interface UnifiedLocation {
  cityId: string;
  cityNameBg: string;
  cityNameEn: string;
  regionId: string;
  regionNameBg: string;
  regionNameEn: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  postalCode: string;
  address: string;
}

/**
 * Unify location from legacy data
 */
function unifyLocation(data: any): UnifiedLocation | null {
  let cityData = null;
  
  // Try various sources
  const possibleCities = [
    data.city,
    data.region,
    data.location?.city,
    data.location?.cityId,
    data.locationData?.cityId
  ].filter(Boolean);
  
  for (const possibleCity of possibleCities) {
    // Try by ID
    cityData = BULGARIAN_CITIES.find(c => c.id === possibleCity);
    if (cityData) break;
    
    // Try by Bulgarian name
    cityData = BULGARIAN_CITIES.find(c => c.nameBg === possibleCity);
    if (cityData) break;
    
    // Try by English name
    cityData = BULGARIAN_CITIES.find(c => c.nameEn === possibleCity);
    if (cityData) break;
  }
  
  if (!cityData) {
    console.error('❌ Could not find city for:', possibleCities);
    return null;
  }
  
  // Find region
  const regionData = BULGARIA_REGIONS.find(r => 
    r.cities.includes(cityData!.nameBg)
  );
  
  return {
    cityId: cityData.id,
    cityNameBg: cityData.nameBg,
    cityNameEn: cityData.nameEn,
    regionId: cityData.regionId || (regionData as any)?.id || '',
    regionNameBg: regionData?.name || '',
    regionNameEn: regionData?.nameEn || '',
    coordinates: cityData.coordinates,
    postalCode: data.postalCode || '',
    address: data.location || data.address || ''
  };
}

/**
 * Migrate all cars to unified location structure
 */
async function migrateAllCars(dryRun: boolean = false) {
  console.log('🚀 Starting location structure migration...');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'REAL MIGRATION'}\n`);
  
  const carsRef = db.collection('cars');
  const snapshot = await carsRef.get();
  
  console.log(`📊 Found ${snapshot.size} cars to process\n`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: Array<{id: string; error: string}> = [];
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const carId = doc.id;
    
    try {
      // Skip if already has unified structure
      if (data.location && data.location.cityId && data.location.coordinates) {
        console.log(`⏭️  ${carId}: Already has unified structure, skipping`);
        skippedCount++;
        continue;
      }
      
      // Unify location
      const unifiedLocation = unifyLocation(data);
      
      if (!unifiedLocation) {
        const error = `No valid city found`;
        console.error(`❌ ${carId}: ${error}`);
        errors.push({ id: carId, error });
        errorCount++;
        continue;
      }
      
      // Preview what will be updated
      console.log(`✅ ${carId}:`);
      console.log(`   City: ${data.city || 'N/A'} → ${unifiedLocation.cityId} (${unifiedLocation.cityNameBg})`);
      console.log(`   Region: ${data.region || 'N/A'} → ${unifiedLocation.regionId}`);
      console.log(`   Coords: ${unifiedLocation.coordinates.lat}, ${unifiedLocation.coordinates.lng}`);
      
      // Update (if not dry run)
      if (!dryRun) {
        await doc.ref.update({
          location: unifiedLocation,
          // Keep old fields for backward compatibility
          city: unifiedLocation.cityId,
          region: unifiedLocation.regionId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      migratedCount++;
      
    } catch (error) {
      console.error(`❌ ${carId}: Migration error:`, error);
      errors.push({ id: carId, error: String(error) });
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total cars:       ${snapshot.size}`);
  console.log(`✅ Migrated:      ${migratedCount}`);
  console.log(`⏭️  Skipped:       ${skippedCount}`);
  console.log(`❌ Errors:        ${errorCount}`);
  console.log('='.repeat(60));
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(({ id, error }) => {
      console.log(`  - ${id}: ${error}`);
    });
  }
  
  if (dryRun) {
    console.log('\n⚠️  This was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run flag to apply changes.');
  } else {
    console.log('\n✅ Migration complete! Changes have been applied to Firestore.');
  }
  
  process.exit(errors.length > 0 ? 1 : 0);
}

// Run migration
const isDryRun = process.argv.includes('--dry-run');
migrateAllCars(isDryRun);

