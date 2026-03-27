// src/pages/MyListingsPage/StatsSection.tsx
// Statistics section component for MyListingsPage

import React from 'react';
import { MyListingsStats } from './types';
import { SectionContainer, StatsGrid, StatCard } from './styles';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatsSectionProps {
  stats: MyListingsStats;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  return (
    <SectionContainer>
      <StatsGrid>
        <StatCard>
          <div className="icon">📊</div>
          <div className="value">{stats.totalListings}</div>
          <div className="label">Общо обяви</div>
        </StatCard>

        <StatCard>
          <div className="icon">✅</div>
          <div className="value">{stats.activeListings}</div>
          <div className="label">Активни обяви</div>
        </StatCard>

        <StatCard>
          <div className="icon">💰</div>
          <div className="value">{stats.soldListings}</div>
          <div className="label">Продадени коли</div>
        </StatCard>

        <StatCard>
          <div className="icon">👁️</div>
          <div className="value">{stats.totalViews.toLocaleString()}</div>
          <div className="label">Общо прегледи</div>
        </StatCard>

        <StatCard>
          <div className="icon">💬</div>
          <div className="value">{stats.totalInquiries}</div>
          <div className="label">Запитвания</div>
        </StatCard>
      </StatsGrid>
    </SectionContainer>
  );
};

export default StatsSection;
