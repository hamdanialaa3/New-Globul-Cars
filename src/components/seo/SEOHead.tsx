// src/components/SEO/SEOHead.tsx
// SEO Component for Meta Tags and Structured Data

import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: 'bg_BG' | 'en_US';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: number;
  currency?: string;
  availability?: 'instock' | 'outofstock' | 'preorder';
  structuredData?: object;
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image = 'https://koli.one/og-image.jpg',
  url,
  type = 'website',
  locale = 'bg_BG',
  author,
  publishedTime,
  modifiedTime,
  price,
  currency = 'EUR',
  availability,
  structuredData
}) => {
  const siteName = 'Koli One';
  const fullTitle = `${title} | ${siteName}`;
  const twitterHandle = '@kolionebg';
  const canonicalUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'Product' : 'WebSite',
    name: title,
    description,
    url: canonicalUrl,
    ...(type === 'website' && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://koli.one/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    }),
    ...(type === 'product' && price !== undefined && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability || 'InStock'}`
      }
    })
  };

  const finalStructuredData = structuredData ?? defaultStructuredData;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={author ?? siteName} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {canonicalUrl && <meta name="twitter:url" content={canonicalUrl} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content={twitterHandle} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
