// Personal Vehicle Service
// خدمة إدارة المركبات الشخصية

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { PersonalVehicle } from '../types/personal-vehicle.types';
import { logger } from './logger-service';
import { MarketValueService } from './market-value.service';
import { VehicleReminderService } from './vehicle-reminder.service';

const COLLECTION_NAME = 'userVehicles';

export class PersonalVehicleService {
  /**
   * Save a personal vehicle
   */
  static async saveVehicle(
    userId: string,
    vehicleData: Omit<PersonalVehicle, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const vehicleRef = doc(collection(db, COLLECTION_NAME));
      const vehicleId = vehicleRef.id;

      const vehicle: PersonalVehicle = {
        ...vehicleData,
        id: vehicleId,
        userId,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await setDoc(vehicleRef, {
        ...vehicle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Calculate and update market value
      try {
        const marketValue = await MarketValueService.calculateMarketValue(vehicle);
        if (marketValue) {
          await updateDoc(vehicleRef, {
            marketValue,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        logger.warn('Failed to calculate market value', { vehicleId, error });
        // Don't fail the save if market value calculation fails
      }

      // Create reminders for the vehicle
      try {
        await VehicleReminderService.createRemindersForVehicle(userId, vehicle);
      } catch (error) {
        logger.warn('Failed to create reminders', { vehicleId, error });
        // Don't fail the save if reminder creation fails
      }

      logger.info('Personal vehicle saved', { vehicleId, userId });
      return vehicleId;
    } catch (error) {
      logger.error('Failed to save personal vehicle', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get all vehicles for a user
   */
  static async getUserVehicles(userId: string): Promise<PersonalVehicle[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const vehicles: PersonalVehicle[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        vehicles.push({
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now(),
        } as PersonalVehicle);
      });

      logger.info('User vehicles loaded', { userId, count: vehicles.length });
      return vehicles;
    } catch (error) {
      logger.error('Failed to load user vehicles', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get a single vehicle by ID
   */
  static async getVehicle(vehicleId: string): Promise<PersonalVehicle | null> {
    try {
      const vehicleRef = doc(db, COLLECTION_NAME, vehicleId);
      const vehicleSnap = await getDoc(vehicleRef);

      if (!vehicleSnap.exists()) {
        return null;
      }

      const data = vehicleSnap.data();
      return {
        id: vehicleSnap.id,
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
      } as PersonalVehicle;
    } catch (error) {
      logger.error('Failed to load vehicle', error as Error, { vehicleId });
      throw error;
    }
  }

  /**
   * Update a vehicle
   */
  static async updateVehicle(
    vehicleId: string,
    updates: Partial<Omit<PersonalVehicle, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> {
    try {
      const vehicleRef = doc(db, COLLECTION_NAME, vehicleId);
      await updateDoc(vehicleRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      logger.info('Vehicle updated', { vehicleId });
    } catch (error) {
      logger.error('Failed to update vehicle', error as Error, { vehicleId });
      throw error;
    }
  }

  /**
   * Delete a vehicle
   */
  static async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      const vehicleRef = doc(db, COLLECTION_NAME, vehicleId);
      await deleteDoc(vehicleRef);

      logger.info('Vehicle deleted', { vehicleId });
    } catch (error) {
      logger.error('Failed to delete vehicle', error as Error, { vehicleId });
      throw error;
    }
  }
}
