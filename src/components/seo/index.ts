/**
 * SEO Components Index
 * Centralized exports for SEO-related components
 */

export { default as CarSEO } from './CarSEO';
export { default as ProfileSEO, type ProfileData } from './ProfileSEO';
export { default as SEOHead } from './SEOHead';
export { default as WebStory } from './WebStory';
export { default as FAQSchema, HOMEPAGE_FAQS, type FAQItem } from './FAQSchema';
export { default as SEOFooterLinks } from './SEOFooterLinks';

// Re-export from utils/seo if they exist there
export { SEOHelmet, type SEOHelmetProps } from '@/utils/seo/SEOHelmet';
