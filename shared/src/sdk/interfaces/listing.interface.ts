/**
 * Listing Service Interface
 * Shared contract for vehicle listing CRUD across web and mobile.
 */

import type { VehicleCollectionName } from '../../types/car-listing.types';

export interface ListingFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  fuelType?: string;
  transmission?: string;
  city?: string;
  status?: 'active' | 'sold' | 'draft' | 'pending';
  sellerId?: string;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'views_desc';
}

export interface ListingSummary {
  id: string;
  collection: VehicleCollectionName;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  status: string;
  mainImage?: string;
  city?: string;
  viewCount: number;
  createdAt: Date;
}

export interface IListingService {
  /** Fetch a single listing by ID across all collections */
  getById(id: string): Promise<ListingSummary | null>;

  /** Query listings with filters, optionally scoped to a specific collection */
  query(filters: ListingFilters, collection?: VehicleCollectionName): Promise<ListingSummary[]>;

  /** Query across all 6 vehicle collections in parallel */
  queryAll(filters: ListingFilters): Promise<ListingSummary[]>;

  /** Get listings by seller ID */
  getBySeller(sellerId: string, status?: string): Promise<ListingSummary[]>;

  /** Count active listings per collection */
  countByCollection(): Promise<Record<VehicleCollectionName, number>>;
}
