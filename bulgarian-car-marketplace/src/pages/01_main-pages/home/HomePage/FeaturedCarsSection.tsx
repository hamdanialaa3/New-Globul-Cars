// src/pages/HomePage/FeaturedCarsSection.tsx
// Featured cars section component for HomePage

import React, { Suspense, memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import FeaturedCars from '../../../../components/FeaturedCars';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Search, SlidersHorizontal } from 'lucide-react';

const FeaturedCarsSection = styled.section`
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
  padding: 1.5rem 0 2rem 0; /* ⚡ OPTIMIZED: Reduced from 4rem to 1.5rem/2rem */
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
  margin-bottom: 1.25rem; /* ⚡ OPTIMIZED: Reduced from 3rem to 1.25rem */

  h2 {
    font-size: 1.5rem; /* ⚡ OPTIMIZED: Reduced from 1.75rem */
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 0.375rem; /* ⚡ OPTIMIZED: Reduced from 0.5rem */
  }

  p {
    font-size: 0.875rem; /* ⚡ OPTIMIZED: Reduced from 0.95rem */
    color: #6c757d;
    margin-bottom: 1rem; /* ⚡ OPTIMIZED: Reduced from 2rem */
    max-width: 600px;
    margin: 0 auto 1rem; /* ⚡ OPTIMIZED: Reduced from 2rem */
    line-height: 1.5; /* ⚡ OPTIMIZED: Reduced from 1.6 */
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1rem; /* ⚡ OPTIMIZED */
    
    h2 {
      font-size: 1.375rem; /* ⚡ OPTIMIZED */
      margin-bottom: 0.25rem; /* ⚡ OPTIMIZED */
    }
    
    p {
      font-size: 0.8125rem; /* ⚡ OPTIMIZED */
      margin-bottom: 0.75rem; /* ⚡ OPTIMIZED */
    }
  }
  
  @media (max-width: 600px) {
    margin-bottom: 0.875rem; /* ⚡ OPTIMIZED: Reduced from 2rem */
    
    h2 {
      font-size: 1.25rem; /* ⚡ OPTIMIZED */
      margin-bottom: 0.25rem; /* ⚡ OPTIMIZED */
    }
    
    p {
      font-size: 0.8125rem; /* ⚡ OPTIMIZED */
      margin-bottom: 0.625rem; /* ⚡ OPTIMIZED */
    }
  }
`;

const SearchButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  
  @media (max-width: 600px) {
    gap: 0.75rem;
    flex-direction: column;
    max-width: 300px;
    margin: 1rem auto 0;
  }
`;

const SearchButton = styled(Link)<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.$variant === 'primary' ? '#005ca9' : '#FF8F10'};
  background: ${props => props.$variant === 'primary' ? '#005ca9' : '#FF8F10'};
  color: white;
  box-shadow: 0 2px 8px ${props => 
    props.$variant === 'primary' 
      ? 'rgba(0, 92, 169, 0.2)' 
      : 'rgba(255, 143, 16, 0.2)'};

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => 
      props.$variant === 'primary' 
        ? 'rgba(0, 92, 169, 0.3)' 
        : 'rgba(255, 143, 16, 0.3)'};
  }

  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 600px) {
    width: 100%;
    padding: 0.875rem 1.25rem;
  }
`;

const ViewAllButton = styled(Link)`
  display: inline-block;
  background: #005ca9;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
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
  const { language } = useLanguage();
  
  return (
    <FeaturedCarsSection>
      <SectionContainer>
        <SectionHeader>
          <h2>{language === 'bg' ? 'Избрани автомобили' : 'Featured Cars'}</h2>
          <p>
            {language === 'bg'
              ? 'Открийте нашата селекция от премиум превозни средства, налични на българския пазар.'
              : 'Discover our handpicked selection of premium vehicles available in the Bulgarian marketplace.'}
          </p>
          
          {/* ⚡ NEW: Search Buttons (replacing View All button) */}
          <SearchButtonsContainer>
            <SearchButton to="/cars" $variant="primary">
              <Search />
              <span>{language === 'bg' ? 'Търсене' : 'Search'}</span>
            </SearchButton>
            <SearchButton to="/advanced-search" $variant="secondary">
              <SlidersHorizontal />
              <span>{language === 'bg' ? 'Разширено търсене' : 'Advanced Search'}</span>
            </SearchButton>
          </SearchButtonsContainer>
        </SectionHeader>

        <Suspense fallback={<LoadingFallback>Loading featured cars...</LoadingFallback>}>
          {/* ⚡ OPTIMIZED: Reduced from 8 to 4 cars for faster initial load */}
          <FeaturedCars 
            limit={4}
            showFilters={false}
            enablePagination={false}
          />
        </Suspense>
      </SectionContainer>
    </FeaturedCarsSection>
  );
};

export default memo(FeaturedCarsSectionComponent);