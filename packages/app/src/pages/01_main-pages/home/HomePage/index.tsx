// src/pages/HomePage/index.tsx
// Main HomePage component that composes all sections

import React, { Suspense } from 'react';
import styled from 'styled-components';
import BusinessPromoBanner from '@globul-cars/ui/componentsBusinessPromoBanner';
import LazySection from '@globul-cars/ui/componentsLazySection';
import { AIChatbot } from '@globul-cars/ui/componentsAI';

// Lazy load all sections for better performance
const HeroSection = React.lazy(() => import('./HeroSection'));
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));
const LifeMomentsBrowse = React.lazy(() => import('@globul-cars/ui/components/HomePage/LifeMomentsBrowse'));
const SocialMediaSection = React.lazy(() => import('./SocialMediaSection'));

// Other sections
const VehicleClassificationsSection = React.lazy(() => import('./VehicleClassificationsSection'));
const MostDemandedCategoriesSection = React.lazy(() => import('./MostDemandedCategoriesSection'));
const RecentBrowsingSection = React.lazy(() => import('./RecentBrowsingSection'));
const AIAnalyticsTeaser = React.lazy(() => import('@globul-cars/ui/components/HomePage/AIAnalyticsTeaser'));
const SmartSellStrip = React.lazy(() => import('@globul-cars/ui/components/HomePage/SmartSellStrip'));
const DealerSpotlight = React.lazy(() => import('@globul-cars/ui/components/HomePage/DealerSpotlight'));
const StatsSection = React.lazy(() => import('./StatsSection'));
const ImageGallerySection = React.lazy(() => import('./ImageGallerySection'));
const FeaturesSection = React.lazy(() => import('./FeaturesSection'));
const LoyaltyBanner = React.lazy(() => import('@globul-cars/ui/components/HomePage/LoyaltyBanner'));

const HomeContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-secondary);

  /* MOBILE OPTIMIZATION - Clean background (Instagram/Facebook) */
  @media (max-width: 768px) {
    padding-top: 0;
    background: var(--bg-secondary);  /* Instagram gray - cleaner on mobile */
    padding-bottom: 70px;  /* Space for bottom nav */
  }
  
  @media (max-width: 480px) {
    padding-bottom: 60px;
  }
`;

const SectionSpacer = styled.div`
  height: 20px;
  
  /* MOBILE - Tighter spacing (Facebook pattern) */
  @media (max-width: 768px) {
    height: 8px;  /* Tight spacing between sections */
  }
  
  @media (max-width: 480px) {
    height: 6px;
  }
`;

const LargeSpacer = styled.div`
  height: 40px;
  
  /* MOBILE - Compact spacing (Airbnb pattern) */
  @media (max-width: 768px) {
    height: 16px;  /* Tighter for mobile */
  }
  
  @media (max-width: 480px) {
    height: 12px;
  }
`;

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1.1rem;
  color: var(--text-secondary);
  
  /* MOBILE - Compact loading state */
  @media (max-width: 768px) {
    min-height: 120px;
    font-size: 0.9375rem;  /* 15px */
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    min-height: 100px;
    font-size: 0.875rem;  /* 14px */
  }
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      {/* 1. Hero Section - FIRST (Above-the-Fold) */}
      <Suspense fallback={<LoadingFallback>Loading hero section...</LoadingFallback>}>
        <HeroSection />
      </Suspense>

      <SectionSpacer />

      {/* 2. Popular Brands Section - MOVED TO TOP */}
      <LazySection rootMargin="0px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading popular brands...</LoadingFallback>}>
          <PopularBrandsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 3. Featured Cars Section */}
      <LazySection rootMargin="0px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading featured cars...</LoadingFallback>}>
          <FeaturedCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 4. Life Moments Browse - Car for Your Moment */}
      <LazySection rootMargin="50px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading life moments...</LoadingFallback>}>
          <LifeMomentsBrowse />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 5. Social Media & Community */}
      <LazySection rootMargin="50px" minHeight="200px">
        <Suspense fallback={<LoadingFallback>Loading social media...</LoadingFallback>}>
          <SocialMediaSection />
        </Suspense>
      </LazySection>

      <LargeSpacer />

      {/* 6. Vehicle Classifications Section */}
      <LazySection rootMargin="100px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading vehicle classifications...</LoadingFallback>}>
          <VehicleClassificationsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 7. Most Demanded Categories Section */}
      <LazySection rootMargin="100px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Loading demanded categories...</LoadingFallback>}>
          <MostDemandedCategoriesSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 8. Recent Browsing Section */}
      <LazySection rootMargin="100px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading browsing history...</LoadingFallback>}>
          <RecentBrowsingSection />
        </Suspense>
      </LazySection>

      <LargeSpacer />

      {/* 9. Business Promotion Banner */}
      <BusinessPromoBanner />

      <LargeSpacer />

      {/* 10. AI & Analytics Teaser */}
      <LazySection rootMargin="100px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading AI features...</LoadingFallback>}>
          <AIAnalyticsTeaser />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 11. Smart Sell Strip */}
      <LazySection rootMargin="100px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading sell workflow...</LoadingFallback>}>
          <SmartSellStrip />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 12. Dealer Spotlight */}
      <LazySection rootMargin="100px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading dealers...</LoadingFallback>}>
          <DealerSpotlight />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 13. Stats Section */}
      <LazySection rootMargin="50px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading stats...</LoadingFallback>}>
          <StatsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 14. Image Gallery Section */}
      <LazySection rootMargin="50px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading image gallery...</LoadingFallback>}>
          <ImageGallerySection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 15. Features Section */}
      <LazySection rootMargin="50px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading features...</LoadingFallback>}>
          <FeaturesSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 16. Loyalty Banner - Final CTA */}
      <LazySection rootMargin="100px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading loyalty banner...</LoadingFallback>}>
          <LoyaltyBanner />
        </Suspense>
      </LazySection>

      {/* AI Chatbot - Always available */}
      <AIChatbot
        position="bottom-right"
        context={{ page: 'home', userType: 'buyer' }}
      />
    </HomeContainer>
  );
};

export default HomePage;