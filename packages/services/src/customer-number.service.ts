// Customer Number Service
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Generates and manages unique customer numbers for users

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@globul-cars/services';
import { logger } from './logger-service';

/**
 * Customer Number Format: YYYYMMDD-XXXX
 * Example: 20241028-0001
 * - YYYYMMDD: Registration date
 * - XXXX: Sequential number (padded to 4 digits)
 */

class CustomerNumberService {
  private readonly COLLECTION = 'users';
  private readonly COUNTER_DOC = 'system/customerCounter';

  /**
   * Generate customer number for new user
   * Format: YYYYMMDD-XXXX
   */
  async generateCustomerNumber(userId: string): Promise<string> {
    try {
      // Check if user already has customer number
      const userDoc = await getDoc(doc(db, this.COLLECTION, userId));
      if (userDoc.exists() && userDoc.data().customerNumber) {
        return userDoc.data().customerNumber;
      }

      // Get today's date in YYYYMMDD format
      const today = new Date();
      const datePrefix = today.toISOString().split('T')[0].replace(/-/g, '');

      // Get and increment counter
      const counter = await this.getNextCounter(datePrefix);

      // Format: YYYYMMDD-XXXX
      const customerNumber = `${datePrefix}-${counter.toString().padStart(4, '0')}`;

      // Save to user document
      await updateDoc(doc(db, this.COLLECTION, userId), {
        customerNumber,
        customerNumberGeneratedAt: new Date()
      });

      logger.info('Customer number generated', { userId, customerNumber });

      return customerNumber;
    } catch (error) {
      logger.error('Error generating customer number', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get or create customer number for user
   */
  async getCustomerNumber(userId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION, userId));
      
      if (userDoc.exists() && userDoc.data().customerNumber) {
        return userDoc.data().customerNumber;
      }

      // Generate if doesn't exist
      return await this.generateCustomerNumber(userId);
    } catch (error) {
      logger.error('Error getting customer number', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get next counter for date prefix
   */
  private async getNextCounter(datePrefix: string): Promise<number> {
    try {
      const counterRef = doc(db, this.COUNTER_DOC);
      const counterDoc = await getDoc(counterRef);

      let counter = 1;
      let counters: Record<string, number> = {};

      if (counterDoc.exists()) {
        counters = counterDoc.data().counters || {};
        counter = (counters[datePrefix] || 0) + 1;
      }

      // Update counter
      counters[datePrefix] = counter;
      await setDoc(counterRef, { counters }, { merge: true });

      return counter;
    } catch (error) {
      logger.error('Error getting counter', error as Error, { datePrefix });
      // Fallback to random number if counter fails
      return Math.floor(Math.random() * 9000) + 1000;
    }
  }

  /**
   * Validate customer number format
   */
  validateCustomerNumber(customerNumber: string): boolean {
    const pattern = /^\d{8}-\d{4}$/;
    return pattern.test(customerNumber);
  }

  /**
   * Parse customer number to get registration date
   */
  parseCustomerNumber(customerNumber: string): { date: Date; sequence: number } | null {
    try {
      if (!this.validateCustomerNumber(customerNumber)) {
        return null;
      }

      const [dateStr, seqStr] = customerNumber.split('-');
      
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
      const day = parseInt(dateStr.substring(6, 8));
      
      const date = new Date(year, month, day);
      const sequence = parseInt(seqStr);

      return { date, sequence };
    } catch (error) {
      logger.error('Error parsing customer number', error as Error, { customerNumber });
      return null;
    }
  }

  /**
   * Get registration year from customer number
   */
  getRegistrationYear(customerNumber: string): number | null {
    const parsed = this.parseCustomerNumber(customerNumber);
    return parsed ? parsed.date.getFullYear() : null;
  }
}

export const customerNumberService = new CustomerNumberService();
export default customerNumberService;

