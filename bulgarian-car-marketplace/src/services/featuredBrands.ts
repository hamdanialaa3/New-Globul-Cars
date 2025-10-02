// Featured Brands - Popular in Bulgarian Market
// الماركات المميزة - الشائعة في السوق البلغاري
// These brands appear first in dropdowns with special styling

export interface FeaturedBrand {
  name: string;
  reason: 'popular' | 'electric' | 'commercial';
  description?: string;
}

// ============================================
// POPULAR BRANDS - Most common in Bulgaria
// ============================================
export const POPULAR_BRANDS: string[] = [
  'Mercedes-Benz', // ⭐ #1 في السوق الفاخر
  'BMW',           // ⭐ #2 في السوق الفاخر
  'Volkswagen',    // ⭐ #1 في السوق العام
  'Toyota',        // ⭐ الأكثر موثوقية
  'BYD'            // ⭐ الرائد في الكهرباء
];

// ============================================
// ELECTRIC FOCUS BRANDS
// ============================================
export const ELECTRIC_BRANDS: string[] = [
  'Tesla',         // EV Pure
  'BYD',           // EV Pure + PHEV
  'Mercedes-Benz', // EQ Series
  'Volkswagen',    // ID. Series
  'Hyundai',       // Ioniq Series
  'Kia'            // EV6, EV9
];

// ============================================
// COMMERCIAL VANS
// ============================================
export const COMMERCIAL_VAN_MODELS: string[] = [
  'Sprinter',      // Mercedes
  'Vito',          // Mercedes
  'Transit',       // Ford
  'Transporter',   // VW
  'Crafter'        // VW
];

// ============================================
// ALL FEATURED BRANDS (in order of appearance)
// ============================================
export const FEATURED_BRANDS_ORDER: FeaturedBrand[] = [
  // Popular brands first
  { name: 'Mercedes-Benz', reason: 'popular', description: '⭐ الأكثر شيوعاً' },
  { name: 'Volkswagen', reason: 'popular', description: '⭐ الأكثر مبيعاً' },
  { name: 'BMW', reason: 'popular', description: '⭐ شائع جداً' },
  { name: 'Toyota', reason: 'popular', description: '⭐ الأكثر موثوقية' },
  { name: 'BYD', reason: 'electric', description: '⚡ الرائد في الكهرباء' },
  
  // Electric brands
  { name: 'Tesla', reason: 'electric', description: '⚡ كهرباء فقط' },
  { name: 'Hyundai', reason: 'electric', description: '⚡ Ioniq Series' },
  { name: 'Kia', reason: 'electric', description: '⚡ EV6, EV9' }
];

// Get featured brand names only
export const FEATURED_BRAND_NAMES = FEATURED_BRANDS_ORDER.map(b => b.name);

/**
 * Check if a brand is featured
 */
export const isFeaturedBrand = (brandName: string): boolean => {
  return FEATURED_BRAND_NAMES.includes(brandName);
};

/**
 * Get featured brand info
 */
export const getFeaturedBrandInfo = (brandName: string): FeaturedBrand | undefined => {
  return FEATURED_BRANDS_ORDER.find(b => b.name === brandName);
};

/**
 * Sort brands with featured ones first
 */
export const sortBrandsWithFeatured = (brands: string[]): string[] => {
  const featured = brands.filter(b => isFeaturedBrand(b))
    .sort((a, b) => {
      const indexA = FEATURED_BRAND_NAMES.indexOf(a);
      const indexB = FEATURED_BRAND_NAMES.indexOf(b);
      return indexA - indexB;
    });
  
  const regular = brands.filter(b => !isFeaturedBrand(b)).sort();
  
  return [...featured, ...regular];
};

export default {
  POPULAR_BRANDS,
  ELECTRIC_BRANDS,
  COMMERCIAL_VAN_MODELS,
  FEATURED_BRANDS_ORDER,
  isFeaturedBrand,
  getFeaturedBrandInfo,
  sortBrandsWithFeatured
};

