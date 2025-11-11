import React from 'react';
import styled from 'styled-components';
import SellProgressBar from './SellProgressBar';
import { SellWorkflowStepId } from '@/constants/sellWorkflowSteps';

interface SellWorkflowLayoutProps {
  currentStep: SellWorkflowStepId;
  children: React.ReactNode;
}

const LayoutWrapper = styled.div`
  background: var(--bg-primary, #f5f7fa);
  min-height: 100vh;
`;

const ProgressWrapper = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem 2rem 0.75rem;

  @media (max-width: 1024px) {
    padding: 1.25rem 1.5rem 0.75rem;
  }

  @media (max-width: 768px) {
    padding: 1rem 1rem 0.5rem;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SellWorkflowLayout: React.FC<SellWorkflowLayoutProps> = ({
  currentStep,
  children
}) => {
  return (
    <LayoutWrapper>
      <ProgressWrapper>
        <SellProgressBar currentStep={currentStep} />
      </ProgressWrapper>
      <ContentWrapper>{children}</ContentWrapper>
    </LayoutWrapper>
  );
};

export default SellWorkflowLayout;

