import React from 'react';
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

const SpinnerContainer = styled.div<{ size: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Spinner = styled.div<{ size: string; color: string }>`
  width: ${({ size }) => 
    size === 'small' ? '20px' : 
    size === 'medium' ? '40px' : '60px'
  };
  height: ${({ size }) => 
    size === 'small' ? '20px' : 
    size === 'medium' ? '40px' : '60px'
  };
  border: 3px solid ${({ color }) => color}20;
  border-top: 3px solid ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SpinnerText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#2563eb',
  text 
}) => {
  return (
    <SpinnerContainer size={size}>
      <Spinner size={size} color={color} />
      {text && <SpinnerText>{text}</SpinnerText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;