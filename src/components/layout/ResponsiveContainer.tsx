import React from 'react';
import styled from 'styled-components';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
}

const StyledContainer = styled.div<{
  $maxWidth: ContainerProps['maxWidth'];
  $padding: boolean;
}>`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  
  /* Max width variants */
  ${props => {
    switch (props.$maxWidth) {
      case 'sm':
        return 'max-width: 640px;';
      case 'md':
        return 'max-width: 768px;';
      case 'lg':
        return 'max-width: 1024px;';
      case 'xl':
        return 'max-width: 1280px;';
      case '2xl':
        return 'max-width: 1536px;';
      case 'full':
        return 'max-width: 100%;';
      default:
        return 'max-width: 1280px;'; // xl by default
    }
  }}
  
  /* Responsive padding */
  ${props => props.$padding && `
    padding-left: 16px;
    padding-right: 16px;
    
    @media (min-width: 640px) {
      padding-left: 24px;
      padding-right: 24px;
    }
    
    @media (min-width: 1024px) {
      padding-left: 32px;
      padding-right: 32px;
    }
    
    @media (min-width: 1280px) {
      padding-left: 40px;
      padding-right: 40px;
    }
  `}
`;

export const ResponsiveContainer: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = true,
  className
}) => {
  return (
    <StyledContainer $maxWidth={maxWidth} $padding={padding} className={className}>
      {children}
    </StyledContainer>
  );
};
