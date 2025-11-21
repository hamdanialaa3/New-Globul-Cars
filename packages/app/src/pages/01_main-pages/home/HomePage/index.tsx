// src/pages/HomePage/index.tsx
// Main HomePage component that composes all sections

import React, { Suspense } from 'react';
import styled from 'styled-components';
import BusinessPromoBanner from '@globul-cars/ui/componentsBusinessPromoBanner';
import LazySection from '@globul-cars/ui/componentsLazySection';
import { AIChatbot } from '@globul-cars/ui/componentsAI';

// Lazy load all sections for better performance
const HeroSection = React.lazy(() => import('./HeroSection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));
const AIAnalyticsTeaser = React.lazy(() => import('@globul-cars/ui/components/HomePage/AIAnalyticsTeaser'));
const SmartSellStrip = React.lazy(() => import('@globul-cars/ui/components/HomePage/SmartSellStrip'));
const DealerSpotlight = React.lazy(() => import('@globul-cars/ui/components/HomePage/DealerSpotlight'));
const LifeMomentsBrowse = React.lazy(() => import('@globul-cars/ui/components/HomePage/LifeMomentsBrowse'));
const SocialMediaSection = React.lazy(() => import('./SocialMediaSection'));
const StatsSection = React.lazy(() => import('./StatsSection'));
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));
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
      {/* 1. Hero Section - FIRST (Above-the-Fold with TrustStrip + Live Counter) */}
      <Suspense fallback={<LoadingFallback>Loading hero section...</LoadingFallback>}>
        <HeroSection />
      </Suspense>

      <SectionSpacer />

      {/* 2. Featured Cars Section - WITH Scarcity Tags */}
      <LazySection rootMargin="0px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading featured cars...</LoadingFallback>}>
          <FeaturedCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />
      
      {/* 3. Business Promotion Banner */}
      <BusinessPromoBanner />
      
      <LargeSpacer />

      {/* 4. AI & Analytics Teaser - NEW */}
      <LazySection rootMargin="100px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading AI features...</LoadingFallback>}>
          <AIAnalyticsTeaser />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 5. Smart Sell Strip - NEW */}
      <LazySection rootMargin="100px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading sell workflow...</LoadingFallback>}>
          <SmartSellStrip />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 6. Dealer Spotlight - NEW */}
      <LazySection rootMargin="100px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading dealers...</LoadingFallback>}>
          <DealerSpotlight />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 7. Life Moments Browse - NEW */}
      <LazySection rootMargin="100px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading life moments...</LoadingFallback>}>
          <LifeMomentsBrowse />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 8. Community Feed - ENHANCED with Hot Topics */}
      <LazySection rootMargin="100px" minHeight="200px">
        <Suspense fallback={<LoadingFallback>Loading social media...</LoadingFallback>}>
          <SocialMediaSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 9. Popular Brands Section */}
      <LazySection rootMargin="50px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading popular brands...</LoadingFallback>}>
          <PopularBrandsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 10. Stats Section */}
      <LazySection rootMargin="50px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading stats...</LoadingFallback>}>
          <StatsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 11. Image Gallery Section */}
      <LazySection rootMargin="50px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading image gallery...</LoadingFallback>}>
          <ImageGallerySection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 12. Features Section */}
      <LazySection rootMargin="50px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading features...</LoadingFallback>}>
          <FeaturesSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 13. Loyalty Banner - NEW (Final CTA) */}
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