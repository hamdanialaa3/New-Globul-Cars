/**
 * SEOHelmet.tsx
 * 🎯 React Component for Dynamic SEO Meta Tags & Schema Injection
 * 
 * Uses react-helmet-async to inject:
 * - Title, Description, Keywords
 * - Canonical URL
 * - Alternate language tags (hreflang)
 * - OpenGraph (Facebook)
 * - Twitter Cards
 * - JSON-LD Schema
 * 
 * @author SEO Supremacy System
 */

import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// TYPES
// ============================================================================

export interface SEOHelmetProps {
    // Core
    title: string;
    description: string;
    keywords?: string[];

    // URLs
    canonical?: string;
    noindex?: boolean;

    // OpenGraph
    ogType?: 'website' | 'article' | 'product' | 'profile' | 'video.other';
    ogImage?: string;
    ogImageAlt?: string;

    // Twitter
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';

    // Schema (JSON-LD)
    schema?: object | object[];

    // Alternate languages
    alternateLanguages?: {
        bg?: string;
        en?: string;
    };

    // Article specific
    article?: {
        publishedTime?: string;
        modifiedTime?: string;
        author?: string;
    };

    // Product specific
    product?: {
        price?: number;
        currency?: string;
        availability?: 'in stock' | 'out of stock';
    };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SITE_NAME = 'Koli One';
const SITE_URL = 'https://koli.one';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const TWITTER_HANDLE = '@bulgarski_auto';

// ============================================================================
// COMPONENT
// ============================================================================

export const SEOHelmet: React.FC<SEOHelmetProps> = ({
    title,
    description,
    keywords = [],
    canonical,
    noindex = false,
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    ogImageAlt,
    twitterCard = 'summary_large_image',
    schema,
    alternateLanguages,
    article,
    product,
}) => {
    const location = useLocation();
    const { language } = useLanguage();

    // Build canonical URL
    const canonicalUrl = useMemo(() => {
        if (canonical) return canonical;
        return `${SITE_URL}${location.pathname}`;
    }, [canonical, location.pathname]);

    // Build title with site name
    const fullTitle = useMemo(() => {
        if (title.includes(SITE_NAME)) return title;
        return `${title} | ${SITE_NAME}`;
    }, [title]);

    // Truncate description to 160 chars
    const safeDescription = useMemo(() => {
        if (description.length <= 160) return description;
        return description.substring(0, 157) + '...';
    }, [description]);

    // Build keywords string
    const keywordsString = useMemo(() => {
        const baseKeywords = [
            'коли', 'автомобили', 'продажба', 'кола', 'България',
            'cars', 'automobiles', 'bulgaria', 'buy car'
        ];
        return [...new Set([...keywords, ...baseKeywords])].join(', ');
    }, [keywords]);

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <html lang={language} />
            <title>{fullTitle}</title>
            <meta name="description" content={safeDescription} />
            <meta name="keywords" content={keywordsString} />

            {/* Robots */}
            <meta
                name="robots"
                content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
            />

            {/* Canonical */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Alternate Languages (hreflang) */}
            {alternateLanguages?.bg && (
                <link rel="alternate" hrefLang="bg" href={alternateLanguages.bg} />
            )}
            {alternateLanguages?.en && (
                <link rel="alternate" hrefLang="en" href={alternateLanguages.en} />
            )}
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

            {/* OpenGraph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={safeDescription} />
            <meta property="og:image" content={ogImage} />
            {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content={language === 'bg' ? 'bg_BG' : 'en_US'} />
            {language === 'bg' && <meta property="og:locale:alternate" content="en_US" />}
            {language === 'en' && <meta property="og:locale:alternate" content="bg_BG" />}

            {/* Article OpenGraph */}
            {article && (
                <>
                    {article.publishedTime && (
                        <meta property="article:published_time" content={article.publishedTime} />
                    )}
                    {article.modifiedTime && (
                        <meta property="article:modified_time" content={article.modifiedTime} />
                    )}
                    {article.author && (
                        <meta property="article:author" content={article.author} />
                    )}
                </>
            )}

            {/* Product OpenGraph */}
            {product && (
                <>
                    <meta property="product:price:amount" content={product.price?.toString() || '0'} />
                    <meta property="product:price:currency" content={product.currency || 'BGN'} />
                    <meta property="product:availability" content={product.availability || 'in stock'} />
                </>
            )}

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:site" content={TWITTER_HANDLE} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={safeDescription} />
            <meta name="twitter:image" content={ogImage} />

            {/* JSON-LD Schema */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
                </script>
            )}
        </Helmet>
    );
};

export default SEOHelmet;
