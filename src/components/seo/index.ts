/**
 * SEO Components Index
 * Centralized exports for SEO-related components
 */

export { default as CarSEO } from './CarSEO';
export { default as ProfileSEO, type ProfileData } from './ProfileSEO';
export { default as SEOHead } from './SEOHead';
export { default as WebStory } from './WebStory';
export { default as FAQSchema } from './FAQSchema';
export { default as RelatedContent } from './RelatedContent';
export {
    CarStructuredData,
    OrganizationStructuredData,
    BreadcrumbStructuredData,
    WebSiteStructuredData,
} from './StructuredData';

// Re-export from utils/seo if they exist there
export { SEOHelmet, type SEOHelmetProps } from '@/utils/seo/SEOHelmet';
