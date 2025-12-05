// Enhanced Logo Component with 3D Glow Effects
// مكون الشعار المحسّن مع تأثيرات ضوئية 3D

import React from 'react';
import styled, { keyframes } from 'styled-components';

interface EnhancedLogoProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  style?: 'cyan' | 'blue' | 'navy' | 'purple' | 'fine';
}

// Animation: Pulsing Glow
const pulseGlow = keyframes`
  0%, 100% {
    filter: 
      drop-shadow(0 0 2px rgba(3, 233, 244, 0.8))
      drop-shadow(0 0 4px rgba(3, 233, 244, 0.6))
      drop-shadow(0 0 8px rgba(3, 233, 244, 0.4))
      brightness(1.1)
      contrast(1.15);
  }
  50% {
    filter: 
      drop-shadow(0 0 4px rgba(3, 233, 244, 1))
      drop-shadow(0 0 8px rgba(3, 233, 244, 0.8))
      drop-shadow(0 0 16px rgba(3, 233, 244, 0.6))
      brightness(1.2)
      contrast(1.2);
  }
`;

const electricPulse = keyframes`
  0%, 100% {
    filter: 
      drop-shadow(0 0 1px rgba(255, 255, 255, 1))
      drop-shadow(0 0 3px rgba(102, 126, 234, 0.9))
      drop-shadow(0 0 6px rgba(118, 75, 162, 0.7))
      brightness(1.25)
      contrast(1.3);
  }
  50% {
    filter: 
      drop-shadow(0 0 2px rgba(255, 255, 255, 1))
      drop-shadow(0 0 6px rgba(102, 126, 234, 1))
      drop-shadow(0 0 12px rgba(118, 75, 162, 0.9))
      brightness(1.35)
      contrast(1.4);
  }
`;

// Style 1: Cyan Pulse Glow
const CyanGlowLogo = styled.img`
  display: block;
  filter: 
    drop-shadow(0 0 2px rgba(3, 233, 244, 0.8))
    drop-shadow(0 0 4px rgba(3, 233, 244, 0.6))
    drop-shadow(0 0 8px rgba(3, 233, 244, 0.4))
    drop-shadow(0 0 12px rgba(3, 233, 244, 0.2))
    brightness(1.1)
    contrast(1.15);
  animation: ${pulseGlow} 3s ease-in-out infinite;
  transition: all 0.3s ease;

  &:hover {
    filter: 
      drop-shadow(0 0 4px rgba(3, 233, 244, 1))
      drop-shadow(0 0 8px rgba(3, 233, 244, 0.9))
      drop-shadow(0 0 16px rgba(3, 233, 244, 0.7))
      brightness(1.3)
      contrast(1.3);
    transform: scale(1.05);
  }
`;

// Style 2: Blue Neon Border
const BlueNeonLogo = styled.img`
  display: block;
  position: relative;
  filter: 
    drop-shadow(0 0 1px rgba(0, 102, 204, 1))
    drop-shadow(0 0 3px rgba(0, 102, 204, 0.8))
    drop-shadow(0 0 6px rgba(0, 102, 204, 0.6))
    drop-shadow(0 0 10px rgba(0, 102, 204, 0.4))
    saturate(1.3)
    brightness(1.15);
  transition: all 0.3s ease;

  &:hover {
    filter: 
      drop-shadow(0 0 2px rgba(0, 102, 204, 1))
      drop-shadow(0 0 6px rgba(0, 102, 204, 1))
      drop-shadow(0 0 12px rgba(0, 102, 204, 0.8))
      saturate(1.4)
      brightness(1.25);
    transform: scale(1.05) translateY(-2px);
  }
`;

// Style 3: Navy Multi-Layer Glow
const NavyGlowLogo = styled.img`
  display: block;
  filter: 
    drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))
    drop-shadow(0 0 5px rgba(0, 61, 122, 0.8))
    drop-shadow(0 0 10px rgba(0, 61, 122, 0.6))
    drop-shadow(0 0 15px rgba(0, 61, 122, 0.4))
    drop-shadow(0 0 20px rgba(0, 61, 122, 0.2))
    brightness(1.2)
    contrast(1.2);
  transition: all 0.3s ease;

  &:hover {
    filter: 
      drop-shadow(0 0 3px rgba(255, 255, 255, 1))
      drop-shadow(0 0 8px rgba(0, 61, 122, 1))
      drop-shadow(0 0 16px rgba(0, 61, 122, 0.8))
      brightness(1.3)
      contrast(1.3);
  }
`;

// Style 4: Electric Purple Glow
const PurpleGlowLogo = styled.img`
  display: block;
  filter: 
    drop-shadow(0 0 1px rgba(255, 255, 255, 1))
    drop-shadow(0 0 3px rgba(102, 126, 234, 0.9))
    drop-shadow(0 0 6px rgba(118, 75, 162, 0.7))
    drop-shadow(0 0 12px rgba(102, 126, 234, 0.5))
    brightness(1.25)
    contrast(1.3)
    saturate(1.4);
  animation: ${electricPulse} 2s ease-in-out infinite;
`;

// Style 5: Ultra-Fine Cyan Border
const FineBorderLogo = styled.img`
  display: block;
  filter: 
    drop-shadow(0 0 0.5px rgba(3, 233, 244, 1))
    drop-shadow(0 0 1px rgba(3, 233, 244, 0.8))
    drop-shadow(0 0 2px rgba(3, 233, 244, 0.6))
    drop-shadow(0 0 4px rgba(3, 233, 244, 0.4))
    brightness(1.3)
    contrast(1.4)
    saturate(1.3);
  transition: all 0.3s ease;

  &:hover {
    filter: 
      drop-shadow(0 0 1px rgba(3, 233, 244, 1))
      drop-shadow(0 0 3px rgba(3, 233, 244, 0.9))
      drop-shadow(0 0 6px rgba(3, 233, 244, 0.7))
      brightness(1.4)
      contrast(1.5);
  }
`;

const EnhancedLogo: React.FC<EnhancedLogoProps> = ({ 
  src, 
  alt = 'Logo', 
  width, 
  height,
  style = 'cyan'
}) => {
  const LogoComponent = {
    cyan: CyanGlowLogo,
    blue: BlueNeonLogo,
    navy: NavyGlowLogo,
    purple: PurpleGlowLogo,
    fine: FineBorderLogo
  }[style];

  return (
    <LogoComponent 
      src={src} 
      alt={alt}
      style={{ width, height }}
    />
  );
};

export default EnhancedLogo;

