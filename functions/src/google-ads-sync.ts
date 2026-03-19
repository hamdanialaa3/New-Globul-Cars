import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Google Ads API: install `google-ads-api` when credentials are ready
// import { GoogleAdsApi } from 'google-ads-api';

export const syncCarsToGoogleAds = functions
    .runWith({ memory: '1GB', timeoutSeconds: 540 })
    .pubsub.schedule('every 6 hours')
    .onRun(async () => {
        try {
            const clientId = process.env.GOOGLEADS_CLIENT_ID;
            const clientSecret = process.env.GOOGLEADS_CLIENT_SECRET;
            const developerToken = process.env.GOOGLEADS_DEVELOPER_TOKEN;
            const customerId = process.env.GOOGLEADS_CUSTOMER_ID;
            const refreshToken = process.env.GOOGLEADS_REFRESH_TOKEN;

            if (!clientId || !developerToken) {
                functions.logger.warn('Google Ads credentials missing, skipping sync.');
                return;
            }

            const db = admin.firestore();
            const carsRef = db.collection('cars')
                .where('status', '==', 'active')
                .where('price', '>', 0)
                .limit(1000);

            const snapshot = await carsRef.get();
            if (snapshot.empty) return;

            const ads = snapshot.docs.map(doc => {
                const car = doc.data();
                if (!car.sellerNumericId || !car.carNumericId) return null;

                return {
                    headline1: `${car.make} ${car.model} ${car.year}`,
                    headline2: `${car.price.toLocaleString()} ${car.currency || 'EUR'}`,
                    headline3: (car.locationData?.cityName || 'Bulgaria'),
                    description: (car.description || '').substring(0, 80) || `${car.make} ${car.model} for sale`,
                    finalUrl: `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`,
                    imageUrl: car.images?.[0] || car.mainImage,
                };
            }).filter(Boolean);

            if (ads.length === 0) return;

            // Store prepared ads for Google Ads sync processing
            const batch = db.batch();
            for (const ad of ads) {
                const ref = db.collection('google_ads_queue').doc();
                batch.set(ref, {
                    ...ad,
                    status: 'pending',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            await batch.commit();
            functions.logger.info(`✅ Queued ${ads.length} car ads for Google Ads sync`, {
                customerId,
                hasCredentials: !!(clientId && clientSecret && refreshToken)
            });

        } catch (error) {
            functions.logger.error('Google Ads sync error:', error);
        }
    });
