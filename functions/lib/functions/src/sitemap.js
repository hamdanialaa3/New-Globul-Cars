"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sitemap = void 0;
const functions = require("firebase-functions");
const sitemap_generator_1 = require("../../src/utils/sitemap-generator");
exports.sitemap = functions
    .runWith({
    memory: '512MB',
    timeoutSeconds: 60
})
    .https.onRequest(async (req, res) => {
    try {
        const baseUrl = 'https://koli.one';
        const xml = await (0, sitemap_generator_1.generateCompleteSitemap)(baseUrl);
        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
        res.status(200).send(xml);
    }
    catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});
//# sourceMappingURL=sitemap.js.map