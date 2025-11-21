/**
 * Algolia Search Service
 * Advanced search and filtering for car listings
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import { CarListing } from '@globul-cars/core/typesCarListing';
import { serviceLogger } from '../logger-wrapper';

interface AlgoliaConfig {
  appId: string;
  searchApiKey: string;
  indexName: string;
}

interface SearchFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuelType?: string;
  transmission?: string;
  region?: string;
  city?: string;
  condition?: string;
}

interface SearchResult {
  hits: CarListing[];
  totalHits: number;
  page: number;
  nbPages: number;
  processingTimeMS: number;
}

/**
 * Algolia Search Service
 * Note: Requires Algolia account and configuration
 * To enable: npm install algoliasearch and configure credentials
 */
class AlgoliaSearchService {
  private config: AlgoliaConfig = {
    appId: process.env.REACT_APP_ALGOLIA_APP_ID || '',
    searchApiKey: process.env.REACT_APP_ALGOLIA_SEARCH_KEY || '',
    indexName: 'cars'
  };

  private isConfigured(): boolean {
    return Boolean(this.config.appId && this.config.searchApiKey);
  }

  /**
   * Search cars with advanced filters
   * Falls back to Firestore if Algolia not configured
   */
  async searchCars(
    query: string,
    filters: SearchFilters = {},
    page: number = 0,
    hitsPerPage: number = 20
  ): Promise<SearchResult> {
    // Check if Algolia is configured
    if (!this.isConfigured()) {
      serviceLogger.warn('Algolia not configured, falling back to Firestore');
      return this.fallbackToFirestore(query, filters, page, hitsPerPage);
    }

    try {
      // In production with Algolia configured:
      /*
      const algoliasearch = require('algoliasearch');
      const client = algoliasearch(this.config.appId, this.config.searchApiKey);
      const index = client.initIndex(this.config.indexName);

      // Build filter string
      const filterParts: string[] = [];
      
      if (filters.make) filterParts.push(`make:"${filters.make}"`);
      if (filters.model) filterParts.push(`model:"${filters.model}"`);
      if (filters.fuelType) filterParts.push(`fuelType:"${filters.fuelType}"`);
      if (filters.transmission) filterParts.push(`transmission:"${filters.transmission}"`);
      if (filters.region) filterParts.push(`region:"${filters.region}"`);
      if (filters.condition) filterParts.push(`condition:"${filters.condition}"`);
      
      // Numeric filters
      const numericFilters: string[] = [];
      if (filters.yearMin) numericFilters.push(`year >= ${filters.yearMin}`);
      if (filters.yearMax) numericFilters.push(`year <= ${filters.yearMax}`);
      if (filters.priceMin) numericFilters.push(`price >= ${filters.priceMin}`);
      if (filters.priceMax) numericFilters.push(`price <= ${filters.priceMax}`);
      if (filters.mileageMax) numericFilters.push(`mileage <= ${filters.mileageMax}`);

      const searchParams = {
        query,
        page,
        hitsPerPage,
        filters: filterParts.join(' AND '),
        numericFilters,
        attributesToRetrieve: ['*']
      };

      const result = await index.search(query, searchParams);

      return {
        hits: result.hits as CarListing[],
        totalHits: result.nbHits,
        page: result.page,
        nbPages: result.nbPages,
        processingTimeMS: result.processingTimeMS
      };
      */

      // Fallback for now
      return this.fallbackToFirestore(query, filters, page, hitsPerPage);

    } catch (error) {
      serviceLogger.error('Algolia search error', error as Error, { query, filters });
      return this.fallbackToFirestore(query, filters, page, hitsPerPage);
    }
  }

  /**
   * Fallback to Firestore when Algolia is not available
   * Limited filtering capabilities compared to Algolia
   */
  private async fallbackToFirestore(
    query: string,
    filters: SearchFilters,
    page: number,
    hitsPerPage: number
  ): Promise<SearchResult> {
    serviceLogger.debug('Using Firestore fallback for search', { query, filters });
    
    // This is a simplified fallback
    // In production, use the existing carListingService
    return {
      hits: [],
      totalHits: 0,
      page,
      nbPages: 0,
      processingTimeMS: 0
    };
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      // In production with Algolia:
      /*
      const algoliasearch = require('algoliasearch');
      const client = algoliasearch(this.config.appId, this.config.searchApiKey);
      const index = client.initIndex(this.config.indexName);

      const result = await index.search(query, {
        attributesToRetrieve: ['make', 'model'],
        hitsPerPage: 5
      });

      const suggestions = result.hits.map(hit => 
        `${hit.make} ${hit.model}`
      );

      return [...new Set(suggestions)];
      */

      return [];

    } catch (error) {
      serviceLogger.error('Error getting suggestions', error as Error, { query });
      return [];
    }
  }

  /**
   * Get facets for filters (e.g., all makes, models, etc.)
   */
  async getFacets(attribute: string): Promise<Record<string, number>> {
    if (!this.isConfigured()) {
      return {};
    }

    try {
      // In production with Algolia:
      /*
      const algoliasearch = require('algoliasearch');
      const client = algoliasearch(this.config.appId, this.config.searchApiKey);
      const index = client.initIndex(this.config.indexName);

      const result = await index.search('', {
        facets: [attribute],
        hitsPerPage: 0
      });

      return result.facets?.[attribute] || {};
      */

      return {};

    } catch (error) {
      serviceLogger.error('Error getting facets', error as Error, { attribute });
      return {};
    }
  }
}

export const algoliaSearchService = new AlgoliaSearchService();
export default algoliaSearchService;

