"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeAddressOnCarCreate = void 0;
// functions/src/geolocation.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
const mapsClient = new google_maps_services_js_1.Client({});
const GOOGLE_MAPS_API_KEY = functions.config().maps.key;
if (!GOOGLE_MAPS_API_KEY) {
    console.error("FATAL ERROR: Google Maps API key is not configured in Firebase Functions. Use 'firebase functions:config:set maps.key=\"YOUR_API_KEY\"'");
}
/**
 * Geocodes a car's address when it's created and updates the document with coordinates.
 */
exports.geocodeAddressOnCarCreate = functions.region('europe-west1').firestore
    .document('cars/{carId}')
    .onCreate(async (snapshot, context) => {
    const carData = snapshot.data();
    if (!carData || !carData.address || carData.location) {
        console.log('Car already has location or no address provided. Skipping geocoding.');
        return null;
    }
    const address = carData.address;
    console.log(`Geocoding address for new car ${context.params.carId}: ${address}`);
    try {
        const response = await mapsClient.geocode({
            params: {
                address: address,
                key: GOOGLE_MAPS_API_KEY,
                region: 'BG' // Bias results towards Bulgaria
            }
        });
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location; // { lat, lng }
            console.log(`Geocoding successful:`, location);
            // Update the car document with the new coordinates
            return snapshot.ref.update({
                location: new admin.firestore.GeoPoint(location.lat, location.lng)
            });
        }
        else {
            console.warn(`Geocoding failed for address "${address}". Status: ${response.data.status}`);
            return null;
        }
    }
    catch (error) {
        console.error(`Error during geocoding for car ${context.params.carId}:`, error);
        return null;
    }
});
//# sourceMappingURL=geolocation.js.map