// src/pages/HomePage/StatsSection.tsx
// Stats section component for HomePage

import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { SectionContainer } from './styles';

const StatsSection = styled.section`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
`;

const StatItem = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
    color: ${({ theme }) => theme.colors.primary.main};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
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
};export default StatsSectionComponent;