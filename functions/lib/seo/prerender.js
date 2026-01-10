"use strict";
// functions/src/seo/prerender.ts
// Prerender Cloud Function - SEO Prerendering for Bulgarian Car Marketplace
// وظيفة Prerender للـ SEO
Object.defineProperty(exports, "__esModule", { value: true });
exports.prerender = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const logger = functions.logger;
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Cache for prerendered HTML (in-memory, could be replaced with Redis)
const htmlCache = new Map();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
/**
 * Check if URL should be prerendered
 */
function isPrerenderable(url) {
    if (!url)
        return false;
    // URLs that should be prerendered
    const prerenderablePatterns = [
        /^\/$/,
        /^\/koli\/?$/,
        /^\/koli\/[^\/]+$/,
        /^\/koli\/[^\/]+\/[^\/]+$/,
        /^\/car\/\d+\/\d+$/,
        /^\/profile\/\d+$/, // /profile/18
    ];
    return prerenderablePatterns.some(pattern => pattern.test(url));
}
/**
 * Fetch page data based on URL
 */
async function fetchPageData(url) {
    try {
        // Homepage
        if (url === '/' || url === '') {
            return {
                type: 'homepage',
                title: 'Bulgarski Avtomobili - Продажба на коли в България',
                description: 'Намерете идеалния автомобил в България. Над 10,000 обяви от частни лица, автосалони и компании.',
            };
        }
        // City page: /koli/sofia
        const cityMatch = url.match(/^\/koli\/([^\/]+)$/);
        if (cityMatch) {
            const citySlug = cityMatch[1];
            const cityData = await getCityPageData(citySlug);
            return Object.assign({ type: 'city' }, cityData);
        }
        // Brand in City: /koli/sofia/bmw
        const brandCityMatch = url.match(/^\/koli\/([^\/]+)\/([^\/]+)$/);
        if (brandCityMatch) {
            const [, citySlug, brandSlug] = brandCityMatch;
            const brandCityData = await getBrandCityPageData(citySlug, brandSlug);
            return Object.assign({ type: 'brand-city' }, brandCityData);
        }
        // Car detail: /car/80/5
        const carMatch = url.match(/^\/car\/(\d+)\/(\d+)$/);
        if (carMatch) {
            const [, sellerNumericId, carNumericId] = carMatch;
            const carData = await getCarPageData(parseInt(sellerNumericId), parseInt(carNumericId));
            return Object.assign({ type: 'car' }, carData);
        }
        // Profile: /profile/18
        const profileMatch = url.match(/^\/profile\/(\d+)$/);
        if (profileMatch) {
            const numericId = parseInt(profileMatch[1]);
            const profileData = await getProfilePageData(numericId);
            return Object.assign({ type: 'profile' }, profileData);
        }
        return null;
    }
    catch (error) {
        logger.error('Error fetching page data:', error);
        return null;
    }
}
/**
 * Get city page data
 */
async function getCityPageData(citySlug) {
    const cityMap = {
        sofia: { bg: 'София', region: 'София-град' },
        plovdiv: { bg: 'Пловдив', region: 'Пловдив' },
        varna: { bg: 'Варна', region: 'Варна' },
        burgas: { bg: 'Бургас', region: 'Бургас' },
    };
    const cityInfo = cityMap[citySlug.toLowerCase()];
    if (!cityInfo) {
        return {
            title: 'Коли в България',
            description: 'Намерете автомобили в България',
            city: citySlug,
        };
    }
    // Get car count for city (simplified - should query Firestore)
    const carsSnapshot = await db.collection('cars')
        .where('location', '==', cityInfo.bg)
        .where('isActive', '==', true)
        .limit(1)
        .get();
    const totalCars = carsSnapshot.size; // This is just a sample count
    return {
        title: `Продажба на коли в ${cityInfo.bg} - Bulgarski Avtomobili`,
        description: `Намерете идеалния автомобил в ${cityInfo.bg}. Над ${totalCars} обяви от частни лица, автосалони и компании.`,
        city: cityInfo.bg,
        citySlug,
        region: cityInfo.region,
        totalCars,
    };
}
/**
 * Get brand in city page data
 */
async function getBrandCityPageData(citySlug, brandSlug) {
    const cityMap = {
        sofia: { bg: 'София' },
        plovdiv: { bg: 'Пловдив' },
        varna: { bg: 'Варна' },
        burgas: { bg: 'Бургас' },
    };
    const cityInfo = cityMap[citySlug.toLowerCase()];
    const brand = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1).toLowerCase();
    return {
        title: `${brand} в ${(cityInfo === null || cityInfo === void 0 ? void 0 : cityInfo.bg) || citySlug} - Продажба на коли`,
        description: `Намерете ${brand} автомобили в ${(cityInfo === null || cityInfo === void 0 ? void 0 : cityInfo.bg) || citySlug}. Голям избор от нови и употребявани коли.`,
        city: (cityInfo === null || cityInfo === void 0 ? void 0 : cityInfo.bg) || citySlug,
        citySlug,
        brand,
        brandSlug,
    };
}
/**
 * Get car detail page data
 */
async function getCarPageData(sellerNumericId, carNumericId) {
    try {
        // Find user by numeric ID
        const usersSnapshot = await db.collection('users')
            .where('numericId', '==', sellerNumericId)
            .limit(1)
            .get();
        if (usersSnapshot.empty) {
            return null;
        }
        const userId = usersSnapshot.docs[0].id;
        const userData = usersSnapshot.docs[0].data();
        // Find car by numeric ID
        const collections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
        for (const collectionName of collections) {
            const carsSnapshot = await db.collection(collectionName)
                .where('sellerId', '==', userId)
                .where('carNumericId', '==', carNumericId)
                .limit(1)
                .get();
            if (!carsSnapshot.empty) {
                const carData = carsSnapshot.docs[0].data();
                return {
                    title: `${carData.make || ''} ${carData.model || ''} ${carData.firstRegistration || carData.year || ''} - ${carData.price || 0} лв.`,
                    description: `${carData.make || ''} ${carData.model || ''} в ${carData.location || ''}. ${carData.description || ''}`,
                    make: carData.make,
                    model: carData.model,
                    year: carData.firstRegistration || carData.year,
                    price: carData.price || carData.netPrice,
                    location: carData.location,
                    sellerName: userData.displayName || userData.name,
                    sellerType: userData.profileType || 'private',
                };
            }
        }
        return null;
    }
    catch (error) {
        logger.error('Error getting car data:', error);
        return null;
    }
}
/**
 * Get profile page data
 */
async function getProfilePageData(numericId) {
    try {
        const usersSnapshot = await db.collection('users')
            .where('numericId', '==', numericId)
            .limit(1)
            .get();
        if (usersSnapshot.empty) {
            return null;
        }
        const userData = usersSnapshot.docs[0].data();
        return {
            title: `${userData.displayName || userData.name || 'Профил'} - Bulgarski Avtomobili`,
            description: `Профил на ${userData.profileType === 'dealer' ? 'автосалон' : userData.profileType === 'company' ? 'компания' : 'продавач'}: ${userData.displayName || userData.name}`,
            name: userData.displayName || userData.name,
            profileType: userData.profileType || 'private',
        };
    }
    catch (error) {
        logger.error('Error getting profile data:', error);
        return null;
    }
}
/**
 * Generate prerendered HTML with full SEO tags
 * Includes: hreflang, OpenGraph, Twitter Cards, JSON-LD
 */
function generatePrerenderedHTML(data) {
    if (!data) {
        return '<html><body><h1>Page not found</h1></body></html>';
    }
    const structuredData = generateBulgarianStructuredData(data);
    const baseUrl = 'https://mobilebg.eu';
    const canonicalUrl = `${baseUrl}${data.url || ''}`;
    const enUrl = `${baseUrl}/en${data.url || ''}`;
    const ogImage = data.image || `${baseUrl}/og-image.jpg`;
    return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title || 'Bulgarski Avtomobili'}</title>
  <meta name="description" content="${data.description || ''}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  
  <!-- Canonical & hreflang -->
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="bg" href="${canonicalUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
  
  <!-- OpenGraph -->
  <meta property="og:type" content="${data.type === 'car' ? 'product' : 'website'}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${data.title || 'Bulgarski Avtomobili'}">
  <meta property="og:description" content="${data.description || ''}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="Bulgarski Avtomobili">
  <meta property="og:locale" content="bg_BG">
  <meta property="og:locale:alternate" content="en_US">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title || 'Bulgarski Avtomobili'}">
  <meta name="twitter:description" content="${data.description || ''}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Price for products -->
  ${data.price ? `
  <meta property="product:price:amount" content="${data.price}">
  <meta property="product:price:currency" content="BGN">
  ` : ''}
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
  </script>
</head>
<body>
  <div id="root">
    <h1>${data.title || 'Bulgarski Avtomobili'}</h1>
    <p>${data.description || ''}</p>
    <!-- React app will hydrate here -->
  </div>
  <script src="/static/js/main.js"></script>
</body>
</html>`;
}
/**
 * Generate Bulgarian Structured Data
 */
function generateBulgarianStructuredData(data) {
    const base = {
        '@context': 'https://schema.org',
    };
    switch (data.type) {
        case 'car':
            return Object.assign(Object.assign({}, base), { '@type': 'Car', name: `${data.make} ${data.model}`, description: data.description, brand: {
                    '@type': 'Brand',
                    name: data.make,
                }, model: data.model, productionDate: data.year ? `${data.year}` : undefined, offers: {
                    '@type': 'Offer',
                    price: data.price,
                    priceCurrency: 'BGN',
                    availability: 'https://schema.org/InStock',
                    seller: {
                        '@type': data.sellerType === 'dealer' ? 'AutoDealer' : 'Person',
                        name: data.sellerName,
                    },
                }, purchaseLocation: {
                    '@type': 'Place',
                    address: {
                        '@type': 'PostalAddress',
                        addressCountry: 'BG',
                        addressLocality: data.location,
                    },
                } });
        case 'city':
            return Object.assign(Object.assign({}, base), { '@type': 'WebPage', name: data.title, description: data.description, about: {
                    '@type': 'City',
                    name: data.city,
                    addressCountry: 'BG',
                } });
        case 'brand-city':
            return Object.assign(Object.assign({}, base), { '@type': 'CollectionPage', name: data.title, description: data.description, about: {
                    '@type': 'Product',
                    brand: {
                        '@type': 'Brand',
                        name: data.brand,
                    },
                } });
        default:
            return Object.assign(Object.assign({}, base), { '@type': 'WebPage', name: data.title || 'Bulgarski Avtomobili', description: data.description || '' });
    }
}
/**
 * Prerender Cloud Function
 */
exports.prerender = functions
    .runWith({
    memory: '512MB',
    timeoutSeconds: 60,
})
    .https.onRequest(async (req, res) => {
    try {
        const url = req.query.url || req.path;
        // Check cache
        const cached = htmlCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            res.set('Content-Type', 'text/html');
            res.set('Cache-Control', 'public, max-age=21600'); // 6 hours
            res.send(cached.html);
            return;
        }
        // Check if prerenderable
        if (!isPrerenderable(url)) {
            // Return SPA template for non-prerenderable pages
            const spaTemplate = `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulgarski Avtomobili</title>
</head>
<body>
  <div id="root"></div>
  <script src="/static/js/main.js"></script>
</body>
</html>`;
            res.set('Content-Type', 'text/html');
            res.send(spaTemplate);
            return;
        }
        // Fetch page data
        const pageData = await fetchPageData(url);
        if (!pageData) {
            res.status(404).send('Page not found');
            return;
        }
        // Generate HTML
        const html = generatePrerenderedHTML(Object.assign(Object.assign({}, pageData), { url }));
        // Cache HTML
        htmlCache.set(url, {
            html,
            timestamp: Date.now(),
        });
        // Clear old cache entries (keep last 100)
        if (htmlCache.size > 100) {
            const entries = Array.from(htmlCache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            htmlCache.clear();
            entries.slice(0, 100).forEach(([key, value]) => {
                htmlCache.set(key, value);
            });
        }
        res.set('Content-Type', 'text/html');
        res.set('Cache-Control', 'public, max-age=21600'); // 6 hours
        res.send(html);
    }
    catch (error) {
        logger.error('Prerender error:', error);
        res.status(500).send('Error generating prerendered HTML');
    }
});
//# sourceMappingURL=prerender.js.map