// ThemeAwareWrapper.tsx
// Theme-aware background system for Private/Dealer/Company profiles

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ProfileType } from '../../../../../../types/user/bulgarian-user.types';

interface ThemeAwareWrapperProps {
  profileType: ProfileType;
  children: React.ReactNode;
  isDark?: boolean;
}

// Subtle animation for background
const subtleShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

// Private User - Home Garage aesthetic
const PrivateBackground = styled.div<{ $isDark?: boolean }>`
  position: relative;
  min-height: 100vh;
  background: ${({ $isDark }) => 
    $isDark
      ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)'};
  background-size: 200% 200%;
  animation: ${subtleShift} 20s ease infinite;
  
  /* Subtle concrete texture overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
`;

// Dealer - Car Lot paved atmosphere
const DealerBackground = styled.div<{ $isDark?: boolean }>`
  position: relative;
  min-height: 100vh;
  background: ${({ $isDark }) => 
    $isDark
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)'};
  background-size: 200% 200%;
  animation: ${subtleShift} 25s ease infinite;
  
  /* Asphalt texture overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.02) 2px,
        rgba(0, 0, 0, 0.02) 4px
      ),
      radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
`;

// Company - High-End Showroom vibe
const CompanyBackground = styled.div<{ $isDark?: boolean }>`
  position: relative;
  min-height: 100vh;
  background: ${({ $isDark }) => 
    $isDark
      ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 30%, #1e40af 50%, #1e3a8a 70%, #0f172a 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 30%, #c7d2fe 50%, #e0e7ff 70%, #f8fafc 100%)'};
  background-size: 200% 200%;
  animation: ${subtleShift} 30s ease infinite;
  
  /* Glass and reflections overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%),
      radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
  
  /* Premium lighting effects */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(
      180deg,
      rgba(59, 130, 246, 0.15) 0%,
      transparent 100%
    );
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

export const ThemeAwareWrapper: React.FC<ThemeAwareWrapperProps> = ({
  profileType,
  children,
  isDark = false
}) => {
  const BackgroundComponent = 
    profileType === 'private' ? PrivateBackground :
    profileType === 'dealer' ? DealerBackground :
    CompanyBackground;

  return (
    <BackgroundComponent $isDark={isDark}>
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </BackgroundComponent>
  );
};

