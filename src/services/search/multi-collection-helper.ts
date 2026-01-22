/**
 * Multi-Collection Helper
 * ✅ CRITICAL FIX: Centralized helper for querying ALL vehicle collections
 * 
 * Purpose: Replace all `collection(db, 'cars')` calls with multi-collection support
 * Usage: Import and use these helpers instead of direct Firestore queries
 */

import { collection, query, getDocs, Query, QueryConstraint, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ✅ ALL VEHICLE COLLECTIONS
export const VEHICLE_COLLECTIONS = [
  'cars',             // Legacy collection
  'passenger_cars',   // Personal cars
  'suvs',             // SUVs/Jeeps
  'vans',             // Vans/Cargo
  'motorcycles',      // Motorcycles
  'trucks',           // Trucks
  'buses'             // Buses
] as const;

export type VehicleCollection = typeof VEHICLE_COLLECTIONS[number];

/**
 * Query all vehicle collections in parallel
 * Returns combined results from all collections
 */
export async function queryAllCollections<T = DocumentData>(
  ...queryConstraints: QueryConstraint[]
): Promise<Array<T & { id: string; _collection?: string }>> {
  const startTime = performance.now();
  
  try {
    // Build queries for all collections
    const queries = VEHICLE_COLLECTIONS.map(collectionName => {
      const q = query(collection(db, collectionName), ...queryConstraints);
      return { collectionName, query: q };
    });

    // Execute all queries in parallel
    const results = await Promise.all(
      queries.map(async ({ collectionName, query: q }) => {
        try {
          const snapshot = await getDocs(q);
          const docs = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            _collection: collectionName,
            ...doc.data()
          } as T & { id: string; _collection?: string }));
          
          if (docs.length > 0) {
            logger.debug(`Found ${docs.length} items in ${collectionName}`);
          }
          
          return docs;
        } catch (error) {
          logger.warn(`Error querying ${collectionName}:`, error);
          return [];
        }
      })
    );

    // Flatten results
    const allDocs = results.flat();
    const duration = performance.now() - startTime;
    
    logger.info(`Multi-collection query completed: ${allDocs.length} items from ${VEHICLE_COLLECTIONS.length} collections in ${duration.toFixed(2)}ms`);
    
    return allDocs;
  } catch (error) {
    logger.error('Multi-collection query failed:', error);
    throw error;
  }
}

/**
 * Get all documents from all vehicle collections (no filters)
 * Useful for analytics, counts, etc.
 */
export async function getAllVehicles<T = DocumentData>(): Promise<Array<T & { id: string; _collection?: string }>> {
  return queryAllCollections<T>();
}

/**
 * Get count of all vehicles across all collections
 */
export async function countAllVehicles(): Promise<number> {
  try {
    const results = await Promise.all(
      VEHICLE_COLLECTIONS.map(async (collectionName) => {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          return snapshot.size;
        } catch (error) {
          logger.warn(`Error counting ${collectionName}:`, error);
          return 0;
        }
      })
    );

    const total = results.reduce((sum, count) => sum + count, 0);
    logger.debug(`Total vehicle count: ${total} across ${VEHICLE_COLLECTIONS.length} collections`);
    
    return total;
  } catch (error) {
    logger.error('Count all vehicles failed:', error);
    return 0;
  }
}

/**
 * Query specific collections only
 */
export async function querySpecificCollections<T = DocumentData>(
  collections: readonly string[],
  ...queryConstraints: QueryConstraint[]
): Promise<Array<T & { id: string; _collection?: string }>> {
  const startTime = performance.now();
  
  try {
    const results = await Promise.all(
      collections.map(async (collectionName) => {
        try {
          const q = query(collection(db, collectionName), ...queryConstraints);
          const snapshot = await getDocs(q);
          
          return snapshot.docs.map((doc: any) => ({
            id: doc.id,
            _collection: collectionName,
            ...doc.data()
          } as T & { id: string; _collection?: string }));
        } catch (error) {
          logger.warn(`Error querying ${collectionName}:`, error);
          return [];
        }
      })
    );

    const allDocs = results.flat();
    const duration = performance.now() - startTime;
    
    logger.info(`Specific collection query completed: ${allDocs.length} items in ${duration.toFixed(2)}ms`);
    
    return allDocs;
  } catch (error) {
    logger.error('Specific collection query failed:', error);
    throw error;
  }
}

// Export for convenience
export default {
  queryAllCollections,
  getAllVehicles,
  countAllVehicles,
  querySpecificCollections,
  VEHICLE_COLLECTIONS
};
