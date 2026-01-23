# 🗺️ Maps & Location Services Documentation
## خدمات الخرائط والمواقع - توثيق شامل

> **Last Updated:** January 23, 2026  
> **Version:** 0.5.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Google Maps Integration](#google-maps)
3. [Geocoding & Reverse Geocoding](#geocoding)
4. [Distance Calculation](#distance)
5. [Bulgarian Location Handling](#bulgarian)
6. [Static Maps Optimization](#static-maps)

---

## 🎯 Overview

The Maps & Location Services system integrates **7 Google Maps APIs** to provide comprehensive location features including address search, distance calculation, driving directions, and localized Bulgarian city handling.

### Key Capabilities
- **Address Search**: Places autocomplete with Bulgarian focus
- **Distance Matrix**: Calculate travel time/distance between points
- **Geocoding**: Convert addresses to coordinates and vice versa
- **Static Maps**: Cost-efficient map images for listings
- **Directions**: Turn-by-turn route generation
- **User Location**: Browser geolocation with fallback

---

## 🌍 Google Maps Integration {#google-maps}

### Service Architecture
**Main Service:** `src/services/google-maps-enhanced.service.ts`
**Config:** `src/services/maps-config.ts`
**Operations:** `src/services/maps-operations.ts`
**Types:** `src/services/maps-types.ts`

### Integrated APIs
1. **Maps JavaScript API** - Interactive map display
2. **Geocoding API** - Address to coordinates
3. **Places API** - Autocomplete & place details
4. **Distance Matrix API** - Distance/duration calculation
5. **Directions API** - Route planning
6. **Time Zone API** - Local time determination
7. **Maps Embed API** - Static map images

### Initialization
```typescript
class GoogleMapsEnhancedService {
  initialize(): void {
    this.geocoder = new google.maps.Geocoder();
    this.directionsService = new google.maps.DirectionsService();
    this.distanceMatrixService = new google.maps.DistanceMatrixService();
    this.placesService = new google.maps.places.PlacesService(map);
  }
}
```

---

## 📍 Geocoding & Reverse Geocoding {#geocoding}

Convert between addresses and coordinates.

### Forward Geocoding
```typescript
await geocodeAddress("Sofia, Bulgaria");
// Returns: { lat: 42.6977, lng: 23.3219 }
```

### Places Autocomplete
**Country-restricted to Bulgaria (bg)**
```typescript
await searchPlaces("Софи", "bg");
// Returns array of PlaceAutocomplete suggestions
```

### Service: `src/services/geocoding-service.ts`

---

## 📏 Distance Calculation {#distance}

Calculate travel distance and time between two points.

### Distance Matrix
```typescript
const result = await calculateDistance(
  { lat: 42.6977, lng: 23.3219 },  // Sofia
  { lat: 42.1354, lng: 24.7453 }   // Plovdiv
);
// Returns: { distance: 142000, duration: 7200 } (meters, seconds)
```

### Within Distance Check
```typescript
const isNearby = await isWithinDistance(
  userLocation,
  carLocation,
  50  // km
);
```

### Formatting
```typescript
formatDistance(142000, 'bg');  // "142 км"
formatDuration(7200, 'bg');    // "2 часа"
```

---

## 🇧🇬 Bulgarian Location Handling {#bulgarian}

Specialized service for Bulgarian geography.

### Service: `src/services/bulgaria-locations.service.ts`

### Features
- **City Database**: All major Bulgarian cities pre-loaded
- **Region Mapping**: Cities mapped to oblasts (regions)
- **Cyrillic Support**: Native Bulgarian city names
- **Neighborhood Data**: Sub-city level for major metros

### City-Region Mapper
**Service:** `src/services/cityRegionMapper.ts`

Maps city names to their administrative regions:
- Sofia → Sofia-City
- Plovdiv → Plovdiv
- Varna → Varna

### Car Count by City
**Service:** `src/services/cityCarCountService.ts`

Counts available listings per city for landing pages.

---

## 🖼️ Static Maps Optimization {#static-maps}

Cost-efficient static map images for listings.

### Why Static Maps?
- **Cost Reduction**: 10x cheaper than dynamic maps
- **Performance**: Pre-rendered, no JavaScript needed
- **SEO**: Images can be indexed by search engines
- **Mobile**: Faster load on slow connections

### Usage
```typescript
const mapUrl = getStaticMapUrl(
  42.6977,  // lat
  23.3219,  // lng
  13,       // zoom
  600,      // width
  400       // height
);
// Returns: Static map image URL
```

### Integration Points
- Car listing detail pages
- Seller profile locations
- Event venue previews

---

## 🔧 Technical Implementation

### Location Type
```typescript
interface Location {
  lat: number;
  lng: number;
}
```

### Service Status Check
```typescript
const status = googleMapsService.getStatus();
// { initialized, geocoder, places, directions, distanceMatrix }
```

### Google Maps Directions URL
```typescript
getGoogleMapsDirectionsUrl(
  destination: { lat: 42.6977, lng: 23.3219 },
  origin?: Location  // Optional, uses user location if omitted
);
// Opens Google Maps app/web with route
```

---

## 🔗 Related Documentation

- [04_Vehicle_Viewing_and_Interaction.md](./04_Vehicle_Viewing_and_Interaction.md) - Map on car details
- [09_SEO_and_Multi_Landing_Strategy.md](./09_SEO_and_Multi_Landing_Strategy.md) - City landing pages
- [13_IoT_and_Car_Tracking.md](./13_IoT_and_Car_Tracking.md) - GPS visualization

---

**Last Updated:** January 23, 2026  
**Maintained By:** Geo & Infrastructure Team  
**Status:** ✅ Active Documentation
