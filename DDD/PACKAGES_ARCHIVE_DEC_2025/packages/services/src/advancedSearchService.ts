// Deprecated facade that delegates to the unified search service.
// Kept temporarily to avoid breaking imports; will be removed after full migration.

import { SearchData } from '@globul-cars/cars/types';
import { CarListing } from '@globul-cars/core/typesCarListing';
import { searchService } from '@globul-cars/services/search/UnifiedSearchService';

type AdvancedSearchResult = {
  cars: (CarListing | any)[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  processingTime: number;
};

class AdvancedSearchServiceDeprecatedFacade {
  constructor() {
    if (typeof console !== 'undefined') {
      console.warn('[DEPRECATED] advancedSearchService is replaced by searchService (UnifiedSearchService). Please update imports.');
    }
  }

  async searchCars(searchData: SearchData): Promise<CarListing[]> {
    const res = await searchService.advancedSearchPaged(searchData, 1, 100);
    return res.cars as CarListing[];
  }

  async getSearchStats(searchData: SearchData): Promise<{
    totalResults: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    topMakes: string[];
  }> {
    const res = await searchService.advancedSearchPaged(searchData, 1, 500);
    const cars = res.cars as any[];
    if (!cars.length) {
      return { totalResults: 0, averagePrice: 0, priceRange: { min: 0, max: 0 }, topMakes: [] };
    }
    const prices = cars.map(c => c.price).filter((p: any) => typeof p === 'number');
    const avg = prices.length ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    const makeCount: Record<string, number> = {};
    cars.forEach((c: any) => { if (c.make) makeCount[c.make] = (makeCount[c.make] || 0) + 1; });
    const topMakes = Object.entries(makeCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m]) => m);
    return { totalResults: cars.length, averagePrice: Math.round(avg), priceRange: { min, max }, topMakes };
  }

  async searchWithPagination(
    searchData: SearchData,
    _userId?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<AdvancedSearchResult> {
    const start = Date.now();
    const res = await searchService.advancedSearchPaged(searchData, page, pageSize);
    return {
      cars: res.cars as any[],
      totalCount: res.total,
      page: res.page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(res.total / pageSize)),
      processingTime: Date.now() - start
    };
  }
}

export default new AdvancedSearchServiceDeprecatedFacade();
