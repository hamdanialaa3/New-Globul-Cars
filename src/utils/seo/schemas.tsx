/**
 * schemas.tsx
 * 🎯 JSON-LD Schema Generators for Rich Snippets
 * 
 * Schemas supported:
 * - Organization
 * - WebSite (with SearchAction)
 * - Article/BlogPosting
 * - Product (Car Listing)
 * - FAQPage
 * - BreadcrumbList
 * - Review
 * - LocalBusiness (Dealer)
 * 
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data/search-gallery
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CarProductSchema {
    id: string;
    name: string;
    description: string;
    price: number;
    currency?: string;
    image: string[];
    brand: string;
    model: string;
    year: number;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    condition?: 'new' | 'used';
    availability?: 'in stock' | 'out of stock';
    seller?: {
        name: string;
        url?: string;
    };
}

export interface ArticleSchema {
    title: string;
    description: string;
    image: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    url: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface BreadcrumbItem {
    name: string;
    url: string;
}

export interface DealerSchema {
    name: string;
    description: string;
    image: string;
    address?: {
        street: string;
        city: string;
        region: string;
        postalCode: string;
        country: string;
    };
    phone?: string;
    email?: string;
    url?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SITE_NAME = 'Koli One';
const SITE_URL = 'https://koli.one';
const LOGO_URL = `${SITE_URL}/images/logo.png`;

// ============================================================================
// SCHEMA GENERATORS
// ============================================================================

/**
 * Organization Schema
 * For the main website identity
 */
export const generateOrganizationSchema = () => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: LOGO_URL,
        description: 'Платформа за търговия с автомобили в България - най-модерният пазар за нови и употребявани коли',
        sameAs: [
            'https://www.facebook.com/koli.one/',
            'https://www.instagram.com/kolione/',
            'https://www.tiktok.com/@mobilebg.eu',
            'https://www.threads.com/@kolione',
            'https://www.linkedin.com/in/koli-one-a011993a9/',
            'https://www.youtube.com/@Kolionebg',
            'https://x.com/kolionebg',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            telephone: '+359879839671',
            email: 'support@koli.one',
            areaServed: 'BG',
            availableLanguage: ['Bulgarian', 'English']
        }
    };
};

/**
 * WebSite Schema with SearchAction
 * Enables search box in Google results
 */
export const generateWebSiteSchema = () => {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: 'Платформа за търговия с автомобили в България',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };
};

/**
 * Product Schema for Car Listings
 * Enables rich product snippets with price, rating, etc.
 */
export const generateCarProductSchema = (car: CarProductSchema) => {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${SITE_URL}/car/${car.id}`,
        name: car.name,
        description: car.description,
        image: car.image,
        brand: {
            '@type': 'Brand',
            name: car.brand
        },
        model: car.model,
        productionDate: car.year.toString(),
        offers: {
            '@type': 'Offer',
            price: car.price,
            priceCurrency: car.currency || 'BGN',
            availability: car.availability === 'in stock' 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
            url: `${SITE_URL}/car/${car.id}`,
            seller: {
                '@type': 'Organization',
                name: car.seller?.name || SITE_NAME,
                url: car.seller?.url || SITE_URL
            }
        }
    };

    // Add vehicle-specific data
    if (car.mileage) {
        schema.mileageFromOdometer = {
            '@type': 'QuantitativeValue',
            value: car.mileage,
            unitCode: 'KMT'
        };
    }

    if (car.fuelType) {
        schema.fuelType = car.fuelType;
    }

    if (car.transmission) {
        schema.vehicleTransmission = car.transmission;
    }

    if (car.condition) {
        schema.itemCondition = car.condition === 'new' 
            ? 'https://schema.org/NewCondition' 
            : 'https://schema.org/UsedCondition';
    }

    return schema;
};

/**
 * Article Schema for Blog Posts
 */
export const generateArticleSchema = (article: ArticleSchema) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: article.image,
        author: {
            '@type': 'Person',
            name: article.author
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: LOGO_URL
            }
        },
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': article.url
        }
    };
};

/**
 * FAQ Schema
 * Displays FAQ accordion in Google search results
 */
export const generateFAQSchema = (faqs: FAQItem[]) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };
};

/**
 * BreadcrumbList Schema
 * Shows breadcrumb navigation in search results
 */
export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };
};

/**
 * LocalBusiness Schema for Dealers
 */
export const generateDealerSchema = (dealer: DealerSchema) => {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: dealer.name,
        description: dealer.description,
        image: dealer.image,
        url: dealer.url || SITE_URL
    };

    if (dealer.address) {
        schema.address = {
            '@type': 'PostalAddress',
            streetAddress: dealer.address.street,
            addressLocality: dealer.address.city,
            addressRegion: dealer.address.region,
            postalCode: dealer.address.postalCode,
            addressCountry: dealer.address.country
        };
    }

    if (dealer.phone) {
        schema.telephone = dealer.phone;
    }

    if (dealer.email) {
        schema.email = dealer.email;
    }

    return schema;
};

/**
 * Aggregate Rating Schema
 */
export const generateAggregateRatingSchema = (
    itemName: string,
    ratingValue: number,
    reviewCount: number,
    bestRating: number = 5
) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'AggregateRating',
        itemReviewed: {
            '@type': 'Product',
            name: itemName
        },
        ratingValue: ratingValue,
        reviewCount: reviewCount,
        bestRating: bestRating
    };
};

/**
 * Multiple schemas combiner
 * Use this to add multiple schemas to one page
 */
export const combineSchemas = (...schemas: object[]) => {
    return schemas.filter(Boolean);
};
