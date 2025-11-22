// Car Brands & Models Service
// خدمة الماركات والموديلات
// This service provides car brand and model data for 183 brands
// With featured brands system for popular models in Bulgaria

import { ALL_CAR_BRANDS } from './allCarBrands';
import { logger } from './logger-service';
// NOTE: Legacy variant/model data imports will be deprecated. Prefer structuredBrandsData + normalization pipeline.
// @deprecated Direct usage planned for removal after Phase 2 (brandModels migration)
import { getBaseModels, getModelVariants, hasVariantData } from './carModelsAndVariants';
import { FEATURED_BRAND_NAMES, isFeaturedBrand, sortBrandsWithFeatured } from './featuredBrands';
import structuredBrandsData from '../data/car-brands-structured.json';
import { normalizeKey, resolveCanonicalBrand } from './brand-normalization';
// Diagnostic: quick log to verify structured data load (will run once at module init)
// Remove after confirming dropdown population works.
logger.info('[carBrandsService] structuredBrandsData keys loaded', {
  sampleKeys: Object.keys(structuredBrandsData).slice(0, 10)
});
// Expose for browser manual inspection
if (typeof window !== 'undefined') {
  (window as any)._structuredBrandKeys = Object.keys(structuredBrandsData);
  (window as any)._structuredSampleAudi = (structuredBrandsData as any)['Audi'];
}

// Normalized index for structured data keys
const STRUCTURED_BY_KEY: Record<string, string> = Object.keys(structuredBrandsData as any).reduce(
  (acc, key) => {
    acc[normalizeKey(key)] = key;
    return acc;
  }, {} as Record<string, string>
);

const getStructuredBrandDataByAny = (brand: string): StructuredBrandData | undefined => {
  const direct = (structuredBrandsData as any)[brand] as StructuredBrandData | undefined;
  if (direct) return direct;
  const canonical = resolveCanonicalBrand(brand);
  const byCanonical = (structuredBrandsData as any)[canonical] as StructuredBrandData | undefined;
  if (byCanonical) return byCanonical;
  const byKey = STRUCTURED_BY_KEY[normalizeKey(brand)] || STRUCTURED_BY_KEY[normalizeKey(canonical)];
  return byKey ? ((structuredBrandsData as any)[byKey] as StructuredBrandData) : undefined;
};

export interface CarModel {
  name: string;
  year?: string;
  engine?: string;
  power?: string;
  transmission?: string;
}

export interface CarBrand {
  name: string;
  models: string[]; // Unique model names
}

export interface StructuredBrandData {
  name: string;
  englishName: string;
  country: string;
  classes: string[];
  models: { [className: string]: string[] };
}

// All 183 car brands from directory
export const CAR_BRANDS: string[] = ALL_CAR_BRANDS;

// Popular Audi models (from the data file)
const AUDI_MODELS = [
  'A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
  'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8',
  'e-tron', 'e-tron GT',
  'RS Q8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7',
  'S3', 'S4', 'S5', 'S6', 'S7', 'S8',
  'SQ5', 'SQ7', 'SQ8',
  'TT', 'R8'
].sort();

// Popular BMW models
const BMW_MODELS = [
  '1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series',
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7',
  'Z4', 'i3', 'i4', 'iX', 'iX3'
].sort();

// Popular Mercedes models
const MERCEDES_MODELS = [
  'A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class',
  'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS',
  'AMG GT', 'EQC', 'EQS', 'G-Class'
].sort();

// Popular Volkswagen models
const VW_MODELS = [
  'Polo', 'Golf', 'Passat', 'Arteon', 'Tiguan', 'Touareg', 'T-Roc', 'T-Cross',
  'ID.3', 'ID.4', 'ID.5', 'ID. Buzz'
].sort();

// Popular Toyota models
const TOYOTA_MODELS = [
  'Aygo', 'Yaris', 'Corolla', 'Camry', 'Prius', 'RAV4', 'Highlander',
  'Land Cruiser', 'Hilux', 'C-HR', 'bZ4X'
].sort();

// Popular Ford models
const FORD_MODELS = [
  'Fiesta', 'Focus', 'Mondeo', 'Mustang', 'Kuga', 'Puma', 'Explorer',
  'Edge', 'Ranger', 'Transit', 'Bronco', 'F-150'
].sort();

// Popular Renault models
const RENAULT_MODELS = [
  'Clio', 'Megane', 'Captur', 'Kadjar', 'Koleos', 'Scenic', 'Talisman',
  'Twingo', 'Zoe', 'Arkana'
].sort();

// Popular Peugeot models
const PEUGEOT_MODELS = [
  '208', '308', '508', '2008', '3008', '5008', 'Rifter', 'Traveller',
  'Partner', 'e-208', 'e-2008'
].sort();

// Popular Opel models
const OPEL_MODELS = [
  'Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland',
  'Combo', 'Vivaro', 'Zafira'
].sort();

// Popular Skoda models
const SKODA_MODELS = [
  'Fabia', 'Octavia', 'Superb', 'Scala', 'Kamiq', 'Karoq', 'Kodiaq',
  'Enyaq iV'
].sort();

// Popular Hyundai models
const HYUNDAI_MODELS = [
  'i10', 'i20', 'i30', 'Elantra', 'Tucson', 'Santa Fe', 'Kona',
  'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Palisade'
].sort();

// Popular Kia models
const KIA_MODELS = [
  'Picanto', 'Rio', 'Ceed', 'Stonic', 'Sportage', 'Sorento', 'Niro',
  'EV6', 'EV9', 'Stinger'
].sort();

// Popular Nissan models
const NISSAN_MODELS = [
  'Micra', 'Note', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya',
  'Pathfinder', 'Navara'
].sort();

// Popular Honda models
const HONDA_MODELS = [
  'Jazz', 'Civic', 'Accord', 'HR-V', 'CR-V', 'e:Ny1', 'ZR-V'
].sort();

// Popular Mazda models
const MAZDA_MODELS = [
  'Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60',
  'MX-5', 'MX-30'
].sort();

// Popular Volvo models
const VOLVO_MODELS = [
  'V40', 'V60', 'V90', 'S60', 'S90', 'XC40', 'XC60', 'XC90',
  'C40 Recharge', 'EX30', 'EX90'
].sort();

// Popular Dacia models
const DACIA_MODELS = [
  'Sandero', 'Logan', 'Duster', 'Jogger', 'Spring'
].sort();

// Popular Seat models
const SEAT_MODELS = [
  'Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'
].sort();

// Popular Fiat models
const FIAT_MODELS = [
  '500', '500X', 'Panda', 'Tipo', '500e', '600e'
].sort();

// Popular Citroën models
const CITROEN_MODELS = [
  'C1', 'C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'Berlingo',
  'ë-C4', 'ë-Berlingo'
].sort();

// Popular Jeep models
const JEEP_MODELS = [
  'Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler',
  'Gladiator', 'Avenger'
].sort();

// Model database - will be expanded based on actual data files
const BRAND_MODELS_MAP: { [key: string]: string[] } = {
  'Audi': AUDI_MODELS,
  'BMW': BMW_MODELS,
  'Mercedes-Benz': MERCEDES_MODELS,
  'Volkswagen': VW_MODELS,
  'Toyota': TOYOTA_MODELS,
  'Ford': FORD_MODELS,
  'Renault': RENAULT_MODELS,
  'Peugeot': PEUGEOT_MODELS,
  'Opel': OPEL_MODELS,
  'Skoda': SKODA_MODELS,
  'Hyundai': HYUNDAI_MODELS,
  'Kia': KIA_MODELS,
  'Nissan': NISSAN_MODELS,
  'Honda': HONDA_MODELS,
  'Mazda': MAZDA_MODELS,
  'Volvo': VOLVO_MODELS,
  'Dacia': DACIA_MODELS,
  'Seat': SEAT_MODELS,
  'Fiat': FIAT_MODELS,
  'Citroën': CITROEN_MODELS,
  'Jeep': JEEP_MODELS,
  // For other brands, we'll provide a generic fallback
};

/**
 * Get all available car brands
 * Featured brands (popular in Bulgaria) appear first
 */
export const getAllBrands = (): string[] => {
  return sortBrandsWithFeatured(CAR_BRANDS);
};

/**
 * Get featured brands only
 */
export const getFeaturedBrands = (): string[] => {
  return FEATURED_BRAND_NAMES;
};

/**
 * Get classes (categories) for a specific brand
 * Returns the hierarchical classes from structured data, or empty array if not available
 */
export const getClassesForBrand = (brand: string): string[] => {
  const brandData = getStructuredBrandDataByAny(brand);
  if (brandData && brandData.classes) {
    return brandData.classes;
  }
  return []; // Return empty array for brands without structured data
};

/**
 * Get models for a specific brand and class
 * Returns models from the structured hierarchical data, or empty array if not available
 */
export const getModelsForBrandAndClass = (brand: string, className: string): string[] => {
  logger.debug('[carBrandsService] getModelsForBrandAndClass called', { brand, className });
  const brandData = getStructuredBrandDataByAny(brand);
  logger.debug('[carBrandsService] brandData retrieved', { hasBrandData: !!brandData });
  if (brandData && brandData.models && brandData.models[className]) {
    logger.debug('[carBrandsService] Found models for class', { className, count: brandData.models[className].length });
    return brandData.models[className];
  }
  logger.debug('[carBrandsService] No models found, returning empty array');
  return []; // Return empty array for brands without structured data
};

/**
 * Get all models for a brand (flattened from all classes)
 * Used for backward compatibility - returns structured data if available, otherwise legacy data
 */
export const getAllModelsForBrand = (brand: string): string[] => {
  logger.debug('[carBrandsService] getAllModelsForBrand called', { brand });
  const brandData = getStructuredBrandDataByAny(brand);
  logger.debug('[carBrandsService] brandData retrieved', { hasBrandData: !!brandData });
  if (brandData && brandData.models) {
    const allModels: string[] = [];
    Object.values(brandData.models).forEach(models => {
      allModels.push(...models);
    });
    const uniqueModels = [...new Set(allModels)]; // Remove duplicates
    logger.debug('[carBrandsService] All models found', { brand, count: uniqueModels.length });
    return uniqueModels;
  }

  // Fallback to legacy system for brands without structured data
  logger.debug('[carBrandsService] Falling back to legacy system', { brand });
  return getModelsForBrandLegacy(brand);
};

/**
 * Legacy getModelsForBrand function for brands without structured data
 */
const getModelsForBrandLegacy = (brand: string): string[] => {
  // Check if brand has detailed variant data
  if (hasVariantData(brand)) {
    return getBaseModels(brand);
  }

  // Return specific models if available (legacy)
  if (BRAND_MODELS_MAP[brand]) {
    return BRAND_MODELS_MAP[brand];
  }

  // Fallback: return empty array (user can type manually)
  return [];
};

/**
 * Get models for a specific brand
 * Returns base models if variant data exists, otherwise returns simple models
 * Now prioritizes structured data from cars_brands.md, with fallback to legacy system
 */
export const getModelsForBrand = (brand: string): string[] => {
  logger.debug(`[carBrandsService] getModelsForBrand called`, { brand });
  // FIRST PRIORITY: Use structured data from cars_brands.md (NEW DATA SOURCE)
  const allModels = getAllModelsForBrand(brand);
  logger.debug(`[carBrandsService] flattened models count`, { brand, count: allModels.length });
  let merged = allModels.slice();

  // Merge in legacy sources without overshadowing
  if (hasVariantData(brand)) {
    const base = getBaseModels(brand);
    merged = [...new Set([...merged, ...base])];
  }
  if (BRAND_MODELS_MAP[brand]) {
    merged = [...new Set([...merged, ...BRAND_MODELS_MAP[brand]])];
  }

  if (merged.length > 0) {
    logger.info(`[carBrandsService] Using merged models`, { brand, count: merged.length });
    return merged;
  }

  // FINAL LEGACY FALLBACKS
  if (hasVariantData(brand)) return getBaseModels(brand);
  if (BRAND_MODELS_MAP[brand]) return BRAND_MODELS_MAP[brand];

  // Fallback: return empty array (user can type manually)
  logger.warn(`[carBrandsService] No models found`, { brand });
  return [];
};

/**
 * Get variants for a specific model of a brand
 */
export const getVariantsForModel = (brand: string, model: string): string[] => {
  if (hasVariantData(brand)) {
    return getModelVariants(brand, model);
  }
  return [];
};

/**
 * Check if a brand-model combination has variant data
 */
export const modelHasVariants = (brand: string, model: string): boolean => {
  return hasVariantData(brand) && getModelVariants(brand, model).length > 0;
};

/**
 * Search brands by query
 */
export const searchBrands = (query: string): string[] => {
  if (!query) return CAR_BRANDS;
  
  const lowerQuery = query.toLowerCase();
  return CAR_BRANDS.filter(brand => 
    brand.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Search models for a brand by query
 */
export const searchModels = (brand: string, query: string): string[] => {
  logger.debug(`[carBrandsService] searchModels`, { brand, query });
  const models = getModelsForBrand(brand);
  if (!query) return models;
  
  const lowerQuery = query.toLowerCase();
  return models.filter(model => 
    model.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Validate if a brand exists
 */
export const isValidBrand = (brand: string): boolean => {
  return CAR_BRANDS.includes(brand);
};

/**
 * Validate if a model exists for a brand
 */
export const isValidModel = (brand: string, model: string): boolean => {
  logger.debug(`[carBrandsService] isValidModel`, { brand, model });
  const models = getModelsForBrand(brand);
  if (models.length === 0) return true; // Allow any model if no data
  return models.includes(model);
};

const CarBrandsService = {
  getAllBrands,
  getFeaturedBrands,
  getClassesForBrand,
  getModelsForBrandAndClass,
  getAllModelsForBrand,
  getModelsForBrand,
  getVariantsForModel,
  modelHasVariants,
  searchBrands,
  searchModels,
  isValidBrand,
  isValidModel,
  isFeaturedBrand
};

export { isFeaturedBrand };
export default CarBrandsService;

