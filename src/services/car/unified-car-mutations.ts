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
export async function createCar(carData: Partial<UnifiedCar>): Promise<{ id: string; sellerNumericId: number; carNumericId: number; ownerNumericId?: number; userCarSequenceId?: number }> {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error('Not authenticated');
  }

  try {
    // ✅ NEW: Use atomic car system for creation (Transaction)
    const { numericCarSystemService } = await import('../numeric-car-system.service');

    const numericCarData = await numericCarSystemService.createCarAtomic({
      ...carData,
      make: carData.make || '',
      model: carData.model || '',
      year: carData.year || new Date().getFullYear(),
      price: carData.price || 0
    });

    serviceLogger.info('✅ Car created atomically with numeric IDs', {
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

    // 🔥 AUTO-POST TO FACEBOOK
    try {
      const { facebookAutoPostService } = await import('../meta/facebook-auto-post.service');

      const fbPostResult = await facebookAutoPostService.postCarWithPhoto({
        carId: numericCarData.id,
        make: carData.make || '',
        model: carData.model || '',
        year: carData.year || new Date().getFullYear(),
        price: carData.price || 0,
        images: (carData as any).images || [],
        city: (carData as any).city || 'София',
        region: (carData as any).region,
        mileage: (carData as any).mileage,
        fuelType: (carData as any).fuelType,
        sellerNumericId: numericCarData.sellerNumericId,
        carNumericId: numericCarData.carNumericId
      });

      if (fbPostResult.success) {
        serviceLogger.info('🎉 Car auto-posted to Facebook!', {
          carId: numericCarData.id,
          facebookPostId: fbPostResult.id
        });

        // Add engagement comment after 30 seconds (optional)
        facebookAutoPostService.addEngagementComment(fbPostResult.id, 'bg').catch(err => {
          serviceLogger.warn('Failed to add engagement comment', err);
        });

        // Save Facebook Post ID to Firestore for tracking
        await updateDoc(doc(db, collectionName, numericCarData.id), {
          'social.facebookPostId': fbPostResult.id,
          'social.facebookPostedAt': serverTimestamp()
        });
      } else {
        serviceLogger.warn('Facebook auto-post failed (non-critical)', {
          carId: numericCarData.id,
          error: fbPostResult.error
        });
      }
    } catch (fbError) {
      // Don't fail car creation if Facebook post fails
      serviceLogger.error('Facebook auto-post error (non-critical)', fbError as Error, {
        carId: numericCarData.id
      });
    }

    return {
      id: numericCarData.id,
      sellerNumericId: numericCarData.sellerNumericId,
      carNumericId: numericCarData.carNumericId,
      // Internal Aliases for Consistency
      ownerNumericId: numericCarData.sellerNumericId,
      userCarSequenceId: numericCarData.carNumericId
    };
  } catch (error) {
    serviceLogger.error('Error creating car', error as Error);
    throw error;
  }
}

/**
 * Update car
 * ✅ FIX: Find the correct collection for the car before updating
 * ✅ SECURITY: Verify ownership before allowing updates
 */
export async function updateCar(carId: string, updates: Partial<UnifiedCar>): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
      throw new Error('AUTHENTICATION_REQUIRED: User must be logged in to update car');
    }

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

    // ✅ CRITICAL SECURITY CHECK: Verify Ownership
    const sellerId = carData?.sellerId as string | undefined;
    const ownerId = carData?.ownerId as string | undefined;
    const isOwner = sellerId === currentUser.uid || ownerId === currentUser.uid;

    if (!isOwner) {
      serviceLogger.error('SECURITY VIOLATION: Unauthorized car update attempt', new Error('Unauthorized update'), {
        carId,
        attemptedBy: currentUser.uid,
        actualOwner: sellerId || ownerId,
        timestamp: new Date().toISOString()
      });
      throw new Error('PERMISSION_DENIED: You do not have rights to modify this listing');
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

    // ✅ CRITICAL FIX: Track state changes for stats updates
    const wasActive = carData?.isActive === true && carData?.isSold !== true && carData?.status !== 'sold';
    const isNowActive = updates.isActive !== false && (updates.isSold !== true && updates.status !== 'sold');
    const isNowSold = updates.isSold === true || updates.status === 'sold';
    const isNowInactive = updates.isActive === false;

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    serviceLogger.info('Car updated', { carId });

    // ✅ CRITICAL FIX: Update user stats based on state changes
    if (carData?.sellerId) {
      try {
        const { ProfileService } = await import('../profile/ProfileService');
        const sellerId = carData.sellerId as string;

        // Case 1: Car was sold (was active, now sold)
        if (wasActive && isNowSold) {
          await ProfileService.decrementActiveListings(sellerId);
          serviceLogger.info('User stats: active listings decremented (car sold)', { sellerId, carId });
        }

        // Case 2: Car was deactivated (was active, now inactive)
        else if (wasActive && isNowInactive) {
          await ProfileService.decrementActiveListings(sellerId);
          serviceLogger.info('User stats: active listings decremented (car deactivated)', { sellerId, carId });
        }

        // Case 3: Car was reactivated (was inactive/sold, now active)
        else if (!wasActive && isNowActive && !isNowSold) {
          await ProfileService.incrementActiveListings(sellerId);
          serviceLogger.info('User stats: active listings incremented (car reactivated)', { sellerId, carId });
        }

        // Case 4: Car sale was reversed (was sold, now active again)
        else if (carData?.isSold === true && isNowActive) {
          await ProfileService.incrementActiveListings(sellerId);
          serviceLogger.info('User stats: active listings incremented (sale reversed)', { sellerId, carId });
        }
      } catch (statsError) {
        // Log error but don't fail the update operation
        serviceLogger.error('Failed to update user stats during car update', statsError as Error, { carId });
      }
    }

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
 * ✅ CRITICAL FIX: Updates user stats when deleting active cars
 */
export async function deleteCar(carId: string): Promise<void> {
  try {
    // Find which collection contains this car
    let foundCollection: string | null = null;
    let carData: Record<string, unknown> | null = null;

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
        continue;
      }
    }

    if (!foundCollection) {
      throw new Error(`Car with ID ${carId} not found in any collection`);
    }

    // ✅ CRITICAL FIX: Update user stats before deleting (if car was active)
    if (carData?.sellerId) {
      const wasActive = carData.isActive === true && carData.isSold !== true && carData.status !== 'sold';

      if (wasActive) {
        try {
          const { ProfileService } = await import('../profile/ProfileService');
          await ProfileService.decrementActiveListings(carData.sellerId as string);
          serviceLogger.info('User stats: active listings decremented (car deleted)', {
            sellerId: carData.sellerId,
            carId
          });
        } catch (statsError) {
          // Log error but continue with deletion
          serviceLogger.error('Failed to update user stats before car deletion', statsError as Error, { carId });
        }
      }
    }

    const docRef = doc(db, foundCollection, carId);
    await deleteDoc(docRef);

    serviceLogger.info('Car deleted', { carId });
  } catch (error) {
    serviceLogger.error('Error deleting car', error as Error, { carId });
    throw error;
  }
}
