// src/features/analytics/CompanyDashboard.tsx
// Company Analytics Dashboard - Enterprise metrics

import React from 'react';
import styled from 'styled-components';
import { BarChart3, Users, TrendingUp, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: bold;
  color: #1d4ed8;
`;

const ExportButton = styled.button`
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  color: white;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 12px;
  padding: 2rem;
  border-left: 4px solid #1d4ed8;
`;

const MetricValue = styled.div`
  font-size: 2.75rem;
  font-weight: bold;
  color: #1d4ed8;
`;

const MetricLabel = styled.div`
  color: #6c757d;
  font-size: 1rem;
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CompanyDashboard: React.FC = () => {
  const { language } = useLanguage();

  return (
    <Container>
      <Header>
        <Title>{language === 'bg' ? 'Корпоративни анализи' : 'Corporate Analytics'}</Title>
        <ExportButton>
          <Download />
          {language === 'bg' ? 'Експорт PDF' : 'Export PDF'}
        </ExportButton>
      </Header>
      
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>{language === 'bg' ? 'Автопарк' : 'Fleet Size'}</MetricLabel>
          <MetricValue>0</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel>{language === 'bg' ? 'Обща стойност' : 'Total Value'}</MetricLabel>
          <MetricValue>€0</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel>{language === 'bg' ? 'Екип' : 'Team Size'}</MetricLabel>
          <MetricValue>0</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel>{language === 'bg' ? 'Производителност' : 'Performance'}</MetricLabel>
          <MetricValue>0%</MetricValue>
        </MetricCard>
      </MetricsGrid>
    </Container>
  );
};

export default CompanyDashboard;

