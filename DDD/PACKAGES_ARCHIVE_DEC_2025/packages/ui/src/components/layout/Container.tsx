import React from 'react';
import styled from 'styled-components';
import { spacing, media } from '../../styles/design-system';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  className?: string;
}

const StyledContainer = styled.div<{
  $maxWidth: ContainerProps['maxWidth'];
  $padding: boolean;
}>`
  width: 100%;
  margin: 0 auto;
  
  max-width: ${props => {
    switch (props.$maxWidth) {
      case 'sm': return '640px';
      case 'md': return '768px';
      case 'lg': return '1024px';
      case 'xl': return '1280px';
      case 'full': return '100%';
      default: return '1280px';
    }
  }};
  
  ${props => props.$padding && `
    padding: 0 ${spacing.md};
    
    ${media.md} {
      padding: 0 ${spacing.lg};
    }
    
    ${media.lg} {
      padding: 0 ${spacing.xl};
    }
  `}
`;

export const Container: React.FC<ContainerProps> = ({
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
