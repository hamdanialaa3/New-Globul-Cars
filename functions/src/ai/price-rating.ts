/**
 * Cloud Function: calculatePriceRating
 *
 * Compares a car's listing price against market averages for same make/model/year
 * and returns a price rating: excellent | good | fair | high | unknown
 *
 * Called on-demand by the mobile app when viewing car details.
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface PriceRatingRequest {
  make: string;
  model: string;
  year: number;
  price: number;
  fuelType?: string;
  transmission?: string;
}

interface PriceRatingResponse {
  rating: 'excellent' | 'good' | 'fair' | 'high' | 'unknown';
  averagePrice: number;
  sampleSize: number;
  percentDiff: number;
}

// Initialize admin only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const calculatePriceRating = functions
  .region('europe-west1')
  .https.onCall(
    async (
      request: functions.https.CallableRequest<PriceRatingRequest>
    ): Promise<PriceRatingResponse> => {
      const data = request.data;

      if (!data.make || !data.model || !data.year || !data.price) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'make, model, year, and price are required.'
        );
      }

      const { make, model, year, price } = data;

      // Query active listings with same make/model within ±2 years
      let query = db
        .collection('cars_active')
        .where('make', '==', make)
        .where('model', '==', model)
        .where('year', '>=', year - 2)
        .where('year', '<=', year + 2);

      const snapshot = await query.get();

      if (snapshot.empty || snapshot.size < 3) {
        return {
          rating: 'unknown',
          averagePrice: 0,
          sampleSize: snapshot.size,
          percentDiff: 0,
        };
      }

      // Calculate average price from comparable listings
      let totalPrice = 0;
      let count = 0;

      snapshot.forEach(doc => {
        const d = doc.data();
        if (typeof d.price === 'number' && d.price > 0) {
          totalPrice += d.price;
          count++;
        }
      });

      if (count < 3) {
        return {
          rating: 'unknown',
          averagePrice: 0,
          sampleSize: count,
          percentDiff: 0,
        };
      }

      const averagePrice = Math.round(totalPrice / count);
      const percentDiff = ((price - averagePrice) / averagePrice) * 100;

      // Rating thresholds (calibrated for Bulgarian market)
      let rating: PriceRatingResponse['rating'];
      if (percentDiff <= -15) {
        rating = 'excellent'; // 15%+ below average
      } else if (percentDiff <= -5) {
        rating = 'good'; // 5-15% below average
      } else if (percentDiff <= 10) {
        rating = 'fair'; // within -5% to +10% of average
      } else {
        rating = 'high'; // 10%+ above average
      }

      return {
        rating,
        averagePrice,
        sampleSize: count,
        percentDiff: Math.round(percentDiff * 10) / 10,
      };
    }
  );
