// src/components/SEO/SEOHead.tsx
// SEO Component for Meta Tags and Structured Data

import React from 'react';

// Simple SEO component without react-helmet dependency
// Using direct DOM manipulation for meta tags

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
  structuredData?: any;
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image = 'https://globulcars.bg/og-image.jpg',
  url = window.location.href,
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
  const siteName = 'Globul Cars';
  const fullTitle = `${title} | ${siteName}`;
  const twitterHandle = '@globulcars';

  // Generate structured data for rich snippets
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'Product' : 'WebSite',
    name: title,
    description,
    url,
    ...(type === 'website' && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://globulcars.bg/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    }),
    ...(type === 'product' && price && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability || 'InStock'}`
      }
    })
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  // Update meta tags using useEffect
  React.useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Helper function to update or create meta tag
    const updateMetaTag = (name: string, content: string, isProperty: boolean = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords && keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }
    updateMetaTag('author', author || siteName);

    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', siteName, true);
    updateMetaTag('og:locale', locale, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', url);
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', twitterHandle);

    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('googlebot', 'index, follow');

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Update structured data
    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(finalStructuredData);

  }, [title, description, keywords, image, url, type, locale, author, price, currency, availability, structuredData]);

  return null;
};

export default SEOHead;
