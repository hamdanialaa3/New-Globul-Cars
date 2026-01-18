// Location Data Types - Unified Structure for Koli One
// بنية موحدة لبيانات الموقع - بلغاريا فقط

/**
 * Unified Location Structure
 * البنية الموحدة للموقع في بلغاريا
 * 
 * This structure is used across the entire application
 * to ensure consistency in location data handling.
 */
export interface LocationData {
  // City ID from BULGARIAN_CITIES
  cityId: string;
  
  // City names in supported languages (BG/EN only)
  cityName: {
    bg: string;  // Bulgarian name (primary)
    en: string;  // English name
  };
  
  // GPS Coordinates
  coordinates: {
    lat: number;
    lng: number;
  };
  
  // Optional additional data
  region?: string;        // Province/Region name
  postalCode?: string;    // Bulgarian postal code (4 digits)
  address?: string;       // Full address (optional)
}

/**
 * Complete Location Interface
 * الواجهة الكاملة للموقع
 * 
 * Uses only the unified location structure
 */
export interface CompleteLocation {
  locationData: LocationData;
}

/**
 * Location Helper Functions
 */

/**
 * Create LocationData from city ID
 * إنشاء بيانات الموقع من معرف المدينة
 */
export function createLocationData(
  cityId: string,
  cityNameBg: string,
  cityNameEn: string,
  coordinates: { lat: number; lng: number },
  region?: string,
  postalCode?: string,
  address?: string
): LocationData {
  return {
    cityId,
    cityName: {
      bg: cityNameBg,
      en: cityNameEn
    },
    coordinates,
    region,
    postalCode,
    address
  };
}

/**
 * Validate LocationData
 * التحقق من صحة بيانات الموقع
 */
export function validateLocationData(location: LocationData): boolean {
  if (!location.cityId || location.cityId.trim() === '') {
    return false;
  }
  
  if (!location.cityName || !location.cityName.bg || !location.cityName.en) {
    return false;
  }
  
  if (!location.coordinates || 
      typeof location.coordinates.lat !== 'number' || 
      typeof location.coordinates.lng !== 'number') {
    return false;
  }
  
  // Validate coordinates are within Bulgaria
  // Bulgaria bounds: lat 41-44, lng 22-29
  if (location.coordinates.lat < 41 || location.coordinates.lat > 44 ||
      location.coordinates.lng < 22 || location.coordinates.lng > 29) {
    return false;
  }
  
  // Validate postal code if provided (Bulgarian format: 4 digits)
  if (location.postalCode && !/^\d{4}$/.test(location.postalCode)) {
    return false;
  }
  
  return true;
}

/**
 * Get city name by language
 * الحصول على اسم المدينة حسب اللغة
 */
export function getCityName(location: LocationData, language: 'bg' | 'en' = 'bg'): string {
  return location.cityName[language] || location.cityName.bg;
}

/**
 * Format location for display
 * تنسيق الموقع للعرض
 */
export function formatLocation(location: LocationData, language: 'bg' | 'en' = 'bg'): string {
  const cityName = getCityName(location, language);
  
  if (location.region) {
    return `${cityName}, ${location.region}`;
  }
  
  return cityName;
}

/**
 * Calculate distance between two locations (in kilometers)
 * حساب المسافة بين موقعين (بالكيلومترات)
 */
export function calculateDistance(
  location1: LocationData,
  location2: LocationData
): number {
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
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if location is in radius
 * التحقق من وجود الموقع ضمن نطاق معين
 */
export function isWithinRadius(
  centerLocation: LocationData,
  targetLocation: LocationData,
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLocation, targetLocation);
  return distance <= radiusKm;
}

/**
 * Export all types
 */
export default LocationData;
