// Location Helper Service - Unified location handling
// خدمة مساعدة الموقع - معالجة موحدة للموقع

import { BULGARIAN_CITIES } from '../constants/bulgarianCities';
import { BULGARIA_REGIONS } from '../data/bulgaria-locations';
import { serviceLogger } from './logger-wrapper';

export interface UnifiedLocation {
  cityId: string;
  cityNameBg: string;
  cityNameEn: string;
  regionId: string;
  regionNameBg: string;
  regionNameEn: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  postalCode: string;
  address: string;
}

export class LocationHelperService {
  /**
   * Convert any location input to unified structure
   * تحويل أي مدخل موقع إلى بنية موحدة
   */
  static unifyLocation(input: {
    city?: string;
    region?: string;
    postalCode?: string;
    address?: string;
    location?: any;
    locationData?: any;
  }): UnifiedLocation | null {
    let cityData: typeof BULGARIAN_CITIES[0] | null = null;
    
    // Strategy 1: Try by ID
    if (input.city) {
      cityData = BULGARIAN_CITIES.find(c => c.id === input.city) || null;
    }
    
    // Strategy 2: Try by Bulgarian name
    if (!cityData && input.city) {
      cityData = BULGARIAN_CITIES.find(c => c.nameBg === input.city) || null;
    }
    
    // Strategy 3: Try by English name
    if (!cityData && input.city) {
      cityData = BULGARIAN_CITIES.find(c => c.nameEn === input.city) || null;
    }
    
    // Strategy 4: Try from nested location.cityId
    if (!cityData && input.location?.cityId) {
      cityData = BULGARIAN_CITIES.find(c => c.id === input.location.cityId) || null;
    }
    
    // Strategy 5: Try from nested location.city
    if (!cityData && input.location?.city) {
      cityData = BULGARIAN_CITIES.find(c => 
        c.id === input.location.city ||
        c.nameBg === input.location.city ||
        c.nameEn === input.location.city
      ) || null;
    }
    
    // Strategy 6: Try from nested locationData
    if (!cityData && input.locationData?.cityId) {
      cityData = BULGARIAN_CITIES.find(c => c.id === input.locationData.cityId) || null;
    }
    
    // ✅ FIXED: If city not in main list, create a custom entry
    if (!cityData) {
      serviceLogger.warn('City not in main list, using custom entry', { city: input.city });
      
      // Try to find region data
      const regionInput = input.region || '';
      const regionCity = BULGARIAN_CITIES.find(
        c => c.nameEn.toLowerCase() === regionInput.toLowerCase() ||
             c.nameBg === regionInput ||
             c.id === regionInput.toLowerCase().replace(/\s+/g, '-')
      );
      
      // Create a custom location entry for ANY Bulgarian city/village
      return {
        cityId: (input.city || '').toLowerCase().replace(/\s+/g, '-'),
        cityNameBg: input.city || '',
        cityNameEn: input.city || '',
        regionId: regionCity?.id || regionInput.toLowerCase().replace(/\s+/g, '-'),
        regionNameBg: regionInput,
        regionNameEn: regionInput,
        coordinates: regionCity?.coordinates || { lat: 42.7339, lng: 25.4858 }, // Center of Bulgaria as fallback
        postalCode: input.postalCode || '',
        address: input.address || input.location || ''
      };
    }
    
    // Find region that contains this city
    const regionData = BULGARIA_REGIONS.find(r => 
      r.cities.includes(cityData!.nameBg)
    );
    
    // Create unified location
    const unified: UnifiedLocation = {
      cityId: cityData.id,
      cityNameBg: cityData.nameBg,
      cityNameEn: cityData.nameEn,
      regionId: (cityData as any).regionId || (regionData as any)?.id || '',
      regionNameBg: regionData?.name || '',
      regionNameEn: regionData?.nameEn || '',
      coordinates: cityData.coordinates,
      postalCode: input.postalCode || '',
      address: input.address || input.location || ''
    };
    
    serviceLogger.debug('Unified location', { cityId: unified.cityId, regionId: unified.regionId });
    return unified;
  }
  
  /**
   * Get city display name based on language
   */
  static getCityName(location: UnifiedLocation, language: 'bg' | 'en' = 'bg'): string {
    return language === 'bg' ? location.cityNameBg : location.cityNameEn;
  }
  
  /**
   * Get region display name based on language
   */
  static getRegionName(location: UnifiedLocation, language: 'bg' | 'en' = 'bg'): string {
    return language === 'bg' ? location.regionNameBg : location.regionNameEn;
  }
  
  /**
   * Get full address string
   */
  static getFullAddress(location: UnifiedLocation, language: 'bg' | 'en' = 'bg'): string {
    const city = this.getCityName(location, language);
    const region = this.getRegionName(location, language);
    
    if (location.address) {
      return `${location.address}, ${city}, ${region}`;
    }
    
    return `${city}, ${region}`;
  }
  
  /**
   * Check if a car is in a specific city
   */
  static isInCity(carLocation: UnifiedLocation, cityId: string): boolean {
    return carLocation.cityId === cityId;
  }
  
  /**
   * Check if a car is in a specific region
   */
  static isInRegion(carLocation: UnifiedLocation, regionId: string): boolean {
    return carLocation.regionId === regionId;
  }
  
  /**
   * Calculate distance between two locations (Haversine formula)
   */
  static calculateDistance(
    location1: { lat: number; lng: number },
    location2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(location2.lat - location1.lat);
    const dLng = this.toRad(location2.lng - location1.lng);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(location1.lat)) *
      Math.cos(this.toRad(location2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Find nearby cities within radius
   */
  static findNearbyCities(
    location: UnifiedLocation,
    radiusKm: number
  ): string[] {
    return BULGARIAN_CITIES
      .filter(city => {
        const distance = this.calculateDistance(
          location.coordinates,
          city.coordinates
        );
        return distance <= radiusKm && city.id !== location.cityId;
      })
      .map(city => city.id);
  }
  
  /**
   * Validate location data
   */
  static validateLocation(location: Partial<UnifiedLocation>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!location.cityId) {
      errors.push('City ID is required');
    }
    
    if (!location.cityNameBg) {
      errors.push('City name (BG) is required');
    }
    
    if (!location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
      errors.push('Coordinates are required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default LocationHelperService;

