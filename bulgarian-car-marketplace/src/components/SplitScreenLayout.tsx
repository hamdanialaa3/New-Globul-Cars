// Split Screen Layout - Content Left, Workflow Right
// تخطيط الشاشة المقسومة - محتوى يسار، أتمتة يمين

import React from 'react';
import styled from 'styled-components';

interface SplitScreenLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftWidth?: string; // Default: 60%
  rightWidth?: string; // Default: 40%
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  min-height: 100vh;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background-image: url('/assets/backgrounds/metal-bg-5.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(248, 249, 250, 0.9);
    z-index: 0;
    filter: blur(2px);
  }

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
  return (
    <Container>
      <LeftPanel>{leftContent}</LeftPanel>
      <RightPanel>{rightContent}</RightPanel>
    </Container>
  );
};

export default SplitScreenLayout;

