/**
 * HomePageComposer.tsx
 * Композитор на началната страница - Page Layout Orchestrator
 * HomePage Composer - Layout Manager for HomePage Sections
 * 
 * ✅ UPDATED: January 28, 2026 - Major Upgrade
 * - Added StickySearchBar
 * - Enabled VehicleClassificationsSection, DriveTypeShowcaseSection, RecentBrowsingSection
 * - Reorganized section order for better UX
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
import LazySection from '../../../../components/LazySection';

// Import section components
import UnifiedHeroSection from './UnifiedHeroSection';
import StickySearchBar from './StickySearchBar'; // ✅ NEW: Sticky Search Bar
import SmartHeroRecommendations from './SmartHeroRecommendations'; // ✅ NEW: Smart Recommendations
import FeaturedShowcase from './FeaturedShowcase';
import UnifiedCarsShowcase from './UnifiedCarsShowcase';
import SmartSellStrip from './SmartSellStrip';
import { GridSectionWrapper } from './GridSectionWrapper';
import UnifiedDealer from './UnifiedDealer';
import RecentBrowsingSection from './RecentBrowsingSection'; // ✅ ENABLED
import UnifiedSocial from './UnifiedSocial';
import HomeTrustAndStats from './HomeTrustAndStats';
import HomeLoyaltyAndSignup from './HomeLoyaltyAndSignup';
import LinkableSection from './LinkableSection';

// Import individual shortcut sections (previously unified)
import PopularBrandsSection from './PopularBrandsSection';
import VehicleClassificationsSection from './VehicleClassificationsSection'; // ✅ ENABLED
import DriveTypeShowcaseSection from './DriveTypeShowcaseSection'; // ✅ ENABLED
import MostDemandedCategoriesSection from './MostDemandedCategoriesSection';
import CategoriesSection from './CategoriesSection';
import QuickBrandsSection from './QuickBrandsSection';
import LifeMomentsBrowse from './LifeMomentsBrowse';

// ✨ AI SMART SELL BUTTON (January 22, 2026)
import AISmartSellButton from './AISmartSellButton';

// Global components (lazy loaded)
const AIChatbot = React.lazy(() => import('../../../../components/AI/AIChatbot'));

// ✅ REVENUE FIX: Draft Recovery Prompt (January 6, 2026)
const DraftRecoveryPrompt = React.lazy(() => import('./DraftRecoveryPrompt'));

// ✅ AI PRICING INTEGRATION (January 18, 2026)
const AIPricingBanner = React.lazy(() => import('../../../../components/HomePage/AIPricingBanner'));

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

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    padding: 0 16px; /* mobile.de mobile: 16px padding */
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
// SECTION SLOTS
// ============================================================================

/**
 * Slot 1: Hero Section
 * Strong entry with search / Силен вход с търсене
 */
const HeroSlot: React.FC = () => (
  <UnifiedHeroSection />
);

/**
 * Slot 1.2: Smart Hero Recommendations
 * AI-powered personalized car recommendations / Персонализирани препоръки
 * ✅ NEW: Displays cars based on user behavior and preferences
 */
const SmartHeroSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="50px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <SmartHeroRecommendations />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 1.5: AI Smart Sell Button  
 * AI-powered car listing CTA / بائع ذكي مدعوم بالذكاء الاصطناعي
 */
const AISmartSellSlot: React.FC = () => (
  <AISmartSellButton />
);

/**
 * Slot 2: Featured Showcase
 * Premium featured cars showcase / Премиум витрина за избрани автомобили
 */
const FeaturedShowcaseSlot: React.FC = () => (
  <LazySection rootMargin="100px">
    <Suspense fallback={null}>
      <FeaturedShowcase />
    </Suspense>
  </LazySection>
);

/**
 * Slot 3: Smart Sell Strip
 * Car sell invitation / Покана за продажба на кола
 */
const SmartSellSlot: React.FC = () => (
  <GridSectionWrapper intensity="medium" variant="ai">
    <LazySection rootMargin="100px">
      <Suspense fallback={null}>
        <SmartSellStrip />
      </Suspense>
    </LazySection>
  </GridSectionWrapper>
);

/**
 * Slot 4: Cars Showcase (Unified)
 * Car showcase (Latest/Featured/New) - with tabs
 * Витрина на автомобили - с раздели
 */
const CarsShowcaseSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LinkableSection
      title="Latest Cars"
      titleAr="أحدث السيارات"
      viewAllLink="/view-all-new-cars"
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
 * Slot 5: Popular Brands
 * Популярни марки автомобили
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
 * Slot 6: Vehicle Classifications
 * Категории автомобили
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
 * Slot 6.5: Drive Type Showcase
 * عرض السيارات حسب نوع الدفع
 */
const DriveTypeShowcaseSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <DriveTypeShowcaseSection />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 7: Most Demanded Categories
 * Най-търсени категории
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
 * Slot 8: Quick Brands
 * Бързи марки
 */
const QuickBrandsSlot: React.FC = () => {
  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={null}>
        <QuickBrandsSection />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 9: Categories Section
 * Популярни категории
 */
const CategoriesSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <CategoriesSection />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 10: Life Moments Browse
 * Колата за вашия момент
 */
const LifeMomentsSlot: React.FC = () => {
  return (
    <LazySection rootMargin="100px">
      <Suspense fallback={null}>
        <LifeMomentsBrowse />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 11: Dealer Spotlight (Unified)
 * Featured dealers - Unified / Препоръчани дилъри - Обединени
 */
const DealersSlot: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LinkableSection
      title="Featured Dealers"
      titleAr="الوكلاء المميزون"
      viewAllLink="/view-all-dealers"
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
 * Slot 11 (original - keep for reference)
 */
const DealersSlotOriginal: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LazySection rootMargin="200px">
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <UnifiedDealer />
      </Suspense>
    </LazySection>
  );
};

/**
 * Slot 12: Social Experience (Unified)
 * المحتوى الاجتماعي والـ AI - موحد
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
 * Slot 13: Trust & Stats
 * الثقة والإحصائيات
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
 * Slot 14: Recent Browsing
 * السيارات المشاهدة مؤخراً
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
 * Slot 15: Loyalty & Signup
 * البانرات والدعوات
 */
const LoyaltySlot: React.FC = () => (
  <LazySection rootMargin="200px">
    <Suspense fallback={null}>
      <HomeLoyaltyAndSignup />
    </Suspense>
  </LazySection>
);

/**
 * Slot 16: AI Chatbot
 * مساعد الذكاء الاصطناعي العائم
 */
const AIChatbotSlot: React.FC = () => (
  <Suspense fallback={null}>
    <AIChatbot />
  </Suspense>
);

/**
 * Slot 17: Draft Recovery Prompt
 * ✅ REVENUE FIX: Recover abandoned sell workflow drafts
 * استرداد مسودات إعلانات البيع غير المكتملة
 */
const DraftRecoverySlot: React.FC = () => (
  <Suspense fallback={null}>
    <DraftRecoveryPrompt delay={3000} />
  </Suspense>
);

/**
 * Slot 18: AI Pricing Banner
 * 🤖 Promotional banner for AI-powered car pricing calculator
 * شريط ترويجي لحاسبة تسعير السيارات بالذكاء الاصطناعي
 */
const PricingBannerSlot: React.FC = () => (
  <GridSectionWrapper intensity="light" variant="modern">
    <LazySection rootMargin="200px">
      <Suspense fallback={null}>
        <AIPricingBanner />
      </Suspense>
    </LazySection>
  </GridSectionWrapper>
);

// ============================================================================
// MAIN COMPOSER
// ============================================================================

/**
 * HomePageComposer
 * Композитор на началната страница - HomePage Composer
 * HomePage Composer - Combines all sections in specific order
 * 
 * ✅ UPDATED ORDER (January 28, 2026) - European Marketplace Standard:
 * 1. StickySearchBar (Floating - appears on scroll)
 * 2. Hero Section (Search Widget)
 * 3. Vehicle Classifications (Body Types) - ✅ ENABLED
 * 4. Featured Showcase (Real Firestore Data) - ✅ FIXED
 * 5. Recent Browsing (User History) - ✅ ENABLED
 * 6. Drive Type Showcase (Electric/Hybrid/4x4) - ✅ ENABLED
 * 7. Latest Cars Showcase (Tabbed)
 * 8. Popular Brands
 * 9. Most Demanded Categories
 * 10. AI Smart Sell Strip
 * 11. Dealers Spotlight
 * 12. Trust & Stats
 * 13. Social Experience
 * 14. Loyalty & Signup
 * 15. AI Chatbot (Floating)
 * 
 * @clean no business logic, only layout arrangement
 * @flexible easy to reorder sections
 * @performance optimized lazy loading
 */
const HomePageComposer: React.FC = React.memo(() => {
  return (
    <ComposerContainer>
      {/* ✅ NEW: Sticky Search Bar (Floating - appears on scroll > 400px) */}
      <StickySearchBar />

      {/* Content Container (Max Width 1400px) */}
      <ContentContainer>
        {/* 1. Hero Section - CRITICAL (Main Search Entry Point) */}
        <HeroSlot />
        
        {/* ✅ NEW: Smart Hero Recommendations (AI-Powered Personalization) */}
        <SmartHeroSlot />
        <SectionSpacer />
        
        {/* ✨ AI Smart Sell Button - Quick CTA */}
        <AISmartSellSlot />
        <SectionSpacer />

        {/* 2. ✅ ENABLED: Vehicle Classifications (Body Types - Sedan, SUV, Hatchback) */}
        <VehicleClassificationsSlot />
        <SectionSpacer />
        
        {/* 3. Featured Showcase - ✅ FIXED: Real Firestore Data */}
        <FeaturedShowcaseSlot />
        <SectionSpacer />

        {/* 4. ✅ ENABLED: Recent Browsing (User's Viewing History) */}
        <RecentBrowsingSlot />
        <SectionSpacer />

        {/* 5. ✅ ENABLED: Drive Type Showcase (Electric/Hybrid/4x4 Focus) */}
        <DriveTypeShowcaseSlot />
        <SectionSpacer />

        {/* 6. Cars Showcase - Tabbed (Latest/New/Featured) */}
        <CarsShowcaseSlot />
        <SectionSpacer />

        {/* 7. Popular Brands */}
        <PopularBrandsSlot />
        <SectionSpacer />

        {/* 8. Most Demanded Categories */}
        <MostDemandedCategoriesSlot />
        <SectionSpacer />

        {/* 9. Smart Sell Strip */}
        <SmartSellSlot />
        <SectionSpacer />

        {/* 10. AI Pricing Calculator Banner */}
        <PricingBannerSlot />
        <SectionSpacer />

        {/* 11. Dealer Spotlight */}
        <DealersSlot />
        <SectionSpacer />

        {/* 12. Trust & Stats */}
        <TrustSlot />
        <SectionSpacer />

        {/* 13. Social Experience */}
        <SocialSlot />
        <SectionSpacer />

        {/* 14. Loyalty & Signup */}
        <LoyaltySlot />
      </ContentContainer>

      {/* Floating Components */}
      {/* AI Chatbot */}
      <AIChatbotSlot />

      {/* ✅ REVENUE FIX: Draft Recovery Prompt (Floating Toast) */}
      <DraftRecoverySlot />
    </ComposerContainer>
  );
});

HomePageComposer.displayName = 'HomePageComposer';

export default HomePageComposer;