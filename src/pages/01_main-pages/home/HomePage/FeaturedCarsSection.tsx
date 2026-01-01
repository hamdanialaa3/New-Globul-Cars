// src/pages/HomePage/FeaturedCarsSection.tsx
// Featured cars section component for HomePage

import React, { Suspense, memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import FeaturedCars from '../../../../components/FeaturedCars';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Search, SlidersHorizontal } from 'lucide-react';

const FeaturedCarsSection = styled.section`
  background: rgba(245, 241, 235, 0.4);
  padding: 1.5rem 0 2rem 0;
  position: relative;
  z-index: 1;
  transition: background-color 0.3s ease;
  
  html[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.4);
  }
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 1.25rem; /* ⚡ OPTIMIZED: Reduced from 3rem to 1.25rem */

  h2 {
    font-size: 1.5rem; /* ⚡ OPTIMIZED: Reduced from 1.75rem */
    font-weight: bold;
    color: var(--accent-primary);
    margin-bottom: 0.375rem; /* ⚡ OPTIMIZED: Reduced from 0.5rem */
  }

  p {
    font-size: 0.875rem; /* ⚡ OPTIMIZED: Reduced from 0.95rem */
    color: var(--text-secondary);
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
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;

  /* Light mode: Orange gradient background, White text */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFA500 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.35) !important;
  }

  /* Dark mode: Yellow gradient background, Black text */
  html[data-theme="dark"] & {
    background: linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFA000 100%) !important;
    color: #000000 !important;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateY(-3px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FF5722 0%, #FF6B35 50%, #FF8C42 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5) !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #FFC107 100%) !important;
      color: #000000 !important;
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6) !important;
    }
  }

  &:active {
    transform: translateY(-1px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #E64A19 0%, #FF5722 50%, #FF6B35 100%) !important;
      color: #ffffff !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFA000 0%, #FFC107 50%, #FFD700 100%) !important;
      color: #000000 !important;
    }
  }
  
  @media (max-width: 600px) {
    width: 100%;
    padding: 0.875rem 1.25rem;
  }
`;

const ViewAllFeaturedButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.5rem auto 0;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  width: fit-content;

  /* Light mode: Orange/Yellow gradient */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF8F10 0%, #FFA500 50%, #FFD700 100%);
    color: #000000;
    box-shadow: 0 4px 20px rgba(255, 143, 16, 0.4);
  }

  /* Dark mode: Black with yellow text */
  html[data-theme="dark"] & {
    background: #000000;
    color: #FFD700;
    border: 2px solid #FFD700;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FF8F10 100%);
      box-shadow: 0 8px 30px rgba(255, 143, 16, 0.5);
    }
    html[data-theme="dark"] & {
      background: #1a1a1a;
      box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1);
  }
  
  @media (max-width: 600px) {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
  }
`;


const LoadingFallback = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 8px;
  margin: 1rem;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const FeaturedCarsSectionComponent: React.FC = () => {
  const { language, t } = useLanguage();
  
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
          
          {/* ⚡ Search Buttons */}
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
          
          {/* ⚡ View All Featured Button */}
          <ViewAllFeaturedButton to="/cars?featured=true">
            {language === 'bg' ? 'Виж всички избрани →' : 'View All Featured →'}
          </ViewAllFeaturedButton>
        </SectionHeader>

        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
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