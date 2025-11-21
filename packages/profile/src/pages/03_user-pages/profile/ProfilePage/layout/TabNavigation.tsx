// ProfilePage/layout/TabNavigation.tsx
// Tab navigation for profile sections
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { User, Car, TrendingUp, Settings, MessageSquare, BarChart3 } from 'lucide-react';
import type { ProfileTheme } from '@globul-cars/core/contextsProfileTypeContext';

interface Tab {
  id: string;
  label: string;
  labelEN: string;
  icon: React.ReactNode;
  path: string;
}

interface TabNavigationProps {
  theme: ProfileTheme;
  currentTab: string;
  isOwnProfile: boolean;
}

const TabsContainer = styled.div`
  background: #3e3e3e;
  border-radius: 16px 16px 0 0;
  padding: 12px 24px;
  margin-bottom: 0;
  min-height: 70px;
  
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.3),
    -4px -4px 8px rgba(255, 255, 255, 0.03);
  
  display: flex;
  gap: 8px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 143, 16, 0.3);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 6px;
    min-height: 60px;
  }
`;

const TabButton = styled(NavLink)<{ $theme: ProfileTheme }>`
  background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
  color: rgba(255, 255, 255, 0.7);
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  
  display: flex;
  align-items: center;
  gap: 8px;
  
  box-shadow: 
    3px 3px 6px rgba(0, 0, 0, 0.3),
    -3px -3px 6px rgba(255, 255, 255, 0.05);
  
  &.active {
    background: ${props => props.$theme.gradient};
    color: white;
    box-shadow: 
      4px 4px 8px rgba(0, 0, 0, 0.4),
      -4px -4px 8px rgba(255, 255, 255, 0.08),
      inset 0 0 15px ${props => props.$theme.primary}40;
  }
  
  &:hover:not(.active) {
    background: linear-gradient(135deg, #5a5a5a 0%, #4a4a4a 100%);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 
      5px 5px 10px rgba(0, 0, 0, 0.4),
      -5px -5px 10px rgba(255, 255, 255, 0.08);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.875rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const TabNavigation: React.FC<TabNavigationProps> = ({ theme, currentTab, isOwnProfile }) => {
  const tabs: Tab[] = [
    { id: 'profile', label: 'الملف الشخصي', labelEN: 'Profile', icon: <User />, path: '' },
    { id: 'my-ads', label: 'إعلاناتي', labelEN: 'My Ads', icon: <Car />, path: 'my-ads' },
    { id: 'campaigns', label: 'الحملات', labelEN: 'Campaigns', icon: <TrendingUp />, path: 'campaigns' },
    { id: 'analytics', label: 'الإحصائيات', labelEN: 'Analytics', icon: <BarChart3 />, path: 'analytics' },
    { id: 'settings', label: 'الإعدادات', labelEN: 'Settings', icon: <Settings />, path: 'settings' },
    { id: 'consultations', label: 'الاستشارات', labelEN: 'Consultations', icon: <MessageSquare />, path: 'consultations' }
  ];

  // Filter tabs based on ownership
  const visibleTabs = isOwnProfile 
    ? tabs 
    : tabs.filter(tab => ['profile', 'my-ads'].includes(tab.id));

  return (
    <TabsContainer>
      {visibleTabs.map(tab => (
        <TabButton 
          key={tab.id}
          to={tab.path}
          end={tab.id === 'profile'}
          $theme={theme}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </TabButton>
      ))}
    </TabsContainer>
  );
};

export default TabNavigation;

