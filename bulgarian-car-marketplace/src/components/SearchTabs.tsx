import React, { useState } from 'react';
import styled from 'styled-components';
import { Search, Filter, Star, TrendingUp, Clock } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface SearchTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

interface SearchTabsProps {
  tabs: SearchTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  style?: React.CSSProperties;
  showCounts?: boolean;
  showIcons?: boolean;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

const SearchTabsContainer = styled.div<{ variant: string; size: string }>`
  display: flex;
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'pills': return theme.colors.grey[100];
      case 'underline': return 'transparent';
      default: return theme.colors.background.paper;
    }
  }};
  border-radius: ${({ theme, variant }) => {
    switch (variant) {
      case 'pills': return theme.borderRadius.lg;
      case 'underline': return '0';
      default: return theme.borderRadius.base;
    }
  }};
  border: ${({ theme, variant }) => {
    switch (variant) {
      case 'pills': return 'none';
      case 'underline': return 'none';
      default: return `1px solid ${theme.colors.grey[200]}`;
    }
  }};
  overflow: hidden;
  gap: ${({ theme, variant }) => {
    switch (variant) {
      case 'pills': return theme.spacing.xs;
      case 'underline': return '0';
      default: return '0';
    }
  }};
  padding: ${({ theme, variant, size }) => {
    if (variant === 'pills') {
      switch (size) {
        case 'sm': return theme.spacing.xs;
        case 'lg': return theme.spacing.sm;
        default: return theme.spacing.xs;
      }
    }
    return '0';
  }};
`;

const SearchTabButton = styled.button<{ 
  isActive: boolean; 
  variant: string; 
  size: string;
  disabled: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.xs;
      case 'lg': return theme.spacing.md;
      default: return theme.spacing.sm;
    }
  }};
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg': return `${theme.spacing.lg} ${theme.spacing.xl}`;
      default: return `${theme.spacing.md} ${theme.spacing.lg}`;
    }
  }};
  border: none;
  background: ${({ theme, isActive, variant, disabled }) => {
    if (disabled) return 'transparent';
    if (variant === 'pills') {
      return isActive ? theme.colors.primary.main : 'transparent';
    }
    if (variant === 'underline') {
      return 'transparent';
    }
    return isActive ? theme.colors.primary.main : 'transparent';
  }};
  color: ${({ theme, isActive, variant, disabled }) => {
    if (disabled) return theme.colors.text.disabled;
    if (variant === 'pills') {
      return isActive ? theme.colors.primary.contrastText : theme.colors.text.primary;
    }
    if (variant === 'underline') {
      return isActive ? theme.colors.primary.main : theme.colors.text.secondary;
    }
    return isActive ? theme.colors.primary.contrastText : theme.colors.text.primary;
  }};
  font-size: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.sm;
    }
  }};
  font-weight: ${({ theme, isActive }) => 
    isActive ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal
  };
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  position: relative;
  flex: 1;
  justify-content: center;
  border-radius: ${({ theme, variant }) => {
    switch (variant) {
      case 'pills': return theme.borderRadius.base;
      case 'underline': return '0';
      default: return '0';
    }
  }};

  &:hover:not(:disabled) {
    background: ${({ theme, isActive, variant }) => {
      if (variant === 'pills') {
        return isActive ? theme.colors.primary.dark : theme.colors.grey[200];
      }
      if (variant === 'underline') {
        return 'transparent';
      }
      return isActive ? theme.colors.primary.dark : theme.colors.grey[100];
    }};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light + '40'};
  }

  ${({ variant, isActive, theme }) => {
    if (variant === 'underline' && isActive) {
      return `
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: ${theme.colors.primary.main};
        }
      `;
    }
    return '';
  }}
`;

const SearchTabIcon = styled.div<{ size: string }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  svg {
    width: ${({ size }) => {
      switch (size) {
        case 'sm': return '14px';
        case 'lg': return '20px';
        default: return '16px';
      }
    }};
    height: ${({ size }) => {
      switch (size) {
        case 'sm': return '14px';
        case 'lg': return '20px';
        default: return '16px';
      }
    }};
  }
`;

const SearchTabLabel = styled.span`
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SearchTabCount = styled.span<{ isActive: boolean; variant: string }>`
  background: ${({ theme, isActive, variant }) => {
    if (variant === 'pills') {
      return isActive ? 'rgba(255, 255, 255, 0.2)' : theme.colors.grey[300];
    }
    if (variant === 'underline') {
      return isActive ? theme.colors.primary.light + '20' : theme.colors.grey[200];
    }
    return isActive ? 'rgba(255, 255, 255, 0.2)' : theme.colors.grey[300];
  }};
  color: ${({ theme, isActive, variant }) => {
    if (variant === 'pills') {
      return isActive ? theme.colors.primary.contrastText : theme.colors.text.secondary;
    }
    if (variant === 'underline') {
      return isActive ? theme.colors.primary.main : theme.colors.text.secondary;
    }
    return isActive ? theme.colors.primary.contrastText : theme.colors.text.secondary;
  }};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  min-width: 20px;
  text-align: center;
`;

const SearchTabs: React.FC<SearchTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  style,
  showCounts = true,
  showIcons = true,
  variant = 'default',
  size = 'md',
}) => {
  const { t } = useTranslation();

  const getDefaultIcon = (tabId: string) => {
    switch (tabId) {
      case 'search':
        return <Search size={16} />;
      case 'filters':
        return <Filter size={16} />;
      case 'popular':
        return <Star size={16} />;
      case 'trending':
        return <TrendingUp size={16} />;
      case 'recent':
        return <Clock size={16} />;
      default:
        return <Search size={16} />;
    }
  };

  return (
    <SearchTabsContainer 
      className={className} 
      style={style}
      variant={variant}
      size={size}
    >
      {tabs.map((tab) => (
        <SearchTabButton
          key={tab.id}
          isActive={activeTab === tab.id}
          variant={variant}
          size={size}
          disabled={tab.disabled || false}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {showIcons && (
            <SearchTabIcon size={size}>
              {tab.icon || getDefaultIcon(tab.id)}
            </SearchTabIcon>
          )}
          
          <SearchTabLabel>
            {t(`searchTabs.${tab.id}`, tab.label)}
          </SearchTabLabel>
          
          {showCounts && tab.count !== undefined && (
            <SearchTabCount 
              isActive={activeTab === tab.id}
              variant={variant}
            >
              {tab.count}
            </SearchTabCount>
          )}
        </SearchTabButton>
      ))}
    </SearchTabsContainer>
  );
};

export default SearchTabs;