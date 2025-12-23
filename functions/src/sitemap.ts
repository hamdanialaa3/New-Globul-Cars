import * as functions from 'firebase-functions';
import { generateCompleteSitemap } from '../../src/utils/sitemap-generator';

export const sitemap = functions
    .runWith({
        memory: '512MB',
        timeoutSeconds: 60
    })
    .https.onRequest(async (req, res) => {
        try {
            const baseUrl = 'https://mobilebg.eu';
            const xml = await generateCompleteSitemap(baseUrl);

            res.set('Content-Type', 'application/xml');
            res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
            res.status(200).send(xml);
        } catch (error) {
            console.error('Sitemap generation error:', error);
            res.status(500).send('Error generating sitemap');
        }
    });
