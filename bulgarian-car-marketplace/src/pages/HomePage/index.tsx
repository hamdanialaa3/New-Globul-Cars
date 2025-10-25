// src/pages/HomePage/index.tsx
// Main HomePage component that composes all sections

import React, { Suspense } from 'react';
import styled from 'styled-components';
import BusinessPromoBanner from '../../components/BusinessPromoBanner';
import LazySection from '../../components/LazySection';

// Lazy load all sections for better performance
const HeroSection = React.lazy(() => import('./HeroSection'));
const SmartFeedSection = React.lazy(() => import('./SmartFeedSection'));
const CarCarousel3D = React.lazy(() => import('../../components/CarCarousel3D'));
const StatsSection = React.lazy(() => import('./StatsSection'));
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));
const CityCarsSection = React.lazy(() => import('./CityCarsSection'));
const ImageGallerySection = React.lazy(() => import('./ImageGallerySection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));
const CommunityFeedSection = React.lazy(() => import('./CommunityFeedSection'));
const FeaturesSection = React.lazy(() => import('./FeaturesSection'));

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

  /* ✅ Mobile: NO padding-top needed - body already handles it */
  @media (max-width: 768px) {
    padding-top: 0; /* ✅ MOBILE: Removed to prevent double padding */
  }
`;

const SectionSpacer = styled.div`
  height: 20px; /* ✅ مسافة أصغر بنسبة 50% */
  
  @media (max-width: 768px) {
    height: 12px; /* أصغر على الموبايل */
  }
`;

const LargeSpacer = styled.div`
  height: 40px; /* ✅ مسافة أكبر حول Business Banner */
  
  @media (max-width: 768px) {
    height: 24px;
  }
`;

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1.1rem;
  color: #6c757d;
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <LargeSpacer />
      
      {/* Business Promotion Banner - Below Header - Always visible */}
      <BusinessPromoBanner />
      
      <LargeSpacer />

      {/* Hero Section - Always visible (above fold) */}
      <Suspense fallback={<LoadingFallback>Loading hero section...</LoadingFallback>}>
        <HeroSection />
      </Suspense>

      <SectionSpacer />

      {/* Smart Feed Section - AI-Powered Community Feed (THIRD SECTION) */}
      <LazySection rootMargin="300px" minHeight="800px">
        <Suspense fallback={<LoadingFallback>Loading community feed...</LoadingFallback>}>
          <SmartFeedSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* 3D Car Carousel - Safety & Buying Guide */}
      <LazySection rootMargin="300px" minHeight="700px">
        <Suspense fallback={<LoadingFallback>Loading 3D carousel...</LoadingFallback>}>
          <CarCarousel3D />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* ✅ LazySection: Load when user scrolls near */}
      <LazySection rootMargin="200px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading stats...</LoadingFallback>}>
          <StatsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      <LazySection rootMargin="200px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading popular brands...</LoadingFallback>}>
          <PopularBrandsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      <LazySection rootMargin="300px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Loading city cars...</LoadingFallback>}>
          <CityCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      <LazySection rootMargin="200px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading image gallery...</LoadingFallback>}>
          <ImageGallerySection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      <LazySection rootMargin="300px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Loading featured cars...</LoadingFallback>}>
          <FeaturedCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      <LazySection rootMargin="300px" minHeight="800px">
        <Suspense fallback={<LoadingFallback>Loading community feed...</LoadingFallback>}>
          <CommunityFeedSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      <LazySection rootMargin="200px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading features...</LoadingFallback>}>
          <FeaturesSection />
        </Suspense>
      </LazySection>
    </HomeContainer>
  );
};

export default HomePage;