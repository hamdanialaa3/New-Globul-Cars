/**
 * Brands & Models Migration Helper
 * مساعد التوافق مع الأنظمة القديمة
 * 
 * @deprecated This file provides compatibility layer for legacy code.
 * All new code should use brandsModelsDataService directly.
 * 
 * Purpose:
 * - Provides same interface as old systems (car-makes-models.ts, carBrandsService.ts)
 * - Uses new centralized service internally
 * - Allows gradual migration without breaking existing code
 * 
 * Timeline:
 * - Created: Nov 16, 2025
 * - Remove after: All legacy consumers migrated
 */

import { brandsModelsDataService } from './brands-models-data.service';

// ============================================
// ASYNC VERSIONS (Recommended)
// ============================================

/**
 * Get all available car brands
 * @deprecated Use brandsModelsDataService.getAllBrands() directly
 */
export const getAllMakes = async (): Promise<string[]> => {
  return brandsModelsDataService.getAllBrands();
};

/**
 * Get all brands (alias for getAllMakes)
 * @deprecated Use brandsModelsDataService.getAllBrands() directly
 */
export const getAllBrands = async (): Promise<string[]> => {
  return brandsModelsDataService.getAllBrands();
};

/**
 * Get models for specific brand
 * @deprecated Use brandsModelsDataService.getModelsForBrand() directly
 */
export const getModelsByMake = async (make: string): Promise<string[]> => {
  return brandsModelsDataService.getModelsForBrand(make);
};

/**
 * Get models by brand (alias for getModelsByMake)
 * @deprecated Use brandsModelsDataService.getModelsForBrand() directly
 */
export const getModelsByBrand = async (brand: string): Promise<string[]> => {
  return brandsModelsDataService.getModelsForBrand(brand);
};

/**
 * Check if brand is featured (popular in Bulgaria - MVR 2023)
 * @deprecated Use brandsModelsDataService.isPopularBrand() directly
 */
export const isFeaturedBrand = async (brand: string): Promise<boolean> => {
  return brandsModelsDataService.isPopularBrand(brand);
};

/**
 * Sort brands with featured ones first
 * @deprecated Use brandsModelsDataService.getAllBrands() (already sorted)
 */
export const sortBrandsWithFeatured = async (brands: string[]): Promise<string[]> => {
  const popularBrands = await brandsModelsDataService.getPopularBrands();
  const popularSet = new Set(popularBrands);
  
  const popular = brands.filter(b => popularSet.has(b));
  const others = brands.filter(b => !popularSet.has(b));
  
  return [...popular, ...others];
};

// ============================================
// SYNC VERSIONS (With Cache - Less Recommended)
// ============================================

interface CacheData {
  brands: string[] | null;
  brandModelsMap: Map<string, string[]>;
  popularBrands: string[] | null;
  loadingPromise: Promise<void> | null;
}

const cache: CacheData = {
  brands: null,
  brandModelsMap: new Map(),
  popularBrands: null,
  loadingPromise: null
};

/**
 * Initialize cache (call on app startup)
 */
const initializeCache = async (): Promise<void> => {
  if (cache.loadingPromise) {
    return cache.loadingPromise;
  }

  cache.loadingPromise = (async () => {
    try {
      // Load brands
      const brands = await brandsModelsDataService.getAllBrands();
      cache.brands = brands;

      // Load popular brands
      const popularBrands = await brandsModelsDataService.getPopularBrands();
      cache.popularBrands = [...popularBrands]; // Convert readonly to mutable array

      console.log('[Migration Helper] Cache initialized:', {
        brandsCount: brands.length,
        popularCount: popularBrands.length
      });
    } catch (error) {
      console.error('[Migration Helper] Failed to initialize cache:', error);
      // Set empty arrays as fallback
      cache.brands = [];
      cache.popularBrands = [];
    } finally {
      cache.loadingPromise = null;
    }
  })();

  return cache.loadingPromise;
};

/**
 * Get all makes (sync version with cache)
 * @deprecated Use async getAllMakes() instead
 * @returns Cached brands array or empty array if not loaded
 */
export const getAllMakesSync = (): string[] => {
  if (!cache.brands) {
    // Trigger load if not started
    if (!cache.loadingPromise) {
      initializeCache();
    }
    return []; // Return empty until loaded
  }
  return cache.brands;
};

/**
 * Get models by make (sync version with cache)
 * @deprecated Use async getModelsByMake() instead
 * @returns Cached models array or empty array if not loaded
 */
export const getModelsByMakeSync = (make: string): string[] => {
  // Check cache first
  if (cache.brandModelsMap.has(make)) {
    return cache.brandModelsMap.get(make)!;
  }

  // Load async and cache
  brandsModelsDataService.getModelsForBrand(make)
    .then(models => {
      cache.brandModelsMap.set(make, models);
    })
    .catch(error => {
      console.error(`[Migration Helper] Failed to load models for ${make}:`, error);
    });

  return []; // Return empty until loaded
};

/**
 * Check if brand is featured (sync version with cache)
 * @deprecated Use async isFeaturedBrand() instead
 */
export const isFeaturedBrandSync = (brand: string): boolean => {
  if (!cache.popularBrands) {
    // Trigger load if not started
    if (!cache.loadingPromise) {
      initializeCache();
    }
    return false;
  }
  return cache.popularBrands.includes(brand);
};

// ============================================
// DROPDOWN OPTIONS FORMAT (for legacy UI)
// ============================================

export interface DropdownOption {
  value: string;
  label: string;
  labelEn: string;
}

/**
 * Get brands in dropdown format
 * @deprecated Use brandsModelsDataService with custom formatting
 */
export const getBrandsAsDropdownOptions = async (): Promise<DropdownOption[]> => {
  const brands = await brandsModelsDataService.getAllBrands();
  
  return brands.map(brand => ({
    value: brand.toLowerCase().replace(/\s+/g, '-'),
    label: brand,
    labelEn: brand
  }));
};

/**
 * Get models in dropdown format
 * @deprecated Use brandsModelsDataService with custom formatting
 */
export const getModelsAsDropdownOptions = async (brand: string): Promise<DropdownOption[]> => {
  const models = await brandsModelsDataService.getModelsForBrand(brand);
  
  return models.map(model => ({
    value: model.toLowerCase().replace(/\s+/g, '-'),
    label: model,
    labelEn: model
  }));
};

// ============================================
// AUTO-INITIALIZATION
// ============================================

// Auto-initialize cache when module loads
if (typeof window !== 'undefined') {
  // Delay slightly to not block initial page load
  setTimeout(() => {
    initializeCache().catch(error => {
      console.warn('[Migration Helper] Auto-init failed:', error);
    });
  }, 1000);
}

// ============================================
// EXPORTS
// ============================================

const migrationHelperExports = {
  // Async (recommended)
  getAllMakes,
  getAllBrands,
  getModelsByMake,
  getModelsByBrand,
  isFeaturedBrand,
  sortBrandsWithFeatured,
  
  // Sync (with cache)
  getAllMakesSync,
  getModelsByMakeSync,
  isFeaturedBrandSync,
  
  // Dropdown format
  getBrandsAsDropdownOptions,
  getModelsAsDropdownOptions,
  
  // Cache control
  initializeCache
};

export default migrationHelperExports;
