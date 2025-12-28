// SEO & Meta Tags Utility
// Free SEO optimization for Bulgarian Car Marketplace

import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: 'bg_BG' | 'en_US';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
}

/**
 * SEO Component - Free meta tags optimization
 * Includes Open Graph, Twitter Cards, and Schema.org markup
 * 
 * @example
 * <SEO 
 *   title="2020 BMW X5 - София"
 *   description="Продава се BMW X5 2020г. 50,000км, автоматик, дизел"
 *   image="https://..."
 *   price={35000}
 * />
 */
export const SEO: React.FC<SEOProps> = ({
  title = 'Bulgarski Avtomobili - Най-добрата платформа за автомобили в България',
  description = 'Купувайте и продавайте автомобили в България. Хиляди обяви, проверени продавачи, безплатна регистрация.',
  keywords = 'автомобили България, коли втора ръка, продажба коли, купуване коли, автомобили София',
  image = '/og-image.jpg',
  url,
  type = 'website',
  locale = 'bg_BG',
  author,
  publishedTime,
  modifiedTime,
  price,
  currency = 'EUR',
  availability = 'in stock'
}) => {
  const siteUrl = 'https://mobilebg.eu'; // Update with your domain
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Schema.org JSON-LD for rich snippets (FREE SEO boost!)
  const schemaData = type === 'product' && price ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image: fullImage,
    url: fullUrl,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability.replace(' ', '')}`,
      url: fullUrl
    }
  } : {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bulgarski Mobili',
    url: siteUrl,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags (FREE - Basic SEO) */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {author && <meta name="author" content={author} />}

      {/* Canonical URL (FREE - Prevent duplicate content) */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook (FREE - Social media preview) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Bulgarski Avtomobili" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card (FREE - Twitter preview) */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Schema.org JSON-LD (FREE - Rich snippets in Google) */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      {/* Mobile optimization (FREE) */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#FF8F10" />

      {/* Language alternates (FREE - Multi-language SEO) */}
      <link rel="alternate" hrefLang="bg" href={`${siteUrl}/bg${url || ''}`} />
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en${url || ''}`} />
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />
    </Helmet>
  );
};

/**
 * Generate car listing Schema.org markup
 * FREE - Helps Google show rich results
 */
export const generateCarSchema = (car: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Car',
  name: `${car.year} ${car.make} ${car.model}`,
  description: car.description,
  image: car.images?.[0] || '/default-car.jpg',
  brand: {
    '@type': 'Brand',
    name: car.make
  },
  model: car.model,
  productionDate: car.year.toString(),
  vehicleEngine: {
    '@type': 'EngineSpecification',
    fuelType: car.fuelType,
    engineDisplacement: {
      '@type': 'QuantitativeValue',
      value: car.engineSize,
      unitCode: 'CMQ' // cubic centimeter
    }
  },
  mileageFromOdometer: {
    '@type': 'QuantitativeValue',
    value: car.mileage,
    unitCode: 'KMT' // kilometer
  },
  offers: {
    '@type': 'Offer',
    price: car.price,
    priceCurrency: car.currency || 'EUR',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': car.sellerType === 'dealer' ? 'AutoDealer' : 'Person',
      name: car.sellerName
    }
  }
});

export default SEO;
