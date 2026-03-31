import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Initialize app if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const BASE_URL = 'https://koli.one';
const MAX_URLS_PER_SITEMAP = 10000;

const VEHICLE_COLLECTIONS = [
    'passenger_cars',
    'suvs',
    'vans',
    'motorcycles',
    'trucks',
    'buses'
];

/**
 * Generates an XML sitemap of all active vehicles.
 * Accessible via /api/sitemap-cars.xml (or whatever URL rewrites you setup in firebase.json)
 */
export const sitemapDynamic = functions
    .runWith({
        memory: '512MB',
        timeoutSeconds: 300 // Can take a while if DB is huge
    })
    .https.onRequest(async (req, res) => {
        try {
            // Set XML headers to optimize for search engine parsers
            res.set('Content-Type', 'application/xml; charset=utf-8');
            res.set('Cache-Control', 'public, max-age=3600, s-maxage=14400'); // Cache for 1-4 hours

            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

            let urlsAdded = 0;

            for (const collectionName of VEHICLE_COLLECTIONS) {
                if (urlsAdded >= MAX_URLS_PER_SITEMAP) break;

                // Only get actively published and not sold vehicles to keep sitemap clean
                const snapshot = await db.collection(collectionName)
                    .where('status', '==', 'published')
                    .where('isSold', '==', false) // Optional: typically sold cars are 404/archived
                    .orderBy('createdAt', 'desc')
                    .limit(MAX_URLS_PER_SITEMAP - urlsAdded)
                    .get();

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const sellerId = data.sellerNumericId || data.sellerId;
                    const carNumericId = data.carNumericId || doc.id;
                    const lastUpdated = data.updatedAt ? new Date(data.updatedAt).toISOString() : (data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString());

                    if (sellerId && carNumericId) {
                        xml += '  <url>\n';
                        xml += `    <loc>${BASE_URL}/car/${sellerId}/${carNumericId}</loc>\n`;
                        xml += `    <lastmod>${lastUpdated}</lastmod>\n`;
                        xml += `    <changefreq>weekly</changefreq>\n`;
                        xml += `    <priority>0.8</priority>\n`;
                        xml += '  </url>\n';
                        urlsAdded++;
                    }
                });
            }

            xml += '</urlset>';
            res.status(200).send(xml);
        } catch (error) {
            console.error('Error generating dynamic sitemap:', error);
            res.status(500).send('Error generating sitemap');
        }
    });
