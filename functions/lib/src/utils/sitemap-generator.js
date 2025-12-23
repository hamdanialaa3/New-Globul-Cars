"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sitemapCloudFunction = exports.generateSitemapIndex = exports.generateCompleteSitemap = exports.generateStaticPagesSitemap = exports.generateCarListingsSitemap = exports.generateSitemapXML = void 0;
const logger_service_1 = require("../services/logger-service");
// Dynamic Sitemap Generator (FREE SEO)
// Generates XML sitemap for Google Search Console
// UPDATED: Now uses numeric URLs for all car listings
const firebase_1 = require("../firebase");
const firestore_1 = require("firebase/firestore");
const routing_utils_1 = require("./routing-utils");
/**
 * Generate sitemap XML from URLs
 * FREE - No external service needed
 */
const generateSitemapXML = (urls) => {
    const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const urlsXML = urls.map(url => {
        let entry = `  <url>\n    <loc>${url.loc}</loc>\n`;
        if (url.lastmod)
            entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
        if (url.changefreq)
            entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
        if (url.priority !== undefined)
            entry += `    <priority>${url.priority}</priority>\n`;
        entry += '  </url>\n';
        return entry;
    }).join('');
    const footer = '</urlset>';
    return header + urlsXML + footer;
};
exports.generateSitemapXML = generateSitemapXML;
/**
 * Generate sitemap for all active car listings
 * FREE - Query Firestore directly
 * UPDATED: Uses numeric URLs instead of UUIDs
 */
const generateCarListingsSitemap = async (baseUrl = 'https://mobilebg.eu') => {
    try {
        const carsRef = (0, firestore_1.collection)(firebase_1.db, 'cars');
        const q = (0, firestore_1.query)(carsRef, (0, firestore_1.where)('status', '==', 'active'), (0, firestore_1.orderBy)('createdAt', 'desc'), (0, firestore_1.limit)(50000) // Google sitemap limit
        );
        const snapshot = await (0, firestore_1.getDocs)(q);
        return snapshot.docs
            .map(doc => {
            var _a, _b, _c, _d, _e, _f;
            const data = doc.data();
            // Skip cars without numeric IDs (legacy data)
            if (!data.sellerNumericId || !data.carNumericId) {
                logger_service_1.logger.warn(`Car ${doc.id} missing numeric IDs, skipping from sitemap`);
                return null;
            }
            const lastmod = ((_c = (_b = (_a = data.updatedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString()) ||
                ((_f = (_e = (_d = data.createdAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d)) === null || _f === void 0 ? void 0 : _f.toISOString()) ||
                new Date().toISOString();
            // Use numeric URL format: /car/{sellerNumericId}/{carNumericId}
            const carUrl = (0, routing_utils_1.getCarDetailsUrl)({
                sellerNumericId: data.sellerNumericId,
                carNumericId: data.carNumericId,
                id: doc.id
            });
            return {
                loc: `${baseUrl}${carUrl}`,
                lastmod: lastmod.split('T')[0],
                changefreq: 'daily',
                priority: 0.8
            };
        })
            .filter(Boolean); // Remove null entries
    }
    catch (error) {
        logger_service_1.logger.error('Error generating car listings sitemap:', error);
        return [];
    }
};
exports.generateCarListingsSitemap = generateCarListingsSitemap;
/**
 * Generate static pages sitemap
 * FREE - Hardcoded static routes
 */
const generateStaticPagesSitemap = (baseUrl = 'https://mobilebg.eu') => {
    const today = new Date().toISOString().split('T')[0];
    return [
        { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0, lastmod: today },
        { loc: `${baseUrl}/cars`, changefreq: 'hourly', priority: 0.9, lastmod: today },
        { loc: `${baseUrl}/sell`, changefreq: 'monthly', priority: 0.8, lastmod: today },
        { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: 0.5, lastmod: today },
        { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: 0.5, lastmod: today },
        { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: 0.3, lastmod: today },
        { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: 0.3, lastmod: today },
        { loc: `${baseUrl}/faq`, changefreq: 'monthly', priority: 0.6, lastmod: today },
    ];
};
exports.generateStaticPagesSitemap = generateStaticPagesSitemap;
/**
 * Generate complete sitemap (static + dynamic)
 * FREE - Combines all URLs
 *
 * @example
 * const xml = await generateCompleteSitemap();
 * // Save to public/sitemap.xml or serve dynamically
 */
const generateCompleteSitemap = async (baseUrl = 'https://mobilebg.eu') => {
    const staticUrls = (0, exports.generateStaticPagesSitemap)(baseUrl);
    const carUrls = await (0, exports.generateCarListingsSitemap)(baseUrl);
    const allUrls = [...staticUrls, ...carUrls];
    return (0, exports.generateSitemapXML)(allUrls);
};
exports.generateCompleteSitemap = generateCompleteSitemap;
/**
 * Generate sitemap index (for large sites with multiple sitemaps)
 * FREE - Splits into multiple files if needed
 */
const generateSitemapIndex = (sitemapUrls, baseUrl = 'https://mobilebg.eu') => {
    const today = new Date().toISOString().split('T')[0];
    const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const sitemaps = sitemapUrls.map(url => {
        return `  <sitemap>\n` +
            `    <loc>${url}</loc>\n` +
            `    <lastmod>${today}</lastmod>\n` +
            `  </sitemap>\n`;
    }).join('');
    const footer = '</sitemapindex>';
    return header + sitemaps + footer;
};
exports.generateSitemapIndex = generateSitemapIndex;
/**
 * Cloud Function example (deploy to Firebase Functions - FREE tier)
 * Serves sitemap dynamically at /sitemap.xml
 */
exports.sitemapCloudFunction = `
import * as functions from 'firebase-functions';
import { generateCompleteSitemap } from './sitemap-generator';

export const sitemap = functions.https.onRequest(async (req, res) => {
  try {
    const xml = await generateCompleteSitemap('https://mobilebg.eu');
    
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
    res.status(200).send(xml);
  } catch (error: any) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});
`;
exports.default = {
    generateSitemapXML: exports.generateSitemapXML,
    generateCarListingsSitemap: exports.generateCarListingsSitemap,
    generateStaticPagesSitemap: exports.generateStaticPagesSitemap,
    generateCompleteSitemap: exports.generateCompleteSitemap,
    generateSitemapIndex: exports.generateSitemapIndex
};
//# sourceMappingURL=sitemap-generator.js.map