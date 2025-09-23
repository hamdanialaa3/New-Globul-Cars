import React from 'react';
import styled from 'styled-components';

interface CheckboxGridProps {
  children: React.ReactNode;
  columns?: number;
}

export const CheckboxGrid: React.FC<CheckboxGridProps> = ({
  children,
  columns = 2
}) => {
  return (
    <GridContainer columns={columns}>
      {children}
    </GridContainer>
  );
};

// Styled Components
const GridContainer = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;