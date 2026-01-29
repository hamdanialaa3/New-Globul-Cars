/**
 * Availability Calendar Service
 * Manages user availability calendar
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import type {
  AvailabilityCalendar,
  DayAvailability,
  TimeSlot
} from '../../types/profile-enhancements.types';

export class AvailabilityCalendarService {
  private static instance: AvailabilityCalendarService;
  private readonly collectionName = 'availabilityCalendars';

  private constructor() {}

  public static getInstance(): AvailabilityCalendarService {
    if (!AvailabilityCalendarService.instance) {
      AvailabilityCalendarService.instance = new AvailabilityCalendarService();
    }
    return AvailabilityCalendarService.instance;
  }

  /**
   * Get user's availability calendar
   */
  async getCalendar(userId: string): Promise<AvailabilityCalendar | null> {
    try {
      if (!userId) return null;

      const calendarRef = doc(db, this.collectionName, userId);
      const calendarSnap = await getDoc(calendarRef);

      if (!calendarSnap.exists()) {
        return null;
      }

      return calendarSnap.data() as AvailabilityCalendar;
    } catch (error) {
      serviceLogger.error('Error getting calendar:', error);
      return null;
    }
  }

  /**
   * Create or update availability calendar
   */
  async saveCalendar(
    userId: string,
    calendarData: Partial<AvailabilityCalendar>
  ): Promise<void> {
    try {
      if (!userId) {
        throw new Error('Invalid userId');
      }

      const calendarRef = doc(db, this.collectionName, userId);
      const existing = await this.getCalendar(userId);

      const calendar: AvailabilityCalendar = {
        userId,
        timezone: calendarData.timezone || 'Europe/Sofia',
        defaultAvailability: calendarData.defaultAvailability || this.getDefaultAvailability(),
        customDates: calendarData.customDates || [],
        updatedAt: serverTimestamp() as any
      };

      await setDoc(calendarRef, calendar, { merge: true });
      serviceLogger.info(`Calendar saved for user: ${userId}`);
    } catch (error) {
      serviceLogger.error('Error saving calendar:', error);
      throw error;
    }
  }

  /**
   * Update default availability for a day of week
   */
  async updateDefaultAvailability(
    userId: string,
    dayOfWeek: number, // 0-6 (Sunday-Saturday)
    isAvailable: boolean,
    timeSlots: TimeSlot[]
  ): Promise<void> {
    try {
      const calendar = await this.getCalendar(userId);
      if (!calendar) {
        await this.saveCalendar(userId, {
          defaultAvailability: {
            [dayOfWeek]: { isAvailable, timeSlots }
          }
        });
        return;
      }

      const calendarRef = doc(db, this.collectionName, userId);
      await updateDoc(calendarRef, {
        [`defaultAvailability.${dayOfWeek}`]: {
          isAvailable,
          timeSlots
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error updating default availability:', error);
      throw error;
    }
  }

  /**
   * Add or update custom date availability
   */
  async setCustomDateAvailability(
    userId: string,
    date: string, // YYYY-MM-DD
    dayAvailability: DayAvailability
  ): Promise<void> {
    try {
      const calendar = await this.getCalendar(userId);
      if (!calendar) {
        await this.saveCalendar(userId, {
          customDates: [dayAvailability]
        });
        return;
      }

      const customDates = calendar.customDates || [];
      const existingIndex = customDates.findIndex(d => d.date === date);

      if (existingIndex >= 0) {
        customDates[existingIndex] = dayAvailability;
      } else {
        customDates.push(dayAvailability);
      }

      const calendarRef = doc(db, this.collectionName, userId);
      await updateDoc(calendarRef, {
        customDates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error setting custom date availability:', error);
      throw error;
    }
  }

  /**
   * Get availability for a specific date
   */
  async getDateAvailability(
    userId: string,
    date: string // YYYY-MM-DD
  ): Promise<DayAvailability | null> {
    try {
      const calendar = await this.getCalendar(userId);
      if (!calendar) {
        return null;
      }

      // Check custom dates first
      const customDate = calendar.customDates?.find(d => d.date === date);
      if (customDate) {
        return customDate;
      }

      // Use default for day of week
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const defaultAvail = calendar.defaultAvailability[dayOfWeek];

      if (defaultAvail) {
        return {
          date,
          dayOfWeek,
          isAvailable: defaultAvail.isAvailable,
          timeSlots: defaultAvail.timeSlots || []
        };
      }

      return null;
    } catch (error) {
      serviceLogger.error('Error getting date availability:', error);
      return null;
    }
  }

  /**
   * Get default availability structure
   */
  private getDefaultAvailability(): AvailabilityCalendar['defaultAvailability'] {
    return {
      0: { isAvailable: false, timeSlots: [] }, // Sunday
      1: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Monday
      2: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Tuesday
      3: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Wednesday
      4: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Thursday
      5: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Friday
      6: { isAvailable: false, timeSlots: [] } // Saturday
    };
  }

  /**
   * Check if user is available at a specific time
   */
  async isAvailableAt(
    userId: string,
    date: string, // YYYY-MM-DD
    time: string // HH:mm
  ): Promise<boolean> {
    try {
      const dayAvailability = await this.getDateAvailability(userId, date);
      if (!dayAvailability || !dayAvailability.isAvailable) {
        return false;
      }

      // Check if time falls within any available time slot
      return dayAvailability.timeSlots.some(slot => {
        if (!slot.available) return false;
        return time >= slot.start && time <= slot.end;
      });
    } catch (error) {
      serviceLogger.error('Error checking availability:', error);
      return false;
    }
  }
}

export const availabilityCalendarService = AvailabilityCalendarService.getInstance();

