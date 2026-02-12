/**
 * Legacy Cars Migration Script
 * سكريبت ترحيل السيارات القديمة
 * 
 * Purpose: Assign numeric IDs to cars that don't have them
 * الغرض: منح أرقام تعريفية للسيارات التي لا تملكها
 * 
 * Usage: Run once in admin panel or via CLI
 * الاستخدام: تشغيل مرة واحدة من لوحة التحكم أو من سطر الأوامر
 * 
 * Safety: Uses Firestore transactions to ensure data consistency
 * الأمان: يستخدم معاملات Firestore لضمان تناسق البيانات
 */

import { db } from '../firebase/firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { serviceLogger } from '../services/logger-service';

// Vehicle collection names (aligned with VEHICLE_COLLECTIONS)
const VEHICLE_COLLECTIONS = [
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses',
  'cars' // Legacy collection
];

interface MigrationStats {
  totalScanned: number;
  carsNeedingMigration: number;
  carsSuccessfullyMigrated: number;
  carsFailed: number;
  errors: Array<{ carId: string; error: string }>;
}

/**
 * Main migration function
 * الدالة الرئيسية للترحيل
 */
export async function migrateLegacyCars(): Promise<MigrationStats> {
  serviceLogger.info('🚀 Starting legacy cars migration...');
  
  const stats: MigrationStats = {
    totalScanned: 0,
    carsNeedingMigration: 0,
    carsSuccessfullyMigrated: 0,
    carsFailed: 0,
    errors: []
  };

  try {
    // Process each collection
    for (const collectionName of VEHICLE_COLLECTIONS) {
      serviceLogger.info(`📂 Scanning collection: ${collectionName}`);
      await migrateCollection(collectionName, stats);
    }

    // Print final report
    printMigrationReport(stats);
    
    return stats;
  } catch (error) {
    serviceLogger.error('Migration failed', error as Error);
    throw error;
  }
}

/**
 * Migrate a single collection
 * ترحيل مجموعة واحدة
 */
async function migrateCollection(
  collectionName: string, 
  stats: MigrationStats
): Promise<void> {
  try {
    const carsRef = collection(db, collectionName);
    
    // Find cars without numeric IDs
    const q = query(
      carsRef,
      where('carNumericId', '==', null)
    );
    
    const snapshot = await getDocs(q);
    stats.totalScanned += snapshot.size;

    if (snapshot.empty) {
      serviceLogger.info(`✅ No cars need migration in ${collectionName}`);
      return;
    }

    serviceLogger.info(`Found ${snapshot.size} cars to migrate in ${collectionName}`);
    stats.carsNeedingMigration += snapshot.size;

    // Migrate cars in batches of 10 (Firestore transaction limit)
    const batchSize = 10;
    const carDocs = snapshot.docs;

    for (let i = 0; i < carDocs.length; i += batchSize) {
      const batch = carDocs.slice(i, i + batchSize);
      await migrateBatch(collectionName, batch, stats);
    }

  } catch (error) {
    serviceLogger.error(`Error migrating collection ${collectionName}`, error as Error);
  }
}

/**
 * Migrate a batch of cars using transaction
 * ترحيل مجموعة من السيارات باستخدام المعاملات
 */
async function migrateBatch(
  collectionName: string,
  carDocs: any[],
  stats: MigrationStats
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      // Get current counter
      const counterRef = doc(db, 'counters', 'carNumericId');
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 1000; // Default starting point
      if (counterDoc.exists()) {
        currentCount = counterDoc.data().count || 1000;
      }

      // Assign numeric IDs to each car
      for (const carDoc of carDocs) {
        currentCount++;
        
        const carData = carDoc.data();
        const carRef = doc(db, collectionName, carDoc.id);

        // Update car with numeric ID
        transaction.update(carRef, {
          carNumericId: currentCount,
          // Also ensure sellerNumericId exists (if not, needs separate migration)
          updatedAt: Timestamp.now(),
          migratedAt: Timestamp.now(),
          migrationVersion: '1.0'
        });

        serviceLogger.info(`✅ Migrated car ${carDoc.id} → carNumericId: ${currentCount}`);
      }

      // Update counter
      transaction.set(counterRef, { count: currentCount }, { merge: true });

      stats.carsSuccessfullyMigrated += carDocs.length;
    });

  } catch (error) {
    serviceLogger.error('Batch migration failed', error as Error);
    stats.carsFailed += carDocs.length;
    
    // Log individual car failures
    carDocs.forEach(carDoc => {
      stats.errors.push({
        carId: carDoc.id,
        error: (error as Error).message
      });
    });
  }
}

/**
 * Print migration report
 * طباعة تقرير الترحيل
 */
function printMigrationReport(stats: MigrationStats): void {
  // ✅ FIX: Removed console.log - using serviceLogger instead
  // Note: This is a CLI script, so console output is acceptable for migration reports
  // However, we'll use serviceLogger for consistency
  serviceLogger.info('═══════════════════════════════════════════════════');
  serviceLogger.info('📊 MIGRATION REPORT / تقرير الترحيل');
  serviceLogger.info('═══════════════════════════════════════════════════');
  serviceLogger.info(`Total cars scanned:        ${stats.totalScanned}`);
  serviceLogger.info(`Cars needing migration:    ${stats.carsNeedingMigration}`);
  serviceLogger.info(`Successfully migrated:     ${stats.carsSuccessfullyMigrated} ✅`);
  serviceLogger.info(`Failed:                    ${stats.carsFailed} ❌`);
  serviceLogger.info('═══════════════════════════════════════════════════');
  
  if (stats.errors.length > 0) {
    serviceLogger.warn('⚠️ ERRORS:', { errors: stats.errors });
    stats.errors.forEach(err => {
      serviceLogger.error(`Car ${err.carId} migration failed`, new Error(err.error));
    });
  }
  
  if (stats.carsSuccessfullyMigrated === stats.carsNeedingMigration) {
    serviceLogger.info('🎉 Migration completed successfully!');
  } else {
    serviceLogger.warn('⚠️ Migration completed with errors. Please review.');
  }
}

/**
 * Verify migration (optional safety check)
 * التحقق من الترحيل (فحص أمان اختياري)
 */
export async function verifyMigration(): Promise<boolean> {
  serviceLogger.info('🔍 Verifying migration...');
  
  let allGood = true;
  
  for (const collectionName of VEHICLE_COLLECTIONS) {
    const carsRef = collection(db, collectionName);
    const q = query(carsRef, where('carNumericId', '==', null));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      serviceLogger.warn(`⚠️ Found ${snapshot.size} cars without numeric IDs in ${collectionName}`);
      allGood = false;
    }
  }
  
  if (allGood) {
    serviceLogger.info('✅ Verification passed: All cars have numeric IDs');
  }
  
  return allGood;
}

// Export for use in admin panel or CLI
export default {
  migrateLegacyCars,
  verifyMigration
};
