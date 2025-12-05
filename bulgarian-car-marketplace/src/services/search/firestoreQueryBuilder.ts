// Unified Firestore Query Builder
// موحد بناء استعلامات فايرستورات للبحث عن السيارات
// Phase: Query Unification Step 1 - MULTI-COLLECTION SUPPORT

import { collection, query, where, orderBy, limit, Query, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { SearchData } from '../../pages/05_search-browse/advanced-search/AdvancedSearchPage/types';
import { FilterState } from '../../contexts/FilterContext';
import { resolveCanonicalBrand } from '../../services/brand-normalization';

export type InputFilters = Partial<SearchData> | Partial<FilterState>;

// ✅ ALL VEHICLE COLLECTIONS - Search across ALL types
export const VEHICLE_COLLECTIONS = [
  'cars',             // Legacy collection
  'passenger_cars',   // Personal cars
  'suvs',             // SUVs/Jeeps
  'vans',             // Vans/Cargo
  'motorcycles',      // Motorcycles
  'trucks',           // Trucks
  'buses'             // Buses
] as const;

// Field map to Firestore document fields (kept explicit for future migrations)
const FIELD_MAP: Record<string, string> = {
  make: 'make',
  model: 'model',
  vehicleType: 'vehicleType',
  fuelType: 'fuelType',
  transmission: 'transmission',
  condition: 'condition',
  seller: 'sellerType',
  city: 'city',
  country: 'country'
};

export interface QueryBuilderOptions {
  collectionNames?: string[]; // ✅ NEW: Support multiple collections
  collectionName?: string; // Legacy single collection support
  maxResults?: number; // hard cap limit
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  includeInactive?: boolean; // when true, do not enforce status==active
}

const DEFAULT_OPTIONS: QueryBuilderOptions = {
  collectionNames: [...VEHICLE_COLLECTIONS], // ✅ Default: Search ALL collections
  maxResults: 100,
  sortField: 'createdAt',
  sortDirection: 'desc'
};

/**
 * Build Firestore query from unified filters.
 * يحول الفلاتر الموحدة إلى استعلام فايرستور
 * ✅ CRITICAL FIX: Returns SINGLE query for one collection
 */
export function buildFirestoreQuery(filters: InputFilters, options: QueryBuilderOptions = {}): Query<DocumentData> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { collectionName, maxResults, sortField, sortDirection, includeInactive } = mergedOptions;
  
  // Use single collection if specified, otherwise use first from collectionNames
  const targetCollection = collectionName || (mergedOptions.collectionNames && mergedOptions.collectionNames[0]) || 'cars';
  
  let q = query(collection(db, targetCollection));

  // Restrict to active listings unless explicitly disabled via option or env flag
  const requireActive = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SEARCH_REQUIRE_ACTIVE)
    ? process.env.REACT_APP_SEARCH_REQUIRE_ACTIVE !== 'false'
    : true;
  if (!includeInactive && requireActive) {
    q = query(q, where('status', '==', 'active'));
  }

  // Normalize brand if present in either schema
  const make = (filters as any).make ? resolveCanonicalBrand(String((filters as any).make)) : undefined;

  // Apply direct equality filters
  Object.entries(FIELD_MAP).forEach(([inputKey, firestoreField]) => {
    const value = (inputKey === 'make') ? make : (filters as any)[inputKey];
    if (value) {
      q = query(q, where(firestoreField, '==', value));
    }
  });

  // ⚡ TEMPORARY: Removed orderBy to avoid index requirement
  // TODO: Re-enable after creating Firestore indexes (status + createdAt/sortField)
  // q = query(q, orderBy(sortField!, sortDirection));

  // Limit
  q = query(q, limit(maxResults!));

  return q;
}

/**
 * ✅ NEW: Build queries for ALL vehicle collections
 * Returns array of queries to be executed in parallel
 */
export function buildMultiCollectionQueries(filters: InputFilters, options: QueryBuilderOptions = {}): Query<DocumentData>[] {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const collections = mergedOptions.collectionNames || VEHICLE_COLLECTIONS;
  
  return collections.map(collectionName => 
    buildFirestoreQuery(filters, { ...options, collectionName })
  );
}

/**
 * Extracts key filters from large SearchData for caching key generation or analytics.
 */
export function extractCoreFilterSignature(filters: InputFilters): Record<string, string> {
  const signature: Record<string, string> = {};
  ['make','model','vehicleType','fuelType','transmission','city','country'].forEach(key => {
    const val = (filters as any)[key];
    if (val) signature[key] = String(val);
  });
  return signature;
}
