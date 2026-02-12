/**
 * @deprecated Use SchemaGenerator from '@/utils/seo/SchemaGenerator.ts' instead.
 * This file is kept for backward compatibility only.
 * The canonical Schema.org generator is in web/src/utils/seo/SchemaGenerator.ts
 * which supports Vehicle, VideoObject, AutoDealer, Breadcrumb, and FAQ schemas.
 * 
 * Schema.org Structured Data Generator (LEGACY)
 * Generates JSON-LD schemas for better SEO and rich snippets
 */

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  condition: string;
  description: string;
  images: string[];
  // ✅ CONSTITUTION: Numeric IDs for strict URL generation
  sellerNumericId?: number;
  carNumericId?: number;
  locationData?: {
    cityName: { bg: string; en: string };
    region?: string;
  };
  sellerInfo?: {
    name: string;
    type: 'private' | 'dealer' | 'company';
  };
}

interface OrganizationData {
  name: string;
  logo: string;
  url: string;
  description: string;
  address?: string;
  phone?: string;
  email?: string;
}

/**
 * Generate Car (Product) Schema
 * https://schema.org/Car
 */
export const generateCarSchema = (car: CarData, language: 'bg' | 'en' = 'bg') => {
  // ✅ CONSTITUTION: Use numeric URL pattern for SEO
  const carUrl = car.sellerNumericId && car.carNumericId
    ? `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`
    : `https://koli.one/cars`; // Fallback to cars list
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': carUrl,
    name: `${car.make} ${car.model} (${car.year})`,
    description: car.description,
    brand: {
      '@type': 'Brand',
      name: car.make,
    },
    model: car.model,
    vehicleModelDate: car.year,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: car.mileage,
      unitCode: 'KMT', // Kilometers
    },
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    itemCondition: car.condition === 'new' 
      ? 'https://schema.org/NewCondition' 
      : 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      url: carUrl,
      priceCurrency: 'EUR',
      price: car.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': car.sellerInfo?.type === 'dealer' || car.sellerInfo?.type === 'company' 
          ? 'Organization' 
          : 'Person',
        name: car.sellerInfo?.name || 'Private Seller',
      },
    },
    image: car.images.map(img => img),
  };

  // Add location if available
  if (car.locationData) {
    (schema as any).availableAtOrFrom = {
      '@type': 'Place',
      name: language === 'bg' 
        ? car.locationData.cityName.bg 
        : car.locationData.cityName.en,
      address: {
        '@type': 'PostalAddress',
        addressLocality: language === 'bg' 
          ? car.locationData.cityName.bg 
          : car.locationData.cityName.en,
        addressCountry: 'BG',
      },
    };
  }

  return schema;
};

/**
 * Generate Organization Schema
 * https://schema.org/Organization
 */
export const generateOrganizationSchema = (data: OrganizationData) => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: {
      '@type': 'ImageObject',
      url: data.logo,
    },
    description: data.description,
  };

  if (data.address) {
    schema.address = {
      '@type': 'PostalAddress',
      addressCountry: 'BG',
      streetAddress: data.address,
    };
  }

  if (data.phone) {
    schema.telephone = data.phone;
  }

  if (data.email) {
    schema.email = data.email;
  }

  return schema;
};

/**
 * Generate Breadcrumb Schema
 * https://schema.org/BreadcrumbList
 */
export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate Website Schema
 * https://schema.org/WebSite
 */
export const generateWebsiteSchema = (language: 'bg' | 'en' = 'bg') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Koli One',
    url: 'https://koli.one',
    description: language === 'bg' 
      ? 'Купи или продай автомобил в България. Най-голямата платформа за продажба на коли.' 
      : 'Buy or sell a car in Bulgaria. The largest car marketplace platform.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://koli.one/cars?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
};

/**
 * Generate Article Schema (for blog posts)
 * https://schema.org/Article
 */
export const generateArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image: string;
  url: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    image: article.image,
    url: article.url,
    publisher: {
      '@type': 'Organization',
      name: 'Koli One',
      logo: {
        '@type': 'ImageObject',
        url: 'https://koli.one/logo.png',
      },
    },
  };
};

/**
 * Inject JSON-LD schema into page
 */
export const injectSchema = (schema: object) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
  
  return () => {
    document.head.removeChild(script);
  };
};

/**
 * Inject multiple schemas
 */
export const injectSchemas = (schemas: object[]) => {
  const cleanupFunctions = schemas.map(schema => injectSchema(schema));
  
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};
