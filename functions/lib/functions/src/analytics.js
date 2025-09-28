"use strict";
// functions/src/analytics.ts
// Analytics Cloud Functions for Bulgarian Car Marketplace B2B Portal
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCarValuation = exports.getSubscriptionStatus = exports.getRegionalPriceVariations = exports.getSalesPeakHours = exports.getDealerPerformance = exports.getMarketTrends = exports.getAveragePriceByModel = void 0;
const https_1 = require("firebase-functions/v2/https");
const bigquery_1 = require("@google-cloud/bigquery");
const firestore_1 = require("firebase-admin/firestore");
const firebase_functions_1 = require("firebase-functions");
const subscriptions_1 = require("./subscriptions");
const bigquery = new bigquery_1.BigQuery();
const db = (0, firestore_1.getFirestore)();
// Check if user has active B2B subscription
async function checkB2BSubscription(userId) {
    try {
        const subscriptionDoc = await db.collection('b2bSubscriptions').doc(userId).get();
        if (!subscriptionDoc.exists) {
            return false;
        }
        const subscription = subscriptionDoc.data();
        // Check if subscription is active and not expired
        const now = new Date();
        const expiresAt = subscription.expiresAt.toDate();
        return subscription.status === 'active' && expiresAt > now;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error checking B2B subscription:', error);
        return false;
    }
}
// Get average price by model and city
exports.getAveragePriceByModel = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d;
    // Check authentication
    if (!request.auth) {
        throw new Error('Authentication required');
    }
    // Check B2B subscription
    const hasSubscription = await checkB2BSubscription(request.auth.uid);
    if (!hasSubscription) {
        throw new Error('Active B2B subscription required');
    }
    const { model, city } = request.data;
    try {
        let query = `
      SELECT
        AVG(price) as averagePrice,
        COUNT(*) as sampleSize,
        MIN(price) as minPrice,
        MAX(price) as maxPrice
      FROM \`globul-cars.globul_cars_analytics.cars\`
      WHERE price > 0 AND model = @model
    `;
        const params = { model };
        if (city) {
            query += ' AND location = @city';
            params.city = city;
        }
        const options = {
            query: query,
            params: params,
        };
        const [rows] = await bigquery.query(options);
        return {
            averagePrice: ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.averagePrice) || 0,
            sampleSize: ((_b = rows[0]) === null || _b === void 0 ? void 0 : _b.sampleSize) || 0,
            minPrice: ((_c = rows[0]) === null || _c === void 0 ? void 0 : _c.minPrice) || 0,
            maxPrice: ((_d = rows[0]) === null || _d === void 0 ? void 0 : _d.maxPrice) || 0,
            currency: 'EUR'
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting average price:', error);
        throw new Error('Failed to retrieve price analytics');
    }
});
// Get market trends - most searched models
exports.getMarketTrends = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new Error('Authentication required');
    }
    const hasSubscription = await checkB2BSubscription(request.auth.uid);
    if (!hasSubscription) {
        throw new Error('Active B2B subscription required');
    }
    const { period = '30' } = request.data; // days
    try {
        const query = `
      SELECT
        make,
        model,
        COUNT(*) as searchCount,
        AVG(price) as averagePrice
      FROM \`globul-cars.globul_cars_analytics.cars\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @period DAY)
      GROUP BY make, model
      ORDER BY searchCount DESC
      LIMIT 20
    `;
        const options = {
            query: query,
            params: { period: parseInt(period) },
        };
        const [rows] = await bigquery.query(options);
        return rows.map(row => ({
            make: row.make,
            model: row.model,
            searchCount: row.searchCount,
            averagePrice: row.averagePrice,
            currency: 'EUR'
        }));
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting market trends:', error);
        throw new Error('Failed to retrieve market trends');
    }
});
// Get dealer performance analytics
exports.getDealerPerformance = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new Error('Authentication required');
    }
    const hasSubscription = await checkB2BSubscription(request.auth.uid);
    if (!hasSubscription) {
        throw new Error('Active B2B subscription required');
    }
    const { dealerId, period = '90' } = request.data;
    // Only allow dealers to see their own performance or enterprise users to see all
    const subscriptionDoc = await db.collection('b2bSubscriptions').doc(request.auth.uid).get();
    const subscription = subscriptionDoc.data();
    if (subscription.tier !== 'enterprise' && dealerId !== request.auth.uid) {
        throw new Error('Access denied: Can only view own performance');
    }
    try {
        const query = `
      SELECT
        COUNT(*) as totalListings,
        AVG(price) as averagePrice,
        AVG(views) as averageViews,
        AVG(favorites) as averageFavorites,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as soldCount
      FROM \`globul-cars.globul_cars_analytics.cars\`
      WHERE sellerId = @dealerId
      AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @period DAY)
    `;
        const options = {
            query: query,
            params: {
                dealerId: dealerId || request.auth.uid,
                period: parseInt(period)
            },
        };
        const [rows] = await bigquery.query(options);
        const performance = rows[0];
        return {
            totalListings: performance.totalListings || 0,
            averagePrice: performance.averagePrice || 0,
            averageViews: performance.averageViews || 0,
            averageFavorites: performance.averageFavorites || 0,
            soldCount: performance.soldCount || 0,
            sellThroughRate: performance.totalListings > 0
                ? (performance.soldCount / performance.totalListings) * 100
                : 0,
            currency: 'EUR',
            period: `${period} days`
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting dealer performance:', error);
        throw new Error('Failed to retrieve dealer performance');
    }
});
// Get sales peak hours
exports.getSalesPeakHours = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new Error('Authentication required');
    }
    const hasSubscription = await checkB2BSubscription(request.auth.uid);
    if (!hasSubscription) {
        throw new Error('Active B2B subscription required');
    }
    const { period = '90' } = request.data;
    try {
        const query = `
      SELECT
        EXTRACT(HOUR FROM timestamp) as hour,
        COUNT(*) as salesCount,
        AVG(price) as averagePrice
      FROM \`globul-cars.globul_cars_analytics.cars\`
      WHERE status = 'sold'
      AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @period DAY)
      GROUP BY hour
      ORDER BY salesCount DESC
    `;
        const options = {
            query: query,
            params: { period: parseInt(period) },
        };
        const [rows] = await bigquery.query(options);
        return rows.map(row => ({
            hour: row.hour,
            salesCount: row.salesCount,
            averagePrice: row.averagePrice,
            currency: 'EUR'
        }));
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting sales peak hours:', error);
        throw new Error('Failed to retrieve sales analytics');
    }
});
// Get regional price variations
exports.getRegionalPriceVariations = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new Error('Authentication required');
    }
    const hasSubscription = await checkB2BSubscription(request.auth.uid);
    if (!hasSubscription) {
        throw new Error('Active B2B subscription required');
    }
    const { model } = request.data;
    try {
        let query = `
      SELECT
        location as city,
        AVG(price) as averagePrice,
        COUNT(*) as sampleSize,
        MIN(price) as minPrice,
        MAX(price) as maxPrice
      FROM \`globul-cars.globul_cars_analytics.cars\`
      WHERE price > 0
    `;
        const params = {};
        if (model) {
            query += ' AND model = @model';
            params.model = model;
        }
        query += ' GROUP BY location ORDER BY averagePrice DESC';
        const options = {
            query: query,
            params: params,
        };
        const [rows] = await bigquery.query(options);
        return rows.map(row => ({
            city: row.city,
            averagePrice: row.averagePrice,
            sampleSize: row.sampleSize,
            minPrice: row.minPrice,
            maxPrice: row.maxPrice,
            currency: 'EUR'
        }));
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting regional variations:', error);
        throw new Error('Failed to retrieve regional analytics');
    }
});
// Get subscription status (add explicit CORS to avoid preflight failures when called from localhost or custom domains)
exports.getSubscriptionStatus = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new Error('Authentication required');
    }
    try {
        const subscriptionDoc = await db.collection('b2bSubscriptions').doc(request.auth.uid).get();
        if (!subscriptionDoc.exists) {
            return {
                hasSubscription: false,
                tier: null,
                status: null,
                expiresAt: null
            };
        }
        const subscription = subscriptionDoc.data();
        return {
            hasSubscription: true,
            tier: subscription.tier,
            status: subscription.status,
            expiresAt: subscription.expiresAt.toDate(),
            isActive: subscription.status === 'active' && subscription.expiresAt.toDate() > new Date()
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting subscription status:', error);
        throw new Error('Failed to retrieve subscription status');
    }
});
// Simple car valuation function (fallback when AI model is not available)
function simpleCarValuation(carData) {
    // Base price calculation (simplified Bulgarian market model)
    let basePrice = 15000; // Base price in EUR
    // Year factor (newer = more expensive)
    const yearFactor = (carData.year - 2010) * 500;
    // Mileage factor (lower mileage = more expensive)
    const mileageFactor = Math.max(0, (200000 - carData.mileage) / 10000) * 200;
    // Make factor
    const makeFactors = {
        'BMW': 1.5, 'Mercedes': 1.4, 'Audi': 1.3, 'Volkswagen': 1.0,
        'Toyota': 0.9, 'Honda': 0.9, 'Ford': 0.8, 'Opel': 0.7,
        'Renault': 0.6, 'Peugeot': 0.6
    };
    const makeFactor = makeFactors[carData.make] || 1.0;
    const makePriceAdjustment = makeFactor * 5000;
    // Fuel type factor
    const fuelFactors = {
        'Gasoline': 1.0, 'Diesel': 1.1, 'Hybrid': 1.3, 'Electric': 1.5
    };
    const fuelFactor = fuelFactors[carData.fuelType] || 1.0;
    const fuelPriceAdjustment = fuelFactor * 1000;
    // Transmission factor
    const transmissionFactor = carData.transmission === 'Automatic' ? 2000 : 0;
    // Condition factor
    const conditionFactors = {
        'Excellent': 1.2, 'Good': 1.0, 'Fair': 0.8, 'Poor': 0.6
    };
    const conditionFactor = conditionFactors[carData.condition] || 1.0;
    // Location factor (Sofia is most expensive)
    const locationFactors = {
        'Sofia': 1.2, 'Plovdiv': 1.0, 'Varna': 1.1, 'Burgas': 1.1,
        'Ruse': 0.9, 'Stara Zagora': 0.9, 'Pleven': 0.8, 'Sliven': 0.8
    };
    const locationFactor = locationFactors[carData.location] || 1.0;
    // Calculate final price
    const predictedPrice = Math.max(1000, Math.round((basePrice + yearFactor + mileageFactor + makePriceAdjustment +
        fuelPriceAdjustment + transmissionFactor) * conditionFactor * locationFactor));
    return {
        predictedPrice,
        currency: 'EUR',
        confidence: 0.75, // Lower confidence for simple model
        market: 'Bulgaria',
        factors: {
            make: carData.make,
            model: carData.model,
            year: carData.year,
            mileage: carData.mileage,
            location: carData.location
        }
    };
}
// AI-powered car valuation function
exports.getCarValuation = (0, https_1.onCall)(async (request) => {
    // Check authentication
    if (!request.auth) {
        throw new Error('Authentication required for car valuation');
    }
    // Check B2B subscription (valuation requires premium or enterprise)
    const hasSubscription = await checkB2BSubscription(request.auth.uid);
    if (!hasSubscription) {
        throw new Error('B2B subscription required for car valuation. Please upgrade your subscription.');
    }
    try {
        const carData = request.data;
        // Validate required fields
        const requiredFields = ['make', 'model', 'year', 'mileage', 'fuelType', 'transmission', 'location', 'condition'];
        for (const field of requiredFields) {
            if (!(field in carData)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        // Validate data ranges
        if (carData.year < 1990 || carData.year > new Date().getFullYear() + 1) {
            throw new Error('Invalid year');
        }
        if (carData.mileage < 0 || carData.mileage > 1000000) {
            throw new Error('Invalid mileage');
        }
        // For now, use simple valuation (AI model integration would go here)
        const valuation = simpleCarValuation(carData);
        // Track API usage
        await (0, subscriptions_1.trackAPIUsage)(request.auth.uid, 'getCarValuation');
        // Log the valuation request
        firebase_functions_1.logger.info('Car valuation requested', {
            userId: request.auth.uid,
            make: carData.make,
            model: carData.model,
            year: carData.year,
            predictedPrice: valuation.predictedPrice
        });
        return {
            success: true,
            valuation,
            timestamp: new Date().toISOString(),
            service: 'Bulgarian Car Marketplace AI Valuation'
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error in car valuation:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Car valuation failed: ${errorMessage}`);
    }
});
//# sourceMappingURL=analytics.js.map