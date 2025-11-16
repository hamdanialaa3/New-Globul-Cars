// Split Screen Layout - Content Left, Workflow Right
// تخطيط الشاشة المقسومة - محتوى يسار، أتمتة يمين

import React from 'react';
import styled from 'styled-components';

interface SplitScreenLayoutProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
}

const Container = styled.div<{ $hasRight: boolean }>`
  display: grid;
  grid-template-columns: ${({ $hasRight }) => ($hasRight ? '1fr 400px' : '1fr')};
  gap: 2rem;
  min-height: 100vh;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background: var(--bg-primary);
  position: relative;
  transition: background-color 0.3s ease;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const RightPanel = styled.div`
  position: relative;
  z-index: 1;
  
  @media (max-width: 968px) {
    order: -1; // Show workflow first on mobile
  }
`;

const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  leftContent,
  rightContent
}) => {
  const hasRightContent = Boolean(rightContent);

  return (
    <Container $hasRight={hasRightContent}>
      <LeftPanel>{leftContent}</LeftPanel>
      {hasRightContent && <RightPanel>{rightContent}</RightPanel>}
    </Container>
  );
};

export default SplitScreenLayout;

