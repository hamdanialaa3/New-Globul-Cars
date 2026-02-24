/**
 * Sitemap Generator Service
 * Generates dynamic XML sitemap for Google and other search engines
 * Usage: Run this script during build phase or call generateSitemap() at runtime
 */

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * تعريف المسارات الثابتة والديناميكية للموقع
 * Define all website routes with their metadata
 */
export const STATIC_ROUTES: SitemapEntry[] = [
  // Main Pages
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/cars', changefreq: 'daily', priority: 0.9 },
  { loc: '/search', changefreq: 'daily', priority: 0.9 },
  { loc: '/advisor', changefreq: 'daily', priority: 0.8 },
  { loc: '/valuation', changefreq: 'daily', priority: 0.8 },
  { loc: '/history', changefreq: 'daily', priority: 0.8 },
  
  // Blog & Content
  { loc: '/blog', changefreq: 'daily', priority: 0.7 },
  { loc: '/blog/ai-valuation-deep-dive', changefreq: 'monthly', priority: 0.7 },
  { loc: '/blog/bulgarian-car-market-2026', changefreq: 'monthly', priority: 0.7 },
  { loc: '/blog/marketplace-comparison-2026', changefreq: 'monthly', priority: 0.7 },
  { loc: '/blog/hybrid-search-deep-dive', changefreq: 'monthly', priority: 0.7 },
  { loc: '/blog/neural-pricing-deep-dive', changefreq: 'monthly', priority: 0.7 },
  
  // Marketplace
  { loc: '/marketplace', changefreq: 'daily', priority: 0.8 },
  { loc: '/cart', changefreq: 'never', priority: 0.5 },
  
  // Browse & Filters
  { loc: '/all-cars', changefreq: 'daily', priority: 0.8 },
  { loc: '/top-brands', changefreq: 'weekly', priority: 0.7 },
  { loc: '/dealers', changefreq: 'weekly', priority: 0.7 },
  { loc: '/brand-gallery', changefreq: 'weekly', priority: 0.7 },
  { loc: '/new-cars', changefreq: 'weekly', priority: 0.8 },
  { loc: '/accident-cars', changefreq: 'weekly', priority: 0.7 },
  
  // Financing
  { loc: '/financing', changefreq: 'weekly', priority: 0.7 },
  { loc: '/financing/compare', changefreq: 'weekly', priority: 0.7 },
  { loc: '/finance', changefreq: 'weekly', priority: 0.7 },
  
  // Legal & Info
  { loc: '/privacy-policy', changefreq: 'monthly', priority: 0.5 },
  { loc: '/terms-of-service', changefreq: 'monthly', priority: 0.5 },
  { loc: '/cookie-policy', changefreq: 'monthly', priority: 0.5 },
  { loc: '/about', changefreq: 'monthly', priority: 0.6 },
  { loc: '/contact', changefreq: 'monthly', priority: 0.6 },
  { loc: '/help', changefreq: 'monthly', priority: 0.6 },
  { loc: '/why-us', changefreq: 'monthly', priority: 0.6 },
  
  // Auth Pages (noindex should be set separately in robots.txt)
  // { loc: '/login', changefreq: 'never', priority: 0.3 },
  // { loc: '/register', changefreq: 'never', priority: 0.3 },
];

/**
 * Generate XML sitemap string
 * @param entries Array of sitemap entries
 * @returns XML string
 */
export const generateSitemapXML = (entries: SitemapEntry[]): string => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://koli-one.com';
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  entries.forEach((entry) => {
    const lastmod = entry.lastmod || today;
    const changefreq = entry.changefreq || 'monthly';
    const priority = entry.priority ?? 0.5;

    xml += `
  <url>
    <loc>${encodeURI(baseUrl + entry.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
};

/**
 * Generate sitemap index for multiple sitemaps (if needed)
 * @param sitemapUrls Array of sitemap URLs
 * @returns XML string
 */
export const generateSitemapIndex = (sitemapUrls: string[]): string => {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  sitemapUrls.forEach((url) => {
    xml += `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
  });

  xml += `
</sitemapindex>`;

  return xml;
};

/**
 * Generate dynamic entries for cars, blogs, and locations
 * Should be called with data from database or API
 */
export const generateDynamicSitemapEntries = (dynamicData: {
  cars?: Array<{ id: string; lastUpdated?: Date }>;
  blogPosts?: Array<{ slug: string; lastUpdated?: Date }>;
  locations?: Array<{ slug: string }>;
  brands?: Array<{ slug: string }>;
  dealers?: Array<{ id: string; lastUpdated?: Date }>;
}): SitemapEntry[] => {
  const entries: SitemapEntry[] = [];

  // Add car listing pages
  if (dynamicData.cars) {
    dynamicData.cars.forEach((car) => {
      entries.push({
        loc: `/car/${car.id}`,
        lastmod: car.lastUpdated ? car.lastUpdated.toISOString().split('T')[0] : undefined,
        changefreq: 'weekly',
        priority: 0.8,
      });
    });
  }

  // Add blog post pages
  if (dynamicData.blogPosts) {
    dynamicData.blogPosts.forEach((post) => {
      entries.push({
        loc: `/blog/${post.slug}`,
        lastmod: post.lastUpdated ? post.lastUpdated.toISOString().split('T')[0] : undefined,
        changefreq: 'monthly',
        priority: 0.7,
      });
    });
  }

  // Add location-based pages (e.g., /cars/sofia, /cars/plovdiv)
  if (dynamicData.locations) {
    dynamicData.locations.forEach((location) => {
      entries.push({
        loc: `/location/${location.slug}`,
        changefreq: 'daily',
        priority: 0.8,
      });

      // Brand + Location combinations (high-value SEO pages)
      if (dynamicData.brands) {
        dynamicData.brands.slice(0, 20).forEach((brand) => {
          entries.push({
            loc: `/cars/${location.slug}/${brand.slug}`,
            changefreq: 'daily',
            priority: 0.7,
          });
        });
      }
    });
  }

  // Add brand pages
  if (dynamicData.brands) {
    dynamicData.brands.forEach((brand) => {
      entries.push({
        loc: `/brand/${brand.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    });
  }

  // Add dealer pages
  if (dynamicData.dealers) {
    dynamicData.dealers.forEach((dealer) => {
      entries.push({
        loc: `/dealer/${dealer.id}`,
        lastmod: dealer.lastUpdated ? dealer.lastUpdated.toISOString().split('T')[0] : undefined,
        changefreq: 'weekly',
        priority: 0.6,
      });
    });
  }

  return entries;
};

/**
 * Combine static and dynamic entries
 */
export const generateCompleteSitemap = (dynamicData?: Parameters<typeof generateDynamicSitemapEntries>[0]): string => {
  let allEntries = [...STATIC_ROUTES];

  if (dynamicData) {
    allEntries = allEntries.concat(generateDynamicSitemapEntries(dynamicData));
  }

  // Remove duplicates
  const uniqueEntries = Array.from(
    new Map(allEntries.map((entry) => [entry.loc, entry])).values()
  );

  return generateSitemapXML(uniqueEntries);
};

export default {
  generateSitemapXML,
  generateSitemapIndex,
  generateDynamicSitemapEntries,
  generateCompleteSitemap,
  STATIC_ROUTES,
};
