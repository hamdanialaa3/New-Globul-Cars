// Unified Car Mutations - Write Operations
// تحديثات السيارات الموحدة - عمليات الكتابة

import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { UnifiedCar, VEHICLE_COLLECTIONS } from './unified-car-types';

/**
 * Create new car (with numeric IDs support)
 * ✅ NEW: Uses numeric-car-system-service for strict numeric URL structure
 */
export async function createCar(carData: Partial<UnifiedCar>): Promise<{ id: string; sellerNumericId: number; carNumericId: number }> {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error('Not authenticated');
  }

  try {
    // ✅ NEW: Use numeric car system for creation
    const { numericCarSystemService } = await import('../numeric-car-system.service');

    const numericCarData = await numericCarSystemService.createCarWithNumericIds({
      ...carData,
      make: carData.make || '',
      model: carData.model || '',
      year: carData.year || new Date().getFullYear(),
      price: carData.price || 0
    });

    serviceLogger.info('✅ Car created with numeric IDs', {
      carId: numericCarData.id,
      sellerNumericId: numericCarData.sellerNumericId,
      carNumericId: numericCarData.carNumericId,
      url: `/car/${numericCarData.sellerNumericId}/${numericCarData.carNumericId}`
    });

    // Award points for creating listing
    try {
      const { pointsAutomationService } = await import('../profile/points-automation.service');
      await pointsAutomationService.onListingCreated(currentUser.uid, numericCarData.id);
    } catch (error) {
      // Don't fail car creation if points fail
      serviceLogger.error('Failed to award points for listing creation', error as Error);
    }

    return {
      id: numericCarData.id,
      sellerNumericId: numericCarData.sellerNumericId,
      carNumericId: numericCarData.carNumericId
    };
  } catch (error) {
    serviceLogger.error('Error creating car', error as Error);
    throw error;
  }
}

/**
 * Update car
 * ✅ FIX: Find the correct collection for the car before updating
 */
export async function updateCar(carId: string, updates: Partial<UnifiedCar>): Promise<void> {
  try {
    // ✅ FIX: Find which collection contains this car
    let foundCollection: string | null = null;
    let carData: Record<string, unknown> = {};

    // Search all collections to find the car
    for (const collectionName of VEHICLE_COLLECTIONS) {
      try {
        const docRef = doc(db, collectionName, carId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          foundCollection = collectionName;
          carData = docSnap.data();
          break;
        }
      } catch (error) {
        // Continue searching other collections
        continue;
      }
    }

    if (!foundCollection) {
      throw new Error(`Car with ID ${carId} not found in any collection`);
    }

    const docRef = doc(db, foundCollection, carId);

    // Check if car is being marked as sold
    const wasSold = updates.isSold === true || updates.status === 'sold';
    let isFirstSale = false;

    if (wasSold) {
      // Get current car data to check if it was already sold
      const wasAlreadySold = carData?.isSold === true || carData?.status === 'sold';

      if (!wasAlreadySold && carData?.sellerId) {
        // Import getUserCars dynamically to avoid circular dependency
        const { getUserCars } = await import('./unified-car-queries');
        const userCars = await getUserCars(carData.sellerId as string);
        const soldCars = userCars.filter(c => c.isSold === true || c.status === 'sold');
        isFirstSale = soldCars.length === 0;
      }
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    serviceLogger.info('Car updated', { carId });

    // Award points if car was sold
    if (wasSold) {
      try {
        const carSnap = await getDoc(docRef);
        const carData = carSnap.data();
        if (carData?.sellerId) {
          const { pointsAutomationService } = await import('../profile/points-automation.service');
          await pointsAutomationService.onCarSold(carData.sellerId as string, carId, isFirstSale);
        }
      } catch (error) {
        // Don't fail car update if points fail
        serviceLogger.error('Failed to award points for car sale', error as Error);
      }
    }
  } catch (error) {
    serviceLogger.error('Error updating car', error as Error, { carId });
    throw error;
  }
}

/**
 * Delete car
 */
export async function deleteCar(carId: string): Promise<void> {
  try {
    // Find which collection contains this car
    let foundCollection: string | null = null;

    for (const collectionName of VEHICLE_COLLECTIONS) {
      try {
        const docRef = doc(db, collectionName, carId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          foundCollection = collectionName;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!foundCollection) {
      throw new Error(`Car with ID ${carId} not found in any collection`);
    }

    const docRef = doc(db, foundCollection, carId);
    await deleteDoc(docRef);

    serviceLogger.info('Car deleted', { carId });
  } catch (error) {
    serviceLogger.error('Error deleting car', error as Error, { carId });
    throw error;
  }
}