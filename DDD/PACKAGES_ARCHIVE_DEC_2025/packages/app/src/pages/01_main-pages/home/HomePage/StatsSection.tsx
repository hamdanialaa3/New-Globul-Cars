// src/pages/HomePage/StatsSection.tsx
// Stats section component for HomePage

import React, { memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { SectionContainer } from './styles';

const StatsSection = styled.section`
  /* ✅ OPTIMIZED: Replaced heavy background image with CSS gradient */
  background: linear-gradient(135deg, #00966E 0%, #007a5a 50%, #005d44 100%);
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
    background: rgba(0, 0, 0, 0.1);
    opacity: 0.3;
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
    color: var(--accent-orange);
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }

  p {
    font-size: 0.875rem;
    color: var(--text-secondary);
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