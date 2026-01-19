// Vehicle Reminder Service
// خدمة تذكيرات المركبات

import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { VehicleReminder, PersonalVehicle } from '../types/personal-vehicle.types';
import { logger } from './logger-service';

const COLLECTION_NAME = 'vehicleReminders';

export class VehicleReminderService {
  /**
   * Schedule an inspection reminder
   */
  static async scheduleInspectionReminder(
    userId: string,
    vehicleId: string,
    dueDate: Date
  ): Promise<string> {
    try {
      const reminderRef = doc(collection(db, COLLECTION_NAME));
      const reminderId = reminderRef.id;

      const reminder: VehicleReminder = {
        id: reminderId,
        userId,
        vehicleId,
        type: 'inspection',
        title: 'Technical Inspection Due',
        dueDate: Timestamp.fromDate(dueDate),
        isCompleted: false,
        notificationSent: false,
        createdAt: Timestamp.now(),
      };

      await setDoc(reminderRef, {
        ...reminder,
        createdAt: serverTimestamp(),
      });

      logger.info('Inspection reminder scheduled', { reminderId, vehicleId, dueDate });
      return reminderId;
    } catch (error) {
      logger.error('Failed to schedule inspection reminder', error as Error, { vehicleId });
      throw error;
    }
  }

  /**
   * Schedule a service reminder based on mileage
   */
  static async scheduleServiceReminder(
    userId: string,
    vehicleId: string,
    currentMileage: number,
    serviceInterval: number = 15000 // Default: every 15,000 km
  ): Promise<string> {
    try {
      const nextServiceMileage = currentMileage + serviceInterval;
      // Estimate date based on annual mileage (assume 15,000 km/year)
      const estimatedDays = (serviceInterval / 15000) * 365;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + estimatedDays);

      const reminderRef = doc(collection(db, COLLECTION_NAME));
      const reminderId = reminderRef.id;

      const reminder: VehicleReminder = {
        id: reminderId,
        userId,
        vehicleId,
        type: 'service',
        title: `Service Due at ${nextServiceMileage.toLocaleString()} km`,
        dueDate: Timestamp.fromDate(dueDate),
        isCompleted: false,
        notificationSent: false,
        createdAt: Timestamp.now(),
      };

      await setDoc(reminderRef, {
        ...reminder,
        createdAt: serverTimestamp(),
      });

      logger.info('Service reminder scheduled', { reminderId, vehicleId, nextServiceMileage });
      return reminderId;
    } catch (error) {
      logger.error('Failed to schedule service reminder', error as Error, { vehicleId });
      throw error;
    }
  }

  /**
   * Schedule a tire change reminder
   */
  static async scheduleTireChangeReminder(
    userId: string,
    vehicleId: string,
    monthsUntilDue: number = 6
  ): Promise<string> {
    try {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + monthsUntilDue);

      const reminderRef = doc(collection(db, COLLECTION_NAME));
      const reminderId = reminderRef.id;

      const reminder: VehicleReminder = {
        id: reminderId,
        userId,
        vehicleId,
        type: 'tire-change',
        title: 'Tire Change Due',
        dueDate: Timestamp.fromDate(dueDate),
        isCompleted: false,
        notificationSent: false,
        createdAt: Timestamp.now(),
      };

      await setDoc(reminderRef, {
        ...reminder,
        createdAt: serverTimestamp(),
      });

      logger.info('Tire change reminder scheduled', { reminderId, vehicleId, dueDate });
      return reminderId;
    } catch (error) {
      logger.error('Failed to schedule tire change reminder', error as Error, { vehicleId });
      throw error;
    }
  }

  /**
   * Get upcoming reminders for a user
   */
  static async getUpcomingReminders(
    userId: string,
    limit: number = 10
  ): Promise<VehicleReminder[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('isCompleted', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const reminders: VehicleReminder[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        reminders.push({
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
        } as VehicleReminder);
      });

      // Sort by due date and limit
      reminders.sort((a, b) => {
        const dateA = a.dueDate.toMillis();
        const dateB = b.dueDate.toMillis();
        return dateA - dateB;
      });

      logger.info('Upcoming reminders loaded', { userId, count: reminders.length });
      return reminders.slice(0, limit);
    } catch (error) {
      logger.error('Failed to load reminders', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Mark reminder as completed
   */
  static async completeReminder(reminderId: string): Promise<void> {
    try {
      const reminderRef = doc(db, COLLECTION_NAME, reminderId);
      await updateDoc(reminderRef, {
        isCompleted: true,
        updatedAt: serverTimestamp(),
      });

      logger.info('Reminder completed', { reminderId });
    } catch (error) {
      logger.error('Failed to complete reminder', error as Error, { reminderId });
      throw error;
    }
  }

  /**
   * Delete a reminder
   */
  static async deleteReminder(reminderId: string): Promise<void> {
    try {
      const reminderRef = doc(db, COLLECTION_NAME, reminderId);
      await deleteDoc(reminderRef);

      logger.info('Reminder deleted', { reminderId });
    } catch (error) {
      logger.error('Failed to delete reminder', error as Error, { reminderId });
      throw error;
    }
  }

  /**
   * Create reminders for a vehicle based on its data
   */
  static async createRemindersForVehicle(
    userId: string,
    vehicle: PersonalVehicle
  ): Promise<void> {
    try {
      // Inspection reminder
      if (vehicle.inspectionValidUntil) {
        const inspectionDate = new Date(
          vehicle.inspectionValidUntil?.year || new Date().getFullYear(),
          (vehicle.inspectionValidUntil?.month || 1) - 1,
          1
        );
        await this.scheduleInspectionReminder(userId, vehicle.id, inspectionDate);
      }

      // Service reminder (based on mileage)
      if (vehicle.currentMileage && vehicle.annualMileage) {
        await this.scheduleServiceReminder(
          userId,
          vehicle.id,
          vehicle.currentMileage,
          15000 // Default service interval
        );
      }

      // Tire change reminder (every 6 months or based on mileage)
      await this.scheduleTireChangeReminder(userId, vehicle.id, 6);

      logger.info('Reminders created for vehicle', { vehicleId: vehicle.id });
    } catch (error) {
      logger.error('Failed to create reminders', error as Error, { vehicleId: vehicle.id });
      // Don't throw - reminders are optional
    }
  }
}
