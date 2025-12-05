// Algolia Search Service
// خدمة البحث المتقدم باستخدام Algolia
// Advanced search service using Algolia for high-performance search

// Use Algolia v4 lite build in browsers (default export)
import algoliasearch from 'algoliasearch/lite';
import { SearchData } from '../pages/AdvancedSearchPage/types';
import { CarListing } from '../types/CarListing';
import { serviceLogger } from './logger-wrapper';

// Algolia configuration from environment
const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID || 'RTGDK12KTJ';
const ALGOLIA_SEARCH_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_KEY || '';
const ALGOLIA_INDEX_NAME = 'cars_bg';

interface SearchOptions {
  page?: number;
  hitsPerPage?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc' | 'createdAt_desc';
}

class AlgoliaSearchService {
  private client: any;
  private index: any;

  constructor() {
    if (!ALGOLIA_SEARCH_KEY) {
      serviceLogger.warn('Algolia search key not configured');
    }
    
    this.client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
    this.index = this.client.initIndex(ALGOLIA_INDEX_NAME);
  }

  /**
   * Build Algolia filters from search data
   * بناء فلاتر Algolia من بيانات البحث
   */
  private buildAlgoliaFilters(searchData: SearchData): string {
    const filters: string[] = [];

    // Status filter - only active listings
    filters.push('status:active');

    // Basic categorical filters
    if (searchData.make) {
      filters.push(`make:"${searchData.make}"`);
    }

    if (searchData.model) {
      filters.push(`model:"${searchData.model}"`);
    }

    if (searchData.vehicleType) {
      filters.push(`vehicleType:"${searchData.vehicleType}"`);
    }

    if (searchData.fuelType) {
      filters.push(`fuelType:"${searchData.fuelType}"`);
    }

    if (searchData.transmission) {
      filters.push(`transmission:"${searchData.transmission}"`);
    }

    if (searchData.condition) {
      filters.push(`condition:"${searchData.condition}"`);
    }

    if (searchData.seller) {
      filters.push(`sellerType:"${searchData.seller}"`);
    }

    // Location filters
    if (searchData.city) {
      filters.push(`city:"${searchData.city}"`);
    }

    if (searchData.country) {
      filters.push(`country:"${searchData.country}"`);
    }

    // Color filters
    if (searchData.exteriorColor) {
      filters.push(`color:"${searchData.exteriorColor}"`);
    }

    if (searchData.interiorColor) {
      filters.push(`interiorColor:"${searchData.interiorColor}"`);
    }

    if (searchData.interiorMaterial) {
      filters.push(`interiorMaterial:"${searchData.interiorMaterial}"`);
    }

    // Drive type
    if (searchData.driveType) {
      filters.push(`driveType:"${searchData.driveType}"`);
    }

    // Air conditioning
    if (searchData.airConditioning) {
      filters.push(`airConditioning:"${searchData.airConditioning}"`);
    }

    // Cruise control
    if (searchData.cruiseControl) {
      filters.push(`cruiseControl:"${searchData.cruiseControl}"`);
    }

    // Service history
    if (searchData.serviceHistory === 'full') {
      filters.push('serviceHistory:true');
    } else if (searchData.serviceHistory === 'none') {
      filters.push('serviceHistory:false');
    }

    // Roadworthy
    if (searchData.roadworthy === 'yes') {
      filters.push('isRoadworthy:true');
    } else if (searchData.roadworthy === 'no') {
      filters.push('isRoadworthy:false');
    }

    // Boolean filters
    if (searchData.adsWithPictures) {
      filters.push('hasImages:true');
    }

    if (searchData.adsWithVideo) {
      filters.push('hasVideo:true');
    }

    if (searchData.nonSmokerVehicle) {
      filters.push('nonSmoker:true');
    }

    if (searchData.taxi) {
      filters.push('taxi:true');
    }

    if (searchData.warranty) {
      filters.push('warranty:true');
    }

    // Damaged vehicles
    if (searchData.damagedVehicles) {
      filters.push('isDamaged:true');
    } else {
      filters.push('isDamaged:false');
    }

    return filters.join(' AND ');
  }

  /**
   * Build numeric filters for ranges
   * بناء فلاتر رقمية للنطاقات
   */
  private buildNumericFilters(searchData: SearchData): string[] {
    const numericFilters: string[] = [];

    // Price range
    if (searchData.priceFrom) {
      numericFilters.push(`price >= ${parseFloat(searchData.priceFrom)}`);
    }
    if (searchData.priceTo) {
      numericFilters.push(`price <= ${parseFloat(searchData.priceTo)}`);
    }

    // Year range
    if (searchData.firstRegistrationFrom) {
      numericFilters.push(`year >= ${parseInt(searchData.firstRegistrationFrom)}`);
    }
    if (searchData.firstRegistrationTo) {
      numericFilters.push(`year <= ${parseInt(searchData.firstRegistrationTo)}`);
    }

    // Mileage range
    if (searchData.mileageFrom) {
      numericFilters.push(`mileage >= ${parseFloat(searchData.mileageFrom)}`);
    }
    if (searchData.mileageTo) {
      numericFilters.push(`mileage <= ${parseFloat(searchData.mileageTo)}`);
    }

    // Power range
    if (searchData.powerFrom) {
      numericFilters.push(`power >= ${parseFloat(searchData.powerFrom)}`);
    }
    if (searchData.powerTo) {
      numericFilters.push(`power <= ${parseFloat(searchData.powerTo)}`);
    }

    // Engine size range
    if (searchData.cubicCapacityFrom) {
      numericFilters.push(`engineSize >= ${parseFloat(searchData.cubicCapacityFrom)}`);
    }
    if (searchData.cubicCapacityTo) {
      numericFilters.push(`engineSize <= ${parseFloat(searchData.cubicCapacityTo)}`);
    }

    // Seats range
    if (searchData.seatsFrom) {
      numericFilters.push(`numberOfSeats >= ${parseInt(searchData.seatsFrom)}`);
    }
    if (searchData.seatsTo) {
      numericFilters.push(`numberOfSeats <= ${parseInt(searchData.seatsTo)}`);
    }

    // Doors range
    if (searchData.doorsFrom) {
      numericFilters.push(`numberOfDoors >= ${parseInt(searchData.doorsFrom)}`);
    }
    if (searchData.doorsTo) {
      numericFilters.push(`numberOfDoors <= ${parseInt(searchData.doorsTo)}`);
    }

    // Fuel tank volume range
    if (searchData.fuelTankVolumeFrom) {
      numericFilters.push(`fuelTankVolume >= ${parseFloat(searchData.fuelTankVolumeFrom)}`);
    }
    if (searchData.fuelTankVolumeTo) {
      numericFilters.push(`fuelTankVolume <= ${parseFloat(searchData.fuelTankVolumeTo)}`);
    }

    // Cylinders range
    if (searchData.cylindersFrom) {
      numericFilters.push(`cylinders >= ${parseInt(searchData.cylindersFrom)}`);
    }
    if (searchData.cylindersTo) {
      numericFilters.push(`cylinders <= ${parseInt(searchData.cylindersTo)}`);
    }

    // Owners count
    if (searchData.ownersCount) {
      numericFilters.push(`previousOwners <= ${parseInt(searchData.ownersCount)}`);
    }

    return numericFilters;
  }

  /**
   * Build facet filters for array fields
   * بناء فلاتر الفئات للحقول المصفوفة
   */
  private buildFacetFilters(searchData: SearchData): string[][] {
    const facetFilters: string[][] = [];

    // Safety equipment
    if (searchData.safetyEquipment && searchData.safetyEquipment.length > 0) {
      searchData.safetyEquipment.forEach(item => {
        facetFilters.push([`safetyEquipment:${item}`]);
      });
    }

    // Comfort equipment
    if (searchData.comfortEquipment && searchData.comfortEquipment.length > 0) {
      searchData.comfortEquipment.forEach(item => {
        facetFilters.push([`comfortEquipment:${item}`]);
      });
    }

    // Infotainment equipment
    if (searchData.infotainmentEquipment && searchData.infotainmentEquipment.length > 0) {
      searchData.infotainmentEquipment.forEach(item => {
        facetFilters.push([`infotainmentEquipment:${item}`]);
      });
    }

    // Extras
    if (searchData.extras && searchData.extras.length > 0) {
      searchData.extras.forEach(item => {
        facetFilters.push([`extras:${item}`]);
      });
    }

    // Parking sensors
    if (searchData.parkingSensors && searchData.parkingSensors.length > 0) {
      searchData.parkingSensors.forEach(sensor => {
        facetFilters.push([`parkingSensors:${sensor}`]);
      });
    }

    return facetFilters;
  }

  /**
   * Build geo-search filters for location-based search
   * بناء فلاتر البحث الجغرافي
   */
  private buildGeoFilters(searchData: SearchData): any {
    if (!searchData.city || !searchData.radius) {
      return null;
    }

    // City coordinates mapping (from unified-cities-service)
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'Sofia': { lat: 42.6977, lng: 23.3219 },
      'Plovdiv': { lat: 42.1354, lng: 24.7453 },
      'Varna': { lat: 43.2141, lng: 27.9147 },
      'Burgas': { lat: 42.5048, lng: 27.4626 },
      'Ruse': { lat: 43.8564, lng: 25.9656 }
      // Add more cities as needed
    };

    const coords = cityCoordinates[searchData.city];
    if (!coords) {
      return null;
    }

    // Radius in meters (convert km to m)
    const radiusInMeters = parseInt(searchData.radius) * 1000;

    return {
      aroundLatLng: `${coords.lat}, ${coords.lng}`,
      aroundRadius: radiusInMeters
    };
  }

  /**
   * Get index name based on sort option
   * الحصول على اسم الفهرس بناءً على خيار الترتيب
   */
  private getIndexForSort(sortBy?: string): string {
    const sortIndexMap: Record<string, string> = {
      'price_asc': `${ALGOLIA_INDEX_NAME}_price_asc`,
      'price_desc': `${ALGOLIA_INDEX_NAME}_price_desc`,
      'year_desc': `${ALGOLIA_INDEX_NAME}_year_desc`,
      'mileage_asc': `${ALGOLIA_INDEX_NAME}_mileage_asc`,
      'createdAt_desc': ALGOLIA_INDEX_NAME // Default index
    };

    return sortIndexMap[sortBy || 'createdAt_desc'] || ALGOLIA_INDEX_NAME;
  }

  /**
   * Search cars with Algolia
   * البحث عن السيارات باستخدام Algolia
   */
  async searchCars(
    searchData: SearchData,
    options: SearchOptions = {}
  ): Promise<{
    cars: CarListing[];
    totalResults: number;
    processingTime: number;
    page: number;
    totalPages: number;
  }> {
    try {
      serviceLogger.debug('Algolia search started', { searchData, options });

      // Build query string from description search
      const queryString = searchData.searchDescription || '';

      // Build filters
      const filters = this.buildAlgoliaFilters(searchData);
      const numericFilters = this.buildNumericFilters(searchData);
      const facetFilters = this.buildFacetFilters(searchData);
      const geoFilters = this.buildGeoFilters(searchData);

      // Select index based on sort option
      const indexName = this.getIndexForSort(options.sortBy);
      const searchIndex = this.client.initIndex(indexName);

      // Build search parameters
      const searchParams: any = {
        query: queryString,
        filters,
        page: options.page || 0,
        hitsPerPage: options.hitsPerPage || 100,
        attributesToRetrieve: '*',
        typoTolerance: true,
        removeStopWords: true
      };

      if (numericFilters.length > 0) {
        searchParams.numericFilters = numericFilters;
      }

      if (facetFilters.length > 0) {
        searchParams.facetFilters = facetFilters;
      }

      if (geoFilters) {
        Object.assign(searchParams, geoFilters);
      }

      // Execute search
  const response = await searchIndex.search(queryString, searchParams);

      serviceLogger.debug('Algolia search completed', {
        nbHits: response.nbHits,
        processingTimeMS: response.processingTimeMS
      });

      // Convert Algolia hits to CarListing format
      const cars: CarListing[] = response.hits.map((hit: any) => ({
        id: hit.objectID,
        ...hit,
        createdAt: hit.createdAt ? new Date(hit.createdAt) : undefined,
        updatedAt: hit.updatedAt ? new Date(hit.updatedAt) : undefined,
        expiresAt: hit.expiresAt ? new Date(hit.expiresAt) : undefined
      }));

      return {
        cars,
        totalResults: response.nbHits,
        processingTime: response.processingTimeMS,
        page: response.page,
        totalPages: response.nbPages
      };
    } catch (error) {
      serviceLogger.error('Error in Algolia search', error as Error, { searchData });
      throw error;
    }
  }

  /**
   * Get search statistics
   * الحصول على إحصائيات البحث
   */
  async getSearchStats(searchData: SearchData): Promise<{
    totalResults: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    topMakes: string[];
  }> {
    try {
      const { cars, totalResults } = await this.searchCars(searchData, { hitsPerPage: 1000 });

      if (cars.length === 0) {
        return {
          totalResults: 0,
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          topMakes: []
        };
      }

      // Calculate statistics
      const prices = cars.map(c => c.price);
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Count makes
      const makeCount: Record<string, number> = {};
      cars.forEach(car => {
        makeCount[car.make] = (makeCount[car.make] || 0) + 1;
      });

      // Get top 5 makes
      const topMakes = Object.entries(makeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([make]) => make);

      return {
        totalResults,
        averagePrice: Math.round(averagePrice),
        priceRange: { min: minPrice, max: maxPrice },
        topMakes
      };
    } catch (error) {
      serviceLogger.error('Error getting search stats', error as Error);
      throw error;
    }
  }

  /**
   * Get facet values for a specific attribute
   * الحصول على قيم الفئات لخاصية معينة
   */
  async getFacetValues(
    attribute: string,
    searchData?: SearchData
  ): Promise<Array<{ value: string; count: number }>> {
    try {
      const filters = searchData ? this.buildAlgoliaFilters(searchData) : 'status:active';

      const response = await this.index.search('', {
        filters,
        facets: [attribute],
        maxValuesPerFacet: 100,
        hitsPerPage: 0
      });

      const facets = response.facets?.[attribute] || {};
      
      return Object.entries(facets)
        .map(([value, count]) => ({ value, count: count as number }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      serviceLogger.error('Error getting facet values', error as Error, { attribute });
      return [];
    }
  }
}

const algoliaSearchServiceInstance = new AlgoliaSearchService();
export default algoliaSearchServiceInstance;
