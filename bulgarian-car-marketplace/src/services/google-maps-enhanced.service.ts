/**
 * GOOGLE MAPS ENHANCED SERVICE
 * خدمة خرائط جوجل المحسّنة
 *
 * Integration with 7 Google Maps APIs:
 * 1. Maps JavaScript API - Map display
 * 2. Geocoding API - Address to coordinates
 * 3. Places API - Autocomplete & Place Details
 * 4. Distance Matrix API - Distance calculation
 * 5. Directions API - Routing
 * 6. Time Zone API - Local time
 * 7. Maps Embed API - Static maps
 */

import { serviceLogger } from './logger-service';
import { logger } from './logger-service';
import {
  DistanceResult,
  DirectionsResult,
  TimeZoneResult,
  PlaceAutocomplete,
  Location,
  MapsServiceStatus,
  LanguageCode
} from './maps-types';
import { GOOGLE_MAPS_API_KEY } from './maps-config';
import {
  calculateDistance,
  getDirections,
  getTimeZone,
  searchPlaces,
  geocodeAddress,
  getPlacesCountByType,
  getUserLocation,
  isWithinDistance,
  formatDistance,
  formatDuration,
  getStaticMapUrl,
  getGoogleMapsDirectionsUrl
} from './maps-operations';

// Validate API key
if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
  logger.warn('Google Maps API key not configured properly');
}

/**
 * Google Maps Enhanced Service
 * خدمة خرائط جوجل المحسّنة
 */
class GoogleMapsEnhancedService {
  private geocoder: google.maps.Geocoder | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private distanceMatrixService: google.maps.DistanceMatrixService | null = null;

  /**
   * Initialize Google Maps services
   * تهيئة خدمات خرائط جوجل
   */
  initialize(): void {
    if (typeof google !== 'undefined' && google.maps) {
      this.geocoder = new google.maps.Geocoder();
      this.directionsService = new google.maps.DirectionsService();
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
      
      // Places service needs a map element
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      this.placesService = new google.maps.places.PlacesService(map);

      serviceLogger.debug('Google Maps services initialized');
    }
  }

  /**
   * Get service initialization status
   * الحصول على حالة تهيئة الخدمة
   */
  getStatus(): MapsServiceStatus {
    return {
      initialized: !!(this.geocoder && this.directionsService && this.distanceMatrixService),
      geocoder: !!this.geocoder,
      places: !!this.placesService,
      directions: !!this.directionsService,
      distanceMatrix: !!this.distanceMatrixService
    };
  }

  // ==================== DISTANCE MATRIX ====================

  /**
   * Calculate distance and duration between two locations
   * حساب المسافة والمدة بين موقعين
   */
  async calculateDistance(
    origin: Location | string,
    destination: Location | string
  ): Promise<DistanceResult | null> {
    if (!this.distanceMatrixService) {
      this.initialize();
    }
    return calculateDistance(origin, destination, this.distanceMatrixService);
  }

  /**
   * Check if user is within distance of target location
   * التحقق مما إذا كان المستخدم ضمن مسافة الموقع المستهدف
   */
  async isWithinDistance(
    userLocation: Location,
    targetLocation: Location,
    maxDistanceKm: number
  ): Promise<boolean> {
    if (!this.distanceMatrixService) {
      this.initialize();
    }
    return isWithinDistance(userLocation, targetLocation, maxDistanceKm, this.distanceMatrixService);
  }

  // ==================== DIRECTIONS ====================

  /**
   * Get driving directions between two locations
   * الحصول على اتجاهات القيادة بين موقعين
   */
  async getDirections(
    origin: Location | string,
    destination: Location | string
  ): Promise<DirectionsResult | null> {
    if (!this.directionsService) {
      this.initialize();
    }
    return getDirections(origin, destination, this.directionsService);
  }

  /**
   * Get Google Maps directions URL
   * الحصول على رابط اتجاهات خرائط جوجل
   */
  getGoogleMapsDirectionsUrl(
    destination: Location,
    origin?: Location
  ): string {
    return getGoogleMapsDirectionsUrl(destination, origin);
  }

  // ==================== TIMEZONE ====================

  /**
   * Get time zone information for a location
   * الحصول على معلومات المنطقة الزمنية للموقع
   */
  async getTimeZone(lat: number, lng: number): Promise<TimeZoneResult | null> {
    return getTimeZone(lat, lng);
  }

  // ==================== PLACES ====================

  /**
   * Search for places using autocomplete
   * البحث عن الأماكن باستخدام الإكمال التلقائي
   */
  async searchPlaces(
    input: string,
    countryCode: string = 'bg'
  ): Promise<PlaceAutocomplete[]> {
    return searchPlaces(input, countryCode);
  }

  /**
   * Get count of places by type within radius
   * الحصول على عدد الأماكن حسب النوع في نطاق معين
   */
  async getPlacesCountByType(
    location: Location,
    type: 'car_dealer' | 'car_repair' | 'car_showroom',
    radius: number = 12000,
    maxPages: number = 1
  ): Promise<number> {
    if (!this.placesService) {
      this.initialize();
    }
    return getPlacesCountByType(location, type, this.placesService, radius, maxPages);
  }

  // ==================== GEOCODING ====================

  /**
   * Geocode an address to coordinates
   * تحويل العنوان إلى إحداثيات
   */
  async geocodeAddress(address: string): Promise<Location | null> {
    if (!this.geocoder) {
      this.initialize();
    }
    return geocodeAddress(address, this.geocoder);
  }

  // ==================== GEOLOCATION ====================

  /**
   * Get user's current location
   * الحصول على موقع المستخدم الحالي
   */
  async getUserLocation(): Promise<Location | null> {
    return getUserLocation();
  }

  // ==================== STATIC MAPS ====================

  /**
   * Get static map URL
   * الحصول على رابط الخريطة الثابتة
   */
  getStaticMapUrl(
    lat: number,
    lng: number,
    zoom: number = 13,
    width: number = 600,
    height: number = 400
  ): string {
    return getStaticMapUrl(lat, lng, zoom, width, height);
  }

  // ==================== FORMATTING ====================

  /**
   * Format distance to readable text
   * تنسيق المسافة إلى نص قابل للقراءة
   */
  formatDistance(meters: number, language: LanguageCode = 'bg'): string {
    return formatDistance(meters, language);
  }

  /**
   * Format duration to readable text
   * تنسيق المدة إلى نص قابل للقراءة
   */
  formatDuration(seconds: number, language: LanguageCode = 'bg'): string {
    return formatDuration(seconds, language);
  }
}

// ==================== SINGLETON INSTANCE ====================

const googleMapsEnhancedServiceInstance = new GoogleMapsEnhancedService();
export default googleMapsEnhancedServiceInstance;

// ==================== EXPORTS ====================

export type {
  DistanceResult,
  DirectionsResult,
  TimeZoneResult,
  PlaceAutocomplete,
  Location,
  MapsServiceStatus,
  LanguageCode
} from './maps-types';

