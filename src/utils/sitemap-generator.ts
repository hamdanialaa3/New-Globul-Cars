import { logger } from '../services/logger-service';
// Dynamic Sitemap Generator (FREE SEO)
// Generates XML sitemap for Google Search Console

import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate sitemap XML from URLs
 * FREE - No external service needed
 */
export const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  const urlsXML = urls.map(url => {
    let entry = `  <url>\n    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
    if (url.changefreq) entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
    if (url.priority !== undefined) entry += `    <priority>${url.priority}</priority>\n`;
    entry += '  </url>\n';
    return entry;
  }).join('');
  
  const footer = '</urlset>';
  
  return header + urlsXML + footer;
};

/**
 * Generate sitemap for all active car listings
 * FREE - Query Firestore directly
 */
export const generateCarListingsSitemap = async (baseUrl: string = 'https://globulcars.bg'): Promise<SitemapUrl[]> => {
  try {
    const carsRef = collection(db, 'cars');
    const q = query(
      carsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(50000) // Google sitemap limit
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const lastmod = data.updatedAt?.toDate?.()?.toISOString() || 
                      data.createdAt?.toDate?.()?.toISOString() ||
                      new Date().toISOString();
      
      return {
        loc: `${baseUrl}/car/${doc.id}`,
        lastmod: lastmod.split('T')[0], // YYYY-MM-DD format
        changefreq: 'daily',
        priority: 0.8
      };
    });
  } catch (error) {
    logger.error('Error generating car listings sitemap:', error);
    return [];
  }
};

/**
 * Generate static pages sitemap
 * FREE - Hardcoded static routes
 */
export const generateStaticPagesSitemap = (baseUrl: string = 'https://globulcars.bg'): SitemapUrl[] => {
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

/**
 * Generate complete sitemap (static + dynamic)
 * FREE - Combines all URLs
 * 
 * @example
 * const xml = await generateCompleteSitemap();
 * // Save to public/sitemap.xml or serve dynamically
 */
export const generateCompleteSitemap = async (baseUrl: string = 'https://globulcars.bg'): Promise<string> => {
  const staticUrls = generateStaticPagesSitemap(baseUrl);
  const carUrls = await generateCarListingsSitemap(baseUrl);
  
  const allUrls = [...staticUrls, ...carUrls];
  
  return generateSitemapXML(allUrls);
};

/**
 * Generate sitemap index (for large sites with multiple sitemaps)
 * FREE - Splits into multiple files if needed
 */
export const generateSitemapIndex = (sitemapUrls: string[], baseUrl: string = 'https://globulcars.bg'): string => {
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

/**
 * Cloud Function example (deploy to Firebase Functions - FREE tier)
 * Serves sitemap dynamically at /sitemap.xml
 */
export const sitemapCloudFunction = `
import * as functions from 'firebase-functions';
import { generateCompleteSitemap } from './sitemap-generator';

export const sitemap = functions.https.onRequest(async (req, res) => {
  try {
    const xml = await generateCompleteSitemap('https://globulcars.bg');
    
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
    res.status(200).send(xml);
  } catch (error) {
    logger.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});
`;

export default {
  generateSitemapXML,
  generateCarListingsSitemap,
  generateStaticPagesSitemap,
  generateCompleteSitemap,
  generateSitemapIndex
};
