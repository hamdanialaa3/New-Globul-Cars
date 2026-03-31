import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { GarageVehicle } from './garage-types';
import { logger } from '../logger-service';

const COLLECTION_NAME = 'garage_vehicles';

export const garageService = {
  /**
   * Add a new vehicle to the user's digital garage
   */
  async addVehicle(ownerUid: string, data: Omit<GarageVehicle, 'id' | 'createdAt' | 'updatedAt' | 'ownerUid'>): Promise<string> {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME));
      const now = Timestamp.now();
      
      const newVehicle: GarageVehicle = {
        ...data,
        id: docRef.id,
        ownerUid,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(docRef, newVehicle);
      logger.info('garageService', `Vehicle ${docRef.id} added for user ${ownerUid}`);
      return docRef.id;
    } catch (error) {
      logger.error('garageService', 'Error adding vehicle', { error, ownerUid });
      throw error;
    }
  },

  /**
   * Get all vehicles for a specific user
   */
  async getUserVehicles(ownerUid: string): Promise<GarageVehicle[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('ownerUid', '==', ownerUid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as GarageVehicle);
    } catch (error) {
      logger.error('garageService', 'Error fetching user vehicles', { error, ownerUid });
      // If index is missing, it will throw a FirebaseError. 
      // Return empty array as fallback if index isn't ready.
      return [];
    }
  },

  /**
   * Update an existing garage vehicle
   */
  async updateVehicle(vehicleId: string, data: Partial<Omit<GarageVehicle, 'id' | 'ownerUid' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, vehicleId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      logger.info('garageService', `Vehicle ${vehicleId} updated successfully`);
    } catch (error) {
      logger.error('garageService', `Error updating vehicle ${vehicleId}`, { error });
      throw error;
    }
  },

  /**
   * Delete a vehicle from the garage
   */
  async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, vehicleId);
      await deleteDoc(docRef);
      logger.info('garageService', `Vehicle ${vehicleId} deleted`);
    } catch (error) {
      logger.error('garageService', `Error deleting vehicle ${vehicleId}`, { error });
      throw error;
    }
  }
};
