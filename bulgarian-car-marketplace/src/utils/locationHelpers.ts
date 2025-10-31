// Location Helper Utilities for Bulgarian Car Marketplace
// أدوات مساعدة للموقع - بلغاريا فقط

import { LocationData, createLocationData } from '../types/LocationData';
import { BULGARIAN_CITIES, getCityById } from '../constants/bulgarianCities';
import { logger } from '../services/logger-service';

/**
 * Convert city ID to LocationData
 * تحويل معرف المدينة إلى بيانات موقع كاملة
 */
export function cityIdToLocationData(
  cityId: string,
  region?: string,
  postalCode?: string,
  address?: string
): LocationData | null {
  const city = getCityById(cityId);
  
  if (!city) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('[locationHelpers] City not found', undefined, { cityId });
    }
    return null;
  }
  
  return createLocationData(
    city.id,
    city.nameBg,
    city.nameEn,
    city.coordinates,
    region || city.nameBg, // Use city name as region if not provided
    postalCode,
    address
  );
}

/**
 * Convert legacy location string to LocationData
 * تحويل نص الموقع القديم إلى بيانات موقع جديدة
 */
export function legacyLocationToLocationData(
  location: string | undefined,
  city: string,
  region: string,
  postalCode?: string
): LocationData | null {
  // Try to find city by ID first
  let cityData = getCityById(city);
  
  // If not found, try to find by name (BG or EN)
  if (!cityData) {
    cityData = BULGARIAN_CITIES.find(c => 
      c.nameBg === city || 
      c.nameEn === city ||
      c.id === city
    );
  }
  
  // If still not found, use location string
  if (!cityData && location) {
    cityData = BULGARIAN_CITIES.find(c => 
      c.nameBg === location || 
      c.nameEn === location ||
      c.id === location
    );
  }
  
  if (!cityData) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('[locationHelpers] Could not find city', undefined, { city, location });
    }
    // Return Sofia as fallback
    cityData = getCityById('sofia-grad')!;
  }
  
  return createLocationData(
    cityData.id,
    cityData.nameBg,
    cityData.nameEn,
    cityData.coordinates,
    region || cityData.nameBg,
    postalCode
  );
}

/**
 * Get all cities as LocationData array
 * الحصول على جميع المدن كمصفوفة بيانات موقع
 */
export function getAllCitiesAsLocationData(): LocationData[] {
  return BULGARIAN_CITIES.map(city => 
    createLocationData(
      city.id,
      city.nameBg,
      city.nameEn,
      city.coordinates,
      city.nameBg
    )
  );
}

/**
 * Get major cities (population > 70,000) as LocationData
 * الحصول على المدن الكبرى كبيانات موقع
 */
export function getMajorCitiesAsLocationData(): LocationData[] {
  return BULGARIAN_CITIES
    .filter(city => city.population && city.population > 70000)
    .map(city => 
      createLocationData(
        city.id,
        city.nameBg,
        city.nameEn,
        city.coordinates,
        city.nameBg
      )
    );
}

/**
 * Search cities by name (supports BG and EN)
 * البحث عن المدن بالاسم
 */
export function searchCities(query: string, language: 'bg' | 'en' = 'bg'): LocationData[] {
  const lowerQuery = query.toLowerCase();
  
  return BULGARIAN_CITIES
    .filter(city => {
      const nameBg = city.nameBg.toLowerCase();
      const nameEn = city.nameEn.toLowerCase();
      
      return nameBg.includes(lowerQuery) || nameEn.includes(lowerQuery);
    })
    .map(city => 
      createLocationData(
        city.id,
        city.nameBg,
        city.nameEn,
        city.coordinates,
        city.nameBg
      )
    );
}

/**
 * Get cities for dropdown/select (sorted by name)
 * الحصول على المدن لقائمة منسدلة
 */
export function getCitiesForDropdown(language: 'bg' | 'en' = 'bg'): Array<{
  value: string;
  label: string;
  locationData: LocationData;
}> {
  return BULGARIAN_CITIES
    .map(city => ({
      value: city.id,
      label: language === 'en' ? city.nameEn : city.nameBg,
      locationData: createLocationData(
        city.id,
        city.nameBg,
        city.nameEn,
        city.coordinates,
        city.nameBg
      )
    }))
    .sort((a, b) => a.label.localeCompare(b.label, language === 'bg' ? 'bg-BG' : 'en-US'));
}

/**
 * Validate Bulgarian postal code
 * التحقق من الرمز البريدي البلغاري
 */
export function validateBulgarianPostalCode(postalCode: string): boolean {
  // Bulgarian postal codes are 4 digits
  return /^\d{4}$/.test(postalCode);
}

/**
 * Format location for display
 * تنسيق الموقع للعرض
 */
export function formatLocationForDisplay(
  locationData: LocationData,
  language: 'bg' | 'en' = 'bg',
  includeRegion: boolean = true
): string {
  const cityName = language === 'en' ? locationData.cityName.en : locationData.cityName.bg;
  
  if (includeRegion && locationData.region && locationData.region !== cityName) {
    return `${cityName}, ${locationData.region}`;
  }
  
  return cityName;
}

/**
 * Get location display with postal code
 * الحصول على عرض الموقع مع الرمز البريدي
 */
export function formatLocationWithPostalCode(
  locationData: LocationData,
  language: 'bg' | 'en' = 'bg'
): string {
  const cityName = language === 'en' ? locationData.cityName.en : locationData.cityName.bg;
  
  if (locationData.postalCode) {
    return `${locationData.postalCode} ${cityName}`;
  }
  
  return cityName;
}

/**
 * Get full address string
 * الحصول على العنوان الكامل
 */
export function formatFullAddress(
  locationData: LocationData,
  language: 'bg' | 'en' = 'bg'
): string {
  const parts: string[] = [];
  
  if (locationData.address) {
    parts.push(locationData.address);
  }

  const cityName = language === 'en' ? locationData.cityName.en : locationData.cityName.bg;
  
  if (locationData.postalCode) {
    parts.push(`${locationData.postalCode} ${cityName}`);
  } else {
    parts.push(cityName);
  }
  
  if (locationData.region && locationData.region !== cityName) {
    parts.push(locationData.region);
  }
  
  parts.push('Bulgaria'); // Always add country
  
  return parts.join(', ');
}

/**
 * Check if two locations are the same city
 * التحقق من تطابق المدينة
 */
export function isSameCity(location1: LocationData, location2: LocationData): boolean {
  return location1.cityId === location2.cityId;
}

/**
 * Get nearest cities to a location
 * الحصول على أقرب المدن لموقع معين
 */
export function getNearestCities(
  locationData: LocationData,
  count: number = 5
): LocationData[] {
  const allCities = getAllCitiesAsLocationData();
  
  // Calculate distances and sort
  const citiesWithDistance = allCities
    .filter(city => city.cityId !== locationData.cityId) // Exclude same city
    .map(city => ({
      city,
      distance: calculateDistance(locationData, city)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
  
  return citiesWithDistance.map(item => item.city);
}

/**
 * Calculate distance between two locations (Haversine formula)
 * حساب المسافة بين موقعين
 */
function calculateDistance(location1: LocationData, location2: LocationData): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(location2.coordinates.lat - location1.coordinates.lat);
  const dLon = toRad(location2.coordinates.lng - location1.coordinates.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(location1.coordinates.lat)) *
    Math.cos(toRad(location2.coordinates.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Export all utilities
 */
const locationUtils = {
  cityIdToLocationData,
  legacyLocationToLocationData,
  getAllCitiesAsLocationData,
  getMajorCitiesAsLocationData,
  searchCities,
  getCitiesForDropdown,
  validateBulgarianPostalCode,
  formatLocationForDisplay,
  formatLocationWithPostalCode,
  formatFullAddress,
  isSameCity,
  getNearestCities
};

export default locationUtils;
