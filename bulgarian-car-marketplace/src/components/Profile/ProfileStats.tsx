// src/components/Profile/ProfileStats.tsx
// Profile Statistics Display - عرض إحصائيات البروفايل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { Car, ShoppingCart, Eye, Clock, TrendingUp, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== STYLED COMPONENTS ====================

const StatsContainer = styled.div`
  width: 100%;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color};
  color: white;
  margin-bottom: 12px;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
`;

// ==================== COMPONENT ====================

interface ProfileStatsProps {
  carsListed: number;
  carsSold: number;
  totalViews: number;
  responseTime: number;
  responseRate: number;
  totalMessages: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  carsListed = 0,
  carsSold = 0,
  totalViews = 0,
  responseTime = 0,
  responseRate = 0,
  totalMessages = 0
}) => {
  const { language } = useLanguage();

  const formatTime = (minutes: number): string => {
    if (minutes === 0) return language === 'bg' ? 'N/A' : 'N/A';
    if (minutes < 60) return `${minutes}${language === 'bg' ? 'м' : 'm'}`;
    const hours = Math.floor(minutes / 60);
    return `${hours}${language === 'bg' ? 'ч' : 'h'}`;
  };

  const stats = [
    {
      icon: Car,
      value: carsListed,
      label: language === 'bg' ? 'Обяви' : 'Listings',
      color: '#FF7900'
    },
    {
      icon: ShoppingCart,
      value: carsSold,
      label: language === 'bg' ? 'Продадени' : 'Sold',
      color: '#4CAF50'
    },
    {
      icon: Eye,
      value: totalViews,
      label: language === 'bg' ? 'Прегледи' : 'Views',
      color: '#2196F3'
    },
    {
      icon: Clock,
      value: formatTime(responseTime),
      label: language === 'bg' ? 'Време отговор' : 'Response Time',
      color: '#9C27B0'
    },
    {
      icon: TrendingUp,
      value: `${responseRate}%`,
      label: language === 'bg' ? 'Процент отговор' : 'Response Rate',
      color: '#FF9800'
    },
    {
      icon: MessageCircle,
      value: totalMessages,
      label: language === 'bg' ? 'Съобщения' : 'Messages',
      color: '#00BCD4'
    }
  ];

  return (
    <StatsContainer>
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon $color={stat.color}>
              <stat.icon size={24} />
            </StatIcon>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>
    </StatsContainer>
  );
};

export default ProfileStats;
