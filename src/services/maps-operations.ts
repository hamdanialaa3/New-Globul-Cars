/**
 * GOOGLE MAPS OPERATIONS
 * عمليات خدمات خرائط جوجل
 */

import { serviceLogger } from './logger-service';
import {
  DistanceResult,
  DirectionsResult,
  TimeZoneResult,
  PlaceAutocomplete,
  Location,
  LanguageCode
} from './maps-types';
import {
  GOOGLE_MAPS_API_KEY,
  PLACES_CONFIG,
  DISTANCE_MATRIX_CONFIG,
  GEOLOCATION_CONFIG,
  STATIC_MAP_CONFIG,
  API_ENDPOINTS,
  PAGINATION_DELAY_MS,
  FORMAT_TEMPLATES,
  TIME_LOCALE,
  ERROR_MESSAGES
} from './maps-config';

/**
 * Calculate distance and duration between two locations
 * حساب المسافة والمدة بين موقعين
 */
export async function calculateDistance(
  origin: Location | string,
  destination: Location | string,
  distanceMatrixService: google.maps.DistanceMatrixService | null
): Promise<DistanceResult | null> {
  return new Promise((resolve) => {
    if (!distanceMatrixService) {
      serviceLogger.error(ERROR_MESSAGES.SERVICE_NOT_INITIALIZED, undefined, { origin, destination });
      resolve(null);
      return;
    }

    const request = {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    };

    distanceMatrixService.getDistanceMatrix(request, (response, status) => {
      if (status === 'OK' && response) {
        const result = response.rows[0].elements[0];
        if (result.status === 'OK') {
          resolve({
            distance: result.distance,
            duration: result.duration,
            status: result.status,
          });
        } else {
          resolve(null);
        }
      } else {
        serviceLogger.error(ERROR_MESSAGES.API_ERROR, undefined, { status });
        resolve(null);
      }
    });
  });
}

/**
 * Get driving directions between two locations
 * الحصول على اتجاهات القيادة بين موقعين
 */
export async function getDirections(
  origin: Location | string,
  destination: Location | string,
  directionsService: google.maps.DirectionsService | null
): Promise<DirectionsResult | null> {
  return new Promise((resolve) => {
    if (!directionsService) {
      serviceLogger.error(ERROR_MESSAGES.SERVICE_NOT_INITIALIZED, undefined, { origin, destination });
      resolve(null);
      return;
    }

    const request = {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        resolve({
          routes: result.routes,
          status,
        });
      } else {
        serviceLogger.error(ERROR_MESSAGES.API_ERROR, undefined, { status });
        resolve(null);
      }
    });
  });
}

/**
 * Get time zone information for a location
 * الحصول على معلومات المنطقة الزمنية للموقع
 */
export async function getTimeZone(lat: number, lng: number): Promise<TimeZoneResult | null> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const url = `${API_ENDPOINTS.TIME_ZONE}?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      // Calculate local time
      const utcTime = new Date();
      const localTime = new Date(utcTime.getTime() + (data.rawOffset + data.dstOffset) * 1000);
      
      return {
        timeZoneId: data.timeZoneId,
        timeZoneName: data.timeZoneName,
        rawOffset: data.rawOffset,
        dstOffset: data.dstOffset,
        localTime: localTime.toLocaleTimeString(TIME_LOCALE.BG, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };
    }

    return null;
  } catch (error) {
    serviceLogger.error(ERROR_MESSAGES.API_ERROR, error as Error, { lat, lng });
    return null;
  }
}

/**
 * Search for places using autocomplete
 * البحث عن الأماكن باستخدام الإكمال التلقائي
 */
export async function searchPlaces(
  input: string,
  countryCode: string = PLACES_CONFIG.DEFAULT_COUNTRY
): Promise<PlaceAutocomplete[]> {
  return new Promise((resolve) => {
    const service = new google.maps.places.AutocompleteService();
    
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: countryCode },
        types: PLACES_CONFIG.PLACE_TYPES,
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions as PlaceAutocomplete[]);
        } else {
          serviceLogger.warn('Places Autocomplete returned no predictions', { status, input, countryCode });
          resolve([]);
        }
      }
    );
  });
}

/**
 * Geocode an address to coordinates
 * تحويل العنوان إلى إحداثيات
 */
export async function geocodeAddress(
  address: string,
  geocoder: google.maps.Geocoder | null
): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!geocoder) {
      serviceLogger.warn(ERROR_MESSAGES.GEOCODER_NOT_INITIALIZED, { address });
      resolve(null);
      return;
    }

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        serviceLogger.warn(ERROR_MESSAGES.API_ERROR, { address, status });
        resolve(null);
      }
    });
  });
}

/**
 * Get count of places by type within radius
 * الحصول على عدد الأماكن حسب النوع في نطاق معين
 */
export async function getPlacesCountByType(
  location: Location,
  type: 'car_dealer' | 'car_repair' | 'car_showroom',
  placesService: google.maps.places.PlacesService | null,
  radius: number = PLACES_CONFIG.SEARCH_RADIUS,
  maxPages: number = PLACES_CONFIG.MAX_PAGES
): Promise<number> {
  return new Promise((resolve) => {
    if (!placesService) {
      serviceLogger.error(ERROR_MESSAGES.SERVICE_NOT_INITIALIZED, undefined, { location, type });
      resolve(0);
      return;
    }

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      type,
    };

    let total = 0;
    let pagesFetched = 0;

    const fetchNext = (pageToken?: string) => {
      if (pageToken) request.pageToken = pageToken;
      
      placesService!.nearbySearch(request, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          total += results.length;
          pagesFetched += 1;

          if (pagination && pagination.hasNextPage && pagesFetched < maxPages) {
            setTimeout(() => fetchNext(pagination.nextPage()), PAGINATION_DELAY_MS);
          } else {
            resolve(total);
          }
        } else {
          resolve(total);
        }
      });
    };

    fetchNext();
  });
}

/**
 * Get user's current location
 * الحصول على موقع المستخدم الحالي
 */
export async function getUserLocation(): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      serviceLogger.warn(ERROR_MESSAGES.GEOLOCATION_NOT_SUPPORTED);
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        serviceLogger.error(ERROR_MESSAGES.API_ERROR, error as unknown as Error);
        resolve(null);
      },
      {
        enableHighAccuracy: GEOLOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
        timeout: GEOLOCATION_CONFIG.TIMEOUT_MS,
        maximumAge: GEOLOCATION_CONFIG.MAXIMUM_AGE_MS,
      }
    );
  });
}

/**
 * Check if user is within distance of target location
 * التحقق مما إذا كان المستخدم ضمن مسافة الموقع المستهدف
 */
export async function isWithinDistance(
  userLocation: Location,
  targetLocation: Location,
  maxDistanceKm: number,
  distanceMatrixService: google.maps.DistanceMatrixService | null
): Promise<boolean> {
  const result = await calculateDistance(userLocation, targetLocation, distanceMatrixService);
  if (result) {
    const distanceKm = result.distance.value / 1000;
    return distanceKm <= maxDistanceKm;
  }
  return false;
}

/**
 * Format distance to readable text
 * تنسيق المسافة إلى نص قابل للقراءة
 */
export function formatDistance(meters: number, language: LanguageCode = 'bg'): string {
  if (meters < 1000) {
    return language === 'bg' 
      ? FORMAT_TEMPLATES.DISTANCE.BG_METERS(meters)
      : FORMAT_TEMPLATES.DISTANCE.EN_METERS(meters);
  }
  const km = meters / 1000;
  return language === 'bg'
    ? FORMAT_TEMPLATES.DISTANCE.BG_KM(km)
    : FORMAT_TEMPLATES.DISTANCE.EN_KM(km);
}

/**
 * Format duration to readable text
 * تنسيق المدة إلى نص قابل للقراءة
 */
export function formatDuration(seconds: number, language: LanguageCode = 'bg'): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return language === 'bg'
      ? FORMAT_TEMPLATES.DURATION.BG_FULL(hours, minutes)
      : FORMAT_TEMPLATES.DURATION.EN_FULL(hours, minutes);
  }

  return language === 'bg'
    ? FORMAT_TEMPLATES.DURATION.BG_MINUTES(minutes)
    : FORMAT_TEMPLATES.DURATION.EN_MINUTES(minutes);
}

/**
 * Get static map URL
 * الحصول على رابط الخريطة الثابتة
 */
export function getStaticMapUrl(
  lat: number,
  lng: number,
  zoom: number = STATIC_MAP_CONFIG.DEFAULT_ZOOM,
  width: number = STATIC_MAP_CONFIG.DEFAULT_WIDTH,
  height: number = STATIC_MAP_CONFIG.DEFAULT_HEIGHT
): string {
  return `${API_ENDPOINTS.MAPS_EMBED}?key=${GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=${zoom}&maptype=${STATIC_MAP_CONFIG.MAP_TYPE}`;
}

/**
 * Get Google Maps directions URL
 * الحصول على رابط اتجاهات خرائط جوجل
 */
export function getGoogleMapsDirectionsUrl(
  destination: Location,
  origin?: Location
): string {
  const destParam = `${destination.lat},${destination.lng}`;
  const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : '';
  return `${API_ENDPOINTS.DIRECTIONS}?api=1&destination=${destParam}${originParam}`;
}
