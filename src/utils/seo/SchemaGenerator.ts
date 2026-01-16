/**
 * SchemaGenerator.ts
 * 🧬 THE SEO SUPREMACY ENGINE - JSON-LD Schema Generation for Google Domination
 * 
 * This service generates rich structured data (Schema.org) to feed Google's crawlers
 * explicitly, ensuring maximum visibility in SERP features.
 * 
 * Targets:
 * - Vehicle/Product schema for car listings (Rich Snippets)
 * - VideoObject for Stories (Video Carousel)
 * - LocalBusiness/AutoDealer for dealer profiles (Local Pack + Maps)
 * - BreadcrumbList for navigation (Sitelinks)
 * - FAQPage for landing pages (FAQ Rich Snippet)
 * 
 * @author SEO Supremacy System
 * @version 2.0.0
 */

import { CarListing } from '@/types/CarListing';

// ============================================================================
// TYPES
// ============================================================================

export interface VehicleSchemaInput {
    car: Partial<CarListing>;
    seller?: {
        name: string;
        type: 'private' | 'dealer' | 'company';
        numericId?: number;
        rating?: number;
        reviewCount?: number;
        phone?: string;
        address?: string;
    };
    url: string;
}

export interface StorySchemaInput {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
    uploadDate: string;
    duration: string; // ISO 8601 format (PT1M33S)
    author: {
        name: string;
        numericId: number;
    };
    url: string;
}

export interface DealerSchemaInput {
    name: string;
    description?: string;
    address: {
        street?: string;
        city: string;
        region?: string;
        postalCode?: string;
        country: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    images?: string[];
    rating?: number;
    reviewCount?: number;
    priceRange?: string;
    openingHours?: string[];
    geo?: {
        latitude: number;
        longitude: number;
    };
    url: string;
}

export interface BreadcrumbInput {
    items: Array<{
        name: string;
        url: string;
    }>;
}

export interface FAQSchemaInput {
    questions: Array<{
        question: string;
        answer: string;
    }>;
}

// ============================================================================
// SCHEMA GENERATOR SERVICE
// ============================================================================

export class SchemaGenerator {
    private static readonly SITE_NAME = 'Bulgarski Avtomobili';
    private static readonly SITE_URL = 'https://mobilebg.eu';
    private static readonly LOGO_URL = 'https://mobilebg.eu/logo.png';

    /**
     * 🚗 Generate Vehicle/Product Schema for Car Listings
     * Targets: Rich Snippets, Product Carousel, Google Shopping
     */
    static generateVehicleSchema(input: VehicleSchemaInput): object {
        const { car, seller, url } = input;

        const imageUrls = car.images?.filter(Boolean) || [];
        const primaryImage = imageUrls[0] || `${this.SITE_URL}/default-car.jpg`;

        return {
            '@context': 'https://schema.org',
            '@type': 'Vehicle',
            '@id': `${this.SITE_URL}${url}#vehicle`,

            // Core Vehicle Info
            name: `${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim(),
            description: car.description || `${car.make} ${car.model} - ${car.fuelType}, ${car.transmission}`,
            url: `${this.SITE_URL}${url}`,

            // Brand & Model
            brand: {
                '@type': 'Brand',
                name: car.make,
            },
            model: car.model,
            vehicleModelDate: car.year?.toString(),
            productionDate: car.year?.toString(),

            // Technical Specs
            ...(car.mileage && {
                mileageFromOdometer: {
                    '@type': 'QuantitativeValue',
                    value: car.mileage,
                    unitCode: 'KMT',
                }
            }),
            ...(car.fuelType && { fuelType: this.mapFuelType(car.fuelType) }),
            ...(car.transmission && { vehicleTransmission: this.mapTransmission(car.transmission) }),
            ...(car.engineSize && {
                vehicleEngine: {
                    '@type': 'EngineSpecification',
                    displacement: {
                        '@type': 'QuantitativeValue',
                        value: car.engineSize,
                        unitCode: 'CMQ', // Cubic centimeters
                    },
                }
            }),
            ...(car.power && {
                enginePower: {
                    '@type': 'QuantitativeValue',
                    value: car.power,
                    unitCode: 'BHP',
                }
            }),
            ...(car.color && { color: car.color }),
            ...(car.doors && { numberOfDoors: parseInt(car.doors) }),
            ...(car.vin && { vehicleIdentificationNumber: car.vin }),

            // Vehicle Condition
            itemCondition: car.condition === 'new'
                ? 'https://schema.org/NewCondition'
                : 'https://schema.org/UsedCondition',

            // Images
            image: imageUrls.length > 1 ? imageUrls : primaryImage,

            // Offer (Price)
            offers: {
                '@type': 'Offer',
                '@id': `${this.SITE_URL}${url}#offer`,
                // TODO: netPrice not in CarListing type - needs type extension
                price: car.price || (car as any).netPrice || 0,
                priceCurrency: car.currency || 'BGN',
                priceValidUntil: this.getFutureDate(90),
                // TODO: isSold not in CarListing type - needs type extension
                availability: (car as any).isSold
                    ? 'https://schema.org/SoldOut'
                    : 'https://schema.org/InStock',
                itemCondition: car.condition === 'new'
                    ? 'https://schema.org/NewCondition'
                    : 'https://schema.org/UsedCondition',
                url: `${this.SITE_URL}${url}`,

                // Seller Info
                seller: seller ? this.generateSellerSchema(seller) : undefined,

                // Purchase Location
                availableAtOrFrom: {
                    '@type': 'Place',
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: car.location || car.region,
                        addressCountry: 'BG',
                    },
                },
            },

            // Aggregate Rating (if available)
            ...(seller?.rating && {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: seller.rating,
                    reviewCount: seller.reviewCount || 1,
                    bestRating: 5,
                    worstRating: 1,
                },
            }),
        };
    }

    /**
     * 🎬 Generate VideoObject Schema for Stories
     * Targets: Google Video Search, Video Carousel, YouTube-style results
     */
    static generateVideoSchema(input: StorySchemaInput): object {
        return {
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            '@id': `${this.SITE_URL}/stories/${input.id}#video`,

            name: input.title,
            description: input.description,
            thumbnailUrl: input.thumbnailUrl,
            contentUrl: input.contentUrl,
            embedUrl: `${this.SITE_URL}/embed/stories/${input.id}`,

            uploadDate: input.uploadDate,
            duration: input.duration,

            // Author
            author: {
                '@type': 'Person',
                name: input.author.name,
                url: `${this.SITE_URL}/profile/${input.author.numericId}`,
            },

            // Publisher (Site)
            publisher: {
                '@type': 'Organization',
                name: this.SITE_NAME,
                logo: {
                    '@type': 'ImageObject',
                    url: this.LOGO_URL,
                },
            },

            // Interaction Statistics
            interactionStatistic: {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/WatchAction',
                userInteractionCount: 0, // Will be updated dynamically
            },

            // For Video SEO
            isFamilyFriendly: true,
            inLanguage: 'bg',
        };
    }

    /**
     * 🏢 Generate LocalBusiness/AutoDealer Schema for Dealer Profiles
     * Targets: Google Maps, Local Pack (3-Pack), Knowledge Panel
     */
    static generateDealerSchema(input: DealerSchemaInput): object {
        return {
            '@context': 'https://schema.org',
            '@type': 'AutoDealer',
            '@id': `${this.SITE_URL}${input.url}#dealer`,

            name: input.name,
            description: input.description || `Автосалон ${input.name} - продажба на автомобили в ${input.address.city}`,
            url: `${this.SITE_URL}${input.url}`,

            // Contact
            ...(input.phone && { telephone: input.phone }),
            ...(input.email && { email: input.email }),

            // Address
            address: {
                '@type': 'PostalAddress',
                streetAddress: input.address.street,
                addressLocality: input.address.city,
                addressRegion: input.address.region,
                postalCode: input.address.postalCode,
                addressCountry: input.address.country || 'BG',
            },

            // Geo Coordinates (Critical for Maps)
            ...(input.geo && {
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: input.geo.latitude,
                    longitude: input.geo.longitude,
                },
            }),

            // Images
            ...(input.logo && { logo: input.logo }),
            ...(input.images?.length && { image: input.images }),

            // Business Info
            priceRange: input.priceRange || '€€',
            currenciesAccepted: 'BGN, EUR',
            paymentAccepted: 'Cash, Credit Card, Bank Transfer',

            // Opening Hours
            ...(input.openingHours && {
                openingHoursSpecification: input.openingHours.map(hours => ({
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: hours,
                })),
            }),

            // Ratings
            ...(input.rating && {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: input.rating,
                    reviewCount: input.reviewCount || 1,
                    bestRating: 5,
                    worstRating: 1,
                },
            }),

            // Area Served
            areaServed: {
                '@type': 'Country',
                name: 'Bulgaria',
            },

            // Same As (Social Links)
            sameAs: [
                input.website,
            ].filter(Boolean),
        };
    }

    /**
     * 🍞 Generate BreadcrumbList Schema
     * Targets: Sitelinks in SERP, Better navigation understanding
     */
    static generateBreadcrumbSchema(input: BreadcrumbInput): object {
        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: input.items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: `${this.SITE_URL}${item.url}`,
            })),
        };
    }

    /**
     * ❓ Generate FAQPage Schema
     * Targets: FAQ Rich Snippets (High CTR boost)
     */
    static generateFAQSchema(input: FAQSchemaInput): object {
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: input.questions.map(q => ({
                '@type': 'Question',
                name: q.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: q.answer,
                },
            })),
        };
    }

    /**
     * 🌐 Generate WebSite Schema (for sitewide)
     * Targets: Sitelinks Search Box
     */
    static generateWebsiteSchema(): object {
        return {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${this.SITE_URL}#website`,
            url: this.SITE_URL,
            name: this.SITE_NAME,
            description: 'Българска платформа за покупко-продажба на автомобили',
            inLanguage: ['bg', 'en'],

            // Enable Sitelinks Search Box
            potentialAction: {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${this.SITE_URL}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
            },

            publisher: {
                '@type': 'Organization',
                '@id': `${this.SITE_URL}#organization`,
                name: this.SITE_NAME,
                logo: {
                    '@type': 'ImageObject',
                    url: this.LOGO_URL,
                },
            },
        };
    }

    /**
     * 📍 Generate Collection/Listing Page Schema
     * For programmatic SEO pages like /cars/sofia/bmw
     */
    static generateCollectionPageSchema(input: {
        title: string;
        description: string;
        url: string;
        totalItems: number;
        filters?: {
            city?: string;
            make?: string;
            model?: string;
            fuelType?: string;
            priceMax?: number;
        };
    }): object {
        return {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': `${this.SITE_URL}${input.url}#collection`,

            name: input.title,
            description: input.description,
            url: `${this.SITE_URL}${input.url}`,

            // Number of items
            numberOfItems: input.totalItems,

            // About (the filter context)
            about: {
                '@type': 'Product',
                ...(input.filters?.make && {
                    brand: {
                        '@type': 'Brand',
                        name: input.filters.make,
                    },
                }),
                ...(input.filters?.model && { model: input.filters.model }),
            },

            // Breadcrumb reference
            breadcrumb: {
                '@id': `${this.SITE_URL}${input.url}#breadcrumb`,
            },

            isPartOf: {
                '@id': `${this.SITE_URL}#website`,
            },
        };
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private static generateSellerSchema(seller: VehicleSchemaInput['seller']): object {
        if (!seller) return {};

        const baseType = seller.type === 'dealer' ? 'AutoDealer' :
            seller.type === 'company' ? 'Organization' : 'Person';

        return {
            '@type': baseType,
            name: seller.name,
            ...(seller.numericId && {
                url: `${this.SITE_URL}/profile/${seller.numericId}`
            }),
            ...(seller.phone && { telephone: seller.phone }),
            ...(seller.address && {
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: seller.address,
                    addressCountry: 'BG',
                }
            }),
        };
    }

    private static mapFuelType(fuel: string): string {
        const fuelMap: Record<string, string> = {
            'diesel': 'https://schema.org/DieselFuel',
            'petrol': 'https://schema.org/Gasoline',
            'gasoline': 'https://schema.org/Gasoline',
            'бензин': 'https://schema.org/Gasoline',
            'дизел': 'https://schema.org/DieselFuel',
            'electric': 'https://schema.org/Electricity',
            'електрически': 'https://schema.org/Electricity',
            'hybrid': 'https://schema.org/Gasoline',
            'хибрид': 'https://schema.org/Gasoline',
            'lpg': 'https://schema.org/NaturalGas',
            'газ': 'https://schema.org/NaturalGas',
        };
        return fuelMap[fuel.toLowerCase()] || fuel;
    }

    private static mapTransmission(transmission: string): string {
        const transMap: Record<string, string> = {
            'automatic': 'AutomaticTransmission',
            'автоматична': 'AutomaticTransmission',
            'manual': 'ManualTransmission',
            'ръчна': 'ManualTransmission',
            'semi-automatic': 'AutomaticTransmission',
        };
        return transMap[transmission.toLowerCase()] || transmission;
    }

    private static getFutureDate(daysAhead: number): string {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toISOString().split('T')[0];
    }
}

// ============================================================================
// HELPER: Inject Schema into Head (for React components)
// ============================================================================

export function injectSchemaScript(schema: object | object[]): string {
    const schemas = Array.isArray(schema) ? schema : [schema];
    return `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`;
}

export default SchemaGenerator;
