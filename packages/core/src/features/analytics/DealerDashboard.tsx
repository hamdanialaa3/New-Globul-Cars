// src/features/analytics/DealerDashboard.tsx
// Dealer Analytics Dashboard - Advanced metrics

import React from 'react';
import styled from 'styled-components';
import { Eye, MessageCircle, TrendingUp, DollarSign, Download } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

const Container = styled.div`
  max-width: 1400px;
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
  font-size: 2rem;
  font-weight: bold;
  color: #16a34a;
`;

const ExportButton = styled.button`
  background: white;
  border: 2px solid #16a34a;
  color: #16a34a;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f0fdf4;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #16a34a;
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #16a34a;
`;

const MetricLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

export const DealerDashboard: React.FC = () => {
  const { language } = useLanguage();

  return (
    <Container>
      <Header>
        <Title>{language === 'bg' ? 'Бизнес анализи' : 'Business Analytics'}</Title>
        <ExportButton>
          <Download />
          {language === 'bg' ? 'Експорт CSV' : 'Export CSV'}
        </ExportButton>
      </Header>
      
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>{language === 'bg' ? 'Стойност на наличността' : 'Inventory Value'}</MetricLabel>
          <MetricValue>€0</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel>{language === 'bg' ? 'Прегледи' : 'Views'}</MetricLabel>
          <MetricValue>0</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel>{language === 'bg' ? 'Запитвания' : 'Inquiries'}</MetricLabel>
          <MetricValue>0</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel>{language === 'bg' ? 'Конверсия' : 'Conversion Rate'}</MetricLabel>
          <MetricValue>0%</MetricValue>
        </MetricCard>
      </MetricsGrid>
    </Container>
  );
};

export default DealerDashboard;

