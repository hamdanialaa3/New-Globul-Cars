import React from 'react';
import { Car } from '@/types/car.types';

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
        "name": `${car.brand} ${car.model} ${car.year}`,
        "brand": {
            "@type": "Brand",
            "name": car.brand
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
            "url": `https://koli.one/car/${car.sellerId}/${car.numericId}`
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
    logo = "https://koli.one/logo.png"
}) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": name,
        "url": url,
        "logo": logo,
        "sameAs": [
            "https://www.facebook.com/mobilebg",
            "https://www.instagram.com/mobilebg"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "availableLanguage": ["Bulgarian", "English"]
        }
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
