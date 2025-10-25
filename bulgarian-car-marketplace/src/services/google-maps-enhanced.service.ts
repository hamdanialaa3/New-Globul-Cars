// Enhanced Google Maps Services
// خدمات خرائط جوجل المحسّنة

/**
 * This service integrates all 7 Google Maps APIs:
 * 1. Maps JavaScript API - already used in GoogleMapSection
 * 2. Geocoding API - already used in geocoding-service
 * 3. Places API (New) - Autocomplete & Place Details
 * 4. Distance Matrix API - Calculate distances
 * 5. Directions API - Get directions
 * 6. Time Zone API - Get local time
 * 7. Maps Embed API - Static maps
 */

import { serviceLogger } from './logger-wrapper';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4';

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

export interface DirectionsResult {
  routes: any[];
  status: string;
}

export interface TimeZoneResult {
  timeZoneId: string;      // e.g. "Europe/Sofia"
  timeZoneName: string;    // e.g. "Eastern European Time"
  rawOffset: number;       // seconds from UTC
  dstOffset: number;       // daylight saving offset
  localTime: string;       // formatted local time
}

export interface PlaceAutocomplete {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

class GoogleMapsEnhancedService {
  private geocoder: google.maps.Geocoder | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private distanceMatrixService: google.maps.DistanceMatrixService | null = null;

  /**
   * Initialize Google Maps services
   */
  initialize() {
    if (typeof google !== 'undefined' && google.maps) {
      this.geocoder = new google.maps.Geocoder();
      this.directionsService = new google.maps.DirectionsService();
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
      
      // Places service needs a map element
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      this.placesService = new google.maps.places.PlacesService(map);
    }
  }

  /**
   * 1. Distance Matrix API - Calculate distance and duration
   */
  async calculateDistance(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string
  ): Promise<DistanceResult | null> {
    return new Promise((resolve) => {
      if (!this.distanceMatrixService) {
        this.initialize();
      }

      if (!this.distanceMatrixService) {
        serviceLogger.error('Distance Matrix Service not initialized', undefined, { origin, destination });
        resolve(null);
        return;
      }

      const request = {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      };

      this.distanceMatrixService.getDistanceMatrix(request, (response, status) => {
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
          serviceLogger.error('Distance Matrix API error', undefined, { status });
          resolve(null);
        }
      });
    });
  }

  /**
   * 2. Directions API - Get driving directions
   */
  async getDirections(
    origin: { lat: number; lng: number } | string,
    destination: { lat: number; lng: number } | string
  ): Promise<DirectionsResult | null> {
    return new Promise((resolve) => {
      if (!this.directionsService) {
        this.initialize();
      }

      if (!this.directionsService) {
        serviceLogger.error('Directions Service not initialized', undefined, { origin, destination });
        resolve(null);
        return;
      }

      const request = {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      this.directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          resolve({
            routes: result.routes,
            status,
          });
        } else {
          serviceLogger.error('Directions API error', undefined, { status });
          resolve(null);
        }
      });
    });
  }

  /**
   * 3. Time Zone API - Get local time for a location
   */
  async getTimeZone(lat: number, lng: number): Promise<TimeZoneResult | null> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${API_KEY}`;
      
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
          localTime: localTime.toLocaleTimeString('bg-BG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        };
      }

      return null;
    } catch (error) {
      serviceLogger.error('Time Zone API error', error as Error, { lat, lng });
      return null;
    }
  }

  /**
   * 4. Places Autocomplete API - Search for places
   */
  async searchPlaces(input: string, countryCode: string = 'bg'): Promise<PlaceAutocomplete[]> {
    return new Promise((resolve) => {
      if (!this.placesService) {
        this.initialize();
      }

      // Use AutocompleteService for predictions
      const service = new google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: countryCode },
          types: ['(cities)'],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions as PlaceAutocomplete[]);
          } else {
            serviceLogger.warn('Places Autocomplete returned no predictions or non-OK status', { status, input, countryCode });
            resolve([]);
          }
        }
      );
    });
  }

  /**
   * 5. Geocoding API - Convert address to coordinates
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!this.geocoder) {
        this.initialize();
      }

      if (!this.geocoder) {
        serviceLogger.warn('Geocoder not initialized', { address });
        resolve(null);
        return;
      }

      this.geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          serviceLogger.warn('Geocode failed or returned no results', { address, status });
          resolve(null);
        }
      });
    });
  }

  /**
   * 6. Maps Embed API - Get static map URL
   */
  getStaticMapUrl(
    lat: number,
    lng: number,
    zoom: number = 13,
    width: number = 600,
    height: number = 400
  ): string {
    return `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${lat},${lng}&zoom=${zoom}&maptype=roadmap`;
  }

  /**
   * Get directions URL for Google Maps
   */
  getGoogleMapsDirectionsUrl(
    destination: { lat: number; lng: number },
    origin?: { lat: number; lng: number }
  ): string {
    const destParam = `${destination.lat},${destination.lng}`;
    const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : '';
    return `https://www.google.com/maps/dir/?api=1&destination=${destParam}${originParam}`;
  }

  /**
   * Check if user is within distance of location
   */
  async isWithinDistance(
    userLocation: { lat: number; lng: number },
    targetLocation: { lat: number; lng: number },
    maxDistanceKm: number
  ): Promise<boolean> {
    const result = await this.calculateDistance(userLocation, targetLocation);
    if (result) {
      const distanceKm = result.distance.value / 1000;
      return distanceKm <= maxDistanceKm;
    }
    return false;
  }

  /**
   * Get user's current location
   */
  async getUserLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        serviceLogger.warn('Geolocation is not supported by the browser');
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
          serviceLogger.error('Error getting location', error as unknown as Error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Format distance to readable text
   */
  formatDistance(meters: number, language: 'bg' | 'en' = 'bg'): string {
    if (meters < 1000) {
      return language === 'bg' 
        ? `${Math.round(meters)} м`
        : `${Math.round(meters)} m`;
    }
    const km = meters / 1000;
    return language === 'bg'
      ? `${km.toFixed(1)} км`
      : `${km.toFixed(1)} km`;
  }

  /**
   * Format duration to readable text
   */
  formatDuration(seconds: number, language: 'bg' | 'en' = 'bg'): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return language === 'bg'
        ? `${hours} ч ${minutes} мин`
        : `${hours}h ${minutes}m`;
    }
    return language === 'bg'
      ? `${minutes} мин`
      : `${minutes} min`;
  }
}

const googleMapsEnhancedServiceInstance = new GoogleMapsEnhancedService();
export default googleMapsEnhancedServiceInstance;

