// src/components/dealer/PerformanceOverviewWidget.tsx
// Performance Overview Widget - Widget نظرة عامة على الأداء

import React from 'react';
import styled from 'styled-components';
import { Eye, MessageSquare, TrendingUp, DollarSign, Clock, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DealerDashboardStats } from '../../services/dealer/dealer-dashboard.service';

interface PerformanceOverviewWidgetProps {
  stats: DealerDashboardStats;
}

const WidgetContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const WidgetTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
`;

const StatChange = styled.div<{ positive?: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PerformanceOverviewWidget: React.FC<PerformanceOverviewWidgetProps> = ({ stats }) => {
  const { language } = useLanguage();

  return (
    <WidgetContainer>
      <WidgetTitle>
        <TrendingUp size={24} />
        {language === 'bg' ? 'Преглед на дейността' : 'Performance Overview'}
      </WidgetTitle>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#3b82f6">
              <Eye size={20} />
            </StatIcon>
          </StatHeader>
          <StatLabel>{language === 'bg' ? 'Общо прегледи' : 'Total Views'}</StatLabel>
          <StatValue>{stats.totalViews.toLocaleString()}</StatValue>
          <StatChange positive>
            <TrendingUp size={12} />
            {language === 'bg' ? `${stats.totalViewsThisWeek} тази седмица` : `${stats.totalViewsThisWeek} this week`}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#10b981">
              <MessageSquare size={20} />
            </StatIcon>
          </StatHeader>
          <StatLabel>{language === 'bg' ? 'Общо лидове' : 'Total Leads'}</StatLabel>
          <StatValue>{stats.totalLeads}</StatValue>
          <StatChange positive>
            <TrendingUp size={12} />
            {language === 'bg' ? `${stats.leadsThisWeek} тази седмица` : `${stats.leadsThisWeek} this week`}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#8b5cf6">
              <Clock size={20} />
            </StatIcon>
          </StatHeader>
          <StatLabel>{language === 'bg' ? 'Средно време за отговор' : 'Avg Response Time'}</StatLabel>
          <StatValue>{stats.averageResponseTime}</StatValue>
          <StatChange>
            {language === 'bg' ? 'минути' : 'minutes'}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#f59e0b">
              <Users size={20} />
            </StatIcon>
          </StatHeader>
          <StatLabel>{language === 'bg' ? 'Процент на отговори' : 'Response Rate'}</StatLabel>
          <StatValue>{stats.responseRate}%</StatValue>
          <StatChange positive={stats.responseRate >= 80}>
            {language === 'bg' ? 'от общо съобщения' : 'of total messages'}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#ec4899">
              <TrendingUp size={20} />
            </StatIcon>
          </StatHeader>
          <StatLabel>{language === 'bg' ? 'Процент на конверсия' : 'Conversion Rate'}</StatLabel>
          <StatValue>{stats.conversionRate.toFixed(1)}%</StatValue>
          <StatChange>
            {language === 'bg' ? 'лидове / прегледи' : 'leads / views'}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#ef4444">
              <DollarSign size={20} />
            </StatIcon>
          </StatHeader>
          <StatLabel>{language === 'bg' ? 'Общи приходи' : 'Total Revenue'}</StatLabel>
          <StatValue>€{stats.totalRevenue.toLocaleString()}</StatValue>
          <StatChange>
            {language === 'bg' ? 'от продадени коли' : 'from sold cars'}
          </StatChange>
        </StatCard>
      </StatsGrid>
    </WidgetContainer>
  );
};

export default PerformanceOverviewWidget;

