// src/pages/HomePage/index.tsx
// Main HomePage component that composes all sections

import React, { Suspense } from 'react';
import styled from 'styled-components';

// Lazy load all sections for better performance
const HeroSection = React.lazy(() => import('./HeroSection'));
const StatsSection = React.lazy(() => import('./StatsSection'));
const CityCarsSection = React.lazy(() => import('./CityCarsSection'));
const ImageGallerySection = React.lazy(() => import('./ImageGallerySection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));
const FeaturesSection = React.lazy(() => import('./FeaturesSection'));

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
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
      <Suspense fallback={<LoadingFallback>Loading hero section...</LoadingFallback>}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<LoadingFallback>Loading stats...</LoadingFallback>}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<LoadingFallback>Loading city cars...</LoadingFallback>}>
        <CityCarsSection />
      </Suspense>

      <Suspense fallback={<LoadingFallback>Loading image gallery...</LoadingFallback>}>
        <ImageGallerySection />
      </Suspense>

      <Suspense fallback={<LoadingFallback>Loading featured cars...</LoadingFallback>}>
        <FeaturedCarsSection />
      </Suspense>

      <Suspense fallback={<LoadingFallback>Loading features...</LoadingFallback>}>
        <FeaturesSection />
      </Suspense>
    </HomeContainer>
  );
};

export default HomePage;