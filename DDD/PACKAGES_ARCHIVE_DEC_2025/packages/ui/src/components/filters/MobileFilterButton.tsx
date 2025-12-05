import React from 'react';
import styled from 'styled-components';
import { SlidersHorizontal } from 'lucide-react';

const Button = styled.button<{ hasActiveFilters: boolean }>`
  position: fixed;
  bottom: calc(70px + env(safe-area-inset-bottom)); /* Above bottom nav */
  right: 16px;
  width: 56px;
  height: 56px;
  background: ${props => props.hasActiveFilters 
    ? props.theme.colors.primary?.main || '#FF7900'
    : 'white'};
  color: ${props => props.hasActiveFilters ? 'white' : '#1f2937'};
  border: ${props => props.hasActiveFilters ? 'none' : '2px solid #e5e7eb'};
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 998;
  transition: all 0.2s ease;
  
  /* Ensure minimum touch target */
  min-width: 44px;
  min-height: 44px;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  /* Hide on desktop */
  @media (min-width: 768px) {
    display: none;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface MobileFilterButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
}

export const MobileFilterButton: React.FC<MobileFilterButtonProps> = ({
  onClick,
  activeFiltersCount = 0
}) => {
  return (
    <Button 
      onClick={onClick}
      hasActiveFilters={activeFiltersCount > 0}
      aria-label={`Filters${activeFiltersCount > 0 ? ` (${activeFiltersCount} active)` : ''}`}
    >
      <SlidersHorizontal size={24} />
      {activeFiltersCount > 0 && <Badge>{activeFiltersCount}</Badge>}
    </Button>
  );
};
