/**
 * Fix Missing Car Fields Script
 * تحديث السيارات القديمة بالحقول المفقودة
 * 
 * This script adds missing fields to existing car documents:
 * - isActive: true (for all active cars)
 * - status: 'active' (if missing)
 * - locationData: Generated from region/city
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load service account from environment variable (SECURE)
function loadServiceAccount() {
    // Option 1: From environment variable
    const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (envKey) {
        try {
            const sa = JSON.parse(envKey);
            if (sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
            return sa;
        } catch (e) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        }
    }

    // Option 2: From .env.local file
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const idx = line.indexOf('=');
            if (idx !== -1) {
                const key = line.substring(0, idx).trim();
                let val = line.substring(idx + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                env[key] = val;
            }
        });
        if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
            if (sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
            return sa;
        }
    }

    console.error('❌ No service account found!');
    console.error('   Set FIREBASE_SERVICE_ACCOUNT_KEY env variable or add it to .env.local');
    process.exit(1);
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
}

const db = admin.firestore();

// Bulgarian cities mapping (simplified version)
const BULGARIAN_CITIES = {
  'sofia': { bg: 'София', en: 'Sofia', coordinates: { lat: 42.6977, lng: 23.3219 } },
  'plovdiv': { bg: 'Пловдив', en: 'Plovdiv', coordinates: { lat: 42.1354, lng: 24.7453 } },
  'varna': { bg: 'Варна', en: 'Varna', coordinates: { lat: 43.2141, lng: 27.9147 } },
  'burgas': { bg: 'Бургас', en: 'Burgas', coordinates: { lat: 42.5048, lng: 27.4626 } },
  'pazardzhik': { bg: 'Пазарджик', en: 'Pazardzhik', coordinates: { lat: 42.1887, lng: 24.3337 } },
  'pleven': { bg: 'Плевен', en: 'Pleven', coordinates: { lat: 43.4170, lng: 24.6167 } },
  'ruse': { bg: 'Русе', en: 'Ruse', coordinates: { lat: 43.8564, lng: 25.9656 } },
  'stara-zagora': { bg: 'Стара Загора', en: 'Stara Zagora', coordinates: { lat: 42.4258, lng: 25.6342 } },
  'sliven': { bg: 'Сливен', en: 'Sliven', coordinates: { lat: 42.6824, lng: 26.3228 } },
  'dobrich': { bg: 'Добрич', en: 'Dobrich', coordinates: { lat: 43.5725, lng: 27.8272 } }
};

/**
 * Generate locationData from region
 */
function generateLocationData(region, city) {
  const regionKey = region ? region.toLowerCase() : 'sofia';
  const cityInfo = BULGARIAN_CITIES[regionKey] || BULGARIAN_CITIES['sofia'];
  
  return {
    cityId: regionKey,
    cityName: cityInfo,
    coordinates: cityInfo.coordinates,
    region: region || 'sofia',
    city: city || cityInfo.bg
  };
}

/**
 * Fix a single car document
 */
async function fixCarDocument(doc) {
  const data = doc.data();
  const updates = {};
  let needsUpdate = false;
  
  // 1. Add isActive if missing
  if (data.isActive === undefined) {
    updates.isActive = true;
    needsUpdate = true;
    console.log(`  ✅ Adding isActive: true`);
  }
  
  // 2. Add status if missing (default to 'active')
  if (!data.status) {
    updates.status = 'active';
    needsUpdate = true;
    console.log(`  ✅ Adding status: 'active'`);
  }
  
  // 3. Add region if missing (default to 'sofia')
  if (!data.region) {
    updates.region = 'sofia';
    needsUpdate = true;
    console.log(`  ✅ Adding region: 'sofia'`);
  }
  
  // 4. Add locationData if missing
  if (!data.locationData) {
    const region = data.region || updates.region || 'sofia';
    const city = data.city || null;
    updates.locationData = generateLocationData(region, city);
    needsUpdate = true;
    console.log(`  ✅ Adding locationData for region: ${region}`);
  }
  
  // 5. Add sellerType if missing (default to 'private')
  if (!data.sellerType) {
    updates.sellerType = 'private';
    needsUpdate = true;
    console.log(`  ✅ Adding sellerType: 'private'`);
  }
  
  // Apply updates
  if (needsUpdate) {
    await doc.ref.update(updates);
    console.log(`  ✅ Document ${doc.id} updated successfully!\n`);
    return true;
  } else {
    console.log(`  ℹ️ No updates needed for ${doc.id}\n`);
    return false;
  }
}

/**
 * Main function
 */
async function fixAllCars() {
  console.log('🔧 Starting car documents update...\n');
  
  try {
    // Get all cars
    const carsSnapshot = await db.collection('cars').get();
    console.log(`📦 Found ${carsSnapshot.size} cars to check\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each car
    for (const doc of carsSnapshot.docs) {
      const data = doc.data();
      console.log(`🚗 Checking: ${data.make} ${data.model} (ID: ${doc.id})`);
      
      const wasUpdated = await fixCarDocument(doc);
      if (wasUpdated) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log('\n✅ Update complete!');
    console.log(`  - Updated: ${updatedCount} cars`);
    console.log(`  - Skipped: ${skippedCount} cars (already had all fields)`);
    console.log(`  - Total: ${carsSnapshot.size} cars\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

// Run the fix
fixAllCars();
