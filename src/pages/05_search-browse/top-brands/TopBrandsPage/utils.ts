// Top Brands Page Utility Functions
// Brand sorting and categorization logic

import { BrandWithStats } from './types';
import { FEATURED_BRANDS_ORDER, ELECTRIC_BRANDS } from '@/services/featuredBrands';

/**
 * Sort brands intelligently:
 * 1. Featured brands first (by predefined order)
 * 2. Then by total cars count (descending)
 * 3. Then alphabetically by name
 */
export const sortBrandsIntelligently = (brands: BrandWithStats[]): BrandWithStats[] => {
  return brands.sort((a, b) => {
    // Featured brands first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // If both featured, sort by FEATURED_BRANDS_ORDER
    if (a.featured && b.featured) {
      const indexA = FEATURED_BRANDS_ORDER.findIndex(f => f.name === a.name);
      const indexB = FEATURED_BRANDS_ORDER.findIndex(f => f.name === b.name);
      return indexA - indexB;
    }
    
    // Otherwise sort by total cars (descending)
    if (a.totalCars !== b.totalCars) {
      return b.totalCars - a.totalCars;
    }
    
    // Finally alphabetically
    return a.name.localeCompare(b.name);
  });
};

/**
 * Categorize brands into Popular, Electric, and Others
 */
export const categorizeBrands = (brands: BrandWithStats[]) => {
  const popularBrands = brands.filter(b => 
    b.featured && b.reason === 'popular'
  );
  
  const electricBrands = brands.filter(b => 
    ELECTRIC_BRANDS.includes(b.name)
  );
  
  const otherBrands = brands.filter(b => 
    !b.featured && !ELECTRIC_BRANDS.includes(b.name)
  );

  return {
    popular: sortBrandsIntelligently(popularBrands),
    electric: sortBrandsIntelligently(electricBrands),
    others: sortBrandsIntelligently(otherBrands)
  };
};

/**
 * Calculate brand statistics from car data
 */
export const calculateBrandStats = (
  brandId: string,
  brandName: string,
  brandLogo: string,
  totalSeries: number,
  carCount: number
): BrandWithStats => {
  const featuredInfo = FEATURED_BRANDS_ORDER.find(f => f.name === brandName);
  
  return {
    id: brandId,
    name: brandName,
    logo: brandLogo,
    totalSeries,
    totalCars: carCount,
    featured: !!featuredInfo,
    reason: featuredInfo?.reason,
    description: featuredInfo?.description
  };
};

/**
 * Clean brand description from emojis (for constitution compliance)
 */
export const cleanDescription = (description?: string): string => {
  if (!description) return '';
  
  // Remove all emojis and special unicode characters
  return description
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
    .replace(/[⭐⚡🚗📍📞🎯❤️🔍💬🌐✅❌🔐📊📢💰🏠📝🔧⚙️🎉✨🔥💡📈🚀]/g, '') // Specific emojis
    .trim();
};

