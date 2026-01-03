/**
 * HomePageComposer.tsx
 * Композитор на началната страница - Page Layout Orchestrator
 * HomePage Composer - Layout Manager for HomePage Sections
 * 
 * Single responsibility / Единствена отговорност: Arrange and organize HomePage sections
 * - No business logic / Без бизнес логика
 * - Works as layout manager only / Работи само като мениджър на оформление
 * - Uses existing components as-is / Използва съществуващите компоненти както са
 * - Clear and easy to maintain / Ясен и лесен за поддръжка
 * 
 * Sections (Slots) / Секции (Слотове):
 * 1. hero - Strong entry (Hero Section)
 * 2. smartSell - Car sell invitation (Smart Sell Strip)
 * 3. carsShowcase - Car showcase (Latest/Featured/New)
 * 4. shortcuts - Brands & Categories (Brands & Categories)
 * 5. dealers - Featured dealers (Dealer Spotlight)
 * 6. social - Social content (Social Experience)
 * 7. trust - Trust & Statistics (Trust & Stats)
 * 8. recentBrowsing - Recently viewed cars (Recent Browsing)
 * 9. loyalty - Banners & Invitations (Loyalty & Signup)
 * 10. aiChatbot - Floating AI Assistant (AI Chatbot)
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
import FeaturedShowcase from './FeaturedShowcase';
import UnifiedCarsShowcase from './UnifiedCarsShowcase';
import SmartSellStrip from './SmartSellStrip';
import { GridSectionWrapper } from './GridSectionWrapper';
import UnifiedDealer from './UnifiedDealer';
import RecentBrowsingSection from './RecentBrowsingSection';
import UnifiedSocial from './UnifiedSocial';
import HomeTrustAndStats from './HomeTrustAndStats';
import HomeLoyaltyAndSignup from './HomeLoyaltyAndSignup';
import LinkableSection from './LinkableSection';

// Import individual shortcut sections (previously unified)
import PopularBrandsSection from './PopularBrandsSection';
import VehicleClassificationsSection from './VehicleClassificationsSection';
import DriveTypeShowcaseSection from './DriveTypeShowcaseSection';
import MostDemandedCategoriesSection from './MostDemandedCategoriesSection';
import CategoriesSection from './CategoriesSection';
import QuickBrandsSection from './QuickBrandsSection';
import LifeMomentsBrowse from './LifeMomentsBrowse';

// Global components (lazy loaded)
const AIChatbot = React.lazy(() => import('../../../../components/AI/AIChatbot'));

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
  will-change: auto;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: layout style paint;
`;

const SectionSpacer = styled.div`
  height: 40px;
  @media (max-width: 768px) {
    height: 24px;
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

// ============================================================================
// MAIN COMPOSER
// ============================================================================

/**
 * HomePageComposer
 * Композитор на началната страница - HomePage Composer
 * HomePage Composer - Combines all sections in specific order
 * 
 * Current order (from top to bottom) / Текущ ред (отгоре надолу):
 * 1. Hero → 2. FeaturedShowcase → 3. SmartSell → 4. Cars → 5. Popular Brands
 * 6. Vehicle Classifications → 7. Most Demanded Categories
 * 8. Quick Brands → 9. Categories → 10. Life Moments
 * 11. Dealers → 12. Social → 13. Trust → 14. Recent
 * 15. Loyalty → 16. AI Chatbot
 * 
 * @clean no business logic, only layout arrangement
 * @flexible easy to reorder sections
 * @performance optimized lazy loading
 */
const HomePageComposer: React.FC = React.memo(() => {
  return (
    <ComposerContainer>
      {/* Slot 1: Hero Section */}
      <HeroSlot />
      <SectionSpacer />

      {/* Slot 2: Featured Showcase */}
      <FeaturedShowcaseSlot />
      <SectionSpacer />

      {/* Slot 3: Smart Sell Strip */}
      <SmartSellSlot />
      <SectionSpacer />

      {/* Slot 4: Cars Showcase */}
      <CarsShowcaseSlot />
      <SectionSpacer />

      {/* Slot 5: Popular Brands */}
      <PopularBrandsSlot />
      <SectionSpacer />

      {/* Slot 6: Vehicle Classifications */}
      <VehicleClassificationsSlot />
      <SectionSpacer />

      {/* Slot 6.5: Drive Type Showcase */}
      <DriveTypeShowcaseSlot />
      <SectionSpacer />

      {/* Slot 7: Most Demanded Categories */}
      <MostDemandedCategoriesSlot />
      <SectionSpacer />

      {/* Slot 8: Quick Brands */}
      <QuickBrandsSlot />
      <SectionSpacer />

      {/* Slot 9: Categories Section */}
      <CategoriesSlot />
      <SectionSpacer />

      {/* Slot 10: Life Moments Browse */}
      <LifeMomentsSlot />
      <SectionSpacer />

      {/* Slot 11: Dealer Spotlight */}
      <DealersSlot />
      <SectionSpacer />

      {/* Slot 12: Social Experience */}
      <SocialSlot />
      <SectionSpacer />

      {/* Slot 13: Trust & Stats */}
      <TrustSlot />
      <SectionSpacer />

      {/* Slot 14: Recent Browsing */}
      <RecentBrowsingSlot />
      <SectionSpacer />

      {/* Slot 15: Loyalty & Signup */}
      <LoyaltySlot />

      {/* Slot 16: AI Chatbot (Floating) */}
      <AIChatbotSlot />
    </ComposerContainer>
  );
});

HomePageComposer.displayName = 'HomePageComposer';

export default HomePageComposer;