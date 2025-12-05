// ResponsiveCard Component - Moved to @globul-cars/ui package

import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
}

const StyledCard = styled.div<{
  $padding: CardProps['padding'];
  $hoverable: boolean;
  $shadow: CardProps['shadow'];
  $borderRadius: CardProps['borderRadius'];
}>`
  background: white;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.$borderRadius) {
      case 'sm': return 'border-radius: 6px;';
      case 'lg': return 'border-radius: 16px;';
      case 'xl': return 'border-radius: 20px;';
      default: return 'border-radius: 12px;';
    }
  }}
  
  ${props => {
    switch (props.$shadow) {
      case 'none': return 'box-shadow: none; border: 1px solid #e5e7eb;';
      case 'sm': return 'box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);';
      case 'lg': return 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);';
      default: return 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);';
    }
  }}
  
  ${props => {
    switch (props.$padding) {
      case 'none': return 'padding: 0;';
      case 'sm': return 'padding: 12px; @media (max-width: 640px) { padding: 12px; }';
      case 'lg': return 'padding: 24px; @media (max-width: 640px) { padding: 20px; }';
      case 'xl': return 'padding: 32px; @media (max-width: 640px) { padding: 24px; }';
      default: return 'padding: 16px; @media (max-width: 640px) { padding: 16px; }';
    }
  }}
  
  ${props => props.$hoverable && `
    cursor: pointer;
    user-select: none;
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
  `}
`;

export const ResponsiveCard: React.FC<CardProps> = ({
  children,
  padding = 'md',
  hoverable = false,
  shadow = 'md',
  borderRadius = 'md',
  onClick,
  className
}) => {
  return (
    <StyledCard
      $padding={padding}
      $hoverable={hoverable}
      $shadow={shadow}
      $borderRadius={borderRadius}
      onClick={onClick}
      className={className}
    >
      {children}
    </StyledCard>
  );
};

export default ResponsiveCard;
