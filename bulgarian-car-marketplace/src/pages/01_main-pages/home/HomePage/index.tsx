// src/pages/HomePage/index.tsx
// Main HomePage component that composes all sections

import React, { Suspense } from 'react';
import styled from 'styled-components';
import BusinessPromoBanner from '@/components/BusinessPromoBanner';
import LazySection from '@/components/LazySection';

// Lazy load all sections for better performance
const HeroSection = React.lazy(() => import('./HeroSection'));
const SocialMediaSection = React.lazy(() => import('./SocialMediaSection'));
// ❌ REMOVED: CarCarousel3D - "Your Guide to Safe Driving & Buying" section
const StatsSection = React.lazy(() => import('./StatsSection'));
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));
// ❌ REMOVED: CityCarsSection - moved to avoid deep nesting issues
const ImageGallerySection = React.lazy(() => import('./ImageGallerySection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));
const FeaturesSection = React.lazy(() => import('./FeaturesSection'));

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
      {/* ⚡ OPTIMIZED: Removed LargeSpacer before Featured Cars */}
      
      {/* ⚡ Featured Cars Section - MOVED TO TOP (below header) */}
      <LazySection rootMargin="0px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading featured cars...</LoadingFallback>}>
          <FeaturedCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />
      
      {/* Business Promotion Banner - Below Featured Cars */}
      <BusinessPromoBanner />
      
      <LargeSpacer />

      {/* Hero Section - Always visible (above fold) */}
      <Suspense fallback={<LoadingFallback>Loading hero section...</LoadingFallback>}>
        <HeroSection />
      </Suspense>

      <SectionSpacer />

      {/* 🌟 Social Media Section - Collapsible Community Feed (Smart Feed + Community Stories) */}
      {/* ⚡ OPTIMIZED: rootMargin reduced from 300px to 100px */}
      <LazySection rootMargin="100px" minHeight="200px">
        <Suspense fallback={<LoadingFallback>Loading social media...</LoadingFallback>}>
          <SocialMediaSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* ❌ REMOVED: 3D Car Carousel - "Your Guide to Safe Driving & Buying" section */}

      <SectionSpacer />

      {/* ✅ LazySection: Load when user scrolls near */}
      {/* ⚡ OPTIMIZED: rootMargin reduced from 200px to 50px */}
      <LazySection rootMargin="50px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading stats...</LoadingFallback>}>
          <StatsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* ⚡ OPTIMIZED: rootMargin reduced from 200px to 50px */}
      <LazySection rootMargin="50px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading popular brands...</LoadingFallback>}>
          <PopularBrandsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* ❌ REMOVED: CityCarsSection - moved to avoid deep nesting issues */}
      {/* <LazySection rootMargin="100px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Loading city cars...</LoadingFallback>}>
          <CityCarsSection />
        </Suspense>
      </LazySection> */}

      <SectionSpacer />

      {/* ⚡ OPTIMIZED: rootMargin reduced from 200px to 50px */}
      <LazySection rootMargin="50px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading image gallery...</LoadingFallback>}>
          <ImageGallerySection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* ⚡ OPTIMIZED: rootMargin reduced from 200px to 50px */}
      <LazySection rootMargin="50px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading features...</LoadingFallback>}>
          <FeaturesSection />
        </Suspense>
      </LazySection>
    </HomeContainer>
  );
};

export default HomePage;