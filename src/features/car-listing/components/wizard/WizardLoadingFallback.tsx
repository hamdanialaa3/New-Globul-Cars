// Loading Fallback for Lazy-loaded Steps
// شاشة تحميل للمكونات المحملة بشكل كسول
import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
`;

export const WizardLoadingFallback: React.FC = () => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>Loading...</LoadingText>
    </LoadingContainer>
  );
};

