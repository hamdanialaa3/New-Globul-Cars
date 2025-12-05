// src/components/Profile/ProfileStats.tsx
// Profile Statistics Display - عرض إحصائيات البروفايل
// 🎨 Premium Glassmorphism Design with Orange-Yellow Aluminum Theme
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Car, ShoppingCart, Eye, Clock, TrendingUp, MessageCircle } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

// ==================== ANIMATIONS ====================

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 12px rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.7); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ==================== STYLED COMPONENTS ====================

const StatsContainer = styled.div`
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  position: relative;
  
  /* 🎨 Premium Glass Background */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.88) 0%,
    rgba(252, 253, 254, 0.85) 50%,
    rgba(255, 255, 255, 0.90) 100%
  );
  backdrop-filter: blur(16px) saturate(170%);
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  
  /* Metallic Border */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.88), rgba(252, 253, 254, 0.85)),
    linear-gradient(135deg,
      rgba(192, 192, 192, 0.3) 0%,
      rgba(255, 143, 16, 0.4) 30%,
      rgba(255, 215, 0, 0.7) 50%,
      rgba(255, 143, 16, 0.4) 70%,
      rgba(192, 192, 192, 0.3) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* Layered Shadows */
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 -1px 0 rgba(0, 0, 0, 0.03) inset,
    0 8px 28px rgba(255, 143, 16, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.04);

  /* Yellow Glowing Bottom Stripe */
  &::after {
    content: '';
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 12px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, 
      rgba(255, 215, 0, 0) 0%, 
      rgba(255, 215, 0, 0.5) 15%,
      rgba(255, 235, 59, 0.9) 50%, 
      rgba(255, 215, 0, 0.5) 85%, 
      rgba(255, 215, 0, 0) 100%
    );
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
    /* ⚡ OPTIMIZED: Static glow - no animation */
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  
  /* Glassmorphic Card */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(250, 251, 252, 0.6) 100%
  );
  backdrop-filter: blur(10px) saturate(140%);
  
  /* Subtle Border */
  border: 1.5px solid rgba(255, 143, 16, 0.15);
  
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.7) inset,
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.03);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Thin Yellow Top Accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 15%;
    right: 15%;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.6) 50%,
      rgba(255, 215, 0, 0) 100%
    );
    border-radius: 2px 2px 0 0;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: rgba(255, 143, 16, 0.3);
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.85) inset,
      0 8px 20px rgba(255, 143, 16, 0.15),
      0 2px 6px rgba(0, 0, 0, 0.08);
    
    svg {
      ${css`animation: ${float} 1.5s ease-in-out  /* ⚡ OPTIMIZED: Removed infinite */;`}
    }
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  /* Gradient background based on color */
  background: linear-gradient(135deg,
    ${props => props.$color} 0%,
    ${props => props.$color}dd 100%
  );
  
  /* Orange icons get special treatment */
  ${props => props.$color === '#FF7900' && `
    background: linear-gradient(135deg,
      rgba(255, 159, 42, 0.95) 0%,
      rgba(255, 143, 16, 1) 50%,
      rgba(255, 121, 0, 0.98) 100%
    );
  `}
  
  color: white;
  
  /* Premium Shadow */
  box-shadow: 
    0 6px 18px ${props => props.$color}40,
    0 2px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  
  /* Yellow Bottom Accent for Orange icons */
  ${props => props.$color === '#FF7900' && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20%;
      right: 20%;
      height: 2px;
      background: rgba(255, 215, 0, 0.8);
      border-radius: 0 0 12px 12px;
      box-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
    }
  `}
  
  transition: all 0.3s ease;
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    transition: transform 0.3s ease;
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
  
  /* Orange Gradient Text */
  background: linear-gradient(135deg, 
    #FF8F10 0%, 
    #FFAD33 50%, 
    #FF7900 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  filter: drop-shadow(0 1px 2px rgba(255, 143, 16, 0.2));
  ${css`animation: ${gradientShift} 5s ease  /* ⚡ OPTIMIZED: Removed infinite */;`}
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.72rem;
  color: #6c757d;
  line-height: 1.2;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 0.68rem;
  }
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
      color: '#FF7900'  // Orange
    },
    {
      icon: ShoppingCart,
      value: carsSold,
      label: language === 'bg' ? 'Продадени' : 'Sold',
      color: '#4CAF50'  // Green
    },
    {
      icon: Eye,
      value: totalViews,
      label: language === 'bg' ? 'Прегледи' : 'Views',
      color: '#2196F3'  // Blue
    },
    {
      icon: Clock,
      value: formatTime(responseTime),
      label: language === 'bg' ? 'Време отговор' : 'Response',
      color: '#9C27B0'  // Purple
    },
    {
      icon: TrendingUp,
      value: `${responseRate}%`,
      label: language === 'bg' ? 'Процент отговор' : 'Rate',
      color: '#FF9800'  // Orange variant
    },
    {
      icon: MessageCircle,
      value: totalMessages,
      label: language === 'bg' ? 'Съобщения' : 'Messages',
      color: '#00BCD4'  // Cyan
    }
  ];

  return (
    <StatsContainer>
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon $color={stat.color}>
              <stat.icon size={20} strokeWidth={2.5} />
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>
    </StatsContainer>
  );
};

export default ProfileStats;
