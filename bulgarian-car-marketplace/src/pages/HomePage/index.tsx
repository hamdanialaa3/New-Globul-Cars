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

  /* MOBILE OPTIMIZATION - Clean background (Instagram/Facebook) */
  @media (max-width: 768px) {
    padding-top: 0;
    background: #f0f2f5;  /* Instagram gray - cleaner on mobile */
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
  color: #6c757d;
  
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
      <LargeSpacer />
      
      {/* Business Promotion Banner - Below Header - Always visible */}
      <BusinessPromoBanner />
      
      <LargeSpacer />

      {/* ⚡ FIRST: Community Feed - Create Post Section (أولاً تحت الهيدر) */}
      <Suspense fallback={<LoadingFallback>Loading community feed...</LoadingFallback>}>
        <SmartFeedSection />
      </Suspense>

      <SectionSpacer />

      {/* Hero Section - بعد Community Feed (ثانياً) */}
      <Suspense fallback={<LoadingFallback>Loading hero section...</LoadingFallback>}>
        <HeroSection />
      </Suspense>

      <SectionSpacer />

      <SectionSpacer />

      {/* ⚡ REMOVED: 3D Car Carousel (heavy component - removed for performance) */}
      {/* 
      <LazySection rootMargin="300px" minHeight="700px">
        <Suspense fallback={<LoadingFallback>Loading 3D carousel...</LoadingFallback>}>
          <CarCarousel3D />
        </Suspense>
      </LazySection>
      <SectionSpacer />
      */}

      {/* ⚡ PERFORMANCE OPTIMIZED: Increased rootMargin = loads later = faster initial load */}
      
      {/* Stats - Light component, can load sooner */}
      <LazySection rootMargin="400px" minHeight="300px">
        <Suspense fallback={<LoadingFallback>Loading stats...</LoadingFallback>}>
          <StatsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* Popular Brands - Medium weight */}
      <LazySection rootMargin="600px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading popular brands...</LoadingFallback>}>
          <PopularBrandsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* ⚡ REMOVED: CityCarsSection (heavy with Google Maps - removed for performance) */}
      {/*
      <LazySection rootMargin="300px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Loading city cars...</LoadingFallback>}>
          <CityCarsSection />
        </Suspense>
      </LazySection>
      <SectionSpacer />
      */}

      {/* ⚡ REMOVED: ImageGallerySection (40+ large images - removed for performance) */}
      {/*
      <LazySection rootMargin="200px" minHeight="500px">
        <Suspense fallback={<LoadingFallback>Loading image gallery...</LoadingFallback>}>
          <ImageGallerySection />
        </Suspense>
      </LazySection>
      <SectionSpacer />
      */}

      {/* Featured Cars - Important, but load late */}
      <LazySection rootMargin="800px" minHeight="600px">
        <Suspense fallback={<LoadingFallback>Loading featured cars...</LoadingFallback>}>
          <FeaturedCarsSection />
        </Suspense>
      </LazySection>

      <SectionSpacer />

      {/* ⚡ REMOVED: CommunityFeedSection duplicate (already shown at top!) */}
      {/*
      <LazySection rootMargin="300px" minHeight="800px">
        <Suspense fallback={<LoadingFallback>Loading community feed...</LoadingFallback>}>
          <CommunityFeedSection />
        </Suspense>
      </LazySection>
      <SectionSpacer />
      */}

      {/* Features - Light component */}
      <LazySection rootMargin="600px" minHeight="400px">
        <Suspense fallback={<LoadingFallback>Loading features...</LoadingFallback>}>
          <FeaturesSection />
        </Suspense>
      </LazySection>
    </HomeContainer>
  );
};

export default HomePage;