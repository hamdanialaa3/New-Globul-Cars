// src/features/analytics/PrivateDashboard.tsx
// Private User Analytics Dashboard

import React from 'react';
import styled from 'styled-components';
import { Eye, MessageCircle, Heart, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 2rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #FF8F10;
  margin: 0.5rem 0;
`;

const MetricLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const PrivateDashboard: React.FC = () => {
  const { language } = useLanguage();

  return (
    <Container>
      <Title>{language === 'bg' ? 'Моята статистика' : 'My Analytics'}</Title>
      
      <MetricsGrid>
        <MetricCard>
          <MetricLabel><Eye /> {language === 'bg' ? 'Общо прегледи' : 'Total Views'}</MetricLabel>
          <MetricValue>0</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel><MessageCircle /> {language === 'bg' ? 'Запитвания' : 'Inquiries'}</MetricLabel>
          <MetricValue>0</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel><Heart /> {language === 'bg' ? 'Любими' : 'Favorites'}</MetricLabel>
          <MetricValue>0</MetricValue>
        </MetricCard>
      </MetricsGrid>
    </Container>
  );
};

export default PrivateDashboard;

