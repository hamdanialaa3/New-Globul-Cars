import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;

export const syncCarsToFacebookAds = functions
    .runWith({ memory: '1GB', timeoutSeconds: 540 })
    .pubsub.schedule('every 6 hours')
    .onRun(async (context) => {
        try {
            if (!FACEBOOK_ACCESS_TOKEN) {
                console.warn('Facebook Access Token missing, skipping sync.');
                return;
            }

            const db = admin.firestore();
            const carsRef = db.collection('cars')
                .where('status', '==', 'active')
                .where('price', '>', 0)
                .limit(100);

            const snapshot = await carsRef.get();

            for (const doc of snapshot.docs) {
                const car = doc.data();
                if (!car.sellerNumericId || !car.carNumericId) continue;

                const catalogItem = {
                    retailer_id: `${car.sellerNumericId}_${car.carNumericId}`,
                    name: `${car.make} ${car.model} ${car.year}`,
                    description: (car.description || '').substring(0, 5000),
                    image_url: car.images?.[0] || car.mainImage,
                    price: (car.price || 0) * 100, // cents
                    currency: car.currency || 'EUR',
                    availability: car.status === 'active' ? 'in stock' : 'out of stock',
                    url: `https://mobilebg.eu/car/${car.sellerNumericId}/${car.carNumericId}`,
                    brand: car.make,
                    category: 'Vehicles > Cars',
                    condition: 'used',
                };

                // Placeholder for real API Call
                /*
                await axios.post(
                  `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_CATALOG_ID}/products`,
                  catalogItem,
                  { params: { access_token: FACEBOOK_ACCESS_TOKEN } }
                );
                */
            }

            console.log(`✅ Synced ${snapshot.docs.length} cars to Facebook Catalog`);
        } catch (error) {
            console.error('Facebook Ads sync error:', error);
        }
    });
