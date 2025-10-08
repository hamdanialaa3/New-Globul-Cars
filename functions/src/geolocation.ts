// functions/src/geolocation.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Client } from '@googlemaps/google-maps-services-js';

// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const mapsClient = new Client({});

const GOOGLE_MAPS_API_KEY = functions.config().maps.key;

if (!GOOGLE_MAPS_API_KEY) {
    console.error("FATAL ERROR: Google Maps API key is not configured in Firebase Functions. Use 'firebase functions:config:set maps.key=\"YOUR_API_KEY\"'");
}

/**
 * Geocodes a car's address when it's created and updates the document with coordinates.
 */
export const geocodeAddressOnCarCreate = functions.region('europe-west1').firestore
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
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location; // { lat, lng }
        console.log(`Geocoding successful:`, location);

        // Update the car document with the new coordinates
        return snapshot.ref.update({
          location: new admin.firestore.GeoPoint(location.lat, location.lng)
        });
      } else {
        console.warn(`Geocoding failed for address "${address}". Status: ${response.data.status}`);
        return null;
      }
    } catch (error) {
      console.error(`Error during geocoding for car ${context.params.carId}:`, error);
      return null;
    }
  });
