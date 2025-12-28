/**
 * Algolia Search Service - Ultra-Fast Search Integration
 * خدمة Algolia للبحث السريع جداً
 * 
 * Benefits:
 * - Sub-50ms search response time
 * - Typo tolerance (BMW → BWM still works)
 * - Faceted search (filters)
 * - Geo-search support
 * - Analytics dashboard
 */

import algoliasearch from 'algoliasearch/lite';
import { logger } from '../logger-service';
import { CarListing } from '@/types/CarListing';

interface AlgoliaSearchParams {
  query: string;
  filters?: string;
  facetFilters?: string[][];
  numericFilters?: string[];
  hitsPerPage?: number;
  page?: number;
}

interface AlgoliaSearchResult {
  cars: CarListing[];
  totalHits: number;
  processingTime: number;
  facets?: Record<string, Record<string, number>>;
}

class AlgoliaSearchService {
  private static instance: AlgoliaSearchService;
  private client: any;
  private index: any;
  private isInitialized = false;

  private constructor() {
    // Initialize only if env vars exist
    const appId = process.env.REACT_APP_ALGOLIA_APP_ID;
    const searchApiKey = process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY;
    const indexName = process.env.REACT_APP_ALGOLIA_INDEX_NAME || 'cars';

    if (appId && searchApiKey) {
      try {
        this.client = algoliasearch(appId, searchApiKey);
        this.index = this.client.initIndex(indexName);
        this.isInitialized = true;
        logger.info('✅ Algolia initialized', { indexName });
      } catch (error) {
        logger.error('❌ Algolia initialization failed', error as Error);
      }
    } else {
      logger.warn('⚠️ Algolia not configured (missing env vars)');
    }
  }

  static getInstance(): AlgoliaSearchService {
    if (!this.instance) {
      this.instance = new AlgoliaSearchService();
    }
    return this.instance;
  }

  /**
   * Check if Algolia is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * 🔍 SEARCH - Main search method
   */
  async search(params: AlgoliaSearchParams): Promise<AlgoliaSearchResult> {
    if (!this.isInitialized) {
      throw new Error('Algolia not initialized');
    }

    try {
      logger.debug('🔍 Algolia search', { query: params.query });

      const searchParams: any = {
        query: params.query,
        hitsPerPage: params.hitsPerPage || 50,
        page: params.page || 0,
        attributesToRetrieve: ['*'],
        attributesToHighlight: ['make', 'model'],
        typoTolerance: true,
        removeWordsIfNoResults: 'allOptional'
      };

      // Add filters
      if (params.filters) {
        searchParams.filters = params.filters;
      }

      if (params.facetFilters) {
        searchParams.facetFilters = params.facetFilters;
      }

      if (params.numericFilters) {
        searchParams.numericFilters = params.numericFilters;
      }

      const result = await this.index.search(params.query, searchParams);

      const cars = result.hits.map((hit: any) => ({
        id: hit.objectID,
        ...hit,
        _highlightResult: undefined // Remove Algolia metadata
      })) as CarListing[];

      logger.info('✅ Algolia search completed', {
        query: params.query,
        hits: result.nbHits,
        time: result.processingTimeMS
      });

      return {
        cars,
        totalHits: result.nbHits,
        processingTime: result.processingTimeMS,
        facets: result.facets
      };

    } catch (error) {
      logger.error('❌ Algolia search failed', error as Error);
      throw error;
    }
  }

  /**
   * 🎯 AUTOCOMPLETE - Get instant suggestions
   */
  async autocomplete(
    query: string,
    maxResults: number = 10
  ): Promise<{ makes: string[]; models: string[] }> {
    if (!this.isInitialized) {
      return { makes: [], models: [] };
    }

    try {
      const result = await this.index.search(query, {
        hitsPerPage: maxResults,
        attributesToRetrieve: ['make', 'model'],
        distinct: true
      });

      const makes = new Set<string>();
      const models = new Set<string>();

      result.hits.forEach((hit: any) => {
        if (hit.make) makes.add(hit.make);
        if (hit.model) models.add(hit.model);
      });

      return {
        makes: Array.from(makes),
        models: Array.from(models)
      };

    } catch (error) {
      logger.error('Algolia autocomplete failed', error as Error);
      return { makes: [], models: [] };
    }
  }

  /**
   * 📊 FACETED SEARCH - Get facets for filters
   */
  async getFacets(
    query: string = '',
    facetNames: string[] = ['make', 'fuelType', 'transmission', 'city']
  ): Promise<Record<string, Record<string, number>>> {
    if (!this.isInitialized) {
      return {};
    }

    try {
      const result = await this.index.search(query, {
        facets: facetNames,
        hitsPerPage: 0 // We only want facets
      });

      return result.facets || {};

    } catch (error) {
      logger.error('Get facets failed', error as Error);
      return {};
    }
  }

  /**
   * 🌍 GEO SEARCH - Search near location
   */
  async searchNear(
    latitude: number,
    longitude: number,
    radiusMeters: number = 50000, // 50km default
    query: string = ''
  ): Promise<AlgoliaSearchResult> {
    if (!this.isInitialized) {
      throw new Error('Algolia not initialized');
    }

    try {
      const result = await this.index.search(query, {
        aroundLatLng: `${latitude},${longitude}`,
        aroundRadius: radiusMeters,
        hitsPerPage: 50
      });

      return {
        cars: result.hits as CarListing[],
        totalHits: result.nbHits,
        processingTime: result.processingTimeMS
      };

    } catch (error) {
      logger.error('Geo search failed', error as Error);
      throw error;
    }
  }

  /**
   * 🔢 SEARCH BY NUMERIC ID
   */
  async searchById(carNumericId: number, sellerNumericId: number): Promise<CarListing | null> {
    if (!this.isInitialized) {
      return null;
    }

    try {
      const filters = `carNumericId:${carNumericId} AND sellerNumericId:${sellerNumericId}`;
      const result = await this.index.search('', { filters, hitsPerPage: 1 });

      if (result.hits.length > 0) {
        return result.hits[0] as CarListing;
      }

      return null;

    } catch (error) {
      logger.error('Search by ID failed', error as Error);
      return null;
    }
  }

  /**
   * 📈 TRENDING SEARCHES - Get popular searches
   */
  async getTrendingSearches(limit: number = 10): Promise<string[]> {
    // This would typically use Algolia Insights API
    // For now, return mock data
    return [
      'BMW X5',
      'Audi A4',
      'Mercedes C220',
      'Golf 7',
      'Toyota Corolla',
      'VW Passat',
      'Honda Civic',
      'Ford Focus'
    ].slice(0, limit);
  }

  /**
   * 🔄 SYNC CAR TO ALGOLIA - Add/Update car in index
   */
  async syncCar(car: CarListing): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('Algolia not available, skipping sync');
      return;
    }

    try {
      const algoliaRecord = {
        objectID: car.id,
        make: car.make,
        model: car.model,
        year: car.yearOfManufacture || car.year,
        price: car.price,
        fuelType: car.fuelType,
        transmission: car.transmission,
        mileage: car.mileage,
        city: car.city,
        region: car.region,
        status: car.status,
        isActive: car.isActive,
        featured: car.featured,
        sellerId: car.sellerId,
        sellerNumericId: car.sellerNumericId,
        carNumericId: car.carNumericId,
        createdAt: car.createdAt,
        searchableText: `${car.make} ${car.model} ${car.yearOfManufacture || car.year} ${car.fuelType}`,
        _tags: [car.status, car.fuelType, car.city].filter(Boolean)
      };

      await this.index.saveObject(algoliaRecord);
      logger.debug('✅ Car synced to Algolia', { carId: car.id });

    } catch (error) {
      logger.error('Failed to sync car to Algolia', error as Error);
    }
  }

  /**
   * 🗑️ DELETE CAR FROM ALGOLIA
   */
  async deleteCar(carId: string): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await this.index.deleteObject(carId);
      logger.debug('✅ Car deleted from Algolia', { carId });
    } catch (error) {
      logger.error('Failed to delete car from Algolia', error as Error);
    }
  }

  /**
   * 📦 BATCH SYNC - Sync multiple cars at once
   */
  async batchSync(cars: CarListing[]): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      const records = cars.map(car => ({
        objectID: car.id,
        make: car.make,
        model: car.model,
        year: car.yearOfManufacture || car.year,
        price: car.price,
        fuelType: car.fuelType,
        city: car.city,
        status: car.status,
        isActive: car.isActive,
        carNumericId: car.carNumericId,
        sellerNumericId: car.sellerNumericId
      }));

      await this.index.saveObjects(records);
      logger.info('✅ Batch sync completed', { count: cars.length });

    } catch (error) {
      logger.error('Batch sync failed', error as Error);
    }
  }
}

export const algoliaSearchService = AlgoliaSearchService.getInstance();
export default algoliaSearchService;
