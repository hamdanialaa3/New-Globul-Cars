"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCarsToGoogleAds = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// import { GoogleAdsApi, Customer } from 'google-ads-api';
/*
const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
});
*/
exports.syncCarsToGoogleAds = functions
    .runWith({ memory: '1GB', timeoutSeconds: 540 })
    .pubsub.schedule('every 6 hours')
    .onRun(async () => {
    try {
        if (!process.env.GOOGLE_ADS_CLIENT_ID) {
            functions.logger.warn('Google Ads credentials missing, skipping sync.');
            return;
        }
        const db = admin.firestore();
        const carsRef = db.collection('cars')
            .where('status', '==', 'active')
            .where('price', '>', 0)
            .limit(1000);
        const snapshot = await carsRef.get();
        if (snapshot.empty)
            return;
        /*
        const _customer: Customer = client.Customer({
            customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID || '',
            refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
        });
        */
        const ads = snapshot.docs.map(doc => {
            var _a, _b;
            const car = doc.data();
            // Skip legacy cars without numeric IDs
            if (!car.sellerNumericId || !car.carNumericId)
                return null;
            return {
                headline1: `${car.make} ${car.model} ${car.year}`,
                headline2: `${car.price.toLocaleString()} ${car.currency || 'EUR'}`,
                headline3: (((_a = car.locationData) === null || _a === void 0 ? void 0 : _a.cityName) || 'Bulgaria'),
                description: (car.description || '').substring(0, 80) || `${car.make} ${car.model} for sale`,
                finalUrl: `https://mobilebg.eu/car/${car.sellerNumericId}/${car.carNumericId}`,
                imageUrl: ((_b = car.images) === null || _b === void 0 ? void 0 : _b[0]) || car.mainImage,
            };
        }).filter(Boolean); // Remove nulls
        if (ads.length > 0) {
            // This is a simplified example. In reality, you'd batch these to specific ad groups.
            // API placeholder
            // await customer.adGroups.adGroupAds.create(ads);
            functions.logger.info(`✅ Would sync ${ads.length} cars to Google Ads`);
        }
    }
    catch (error) {
        functions.logger.error('Google Ads sync error:', error);
    }
});
//# sourceMappingURL=google-ads-sync.js.map