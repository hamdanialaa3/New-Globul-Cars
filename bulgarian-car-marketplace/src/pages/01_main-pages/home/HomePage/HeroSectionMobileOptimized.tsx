// src/pages/HomePage/HeroSectionMobileOptimized.tsx
// Mobile-optimized Hero section with responsive design

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResponsiveButton } from '@/components/ui';
import { ResponsiveContainer } from '@/components/layout';

const HeroWrapper = styled.section`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary?.main || '#007bff'} 0%, 
    ${props => props.theme.colors.primary?.dark || '#0056b3'} 100%
  );
  color: white;
  padding: 60px 0 50px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 50px 0 40px;
  }
  
  @media (max-width: 640px) {
    padding: 40px 0 30px;
  }
  
  /* Background pattern */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
  font-family: 'Martica', 'Arial', sans-serif;
  
  @media (max-width: 1024px) {
    font-size: 40px;
  }
  
  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  opacity: 0.95;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const SearchBar = styled.div`
  max-width: 700px;
  margin: 0 auto 24px;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 8px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Martica', 'Arial', sans-serif;
  color: ${props => props.theme.colors.text || '#333'};
  background: rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text?.secondary || '#999'};
  }
  
  @media (max-width: 640px) {
    padding: 16px 16px;
  }
`;

const QuickFilters = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    gap: 8px;
  }
`;

const FilterChip = styled.button`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Martica', 'Arial', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 640px) {
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
  margin-top: 40px;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    gap: 24px;
    margin-top: 32px;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
  
  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  
  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

interface HeroSectionProps {
  className?: string;
}

const HeroSectionMobileOptimized: React.FC<HeroSectionProps> = ({ className }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cars?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/cars');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleQuickFilter = (filter: string) => {
    navigate(`/cars?${filter}`);
  };
  
  return (
    <HeroWrapper className={className}>
      <ResponsiveContainer>
        <HeroContent>
          <HeroTitle>
            {t('home.hero.title') || 'Find Your Perfect Car in Bulgaria'}
          </HeroTitle>
          
          <HeroSubtitle>
            {t('home.hero.subtitle') || 'Browse thousands of cars from trusted dealers and private sellers'}
          </HeroSubtitle>
          
          <SearchBar>
            <SearchInput
              type="text"
              placeholder={t('home.hero.searchPlaceholder') || 'Search by brand, model, or keyword...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <ResponsiveButton
              size="lg"
              onClick={handleSearch}
              fullWidthOnMobile
            >
              {t('home.hero.searchButton') || 'Search'}
            </ResponsiveButton>
          </SearchBar>
          
          <QuickFilters>
            <FilterChip onClick={() => handleQuickFilter('type=sedan')}>
              🚗 Sedans
            </FilterChip>
            <FilterChip onClick={() => handleQuickFilter('type=suv')}>
              🚙 SUVs
            </FilterChip>
            <FilterChip onClick={() => handleQuickFilter('type=coupe')}>
              🏎️ Sports
            </FilterChip>
            <FilterChip onClick={() => handleQuickFilter('electric=true')}>
              ⚡ Electric
            </FilterChip>
          </QuickFilters>
          
          <StatsRow>
            <StatItem>
              <StatNumber>15,000+</StatNumber>
              <StatLabel>{t('home.stats.cars') || 'Cars Available'}</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>500+</StatNumber>
              <StatLabel>{t('home.stats.dealers') || 'Trusted Dealers'}</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>50,000+</StatNumber>
              <StatLabel>{t('home.stats.users') || 'Happy Users'}</StatLabel>
            </StatItem>
          </StatsRow>
        </HeroContent>
      </ResponsiveContainer>
    </HeroWrapper>
  );
};

export default memo(HeroSectionMobileOptimized);
