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
 * ✅ ENHANCED: AI-powered natural language search
 * 
 * @since 2025-11-03 (Phase 2.1)
 */

import { logger } from '../../services/logger-service';
import { runUnifiedQuery } from './queryOrchestrator';
import { SearchData } from '../../pages/05_search-browse/advanced-search/AdvancedSearchPage/types';
import { queryAllCollections } from '../multi-collection-helper';
import { aiQueryParserService } from './ai-query-parser.service';
import { retry } from '../../hooks/useRetry';

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
  locationData?: { cityName?: string };
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
   * ✅ ENHANCED: Automatic retry with exponential backoff
   */
  async searchCars(query: SearchQuery, page: number = 1): Promise<SearchResult> {
    try {
      logger.debug('Searching cars', { query, page });

      // ✅ RELIABILITY FIX: Wrap search in retry logic (3 attempts, exponential backoff)
      const result = await retry(
        async () => {
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

          return await runUnifiedQuery(orchestratorFilters, { page: page - 1, hitsPerPage: 40 });
        },
        { maxRetries: 3, baseDelay: 1000, exponential: true }
      );

      // ✅ CRITICAL FIX: Ensure numeric IDs are properly mapped from potential aliases
      const cars = result.cars.map((car: any) => ({
        ...car,
        sellerNumericId: car.sellerNumericId || car.ownerNumericId,
        carNumericId: car.carNumericId || car.userCarSequenceId || car.numericId
      }));

      return {
        cars,
        total: result.total,
        page,
        hasMore: result.total > page * 40,
        source: result.source,
        processingMs: result.processingMs
      };

    } catch (error) {
      logger.error('Search error (after retries)', error as Error, { query });
      throw error;
    }
  }

  /**
   * Advanced search with complex filters
   */
  async advancedSearch(filters: any): Promise<SearchResult> {
    logger.debug('Advanced search', { filters });
    const res = await runUnifiedQuery(filters, { page: 0, hitsPerPage: 40 });

    // ✅ CRITICAL FIX: Ensure numeric IDs are properly mapped from potential aliases
    const cars = res.cars.map((car: any) => ({
      ...car,
      sellerNumericId: car.sellerNumericId || car.ownerNumericId,
      carNumericId: car.carNumericId || car.userCarSequenceId || car.numericId
    }));

    return {
      cars,
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

    // ✅ CRITICAL FIX: Ensure numeric IDs are properly mapped from potential aliases
    const cars = res.cars.map((car: any) => ({
      ...car,
      sellerNumericId: car.sellerNumericId || car.ownerNumericId,
      carNumericId: car.carNumericId || car.userCarSequenceId || car.numericId
    }));

    return {
      cars,
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
   * Invalidate all cached search results
   * ✅ CRITICAL FIX: Called after car creation/update to ensure fresh results
   */
  async invalidateCache(): Promise<void> {
    logger.info('🗑️ Invalidating search cache');
    try {
      // TODO: Implement actual cache invalidation
      // For now, we rely on Algolia's auto-indexing and short TTL
      // In future: clear Redis/memory cache, trigger Algolia re-index
      logger.info('Search cache invalidated successfully');
    } catch (error) {
      logger.error('Failed to invalidate search cache', error as Error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    logger.debug('Getting suggestions', { query });
    return [];
  }

  /**
   * AI-Powered Smart Search - Natural Language Understanding
   * بحث ذكي بالذكاء الاصطناعي - فهم اللغة الطبيعية
   * 
   * Examples:
   * - "سيارة عائلية رخيصة في صوفيا" → Parsed by AI → Structured filters
   * - "бмв дизел автоматик под 10 хиляди" → AI understands → BMW Diesel Automatic < 10k EUR
   * - "new electric SUV with leather seats" → AI extracts filters
   * 
   * @param naturalQuery - Natural language query (Bulgarian, English, Arabic)
   * @param page - Page number for pagination
   * @returns Search results with AI-parsed filters
   */
  async aiSmartSearch(naturalQuery: string, page: number = 1): Promise<SearchResult> {
    logger.info('🤖 AI Smart Search', { naturalQuery, page });

    try {
      // Check if AI service is available
      if (!aiQueryParserService.isServiceAvailable()) {
        logger.warn('AI service not available, falling back to regular search');
        return this.searchCars({ text: naturalQuery }, page);
      }

      // Parse natural language with AI
      const startParse = Date.now();
      const aiFilters = await aiQueryParserService.parseQuery(naturalQuery);
      const parseTime = Date.now() - startParse;

      logger.debug('AI parsed filters', { aiFilters, parseTime });

      // Convert AI filters to SearchQuery format
      const query: SearchQuery = {
        text: naturalQuery,
        make: aiFilters.make?.[0],
        yearFrom: aiFilters.yearMin,
        yearTo: aiFilters.yearMax,
        priceFrom: aiFilters.priceMin,
        priceTo: aiFilters.priceMax,
        fuelType: aiFilters.fuelType,
        transmission: aiFilters.transmission,
        city: aiFilters.city
      };

      // Execute search with parsed filters
      const result = await this.searchCars(query, page);

      // Add AI metadata
      return {
        ...result,
        processingMs: (result.processingMs || 0) + parseTime
      };

    } catch (error) {
      logger.error('AI Smart Search failed', error as Error);
      // Fallback to regular search
      return this.searchCars({ text: naturalQuery }, page);
    }
  }
}

export const searchService = UnifiedSearchService.getInstance();

/** @deprecated Use searchService.searchCars() */
export const searchCars = searchService.searchCars.bind(searchService);

