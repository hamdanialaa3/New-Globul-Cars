// Browser-based Location Migration
// ترحيل المواقع من المتصفح مباشرة

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { BULGARIAN_CITIES } from '../constants/bulgarianCities';
import { BULGARIA_REGIONS } from '../data/bulgaria-locations';
import LocationHelperService, { UnifiedLocation } from '../services/location-helper-service';
import { logger } from '../services/logger-service';

interface MigrationResult {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{ id: string; error: string }>;
}

/**
 * Migrate all car locations to unified structure
 * Browser-based version (safe for production)
 */
export const migrateCarLocations = async (dryRun: boolean = false): Promise<MigrationResult> => {
  logger.info('Starting location migration', { dryRun });
  
  const result: MigrationResult = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    errorDetails: []
  };

  try {
    // Get all cars
    const carsRef = collection(db, 'cars');
    const snapshot = await getDocs(carsRef);
    
    result.total = snapshot.size;
    logger.info('Cars found for migration', { count: result.total });

    for (const carDoc of snapshot.docs) {
      const data = carDoc.data();
      const carId = carDoc.id;

      try {
        // Skip if already has unified structure
        if (data.location && data.location.cityId && data.location.coordinates) {
          logger.debug('Car already has unified location', { carId });
          result.skipped++;
          continue;
        }

        // Unify location
        const unifiedLocation = LocationHelperService.unifyLocation({
          city: data.city,
          region: data.region,
          postalCode: data.postalCode,
          address: data.location,
          location: data.location,
          locationData: data.locationData
        });

        if (!unifiedLocation) {
          const error = 'Could not unify location - city not found';
          logger.warn('Migration failed for car', { carId, error });
          result.errors++;
          result.errorDetails.push({ id: carId, error });
          continue;
        }

        logger.info('Migrating car location', {
          carId,
          from: data.city || 'unknown',
          to: unifiedLocation.cityId
        });

        // Update (if not dry run)
        if (!dryRun) {
          await updateDoc(doc(db, 'cars', carId), {
            location: unifiedLocation,
            // Keep old fields for backward compatibility
            city: unifiedLocation.cityId,
            region: unifiedLocation.regionId,
            updatedAt: new Date()
          });
        }

        result.migrated++;

      } catch (error) {
        logger.error('Error migrating car', error as Error, { carId });
        result.errors++;
        result.errorDetails.push({ 
          id: carId, 
          error: (error as Error).message 
        });
      }
    }

    logger.info('Migration complete', result);
    return result;

  } catch (error) {
    logger.error('Migration failed', error as Error);
    throw error;
  }
};

/**
 * Check migration status
 */
export const checkMigrationStatus = async (): Promise<{
  total: number;
  withUnifiedLocation: number;
  withoutUnifiedLocation: number;
}> => {
  const carsRef = collection(db, 'cars');
  const snapshot = await getDocs(carsRef);
  
  let withUnified = 0;
  let withoutUnified = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.location && data.location.cityId && data.location.coordinates) {
      withUnified++;
    } else {
      withoutUnified++;
    }
  });

  return {
    total: snapshot.size,
    withUnifiedLocation: withUnified,
    withoutUnifiedLocation: withoutUnified
  };
};

export default migrateCarLocations;

