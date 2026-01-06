"use strict";
/**
 * Sitemap Generation Cloud Functions
 *
 * Provides both HTTP endpoint and scheduled regeneration for SEO optimization.
 * Includes dynamic pages for cities and brands to boost local SEO.
 *
 * @updated January 6, 2026
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualSitemapRegeneration = exports.scheduledSitemapRegeneration = exports.sitemap = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const logger = functions.logger;
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const BASE_URL = 'https://mobilebg.eu';
// Bulgarian cities for SEO pages
const BULGARIAN_CITIES = [
    'sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora',
    'pleven', 'sliven', 'dobrich', 'shumen', 'pernik', 'haskovo',
    'yambol', 'pazardzhik', 'blagoevgrad', 'veliko-tarnovo', 'vratsa',
    'gabrovo', 'asenovgrad', 'vidin', 'kazanlak', 'kyustendil', 'montana',
    'targovishte', 'lovech', 'silistra', 'razgrad', 'dupnitsa', 'smolyan'
];
// Top car brands for SEO pages
const TOP_BRANDS = [
    'audi', 'bmw', 'mercedes-benz', 'volkswagen', 'toyota', 'ford',
    'opel', 'renault', 'peugeot', 'skoda', 'seat', 'hyundai', 'kia',
    'nissan', 'honda', 'mazda', 'volvo', 'fiat', 'citroen', 'dacia',
    'land-rover', 'jeep', 'porsche', 'mini', 'alfa-romeo', 'chevrolet'
];
/**
 * Generate complete sitemap XML with all pages
 */
async function generateEnhancedSitemap() {
    const pages = [];
    const now = new Date().toISOString().split('T')[0];
    // Static pages
    const staticPages = [
        { path: '', priority: '1.0', changefreq: 'daily' },
        { path: '/search', priority: '0.9', changefreq: 'hourly' },
        { path: '/sell', priority: '0.8', changefreq: 'weekly' },
        { path: '/about', priority: '0.5', changefreq: 'monthly' },
        { path: '/contact', priority: '0.5', changefreq: 'monthly' },
        { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
        { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    ];
    staticPages.forEach(page => {
        pages.push({
            url: `${BASE_URL}${page.path}`,
            priority: page.priority,
            changefreq: page.changefreq,
            lastmod: now
        });
    });
    // SEO City Pages (/koli/sofia, /koli/plovdiv, etc.)
    BULGARIAN_CITIES.forEach(city => {
        pages.push({
            url: `${BASE_URL}/koli/${city}`,
            priority: '0.8',
            changefreq: 'daily',
            lastmod: now
        });
    });
    // SEO Brand Pages (/marka/bmw, /marka/mercedes-benz, etc.)
    TOP_BRANDS.forEach(brand => {
        pages.push({
            url: `${BASE_URL}/marka/${brand}`,
            priority: '0.8',
            changefreq: 'daily',
            lastmod: now
        });
    });
    // Dynamic car listings from Firestore
    const vehicleCollections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
    for (const collection of vehicleCollections) {
        try {
            const snapshot = await db.collection(collection)
                .where('status', '==', 'active')
                .where('isActive', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(5000) // Limit per collection
                .get();
            snapshot.docs.forEach(doc => {
                var _a, _b, _c, _d, _e;
                const car = doc.data();
                if (car.sellerNumericId && car.carNumericId) {
                    const lastmod = ((_e = (_d = (_c = (_b = (_a = car.updatedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString) === null || _d === void 0 ? void 0 : _d.call(_c)) === null || _e === void 0 ? void 0 : _e.split('T')[0]) || now;
                    pages.push({
                        url: `${BASE_URL}/car/${car.sellerNumericId}/${car.carNumericId}`,
                        priority: '0.7',
                        changefreq: 'weekly',
                        lastmod
                    });
                }
            });
        }
        catch (error) {
            logger.warn(`Error fetching ${collection} for sitemap:`, error);
        }
    }
    // Dynamic dealer profiles
    try {
        const dealersSnapshot = await db.collection('users')
            .where('planTier', 'in', ['dealer', 'company'])
            .where('isActive', '==', true)
            .limit(1000)
            .get();
        dealersSnapshot.docs.forEach(doc => {
            const dealer = doc.data();
            if (dealer.numericId) {
                pages.push({
                    url: `${BASE_URL}/profile/${dealer.numericId}`,
                    priority: '0.6',
                    changefreq: 'weekly',
                    lastmod: now
                });
            }
        });
    }
    catch (error) {
        logger.warn('Error fetching dealers for sitemap:', error);
    }
    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(page => `    <url>
        <loc>${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('\n')}
</urlset>`;
    return xml;
}
/**
 * HTTP endpoint for sitemap (for search engines)
 */
exports.sitemap = functions
    .runWith({
    memory: '512MB',
    timeoutSeconds: 120
})
    .https.onRequest(async (req, res) => {
    try {
        logger.info('Generating sitemap via HTTP request');
        const xml = await generateEnhancedSitemap();
        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
        res.status(200).send(xml);
        logger.info('Sitemap generated successfully');
    }
    catch (error) {
        logger.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});
/**
 * Scheduled sitemap regeneration (every 6 hours)
 * Stores sitemap in Cloud Storage for faster serving
 */
exports.scheduledSitemapRegeneration = functions.pubsub
    .schedule('every 6 hours')
    .timeZone('Europe/Sofia')
    .onRun(async (context) => {
    try {
        logger.info('🗺️ Starting scheduled sitemap regeneration...');
        const xml = await generateEnhancedSitemap();
        // Store in Firestore cache for quick access
        await db.collection('system').doc('sitemap_cache').set({
            xml,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            urlCount: (xml.match(/<url>/g) || []).length
        });
        logger.info('✅ Sitemap regeneration complete', {
            urlCount: (xml.match(/<url>/g) || []).length,
            timestamp: new Date().toISOString()
        });
        return null;
    }
    catch (error) {
        logger.error('❌ Scheduled sitemap regeneration failed:', error);
        throw error;
    }
});
/**
 * Manual trigger for sitemap regeneration (for admin use)
 */
exports.manualSitemapRegeneration = functions.https.onCall(async (data, context) => {
    // Check if user is admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    // Optionally check for admin claim
    // if (!context.auth.token.admin) {
    //     throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    // }
    try {
        logger.info('🗺️ Manual sitemap regeneration triggered by:', context.auth.uid);
        const xml = await generateEnhancedSitemap();
        await db.collection('system').doc('sitemap_cache').set({
            xml,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            urlCount: (xml.match(/<url>/g) || []).length,
            triggeredBy: context.auth.uid
        });
        const urlCount = (xml.match(/<url>/g) || []).length;
        logger.info('✅ Manual sitemap regeneration complete', { urlCount });
        return { success: true, urlCount };
    }
    catch (error) {
        logger.error('❌ Manual sitemap regeneration failed:', error);
        throw new functions.https.HttpsError('internal', 'Sitemap generation failed');
    }
});
//# sourceMappingURL=sitemap.js.map