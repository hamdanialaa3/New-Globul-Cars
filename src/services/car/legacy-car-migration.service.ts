// Legacy Car Migration Service
// Migrates legacy cars from 'cars' or 'listings' collections to the correct new collection
// using SellWorkflowCollections.getCollectionNameForVehicleType().
// Ensures required fields and schema compliance.


import { SellWorkflowCollections } from '../sell-workflow-collections';

import { UnifiedCar } from './unified-car-types';
import { unifiedCarService } from './unified-car-service';

export interface MigrationResult {
  migrated: UnifiedCar[];
  issues: { carId: string; issue: string }[];
}

/**
 * Migrates legacy cars to the correct new collection and schema.
 * @param legacyCars Array of cars from 'cars' or 'listings' collections
 * @returns MigrationResult
 */
export async function migrateLegacyCars(legacyCars: UnifiedCar[]): Promise<MigrationResult> {
  const migrated: UnifiedCar[] = [];
  const issues: { carId: string; issue: string }[] = [];

  for (const car of legacyCars) {
    // Skip if already in new schema (has sellerNumericId & carNumericId & correct collection)
    if (
      car.sellerNumericId &&
      car.carNumericId &&
      SellWorkflowCollections.getAllCollections().includes(car.collectionName || '') &&
      car.status === 'active' &&
      car.isActive === true &&
      car.isSold === false &&
      typeof car.color === 'string' &&
      /^\d+$/.test(String(car.numericId))
    ) {
      continue;
    }

    // Determine correct collection
    const collectionName = SellWorkflowCollections.getCollectionNameForVehicleType(car.vehicleType || 'car');

    // Validate numericId
    let numericId = car.numericId;
    if (!numericId || !/^\d+$/.test(String(numericId))) {
      issues.push({ carId: car.id, issue: 'Missing or invalid numericId' });
      numericId = undefined;
    }

    // Standardize color
    let color = car.color;
    if (!color || typeof color !== 'string') {
      color = 'unknown';
      issues.push({ carId: car.id, issue: 'Missing or invalid color' });
    }

    // Add/override required fields
    const migratedCar: UnifiedCar = {
      ...car,
      collectionName,
      isActive: true,
      isSold: false,
      status: 'active',
      color,
      numericId,
      updatedAt: new Date(),
    };

    // Save to new collection (simulate with unifiedCarService.createCar)
    try {
      await unifiedCarService.createCar(migratedCar);
      migrated.push(migratedCar);
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      issues.push({ carId: car.id, issue: 'Failed to migrate: ' + message });
    }
  }

  return { migrated, issues };
}
