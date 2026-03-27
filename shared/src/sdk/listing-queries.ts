/**
 * Shared Listing Query Helpers
 * Platform-agnostic business logic for cross-collection vehicle queries.
 * Uses Firestore SDK directly (works on both web and React Native).
 */

import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  limit as fbLimit,
  getDocs,
  QueryConstraint,
} from 'firebase/firestore';
import { ALL_VEHICLE_COLLECTIONS } from '../constants/vehicle-collections';
import type { VehicleCollectionName } from '../types/car-listing.types';
import type { ListingFilters, ListingSummary } from './interfaces/listing.interface';

/** Build Firestore constraints from ListingFilters */
export function buildConstraints(filters: ListingFilters): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  if (filters.sellerId) constraints.push(where('sellerId', '==', filters.sellerId));
  if (filters.status) constraints.push(where('status', '==', filters.status));
  if (filters.make) constraints.push(where('make', '==', filters.make));
  if (filters.fuelType) constraints.push(where('fuelType', '==', filters.fuelType));
  if (filters.transmission) constraints.push(where('transmission', '==', filters.transmission));
  if (filters.city) constraints.push(where('city', '==', filters.city));

  // Sort
  switch (filters.sortBy) {
    case 'price_asc':
      constraints.push(orderBy('price', 'asc'));
      break;
    case 'price_desc':
      constraints.push(orderBy('price', 'desc'));
      break;
    case 'date_asc':
      constraints.push(orderBy('createdAt', 'asc'));
      break;
    case 'views_desc':
      constraints.push(orderBy('viewCount', 'desc'));
      break;
    default:
      constraints.push(orderBy('createdAt', 'desc'));
  }

  if (filters.limit) constraints.push(fbLimit(filters.limit));

  return constraints;
}

/** Map a Firestore doc to ListingSummary */
export function docToSummary(docId: string, data: Record<string, any>, col: VehicleCollectionName): ListingSummary {
  return {
    id: docId,
    collection: col,
    make: data.make || '',
    model: data.model || '',
    year: data.year || 0,
    price: data.price || 0,
    currency: data.currency || 'BGN',
    status: data.status || 'active',
    mainImage: data.images?.[0] || data.mainImage || undefined,
    city: data.city || undefined,
    viewCount: data.viewCount || 0,
    createdAt: data.createdAt?.toDate?.() || new Date(),
  };
}

/** Query all 6 vehicle collections in parallel and merge results */
export async function queryAllCollections(
  db: Firestore,
  filters: ListingFilters,
): Promise<ListingSummary[]> {
  const constraints = buildConstraints(filters);
  const results: ListingSummary[] = [];

  await Promise.all(
    ALL_VEHICLE_COLLECTIONS.map(async (col) => {
      const q = query(collection(db, col), ...constraints);
      const snap = await getDocs(q);
      snap.forEach((d) => results.push(docToSummary(d.id, d.data(), col)));
    }),
  );

  // Client-side range filters (Firestore can't do range on different fields in one query)
  return results.filter((r) => {
    if (filters.priceMin != null && r.price < filters.priceMin) return false;
    if (filters.priceMax != null && r.price > filters.priceMax) return false;
    if (filters.yearMin != null && r.year < filters.yearMin) return false;
    if (filters.yearMax != null && r.year > filters.yearMax) return false;
    return true;
  });
}

/** Count active listings per collection */
export async function countByCollection(
  db: Firestore,
): Promise<Record<VehicleCollectionName, number>> {
  const counts = {} as Record<VehicleCollectionName, number>;

  await Promise.all(
    ALL_VEHICLE_COLLECTIONS.map(async (col) => {
      const q = query(collection(db, col), where('status', '==', 'active'));
      const snap = await getDocs(q);
      counts[col] = snap.size;
    }),
  );

  return counts;
}
