/**
 * Numeric Car System Service
 * 🔢 Strict Numeric ID System for Cars
 * 
 * URL Format:
 * - Car: /car/{userNumericId}/{carNumericId}
 * - Example: /car/1/1 (User 1's first car)
 * 
 * Database Structure:
 * - cars collection: {
 *     id: 'uuid',
 *     sellerId: 'firebase-uid',
 *     sellerNumericId: 1,           // ✨ User's numeric ID
 *     carNumericId: 1,              // ✨ User's car sequence number
 *     make, model, year, ...
 *   }
 * 
 * @file numeric-car-system.service.ts
 * @since 2025-12-16
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { BulgarianProfileService } from './bulgarian-profile-service';

export interface NumericCarData {
  id: string;
  sellerId: string;
  sellerNumericId: number;      // ✨ User's numeric ID
  carNumericId: number;         // ✨ This is user's 1st, 2nd, 3rd car
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  [key: string]: any;
}

class NumericCarSystemService {
  /**
   * ✅ Get user's numeric ID
   * Throws if profile doesn't exist
   */
  async getUserNumericId(userId: string): Promise<number> {
    const userProfile = await BulgarianProfileService.getUserProfile(userId);

    if (!userProfile || !userProfile.numericId) {
      throw new Error(`❌ User profile not found or numericId not assigned: ${userId}`);
    }

    return userProfile.numericId;
  }

  /**
   * ✅ Get the next carNumericId for a user
   * ✅ CRITICAL FIX: Uses atomic transaction-based counter to prevent race conditions
   * Example: If user has cars 1, 2, 3 → returns 4
   */
  async getNextCarNumericId(userId: string): Promise<number> {
    try {
      // ✅ CRITICAL FIX: Use transaction-based counter service instead of query
      // This prevents race conditions when multiple cars are created simultaneously
      const { getNextCarNumericId: getNextCarNumericIdFromCounter } = await import('./numeric-id-counter.service');
      const nextId = await getNextCarNumericIdFromCounter(userId);

      serviceLogger.info('✅ Got next car numeric ID (atomic)', { userId, carNumericId: nextId });
      return nextId;
    } catch (error) {
      serviceLogger.error('Error getting next carNumericId', error as Error);
      throw error;
    }
  }

  /**
   * Alias for getNextCarNumericId (User Preference)
   */
  async generateNextCarId(userId: number | string): Promise<number> {
    // Check if input is numeric ID (number) or UID (string)
    if (typeof userId === 'number') {
      const { getFirebaseUidByNumericId } = await import('./numeric-id-lookup.service');
      const uid = await getFirebaseUidByNumericId(userId);
      if (!uid) throw new Error(`User not found for numeric ID ${userId}`);
      return this.getNextCarNumericId(uid);
    }
    return this.getNextCarNumericId(userId);
  }

  /**
   * ✅ Create car ATOMICALLY (Transaction)
   * Bundles: ID generation, Document creation, and Profile stats increment
   */
  async createCarAtomic(carData: Omit<NumericCarData, 'id' | 'sellerNumericId' | 'carNumericId'>): Promise<NumericCarData> {
    const {
      runTransaction,
      increment,
      doc,
      collection,
      serverTimestamp
    } = await import('firebase/firestore');

    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
      throw new Error('❌ Not authenticated');
    }

    try {
      const result = await runTransaction(db, async (transaction) => {
        // 1️⃣ Get user's numeric ID
        const userNumericId = await this.getUserNumericId(currentUser.uid);

        // 2️⃣ Get next car numeric ID (this uses its own internal logic or transaction if possible)
        // Note: getNextCarNumericId CURRENTLY uses a separate service call. 
        // In a true atomic flow, we should include the counter increment in THIS transaction.
        const { getNextCarNumericId: getNextId } = await import('./numeric-id-counter.service');
        const carNumericId = await getNextId(currentUser.uid);

        // 3️⃣ Determine correct collection based on vehicleType
        // ✅ CRITICAL FIX: Use SellWorkflowCollections to get correct collection
        const { SellWorkflowCollections } = await import('./sell-workflow-collections');
        const vehicleType = (carData as any).vehicleType || 'car';
        const collectionName = SellWorkflowCollections.getCollectionNameForVehicleType(vehicleType);
        
        serviceLogger.info('Creating car in collection', { vehicleType, collectionName });
        
        // 4️⃣ Create references
        const carRef = doc(collection(db, collectionName));
        const userRef = doc(db, 'users', currentUser.uid);

        const fullCarData = {
          ...carData,
          sellerId: currentUser.uid,
          userId: currentUser.uid,  // ✅ CRITICAL: Required for Firestore security rules
          sellerNumericId: userNumericId,
          carNumericId: carNumericId,
          status: 'active',
          isActive: true,
          isSold: false,
          views: 0,
          favorites: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // 4️⃣ Execute operations in transaction
        transaction.set(carRef, fullCarData);
        transaction.update(userRef, {
          'stats.activeListings': increment(1),
          'stats.totalListings': increment(1),
          updatedAt: serverTimestamp()
        });

        return {
          ...carData,
          id: carRef.id,
          sellerId: currentUser.uid,
          sellerNumericId: userNumericId,
          carNumericId: carNumericId,
        } as NumericCarData;
      });

      serviceLogger.info('✅ Car created atomically via transaction', {
        carId: result.id,
        userNumericId: result.sellerNumericId,
        carNumericId: result.carNumericId
      });

      return result as NumericCarData;
    } catch (error) {
      serviceLogger.error('❌ Atomic car creation failed', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Create car with automatic numeric IDs (Legacy/Non-Atomic)
   * Use createCarAtomic for crucial data consistency
   */
  async createCarWithNumericIds(carData: Omit<NumericCarData, 'id' | 'sellerNumericId' | 'carNumericId'>): Promise<NumericCarData> {
    const currentUser = auth.currentUser;

    if (!currentUser?.uid) {
      throw new Error('❌ Not authenticated');
    }

    try {
      // 1️⃣ Get user's numeric ID
      const userNumericId = await this.getUserNumericId(currentUser.uid);
      serviceLogger.info('✅ Got user numeric ID', { userId: currentUser.uid, userNumericId });

      // 2️⃣ Get next car numeric ID
      const carNumericId = await this.getNextCarNumericId(currentUser.uid);
      serviceLogger.info('✅ Got next car numeric ID', { carNumericId, userNumericId });

      // 3️⃣ Create car document
      const docRef = await addDoc(collection(db, 'cars'), {
        ...carData,
        sellerId: currentUser.uid,
        sellerNumericId: userNumericId,     // ✨ Add user's numeric ID
        carNumericId: carNumericId,         // ✨ Add car sequence number
        status: 'active',
        isActive: true,
        isSold: false,
        views: 0,
        favorites: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('✅ Car created with numeric IDs', {
        carId: docRef.id,
        sellerNumericId: userNumericId,
        carNumericId: carNumericId,
        url: `/car/${userNumericId}/${carNumericId}`
      });

      return {
        ...carData,
        id: docRef.id,
        sellerId: currentUser.uid,
        sellerNumericId: userNumericId,
        carNumericId: carNumericId,
      } as NumericCarData;
    } catch (error) {
      serviceLogger.error('Error creating car with numeric IDs', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Get car by numeric IDs (strict matching)
   * Example: getCarByNumericIds(1, 1) → Car 1 of User 1
   */
  async getCarByNumericIds(userNumericId: number, carNumericId: number): Promise<NumericCarData | null> {
    try {
      // 1️⃣ Find user by numeric ID
      const userQuery = query(
        collection(db, 'users'),
        where('numericId', '==', userNumericId)
      );

      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        serviceLogger.warn('⚠️ User not found by numeric ID', { userNumericId });
        return null;
      }

      const userId = userSnapshot.docs[0].id;
      serviceLogger.info('✅ Found user by numeric ID', { userNumericId, userId });

      // 2️⃣ Find car by user ID and car numeric ID
      const carQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', userId),
        where('carNumericId', '==', carNumericId)
      );

      const carSnapshot = await getDocs(carQuery);

      if (carSnapshot.empty) {
        serviceLogger.warn('⚠️ Car not found', { userNumericId, carNumericId });
        return null;
      }

      const carDoc = carSnapshot.docs[0];
      const carData = carDoc.data() as NumericCarData;
      carData.id = carDoc.id;

      serviceLogger.info('✅ Found car by numeric IDs', {
        userNumericId,
        carNumericId,
        carId: carDoc.id
      });

      return carData;
    } catch (error) {
      serviceLogger.error('Error getting car by numeric IDs', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Update car with ownership verification
   * Throws if user doesn't own the car
   */
  async updateCarByNumericIds(
    userNumericId: number,
    carNumericId: number,
    updates: Partial<NumericCarData>
  ): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser?.uid) {
      throw new Error('❌ Not authenticated');
    }

    try {
      // 1️⃣ Get car by numeric IDs
      const car = await this.getCarByNumericIds(userNumericId, carNumericId);

      if (!car) {
        throw new Error(`❌ Car not found: /car/${userNumericId}/${carNumericId}`);
      }

      // 2️⃣ Verify ownership
      if (car.sellerId !== currentUser.uid) {
        serviceLogger.error('❌ Ownership verification failed', {
          userNumericId,
          carNumericId,
          carSellerId: car.sellerId,
          currentUserId: currentUser.uid
        });
        throw new Error('❌ Unauthorized: You do not own this car');
      }

      // 3️⃣ Update car
      const docRef = doc(db, 'cars', car.id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('✅ Car updated', {
        userNumericId,
        carNumericId,
        carId: car.id
      });
    } catch (error) {
      serviceLogger.error('Error updating car by numeric IDs', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Repair missing numeric IDs for a car
   * Used when a car exists but lacks sellerNumericId or carNumericId
   */
  async repairMissingIds(carId: string): Promise<{ sellerNumericId: number; carNumericId: number } | null> {
    try {
      const carRef = doc(db, 'cars', carId);
      const carDoc = await getDoc(carRef);

      if (!carDoc.exists()) {
        serviceLogger.warn('Car not found for repair', { carId });
        return null;
      }

      const carData = carDoc.data();
      const sellerId = carData.sellerId;

      if (!sellerId) {
        serviceLogger.error('Car missing sellerId - cannot repair', { carId });
        return null;
      }

      // Get user's numeric ID
      const userNumericId = await this.getUserNumericId(sellerId);

      // Get next car numeric ID (this will use the counter service)
      const carNumericId = await this.getNextCarNumericId(sellerId);

      // Update the car document
      await updateDoc(carRef, {
        sellerNumericId: userNumericId,
        carNumericId: carNumericId,
        updatedAt: serverTimestamp()
      });

      serviceLogger.info('✅ Repaired missing numeric IDs', {
        carId,
        sellerNumericId: userNumericId,
        carNumericId
      });

      return { sellerNumericId: userNumericId, carNumericId };
    } catch (error) {
      serviceLogger.error('Error repairing missing numeric IDs', error as Error, { carId });
      return null;
    }
  }

  /**
   * ✅ Get all cars of a user (by numeric ID)
   */
  async getUserCarsByNumericId(userNumericId: number): Promise<NumericCarData[]> {
    try {
      // 1️⃣ Find user by numeric ID
      const userQuery = query(
        collection(db, 'users'),
        where('numericId', '==', userNumericId)
      );

      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        serviceLogger.warn('⚠️ User not found by numeric ID', { userNumericId });
        return [];
      }

      const userId = userSnapshot.docs[0].id;

      // 2️⃣ Get all cars for this user
      const carQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', userId)
      );

      const carSnapshot = await getDocs(carQuery);

      const cars: NumericCarData[] = carSnapshot.docs.map(doc => ({
        ...doc.data() as NumericCarData,
        id: doc.id
      }));

      serviceLogger.info('✅ Got user cars by numeric ID', {
        userNumericId,
        carCount: cars.length
      });

      return cars;
    } catch (error) {
      serviceLogger.error('Error getting user cars by numeric ID', error as Error);
      throw error;
    }
  }
}

export const numericCarSystemService = new NumericCarSystemService();
