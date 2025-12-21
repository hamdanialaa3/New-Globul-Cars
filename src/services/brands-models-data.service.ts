/**
 * Centralized Brands & Models Data Service
 * خدمة مركزية لإدارة بيانات الماركات والموديلات
 * 
 * Purpose: Provide unified access to car brands and models data from Markdown file
 * Used by: HomePage, AdvancedSearchPage, CarsPage, all search components
 * 
 * Features:
 * - Parse brands/models from cars_brands_models_complete.md
 * - Cache parsed data in memory for performance
 * - Provide search/filter utilities
 * - Support popular brands (MVR Bulgaria 2023 statistics)
 */

import { logger } from './logger-service';

export type BrandModelsMap = Record<string, string[]>;

// Premium/Top brands (mobile.de style - most searched in Europe)
export const TOP_BRANDS = [
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Volkswagen',
  'Porsche',
  'Ford',
  'Skoda',
  'Opel',
  'Toyota',
  'Volvo'
] as const;

// Backward compatibility alias (deprecated - use TOP_BRANDS)
export const POPULAR_BRANDS_BG = TOP_BRANDS;

export class BrandsModelsDataService {
  private static instance: BrandsModelsDataService;
  private brandModelsCache: BrandModelsMap | null = null;
  private loading = false;
  private loadPromise: Promise<BrandModelsMap> | null = null;
  private lastLoadTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  private constructor() {}

  static getInstance(): BrandsModelsDataService {
    if (!BrandsModelsDataService.instance) {
      BrandsModelsDataService.instance = new BrandsModelsDataService();
    }
    return BrandsModelsDataService.instance;
  }

  /**
   * Parse Markdown format: "## Brand" headings followed by "- Model" list items
   */
  private parseBrandsMarkdown(md: string): BrandModelsMap {
    const lines = md.split('\n');
    const result: BrandModelsMap = {};
    let currentBrand = '';

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Brand heading (## BrandName)
      if (trimmed.startsWith('## ')) {
        currentBrand = trimmed.replace(/^##\s+/, '').trim();
        if (currentBrand && !result[currentBrand]) {
          result[currentBrand] = [];
        }
      }
      // Model item (- ModelName)
      else if (trimmed.startsWith('- ') && currentBrand) {
        const model = trimmed.replace(/^-\s+/, '').trim();
        if (model && result[currentBrand]) {
          result[currentBrand].push(model);
        }
      }
    }

    return result;
  }

  /**
   * Load and parse brands/models data from Markdown file
   * Returns cached data if already loaded
   * @param forceReload - If true, bypasses cache and reloads from file
   */
  async loadBrandsModels(forceReload: boolean = false): Promise<BrandModelsMap> {
    // Clear cache if force reload is requested or cache is expired
    const now = Date.now();
    const cacheExpired = this.lastLoadTime > 0 && (now - this.lastLoadTime) > this.CACHE_DURATION;
    
    if (forceReload || cacheExpired) {
      this.brandModelsCache = null;
      this.loadPromise = null;
      this.lastLoadTime = 0;
    }

    // Return cached data if available and not expired
    if (this.brandModelsCache && !cacheExpired) {
      return this.brandModelsCache;
    }

    // Return existing load promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Start new load
    this.loading = true;
    this.loadPromise = (async () => {
      try {
        // Add timestamp to force browser cache bypass - use build time or current time
        // This ensures fresh data is loaded on each page load
        const timestamp = `?v=${Date.now()}`;
        const response = await fetch(`/data/cars_brands_models_complete.md${timestamp}`, { 
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load brands data (${response.status})`);
        }

        const text = await response.text();
        const parsed = this.parseBrandsMarkdown(text);
        
        // Cache the result and update load time
        this.brandModelsCache = parsed;
        this.lastLoadTime = Date.now();
        
        logger.info('Brands/Models data loaded successfully', {
          totalBrands: Object.keys(parsed).length,
          totalModels: Object.values(parsed).reduce((sum, models) => sum + models.length, 0),
          cacheTime: new Date(this.lastLoadTime).toISOString()
        });

        return parsed;
      } catch (error: unknown) {
        logger.error('Failed to load brands/models data', error);
        throw error;
      } finally {
        this.loading = false;
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Get all brand names sorted (popular brands first, then alphabetically)
   * @param forceReload - If true, bypasses cache and reloads from file
   */
  async getAllBrands(forceReload: boolean = false): Promise<string[]> {
    const data = await this.loadBrandsModels(forceReload);
    const allBrands = Object.keys(data);
    
    const popular = allBrands
      .filter(b => POPULAR_BRANDS_BG.includes(b as any))
      .sort((a, b) => {
        const indexA = POPULAR_BRANDS_BG.indexOf(a as any);
        const indexB = POPULAR_BRANDS_BG.indexOf(b as any);
        return indexA - indexB;
      });
    
    const others = allBrands
      .filter(b => !POPULAR_BRANDS_BG.includes(b as any))
      .sort((a, b) => a.localeCompare(b));
    
    return [...popular, ...others];
  }

  /**
   * Get models for a specific brand
   * @param brand - Brand name
   * @param forceReload - If true, bypasses cache and reloads from file
   */
  async getModelsForBrand(brand: string, forceReload: boolean = false): Promise<string[]> {
    const data = await this.loadBrandsModels(forceReload);
    return data[brand] || [];
  }

  /**
   * Check if a brand exists in the data
   */
  async brandExists(brand: string): Promise<boolean> {
    const data = await this.loadBrandsModels();
    return brand in data;
  }

  /**
   * Check if a model exists for a specific brand
   */
  async modelExists(brand: string, model: string): Promise<boolean> {
    const models = await this.getModelsForBrand(brand);
    return models.includes(model);
  }

  /**
   * Search brands by keyword (case-insensitive, partial match)
   */
  async searchBrands(keyword: string): Promise<string[]> {
    if (!keyword || keyword.trim().length === 0) {
      return this.getAllBrands();
    }

    const data = await this.loadBrandsModels();
    const allBrands = Object.keys(data);
    const lowerKeyword = keyword.toLowerCase().trim();

    return allBrands.filter(brand => 
      brand.toLowerCase().includes(lowerKeyword)
    ).sort((a, b) => {
      // Prioritize exact matches
      const aStarts = a.toLowerCase().startsWith(lowerKeyword);
      const bStarts = b.toLowerCase().startsWith(lowerKeyword);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Then popular brands
      const aPopular = POPULAR_BRANDS_BG.includes(a as any);
      const bPopular = POPULAR_BRANDS_BG.includes(b as any);
      if (aPopular && !bPopular) return -1;
      if (!aPopular && bPopular) return 1;
      
      // Finally alphabetically
      return a.localeCompare(b);
    });
  }

  /**
   * Search models by keyword for a specific brand
   */
  async searchModels(brand: string, keyword: string): Promise<string[]> {
    const models = await this.getModelsForBrand(brand);
    
    if (!keyword || keyword.trim().length === 0) {
      return models;
    }

    const lowerKeyword = keyword.toLowerCase().trim();
    return models.filter(model => 
      model.toLowerCase().includes(lowerKeyword)
    ).sort((a, b) => {
      // Prioritize exact matches
      const aStarts = a.toLowerCase().startsWith(lowerKeyword);
      const bStarts = b.toLowerCase().startsWith(lowerKeyword);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });
  }

  /**
   * Get popular brands (MVR Bulgaria 2023 statistics)
   */
  getPopularBrands(): readonly string[] {
    return POPULAR_BRANDS_BG;
  }

  /**
   * Check if a brand is popular
   */
  isPopularBrand(brand: string): boolean {
    return POPULAR_BRANDS_BG.includes(brand as any);
  }

  /**
   * Get all brands with their model counts
   */
  async getBrandsWithModelCounts(): Promise<Array<{ brand: string; count: number; isPopular: boolean }>> {
    const data = await this.loadBrandsModels();
    
    return Object.entries(data).map(([brand, models]) => ({
      brand,
      count: models.length,
      isPopular: this.isPopularBrand(brand)
    })).sort((a, b) => {
      // Sort by popularity first, then by model count, then alphabetically
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      if (a.count !== b.count) return b.count - a.count;
      return a.brand.localeCompare(b.brand);
    });
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.brandModelsCache = null;
    logger.info('Brands/Models cache cleared');
  }

  /**
   * Get raw data map (for advanced usage)
   */
  async getRawData(): Promise<BrandModelsMap> {
    return this.loadBrandsModels();
  }
}

// Singleton instance
export const brandsModelsDataService = BrandsModelsDataService.getInstance();
