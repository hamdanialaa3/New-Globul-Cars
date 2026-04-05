// src/types/user-search.types.ts
// User Search Types — Algolia search result types and filter interfaces

export interface UserSearchResult {
  objectID: string;
  numericId: number;
  displayName: string;
  businessName?: string;
  accountType: 'private' | 'dealer' | 'company';
  avatarUrl?: string;
  city?: string;
  region?: string;
  rating: number;
  reviewsCount: number;
  listingsCount: number;
  isVerified: boolean;
  isOnline?: boolean;
  lastActiveAt?: number;
  description?: string;
  _highlightResult?: {
    displayName?: { value: string; matchLevel: string };
    businessName?: { value: string; matchLevel: string };
  };
}

export interface UserSearchFilters {
  accountType?: 'private' | 'dealer' | 'company';
  city?: string;
  region?: string;
  isVerified?: boolean;
  minRating?: number;
  minListings?: number;
  activeWithinDays?: number;
}

export type UserSearchSort =
  | 'relevance'
  | 'rating_desc'
  | 'listings_desc'
  | 'recent_activity';

export interface UserSearchState {
  query: string;
  results: UserSearchResult[];
  filters: UserSearchFilters;
  sort: UserSearchSort;
  page: number;
  totalHits: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}
