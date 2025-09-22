// functions/src/ev-charging.ts
// EV Charging Network Integration for Bulgarian Car Marketplace
// Firebase Functions for Eldrive and Fines Charging integration

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';

// Define secrets for API keys
const eldriveApiKey = defineSecret('ELDRIVE_API_KEY');
const finesApiKey = defineSecret('FINES_API_KEY');

// Bulgarian EV Charging Network Statistics
interface NetworkStats {
  totalStations: number;
  availableStations: number;
  providers: { [key: string]: number };
  avgPricePerKwh: number;
  lastUpdated: Date;
}

// Charging Station Interface
interface ChargingStation {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  provider: 'eldrive' | 'fines' | 'other';
  status: 'available' | 'occupied' | 'out_of_order' | 'unknown';
  connectors: Array<{
    type: 'CCS' | 'CHAdeMO' | 'Type2' | 'Tesla';
    power: number;
    status: 'available' | 'occupied' | 'out_of_order';
    pricePerKwh?: number;
  }>;
  amenities: string[];
  lastUpdated: Date;
  distance?: number;
}

// EV Compatibility Interface
interface EVCompatibility {
  vehicleMake: string;
  vehicleModel: string;
  compatibleConnectors: string[];
  batteryCapacity: number;
  maxChargingSpeed: number;
  recommendedChargers: string[];
}

// Route Planning Interface
interface ChargingRoute {
  origin: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  stations: ChargingStation[];
  totalDistance: number;
  estimatedChargingTime: number;
  estimatedCost: number;
}

/**
 * Find EV charging stations near a location
 * Integrates with Eldrive and Fines charging networks
 */
export const findEVChargingStations = onCall(
  {
    region: 'europe-west1',
    secrets: [eldriveApiKey, finesApiKey],
    cors: true
  },
  async (request) => {
    try {
      const { latitude, longitude, radius = 50, limit = 20 } = request.data;

      if (!latitude || !longitude) {
        throw new HttpsError('invalid-argument', 'Latitude and longitude are required');
      }

      logger.info('Finding EV charging stations', { latitude, longitude, radius, limit });

      // In production, integrate with real APIs
      // For now, return mock data based on Bulgarian charging network
      const stations = await getMockChargingStations(latitude, longitude, radius, limit);

      return stations;
    } catch (error) {
      logger.error('Error finding EV charging stations:', error);
      throw new HttpsError('internal', 'Failed to find charging stations');
    }
  }
);

/**
 * Get charging stations along a route
 */
export const getEVChargingRoute = onCall(
  {
    region: 'europe-west1',
    secrets: [eldriveApiKey, finesApiKey],
    cors: true
  },
  async (request) => {
    try {
      const { origin, destination, vehicleRange = 300 } = request.data;

      if (!origin || !destination) {
        throw new HttpsError('invalid-argument', 'Origin and destination are required');
      }

      logger.info('Planning EV charging route', { origin, destination, vehicleRange });

      const route = await calculateChargingRoute(origin, destination, vehicleRange);

      return route;
    } catch (error) {
      logger.error('Error calculating EV charging route:', error);
      throw new HttpsError('internal', 'Failed to calculate charging route');
    }
  }
);

/**
 * Get EV compatibility information
 */
export const getEVCompatibility = onCall(
  {
    region: 'europe-west1',
    cors: true
  },
  async (request) => {
    try {
      const { make, model } = request.data;

      if (!make || !model) {
        throw new HttpsError('invalid-argument', 'Vehicle make and model are required');
      }

      logger.info('Getting EV compatibility', { make, model });

      const compatibility = await getVehicleCompatibility(make, model);

      return compatibility;
    } catch (error) {
      logger.error('Error getting EV compatibility:', error);
      throw new HttpsError('internal', 'Failed to get EV compatibility');
    }
  }
);

/**
 * Get Bulgarian EV charging network statistics
 */
export const getEVNetworkStats = onCall(
  {
    region: 'europe-west1',
    secrets: [eldriveApiKey, finesApiKey],
    cors: true
  },
  async (request) => {
    try {
      logger.info('Getting EV network statistics');

      // In production, fetch real statistics from Eldrive/Fines APIs
      const stats: NetworkStats = {
        totalStations: 1250,
        availableStations: 980,
        providers: {
          eldrive: 650,
          fines: 420,
          other: 180
        },
        avgPricePerKwh: 0.26,
        lastUpdated: new Date()
      };

      return stats;
    } catch (error) {
      logger.error('Error getting EV network stats:', error);
      throw new HttpsError('internal', 'Failed to get network statistics');
    }
  }
);

/**
 * Mock implementation for Bulgarian charging stations
 * In production, replace with real Eldrive/Fines API calls
 */
async function getMockChargingStations(
  latitude: number,
  longitude: number,
  radius: number,
  limit: number
): Promise<ChargingStation[]> {
  const stations: ChargingStation[] = [];

  // Bulgarian cities with charging infrastructure
  const bulgarianCities = [
    { name: 'София', lat: 42.6977, lng: 23.3219 },
    { name: 'Пловдив', lat: 42.1354, lng: 24.7453 },
    { name: 'Варна', lat: 43.2141, lng: 27.9147 },
    { name: 'Бургас', lat: 42.5048, lng: 27.4626 },
    { name: 'Русе', lat: 43.8356, lng: 25.9657 },
    { name: 'Стара Загора', lat: 42.4248, lng: 25.6257 },
    { name: 'Плевен', lat: 43.4170, lng: 24.6067 },
    { name: 'Добрич', lat: 43.5726, lng: 27.8273 }
  ];

  for (let i = 0; i < Math.min(limit, bulgarianCities.length * 3); i++) {
    const cityIndex = i % bulgarianCities.length;
    const city = bulgarianCities[cityIndex];

    // Add some variation around city center
    const variation = 0.01; // ~1km
    const stationLat = city.lat + (Math.random() - 0.5) * variation;
    const stationLng = city.lng + (Math.random() - 0.5) * variation;

    // Calculate distance from search location
    const distance = calculateDistance(latitude, longitude, stationLat, stationLng);

    if (distance <= radius) {
      const station: ChargingStation = {
        id: `bg_station_${i + 1}`,
        name: `EV Station ${city.name} ${Math.floor(i / bulgarianCities.length) + 1}`,
        address: `ул. ${['Витоша', 'Граф Игнатиев', 'Пиротска', 'Цар Освободител', 'Славянска'][i % 5]} ${10 + i}`,
        city: city.name,
        latitude: stationLat,
        longitude: stationLng,
        provider: ['eldrive', 'fines', 'other'][i % 3] as 'eldrive' | 'fines' | 'other',
        status: ['available', 'occupied', 'out_of_order'][Math.floor(Math.random() * 3)] as any,
        connectors: [
          {
            type: 'CCS',
            power: 150,
            status: Math.random() > 0.3 ? 'available' : 'occupied',
            pricePerKwh: 0.28 + Math.random() * 0.1
          },
          {
            type: 'Type2',
            power: 22,
            status: Math.random() > 0.4 ? 'available' : 'occupied',
            pricePerKwh: 0.25 + Math.random() * 0.08
          }
        ],
        amenities: ['parking', 'restroom', 'cafe', 'shop'].filter(() => Math.random() > 0.6),
        lastUpdated: new Date(Date.now() - Math.random() * 3600000), // Within last hour
        distance: Math.round(distance * 10) / 10
      };

      stations.push(station);
    }
  }

  // Sort by distance
  return stations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * Calculate charging route with optimal charging stops
 */
async function calculateChargingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  vehicleRange: number
): Promise<ChargingRoute> {
  // Calculate total distance
  const totalDistance = calculateDistance(
    origin.lat, origin.lng,
    destination.lat, destination.lng
  );

  // Find stations along the route
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;

  const routeStations = await getMockChargingStations(
    midLat, midLng, Math.max(totalDistance / 2, 50), 10
  );

  // Filter to available stations and sort by distance from route
  const availableStations = routeStations
    .filter(s => s.status === 'available')
    .sort((a, b) => {
      const distA = distanceToLine(a.latitude, a.longitude, origin, destination);
      const distB = distanceToLine(b.latitude, b.longitude, origin, destination);
      return distA - distB;
    })
    .slice(0, 5); // Top 5 stations

  // Estimate charging needs
  const chargingStops = Math.ceil(totalDistance / vehicleRange);
  const estimatedChargingTime = chargingStops * 30; // 30 minutes per stop
  const estimatedCost = Math.round(totalDistance * 0.05 * 100) / 100; // €0.05 per km

  const route: ChargingRoute = {
    origin: {
      lat: origin.lat,
      lng: origin.lng,
      address: 'Origin Location'
    },
    destination: {
      lat: destination.lat,
      lng: destination.lng,
      address: 'Destination Location'
    },
    stations: availableStations,
    totalDistance: Math.round(totalDistance * 10) / 10,
    estimatedChargingTime,
    estimatedCost
  };

  return route;
}

/**
 * Get EV compatibility data
 */
async function getVehicleCompatibility(make: string, model: string): Promise<EVCompatibility> {
  // Mock EV database - in production, use real vehicle database
  const evDatabase: { [key: string]: EVCompatibility } = {
    'Tesla Model 3': {
      vehicleMake: 'Tesla',
      vehicleModel: 'Model 3',
      compatibleConnectors: ['Tesla', 'CCS', 'Type2'],
      batteryCapacity: 75,
      maxChargingSpeed: 250,
      recommendedChargers: ['Tesla Supercharger', 'CCS 150kW']
    },
    'Tesla Model Y': {
      vehicleMake: 'Tesla',
      vehicleModel: 'Model Y',
      compatibleConnectors: ['Tesla', 'CCS', 'Type2'],
      batteryCapacity: 75,
      maxChargingSpeed: 250,
      recommendedChargers: ['Tesla Supercharger', 'CCS 150kW']
    },
    'Volkswagen ID.4': {
      vehicleMake: 'Volkswagen',
      vehicleModel: 'ID.4',
      compatibleConnectors: ['CCS', 'Type2'],
      batteryCapacity: 77,
      maxChargingSpeed: 125,
      recommendedChargers: ['CCS 125kW', 'Type2 22kW']
    },
    'BMW i3': {
      vehicleMake: 'BMW',
      vehicleModel: 'i3',
      compatibleConnectors: ['CCS', 'Type2'],
      batteryCapacity: 42,
      maxChargingSpeed: 50,
      recommendedChargers: ['Type2 22kW', 'CCS 50kW']
    }
  };

  const key = `${make} ${model}`;
  const compatibility = evDatabase[key];

  if (!compatibility) {
    // Return generic EV compatibility
    return {
      vehicleMake: make,
      vehicleModel: model,
      compatibleConnectors: ['CCS', 'Type2', 'CHAdeMO'],
      batteryCapacity: 60,
      maxChargingSpeed: 100,
      recommendedChargers: ['CCS 100kW', 'Type2 22kW']
    };
  }

  return compatibility;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate distance from point to line segment
 */
function distanceToLine(
  px: number, py: number,
  lineStart: { lat: number; lng: number },
  lineEnd: { lat: number; lng: number }
): number {
  const x1 = lineStart.lng, y1 = lineStart.lat;
  const x2 = lineEnd.lng, y2 = lineEnd.lat;
  const x0 = py, y0 = px; // Note: lat/lng swapped for calculation

  const numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

  return numerator / denominator;
}