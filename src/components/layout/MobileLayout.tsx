// Mobile Container Component
// Professional container system for mobile and portrait tablets
// Inspired by mobile.de layout patterns

import React from 'react';
import styled from 'styled-components';
import { 
  mobileSpacing, 
  mobileBreakpoints,
  mobileMediaQueries,
  mobileMixins 
} from '../../styles/mobile-design-system';

interface MobileContainerProps {
  children: React.ReactNode;
  noPadding?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const StyledContainer = styled.div<{ 
  $noPadding: boolean; 
  $maxWidth: string 
}>`
  width: 100%;
  margin: 0 auto;
  padding: ${props => props.$noPadding ? '0' : mobileSpacing.containerPadding.xs};
  
  max-width: ${props => {
    switch(props.$maxWidth) {
      case 'sm': return `${mobileBreakpoints.sm}px`;
      case 'md': return `${mobileBreakpoints.md}px`;
      case 'lg': return `${mobileBreakpoints.lg}px`;
      case 'full': return '100%';
      default: return `${mobileBreakpoints.max}px`;
    }
  }};
  
  ${mobileMediaQueries.sm} {
    padding: ${props => props.$noPadding ? '0' : mobileSpacing.containerPadding.sm};
  }
  
  ${mobileMediaQueries.md} {
    padding: ${props => props.$noPadding ? '0' : mobileSpacing.containerPadding.md};
  }
  
  ${mobileMediaQueries.lg} {
    padding: ${props => props.$noPadding ? '0' : mobileSpacing.containerPadding.lg};
  }
`;

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  noPadding = false,
  maxWidth = 'lg',
  className
}) => {
  return (
    <StyledContainer 
      $noPadding={noPadding} 
      $maxWidth={maxWidth}
      className={className}
    >
      {children}
    </StyledContainer>
  );
};

// Section component for content grouping
interface MobileSectionProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'alt';
  className?: string;
}

const StyledSection = styled.section<{ 
  $spacing: string;
  $background: string;
}>`
  padding-top: ${props => props.$spacing};
  padding-bottom: ${props => props.$spacing};
  background-color: ${props => props.$background};
`;

export const MobileSection: React.FC<MobileSectionProps> = ({
  children,
  spacing = 'lg',
  background = 'default',
  className
}) => {
  const spacingMap = {
    sm: mobileSpacing.lg,
    md: mobileSpacing.xl,
    lg: mobileSpacing.xxl,
    xl: mobileSpacing.xxxl
  };
  
  const backgroundMap = {
    default: 'transparent',
    alt: '#F8F9FA'
  };
  
  return (
    <StyledSection
      $spacing={spacingMap[spacing]}
      $background={backgroundMap[background]}
      className={className}
    >
      {children}
    </StyledSection>
  );
};

// Stack component for vertical spacing
interface MobileStackProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

const StyledStack = styled.div<{ 
  $spacing: string;
  $align: string;
}>`
  ${mobileMixins.flexColumn}
  align-items: ${props => props.$align};
  gap: ${props => props.$spacing};
`;

export const MobileStack: React.FC<MobileStackProps> = ({
  children,
  spacing = 'md',
  align = 'stretch',
  className
}) => {
  const spacingMap = {
    xs: mobileSpacing.xs,
    sm: mobileSpacing.sm,
    md: mobileSpacing.md,
    lg: mobileSpacing.lg,
    xl: mobileSpacing.xl
  };
  
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch'
  };
  
  return (
    <StyledStack
      $spacing={spacingMap[spacing]}
      $align={alignMap[align]}
      className={className}
    >
      {children}
    </StyledStack>
  );
};

// Grid component for responsive layouts
interface MobileGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const StyledGrid = styled.div<{ 
  $columns: number;
  $gap: string;
}>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, 1fr);
  gap: ${props => props.$gap};
  
  ${mobileMediaQueries.maxXs} {
    grid-template-columns: 1fr;
  }
`;

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className
}) => {
  const gapMap = {
    xs: mobileSpacing.xs,
    sm: mobileSpacing.sm,
    md: mobileSpacing.md,
    lg: mobileSpacing.lg
  };
  
  return (
    <StyledGrid
      $columns={columns}
      $gap={gapMap[gap]}
      className={className}
    >
      {children}
    </StyledGrid>
  );
};

// Divider component
interface MobileDividerProps {
  spacing?: 'sm' | 'md' | 'lg';
  color?: 'light' | 'medium' | 'dark';
}

const StyledDivider = styled.hr<{ 
  $spacing: string;
  $color: string;
}>`
  margin: ${props => props.$spacing} 0;
  border: none;
  height: 1px;
  background-color: ${props => props.$color};
`;

export const MobileDivider: React.FC<MobileDividerProps> = ({
  spacing = 'md',
  color = 'light'
}) => {
  const spacingMap = {
    sm: mobileSpacing.sm,
    md: mobileSpacing.md,
    lg: mobileSpacing.lg
  };
  
  const colorMap = {
    light: '#E9ECEF',
    medium: '#DEE2E6',
    dark: '#CED4DA'
  };
  
  return (
    <StyledDivider
      $spacing={spacingMap[spacing]}
      $color={colorMap[color]}
    />
  );
};

// Card component
interface MobileCardProps {
  children: React.ReactNode;
  noPadding?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

const StyledCard = styled.div<{ 
  $noPadding: boolean;
  $hoverable: boolean;
  $clickable: boolean;
}>`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: ${props => props.$noPadding ? '0' : mobileSpacing.lg};
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  
  ${props => props.$hoverable && `
    &:active {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
  `}
`;

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  noPadding = false,
  hoverable = false,
  onClick,
  className
}) => {
  return (
    <StyledCard
      $noPadding={noPadding}
      $hoverable={hoverable}
      $clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      {children}
    </StyledCard>
  );
};
