// src/types/favorites.types.ts
// 🔥 Favorites System Type Definitions

import { Timestamp } from 'firebase/firestore';

/**
 * Favorite Item
 * Represents a car saved to a user's favorites
 */
export interface FavoriteItem {
  /** Composite ID: {userId}_{carId} */
  id: string;
  
  /** Firebase User UID */
  userId: string;
  
  /** User's public numeric ID */
  userNumericId: number;
  
  /** Car document ID */
  carId: string;
  
  /** Car's numeric ID */
  carNumericId: number;
  
  /** Seller's numeric ID */
  sellerNumericId: number;
  
  /** When the car was added to favorites */
  addedAt: Timestamp;
  
  /** Cached car preview data (updated periodically) */
  carPreview: FavoriteCarPreview;
}

/**
 * Cached Car Preview
 * Subset of car data stored in favorite document for quick display
 * Updated when adding to favorites or periodically via cleanup job
 */
export interface FavoriteCarPreview {
  /** Car make (e.g., "BMW") */
  make: string;
  
  /** Car model (e.g., "X5") */
  model: string;
  
  /** Car year */
  year: number;
  
  /** Car price */
  price: number;
  
  /** Currency (EUR, BGN) */
  currency: 'EUR' | 'BGN';
  
  /** Main image URL */
  mainImage: string;
  
  /** Car status */
  status: 'active' | 'sold' | 'deleted' | 'draft';
  
  /** Seller's Firebase UID */
  sellerId: string;
  
  /** Optional: Mileage */
  mileage?: number;
  
  /** Optional: Fuel type */
  fuelType?: string;
  
  /** Optional: Transmission */
  transmission?: string;
  
  /** Optional: Location */
  location?: string;
}

/**
 * Favorites Filter State
 * Used in UserFavoritesPage for filtering
 */
export interface FavoritesFilters {
  /** Filter by make */
  make: string;
  
  /** Filter by model (dependent on make) */
  model: string;
  
  /** Minimum price */
  minPrice: string;
  
  /** Maximum price */
  maxPrice: string;
  
  /** Minimum year */
  minYear: string;
  
  /** Maximum year */
  maxYear: string;
}

/**
 * Favorites Sort Options
 */
export type FavoritesSortOption = 
  | 'dateAdded'      // Sort by date added (newest first)
  | 'priceLowHigh'   // Sort by price (low to high)
  | 'priceHighLow'   // Sort by price (high to low)
  | 'yearNewOld'     // Sort by year (newest first)
  | 'yearOldNew';    // Sort by year (oldest first)

/**
 * Favorites View Mode
 */
export type FavoritesViewMode = 'grid' | 'list';

/**
 * Favorites Page State
 * Complete state for UserFavoritesPage component
 */
export interface FavoritesPageState {
  /** All favorites (raw from Firestore) */
  favorites: FavoriteItem[];
  
  /** Filtered and sorted favorites (for display) */
  filteredFavorites: FavoriteItem[];
  
  /** Current filters */
  filters: FavoritesFilters;
  
  /** Current sort option */
  sortBy: FavoritesSortOption;
  
  /** Current view mode */
  viewMode: FavoritesViewMode;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error message (if any) */
  error: string | null;
  
  /** Filters panel open/closed */
  filtersVisible: boolean;
  
  /** Active filters count */
  activeFiltersCount: number;
}

/**
 * Favorites Service Response
 * Standard response from FavoritesService methods
 */
export interface FavoritesServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Batch Favorites Check Result
 * Map of carId → isFavorite
 */
export type FavoritesBatchCheckResult = Map<string, boolean>;

/**
 * Favorites Statistics
 * User's favorites stats (for analytics)
 */
export interface FavoritesStats {
  /** Total favorites count */
  totalCount: number;
  
  /** Favorites by make */
  byMake: Record<string, number>;
  
  /** Favorites by year */
  byYear: Record<number, number>;
  
  /** Average price */
  averagePrice: number;
  
  /** Price range */
  priceRange: {
    min: number;
    max: number;
  };
}

export default FavoriteItem;
