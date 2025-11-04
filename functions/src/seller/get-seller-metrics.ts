/**
 * Firebase Cloud Functions - Seller Dashboard Metrics
 * Provides aggregated statistics for sellers
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface SellerMetrics {
  totalCars: number;
  activeCars: number;
  soldCars: number;
  draftCars: number;
  totalViews: number;
  totalInquiries: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
  mostViewedCar: {
    id: string;
    title: string;
    views: number;
  } | null;
  recentActivity: {
    newViews: number;
    newInquiries: number;
    newReviews: number;
  };
  lastUpdated: string;
}

/**
 * Callable function to get seller dashboard metrics
 * Requires seller role
 */
export const getSellerMetrics = functions.region('europe-west1').https.onCall(
  async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Check seller role using Custom Claims
    if (!context.auth.token.seller) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only sellers can access dashboard metrics'
      );
    }

    const sellerId = context.auth.uid;

    try {
      // 1. Get all cars for this seller
      const carsSnapshot = await admin.firestore()
        .collection('cars')
        .where('sellerId', '==', sellerId)
        .get();

      const cars = carsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() as any
      }));

      // 2. Calculate car statistics
      const totalCars = cars.length;
      const activeCars = cars.filter(car => car.status === 'active').length;
      const soldCars = cars.filter(car => car.status === 'sold').length;
      const draftCars = cars.filter(car => car.status === 'draft').length;

      // 3. Calculate views and inquiries
      const totalViews = cars.reduce((sum, car) => sum + (car.views || 0), 0);
      const totalInquiries = cars.reduce((sum, car) => sum + (car.inquiries || 0), 0);

      // 4. Get rating data from seller document
      const sellerDoc = await admin.firestore()
        .collection('sellers')
        .doc(sellerId)
        .get();

      const sellerData = sellerDoc.data() || {};
      const averageRating = sellerData.averageRating || 0;
      const totalReviews = sellerData.totalReviews || 0;

      // 5. Calculate conversion rate
      const conversionRate = totalCars > 0 ? (soldCars / totalCars) * 100 : 0;

      // 6. Find most viewed car
      const mostViewedCar = cars.reduce((max, car) => {
        return (car.views || 0) > (max.views || 0) ? car : max;
      }, { id: '', title: '', views: 0 });

      // 7. Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Count recent analytics events
      const eventsSnapshot = await admin.firestore()
        .collection('analytics_events')
        .where('targetUserId', '==', sellerId)
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .get();

      const newViews = eventsSnapshot.docs.filter(doc => 
        doc.data().type === 'profile_view' || doc.data().type === 'car_view'
      ).length;

      const newInquiries = eventsSnapshot.docs.filter(doc => 
        doc.data().type === 'inquiry'
      ).length;

      const newReviews = totalReviews; // Simplified for now

      // 8. Build response
      const metrics: SellerMetrics = {
        totalCars,
        activeCars,
        soldCars,
        draftCars,
        totalViews,
        totalInquiries,
        averageRating,
        totalReviews,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        mostViewedCar: mostViewedCar.id ? {
          id: mostViewedCar.id,
          title: `${mostViewedCar.make} ${mostViewedCar.model}`,
          views: mostViewedCar.views || 0
        } : null,
        recentActivity: {
          newViews,
          newInquiries,
          newReviews
        },
        lastUpdated: new Date().toISOString()
      };

      console.log(`Seller metrics calculated for ${sellerId}`);
      return metrics;

    } catch (error: any) {
      console.error(`Error getting seller metrics for ${sellerId}:`, error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get seller metrics',
        error.message
      );
    }
  }
);

