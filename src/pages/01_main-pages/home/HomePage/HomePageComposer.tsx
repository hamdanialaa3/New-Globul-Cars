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

import React, { Suspense } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useAuth } from '../../../../contexts/AuthProvider';
import { useSectionVisibility } from '../../../../hooks/useSectionVisibility';
import LazySection from '../../../../components/LazySection';

// ============================================================================
// CORE SECTION IMPORTS
// ============================================================================

// 1. Hero & Search
import UnifiedHeroSection from './UnifiedHeroSection';
import StickySearchBar from './StickySearchBar';

// 2. 🆕 UNIQUE FEATURES (Competitive Advantage)
import VisualSearchTeaser from './VisualSearchTeaser';  // ✅ NEW: Visual Search - NO COMPETITOR HAS THIS!
import LifeMomentsBrowse from './LifeMomentsBrowse';    // ✅ NEW: Emotional Discovery
import AIAnalysisBanner from './AIAnalysisBanner';      // ✅ NEW: AI Analysis Banner with explanation

// 3. Car Discovery
import VehicleClassificationsSection from './VehicleClassificationsSection';
import UnifiedCarsShowcase from './UnifiedCarsShowcase';
import FeaturedShowcase from './FeaturedShowcase';
import PopularBrandsSection from './PopularBrandsSection';
import MostDemandedCategoriesSection from './MostDemandedCategoriesSection';
import OurCarsShowcase from './OurCarsShowcase';

// 4. Personalization (Conditional)
import SmartHeroRecommendations from './SmartHeroRecommendations';
import RecentBrowsingSection from './RecentBrowsingSection';

// 5. Selling CTA
import UnifiedSmartSell from './UnifiedSmartSell';  // ✅ NEW: Merged SmartSellStrip + AISmartSellButton

// 6. Trust & Social
import UnifiedDealer from './UnifiedDealer';
import HomeTrustAndStats from './HomeTrustAndStats';
import UnifiedSocial from './UnifiedSocial';
import HomeLoyaltyAndSignup from './HomeLoyaltyAndSignup';

// 7. Utilities
import { GridSectionWrapper } from './GridSectionWrapper';
import LinkableSection from './LinkableSection';

// 🆕 Smart Strips (mobile.de parity)
import { HomeHeroStrips } from '../../../../components/home/HomeHeroStrips';

// Global components (lazy loaded)
const AIChatbot = React.lazy(() => import('../../../../components/AI/AIChatbot'));

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
// SECTION SLOTS - GOLDEN ORDER (February 3, 2026)
// ============================================================================

/**
 * Slot 1: Hero Section
 * Strong entry with search / Силен вход с търсене
 */
const HeroSlot: React.FC = () => (
  <UnifiedHeroSection />
);

/**
 * Slot 2: 🆕 AI Analysis Banner
 * Eye-catching banner explaining AI car analysis flow
 * شريط شرح تحليل السيارات بالذكاء الاصطناعي
 */
const AIAnalysisBannerSlot: React.FC = () => (
  <LazySection rootMargin="50px">
    <Suspense fallback={null}>
      <AIAnalysisBanner />
    </Suspense>
  </LazySection>
);

/**
 * Slot: 🆕 Our Cars Showcase (Нашите коли)
 * All real user-added listings — 4×3 grid on desktop
 * عرض جميع إعلانات المستخدمين الحقيقية
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
 * Slot 3: 🆕 Visual Search Teaser
 * UNIQUE COMPETITIVE ADVANTAGE - No competitor has this!
 * البحث بالصورة - ميزة حصرية!
 */
const VisualSearchSlot: React.FC = () => (
  <LazySection rootMargin="50px">
    <Suspense fallback={null}>
      <VisualSearchTeaser />
    </Suspense>
  </LazySection>
);

/**
 * Slot 4: Vehicle Classifications
 * Body types + Drive types combined / تصنيفات المركبات
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
 * Slot 5: 🆕 Life Moments Browse
 * Emotional car discovery - Find car for your life moment
 * اكتشاف السيارة حسب لحظات الحياة
 */
const LifeMomentsSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}>
      <LifeMomentsBrowse />
    </Suspense>
  </LazySection>
);

/**
 * Slot 6: Cars Showcase (Main Content)
 * Car showcase (Latest/Featured/New) - with tabs
 * العرض الرئيسي للسيارات
 */
const CarsShowcaseSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LinkableSection
      title="Latest Cars"
      titleAr="أحدث السيارات"
      viewAllLink="/cars"
      viewAllText="View All"
      viewAllTextAr="عرض الكل"
    >
      <LazySection rootMargin="100px">
        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
          <UnifiedCarsShowcase />
        </Suspense>
      </LazySection>
    </LinkableSection>
  );
};

/**
 * Slot 6: Popular Brands
 * العلامات التجارية الشهيرة
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
 * Slot 7: Most Demanded Categories
 * الفئات الأكثر طلباً (AI Trending)
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
 * Slot 8: Featured Showcase (VIP Cars)
 * Premium featured cars / السيارات المميزة VIP
 */
const FeaturedShowcaseSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}>
      <FeaturedShowcase />
    </Suspense>
  </LazySection>
);

/**
 * Slot 9: Smart Hero Recommendations (For Logged-in Users)
 * AI-powered personalized recommendations / توصيات AI مخصصة
 * Shows only for authenticated users
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
 * Slot 10: 🆕 Unified Smart Sell (Merged CTA)
 * Combined SmartSellStrip + AISmartSellButton
 * CTA موحد للبيع الذكي
 */
const UnifiedSmartSellSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}>
      <UnifiedSmartSell />
    </Suspense>
  </LazySection>
);

/**
 * Slot 11: Dealer Spotlight
 * التجار المعتمدون + Trust Badges
 */
const DealersSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LinkableSection
      title="Featured Dealers"
      titleAr="الوكلاء المميزون"
      viewAllLink="/dealers"
      viewAllText="View All Dealers"
      viewAllTextAr="عرض جميع الوكلاء"
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
 * Slot 12: Trust & Stats (Compact)
 * الثقة والإحصائيات - مضغوط
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
 * Slot 13: Social Experience
 * الدليل الاجتماعي والمراجعات
 */
const SocialSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <UnifiedSocial />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 14: Loyalty & Signup
 * الاشتراكات + برنامج الولاء
 */
const LoyaltySlot: React.FC = () => (
  <LazySection rootMargin="200px">
    <Suspense fallback={null}>
      <HomeLoyaltyAndSignup />
    </Suspense>
  </LazySection>
);

/**
 * Slot CONDITIONAL: Recent Browsing
 * يظهر فقط للمستخدمين العائدين
 */
const RecentBrowsingSlot: React.FC = () => (
  <GridSectionWrapper intensity="light" variant="modern">
    <LazySection rootMargin="100px" minHeight="200px">
      <Suspense fallback={null}>
        <RecentBrowsingSection />
      </Suspense>
    </LazySection>
  </GridSectionWrapper>
);

/**
 * Floating: AI Chatbot
 * مساعد الذكاء الاصطناعي العائم
 */
const AIChatbotSlot: React.FC = () => (
  <Suspense fallback={null}>
    <AIChatbot />
  </Suspense>
);

/**
 * Floating: Draft Recovery Prompt
 * ✅ REVENUE FIX: Recover abandoned sell workflow drafts
 */
const DraftRecoverySlot: React.FC = () => (
  <Suspense fallback={null}>
    <DraftRecoveryPrompt delay={3000} />
  </Suspense>
);

// ============================================================================
// MAIN COMPOSER - GOLDEN ORDER (February 3, 2026)
// ============================================================================

/**
 * HomePageComposer
 * Композитор на началната страница - HomePage Composer
 * HomePage Composer - Combines all sections in optimized order
 * 
 * 🏆 GOLDEN ORDER (February 3, 2026) - Competitive Edge:
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │  0. StickySearchBar (Floating on scroll)                   │
 * │  1. Hero Section (Main search entry)                       │
 * │  2. 🆕 Visual Search Teaser (UNIQUE - No competitor!)      │
 * │  3. Vehicle Classifications (Body types + Drive)           │
 * │  4. 🆕 Life Moments Browse (Emotional discovery)           │
 * │  5. Cars Showcase (Main content - Latest/New/Featured)     │
 * │  6. Popular Brands                                         │
 * │  7. Most Demanded Categories (AI Trending)                 │
 * │  8. Featured Showcase (VIP Cars)                           │
 * │  9. Smart Recommendations (For logged-in users)            │
 * │ 10. 🆕 Unified Smart Sell (Merged CTA)                     │
 * │ 11. Dealers Spotlight                                      │
 * │ 12. Trust & Stats (Compact)                                │
 * │ 13. Social Experience                                      │
 * │ 14. Loyalty & Signup                                       │
 * │ CONDITIONAL: Recent Browsing (Returning users only)        │
 * │ FLOATING: AI Chatbot + Draft Recovery                      │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * @clean no business logic, only layout arrangement
 * @flexible easy to reorder sections
 * @performance optimized lazy loading
 * @competitive unique features highlighted at top
 */
const SECTION_MAP: Record<string, React.FC> = {
  hero: HeroSlot,
  our_cars: OurCarsSlot,
  smart_recommendations: SmartHeroSlot,
  ai_analysis_banner: AIAnalysisBannerSlot,
  hero_strips: HomeHeroStrips,
  visual_search: VisualSearchSlot,
  vehicle_classifications: VehicleClassificationsSlot,
  life_moments: LifeMomentsSlot,
  cars_showcase: CarsShowcaseSlot,
  popular_brands: PopularBrandsSlot,
  most_demanded: MostDemandedCategoriesSlot,
  featured_showcase: FeaturedShowcaseSlot,
  smart_sell: UnifiedSmartSellSlot,
  dealers: DealersSlot,
  trust_stats: TrustSlot,
  social: SocialSlot,
  loyalty: LoyaltySlot,
  // Conditional sections handled separately
};

const HomePageComposer: React.FC = React.memo(() => {
  // Check if user is authenticated for conditional sections
  const { user } = useAuth();
  const hasRecentlyBrowsed = typeof window !== 'undefined' && localStorage.getItem('recentBrowsing');
  const { sections, isVisible } = useSectionVisibility();

  return (
    <ComposerContainer>
      {/* 0. Sticky Search Bar (Floating - appears on scroll > 400px) */}
      {isVisible('sticky_search') && <StickySearchBar />}

      {/* Content Container (Max Width 1400px) */}
      <ContentContainer>
        {sections.length > 0 ? (
          /* Dynamic Rendering based on sorted 'main' sections */
          sections
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
          /* Fallback while loading config or if empty - Default Order */
          <>
            <HeroSlot /><SectionSpacer />
            <OurCarsSlot /><SectionSpacer />
            <SmartHeroSlot /><SectionSpacer />
            <AIAnalysisBannerSlot /><SectionSpacer />
            <HomeHeroStrips /><SectionSpacer />
            <VisualSearchSlot /><SectionSpacer />
            <VehicleClassificationsSlot /><SectionSpacer />
            <LifeMomentsSlot /><SectionSpacer />
            <CarsShowcaseSlot /><SectionSpacer />
            <PopularBrandsSlot /><SectionSpacer />
            <MostDemandedCategoriesSlot /><SectionSpacer />
            <FeaturedShowcaseSlot /><SectionSpacer />
            <UnifiedSmartSellSlot /><SectionSpacer />
            <DealersSlot /><SectionSpacer />
            <TrustSlot /><SectionSpacer />
            <SocialSlot /><SectionSpacer />
            <LoyaltySlot />
          </>
        )}

        {/* CONDITIONAL: RECENT BROWSING                                    */}
        {/* Shows only for returning users with browsing history            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {isVisible('recent_browsing') && hasRecentlyBrowsed && (
          <>
            <SectionSpacer />
            <RecentBrowsingSlot />
          </>
        )}
      </ContentContainer>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FLOATING COMPONENTS                                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* AI Chatbot */}
      {isVisible('ai_chatbot') && <AIChatbotSlot />}

      {/* Draft Recovery Prompt (Floating Toast) */}
      {isVisible('draft_recovery') && <DraftRecoverySlot />}
    </ComposerContainer>
  );
});

HomePageComposer.displayName = 'HomePageComposer';

export default HomePageComposer;