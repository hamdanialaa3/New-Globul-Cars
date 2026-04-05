// src/services/seo/seo-prerender.service.ts
// SEO Prerendering Service - خدمة Prerendering للSEO
// الهدف: توليد محتوى SEO محسّن للمحركات البحثية
// الموقع: بلغاريا | اللغات: BG/EN

import { serviceLogger } from '../logger-service';

// ==================== TYPES ====================

export interface SEOPrerenderData {
  title: string;
  description: string;
  keywords: string[];
  structuredData: object;
  htmlContent: string;
  canonicalUrl: string;
}

export interface CityPageData {
  city: string;
  cityBg: string;
  totalCars: number;
  avgPrice: number;
  popularBrands: string[];
  region: string;
}

// ==================== SERVICE CLASS ====================

/**
 * SEO Prerender Service
 * خدمة توليد محتوى SEO محسّن
 */
export class SEOPrerenderService {
  private static instance: SEOPrerenderService;

  private constructor() {}

  public static getInstance(): SEOPrerenderService {
    if (!SEOPrerenderService.instance) {
      SEOPrerenderService.instance = new SEOPrerenderService();
    }
    return SEOPrerenderService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Generate Bulgarian Structured Data for Car
   * توليد Structured Data بلغاري للسيارة
   */
  generateCarStructuredData(car: {
    make: string;
    model: string;
    year: number;
    price: number;
    location: string;
    description?: string;
    imageUrl?: string;
    fuelType?: string;
    mileage?: number;
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Car',
      name: `${car.make} ${car.model} ${car.year}`,
      description:
        car.description ||
        `${car.make} ${car.model} ${car.year} - Продажба в България`,
      brand: {
        '@type': 'Brand',
        name: car.make,
      },
      model: car.model,
      productionDate: `${car.year}-01-01`,
      countryOfAssembly: 'Bulgaria',
      purchaseLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'BG',
          addressLocality: car.location,
        },
      },
      offers: {
        '@type': 'Offer',
        price: car.price,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `https://koli.one`, // Canonical URL requires numeric IDs; use site root as fallback
      },
      ...(car.imageUrl && {
        image: car.imageUrl,
      }),
      ...(car.fuelType && {
        fuelType: this.mapFuelTypeToSchema(car.fuelType),
      }),
      ...(car.mileage && {
        mileageFromOdometer: {
          '@type': 'QuantitativeValue',
          value: car.mileage,
          unitCode: 'KMT',
        },
      }),
    };
  }

  /**
   * Generate City Page Structured Data
   * توليد Structured Data لصفحة المدينة
   */
  generateCityPageStructuredData(cityData: CityPageData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Продажба на коли в ${cityData.cityBg}`,
      description: `Намерете идеалния автомобил в ${cityData.cityBg}. Над ${cityData.totalCars} обяви от частни лица, автосалони и компании.`,
      url: `https://koli.one/koli/${cityData.city.toLowerCase()}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: cityData.totalCars,
        itemListElement: cityData.popularBrands.map((brand, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: brand,
          },
        })),
      },
      about: {
        '@type': 'Place',
        name: cityData.cityBg,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'BG',
          addressRegion: cityData.region,
          addressLocality: cityData.cityBg,
        },
      },
    };
  }

  /**
   * Generate SEO content for city page
   * توليد محتوى SEO لصفحة المدينة
   */
  generateCityPageSEO(cityData: CityPageData): SEOPrerenderData {
    const title = `Продажба на коли в ${cityData.cityBg} - Koli One`;
    const description = `Намерете идеалния автомобил в ${cityData.cityBg}. Над ${cityData.totalCars} обяви от частни лица, автосалони и компании. Средна цена: ${cityData.avgPrice} лв. Българска платформа за българските автомобилисти. Проверени продавачи, прозрачни цени, лесно справяне.`;

    const keywords = [
      `коли ${cityData.cityBg}`,
      `продажба коли ${cityData.cityBg}`,
      `автомобили ${cityData.cityBg}`,
      'коли втора употреба',
      'автокъща българия',
      ...cityData.popularBrands.map(brand => `${brand} ${cityData.cityBg}`),
    ];

    const structuredData = this.generateCityPageStructuredData(cityData);

    const htmlContent = this.generateCityPageHTML(cityData);

    return {
      title,
      description,
      keywords,
      structuredData,
      htmlContent,
      canonicalUrl: `https://koli.one/koli/${cityData.city.toLowerCase()}`,
    };
  }

  /**
   * Check if URL should be prerendered
   * التحقق إذا كان يجب Prerender للـ URL
   */
  isPrerenderable(url: string): boolean {
    const prerenderablePatterns = [
      '/koli/',
      '/car/',
      '/avtosalon',
      '/blog/',
      '/ceni-na-koli',
    ];

    return prerenderablePatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Generate meta tags HTML
   * توليد HTML لـ Meta Tags
   */
  generateMetaTagsHTML(data: SEOPrerenderData): string {
    const keywordsString = data.keywords.join(', ');

    return `
      <title>${data.title}</title>
      <meta name="description" content="${data.description}" />
      <meta name="keywords" content="${keywordsString}" />
      <link rel="canonical" href="${data.canonicalUrl}" />
      
      <!-- Open Graph -->
      <meta property="og:title" content="${data.title}" />
      <meta property="og:description" content="${data.description}" />
      <meta property="og:url" content="${data.canonicalUrl}" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="bg_BG" />
      
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${data.title}" />
      <meta name="twitter:description" content="${data.description}" />
      
      <!-- Structured Data -->
      <script type="application/ld+json">
        ${JSON.stringify(data.structuredData, null, 2)}
      </script>
    `;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Generate HTML content for city page
   */
  private generateCityPageHTML(cityData: CityPageData): string {
    return `
      <div class="city-page-seo-content">
        <h1>Продажба на коли в ${cityData.cityBg}</h1>
        <p>${cityData.cityBg} е един от най-активните пазари за автомобили в България. На нашата платформа можете да намерите над ${cityData.totalCars} обяви за коли втора употреба, нови автомобили и специални оферти.</p>
        
        <h2>Статистика на пазара в ${cityData.cityBg}</h2>
        <ul>
          <li>Общо обяви: ${cityData.totalCars} коли</li>
          <li>Средна цена: ${cityData.avgPrice} лева</li>
          <li>Популярни марки: ${cityData.popularBrands.join(', ')}</li>
        </ul>
        
        <h2>Съвети за купувачи</h2>
        <p>Автомобилите в ${cityData.cityBg} често са по-добре поддържани поради наличието на сервизи. Препоръчваме ви да проверите сервизната история внимателно преди покупка.</p>
        
        <h2>Съвети за продавачи</h2>
        <p>Цените в ${cityData.cityBg} са с 5-10% по-високи от провинцията. Вземете това предвид при определяне на цената на вашия автомобил.</p>
      </div>
    `;
  }

  /**
   * Map fuel type to Schema.org format
   */
  private mapFuelTypeToSchema(fuelType: string): string {
    const mapping: Record<string, string> = {
      petrol: 'https://schema.org/Gasoline',
      diesel: 'https://schema.org/DieselFuel',
      electric: 'https://schema.org/Electric',
      hybrid: 'https://schema.org/Electric',
      lpg: 'https://schema.org/Gasoline',
    };
    return mapping[fuelType.toLowerCase()] || 'https://schema.org/Gasoline';
  }
}

// Export singleton instance
export const seoPrerenderService = SEOPrerenderService.getInstance();
