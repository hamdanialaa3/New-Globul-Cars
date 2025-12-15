/**
 * Numeric ID Counter Service (Cloud Functions)
 * Manages auto-incrementing numeric IDs for users and cars
 */

import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Get next numeric ID for users
 * Uses Firestore transaction to ensure uniqueness
 */
export const getNextUserNumericId = async (): Promise<number> => {
  const counterRef = db.collection('counters').doc('users');
  
  try {
    const newId = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 0;
      if (counterDoc.exists) {
        currentCount = counterDoc.data()?.count || 0;
      }
      
      const nextId = currentCount + 1;
      
      transaction.set(counterRef, { count: nextId, updatedAt: new Date() }, { merge: true });
      
      return nextId;
    });
    
    console.log('Generated new user numeric ID', { numericId: newId });
    return newId;
  } catch (error) {
    console.error('Failed to generate user numeric ID', error);
    throw new Error('Failed to generate numeric ID');
  }
};

/**
 * Get next numeric ID for cars within a user's collection
 * Uses Firestore transaction to ensure uniqueness per user
 */
export const getNextCarNumericId = async (userId: string): Promise<number> => {
  const counterRef = db.collection('users').doc(userId).collection('counters').doc('cars');
  
  try {
    const newId = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 0;
      if (counterDoc.exists) {
        currentCount = counterDoc.data()?.count || 0;
      }
      
      const nextId = currentCount + 1;
      
      transaction.set(counterRef, { count: nextId, updatedAt: new Date() }, { merge: true });
      
      return nextId;
    });
    
    console.log('Generated new car numeric ID', { userId, numericId: newId });
    return newId;
  } catch (error) {
    console.error('Failed to generate car numeric ID', error);
    throw new Error('Failed to generate numeric ID');
  }
};

/**
 * Reset counter (for testing/cleanup)
 */
export const resetUserCounter = async (): Promise<void> => {
  await db.collection('counters').doc('users').set({ count: 0 });
};

export const resetCarCounter = async (userId: string): Promise<void> => {
  await db.collection('users').doc(userId).collection('counters').doc('cars').set({ count: 0 });
};
