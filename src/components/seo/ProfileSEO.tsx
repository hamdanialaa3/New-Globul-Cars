/**
 * ProfileSEO.tsx
 * 🏢 SEO Component for Profile Pages
 * 
 * Injects LocalBusiness/AutoDealer schema for dealer profiles
 * to appear in Google Maps, Local Pack (3-Pack), and Knowledge Panel.
 * 
 * @author SEO Supremacy System
 * @created January 6, 2026
 */

import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { SchemaGenerator, DealerSchemaInput } from '@/utils/seo/SchemaGenerator';

// ============================================================================
// TYPES
// ============================================================================

export interface ProfileData {
    numericId: number;
    displayName: string;
    profileType: 'private' | 'dealer' | 'company';
    photoURL?: string;
    coverImage?: string;
    bio?: string;
    phone?: string;
    email?: string;
    website?: string;
    city?: string;
    region?: string;
    address?: string;
    trustScore?: number;
    reviewCount?: number;
    carsCount?: number;
    isVerified?: boolean;
    createdAt?: Date | string;
    // Dealer-specific fields
    companyName?: string;
    dealershipName?: string;
    openingHours?: string[];
    priceRange?: string;
    latitude?: number;
    longitude?: number;
    logo?: string;
}

interface ProfileSEOProps {
    profile: ProfileData;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SITE_URL = 'https://mobilebg.eu';
const SITE_NAME = 'Bulgarski Avtomobili';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate page title based on profile type
 */
function generateTitle(profile: ProfileData): string {
    const name = profile.displayName || profile.companyName || profile.dealershipName || 'Профил';
    
    switch (profile.profileType) {
        case 'dealer':
            return `${name} - Автосалон | ${SITE_NAME}`;
        case 'company':
            return `${name} - Компания за автомобили | ${SITE_NAME}`;
        default:
            return `${name} - Продавач | ${SITE_NAME}`;
    }
}

/**
 * Generate meta description based on profile type
 */
function generateDescription(profile: ProfileData): string {
    const name = profile.displayName || profile.companyName || 'Продавач';
    const city = profile.city || 'България';
    const carsCount = profile.carsCount || 0;
    
    switch (profile.profileType) {
        case 'dealer':
            return `Автосалон ${name} в ${city}. ${carsCount > 0 ? `Над ${carsCount} коли.` : ''} Проверени обяви с гаранция за качество. Доверен продавач с ${profile.trustScore ? Math.round(profile.trustScore) : 0}% TrustScore.`;
        case 'company':
            return `Компания ${name} в ${city}. ${carsCount > 0 ? `${carsCount} коли в наличност.` : ''} Бизнес продажби на автомобили с професионално обслужване.`;
        default:
            return `Обяви от ${name} в ${city}. ${carsCount > 0 ? `${carsCount} коли за продажба.` : ''} ${profile.bio || 'Частни обяви за автомобили.'}`;
    }
}

/**
 * Generate LocalBusiness/AutoDealer schema for dealer profiles
 */
function generateDealerSchemaData(profile: ProfileData): object | null {
    // Only generate for dealer/company profiles
    if (profile.profileType === 'private') {
        // For private profiles, generate simple Person schema
        return {
            '@context': 'https://schema.org',
            '@type': 'Person',
            '@id': `${SITE_URL}/profile/${profile.numericId}#person`,
            name: profile.displayName || 'Продавач',
            url: `${SITE_URL}/profile/${profile.numericId}`,
            ...(profile.photoURL && { image: profile.photoURL }),
            ...(profile.city && {
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: profile.city,
                    addressCountry: 'BG'
                }
            }),
        };
    }

    // For dealers/companies, generate AutoDealer schema
    const dealerInput: DealerSchemaInput = {
        name: profile.displayName || profile.companyName || profile.dealershipName || 'Автосалон',
        url: `/profile/${profile.numericId}`,
        description: profile.bio || `Автосалон ${profile.displayName} - продажба на автомобили в ${profile.city || 'България'}`,
        address: {
            street: profile.address || '',
            city: profile.city || 'София',
            region: profile.region || profile.city || 'София',
            postalCode: '', // Not usually available
            country: 'BG'
        },
        ...(profile.phone ? { phone: profile.phone } : {}),
        ...(profile.email ? { email: profile.email } : {}),
        ...((profile.logo || profile.photoURL) ? { logo: profile.logo || profile.photoURL } : {}),
        ...(profile.coverImage ? { images: [profile.coverImage] } : {}),
        ...(profile.trustScore ? { 
            rating: Math.min(5, profile.trustScore / 20), // Convert 0-100 to 0-5
            reviewCount: profile.reviewCount || 1
        } : {}),
        ...((profile.latitude && profile.longitude) ? {
            geo: {
                latitude: profile.latitude,
                longitude: profile.longitude
            }
        } : {}),
        ...(profile.priceRange ? { priceRange: profile.priceRange } : {}),
        ...(profile.website ? { website: profile.website } : {}),
    };

    return SchemaGenerator.generateDealerSchema(dealerInput);
}

/**
 * Generate BreadcrumbList schema
 */
function generateBreadcrumbSchema(profile: ProfileData): object {
    const items = [
        { name: 'Начало', url: '/' },
        { name: 'Продавачи', url: '/dealers' },
        { name: profile.displayName || 'Профил', url: `/profile/${profile.numericId}` }
    ];

    return SchemaGenerator.generateBreadcrumbSchema({ items });
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProfileSEO: React.FC<ProfileSEOProps> = ({ profile }) => {
    const title = useMemo(() => generateTitle(profile), [profile]);
    const description = useMemo(() => generateDescription(profile), [profile]);
    const canonicalUrl = `${SITE_URL}/profile/${profile.numericId}`;
    const ogImage = profile.coverImage || profile.photoURL || `${SITE_URL}/og-image.jpg`;

    // Generate schemas
    const schemas = useMemo(() => {
        const schemaArray: object[] = [];
        
        // Dealer/LocalBusiness schema
        const dealerSchema = generateDealerSchemaData(profile);
        if (dealerSchema) {
            schemaArray.push(dealerSchema);
        }

        // Breadcrumb schema
        schemaArray.push(generateBreadcrumbSchema(profile));

        return schemaArray;
    }, [profile]);

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* OpenGraph Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content="profile" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="bg_BG" />
            
            {/* Profile OpenGraph */}
            <meta property="profile:username" content={profile.displayName || ''} />
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Alternate Languages */}
            <link rel="alternate" hrefLang="bg" href={`${canonicalUrl}?lang=bg`} />
            <link rel="alternate" hrefLang="en" href={`${canonicalUrl}?lang=en`} />
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

            {/* JSON-LD Schemas */}
            {schemas.map((schema, index) => (
                <script 
                    key={index} 
                    type="application/ld+json"
                >
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
};

export default ProfileSEO;
