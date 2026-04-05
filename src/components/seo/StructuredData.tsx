import React from 'react';

/** Minimal car fields needed for Schema.org structured data output. */
interface Car {
    make?: string;
    brand?: string;  // legacy alias – prefer make
    model: string;
    year: number;
    price: number;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    color?: string;
    variant?: string;
    condition?: string;
    isSold?: boolean;
    images?: string[];
    description?: string;
    doors?: string | number;
    engineSize?: number;
    // Constitution-compliant numeric IDs (no Firebase UIDs in URLs)
    sellerNumericId?: number;
    carNumericId?: number;
    numericId?: number;
}

interface CarStructuredDataProps {
    car: Car;
    sellerName?: string;
    sellerRating?: number;
}

/**
 * Structured Data component for Car listings
 * Implements schema.org/Car for better SEO
 */
export const CarStructuredData: React.FC<CarStructuredDataProps> = ({
    car,
    sellerName,
    sellerRating
}) => {
    const schema = {
        "@context": "https://schema.org/",
        "@type": "Car",
        "name": `${car.make ?? car.brand} ${car.model} ${car.year}`,
        "brand": {
            "@type": "Brand",
            "name": car.make ?? car.brand
        },
        "model": car.model,
        "vehicleModelDate": car.year,
        "mileageFromOdometer": {
            "@type": "QuantitativeValue",
            "value": car.mileage,
            "unitCode": "KMT"
        },
        "fuelType": car.fuelType,
        "vehicleTransmission": car.transmission,
        "color": car.color,
        "offers": {
            "@type": "Offer",
            "price": car.price,
            "priceCurrency": "EUR",
            "availability": car.isSold
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            "seller": sellerName ? {
                "@type": "Person",
                "name": sellerName,
                ...(sellerRating && {
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": sellerRating,
                        "bestRating": 5
                    }
                })
            } : undefined,
            "url": car.sellerNumericId && (car.carNumericId ?? car.numericId)
                ? `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId ?? car.numericId}`
                : undefined
        },
        "image": car.images && car.images.length > 0 ? car.images : undefined,
        "description": car.description,
        "vehicleConfiguration": car.variant,
        "numberOfDoors": car.doors,
        "vehicleEngine": car.engineSize ? {
            "@type": "EngineSpecification",
            "engineDisplacement": {
                "@type": "QuantitativeValue",
                "value": car.engineSize,
                "unitCode": "CMQ"
            }
        } : undefined,
        "itemCondition": car.condition === 'new'
            ? "https://schema.org/NewCondition"
            : "https://schema.org/UsedCondition"
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

interface OrganizationStructuredDataProps {
    name?: string;
    url?: string;
    logo?: string;
}

/**
 * Organization structured data for homepage
 */
export const OrganizationStructuredData: React.FC<OrganizationStructuredDataProps> = ({
    name = "Koli One",
    url = "https://koli.one",
    logo = "https://koli.one/logo.webp"
}) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": ["Organization", "AutoDealer"],
        "name": name,
        "alternateName": "Koli One - Български автомобили",
        "url": url,
        "logo": logo,
        "description": "Bulgaria's leading AI-powered car marketplace. Buy and sell cars with AI-driven pricing, automatic descriptions, smart search, and dealer tools.",
        "slogan": "Bulgaria's AI-Powered Car Marketplace",
        "foundingDate": "2024",
        "areaServed": {
            "@type": "Country",
            "name": "Bulgaria",
            "sameAs": "https://www.wikidata.org/wiki/Q219"
        },
        "availableLanguage": ["Bulgarian", "English"],
        "knowsAbout": [
            "Cars",
            "Automobiles",
            "Car marketplace",
            "AI car valuation",
            "Vehicle trading",
            "Bulgarian automotive market",
            "Used cars Bulgaria",
            "Car price estimation",
            "AI-powered car descriptions"
        ],
        "sameAs": [
            "https://www.facebook.com/koli.one/",
            "https://www.instagram.com/kolione/",
            "https://www.tiktok.com/@koli.one",
            "https://www.threads.com/@kolione",
            "https://www.youtube.com/@Kolionebg",
            "https://www.linkedin.com/in/koli-one-a011993a9/",
            "https://x.com/kolionebg"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@koli.one",
            "availableLanguage": ["Bulgarian", "English"]
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Sofia",
            "addressCountry": "BG"
        },
        "makesOffer": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "AI Car Valuation",
                    "description": "ML-based car price estimation using Bulgarian market data"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Car Listing",
                    "description": "List cars for sale with AI-generated descriptions and smart pricing"
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

interface BreadcrumbStructuredDataProps {
    items: Array<{
        name: string;
        url: string;
    }>;
}

/**
 * Breadcrumb structured data for navigation
 */
export const BreadcrumbStructuredData: React.FC<BreadcrumbStructuredDataProps> = ({ items }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

interface WebSiteStructuredDataProps {
    searchUrl?: string;
}

/**
 * WebSite structured data with search action
 */
export const WebSiteStructuredData: React.FC<WebSiteStructuredDataProps> = ({
    searchUrl = "https://koli.one/cars?search={search_term_string}"
}) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Koli One",
        "url": "https://koli.one",
        "potentialAction": {
            "@type": "SearchAction",
            "target": searchUrl,
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
