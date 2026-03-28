/**
 * HomePageComposer.tsx
 * Композитор на началната страница - Page Layout Orchestrator
 * HomePage Composer - Layout Manager for HomePage Sections
 * 
 * ✅ MAJOR UPDATE: February 3, 2026 - Golden Order Redesign
 * 
 * 🎯 NEW COMPETITIVE STRUCTURE (12 sections instead of 16):
 * - Optimized order based on global best practices
 * - Added VisualSearchTeaser (UNIQUE - no competitor has this!)
 * - Added LifeMomentsBrowse (Emotional discovery)
 * - Merged SmartSellStrip + AISmartSellButton → UnifiedSmartSell
 * - Conditional RecentBrowsing (only for returning users)
 * 
 * Inspired by / Вдъхновено от:
 * ✅ mobile.de - Clean European UX
 * ✅ Carvana - Premium car discovery
 * ✅ Airbnb - Experience-based browsing
 * ✅ Tesla - Premium CTA design
 * 
 * Single responsibility / Единствена отговорност: Arrange and organize HomePage sections
 * - No business logic / Без бизнес логика
 * - Works as layout manager only / Работи само като мениджър на оформление
 * - Uses existing components as-is / Използва съществуващите компоненти както са
 * - Clear and easy to maintain / Ясен и лесен за поддръжка
 * 
 * @performance optimized lazy loading for each section
 * @maintainability easy to modify and develop
 * @clean no complex business logic
 */

import React, { Suspense, useMemo } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';
import { DEFAULT_HOMEPAGE_SECTIONS } from '@/services/section-visibility-defaults';
import LazySection from '@/components/LazySection';

// ============================================================================
// CORE SECTION IMPORTS (v4.1 — Balanced 14-Section Layout)
// ============================================================================

// 1. Hero & Search
import UnifiedHeroSection from './UnifiedHeroSection';
import StickySearchBar from './StickySearchBar';

// 2. AI Feature
import AIAnalysisBanner from './AIAnalysisBanner';

// 3. Car Discovery
import FeaturedShowcase from './FeaturedShowcase';
import PopularBrandsSection from './PopularBrandsSection';
import MostDemandedCategoriesSection from './MostDemandedCategoriesSection';
import OurCarsShowcase from './OurCarsShowcase';
import UnifiedCarsShowcase from './UnifiedCarsShowcase';
import VehicleClassificationsSection from './VehicleClassificationsSection';
import VisualSearchTeaser from './VisualSearchTeaser';
import LifeMomentsBrowse from './LifeMomentsBrowse';

// 4. Personalization (Conditional)
import SmartHeroRecommendations from './SmartHeroRecommendations';
import RecentBrowsingSection from './RecentBrowsingSection';

// 5. Selling CTA
import UnifiedSmartSell from './UnifiedSmartSell';

// 6. Trust & Dealers
import UnifiedDealer from './UnifiedDealer';
import HomeTrustAndStats from './HomeTrustAndStats';

// 7. Utilities
import LinkableSection from './LinkableSection';
import KATServicesHero from './KATServicesHero';

// 8. Orphaned Sections — now wired
import { HomeHeroStrips } from '@/components/home/HomeHeroStrips';
import UnifiedSocial from './UnifiedSocial';
import HomeLoyaltyAndSignup from './HomeLoyaltyAndSignup';

// Global components (lazy loaded)
const AIChatbot = React.lazy(() => import('../../../../components/AI/AIChatbot'));
const PricingSlotWrapper = React.lazy(() => import('../../../../components/subscription/PricingSlotWrapper'));

// SEO components
const FAQSchema = React.lazy(() => import('../../../../components/seo/FAQSchema'));
const SEOFooterLinks = React.lazy(() => import('../../../../components/seo/SEOFooterLinks'));

import { HOMEPAGE_FAQS } from '../../../../components/seo/FAQSchema';

// ✅ REVENUE FIX: Draft Recovery Prompt (January 6, 2026)
const DraftRecoveryPrompt = React.lazy(() => import('./DraftRecoveryPrompt'));

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ComposerContainer = styled.main`
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  /* Performance optimizations */
  contain: layout style paint;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1400px; /* mobile.de standard: 1400px max-width */
  margin: 0 auto; /* Center the container */
  padding: 0 24px; /* mobile.de standard: 24px horizontal padding */
  padding-bottom: 80px;

  @media (max-width: 1024px) {
    padding: 0 20px;
    padding-bottom: 60px;
  }

  @media (max-width: 768px) {
    padding: 0 16px; /* mobile.de mobile: 16px padding */
    padding-bottom: 40px;
  }
`;

const SectionSpacer = styled.div`
  height: 64px; /* mobile.de standard: 64px spacing between sections (increased from 40px) */
  @media (max-width: 1024px) {
    height: 48px; /* Reduced on tablet */
  }
  @media (max-width: 768px) {
    height: 48px; /* mobile.de mobile: 48px spacing */
  }
`;

const LoadingFallback = styled.div`
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 8px;
  margin: 20px;
  border: 1px solid var(--border-primary);
`;

// ============================================================================
// SECTION SLOTS — FOCUSED 9-SECTION LAYOUT (v4.0)
// ============================================================================

/**
 * Slot 1: Hero Section
 * h1 tagline + search widget + trust strip
 */
const HeroSlot: React.FC = () => (
  <UnifiedHeroSection />
);

/**
 * Slot: KAT Official Services (New)
 */
const KATServicesSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <KATServicesHero />
  </LazySection>
);

/**
 * Slot 2: Our Cars Showcase (Нашите коли)
 * All real user-added listings — 4×3 grid on desktop
 */
const OurCarsSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <OurCarsShowcase />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 3: Smart Recommendations (For Logged-in Users)
 * AI-powered personalized recommendations
 */
const SmartHeroSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <SmartHeroRecommendations />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 4: AI Analysis Banner
 * Eye-catching banner explaining AI car analysis flow
 */
const AIAnalysisBannerSlot: React.FC = () => (
  <LazySection rootMargin="50px">
    <Suspense fallback={null}>
      <AIAnalysisBanner />
    </Suspense>
  </LazySection>
);

/**
 * Slot 5: Popular Brands
 */
const PopularBrandsSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <PopularBrandsSection />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 6: Most Demanded Categories (AI Trending)
 */
const MostDemandedCategoriesSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <MostDemandedCategoriesSection />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 7: Unified Smart Sell (Sell CTA)
 */
const UnifiedSmartSellSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}>
      <UnifiedSmartSell />
    </Suspense>
  </LazySection>
);

/**
 * Slot 8: Dealer Spotlight
 * Certified dealers + Trust Badges
 */
const DealersSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LinkableSection
      title="Featured Dealers"
      titleAr="Featured Dealers"
      viewAllLink="/dealers"
      viewAllText="View All Dealers"
      viewAllTextAr="View All Dealers"
    >
      <LazySection rootMargin="100px">
        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
          <UnifiedDealer />
        </Suspense>
      </LazySection>
    </LinkableSection>
  );
};

/**
 * Slot 9: Trust & Stats (Compact)
 */
const TrustSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <HomeTrustAndStats />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot CONDITIONAL: Recent Browsing
 * Shows only for returning users
 */
const RecentBrowsingSlot: React.FC = () => (
  <LazySection rootMargin="100px" minHeight="200px">
    <Suspense fallback={null}>
      <RecentBrowsingSection />
    </Suspense>
  </LazySection>
);

/**
 * Slot: Featured Showcase
 * Premium/featured listings — key revenue driver
 */
const FeaturedShowcaseSlot: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <FeaturedShowcase />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot: Vehicle Classifications
 * Browse by vehicle type (SUV, Sedan, Hatchback, etc.)
 */
const VehicleClassificationsSlot: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <VehicleClassificationsSection />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot: Unified Cars Showcase
 * Main car browsing showcase grid
 */
const UnifiedCarsShowcaseSlot: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <UnifiedCarsShowcase />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot: Visual Search Teaser
 * AI-powered visual search — unique differentiator
 */
const VisualSearchTeaserSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}>
      <VisualSearchTeaser />
    </Suspense>
  </LazySection>
);

/**
 * Slot: Life Moments Browse
 * Emotional discovery — browse by life situation
 */
const LifeMomentsBrowseSlot: React.FC = () => {
  const { t } = useLanguage();
  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <LifeMomentsBrowse />
      </Suspense>
    </LazySection>
  );
};

/**
 * Floating: AI Chatbot
 */
const AIChatbotSlot: React.FC = () => (
  <Suspense fallback={null}>
    <AIChatbot />
  </Suspense>
);

/**
 * Slot: Hero Strips
 */
const HomeHeroStripsSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}><HomeHeroStrips /></Suspense>
  </LazySection>
);

/**
 * Slot: Social Proof
 */
const SocialSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}><UnifiedSocial /></Suspense>
  </LazySection>
);

/**
 * Slot: Loyalty & Signup
 */
const LoyaltySlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}><HomeLoyaltyAndSignup /></Suspense>
  </LazySection>
);

/**
 * Floating: Draft Recovery Prompt
 */
const DraftRecoverySlot: React.FC = () => (
  <Suspense fallback={null}>
    <DraftRecoveryPrompt delay={3000} />
  </Suspense>
);

// ============================================================================
// MAIN COMPOSER — BALANCED 14-SECTION LAYOUT (v4.1)
// ============================================================================

/**
 * HomePageComposer
 * Layout orchestrator — balanced, content-rich homepage
 * 
 * v4.1 BALANCED LAYOUT:
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │  0. StickySearchBar (Floating on scroll)                   │
 * │  1. Hero (h1 tagline + search + trust strip)               │
 * │  2. Our Cars (real user listings — 4×3)                    │
 * │  3. Featured Showcase (premium/featured listings)          │
 * │  4. Smart Recommendations (personalized — logged-in)       │
 * │  5. AI Analysis Banner (feature explanation)               │
 * │  6. Vehicle Classifications (SUV, Sedan, etc.)             │
 * │  7. Popular Brands                                         │
 * │  8. Most Demanded Categories (AI Trending)                 │
 * │  9. Visual Search Teaser (AI visual search)                │
 * │ 10. Cars Showcase (main browsing grid)                     │
 * │ 11. Life Moments (emotional discovery)                     │
 * │ 12. Smart Sell (CTA)                                       │
 * │ 13. Dealers                                                │
 * │ 14. Trust & Stats                                          │
 * │ CONDITIONAL: Recent Browsing (returning users only)        │
 * │ FLOATING: AI Chatbot + Draft Recovery                      │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * @clean no business logic, only layout arrangement
 * @performance all sections lazy loaded
 */
/**
 * Slot: Pricing Plans & Subscriptions
 */
const PricingSlot: React.FC = () => (
  <LazySection rootMargin="100px" minHeight="500px">
    <Suspense fallback={null}>
      <PricingSlotWrapper />
    </Suspense>
  </LazySection>
);

const SECTION_MAP: Record<string, React.FC> = {
  hero: HeroSlot,
  our_cars: OurCarsSlot,
  featured_showcase: FeaturedShowcaseSlot,
  smart_recommendations: SmartHeroSlot,
  ai_analysis_banner: AIAnalysisBannerSlot,
  vehicle_classifications: VehicleClassificationsSlot,
  popular_brands: PopularBrandsSlot,
  most_demanded: MostDemandedCategoriesSlot,
  visual_search: VisualSearchTeaserSlot,
  cars_showcase: UnifiedCarsShowcaseSlot,
  life_moments: LifeMomentsBrowseSlot,
  smart_sell: UnifiedSmartSellSlot,
  dealers: DealersSlot,
  trust_stats: TrustSlot,
  pricing_plans: PricingSlot,
  kat_services: KATServicesSlot,
  hero_strips: HomeHeroStripsSlot,
  social: SocialSlot,
  loyalty: LoyaltySlot,
};

const HomePageComposer: React.FC = React.memo(() => {
  const { user } = useAuth();
  const hasRecentlyBrowsed = typeof window !== 'undefined' && localStorage.getItem('recentBrowsing');
  const { sections, isVisible } = useSectionVisibility();

  // Merge Firestore sections with defaults so newly-added sections
  // (e.g. kat_services) always appear even if Firestore is stale.
  const mergedSections = useMemo(() => {
    if (sections.length === 0) return [];
    const firestoreKeys = new Set(sections.map(s => s.key));
    return [
      ...sections,
      ...DEFAULT_HOMEPAGE_SECTIONS.filter(d => !firestoreKeys.has(d.key)),
    ];
  }, [sections]);

  return (
    <ComposerContainer>
      {/* 0. Sticky Search Bar (Floating - appears on scroll > 400px) */}
      {isVisible('sticky_search') && <StickySearchBar />}

      {/* Content Container (Max Width 1400px) */}
      <ContentContainer>
        {mergedSections.length > 0 ? (
          /* Dynamic Rendering based on sorted 'main' sections */
          mergedSections
            .filter(section => section.category === 'main' && section.visible)
            .sort((a, b) => a.order - b.order)
            .map(section => {
              const Component = SECTION_MAP[section.key];
              if (!Component) return null;
              return (
                <React.Fragment key={section.key}>
                  <Component />
                  <SectionSpacer />
                </React.Fragment>
              );
            })
        ) : (
          /* Fallback — Balanced 14-Section Default Order */
          <>
            <HeroSlot /><SectionSpacer />
            <KATServicesSlot /><SectionSpacer />
            <OurCarsSlot /><SectionSpacer />
            <FeaturedShowcaseSlot /><SectionSpacer />
            <SmartHeroSlot /><SectionSpacer />
            <AIAnalysisBannerSlot /><SectionSpacer />
            <VehicleClassificationsSlot /><SectionSpacer />
            <PopularBrandsSlot /><SectionSpacer />
            <MostDemandedCategoriesSlot /><SectionSpacer />
            <VisualSearchTeaserSlot /><SectionSpacer />
            <UnifiedCarsShowcaseSlot /><SectionSpacer />
            <LifeMomentsBrowseSlot /><SectionSpacer />
            <UnifiedSmartSellSlot /><SectionSpacer />
            <DealersSlot /><SectionSpacer />
            <TrustSlot /><SectionSpacer />
            <SocialSlot /><SectionSpacer />
            <LoyaltySlot /><SectionSpacer />
            <HomeHeroStripsSlot /><SectionSpacer />
            <PricingSlot />
          </>
        )}

        {/* CONDITIONAL: RECENT BROWSING (returning users only) */}
        {isVisible('recent_browsing') && hasRecentlyBrowsed && (
          <>
            <SectionSpacer />
            <RecentBrowsingSlot />
          </>
        )}
      </ContentContainer>

      {/* SEO: FAQ Schema (visible accordion + JSON-LD) */}
      <Suspense fallback={null}>
        <FAQSchema faqs={HOMEPAGE_FAQS} visible />
      </Suspense>

      {/* SEO: Internal linking footer */}
      <Suspense fallback={null}>
        <SEOFooterLinks />
      </Suspense>

      {/* FLOATING COMPONENTS */}
      {isVisible('ai_chatbot') && <AIChatbotSlot />}
      {isVisible('draft_recovery') && <DraftRecoverySlot />}
    </ComposerContainer>
  );
});

HomePageComposer.displayName = 'HomePageComposer';

export default HomePageComposer;
