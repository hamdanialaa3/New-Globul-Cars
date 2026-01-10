/**
 * SitemapFactory.ts
 * 🗺️ Programmatic SEO - Dynamic Sitemap Generation
 * 
 * Generates sitemaps for:
 * - Static pages (home, about, contact)
 * - Dynamic car listings (/car/80/5)
 * - Location pages (/cars/sofia, /cars/varna)
 * - Brand + Location pages (/cars/sofia/bmw)
 * - Brand + Model + Location (/cars/sofia/bmw/x5)
 * - Fuel + Price combos (/cars/varna/diesel/under-5000)
 * - Dealer profiles (/profile/18)
 * 
 * @author SEO Supremacy System
 */

import * as admin from 'firebase-admin';

// ============================================================================
// TYPES
// ============================================================================

interface SitemapURL {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    images?: Array<{
        loc: string;
        title?: string;
        caption?: string;
    }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SITE_URL = 'https://mobilebg.eu';

const BULGARIAN_CITIES = [
    { slug: 'sofia', name: 'София', priority: 1.0 },
    { slug: 'plovdiv', name: 'Пловдив', priority: 0.9 },
    { slug: 'varna', name: 'Варна', priority: 0.9 },
    { slug: 'burgas', name: 'Бургас', priority: 0.8 },
    { slug: 'ruse', name: 'Русе', priority: 0.7 },
    { slug: 'stara-zagora', name: 'Стара Загора', priority: 0.7 },
    { slug: 'pleven', name: 'Плевен', priority: 0.6 },
    { slug: 'sliven', name: 'Сливен', priority: 0.6 },
    { slug: 'dobrich', name: 'Добрич', priority: 0.5 },
    { slug: 'shumen', name: 'Шумен', priority: 0.5 },
];

const TOP_BRANDS = [
    'audi', 'bmw', 'mercedes', 'volkswagen', 'opel', 'ford', 'toyota',
    'peugeot', 'renault', 'skoda', 'hyundai', 'kia', 'nissan', 'honda',
    'mazda', 'lexus', 'volvo', 'porsche', 'jaguar', 'landrover', 'jeep'
];

const FUEL_TYPES = [
    { slug: 'diesel', name: 'дизел' },
    { slug: 'petrol', name: 'бензин' },
    { slug: 'electric', name: 'електрически' },
    { slug: 'hybrid', name: 'хибрид' },
    { slug: 'lpg', name: 'газ' },
];

const PRICE_RANGES = [
    { slug: 'under-5000', max: 5000 },
    { slug: 'under-10000', max: 10000 },
    { slug: 'under-20000', max: 20000 },
    { slug: 'under-30000', max: 30000 },
    { slug: 'under-50000', max: 50000 },
    { slug: 'luxury', max: 999999 },
];

// ============================================================================
// SITEMAP FACTORY
// ============================================================================

export class SitemapFactory {
    private db: admin.firestore.Firestore;

    constructor() {
        this.db = admin.firestore();
    }

    /**
     * Generate complete sitemap index (points to sub-sitemaps)
     */
    async generateSitemapIndex(): Promise<string> {
        const today = new Date().toISOString().split('T')[0];

        const sitemaps = [
            `${SITE_URL}/sitemap-static.xml`,
            `${SITE_URL}/sitemap-cars.xml`,
            `${SITE_URL}/sitemap-locations.xml`,
            `${SITE_URL}/sitemap-brands.xml`,
            `${SITE_URL}/sitemap-dealers.xml`,
        ];

        return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
    }

    /**
     * Generate static pages sitemap
     */
    generateStaticSitemap(): string {
        const today = new Date().toISOString().split('T')[0];

        const staticPages: SitemapURL[] = [
            { loc: '/', priority: 1.0, changefreq: 'daily' },
            { loc: '/cars', priority: 0.9, changefreq: 'hourly' },
            { loc: '/sell/auto', priority: 0.8, changefreq: 'weekly' },
            { loc: '/advanced-search', priority: 0.8, changefreq: 'weekly' },
            { loc: '/dealers', priority: 0.7, changefreq: 'daily' },
            { loc: '/about', priority: 0.5, changefreq: 'monthly' },
            { loc: '/contact', priority: 0.5, changefreq: 'monthly' },
            { loc: '/privacy', priority: 0.3, changefreq: 'yearly' },
            { loc: '/terms', priority: 0.3, changefreq: 'yearly' },
        ];

        return this.buildSitemapXML(staticPages, today);
    }

    /**
     * Generate car listings sitemap (dynamic)
     */
    async generateCarsSitemap(): Promise<string> {
        const cars = await this.fetchActiveCars(1000); // Limit to 1000 per sitemap
        const today = new Date().toISOString().split('T')[0];

        const urls: SitemapURL[] = cars.map(car => ({
            loc: `/car/${car.sellerNumericId}/${car.carNumericId}`,
            lastmod: car.updatedAt || today,
            changefreq: 'weekly' as const,
            priority: 0.8,
            images: car.images?.slice(0, 5).map((img: string) => ({
                loc: img,
                title: `${car.make} ${car.model} ${car.year}`,
            })),
        }));

        return this.buildSitemapXML(urls, today, true);
    }

    /**
     * Generate location-based landing pages sitemap
     * These are the "Long-Tail Trap" pages
     */
    generateLocationsSitemap(): string {
        const today = new Date().toISOString().split('T')[0];
        const urls: SitemapURL[] = [];

        // City pages
        for (const city of BULGARIAN_CITIES) {
            urls.push({
                loc: `/cars/${city.slug}`,
                priority: city.priority * 0.9,
                changefreq: 'daily',
            });

            // City + Brand pages
            for (const brand of TOP_BRANDS) {
                urls.push({
                    loc: `/cars/${city.slug}/${brand}`,
                    priority: city.priority * 0.7,
                    changefreq: 'daily',
                });
            }

            // City + Fuel + Price pages (programmatic SEO gold)
            for (const fuel of FUEL_TYPES) {
                for (const price of PRICE_RANGES) {
                    urls.push({
                        loc: `/cars/${city.slug}/${fuel.slug}/${price.slug}`,
                        priority: 0.5,
                        changefreq: 'weekly',
                    });
                }
            }
        }

        return this.buildSitemapXML(urls, today);
    }

    /**
     * Generate brand pages sitemap
     */
    generateBrandsSitemap(): string {
        const today = new Date().toISOString().split('T')[0];
        const urls: SitemapURL[] = [];

        for (const brand of TOP_BRANDS) {
            // Brand main page
            urls.push({
                loc: `/brand/${brand}`,
                priority: 0.8,
                changefreq: 'daily',
            });

            // Brand + City
            for (const city of BULGARIAN_CITIES.slice(0, 4)) { // Top 4 cities
                urls.push({
                    loc: `/brand/${brand}/${city.slug}`,
                    priority: 0.7,
                    changefreq: 'daily',
                });
            }
        }

        return this.buildSitemapXML(urls, today);
    }

    /**
     * Generate dealers sitemap
     */
    async generateDealersSitemap(): Promise<string> {
        const dealers = await this.fetchDealers(500);
        const today = new Date().toISOString().split('T')[0];

        const urls: SitemapURL[] = dealers.map(dealer => ({
            loc: `/profile/${dealer.numericId}`,
            lastmod: dealer.updatedAt || today,
            changefreq: 'weekly' as const,
            priority: dealer.profileType === 'dealer' ? 0.8 : 0.6,
        }));

        return this.buildSitemapXML(urls, today);
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private buildSitemapXML(urls: SitemapURL[], date: string, includeImages = false): string {
        const urlElements = urls.map(url => {
            let imageXml = '';
            if (includeImages && url.images?.length) {
                imageXml = url.images.map(img => `
      <image:image>
        <image:loc>${this.escapeXml(img.loc)}</image:loc>
        ${img.title ? `<image:title>${this.escapeXml(img.title)}</image:title>` : ''}
      </image:image>`).join('');
            }

            return `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${url.lastmod || date}</lastmod>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
    <priority>${url.priority || 0.5}</priority>${imageXml}
  </url>`;
        }).join('\n');

        const imageNamespace = includeImages
            ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
            : '';

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNamespace}>
${urlElements}
</urlset>`;
    }

    private escapeXml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    private async fetchActiveCars(limit: number): Promise<any[]> {
        const collections = ['cars', 'passenger_cars', 'suvs', 'vans'];
        const allCars: any[] = [];

        for (const col of collections) {
            const snapshot = await this.db.collection(col)
                .where('isActive', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(Math.floor(limit / collections.length))
                .get();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                allCars.push({
                    ...data,
                    sellerNumericId: data.sellerNumericId || 0,
                    carNumericId: data.carNumericId || 0,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString().split('T')[0],
                });
            });
        }

        return allCars;
    }

    private async fetchDealers(limit: number): Promise<any[]> {
        const snapshot = await this.db.collection('users')
            .where('profileType', 'in', ['dealer', 'company'])
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            ...doc.data(),
            numericId: doc.data().numericId || 0,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString().split('T')[0],
        }));
    }
}

export default SitemapFactory;
