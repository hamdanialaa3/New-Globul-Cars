/**
 * ProfileTabs Component
 * نظام التبويبات: Inventory, Social Feed, About
 * متوافق مع الدستور: استخدام أيقونات Lucide-React فقط
 */

import React from 'react';
import styled from 'styled-components';
import { Car, MessageSquare, Info } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';

export type ProfileTabType = 'cars' | 'feed' | 'about';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onChange: (tab: ProfileTabType) => void;
  profileType?: string;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  activeTab, 
  onChange,
  profileType = 'private'
}) => {
  const { language } = useLanguage();

  const tabs: Array<{ id: ProfileTabType; label: { bg: string; en: string }; icon: React.ReactNode }> = [
    {
      id: 'cars',
      label: { bg: 'Обяви', en: 'Inventory' },
      icon: <Car size={18} />
    },
    {
      id: 'feed',
      label: { bg: 'Публикации', en: 'Social Feed' },
      icon: <MessageSquare size={18} />
    },
    {
      id: 'about',
      label: { bg: 'За Нас', en: 'About' },
      icon: <Info size={18} />
    }
  ];

  return (
    <TabsContainer $profileType={profileType}>
      {tabs.map(tab => (
        <TabButton
          key={tab.id}
          $active={activeTab === tab.id}
          $profileType={profileType}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          <span>{language === 'bg' ? tab.label.bg : tab.label.en}</span>
        </TabButton>
      ))}
    </TabsContainer>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const getThemeColor = (type: string) => {
  switch(type) {
    case 'company': return '#1E3A8A';
    case 'dealer': return '#059669';
    case 'private': return '#EA580C';
    default: return '#64748B';
  }
};

const TabsContainer = styled.div<{ $profileType: string }>`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #E2E8F0;
  margin-bottom: 32px;
  padding-bottom: 0;

  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TabButton = styled.button<{ $active: boolean; $profileType: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? getThemeColor(props.$profileType) : 'transparent'};
  color: ${props => props.$active ? getThemeColor(props.$profileType) : '#64748B'};
  font-size: 15px;
  font-weight: ${props => props.$active ? '700' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
  bottom: -2px;

  &:hover {
    color: ${props => getThemeColor(props.$profileType)};
    background: ${props => props.$active ? 'transparent' : 'rgba(0, 0, 0, 0.02)'};
  }

  svg {
    opacity: ${props => props.$active ? '1' : '0.7'};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;
