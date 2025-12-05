import React from 'react';
import styled from 'styled-components';
import { spacing, media } from '../../styles/design-system';

interface GridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

const StyledGrid = styled.div<{
  $columns: GridProps['columns'];
  $gap: string;
}>`
  display: grid;
  gap: ${props => props.$gap};
  grid-template-columns: repeat(${props => props.$columns?.xs || 1}, 1fr);
  
  ${media.sm} {
    grid-template-columns: repeat(${props => props.$columns?.sm || 2}, 1fr);
  }
  
  ${media.md} {
    grid-template-columns: repeat(${props => props.$columns?.md || 2}, 1fr);
  }
  
  ${media.lg} {
    grid-template-columns: repeat(${props => props.$columns?.lg || 3}, 1fr);
  }
  
  ${media.xl} {
    grid-template-columns: repeat(${props => props.$columns?.xl || 4}, 1fr);
  }
`;

export const Grid: React.FC<GridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = spacing.md,
  className
}) => {
  return (
    <StyledGrid $columns={columns} $gap={gap} className={className}>
      {children}
    </StyledGrid>
  );
};
