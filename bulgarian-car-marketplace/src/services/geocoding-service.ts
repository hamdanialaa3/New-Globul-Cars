// Geocoding Service for Bulgarian Car Marketplace
// Convert addresses to coordinates using Google Maps Geocoding API

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export class GeocodingService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Convert address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn('Google Maps API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${this.apiKey}&language=bg`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        // Extract address components
        const addressComponents = result.address_components;
        const city = this.getAddressComponent(addressComponents, 'locality');
        const region = this.getAddressComponent(addressComponents, 'administrative_area_level_1');
        const postalCode = this.getAddressComponent(addressComponents, 'postal_code');
        const country = this.getAddressComponent(addressComponents, 'country');

        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          city: city || undefined,
          region: region || undefined,
          postalCode: postalCode || undefined,
          country: country || 'България'
        };
      }

      console.warn('Geocoding failed:', data.status);
      return null;
    } catch (error) {
      console.error('[SERVICE] Geocoding error:', error);
      return null;
    }
  }

  /**
   * Convert coordinates to address (Reverse Geocoding)
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn('Google Maps API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}&language=bg`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        return {
          formattedAddress: result.formatted_address,
          city: this.getAddressComponent(addressComponents, 'locality'),
          region: this.getAddressComponent(addressComponents, 'administrative_area_level_1'),
          postalCode: this.getAddressComponent(addressComponents, 'postal_code'),
          country: this.getAddressComponent(addressComponents, 'country') || 'България'
        };
      }

      console.warn('Reverse geocoding failed:', data.status);
      return null;
    } catch (error) {
      console.error('[SERVICE] Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * Returns distance in kilometers
   */
  calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers

    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLon = this.toRadians(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Error getting location:', error.message);
          resolve(null);
        }
      );
    });
  }

  /**
   * Check if coordinates are in Bulgaria
   */
  isInBulgaria(lat: number, lng: number): boolean {
    // Rough bounds of Bulgaria
    const bounds = {
      north: 44.23,
      south: 41.23,
      east: 28.61,
      west: 22.36
    };

    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    );
  }

  /**
   * Get major Bulgarian cities coordinates
   */
  getBulgarianCities(): { [key: string]: { lat: number; lng: number } } {
    return {
      'София': { lat: 42.6977, lng: 23.3219 },
      'Пловдив': { lat: 42.1354, lng: 24.7453 },
      'Варна': { lat: 43.2141, lng: 27.9147 },
      'Бургас': { lat: 42.5048, lng: 27.4626 },
      'Русе': { lat: 43.8564, lng: 25.9656 },
      'Стара Загора': { lat: 42.4258, lng: 25.6342 },
      'Плевен': { lat: 43.4170, lng: 24.6167 },
      'Сливен': { lat: 42.6858, lng: 26.3228 },
      'Добрич': { lat: 43.5725, lng: 27.8278 },
      'Шумен': { lat: 43.2706, lng: 26.9281 }
    };
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} м`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)} км`;
    } else {
      return `${Math.round(distanceKm)} км`;
    }
  }

  // Helper methods
  private getAddressComponent(components: any[], type: string): string | undefined {
    const component = components.find((c) => c.types.includes(type));
    return component ? component.long_name : undefined;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();
















































