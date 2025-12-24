// src/pages/HomePage/index.tsx
// Main HomePage component that composes all sections

import React, { Suspense } from 'react';
import styled from 'styled-components';
import NewHeroSection from './NewHeroSection';
import GridSectionWrapper from './GridSectionWrapper';

// Lazy loaded components - Local imports
const VehicleClassificationsSection = React.lazy(() => import('./VehicleClassificationsSection'));
const MostDemandedCategoriesSection = React.lazy(() => import('./MostDemandedCategoriesSection'));
const RecentBrowsingSection = React.lazy(() => import('./RecentBrowsingSection'));
const LatestCarsSection = React.lazy(() => import('./LatestCarsSection'));
const NewCarsSection = React.lazy(() => import('./NewCarsSection'));
const CategoriesSection = React.lazy(() => import('./CategoriesSection'));
const TrustSection = React.lazy(() => import('./TrustSection'));
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));
const LifeMomentsBrowse = React.lazy(() => import('./LifeMomentsBrowse'));
const SocialMediaSection = React.lazy(() => import('./SocialMediaSection'));
const DealerSpotlight = React.lazy(() => import('./DealerSpotlight'));
const LoyaltyBanner = React.lazy(() => import('./LoyaltyBanner'));
const AIAnalyticsTeaser = React.lazy(() => import('./AIAnalyticsTeaser'));
const SmartSellStrip = React.lazy(() => import('./SmartSellStrip'));

// Global components
const AIChatbot = React.lazy(() => import('../../../../components/AI/AIChatbot'));

// LazySection is simple enough to import directly
import LazySection from '../../../../components/LazySection';

// Styled Components
const HomeContainer = styled.main`
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

// Memoize HomePage to prevent unnecessary re-renders
const HomePage: React.FC = React.memo(() => {
  return (
    <HomeContainer>
      {/* 1. Hero Section - Modern AI-Powered Entry */}
      <GridSectionWrapper intensity="light" variant="ai">
        <NewHeroSection />
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 2. New Cars Section - Latest Modern Vehicles */}
      <GridSectionWrapper intensity="medium" variant="modern">
        <LazySection rootMargin="100px" minHeight="400px">
          <Suspense fallback={<LoadingFallback>Зареждане на нови обяви...</LoadingFallback>}>
            <NewCarsSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 3. Featured Cars Section - Premium Future Selection */}
      <GridSectionWrapper intensity="strong" variant="future">
        <LazySection rootMargin="0px" minHeight="600px">
          <Suspense fallback={<LoadingFallback>Зареждане на автомобили...</LoadingFallback>}>
            <FeaturedCarsSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 4. Latest Cars - Fresh Modern Inventory */}
      <GridSectionWrapper intensity="medium" variant="modern">
        <LazySection rootMargin="100px" minHeight="500px">
          <Suspense fallback={<LoadingFallback>Зареждане...</LoadingFallback>}>
            <LatestCarsSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 5. Categories Section - Classic Car Types */}
      <GridSectionWrapper intensity="light" variant="vintage">
        <LazySection rootMargin="0px" minHeight="600px">
          <Suspense fallback={<LoadingFallback>Зареждане на категории...</LoadingFallback>}>
            <CategoriesSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 6. Life Moments Browse - Modern Lifestyle */}
      <GridSectionWrapper intensity="medium" variant="modern">
        <LazySection rootMargin="0px" minHeight="400px">
          <Suspense fallback={<LoadingFallback>Зареждане...</LoadingFallback>}>
            <LifeMomentsBrowse />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 7. Popular Brands Section - Heritage & Future */}
      <GridSectionWrapper intensity="strong" variant="vintage">
        <LazySection rootMargin="0px" minHeight="500px">
          <Suspense fallback={<LoadingFallback>Зареждане на марки...</LoadingFallback>}>
            <PopularBrandsSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 8. Trust Section - Modern Trust Building */}
      <GridSectionWrapper intensity="light" variant="modern">
        <LazySection rootMargin="0px" minHeight="400px">
          <Suspense fallback={null}>
            <TrustSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 9. Vehicle Classifications - Future Tech */}
      <GridSectionWrapper intensity="medium" variant="future">
        <LazySection rootMargin="100px" minHeight="300px">
          <Suspense fallback={null}>
            <VehicleClassificationsSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 10. Most Demanded Categories - AI Intelligence */}
      <GridSectionWrapper intensity="strong" variant="ai">
        <LazySection rootMargin="100px" minHeight="400px">
          <Suspense fallback={null}>
            <MostDemandedCategoriesSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 11. Dealer Spotlight - Professional Modern */}
      <GridSectionWrapper intensity="light" variant="modern">
        <LazySection rootMargin="200px">
          <Suspense fallback={null}>
            <DealerSpotlight />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 12. Smart Sell Strip - AI-Powered Selling */}
      <GridSectionWrapper intensity="medium" variant="ai">
        <LazySection rootMargin="100px">
          <Suspense fallback={null}>
            <SmartSellStrip />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 13. AI Analytics Teaser - Future Tech */}
      <GridSectionWrapper intensity="strong" variant="future">
        <LazySection rootMargin="200px">
          <Suspense fallback={null}>
            <AIAnalyticsTeaser />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 14. Recent Browsing History - Modern Personalized */}
      <GridSectionWrapper intensity="light" variant="modern">
        <LazySection rootMargin="100px" minHeight="200px">
          <Suspense fallback={null}>
            <RecentBrowsingSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 15. Loyalty Banner - Classic Trust */}
      <GridSectionWrapper intensity="medium" variant="vintage">
        <LazySection rootMargin="200px">
          <Suspense fallback={null}>
            <LoyaltyBanner />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      <SectionSpacer />

      {/* 16. Social Media & Community - Future Connected */}
      <GridSectionWrapper intensity="strong" variant="future">
        <LazySection rootMargin="0px" minHeight="300px">
          <Suspense fallback={<LoadingFallback>Зареждане на общност...</LoadingFallback>}>
            <SocialMediaSection />
          </Suspense>
        </LazySection>
      </GridSectionWrapper>

      {/* Floating AI Chatbot */}
      <Suspense fallback={null}>
        <AIChatbot />
      </Suspense>
    </HomeContainer>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
