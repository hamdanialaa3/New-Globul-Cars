/**
 * seo/index.ts
 * 🚀 SEO Supremacy Module - Central Export
 */

// Schema Generation
export {
    SchemaGenerator,
    injectSchemaScript,
    type VehicleSchemaInput,
    type StorySchemaInput,
    type DealerSchemaInput,
    type BreadcrumbInput,
    type FAQSchemaInput,
} from './SchemaGenerator';

// SEO Helmet (Meta Tags)
export {
    SEOHelmet,
    type SEOHelmetProps,
} from './SEOHelmet';

// Sitemap Factory
export {
    SitemapFactory,
} from './SitemapFactory';

// Core Web Vitals Components
export {
    AspectRatioBox,
    CarCardSkeleton,
    StoryFeedSkeleton,
    DealerCardSkeleton,
    SkeletonPulse,
    ASPECT_RATIOS,
    type AspectRatioBoxProps,
} from './AspectRatioBox';
