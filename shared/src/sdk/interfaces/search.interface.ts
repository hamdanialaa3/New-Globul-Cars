/**
 * Search Service Interface
 * Shared contract for hybrid Algolia + Firestore search across web and mobile.
 */

export interface SearchFilters {
  query?: string;
  make?: string;
  model?: string;
  yearRange?: [number, number];
  priceRange?: [number, number];
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  city?: string;
  page?: number;
  hitsPerPage?: number;
}

export interface SearchResult {
  id: string;
  collection: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mainImage?: string;
  city?: string;
  highlights?: Record<string, string>;
}

export interface SearchResponse {
  results: SearchResult[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
}

export interface ISearchService {
  /** Full-text search via Algolia */
  search(filters: SearchFilters): Promise<SearchResponse>;

  /** Get search suggestions/autocomplete */
  suggest(query: string, limit?: number): Promise<string[]>;

  /** Save a search for later notifications */
  saveSearch(userId: string, filters: SearchFilters, name: string): Promise<string>;

  /** Get saved searches */
  getSavedSearches(userId: string): Promise<Array<{ id: string; name: string; filters: SearchFilters; createdAt: Date }>>;
}
