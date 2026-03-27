// src/pages/AdvancedSearchPage/components/ViewModeToggle.tsx
// Toggle between list and map view

import React from 'react';
import styled from 'styled-components';
import { ViewMode } from '../types';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  t: (key: string) => string;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  t
}) => {
  return (
    <Container>
      <ToggleButton
        active={viewMode === 'list'}
        onClick={() => onViewModeChange('list')}
        aria-label={t('advancedSearch.listView')}
      >
        <ListIcon />
        <span>{t('advancedSearch.listView')}</span>
      </ToggleButton>

      <ToggleButton
        active={viewMode === 'map'}
        onClick={() => onViewModeChange('map')}
        aria-label={t('advancedSearch.mapView')}
      >
        <MapIcon />
        <span>{t('advancedSearch.mapView')}</span>
      </ToggleButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 6px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: ${props => props.active ? '#ffffff' : 'transparent'};
  color: ${props => props.active ? '#3B82F6' : '#666'};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 480px) {
    span {
      display: none;
    }
  }
`;

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

