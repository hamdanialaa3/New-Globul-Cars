/**
 * Listings Service
 * Centralized service for fetching vehicle listing data across all collections
 * 
 * Supports:
 * - Legacy collections (cars, listings)
 * - New vehicle-type collections (passenger_cars, suvs, vans, motorcycles, trucks, buses)
 * - Numeric ID lookup (listingNumericId)
 * - UUID lookup (listingId)
 * 
 * @file listings.service.ts
 * @since 2026-02-18
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { UnifiedCar, VEHICLE_COLLECTIONS } from './car/unified-car-types';
import { mapDocToCar } from './car/unified-car-queries';

// All vehicle collections to search across
const ALL_VEHICLE_COLLECTIONS = [
  ...VEHICLE_COLLECTIONS,
  'listings'  // Legacy collection
] as const;

export interface Listing extends UnifiedCar {
  listingId?: string;           // Alias for id
  listingNumericId?: number;    // Alias for carNumericId
  slug?: string;                // SEO-friendly slug
  canonicalUrl?: string;        // Full canonical URL
}

/**
 * Fetch listing by Firestore document ID (UUID)
 * Searches across all vehicle collections
 * 
 * @param id - Firestore document ID (UUID)
 * @returns Listing object or null if not found
 * 
 * @example
 * const listing = await getListingById('abc123-uuid-...');
 * if (listing) {
 *   console.log(listing.slug, listing.price);
 * }
 */
export async function getListingById(id: string): Promise<Listing | null> {
  try {
    serviceLogger.info('[listings.service] Fetching listing by ID', { listingId: id });

    // Try each collection until we find the listing
    for (const collectionName of ALL_VEHICLE_COLLECTIONS) {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const car = mapDocToCar(docSnap);
        const listing: Listing = {
          ...car,
          listingId: car.id,
          listingNumericId: car.carNumericId || car.numericId,
          // slug is already in UnifiedCar if it exists
        };

        serviceLogger.info('[listings.service] Found listing by ID', {
          listingId: id,
          collection: collectionName,
          numericId: listing.listingNumericId,
          slug: listing.slug
        });

        return listing;
      }
    }

    serviceLogger.warn('[listings.service] Listing not found by ID', { listingId: id });
    return null;
  } catch (error) {
    serviceLogger.error('[listings.service] Error fetching listing by ID', error as Error, { listingId: id });
    throw error;
  }
}

/**
 * Fetch listing by numeric ID (carNumericId)
 * Searches across all vehicle collections
 * 
 * @param numericId - Numeric listing ID (carNumericId field)
 * @returns Listing object or null if not found
 * 
 * @example
 * const listing = await getListingByNumericId(123);
 * if (listing) {
 *   console.log(`/car/${listing.listingNumericId}/${listing.slug}`);
 * }
 */
export async function getListingByNumericId(numericId: number): Promise<Listing | null> {
  try {
    serviceLogger.info('[listings.service] Fetching listing by numeric ID', { numericId });

    // Search across all collections
    for (const collectionName of ALL_VEHICLE_COLLECTIONS) {
      const q = query(
        collection(db, collectionName),
        where('carNumericId', '==', numericId),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const car = mapDocToCar(docSnap);
        const listing: Listing = {
          ...car,
          listingId: car.id,
          listingNumericId: car.carNumericId || car.numericId,
        };

        serviceLogger.info('[listings.service] Found listing by numeric ID', {
          numericId,
          listingId: listing.id,
          collection: collectionName,
          slug: listing.slug
        });

        return listing;
      }
    }

    serviceLogger.warn('[listings.service] Listing not found by numeric ID', { numericId });
    return null;
  } catch (error) {
    serviceLogger.error('[listings.service] Error fetching listing by numeric ID', error as Error, { numericId });
    throw error;
  }
}

/**
 * Fetch listings by seller numeric ID
 * Useful for profile pages showing all user listings
 * 
 * @param sellerNumericId - Seller's numeric user ID
 * @param limitCount - Maximum number of listings to return (default: 50)
 * @returns Array of listings
 * 
 * @example
 * const userListings = await getListingsBySellerNumericId(456, 10);
 * console.log(`User has ${userListings.length} listings`);
 */
export async function getListingsBySellerNumericId(
  sellerNumericId: number,
  limitCount: number = 50
): Promise<Listing[]> {
  try {
    serviceLogger.info('[listings.service] Fetching listings by seller numeric ID', {
      sellerNumericId,
      limit: limitCount
    });

    const listings: Listing[] = [];

    // Query each collection
    const queryPromises = ALL_VEHICLE_COLLECTIONS.map(async (collectionName) => {
      const q = query(
        collection(db, collectionName),
        where('sellerNumericId', '==', sellerNumericId),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const car = mapDocToCar(docSnap);
        return {
          ...car,
          listingId: car.id,
          listingNumericId: car.carNumericId || car.numericId,
        } as Listing;
      });
    });

    const results = await Promise.all(queryPromises);
    results.forEach((collectionListings) => listings.push(...collectionListings));

    serviceLogger.info('[listings.service] Found listings by seller numeric ID', {
      sellerNumericId,
      count: listings.length
    });

    return listings.slice(0, limitCount); // Trim to limit
  } catch (error) {
    serviceLogger.error('[listings.service] Error fetching listings by seller numeric ID', error as Error, {
      sellerNumericId
    });
    throw error;
  }
}

/**
 * Fetch active listings (status = 'active' or 'published', not sold)
 * Used for marketplace browsing
 * 
 * @param limitCount - Maximum number of listings to return (default: 20)
 * @returns Array of active listings
 * 
 * @example
 * const activeListings = await getActiveListings(10);
 */
export async function getActiveListings(limitCount: number = 20): Promise<Listing[]> {
  try {
    serviceLogger.info('[listings.service] Fetching active listings', { limit: limitCount });

    const listings: Listing[] = [];

    const queryPromises = ALL_VEHICLE_COLLECTIONS.map(async (collectionName) => {
      const q = query(
        collection(db, collectionName),
        where('isActive', '==', true),
        where('isSold', '==', false),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const car = mapDocToCar(docSnap);
        return {
          ...car,
          listingId: car.id,
          listingNumericId: car.carNumericId || car.numericId,
        } as Listing;
      });
    });

    const results = await Promise.all(queryPromises);
    results.forEach((collectionListings) => listings.push(...collectionListings));

    serviceLogger.info('[listings.service] Found active listings', { count: listings.length });

    return listings.slice(0, limitCount);
  } catch (error) {
    serviceLogger.error('[listings.service] Error fetching active listings', error as Error);
    throw error;
  }
}
