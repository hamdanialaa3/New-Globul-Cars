import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

interface SearchTabsProps {
  activeTab: 'quick' | 'detailed';
  onTabChange: (tab: 'quick' | 'detailed') => void;
}

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ active, theme }) =>
    active ? theme.colors.primary.main : 'transparent'};
  color: ${({ active, theme }) =>
    active ? theme.colors.primary.contrastText : theme.colors.text.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base} ${({ theme }) => theme.borderRadius.base} 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) =>
      active ? theme.colors.primary.dark : theme.colors.grey[100]};
  }

  &:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const SearchTabs: React.FC<SearchTabsProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <TabsContainer>
      <Tab
        active={activeTab === 'quick'}
        onClick={() => onTabChange('quick')}
      >
        {t('cars.search.quick')}
      </Tab>
      <Tab
        active={activeTab === 'detailed'}
        onClick={() => onTabChange('detailed')}
      >
        {t('cars.search.detailed')}
      </Tab>
    </TabsContainer>
  );
};

export { SearchTabs };