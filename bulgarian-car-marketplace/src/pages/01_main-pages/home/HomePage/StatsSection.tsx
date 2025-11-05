// src/pages/HomePage/StatsSection.tsx
// Stats section component for HomePage

import React, { memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { SectionContainer } from './styles';

const StatsSection = styled.section`
  background-image: url('/assets/backgrounds/metal-bg-1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 3rem 0;
  position: relative;
  transform: translateZ(0);
  will-change: transform;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.68);
    z-index: 0;
  }
  
  @media (max-width: 600px) {
    padding: 2rem 0;
  }
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  h3 {
    font-size: 2rem;
    font-weight: 700;
    color: #FF8F10;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }

  p {
    font-size: 0.875rem;
    color: #6c757d;
    font-weight: 500;
    line-height: 1.5;
  }
  
  @media (max-width: 600px) {
    h3 {
      font-size: 1.75rem;
    }
    
    p {
      font-size: 0.8rem;
    }
  }
`;

const StatsSectionComponent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <StatsSection style={{ position: 'relative', zIndex: 1 }}>
      <SectionContainer>
        <StatsContainer>
          <StatItem>
            <h3>15,000+</h3>
            <p>{t('home.stats.cars')}</p>
          </StatItem>
          <StatItem>
            <h3>8,500+</h3>
            <p>{t('home.stats.satisfiedCustomers')}</p>
          </StatItem>
          <StatItem>
            <h3>500+</h3>
            <p>{t('home.stats.dealers')}</p>
          </StatItem>
          <StatItem>
            <h3>98%</h3>
            <p>{t('home.stats.satisfaction')}</p>
          </StatItem>
        </StatsContainer>
      </SectionContainer>
    </StatsSection>
  );
};export default memo(StatsSectionComponent);