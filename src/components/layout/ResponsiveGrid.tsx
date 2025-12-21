import React from 'react';
import styled from 'styled-components';

interface GridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  className?: string;
}

const StyledGrid = styled.div<{
  $columns: GridProps['columns'];
  $gap: GridProps['gap'];
}>`
  display: grid;
  width: 100%;
  
  /* Gap handling */
  ${props => {
    if (typeof props.$gap === 'number') {
      return `gap: ${props.$gap}px;`;
    } else if (props.$gap) {
      return `
        gap: ${props.$gap.xs || 16}px;
        
        @media (min-width: 640px) {
          gap: ${props.$gap.sm || props.$gap.xs || 16}px;
        }
        
        @media (min-width: 768px) {
          gap: ${props.$gap.md || props.$gap.sm || props.$gap.xs || 16}px;
        }
        
        @media (min-width: 1024px) {
          gap: ${props.$gap.lg || props.$gap.md || props.$gap.sm || props.$gap.xs || 16}px;
        }
      `;
    }
    return 'gap: 16px;';
  }}
  
  /* Mobile first - xs breakpoint */
  grid-template-columns: repeat(${props => props.$columns?.xs || 1}, 1fr);
  
  /* Small screens (640px+) */
  @media (min-width: 640px) {
    grid-template-columns: repeat(${props => props.$columns?.sm || 2}, 1fr);
  }
  
  /* Tablets (768px+) */
  @media (min-width: 768px) {
    grid-template-columns: repeat(${props => props.$columns?.md || 2}, 1fr);
  }
  
  /* Laptops (1024px+) */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(${props => props.$columns?.lg || 3}, 1fr);
  }
  
  /* Desktop (1280px+) */
  @media (min-width: 1280px) {
    grid-template-columns: repeat(${props => props.$columns?.xl || 4}, 1fr);
  }
  
  /* Large desktop (1536px+) */
  @media (min-width: 1536px) {
    grid-template-columns: repeat(${props => props.$columns?.['2xl'] || props.$columns?.xl || 4}, 1fr);
  }
`;

export const ResponsiveGrid: React.FC<GridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = 16,
  className
}) => {
  return (
    <StyledGrid $columns={columns} $gap={gap} className={className}>
      {children}
    </StyledGrid>
  );
};
