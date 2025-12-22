// src/pages/HomePage/index.tsx
// Main HomePage component that composes all sections

import React, { Suspense } from 'react';
import styled from 'styled-components';
import NewHeroSection from './NewHeroSection';

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

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      {/* 1. Hero Section - Critical (No Lazy Load) */}
      <NewHeroSection />

      <SectionSpacer />

      {/* 2. New Cars Section - Latest Added (Last 24 Hours) */}
      <LazySection rootMargin="100px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Зареждане на нови обяви...</LoadingFallback>}>
          <NewCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 3. Featured Cars Section (high-intent inventory) */}
      <LazySection rootMargin="0px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Зареждане на автомобили...</LoadingFallback>}>
          <FeaturedCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 4. Latest Cars - Fresh inventory */}
      <LazySection rootMargin="100px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Зареждане...</LoadingFallback>}>
          <LatestCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 5. Categories Section - Popular Categories */}
      <LazySection rootMargin="0px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Зареждане на категории...</LoadingFallback>}>
          <CategoriesSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 6. Life Moments Browse */}
      <LazySection rootMargin="0px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Зареждане...</LoadingFallback>}>
          <LifeMomentsBrowse />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 7. Popular Brands Section */}
      <LazySection rootMargin="0px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Зареждане на марки...</LoadingFallback>}>
          <PopularBrandsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 8. Trust Section - Why Choose Us */}
      <LazySection rootMargin="0px" minHeight="400px">
        <Suspense fallback={null}>
          <TrustSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 9. Vehicle Classifications (Smart Section) */}
      <LazySection rootMargin="100px" minHeight="300px">
        <Suspense fallback={null}>
          <VehicleClassificationsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 10. Most Demanded Categories (AI Section) */}
      <LazySection rootMargin="100px" minHeight="400px">
        <Suspense fallback={null}>
          <MostDemandedCategoriesSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 11. Dealer Spotlight */}
      <LazySection rootMargin="200px">
        <Suspense fallback={null}>
          <DealerSpotlight />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 12. Smart Sell Strip */}
      <LazySection rootMargin="100px">
        <Suspense fallback={null}>
          <SmartSellStrip />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 13. AI Analytics Teaser */}
      <LazySection rootMargin="200px">
        <Suspense fallback={null}>
          <AIAnalyticsTeaser />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 14. Recent Browsing History (Personalized) */}
      <LazySection rootMargin="100px" minHeight="200px">
        <Suspense fallback={null}>
          <RecentBrowsingSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 15. Loyalty Banner */}
      <LazySection rootMargin="100px">
        <Suspense fallback={null}>
          <LoyaltyBanner />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 16. Social Media & Community */}
      <LazySection rootMargin="0px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Зареждане на общност...</LoadingFallback>}>
          <SocialMediaSection />
        </Suspense>
      </LazySection>

      {/* Floating AI Chatbot */}
      <Suspense fallback={null}>
        <AIChatbot />
      </Suspense>
    </HomeContainer>
  );
};

export default HomePage;
