// AdsStatsSummary.tsx
// Analytics summary header for My Ads page

import React from 'react';
import styled from 'styled-components';
import { Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';

interface AdsStatsSummaryProps {
  activeCount: number;
  totalViews: number;
  totalMessages: number;
  totalListings: number;
  isDark?: boolean;
}

const StatsContainer = styled.div<{ $isDark?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: ${({ $isDark }) => $isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)'};
  border-radius: 16px;
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 1rem;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ $isDark }) => $isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.6)'};
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatLabel = styled.div<{ $isDark?: boolean }>`
  font-size: 0.75rem;
  color: ${({ $isDark }) => $isDark ? 'rgba(226, 232, 240, 0.7)' : 'rgba(15, 23, 42, 0.7)'};
  font-weight: 500;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div<{ $isDark?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#0f172a'};
  line-height: 1.2;
`;

export const AdsStatsSummary: React.FC<AdsStatsSummaryProps> = ({
  activeCount,
  totalViews,
  totalMessages,
  totalListings,
  isDark = false
}) => {
  const { language } = useLanguage();

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const stats = [
    {
      icon: <TrendingUp />,
      label: language === 'bg' ? 'Активни обяви' : 'Active Ads',
      value: activeCount,
      color: '#22c55e'
    },
    {
      icon: <Eye />,
      label: language === 'bg' ? 'Общо прегледи' : 'Total Views',
      value: formatNumber(totalViews),
      color: '#3b82f6'
    },
    {
      icon: <MessageSquare />,
      label: language === 'bg' ? 'Съобщения' : 'Messages',
      value: totalMessages,
      color: '#f59e0b'
    },
    {
      icon: <TrendingUp />,
      label: language === 'bg' ? 'Общо обяви' : 'Total Listings',
      value: totalListings,
      color: '#8b5cf6'
    }
  ];

  return (
    <StatsContainer $isDark={isDark}>
      {stats.map((stat, index) => (
        <StatCard key={index} $isDark={isDark}>
          <StatIcon $color={stat.color}>{stat.icon}</StatIcon>
          <StatContent>
            <StatLabel $isDark={isDark}>{stat.label}</StatLabel>
            <StatValue $isDark={isDark}>{stat.value}</StatValue>
          </StatContent>
        </StatCard>
      ))}
    </StatsContainer>
  );
};

