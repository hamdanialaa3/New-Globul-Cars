// ProfilePage/layout/ProfileLayout.tsx
// Main layout wrapper for Profile Page
// Phase 0 Day 2: Extracted from index.tsx (2227 lines → <300)

import React from 'react';
import styled from 'styled-components';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';

interface ProfileLayoutProps {
  children: React.ReactNode;
  theme: ProfileTheme;
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 100%);
  padding-bottom: 60px;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, theme }) => {
  return (
    <LayoutContainer>
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default ProfileLayout;

