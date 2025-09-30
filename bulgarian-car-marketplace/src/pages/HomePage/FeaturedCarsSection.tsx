// src/pages/HomePage/FeaturedCarsSection.tsx
// Featured cars section component for HomePage

import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FeaturedCarsSection = styled.section`
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
  padding: 4rem 0;
  position: relative;
  z-index: 1;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h2 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 2rem;
    max-width: 600px;
    margin: 0 auto 2rem;
  }
`;

const ViewAllButton = styled(Link)`
  display: inline-block;
  background: #005ca9;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 2px solid #005ca9;

  &:hover {
    background: white;
    color: #005ca9;
  }
`;

const LoadingFallback = styled.div`
  text-align: center;
  padding: 2rem;
`;

const FeaturedCarsSectionComponent: React.FC = () => {
  return (
    <FeaturedCarsSection>
      <SectionContainer>
        <SectionHeader>
          <h2>Featured Cars</h2>
          <p>
            Discover our handpicked selection of premium vehicles available in the Bulgarian marketplace.
          </p>
          <ViewAllButton to="/cars">
            View All Cars →
          </ViewAllButton>
        </SectionHeader>

        <Suspense fallback={<LoadingFallback>Loading featured cars...</LoadingFallback>}>
          {React.createElement(
            lazy(() => import('../../components/FeaturedCars')),
            {
              limit: 6,
              showFilters: false,
              enablePagination: false
            }
          )}
        </Suspense>
      </SectionContainer>
    </FeaturedCarsSection>
  );
};

export default FeaturedCarsSectionComponent;