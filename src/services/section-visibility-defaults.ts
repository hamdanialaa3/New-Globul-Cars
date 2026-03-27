import { HomepageSection } from './section-visibility-types';

/**
 * Firestore document path for section visibility config.
 * Single document — 20 sections ≈ 2KB, well within Firestore limits.
 */
export const SECTION_VISIBILITY_PATH = {
  collection: 'app_settings',
  docId: 'homepage_sections',
} as const;

/**
 * CRITICAL: These keys MUST match the gating keys used in HomePageComposer.tsx.
 * If you add a new section to HomePageComposer, add it here too.
 * If you rename a key here, update HomePageComposer to match.
 */
export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  // ─── Main Sections (render in page flow) ───
  {
    key: 'sticky_search',
    label: 'Sticky Search Bar',
    description: 'Floating search bar that sticks to top on scroll',
    visible: true,
    order: 1,
    category: 'main',
  },
  {
    key: 'hero',
    label: 'Hero Section',
    description: 'Main hero banner — UnifiedHeroSection',
    visible: true,
    order: 2,
    category: 'main',
  },
  {
    key: 'kat_services',
    label: 'KAT Official Services',
    description: 'Bilateral registration links & Official Bulgarian government services',
    visible: true,
    order: 2.1,
    category: 'main',
  },
  {
    key: 'our_cars',
    label: 'Our Cars Showcase',
    description: 'All real user-added listings grid — OurCarsShowcase (Нашите коли)',
    visible: true,
    order: 2.5,
    category: 'main',
  },
  {
    key: 'smart_recommendations',
    label: 'Smart Recommendations',
    description: 'AI-powered car recommendations — SmartHeroRecommendations',
    visible: true,
    order: 3,
    category: 'main',
  },
  {
    key: 'ai_analysis_banner',
    label: 'AI Analysis Banner',
    description: 'Promotional banner for AI analysis feature',
    visible: true,
    order: 4,
    category: 'main',
  },
  {
    key: 'hero_strips',
    label: 'Hero Strips',
    description: 'Horizontal navigation strips — HomeHeroStrips',
    visible: true,
    order: 5,
    category: 'main',
  },
  {
    key: 'visual_search',
    label: 'Visual Search Teaser',
    description: 'Image-based search teaser — VisualSearchTeaser',
    visible: true,
    order: 6,
    category: 'main',
  },
  {
    key: 'vehicle_classifications',
    label: 'Vehicle Classifications',
    description: 'Browse by vehicle type/class — VehicleClassificationsSection',
    visible: true,
    order: 7,
    category: 'main',
  },
  {
    key: 'life_moments',
    label: 'Life Moments Browse',
    description: 'Browse cars by life context — LifeMomentsBrowse',
    visible: true,
    order: 8,
    category: 'main',
  },
  {
    key: 'categories',
    label: 'Categories Section',
    description: 'Mobile-oriented: vehicle body type categories with cars (web: hidden)',
    visible: false,
    order: 8.5,
    category: 'main',
  },
  {
    key: 'cars_showcase',
    label: 'Cars Showcase',
    description: 'Main car listings showcase — UnifiedCarsShowcase',
    visible: true,
    order: 9,
    category: 'main',
  },
  {
    key: 'popular_brands',
    label: 'Popular Brands',
    description: 'Brand logos grid — PopularBrandsSection',
    visible: true,
    order: 10,
    category: 'main',
  },
  {
    key: 'most_demanded',
    label: 'Most Demanded Categories',
    description: 'Trending/popular categories — MostDemandedCategoriesSection',
    visible: true,
    order: 11,
    category: 'main',
  },
  {
    key: 'featured_showcase',
    label: 'Featured Showcase (VIP)',
    description: 'Premium/VIP car listings — FeaturedShowcase',
    visible: true,
    order: 12,
    category: 'main',
  },
  {
    key: 'smart_sell',
    label: 'Unified Smart Sell',
    description: 'Sell-your-car CTA section — UnifiedSmartSell',
    visible: true,
    order: 13,
    category: 'main',
  },
  {
    key: 'dealers',
    label: 'Dealers Spotlight',
    description: 'Featured dealers section — UnifiedDealer',
    visible: true,
    order: 14,
    category: 'main',
  },
  {
    key: 'trust_stats',
    label: 'Trust & Stats',
    description: 'Trust indicators and statistics — HomeTrustAndStats',
    visible: true,
    order: 15,
    category: 'main',
  },
  {
    key: 'social',
    label: 'Social Experience',
    description: 'Social media integration — UnifiedSocial',
    visible: true,
    order: 16,
    category: 'main',
  },
  {
    key: 'loyalty',
    label: 'Loyalty & Signup',
    description: 'Loyalty program + signup CTA — HomeLoyaltyAndSignup',
    visible: true,
    order: 17,
    category: 'main',
  },
  {
    key: 'pricing_plans',
    label: 'Subscriptions & Pricing',
    description: 'Premium subscription plans with details and payment options',
    visible: true,
    order: 17.5,
    category: 'main',
  },

  // ─── Conditional Section ───
  {
    key: 'recent_browsing',
    label: 'Recent Browsing',
    description: 'Recently viewed cars (only shows if user has browsing history)',
    visible: true,
    order: 18,
    category: 'conditional',
  },

  // ─── Floating Elements ───
  {
    key: 'ai_chatbot',
    label: 'AI Chatbot',
    description: 'Floating AI chat assistant — AIChatbot',
    visible: true,
    order: 19,
    category: 'floating',
  },
  {
    key: 'draft_recovery',
    label: 'Draft Recovery Prompt',
    description: 'Floating draft recovery notification — DraftRecoveryPrompt',
    visible: true,
    order: 20,
    category: 'floating',
  },
];
