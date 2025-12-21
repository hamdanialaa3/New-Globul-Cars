/**
 * Numeric ID Counter Service
 * Manages auto-incrementing numeric IDs for users and cars
 */

import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from './logger-service';

/**
 * Get next numeric ID for users
 * Uses Firestore transaction to ensure uniqueness
 */
export const getNextUserNumericId = async (): Promise<number> => {
  const counterRef = doc(db, 'counters', 'users');
  
  try {
    const newId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 0;
      if (counterDoc.exists()) {
        currentCount = counterDoc.data()?.count || 0;
      }
      
      const nextId = currentCount + 1;
      
      transaction.set(counterRef, { count: nextId, updatedAt: new Date() }, { merge: true });
      
      return nextId;
    });
    
    logger.info('Generated new user numeric ID', { numericId: newId });
    return newId;
  } catch (error) {
    logger.error('Failed to generate user numeric ID', error as Error);
    throw new Error('Failed to generate numeric ID');
  }
};

/**
 * Get next numeric ID for a car (per seller)
 * Format: Each seller has their own counter (seller's 1st car = 1, 2nd car = 2, etc.)
 */
export const getNextCarNumericId = async (sellerId: string): Promise<number> => {
  const counterRef = doc(db, 'counters', 'cars', 'sellers', sellerId);
  
  try {
    const newId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 0;
      if (counterDoc.exists()) {
        currentCount = counterDoc.data()?.count || 0;
      }
      
      const nextId = currentCount + 1;
      
      transaction.set(counterRef, { count: nextId, updatedAt: new Date() }, { merge: true });
      
      return nextId;
    });
    
    logger.info('Generated new car numeric ID', { sellerId, numericId: newId });
    return newId;
  } catch (error) {
    logger.error('Failed to generate car numeric ID', error as Error, { sellerId });
    throw new Error('Failed to generate car numeric ID');
  }
};

/**
 * Get current user count (for reference)
 */
export const getUserCount = async (): Promise<number> => {
  const counterRef = doc(db, 'counters', 'users');
  const counterDoc = await getDoc(counterRef);
  return counterDoc.exists() ? (counterDoc.data()?.count || 0) : 0;
};

/**
 * Get current car count for a seller (for reference)
 */
export const getSellerCarCount = async (sellerId: string): Promise<number> => {
  const counterRef = doc(db, 'counters', 'cars', 'sellers', sellerId);
  const counterDoc = await getDoc(counterRef);
  return counterDoc.exists() ? (counterDoc.data()?.count || 0) : 0;
};

/**
 * Initialize counters collection (run once during setup)
 */
export const initializeCounters = async (): Promise<void> => {
  try {
    const counterRef = doc(db, 'counters', 'users');
    const counterDoc = await getDoc(counterRef);
    
    if (!counterDoc.exists()) {
      await runTransaction(db, async (transaction) => {
        transaction.set(counterRef, { 
          count: 0, 
          createdAt: new Date(),
          updatedAt: new Date() 
        });
      });
      logger.info('Initialized user counter');
    }
  } catch (error) {
    logger.error('Failed to initialize counters', error as Error);
  }
};
