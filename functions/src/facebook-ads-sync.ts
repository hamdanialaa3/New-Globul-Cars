import * as functions from 'firebase-functions/v1';
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
      const carsRef = db
        .collection('cars')
        .where('status', '==', 'active')
        .where('price', '>', 0)
        .limit(100);

      const snapshot = await carsRef.get();

      for (const doc of snapshot.docs) {
        const car = doc.data();
        if (!car.sellerNumericId || !car.carNumericId) continue;

        const catalogId = process.env.FACEBOOK_CATALOG_ID;
        if (!catalogId) {
          functions.logger.warn(
            'Facebook Catalog ID missing, skipping item sync',
            { carId: doc.id }
          );
          continue;
        }

        const title =
          `${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim();
        const productPayload = {
          retailer_id: doc.id,
          name: title || `Car ${doc.id}`,
          description:
            car.description || `${car.make || ''} ${car.model || ''}`.trim(),
          availability: 'in stock',
          condition: 'used',
          price: `${Number(car.price || 0).toFixed(2)} BGN`,
          currency: 'BGN',
          url: `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`,
          image_url:
            Array.isArray(car.images) && car.images.length > 0
              ? car.images[0]
              : undefined,
          brand: car.make || 'Unknown',
        };

        const body = new URLSearchParams();
        Object.entries(productPayload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            body.append(key, String(value));
          }
        });
        body.append('access_token', FACEBOOK_ACCESS_TOKEN);

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${catalogId}/products`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();
          functions.logger.warn('Failed syncing car to Facebook catalog', {
            carId: doc.id,
            status: response.status,
            errorBody,
          });
        }
      }

      functions.logger.info(
        `✅ Synced ${snapshot.docs.length} cars to Facebook Catalog`
      );
    } catch (error) {
      functions.logger.error('Facebook Ads sync error:', error);
    }
  });
