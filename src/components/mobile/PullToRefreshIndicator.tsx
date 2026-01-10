/**
 * Reusable Pull-to-Refresh Indicator Component
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowDown, RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pulling: boolean;
  refreshing: boolean;
  pullingText?: string;
  refreshingText?: string;
  position?: 'top' | 'inline';
}

const bounce = keyframes`
  0%, 100% { 
    transform: translateY(0); 
  }
  50% { 
    transform: translateY(-5px); 
  }
`;

const spin = keyframes`
  from { 
    transform: rotate(0deg); 
  }
  to { 
    transform: rotate(360deg); 
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div<{ $position: 'top' | 'inline' }>`
  ${({ $position }) => $position === 'top' ? `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  ` : `
    position: relative;
  `}
  
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  backdrop-filter: blur(10px);
  z-index: 100;
  animation: ${fadeIn} 0.2s ease-out;

  @media (min-width: 769px) {
    display: none; /* Hide on desktop */
  }
`;

const Icon = styled.div<{ $animating: 'bounce' | 'spin' }>`
  margin-right: 8px;
  display: flex;
  align-items: center;
  animation: ${({ $animating }) => $animating === 'bounce' ? bounce : spin} 
    ${({ $animating }) => $animating === 'bounce' ? '1s' : '1s'} 
    ease-in-out infinite;
  color: ${({ theme }) => theme.colors.primary || '#3b82f6'};
`;

const Text = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pulling,
  refreshing,
  pullingText = 'Pull to refresh',
  refreshingText = 'Refreshing...',
  position = 'top'
}) => {
  if (!pulling && !refreshing) return null;

  return (
    <Container $position={position}>
      <Icon $animating={refreshing ? 'spin' : 'bounce'}>
        {refreshing ? <RefreshCw size={20} /> : <ArrowDown size={20} />}
      </Icon>
      <Text>
        {refreshing ? refreshingText : pullingText}
      </Text>
    </Container>
  );
};

export default PullToRefreshIndicator;
