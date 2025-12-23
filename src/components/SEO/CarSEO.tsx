// src/components/SEO/CarSEO.tsx
/**
 * CarSEO Component - Professional SEO for Car Listings
 * 
 * Implements:
 * - JSON-LD structured data (Schema.org/Car)
 * - Open Graph tags for social media
 * - Twitter Cards for Twitter sharing
 * - Canonical URLs with numeric IDs
 * - Rich snippets for Google Search
 * 
 * Ensures 100% Google compliance and zero duplication
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { buildCarUrl } from '@/utils/numeric-url-helpers';

interface CarSEOProps {
  car: {
    id: string;
    sellerNumericId: number;
    carNumericId: number;
    make: string;
    model: string;
    year: number;
    price: number;
    currency?: string;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    engineSize?: number;
    horsePower?: number;
    description?: string;
    images?: string[];
    location?: string;
    vin?: string;
    createdAt?: any;
    updatedAt?: any;
  };
  seller?: {
    name?: string;
    profileType?: 'private' | 'dealer' | 'company';
  };
}

/**
 * CarSEO Component
 * 
 * @example
 * <CarSEO 
 *   car={car} 
 *   seller={seller}
 * />
 */
export const CarSEO: React.FC<CarSEOProps> = ({ car, seller }) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://mobilebg.eu';

  // Generate numeric URL (CRITICAL for Google Merchant Center & Ads)
  const canonicalUrl = `${baseUrl}${buildCarUrl(
    car.sellerNumericId,
    car.carNumericId
  )}`;

  // SEO-friendly title with all critical info
  const title = `${car.year} ${car.make} ${car.model} - ${car.price}€${car.location ? ` - ${car.location}` : ''} | Bulgarski Mobili`;

  // Meta description with key specs
  const description = car.description
    ? car.description.slice(0, 155) + (car.description.length > 155 ? '...' : '')
    : `${car.year} ${car.make} ${car.model} на ${car.price}€. ${car.mileage ? `${car.mileage}км, ` : ''}${car.fuelType || ''} ${car.transmission || ''}. Проверени обяви на Bulgarski Mobili.`;

  // Primary image with fallback
  const primaryImage = car.images?.[0] || `${baseUrl}/default-car.jpg`;
  const fullImageUrl = primaryImage.startsWith('http') ? primaryImage : `${baseUrl}${primaryImage}`;

  // Keywords for SEO
  const keywords = [
    car.make,
    car.model,
    car.year.toString(),
    car.fuelType,
    car.transmission,
    car.location,
    'автомобил България',
    'кола втора ръка',
    'продажба автомобил'
  ].filter(Boolean).join(', ');

  // Convert Firestore timestamp to ISO string
  const getISODate = (timestamp: any): string => {
    if (!timestamp) return new Date().toISOString();
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    if (timestamp instanceof Date) return timestamp.toISOString();
    return new Date().toISOString();
  };

  const publishedTime = getISODate(car.createdAt);
  const modifiedTime = getISODate(car.updatedAt);

  // JSON-LD Structured Data (Schema.org/Car)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${car.year} ${car.make} ${car.model}`,
    description: description,
    image: car.images || [fullImageUrl],
    url: canonicalUrl,

    // Brand
    brand: {
      '@type': 'Brand',
      name: car.make
    },

    // Model
    model: car.model,

    // Production year
    productionDate: car.year.toString(),

    // VIN (Trust Signal)
    ...(car.vin && {
      vehicleIdentificationNumber: car.vin
    }),

    // Mileage (in kilometers)
    ...(car.mileage && {
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: car.mileage,
        unitCode: 'KMT' // kilometers
      }
    }),

    // Engine
    ...(car.engineSize && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        ...(car.fuelType && { fuelType: car.fuelType }),
        ...(car.engineSize && {
          engineDisplacement: {
            '@type': 'QuantitativeValue',
            value: car.engineSize,
            unitCode: 'CMQ' // cubic centimeters
          }
        }),
        ...(car.horsePower && {
          enginePower: {
            '@type': 'QuantitativeValue',
            value: car.horsePower,
            unitCode: 'BHP' // brake horsepower
          }
        })
      }
    }),

    // Transmission
    ...(car.transmission && {
      vehicleTransmission: car.transmission
    }),

    // Offer (Price)
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: car.currency || 'EUR',
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
      ...(seller && {
        seller: {
          '@type': seller.profileType === 'company' ? 'Organization' : 'Person',
          name: seller.name || 'Продавач'
        }
      })
    }
  };

  // Additional Product structured data for Google Merchant Center
  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${car.year} ${car.make} ${car.model}`,
    description: description,
    image: car.images || [fullImageUrl],
    url: canonicalUrl,
    brand: {
      '@type': 'Brand',
      name: car.make
    },
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: car.currency || 'EUR',
      availability: 'https://schema.org/InStock',
      url: canonicalUrl
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL (CRITICAL - prevents duplicate content issues) */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="bg_BG" />
      <meta property="og:site_name" content="Bulgarski Mobili" />
      <meta property="product:price:amount" content={car.price.toString()} />
      <meta property="product:price:currency" content={car.currency || 'EUR'} />

      {/* Twitter Card */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Article (for content freshness) */}
      <meta property="article:published_time" content={publishedTime} />
      <meta property="article:modified_time" content={modifiedTime} />

      {/* JSON-LD Structured Data (Car Schema) */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* JSON-LD Structured Data (Product Schema for Merchant Center) */}
      <script type="application/ld+json">
        {JSON.stringify(productData)}
      </script>
    </Helmet>
  );
};

export default CarSEO;
