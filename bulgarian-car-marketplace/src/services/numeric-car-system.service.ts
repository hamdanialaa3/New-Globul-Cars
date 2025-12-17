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
import { serviceLogger } from './logger-wrapper';
import { SocialAuthService } from '../firebase/social-auth-service';

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
    const userProfile = await SocialAuthService.getBulgarianUserProfile(userId);

    if (!userProfile || !userProfile.numericId) {
      throw new Error(`❌ User profile not found or numericId not assigned: ${userId}`);
    }

    return userProfile.numericId;
  }

  /**
   * ✅ Get the next carNumericId for a user
   * Example: If user has cars 1, 2, 3 → returns 4
   */
  async getNextCarNumericId(userId: string): Promise<number> {
    try {
      const userNumericId = await this.getUserNumericId(userId);

      // Get all cars for this user
      const q = query(
        collection(db, 'cars'),
        where('sellerId', '==', userId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return 1; // First car
      }

      // Find the highest carNumericId
      let maxId = 0;
      snapshot.docs.forEach(doc => {
        const carNumericId = (doc.data() as any).carNumericId || 0;
        if (typeof carNumericId === 'number' && carNumericId > maxId) {
          maxId = carNumericId;
        }
      });

      return maxId + 1;
    } catch (error) {
      serviceLogger.error('Error getting next carNumericId', error as Error);
      throw error;
    }
  }

  /**
   * ✅ Create car with automatic numeric IDs
   * Sets: sellerNumericId, carNumericId
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
        id: docRef.id,
        sellerId: currentUser.uid,
        sellerNumericId: userNumericId,
        carNumericId: carNumericId,
        ...carData
      };
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
        id: doc.id,
        ...doc.data() as NumericCarData
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
