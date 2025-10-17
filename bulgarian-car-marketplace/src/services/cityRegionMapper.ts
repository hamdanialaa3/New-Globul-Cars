/**
 * City to Region Mapper Service
 * Maps Bulgarian cities to their regions for the Premium Bulgaria Map
 */

import { BULGARIAN_CITIES } from '../constants/bulgarianCities';

// Map of major cities to their region IDs
export const CITY_TO_REGION_MAP: Record<string, string> = {
  // Sofia
  'sofia': 'sofia',
  
  // Plovdiv
  'plovdiv': 'plovdiv',
  'pazardzhik': 'plovdiv',
  'smolyan': 'plovdiv',
  'haskovo': 'plovdiv',
  
  // Varna
  'varna': 'varna',
  'dobrich': 'varna',
  'shumen': 'varna',
  
  // Burgas
  'burgas': 'burgas',
  'sliven': 'burgas',
  'yambol': 'burgas',
  
  // Ruse
  'ruse': 'ruse',
  'razgrad': 'ruse',
  'veliko-tarnovo': 'ruse',
  'gabrovo': 'ruse',
  'targovishte': 'ruse',
  
  // Blagoevgrad
  'blagoevgrad': 'blagoevgrad',
  'kyustendil': 'blagoevgrad',
  'pernik': 'blagoevgrad',
  
  // Pleven
  'pleven': 'pleven',
  'lovech': 'pleven',
  'vratsa': 'pleven',
  'montana': 'pleven',
  'vidin': 'pleven',
  
  // Stara Zagora
  'stara-zagora': 'stara-zagora',
  'kardzhali': 'stara-zagora',
};

/**
 * Convert city-based car counts to region-based counts
 * @param cityCounts - Object with city IDs as keys and car counts as values
 * @returns Object with region IDs as keys and aggregated car counts as values
 */
export const convertCityCountsToRegionCounts = (
  cityCounts: Record<string, number>
): Record<string, number> => {
  const regionCounts: Record<string, number> = {};

  // Initialize all regions with 0
  Object.values(CITY_TO_REGION_MAP).forEach(regionId => {
    if (!regionCounts[regionId]) {
      regionCounts[regionId] = 0;
    }
  });

  // Aggregate city counts into regions
  Object.entries(cityCounts).forEach(([cityId, count]) => {
    const regionId = CITY_TO_REGION_MAP[cityId];
    if (regionId) {
      regionCounts[regionId] = (regionCounts[regionId] || 0) + count;
    } else {
      // If city is not mapped, try to map it to Sofia as default
      console.warn(`City ${cityId} not mapped to any region, adding to Sofia`);
      regionCounts['sofia'] = (regionCounts['sofia'] || 0) + count;
    }
  });

  return regionCounts;
};

/**
 * Get all cities in a specific region
 * @param regionId - The region ID
 * @returns Array of city IDs in that region
 */
export const getCitiesInRegion = (regionId: string): string[] => {
  return Object.entries(CITY_TO_REGION_MAP)
    .filter(([_, region]) => region === regionId)
    .map(([cityId, _]) => cityId);
};

/**
 * Get region name for a city
 * @param cityId - The city ID
 * @returns The region ID or null if not found
 */
export const getRegionForCity = (cityId: string): string | null => {
  return CITY_TO_REGION_MAP[cityId] || null;
};

export default {
  CITY_TO_REGION_MAP,
  convertCityCountsToRegionCounts,
  getCitiesInRegion,
  getRegionForCity,
};

