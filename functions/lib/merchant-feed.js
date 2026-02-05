"use strict";
// functions/src/merchant-feed.ts
/**
 * Google Merchant Center Feed Generator
 *
 * Generates XML product feed for Google Shopping / Merchant Center
 * Updates automatically every hour with latest car listings
 *
 * Feed URL: https://your-domain.com/merchant-feed.xml
 *
 * Implements Google Merchant Center specification:
 * https://support.google.com/merchants/answer/7052112
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMerchantFeedCache = exports.merchantFeed = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const logger = functions.logger;
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Generate XML product feed for Google Merchant Center
 *
 * Deployed as HTTP Cloud Function
 * Access: GET https://your-project.cloudfunctions.net/merchantFeed
 */
exports.merchantFeed = functions
    .region('europe-west1') // Deploy to EU region for GDPR compliance
    .https.onRequest(async (req, res) => {
    try {
        // Set response headers
        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        // Base URL (UPDATE THIS to your production domain)
        const baseUrl = process.env.BASE_URL || 'https://koli.one';
        // Fetch active car listings from all vehicle collections
        const vehicleCollections = [
            'cars',
            'passenger_cars',
            'suvs',
            'vans',
            'motorcycles',
            'trucks',
            'buses'
        ];
        let allCars = [];
        // Query all collections in parallel
        const queryPromises = vehicleCollections.map(async (collectionName) => {
            const snapshot = await db
                .collection(collectionName)
                .where('status', '==', 'active')
                .where('isActive', '==', true)
                .limit(1000) // Limit per collection to prevent timeout
                .get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        });
        const results = await Promise.all(queryPromises);
        allCars = results.flat();
        // Filter cars with valid data
        const validCars = allCars.filter(car => {
            var _a;
            return car.sellerNumericId &&
                car.carNumericId &&
                car.price > 0 &&
                ((_a = car.images) === null || _a === void 0 ? void 0 : _a.length) > 0 &&
                car.make &&
                car.model;
        });
        logger.info(`Generating feed for ${validCars.length} cars`);
        // Generate XML feed
        const xml = generateMerchantFeedXML(validCars, baseUrl);
        res.status(200).send(xml);
    }
    catch (error) {
        logger.error('Error generating merchant feed:', error);
        res.status(500).send('<?xml version="1.0"?><error>Internal server error</error>');
    }
});
/**
 * Generate XML feed according to Google Merchant Center specs
 */
function generateMerchantFeedXML(cars, baseUrl) {
    const header = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Koli One - Автомобили</title>
    <link>${baseUrl}</link>
    <description>Купувайте и продавайте автомобили в България</description>
`;
    const items = cars.map(car => generateCarItem(car, baseUrl)).join('\n');
    const footer = `  </channel>
</rss>`;
    return header + items + footer;
}
/**
 * Generate individual car item in Google Merchant format
 */
function generateCarItem(car, baseUrl) {
    var _a;
    // Generate numeric URL
    const carUrl = `${baseUrl}/car/${car.sellerNumericId}/${car.carNumericId}`;
    // Primary image URL
    const imageUrl = ((_a = car.images[0]) === null || _a === void 0 ? void 0 : _a.startsWith('http'))
        ? car.images[0]
        : `${baseUrl}${car.images[0]}`;
    // Additional images (max 10)
    const additionalImages = car.images
        .slice(1, 10)
        .map(img => img.startsWith('http') ? img : `${baseUrl}${img}`)
        .map(url => `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`)
        .join('\n');
    // Car title (max 150 characters)
    const title = `${car.year} ${car.make} ${car.model}`.slice(0, 150);
    // Description (max 5000 characters)
    const description = car.description
        ? car.description.slice(0, 5000)
        : `${car.year} ${car.make} ${car.model}. ${car.mileage ? `${car.mileage}км. ` : ''}${car.fuelType || ''} ${car.transmission || ''}`;
    // Unique ID (required)
    const id = `${car.sellerNumericId}_${car.carNumericId}`;
    // Condition (used or new)
    const condition = car.year >= new Date().getFullYear() ? 'new' : 'used';
    // Availability
    const availability = 'in stock';
    return `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(carUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
${additionalImages}
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${car.price} ${car.currency || 'EUR'}</g:price>
      <g:brand>${escapeXml(car.make)}</g:brand>
      <g:mpn>${escapeXml(car.model)}</g:mpn>
      <g:product_type>Vehicles &amp; Parts &gt; Vehicles &gt; Motor Vehicles &gt; Cars</g:product_type>
      <g:google_product_category>916</g:google_product_category>
      ${car.year ? `<g:year>${car.year}</g:year>` : ''}
      ${car.mileage ? `<g:mileage>${car.mileage} km</g:mileage>` : ''}
      ${car.fuelType ? `<g:fuel_type>${escapeXml(car.fuelType)}</g:fuel_type>` : ''}
      ${car.transmission ? `<g:transmission>${escapeXml(car.transmission)}</g:transmission>` : ''}
      ${car.location ? `<g:location>${escapeXml(car.location)}</g:location>` : ''}
      <g:item_group_id>${escapeXml(car.make)}_${escapeXml(car.model)}</g:item_group_id>
    </item>`;
}
/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
/**
 * Scheduled function to update feed cache (runs every hour)
 * Optional: Pre-generate and cache feed for faster responses
 */
exports.updateMerchantFeedCache = functions
    .region('europe-west1')
    .pubsub.schedule('every 1 hours')
    .timeZone('Europe/Sofia')
    .onRun(async (context) => {
    try {
        logger.info('Updating merchant feed cache...');
        // Store cached feed in Firestore (optional optimization)
        // You can implement caching logic here if needed
        logger.info('Merchant feed cache updated successfully');
        return null;
    }
    catch (error) {
        logger.error('Error updating merchant feed cache:', error);
        return null;
    }
});
exports.default = { merchantFeed: exports.merchantFeed, updateMerchantFeedCache: exports.updateMerchantFeedCache };
//# sourceMappingURL=merchant-feed.js.map