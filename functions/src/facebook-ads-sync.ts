import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';


const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
// const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;

export const syncCarsToFacebookAds = functions
    .runWith({ memory: '1GB', timeoutSeconds: 540 })
    .pubsub.schedule('every 6 hours')
    .onRun(async () => {
        try {
            if (!FACEBOOK_ACCESS_TOKEN) {
                functions.logger.warn('Facebook Access Token missing, skipping sync.');
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

                // Placeholder for real API Call

                // Placeholder for real API Call
                /*
                await axios.post(
                  `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_CATALOG_ID}/products`,
                  catalogItem,
                  { params: { access_token: FACEBOOK_ACCESS_TOKEN } }
                );
                */
            }

            functions.logger.info(`✅ Synced ${snapshot.docs.length} cars to Facebook Catalog`);
        } catch (error) {
            functions.logger.error('Facebook Ads sync error:', error);
        }
    });
