/**
 * SEO Sitemap Generator for Koli One
 * Generates sitemap.xml with all static + dynamic SEO pages
 */

import { generateSEORoutes } from '../data/seo-locations';

const BASE_URL = 'https://kolione.bg';

interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Static routes with priorities
 */
const STATIC_ROUTES: SitemapURL[] = [
  {
    loc: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0
  },
  {
    loc: '/search',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'hourly',
    priority: 0.9
  },
  {
    loc: '/cars',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'hourly',
    priority: 0.9
  },
  {
    loc: '/about',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5
  },
  {
    loc: '/contact',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5
  },
  {
    loc: '/privacy-policy',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'yearly',
    priority: 0.3
  }
];

/**
 * Generate sitemap XML content
 */
export function generateSitemapXML(): string {
  const seoRoutes = generateSEORoutes();
  const today = new Date().toISOString().split('T')[0];

  // Convert SEO routes to sitemap URLs
  const seoURLs: SitemapURL[] = seoRoutes.map(route => ({
    loc: `/${route}`,
    lastmod: today,
    changefreq: 'daily' as const,
    priority: 0.8 // SEO pages get high priority
  }));

  // Combine static + dynamic routes
  const allURLs = [...STATIC_ROUTES, ...seoURLs];

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const url of allURLs) {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  return xml;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `# Koli One - Bulgarian Car Marketplace
User-agent: *
Allow: /
Allow: /search
Allow: /cars
Allow: /bmw-*
Allow: /audi-*
Allow: /mercedes-*
Allow: /volkswagen-*

Disallow: /admin
Disallow: /api
Disallow: /profile/*/edit
Disallow: /messages
Disallow: /my-listings
Disallow: /my-drafts
Disallow: /dashboard
Disallow: /sell

Sitemap: ${BASE_URL}/sitemap.xml
`;
}
