/**
 * Filter URL State Service
 * خدمة حالة URL للفلاتر
 * 
 * Manages persistent filter state in URL for deep linking and sharing
 * 
 * @author Koli.one Team
 * @version 1.0.0
 * @date January 30, 2026
 */

import { logger } from '../logger-service';

import { FilterCategory } from './homepage-filter.service';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterState {
  // Basic filters
  brand?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  
  // Vehicle specs
  fuel?: string;
  transmission?: string;
  bodyType?: string;
  seatsMin?: number;
  seatsMax?: number;
  mileageMax?: number;
  engineHpMin?: number;
  
  // Location
  city?: string;
  region?: string;
  
  // Seller
  sellerType?: 'dealer' | 'private';
  dealerVerified?: boolean;
  
  // Status
  isPremium?: boolean;
  isFeatured?: boolean;
  condition?: 'new' | 'used';
  
  // Time
  postedWithin?: '24h' | '7d' | '30d';
  
  // Features
  features?: string[];
  
  // Sorting
  sort?: 'created_desc' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';
  
  // Pagination
  page?: number;
  pageSize?: number;
}

// ============================================================================
// URL PARAM MAPPING (exported for future use)
// ============================================================================

export const PARAM_MAP: Record<keyof FilterState, string> = {
  brand: 'brand',
  model: 'model',
  priceMin: 'price_min',
  priceMax: 'price_max',
  yearMin: 'year_min',
  yearMax: 'year_max',
  fuel: 'fuel',
  transmission: 'transmission',
  bodyType: 'body_type',
  seatsMin: 'seats_min',
  seatsMax: 'seats_max',
  mileageMax: 'mileage_max',
  engineHpMin: 'engine_hp_min',
  city: 'city',
  region: 'region',
  sellerType: 'seller_type',
  dealerVerified: 'dealer_verified',
  isPremium: 'is_premium',
  isFeatured: 'is_featured',
  condition: 'condition',
  postedWithin: 'posted_within',
  features: 'features',
  sort: 'sort',
  page: 'page',
  pageSize: 'page_size'
};

// ============================================================================
// FILTER URL STATE SERVICE
// ============================================================================

class FilterUrlStateService {
  /**
   * Parse URL search params to FilterState
   */
  parseFromUrl(searchParams: URLSearchParams): FilterState {
    const state: FilterState = {};

    // Brand
    const brand = searchParams.get('brand');
    if (brand) state.brand = brand;

    // Model
    const model = searchParams.get('model');
    if (model) state.model = model;

    // Price range
    const priceMin = searchParams.get('price_min');
    if (priceMin) state.priceMin = parseInt(priceMin, 10);
    const priceMax = searchParams.get('price_max');
    if (priceMax) state.priceMax = parseInt(priceMax, 10);

    // Year range
    const yearMin = searchParams.get('year_min');
    if (yearMin) state.yearMin = parseInt(yearMin, 10);
    const yearMax = searchParams.get('year_max');
    if (yearMax) state.yearMax = parseInt(yearMax, 10);

    // Fuel
    const fuel = searchParams.get('fuel');
    if (fuel) state.fuel = fuel;

    // Transmission
    const transmission = searchParams.get('transmission');
    if (transmission) state.transmission = transmission;

    // Body type
    const bodyType = searchParams.get('body_type');
    if (bodyType) state.bodyType = bodyType;

    // Seats
    const seatsMin = searchParams.get('seats_min');
    if (seatsMin) state.seatsMin = parseInt(seatsMin, 10);
    const seatsMax = searchParams.get('seats_max');
    if (seatsMax) state.seatsMax = parseInt(seatsMax, 10);

    // Mileage
    const mileageMax = searchParams.get('mileage_max');
    if (mileageMax) state.mileageMax = parseInt(mileageMax, 10);

    // Engine HP
    const engineHpMin = searchParams.get('engine_hp_min');
    if (engineHpMin) state.engineHpMin = parseInt(engineHpMin, 10);

    // Location
    const city = searchParams.get('city');
    if (city) state.city = city;
    const region = searchParams.get('region');
    if (region) state.region = region;

    // Seller
    const sellerType = searchParams.get('seller_type');
    if (sellerType === 'dealer' || sellerType === 'private') {
      state.sellerType = sellerType;
    }
    const dealerVerified = searchParams.get('dealer_verified');
    if (dealerVerified === 'true') state.dealerVerified = true;

    // Status
    const isPremium = searchParams.get('is_premium');
    if (isPremium === 'true') state.isPremium = true;
    const isFeatured = searchParams.get('is_featured');
    if (isFeatured === 'true') state.isFeatured = true;
    const condition = searchParams.get('condition');
    if (condition === 'new' || condition === 'used') {
      state.condition = condition;
    }

    // Time
    const postedWithin = searchParams.get('posted_within');
    if (postedWithin === '24h' || postedWithin === '7d' || postedWithin === '30d') {
      state.postedWithin = postedWithin;
    }

    // Features (comma-separated)
    const features = searchParams.get('features');
    if (features) {
      state.features = features.split(',').map(f => f.trim());
    }

    // Sort
    const sort = searchParams.get('sort');
    if (sort === 'created_desc' || sort === 'price_asc' || sort === 'price_desc' || 
        sort === 'year_desc' || sort === 'mileage_asc') {
      state.sort = sort;
    }

    // Pagination
    const page = searchParams.get('page');
    if (page) state.page = parseInt(page, 10);
    const pageSize = searchParams.get('page_size');
    if (pageSize) state.pageSize = parseInt(pageSize, 10);

    return state;
  }

  /**
   * Convert FilterState to URL search params string
   */
  toUrlString(state: FilterState): string {
    const params = new URLSearchParams();

    if (state.brand) params.set('brand', state.brand);
    if (state.model) params.set('model', state.model);
    if (state.priceMin) params.set('price_min', state.priceMin.toString());
    if (state.priceMax) params.set('price_max', state.priceMax.toString());
    if (state.yearMin) params.set('year_min', state.yearMin.toString());
    if (state.yearMax) params.set('year_max', state.yearMax.toString());
    if (state.fuel) params.set('fuel', state.fuel);
    if (state.transmission) params.set('transmission', state.transmission);
    if (state.bodyType) params.set('body_type', state.bodyType);
    if (state.seatsMin) params.set('seats_min', state.seatsMin.toString());
    if (state.seatsMax) params.set('seats_max', state.seatsMax.toString());
    if (state.mileageMax) params.set('mileage_max', state.mileageMax.toString());
    if (state.engineHpMin) params.set('engine_hp_min', state.engineHpMin.toString());
    if (state.city) params.set('city', state.city);
    if (state.region) params.set('region', state.region);
    if (state.sellerType) params.set('seller_type', state.sellerType);
    if (state.dealerVerified) params.set('dealer_verified', 'true');
    if (state.isPremium) params.set('is_premium', 'true');
    if (state.isFeatured) params.set('is_featured', 'true');
    if (state.condition) params.set('condition', state.condition);
    if (state.postedWithin) params.set('posted_within', state.postedWithin);
    if (state.features && state.features.length > 0) {
      params.set('features', state.features.join(','));
    }
    if (state.sort) params.set('sort', state.sort);
    if (state.page) params.set('page', state.page.toString());
    if (state.pageSize) params.set('page_size', state.pageSize.toString());

    return params.toString();
  }

  /**
   * Update browser URL with filter state (pushState)
   */
  updateBrowserUrl(state: FilterState, basePath = '/search'): void {
    const queryString = this.toUrlString(state);
    const newUrl = queryString ? `${basePath}?${queryString}` : basePath;
    
    window.history.pushState({ filters: state }, '', newUrl);
    
    logger.info('URL updated with filters', { newUrl });
  }

  /**
   * Replace browser URL with filter state (replaceState)
   */
  replaceBrowserUrl(state: FilterState, basePath = '/search'): void {
    const queryString = this.toUrlString(state);
    const newUrl = queryString ? `${basePath}?${queryString}` : basePath;
    
    window.history.replaceState({ filters: state }, '', newUrl);
  }

  /**
   * Get current filter state from browser URL
   */
  getCurrentState(): FilterState {
    const searchParams = new URLSearchParams(window.location.search);
    return this.parseFromUrl(searchParams);
  }

  /**
   * Create shareable link from filter state
   */
  createShareableLink(state: FilterState, basePath = '/search'): string {
    const queryString = this.toUrlString(state);
    const baseUrl = window.location.origin;
    return queryString ? `${baseUrl}${basePath}?${queryString}` : `${baseUrl}${basePath}`;
  }

  /**
   * Check if two filter states are equal
   */
  areStatesEqual(a: FilterState, b: FilterState): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /**
   * Get preset filter state by name
   */
  getPreset(presetName: string): FilterState {
    const presets: Record<string, FilterState> = {
      family: { seatsMin: 7 },
      sports: { seatsMax: 2, engineHpMin: 241 },
      electric: { fuel: 'electric' },
      hybrid: { fuel: 'hybrid' },
      newlyAdded: { sort: 'created_desc' },
      lowMileage: { mileageMax: 3515 },
      budget: { priceMax: 5000 },
      premium: { priceMin: 35000 },
      verified: { dealerVerified: true, sellerType: 'dealer' },
      newModels: { yearMin: 2023 },
      classic: { yearMax: 1994 }
    };

    return presets[presetName] || {};
  }

  /**
   * Get all available presets
   */
  getAllPresets(): { name: string; label: { bg: string; en: string }; state: FilterState }[] {
    return [
      { 
        name: 'family', 
        label: { bg: 'Семейни', en: 'Family' }, 
        state: this.getPreset('family') 
      },
      { 
        name: 'sports', 
        label: { bg: 'Спортни', en: 'Sports' }, 
        state: this.getPreset('sports') 
      },
      { 
        name: 'electric', 
        label: { bg: 'Електрически', en: 'Electric' }, 
        state: this.getPreset('electric') 
      },
      { 
        name: 'newlyAdded', 
        label: { bg: 'Нови обяви', en: 'Newly Added' }, 
        state: this.getPreset('newlyAdded') 
      },
      { 
        name: 'lowMileage', 
        label: { bg: 'Нисък пробег', en: 'Low Mileage' }, 
        state: this.getPreset('lowMileage') 
      },
      { 
        name: 'budget', 
        label: { bg: 'Бюджетни', en: 'Budget' }, 
        state: this.getPreset('budget') 
      },
      { 
        name: 'premium', 
        label: { bg: 'Премиум', en: 'Premium' }, 
        state: this.getPreset('premium') 
      },
      { 
        name: 'verified', 
        label: { bg: 'Проверени', en: 'Verified' }, 
        state: this.getPreset('verified') 
      }
    ];
  }

  /**
   * Clear all filters
   */
  clearFilters(): FilterState {
    return {};
  }

  /**
   * Count active filters
   */
  countActiveFilters(state: FilterState): number {
    let count = 0;
    
    if (state.brand) count++;
    if (state.model) count++;
    if (state.priceMin || state.priceMax) count++;
    if (state.yearMin || state.yearMax) count++;
    if (state.fuel) count++;
    if (state.transmission) count++;
    if (state.bodyType) count++;
    if (state.seatsMin || state.seatsMax) count++;
    if (state.mileageMax) count++;
    if (state.engineHpMin) count++;
    if (state.city) count++;
    if (state.region) count++;
    if (state.sellerType) count++;
    if (state.dealerVerified) count++;
    if (state.isPremium) count++;
    if (state.isFeatured) count++;
    if (state.condition) count++;
    if (state.postedWithin) count++;
    if (state.features && state.features.length > 0) count++;
    
    return count;
  }

  /**
   * Detect filter category from state
   */
  detectCategoryFromState(state: FilterState): FilterCategory {
    // Family: 7+ seats
    if (state.seatsMin && state.seatsMin >= 7) {
      return 'family';
    }
    
    // Sports: 2 seats + high HP
    if (state.seatsMax && state.seatsMax <= 2 && state.engineHpMin && state.engineHpMin >= 240) {
      return 'sports';
    }
    
    // Electric
    if (state.fuel === 'electric') {
      return 'electric';
    }
    
    // Hybrid
    if (state.fuel === 'hybrid') {
      return 'hybrid';
    }
    
    // Low mileage new
    if (state.mileageMax && state.mileageMax <= 3515) {
      return 'low_mileage_new';
    }
    
    // Budget
    if (state.priceMax && state.priceMax <= 5000) {
      return 'budget';
    }
    
    // Premium
    if (state.priceMin && state.priceMin >= 35000) {
      return 'premium';
    }
    
    // Verified dealer
    if (state.dealerVerified && state.sellerType === 'dealer') {
      return 'verified_dealer';
    }
    
    // Body types
    if (state.bodyType === 'suv') return 'suv';
    if (state.bodyType === 'sedan') return 'sedan';
    if (state.bodyType === 'hatchback') return 'hatchback';
    if (state.bodyType === 'van') return 'van';
    
    // Fuel types
    if (state.fuel === 'diesel') return 'diesel';
    if (state.fuel === 'petrol') return 'petrol';
    
    // Year ranges
    if (state.yearMax && state.yearMax < 1995) return 'classic';
    if (state.yearMin && state.yearMin >= 2023) return 'new_model';
    
    // Newly added (sort by created)
    if (state.sort === 'created_desc') {
      return 'newly_added';
    }
    
    return 'all';
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const filterUrlStateService = new FilterUrlStateService();
export default filterUrlStateService;
