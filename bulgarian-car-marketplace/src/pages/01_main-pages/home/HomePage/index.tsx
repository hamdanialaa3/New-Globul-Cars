// src/pages/HomePage/index.tsx
// Main HomePage component that composes all sections

import React, { Suspense } from 'react';
import styled from 'styled-components';
import HeroSection from './HeroSection';
import VehicleClassificationsSection from './VehicleClassificationsSection';
import MostDemandedCategoriesSection from './MostDemandedCategoriesSection';
import RecentBrowsingSection from './RecentBrowsingSection';

// Lazy loaded components - Local imports where available
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));
const LifeMomentsBrowse = React.lazy(() => import('./LifeMomentsBrowse'));
const SocialMediaSection = React.lazy(() => import('./SocialMediaSection'));
const DealerSpotlight = React.lazy(() => import('./DealerSpotlight'));
const LoyaltyBanner = React.lazy(() => import('./LoyaltyBanner'));

// Components created in this folder
const AIAnalyticsTeaser = React.lazy(() => import('./AIAnalyticsTeaser'));
const SmartSellStrip = React.lazy(() => import('./SmartSellStrip'));

// Global components
// AIChatbot uses named export, so we map it to default for React.lazy
const AIChatbot = React.lazy(() => import('@/components/AI/AIChatbot').then(module => ({ default: module.AIChatbot })));
const LazySection = React.lazy(() => import('@/components/LazySection'));

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
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      {/* 1. Hero Section - Critical (No Lazy Load) */}
      <HeroSection />

      <SectionSpacer />

      {/* 2. Popular Brands Section - MOVED TO TOP */}
      <LazySection rootMargin="0px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Зареждане на марки...</LoadingFallback>}>
          <PopularBrandsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 3. Featured Cars Section - MOVED TO TOP */}
      <LazySection rootMargin="0px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Зареждане на автомобили...</LoadingFallback>}>
          <FeaturedCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 4. Life Moments Browse - MOVED TO TOP */}
      <LazySection rootMargin="0px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Зареждане...</LoadingFallback>}>
          <LifeMomentsBrowse />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 5. Social Media & Community - MOVED TO TOP */}
      <LazySection rootMargin="0px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Зареждане на общност...</LoadingFallback>}>
          <SocialMediaSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 6. NEW: Vehicle Classifications (Smart Section) */}
      <VehicleClassificationsSection />

      <SectionSpacer />

      {/* 7. NEW: Most Demanded Categories (AI Section) */}
      <MostDemandedCategoriesSection />

      <SectionSpacer />

      {/* 8. AI Analytics Teaser */}
      <LazySection rootMargin="200px">
        <Suspense fallback={null}>
          <AIAnalyticsTeaser />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 9. Smart Sell Strip */}
      <LazySection rootMargin="100px">
        <Suspense fallback={null}>
          <SmartSellStrip />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 10. Dealer Spotlight */}
      <LazySection rootMargin="200px">
        <Suspense fallback={null}>
          <DealerSpotlight />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 11. NEW: Recent Browsing History (Personalized) */}
      <RecentBrowsingSection />

      <SectionSpacer />

      {/* 12. Loyalty Banner */}
      <LazySection rootMargin="100px">
        <Suspense fallback={null}>
          <LoyaltyBanner />
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