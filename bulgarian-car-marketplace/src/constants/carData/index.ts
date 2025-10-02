import { CarMake } from './types';
import { 
  getAllMakes as _getAllMakes, 
  getModelsByMake as _getModelsByMake, 
  getGenerationsByModel as _getGenerationsByModel 
} from './helpers';

// Re-export types
export * from './types';
export * from './helpers';

// Lazy loading helper
let allBrandsCache: CarMake[] = [];

export const loadAllBrands = async (): Promise<CarMake[]> => {
  if (allBrandsCache.length > 0) return allBrandsCache;
  
  // Dynamic import of the large file only when needed
  const module = await import('../carData_static');
  allBrandsCache = module.CAR_DATA || [];
  return allBrandsCache;
};

// Popular brands only (loaded immediately for fast initial load)
export const POPULAR_BRAND_IDS = [
  'bmw', 'mercedes', 'audi', 'volkswagen', 'toyota', 'honda', 
  'ford', 'opel', 'renault', 'peugeot', 'citroen', 'skoda', 
  'seat', 'mazda', 'nissan', 'hyundai', 'kia'
];

// Load only popular brands (much faster!)
export const loadPopularBrands = async (): Promise<CarMake[]> => {
  const all = await loadAllBrands();
  return all.filter(brand => POPULAR_BRAND_IDS.includes(brand.id));
};

// Load a single brand by ID (only loads what's needed)
export const loadBrandById = async (brandId: string): Promise<CarMake | undefined> => {
  const all = await loadAllBrands();
  return all.find(brand => brand.id === brandId);
};

// Search brands by name (lazy loaded)
export const searchBrands = async (query: string): Promise<CarMake[]> => {
  const all = await loadAllBrands();
  const lowerQuery = query.toLowerCase();
  return all.filter(brand => 
    brand.name.toLowerCase().includes(lowerQuery) ||
    brand.id.includes(lowerQuery)
  );
};

// Helper functions that work with loaded brands
export const getAllMakes = async () => {
  const brands = await loadAllBrands();
  return _getAllMakes(brands);
};

export const getModelsByMake = async (makeId: string) => {
  const brands = await loadAllBrands();
  return _getModelsByMake(brands, makeId);
};

export const getGenerationsByModel = async (makeId: string, modelId: string) => {
  const brands = await loadAllBrands();
  return _getGenerationsByModel(brands, makeId, modelId);
};

// For backward compatibility - but now returns empty array initially
// Components should use loadPopularBrands() or loadAllBrands()
export const CAR_DATA: CarMake[] = [];
