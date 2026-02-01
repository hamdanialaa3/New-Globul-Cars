// src/components/LoadingSpinner.tsx
// Enhanced Loading Spinner with Car Theme
// Koli One - Bulgarian Car Marketplace
// Now uses professional gear animation matching PageLoader

import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const reverseSpin = keyframes`
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
`;

const SpinnerContainer = styled.div<{ size: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

// Professional gear-style spinner
const GearContainer = styled.div<{ size: string }>`
  position: relative;
  width: ${({ size }) =>
    size === 'small' ? '40px' :
      size === 'medium' ? '60px' : '80px'
  };
  height: ${({ size }) =>
    size === 'small' ? '40px' :
      size === 'medium' ? '60px' : '80px'
  };
`;

const OuterGear = styled.div<{ color: string }>`
  position: absolute;
  inset: 0;
  border: 3px solid rgba(209, 213, 219, 0.3);
  border-top-color: ${({ color }) => color};
  border-right-color: ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 1.5s linear infinite;
`;

const InnerGear = styled.div<{ color: string }>`
  position: absolute;
  inset: 8px;
  border: 2px solid rgba(156, 163, 175, 0.4);
  border-bottom-color: ${({ color }) => color};
  border-left-color: ${({ color }) => color};
  border-radius: 50%;
  animation: ${reverseSpin} 2s linear infinite;
`;

const CenterHub = styled.div<{ color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25%;
  height: 25%;
  background-color: ${({ color }) => color};
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const SpinnerText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  font-weight: 500;
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = 'medium',
  color = '#FF8F10', // Koli One orange
  text
}) => {
  return (
    <SpinnerContainer size={size}>
      <GearContainer size={size}>
        <OuterGear color={color} />
        <InnerGear color={color} />
        <CenterHub color={color} />
      </GearContainer>
      {text && <SpinnerText>{text}</SpinnerText>}
    </SpinnerContainer>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
