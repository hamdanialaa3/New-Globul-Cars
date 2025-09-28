"use strict";
// functions/src/ev-charging.ts
// EV Charging Network Integration for Bulgarian Car Marketplace
// Firebase Functions for Eldrive and Fines Charging integration
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEVNetworkStats = exports.getEVCompatibility = exports.getEVChargingRoute = exports.findEVChargingStations = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const params_1 = require("firebase-functions/params");
// Define secrets for API keys
const eldriveApiKey = (0, params_1.defineSecret)('ELDRIVE_API_KEY');
const finesApiKey = (0, params_1.defineSecret)('FINES_API_KEY');
/**
 * Find EV charging stations near a location
 * Integrates with Eldrive and Fines charging networks
 */
exports.findEVChargingStations = (0, https_1.onCall)({
    region: 'europe-west1',
    secrets: [eldriveApiKey, finesApiKey],
    cors: true
}, async (request) => {
    try {
        const { latitude, longitude, radius = 50, limit = 20 } = request.data;
        if (!latitude || !longitude) {
            throw new https_1.HttpsError('invalid-argument', 'Latitude and longitude are required');
        }
        firebase_functions_1.logger.info('Finding EV charging stations', { latitude, longitude, radius, limit });
        // In production, integrate with real APIs
        // For now, return mock data based on Bulgarian charging network
        const stations = await getMockChargingStations(latitude, longitude, radius, limit);
        return stations;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error finding EV charging stations:', error);
        throw new https_1.HttpsError('internal', 'Failed to find charging stations');
    }
});
/**
 * Get charging stations along a route
 */
exports.getEVChargingRoute = (0, https_1.onCall)({
    region: 'europe-west1',
    secrets: [eldriveApiKey, finesApiKey],
    cors: true
}, async (request) => {
    try {
        const { origin, destination, vehicleRange = 300 } = request.data;
        if (!origin || !destination) {
            throw new https_1.HttpsError('invalid-argument', 'Origin and destination are required');
        }
        firebase_functions_1.logger.info('Planning EV charging route', { origin, destination, vehicleRange });
        const route = await calculateChargingRoute(origin, destination, vehicleRange);
        return route;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error calculating EV charging route:', error);
        throw new https_1.HttpsError('internal', 'Failed to calculate charging route');
    }
});
/**
 * Get EV compatibility information
 */
exports.getEVCompatibility = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { make, model } = request.data;
        if (!make || !model) {
            throw new https_1.HttpsError('invalid-argument', 'Vehicle make and model are required');
        }
        firebase_functions_1.logger.info('Getting EV compatibility', { make, model });
        const compatibility = await getVehicleCompatibility(make, model);
        return compatibility;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting EV compatibility:', error);
        throw new https_1.HttpsError('internal', 'Failed to get EV compatibility');
    }
});
/**
 * Get Bulgarian EV charging network statistics
 */
exports.getEVNetworkStats = (0, https_1.onCall)({
    region: 'europe-west1',
    secrets: [eldriveApiKey, finesApiKey],
    cors: true
}, async (request) => {
    try {
        firebase_functions_1.logger.info('Getting EV network statistics');
        // In production, fetch real statistics from Eldrive/Fines APIs
        const stats = {
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
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting EV network stats:', error);
        throw new https_1.HttpsError('internal', 'Failed to get network statistics');
    }
});
/**
 * Mock implementation for Bulgarian charging stations
 * In production, replace with real Eldrive/Fines API calls
 */
async function getMockChargingStations(latitude, longitude, radius, limit) {
    const stations = [];
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
            const station = {
                id: `bg_station_${i + 1}`,
                name: `EV Station ${city.name} ${Math.floor(i / bulgarianCities.length) + 1}`,
                address: `ул. ${['Витоша', 'Граф Игнатиев', 'Пиротска', 'Цар Освободител', 'Славянска'][i % 5]} ${10 + i}`,
                city: city.name,
                latitude: stationLat,
                longitude: stationLng,
                provider: ['eldrive', 'fines', 'other'][i % 3],
                status: ['available', 'occupied', 'out_of_order'][Math.floor(Math.random() * 3)],
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
async function calculateChargingRoute(origin, destination, vehicleRange) {
    // Calculate total distance
    const totalDistance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    // Find stations along the route
    const midLat = (origin.lat + destination.lat) / 2;
    const midLng = (origin.lng + destination.lng) / 2;
    const routeStations = await getMockChargingStations(midLat, midLng, Math.max(totalDistance / 2, 50), 10);
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
    const route = {
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
async function getVehicleCompatibility(make, model) {
    // Mock EV database - in production, use real vehicle database
    const evDatabase = {
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
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * Calculate distance from point to line segment
 */
function distanceToLine(px, py, lineStart, lineEnd) {
    const x1 = lineStart.lng, y1 = lineStart.lat;
    const x2 = lineEnd.lng, y2 = lineEnd.lat;
    const x0 = py, y0 = px; // Note: lat/lng swapped for calculation
    const numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
    const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
    return numerator / denominator;
}
//# sourceMappingURL=ev-charging.js.map