import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  
  // Product-specific (for car listings)
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  
  // Language
  language?: 'bg' | 'en';
  alternateLanguages?: Array<{ lang: string; url: string }>;
  
  // Additional meta tags
  noIndex?: boolean;
  noFollow?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image = 'https://globulcars.bg/og-image.jpg',
  url = 'https://globulcars.bg',
  type = 'website',
  author,
  publishedDate,
  modifiedDate,
  price,
  currency = 'EUR',
  availability = 'InStock',
  language = 'bg',
  alternateLanguages = [],
  noIndex = false,
  noFollow = false,
}) => {
  const fullTitle = title ? `${title} | Globul Cars` : 'Globul Cars - Купи или продай автомобил в България';
  const canonicalUrl = url.startsWith('http') ? url : `https://globulcars.bg${url}`;
  
  // Robots meta tag
  const robotsContent = [];
  if (noIndex) robotsContent.push('noindex');
  if (noFollow) robotsContent.push('nofollow');
  if (!noIndex && !noFollow) {
    robotsContent.push('index', 'follow');
  }
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language === 'bg' ? 'bg-BG' : 'en-US'} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent.join(', ')} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Alternate Language Links */}
      {alternateLanguages.map(alt => (
        <link
          key={alt.lang}
          rel="alternate"
          hrefLang={alt.lang}
          href={alt.url}
        />
      ))}
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Globul Cars" />
      <meta property="og:locale" content={language === 'bg' ? 'bg_BG' : 'en_US'} />
      
      {/* Open Graph - Product specific */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
        </>
      )}
      
      {/* Open Graph - Article specific */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedDate && <meta property="article:published_time" content={publishedDate} />}
          {modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@GlobulCars" />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#FF8F10" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Geo Tags (Bulgaria) */}
      <meta name="geo.region" content="BG" />
      <meta name="geo.placename" content="Bulgaria" />
    </Helmet>
  );
};

export default SEO;
