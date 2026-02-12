// AdsToolbar.tsx
// Sorting, Filtering, and View Mode controls

import React from 'react';
import styled from 'styled-components';
import { ArrowUpDown, Filter, Grid, List } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';

export type SortOption = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc' | 'priceLow' | 'priceHigh' | 'yearNew' | 'yearOld' | 'make' | 'model';
export type FilterOption = 'all' | 'active' | 'sold' | 'pending';
export type ViewMode = 'grid' | 'list';

interface AdsToolbarProps {
  sortBy: SortOption;
  filterBy: FilterOption;
  viewMode: ViewMode;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  isDark?: boolean;
}

const ToolbarContainer = styled.div<{ $isDark?: boolean }>`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${({ $isDark }) => $isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)'};
  border-radius: 12px;
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const IconWrapper = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $isDark }) => $isDark ? '#94a3b8' : '#64748b'};
  flex-shrink: 0;
`;

const Label = styled.label<{ $isDark?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const Select = styled.select<{ $isDark?: boolean }>`
  flex: 1;
  padding: 0.625rem 0.875rem;
  background: ${({ $isDark }) => $isDark ? '#0f172a' : '#ffffff'};
  border: 2px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
  border-radius: 8px;
  color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }

  &:hover {
    border-color: #ff8f10;
  }

  option {
    background: ${({ $isDark }) => $isDark ? '#0f172a' : '#ffffff'};
    color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
    padding: 0.5rem;
  }
`;

const ViewModeToggle = styled.div<{ $isDark?: boolean }>`
  display: flex;
  background: ${({ $isDark }) => $isDark ? '#1e293b' : '#ffffff'};
  border-radius: 8px;
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
  overflow: hidden;
  flex-shrink: 0;
`;

const ViewModeButton = styled.button<{ $active: boolean; $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: ${({ $active, $isDark }) => 
    $active 
      ? ($isDark ? '#475569' : '#ff8f10')
      : 'transparent'};
  color: ${({ $active, $isDark }) => 
    $active 
      ? '#ffffff'
      : ($isDark ? '#94a3b8' : '#64748b')};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    background: ${({ $active, $isDark }) => 
      $active 
        ? ($isDark ? '#475569' : '#ff8f10')
        : ($isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const AdsToolbar: React.FC<AdsToolbarProps> = ({
  sortBy,
  filterBy,
  viewMode,
  onSortChange,
  onFilterChange,
  onViewModeChange,
  isDark = false
}) => {
  const { language } = useLanguage();

  return (
    <ToolbarContainer $isDark={isDark}>
      <ControlGroup>
        <IconWrapper $isDark={isDark}>
          <ArrowUpDown size={16} />
        </IconWrapper>
        <Label $isDark={isDark}>
          {language === 'bg' ? 'Сортирай по' : 'Sort by'}:
        </Label>
        <Select 
          $isDark={isDark}
          value={sortBy} 
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="newest">{language === 'bg' ? 'Най-нови първо' : 'Newest first'}</option>
          <option value="oldest">{language === 'bg' ? 'Най-стари първо' : 'Oldest first'}</option>
          <option value="nameAsc">{language === 'bg' ? 'Име (А-Я)' : 'Name (A-Z)'}</option>
          <option value="nameDesc">{language === 'bg' ? 'Име (Я-А)' : 'Name (Z-A)'}</option>
          <option value="priceLow">{language === 'bg' ? 'Цена: ниска → висока' : 'Price: Low to High'}</option>
          <option value="priceHigh">{language === 'bg' ? 'Цена: висока → ниска' : 'Price: High to Low'}</option>
          <option value="yearNew">{language === 'bg' ? 'Година: нова → стара' : 'Year: New to Old'}</option>
          <option value="yearOld">{language === 'bg' ? 'Година: стара → нова' : 'Year: Old to New'}</option>
          <option value="make">{language === 'bg' ? 'По марка' : 'By Make'}</option>
          <option value="model">{language === 'bg' ? 'По модел' : 'By Model'}</option>
        </Select>
      </ControlGroup>

      <ControlGroup>
        <IconWrapper $isDark={isDark}>
          <Filter size={16} />
        </IconWrapper>
        <Label $isDark={isDark}>
          {language === 'bg' ? 'Филтрирай по' : 'Filter by'}:
        </Label>
        <Select 
          $isDark={isDark}
          value={filterBy} 
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
        >
          <option value="all">{language === 'bg' ? 'Всички' : 'All'}</option>
          <option value="active">{language === 'bg' ? 'Активни' : 'Active'}</option>
          <option value="sold">{language === 'bg' ? 'Продадени' : 'Sold'}</option>
          <option value="pending">{language === 'bg' ? 'В изчакване' : 'Pending'}</option>
        </Select>
      </ControlGroup>

      <ViewModeToggle $isDark={isDark}>
        <ViewModeButton
          $active={viewMode === 'grid'}
          $isDark={isDark}
          onClick={() => onViewModeChange('grid')}
          title={language === 'bg' ? 'Мрежа' : 'Grid View'}
        >
          <Grid size={16} />
          {language === 'bg' ? 'Мрежа' : 'Grid'}
        </ViewModeButton>
        <ViewModeButton
          $active={viewMode === 'list'}
          $isDark={isDark}
          onClick={() => onViewModeChange('list')}
          title={language === 'bg' ? 'Списък' : 'List View'}
        >
          <List size={16} />
          {language === 'bg' ? 'Списък' : 'List'}
        </ViewModeButton>
      </ViewModeToggle>
    </ToolbarContainer>
  );
};

