/**
 * Delete Mock/Fake Cars Script
 * سكريبت حذف السيارات الوهمية
 * 
 * Purpose: Delete all mock/fake cars and keep only real user-added cars
 * 
 * Usage: Run this script to clean up the database
 * 
 * ⚠️ WARNING: This will delete ALL mock/test cars!
 * 
 * @see PROJECT_CONSTITUTION.md - Section 4.2 Multi-collection Pattern
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { logger } from '../src/services/logger-service';
import { VEHICLE_COLLECTIONS } from '../src/services/search/multi-collection-helper';

// Firebase config - requires environment variables (no hardcoded fallbacks)
const requireEnv = (name: string): string => {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
};

const firebaseConfig = {
  apiKey: requireEnv('REACT_APP_FIREBASE_API_KEY'),
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "fire-new-globul.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "fire-new-globul",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Determine if a car is mock/fake
 * يعرّف إذا كانت السيارة وهمية
 */
function isMockCar(carData: any, carId: string): boolean {
  // Pattern 1: Check if sellerId is missing or invalid
  if (!carData.sellerId || typeof carData.sellerId !== 'string' || carData.sellerId.trim() === '') {
    return true;
  }

  // Pattern 2: Check for mock/test patterns in ID
  const mockPatterns = [
    /^car_real_\d+$/,           // car_real_001, car_real_002, etc.
    /^mock_/,                    // mock_*
    /^test_/,                    // test_*
    /^fake_/,                    // fake_*
    /^seed_/,                    // seed_*
    /^sample_/,                  // sample_*
    /^demo_/,                    // demo_*
    /_mock$/i,                   // *_mock
    /_test$/i,                   // *_test
    /_fake$/i,                   // *_fake
  ];

  if (mockPatterns.some(pattern => pattern.test(carId))) {
    return true;
  }

  // Pattern 3: Check for mock/test patterns in sellerId
  if (mockPatterns.some(pattern => pattern.test(carData.sellerId))) {
    return true;
  }

  // Pattern 4: Check if sellerId starts with 'user_real_' (from real-data-initializer)
  if (carData.sellerId.startsWith('user_real_')) {
    return true;
  }

  // Pattern 5: Check if missing numeric IDs (might be old mock data)
  // But keep if sellerId looks like a real Firebase UID (long random string)
  const firebaseUidPattern = /^[a-zA-Z0-9]{28}$/; // Firebase UIDs are typically 28 characters
  if (!carData.sellerNumericId && !firebaseUidPattern.test(carData.sellerId)) {
    return true;
  }

  // Pattern 6: Check if sellerId is from known test users
  const testUserIds = [
    'test-user',
    'test-user-123',
    'mock-user',
    'fake-user',
  ];

  if (testUserIds.includes(carData.sellerId)) {
    return true;
  }

  // If none of the patterns match, assume it's a real car
  return false;
}

/**
 * Get real user cars (keep only these)
 * الحصول على السيارات الحقيقية (الاحتفاظ بهذه فقط)
 */
async function getRealUserCars(): Promise<Array<{ collection: string; id: string; data: any }>> {
  const realCars: Array<{ collection: string; id: string; data: any }> = [];

  try {
    logger.info('🔍 Searching for real user cars...');

    for (const collectionName of VEHICLE_COLLECTIONS) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        logger.info(`📋 Checking ${collectionName}: ${snapshot.size} cars`);

        snapshot.docs.forEach((carDoc) => {
          const carData = carDoc.data();
          const carId = carDoc.id;

          // Keep only real cars (not mock)
          if (!isMockCar(carData, carId)) {
            realCars.push({
              collection: collectionName,
              id: carId,
              data: carData
            });
            logger.debug(`✅ Real car found: ${carId} in ${collectionName}`, {
              make: carData.make,
              model: carData.model,
              sellerId: carData.sellerId
            });
          }
        });
      } catch (error) {
        logger.error(`Error querying ${collectionName}`, error as Error);
      }
    }

    logger.info(`✅ Found ${realCars.length} real user cars to keep`);
    return realCars;

  } catch (error) {
    logger.error('Error getting real user cars', error as Error);
    throw error;
  }
}

/**
 * Delete all mock cars
 * حذف جميع السيارات الوهمية
 */
async function deleteMockCars(keepRealCars: Array<{ collection: string; id: string }>): Promise<{
  totalDeleted: number;
  deletedByCollection: Record<string, number>;
}> {
  const deletedByCollection: Record<string, number> = {};
  let totalDeleted = 0;

  try {
    logger.info('🗑️ Starting deletion of mock cars...');

    // Create a Set of real car IDs for quick lookup
    const realCarIds = new Set<string>();
    keepRealCars.forEach(car => {
      realCarIds.add(`${car.collection}:${car.id}`);
    });

    for (const collectionName of VEHICLE_COLLECTIONS) {
      deletedByCollection[collectionName] = 0;

      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        logger.info(`📋 Processing ${collectionName}: ${snapshot.size} total cars`);

        const deletePromises: Promise<void>[] = [];

        snapshot.docs.forEach((carDoc) => {
          const carId = carDoc.id;
          const carKey = `${collectionName}:${carId}`;

          // Skip if this is a real car we want to keep
          if (realCarIds.has(carKey)) {
            logger.debug(`⏭️  Skipping real car: ${carId} in ${collectionName}`);
            return;
          }

          // Delete mock car
          const deletePromise = deleteDoc(doc(db, collectionName, carId))
            .then(() => {
              deletedByCollection[collectionName]++;
              totalDeleted++;
              logger.debug(`🗑️  Deleted mock car: ${carId} from ${collectionName}`);
            })
            .catch((error) => {
              logger.error(`Error deleting car ${carId} from ${collectionName}`, error as Error);
            });

          deletePromises.push(deletePromise);
        });

        // Wait for all deletions in this collection to complete
        await Promise.all(deletePromises);

        logger.info(`✅ Deleted ${deletedByCollection[collectionName]} mock cars from ${collectionName}`);

      } catch (error) {
        logger.error(`Error processing ${collectionName}`, error as Error);
      }
    }

    logger.info(`✅ Total deleted: ${totalDeleted} mock cars`);
    return {
      totalDeleted,
      deletedByCollection
    };

  } catch (error) {
    logger.error('Error deleting mock cars', error as Error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    logger.info('🚀 Starting mock cars deletion script...');
    logger.info('⚠️  WARNING: This will delete ALL mock/test cars!');

    // Step 1: Get real user cars to keep
    const realCars = await getRealUserCars();

    if (realCars.length === 0) {
      logger.warn('⚠️  No real user cars found! Are you sure you want to delete all cars?');
      logger.info('📝 If you want to proceed, uncomment the deletion code.');
      return;
    }

    logger.info(`✅ Found ${realCars.length} real cars to keep:`);
    realCars.forEach((car, index) => {
      logger.info(`  ${index + 1}. ${car.data.make} ${car.data.model} (${car.collection}/${car.id})`);
    });

    // Step 2: Delete all mock cars
    const result = await deleteMockCars(realCars.map(c => ({ collection: c.collection, id: c.id })));

    logger.info('🎉 Script completed successfully!');
    logger.info(`📊 Summary:`);
    logger.info(`   - Real cars kept: ${realCars.length}`);
    logger.info(`   - Mock cars deleted: ${result.totalDeleted}`);
    logger.info(`   - Deleted by collection:`, result.deletedByCollection);

  } catch (error) {
    logger.error('❌ Script failed', error as Error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      logger.info('✅ Script finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Script error', error as Error);
      process.exit(1);
    });
}

export { deleteMockCars, getRealUserCars, isMockCar };
