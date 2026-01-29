/**
 * GOOGLE MAPS TYPES
 * أنواع خدمات خرائط جوجل
 */

/**
 * Distance result from Distance Matrix API
 * نتيجة المسافة من Distance Matrix API
 */
export interface DistanceResult {
  distance: {
    text: string;  // e.g. "15.3 km"
    value: number; // in meters
  };
  duration: {
    text: string;  // e.g. "25 mins"
    value: number; // in seconds
  };
  status: string;
}

/**
 * Directions result from Directions API
 * نتيجة الاتجاهات من Directions API
 */
export interface DirectionsResult {
  routes: unknown[];
  status: string;
}

/**
 * Time zone result from Time Zone API
 * نتيجة المنطقة الزمنية من Time Zone API
 */
export interface TimeZoneResult {
  timeZoneId: string;      // e.g. "Europe/Sofia"
  timeZoneName: string;    // e.g. "Eastern European Time"
  rawOffset: number;       // seconds from UTC
  dstOffset: number;       // daylight saving offset
  localTime: string;       // formatted local time
}

/**
 * Place autocomplete suggestion
 * اقتراح الإكمال التلقائي للأماكن
 */
export interface PlaceAutocomplete {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

/**
 * Location coordinates
 * إحداثيات الموقع
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Google Maps services status
 * حالة خدمات خرائط جوجل
 */
export interface MapsServiceStatus {
  initialized: boolean;
  geocoder: boolean;
  places: boolean;
  directions: boolean;
  distanceMatrix: boolean;
}

/**
 * Language type for formatting
 * نوع اللغة للتنسيق
 */
export type LanguageCode = 'bg' | 'en';
