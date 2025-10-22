// src/services/ev-charging-service.ts
// EV Charging Network Integration for Bulgarian Car Marketplace
// Integrates with Eldrive and Fines Charging networks in Bulgaria

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase-config';

export interface ChargingStation {
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
    power: number; // kW
    status: 'available' | 'occupied' | 'out_of_order';
    pricePerKwh?: number; // EUR
  }>;
  amenities: string[];
  lastUpdated: Date;
  distance?: number; // km from search location
}

export interface ChargingRoute {
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
  estimatedChargingTime: number; // minutes
  estimatedCost: number; // EUR
}

export interface EVCompatibility {
  vehicleMake: string;
  vehicleModel: string;
  compatibleConnectors: string[];
  batteryCapacity: number; // kWh
  maxChargingSpeed: number; // kW
  recommendedChargers: string[];
}

class EVChargingService {
  private static instance: EVChargingService;

  static getInstance(): EVChargingService {
    if (!EVChargingService.instance) {
      EVChargingService.instance = new EVChargingService();
    }
    return EVChargingService.instance;
  }

  /**
   * Find nearby charging stations
   */
  async findNearbyStations(
    latitude: number,
    longitude: number,
    radius: number = 50, // km
    limit: number = 20
  ): Promise<ChargingStation[]> {
    try {
      const findStations = httpsCallable(functions, 'findEVChargingStations');

      const result = await findStations({
        latitude,
        longitude,
        radius,
        limit
      });

      return result.data as ChargingStation[];
    } catch (error: any) {
      console.error('Error finding charging stations:', error);
      throw new Error(`Failed to find charging stations: ${error.message}`);
    }
  }

  /**
   * Get charging stations along a route
   */
  async getStationsAlongRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    vehicleRange: number = 300 // km
  ): Promise<ChargingRoute> {
    try {
      const getRouteStations = httpsCallable(functions, 'getEVChargingRoute');

      const result = await getRouteStations({
        origin: { lat: originLat, lng: originLng },
        destination: { lat: destLat, lng: destLng },
        vehicleRange
      });

      return result.data as ChargingRoute;
    } catch (error: any) {
      console.error('Error getting route stations:', error);
      throw new Error(`Failed to get route stations: ${error.message}`);
    }
  }

  /**
   * Check EV compatibility with charging networks
   */
  async getEVCompatibility(make: string, model: string): Promise<EVCompatibility> {
    try {
      const getCompatibility = httpsCallable(functions, 'getEVCompatibility');

      const result = await getCompatibility({ make, model });
      return result.data as EVCompatibility;
    } catch (error: any) {
      console.error('Error getting EV compatibility:', error);
      throw new Error(`Failed to get EV compatibility: ${error.message}`);
    }
  }

  /**
   * Calculate charging time and cost
   */
  calculateChargingEstimate(
    currentBattery: number, // %
    targetBattery: number, // %
    batteryCapacity: number, // kWh
    chargerPower: number, // kW
    pricePerKwh: number = 0.25 // EUR
  ): {
    timeMinutes: number;
    energyNeeded: number; // kWh
    cost: number; // EUR
  } {
    const batteryNeeded = (targetBattery - currentBattery) / 100;
    const energyNeeded = batteryCapacity * batteryNeeded;

    // Account for charging efficiency (typically 85-95%)
    const actualEnergyNeeded = energyNeeded / 0.9;

    // Calculate time (considering that charging speed decreases as battery fills)
    const avgPower = chargerPower * 0.8; // 80% average efficiency
    const timeHours = actualEnergyNeeded / avgPower;
    const timeMinutes = Math.round(timeHours * 60);

    const cost = Math.round(actualEnergyNeeded * pricePerKwh * 100) / 100;

    return {
      timeMinutes,
      energyNeeded: Math.round(actualEnergyNeeded * 100) / 100,
      cost
    };
  }

  /**
   * Get station status color for UI
   */
  getStationStatusColor(status: string): string {
    switch (status) {
      case 'available': return '#10b981'; // green
      case 'occupied': return '#f59e0b'; // amber
      case 'out_of_order': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  }

  /**
   * Format station data for display
   */
  formatStationForDisplay(station: ChargingStation): {
    id: string;
    name: string;
    address: string;
    status: string;
    statusColor: string;
    distance: string;
    connectors: Array<{
      type: string;
      power: string;
      status: string;
      price: string;
    }>;
    amenities: string[];
  } {
    return {
      id: station.id,
      name: station.name,
      address: `${station.address}, ${station.city}`,
      status: station.status.replace('_', ' ').toUpperCase(),
      statusColor: this.getStationStatusColor(station.status),
      distance: station.distance ? `${station.distance.toFixed(1)} km` : 'Unknown',
      connectors: station.connectors.map(connector => ({
        type: connector.type,
        power: `${connector.power} kW`,
        status: connector.status.replace('_', ' '),
        price: connector.pricePerKwh ? `€${connector.pricePerKwh}/kWh` : 'Free'
      })),
      amenities: station.amenities
    };
  }

  /**
   * Get Bulgarian charging network statistics
   */
  async getNetworkStats(): Promise<{
    totalStations: number;
    availableStations: number;
    providers: { [key: string]: number };
    avgPricePerKwh: number;
  }> {
    try {
      const getStats = httpsCallable(functions, 'getEVNetworkStats');

      const result = await getStats();
      return result.data as any;
    } catch (error: any) {
      console.error('Error getting network stats:', error);
      throw new Error(`Failed to get network stats: ${error.message}`);
    }
  }
}

// Firebase Functions for EV Charging Integration
export const findEVChargingStations = async (data: {
  latitude: number;
  longitude: number;
  radius: number;
  limit: number;
}) => {
  // Mock implementation - in production, integrate with Eldrive/Fines APIs
  const { latitude, longitude, radius, limit } = data;

  // Generate mock stations around the location
  const mockStations: ChargingStation[] = [];

  for (let i = 0; i < Math.min(limit, 15); i++) {
    const angle = (i / 15) * 2 * Math.PI;
    const distance = 5 + Math.random() * (radius - 5);
    const stationLat = latitude + (distance / 111) * Math.cos(angle); // Rough km to degrees conversion
    const stationLng = longitude + (distance / 111) * Math.sin(angle);

    mockStations.push({
      id: `station_${i + 1}`,
      name: `EV Station ${i + 1}`,
      address: `ул. ${['Витоша', 'Граф Игнатиев', 'Пиротска', 'Цар Освободител'][i % 4]} ${10 + i}`,
      city: ['София', 'Пловдив', 'Варна', 'Бургас'][i % 4],
      latitude: stationLat,
      longitude: stationLng,
      provider: ['eldrive', 'fines'][i % 2] as 'eldrive' | 'fines',
      status: ['available', 'occupied', 'out_of_order'][Math.floor(Math.random() * 3)] as any,
      connectors: [
        {
          type: 'CCS',
          power: 150,
          status: 'available',
          pricePerKwh: 0.28
        },
        {
          type: 'Type2',
          power: 22,
          status: Math.random() > 0.5 ? 'available' : 'occupied',
          pricePerKwh: 0.25
        }
      ],
      amenities: ['parking', 'restroom', 'cafe'].filter(() => Math.random() > 0.5),
      lastUpdated: new Date(Date.now() - Math.random() * 3600000), // Within last hour
      distance: distance
    });
  }

  return mockStations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

export const getEVChargingRoute = async (data: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  vehicleRange: number;
}) => {
  // Mock route calculation
  const { origin, destination, vehicleRange } = data;

  // Calculate straight-line distance (simplified)
  const distance = Math.sqrt(
    Math.pow(destination.lat - origin.lat, 2) + Math.pow(destination.lng - origin.lng, 2)
  ) * 111; // Convert to km

  // Find stations along the route
  const routeStations = await findEVChargingStations({
    latitude: (origin.lat + destination.lat) / 2,
    longitude: (origin.lng + destination.lng) / 2,
    radius: Math.max(distance / 2, 50),
    limit: 10
  });

  // Filter to available stations only
  const availableStations = routeStations.filter(s => s.status === 'available');

  const route: ChargingRoute = {
    origin: {
      lat: origin.lat,
      lng: origin.lng,
      address: 'Origin'
    },
    destination: {
      lat: destination.lat,
      lng: destination.lng,
      address: 'Destination'
    },
    stations: availableStations.slice(0, 5), // Top 5 stations
    totalDistance: distance,
    estimatedChargingTime: Math.round((distance / vehicleRange) * 30), // 30 min charging assumption
    estimatedCost: Math.round(distance * 0.05 * 100) / 100 // €0.05 per km assumption
  };

  return route;
};

export const getEVCompatibility = async (data: { make: string; model: string }) => {
  // Mock EV compatibility data
  const { make, model } = data;

  const compatibility: EVCompatibility = {
    vehicleMake: make,
    vehicleModel: model,
    compatibleConnectors: ['CCS', 'Type2', 'CHAdeMO'],
    batteryCapacity: 75, // kWh
    maxChargingSpeed: 150, // kW
    recommendedChargers: ['CCS 150kW', 'Type2 22kW']
  };

  return compatibility;
};

export const getEVNetworkStats = async () => {
  // Mock network statistics
  return {
    totalStations: 1250,
    availableStations: 980,
    providers: {
      eldrive: 650,
      fines: 420,
      other: 180
    },
    avgPricePerKwh: 0.26
  };
};

export const evChargingService = EVChargingService.getInstance();