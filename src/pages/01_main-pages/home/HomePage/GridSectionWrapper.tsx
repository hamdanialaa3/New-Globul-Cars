/**
 * Grid Section Wrapper - Ultra Modern Automotive Evolution Background
 * Features: AI-powered gradient system, sleek grid overlay, automotive evolution theme
 * From vintage cars → modern vehicles → AI-powered future
 */

import React from 'react';
import styled from 'styled-components';

import { useTheme } from '@/contexts/ThemeContext';

interface GridSectionWrapperProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'strong';
  variant?: 'vintage' | 'modern' | 'future' | 'ai';
  className?: string;
}

const SectionContainer = styled.div<{ 
  $isDark: boolean; 
  $intensity: string;
  $variant: string;
}>`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(7, 1fr);
  
  /* Ultra Professional Gradient Backgrounds - Automotive Evolution Theme - 40% Transparency */
  background: ${props => {
    const { $isDark, $variant } = props;
    
    // Dark Mode Backgrounds - New purple gradient
    if ($isDark) {
      return 'linear-gradient(135deg, rgba(15, 23, 42, 1) 6%, rgba(55, 27, 197, 1) 25%, rgba(30, 41, 59, 1) 39%, rgba(15, 23, 42, 1) 100%)';
    } 
    // Light Mode Backgrounds - 40% opacity
    else {
      switch($variant) {
        case 'vintage':
          return `
            radial-gradient(circle at 20% 80%, rgba(245, 222, 179, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 239, 213, 0.1) 0%, transparent 50%),
            linear-gradient(135deg,
              rgba(250, 250, 250, 0.4) 0%,
              rgba(245, 240, 235, 0.4) 20%,
              rgba(250, 250, 250, 0.4) 40%,
              rgba(240, 240, 240, 0.4) 60%,
              rgba(250, 250, 250, 0.4) 100%
            )
          `;
        case 'modern':
          return `
            radial-gradient(circle at 30% 40%, rgba(102, 126, 234, 0.024) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(118, 75, 162, 0.024) 0%, transparent 50%),
            linear-gradient(135deg,
              rgba(248, 249, 250, 0.4) 0%,
              rgba(240, 242, 245, 0.4) 25%,
              rgba(232, 238, 245, 0.4) 50%,
              rgba(240, 242, 245, 0.4) 75%,
              rgba(248, 249, 250, 0.4) 100%
            )
          `;
        case 'future':
          return `
            radial-gradient(circle at 50% 0%, rgba(0, 180, 216, 0.032) 0%, transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(144, 19, 254, 0.024) 0%, transparent 60%),
            linear-gradient(135deg,
              rgba(245, 247, 250, 0.4) 0%,
              rgba(232, 240, 248, 0.4) 20%,
              rgba(220, 232, 245, 0.4) 40%,
              rgba(232, 240, 248, 0.4) 60%,
              rgba(245, 247, 250, 0.4) 100%
            )
          `;
        case 'ai':
          return `
            radial-gradient(ellipse at 20% 30%, rgba(102, 126, 234, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(118, 75, 162, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 159, 0.012) 0%, transparent 70%),
            linear-gradient(160deg,
              rgba(248, 249, 252, 0.4) 0%,
              rgba(240, 243, 249, 0.4) 25%,
              rgba(232, 238, 248, 0.4) 50%,
              rgba(240, 243, 249, 0.4) 75%,
              rgba(248, 249, 252, 0.4) 100%
            )
          `;
        default:
          return `linear-gradient(135deg, rgba(250, 250, 250, 0.4) 0%, rgba(240, 240, 240, 0.4) 100%)`;
      }
    }
  }};

  /* Animated subtle gradient shift - ⚡ PERFORMANCE: Respect prefers-reduced-motion */
  background-size: 200% 200%;
  animation: gradientShift 20s ease infinite;

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Disable animations for users who prefer reduced motion */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-size: 100% 100%;
    background-position: 0% 50%;
  }

  /* Ultra-Modern Grid Overlay - Sleek & Professional */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: ${props => {
      const size = props.$intensity === 'light' ? '80px' : props.$intensity === 'strong' ? '40px' : '60px';
      const opacity = props.$isDark ? '0.04' : '0.02';
      return `
        linear-gradient(90deg, rgba(102, 126, 234, ${opacity}) 1px, transparent 1px),
        linear-gradient(rgba(102, 126, 234, ${opacity}) 1px, transparent 1px)
      `;
    }};
    background-size: ${props => {
      const size = props.$intensity === 'light' ? '80px 80px' : props.$intensity === 'strong' ? '40px 40px' : '60px 60px';
      return size;
    }};
    pointer-events: none;
    z-index: 1;
    opacity: 0.6;
  }

  /* Premium Accent Lines - Cyberpunk Style */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: ${props => {
      const color1 = props.$isDark ? 'rgba(102, 126, 234, 0.12)' : 'rgba(102, 126, 234, 0.08)';
      const color2 = props.$isDark ? 'rgba(118, 75, 162, 0.12)' : 'rgba(118, 75, 162, 0.08)';
      return `
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 19%,
          ${color1} 19.5%,
          ${color1} 20%,
          transparent 20.5%
        ),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 19%,
          ${color2} 19.5%,
          ${color2} 20%,
          transparent 20.5%
        )
      `;
    }};
    background-size: ${props => {
      const size = props.$intensity === 'light' ? '400px 400px' : props.$intensity === 'strong' ? '200px 200px' : '300px 300px';
      return size;
    }};
    pointer-events: none;
    z-index: 2;
    /* Base opacity based on intensity */
    ${props => {
      const baseOpacity = props.$intensity === 'light' ? '0.4' : props.$intensity === 'strong' ? '0.7' : '0.55';
      return `opacity: ${baseOpacity};`;
    }}
    animation: glowPulse 4s ease-in-out infinite;

    /* ⚡ PERFORMANCE: Disable animation for reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      animation: none;
      opacity: 0.5;
    }
  }

  /* Simple pulse animation - opacity varies by 20% */
  @keyframes glowPulse {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 0.65; }
  }

  /* ⚡ PERFORMANCE: Disable all animations for reduced motion */
  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none !important;
    }
  }

  /* Floating Particles Effect (AI Theme) */
  ${props => props.$variant === 'ai' && `
    &::before {
      animation: float 8s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
  `}

  /* Content wrapper */
  > * {
    position: relative;
    z-index: 3;
  }

  /* Smooth transitions */
  transition: background 0.8s ease, opacity 0.4s ease;

  /* Mobile optimization */
  @media (max-width: 768px) {
    &::before {
      background-size: ${props => {
        const size = props.$intensity === 'light' ? '60px 60px' : props.$intensity === 'strong' ? '30px 30px' : '45px 45px';
        return size;
      }};
    }

    &::after {
      background-size: ${props => {
        const size = props.$intensity === 'light' ? '300px 300px' : props.$intensity === 'strong' ? '150px 150px' : '225px 225px';
        return size;
      }};
    }
  }

  /* Performance optimization */
  will-change: background-position;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

// Memoize GridSectionWrapper to prevent unnecessary re-renders
export const GridSectionWrapper: React.FC<GridSectionWrapperProps> = React.memo(({ 
  children, 
  intensity = 'medium',
  variant = 'modern',
  className 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SectionContainer 
      $isDark={isDark} 
      $intensity={intensity}
      $variant={variant}
      className={className}
    >
      {children}
    </SectionContainer>
  );
});

GridSectionWrapper.displayName = 'GridSectionWrapper';

export default GridSectionWrapper;
