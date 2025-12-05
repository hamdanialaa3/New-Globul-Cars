// src/utils/sitemapGenerator.ts
// Sitemap Generator for SEO

import { db } from '../firebase/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { logger } from '../services/logger-service';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private static baseUrl = 'https://globulcars.bg';

  /**
   * Generate complete sitemap
   */
  static async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];

    // Add static pages
    urls.push(...this.getStaticPages());

    // Add dynamic pages
    urls.push(...await this.getCarListingPages());
    urls.push(...await this.getVendorPages());
    urls.push(...await this.getCityPages());

    return this.generateXML(urls);
  }

  /**
   * Get static pages
   */
  private static getStaticPages(): SitemapUrl[] {
    return [
      {
        loc: `${this.baseUrl}/`,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/cars`,
        changefreq: 'hourly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/search`,
        changefreq: 'daily',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/sell`,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/about`,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${this.baseUrl}/contact`,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${this.baseUrl}/terms`,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        loc: `${this.baseUrl}/privacy`,
        changefreq: 'yearly',
        priority: 0.3
      }
    ];
  }

  /**
   * Get car listing pages
   */
  private static async getCarListingPages(): Promise<SitemapUrl[]> {
    try {
      const carsRef = collection(db, 'cars');
      const q = query(carsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          loc: `${this.baseUrl}/cars/${doc.id}`,
          lastmod: data.updatedAt?.toDate().toISOString().split('T')[0],
          changefreq: 'weekly' as const,
          priority: 0.7
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('[SITEMAP] Error fetching car listings', error as Error);
      }
      return [];
    }
  }

  /**
   * Get vendor pages
   */
  private static async getVendorPages(): Promise<SitemapUrl[]> {
    try {
      const vendorsRef = collection(db, 'users');
      const q = query(vendorsRef, where('role', '==', 'vendor'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        loc: `${this.baseUrl}/vendors/${doc.id}`,
        changefreq: 'weekly' as const,
        priority: 0.6
      }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('[SITEMAP] Error fetching vendors', error as Error);
      }
      return [];
    }
  }

  /**
   * Get city pages
   */
  private static async getCityPages(): Promise<SitemapUrl[]> {
    const cities = [
      'sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 
      'stara-zagora', 'pleven', 'sliven', 'dobrich', 'shumen'
    ];

    return cities.map(city => ({
      loc: `${this.baseUrl}/cars/city/${city}`,
      changefreq: 'daily' as const,
      priority: 0.7
    }));
  }

  /**
   * Generate XML sitemap
   */
  private static generateXML(urls: SitemapUrl[]): string {
    const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }
}

export default SitemapGenerator;
