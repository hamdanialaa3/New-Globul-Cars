/**
 * UNIFIED SEARCH SERVICE
 * 
 * Consolidates 5+ different search systems into one:
 * - advancedSearchService.ts → To DDD
 * - algoliaSearchService.ts → Keep core functionality
 * - search/smart-search.service.ts → Merge algorithms
 * - search/algolia.service.ts → Merge with algolia main
 * - CarSearchSystem components → Keep UI, consolidate logic
 * 
 * This becomes the canonical search service for the entire application.
 * 
 * @since 2025-11-03 (Phase 2.1)
 */

import { logger } from '../../services/logger-service';
import { runUnifiedQuery } from './queryOrchestrator';
import { SearchData } from '../../pages/05_search-browse/advanced-search/AdvancedSearchPage/types';
import { queryAllCollections } from '../multi-collection-helper';

export interface SearchQuery {
  text?: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  city?: string;
  fuelType?: string;
  transmission?: string;
}

export interface SearchResult {
  cars: unknown[];
  total: number;
  page: number;
  hasMore: boolean;
  source?: 'algolia' | 'firestore';
  processingMs?: number;
}

export class UnifiedSearchService {
  private static instance: UnifiedSearchService;
  
  private constructor() {
    logger.info('UnifiedSearchService initialized');
  }
  
  static getInstance(): UnifiedSearchService {
    if (!this.instance) {
      this.instance = new UnifiedSearchService();
    }
    return this.instance;
  }
  
  /**
   * Main search method - consolidates all search approaches
   */
  async searchCars(query: SearchQuery, page: number = 1): Promise<SearchResult> {
    try {
      logger.debug('Searching cars', { query, page });
      const orchestratorFilters: Partial<SearchData> = {
        make: query.make,
        model: query.model,
        priceFrom: query.priceFrom ? String(query.priceFrom) : undefined,
        priceTo: query.priceTo ? String(query.priceTo) : undefined,
        firstRegistrationFrom: query.yearFrom ? String(query.yearFrom) : undefined,
        firstRegistrationTo: query.yearTo ? String(query.yearTo) : undefined,
        city: query.locationData?.cityName,
        fuelType: query.fuelType,
        transmission: query.transmission,
        searchDescription: query.text
      };
      const res = await runUnifiedQuery(orchestratorFilters, { page: page - 1, hitsPerPage: 40 });
      return {
        cars: res.cars,
        total: res.total,
        page,
        hasMore: res.total > page * 40,
        source: res.source,
        processingMs: res.processingMs
      };
      
    } catch (error) {
      logger.error('Search error', error as Error, { query });
      throw error;
    }
  }
  
  /**
   * Advanced search with complex filters
   */
  async advancedSearch(filters: any): Promise<SearchResult> {
    logger.debug('Advanced search', { filters });
    const res = await runUnifiedQuery(filters, { page: 0, hitsPerPage: 40 });
    return {
      cars: res.cars,
      total: res.total,
      page: 1,
      hasMore: res.total > 40,
      source: res.source,
      processingMs: res.processingMs
    };
  }
  
  /**
   * Advanced search with pagination support and configurable page size
   */
  async advancedSearchPaged(filters: any, page: number = 1, hitsPerPage: number = 20): Promise<SearchResult> {
    logger.debug('Advanced search (paged)', { filters, page, hitsPerPage });
    const res = await runUnifiedQuery(filters, { page: Math.max(0, page - 1), hitsPerPage });
    return {
      cars: res.cars,
      total: res.total,
      page,
      hasMore: res.total > page * hitsPerPage,
      source: res.source,
      processingMs: res.processingMs
    };
  }
  
  /**
   * Save search for user
   */
  async saveSearch(userId: string, query: SearchQuery, name: string): Promise<void> {
    logger.info('Saving search', { userId, name });
    // Implementation
  }
  
  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    logger.debug('Getting suggestions', { query });
    return [];
  }
}

export const searchService = UnifiedSearchService.getInstance();

/** @deprecated Use searchService.searchCars() */
export const searchCars = searchService.searchCars.bind(searchService);

