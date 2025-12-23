/**
 * Grid Section Wrapper - Ultra Modern Automotive Evolution Background
 * Features: AI-powered gradient system, sleek grid overlay, automotive evolution theme
 * From vintage cars → modern vehicles → AI-powered future
 */

import React from 'react';
import styled from 'styled-components';

import { useTheme } from '../../../../contexts/ThemeContext';

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
  min-height: 400px;
  overflow: hidden;
  
  /* Ultra Professional Gradient Backgrounds - Automotive Evolution Theme */
  background: ${props => {
    const { $isDark, $variant } = props;
    
    // Dark Mode Backgrounds
    if ($isDark) {
      switch($variant) {
        case 'vintage':
          return `
            radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(184, 134, 11, 0.12) 0%, transparent 50%),
            linear-gradient(135deg, 
              #0a0a0a 0%, 
              #1a1410 20%,
              #0f0f0f 40%,
              #1a1a1a 60%,
              #0a0a0a 100%
            )
          `;
        case 'modern':
          return `
            radial-gradient(circle at 30% 40%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(118, 75, 162, 0.08) 0%, transparent 50%),
            linear-gradient(135deg,
              #0a0e1a 0%,
              #0f1419 25%,
              #1a1f2e 50%,
              #0f1419 75%,
              #0a0e1a 100%
            )
          `;
        case 'future':
          return `
            radial-gradient(circle at 50% 0%, rgba(0, 180, 216, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(144, 19, 254, 0.12) 0%, transparent 60%),
            linear-gradient(135deg,
              #0a0a1a 0%,
              #0f0f2a 20%,
              #1a1a3a 40%,
              #0f0f2a 60%,
              #0a0a1a 100%
            )
          `;
        case 'ai':
          return `
            radial-gradient(ellipse at 20% 30%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 159, 0.05) 0%, transparent 70%),
            linear-gradient(160deg,
              #050510 0%,
              #0a0a1f 25%,
              #0f0f2e 50%,
              #0a0a1f 75%,
              #050510 100%
            )
          `;
        default:
          return `linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)`;
      }
    } 
    // Light Mode Backgrounds
    else {
      switch($variant) {
        case 'vintage':
          return `
            radial-gradient(circle at 20% 80%, rgba(245, 222, 179, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 239, 213, 0.25) 0%, transparent 50%),
            linear-gradient(135deg,
              #fafafa 0%,
              #f5f0eb 20%,
              #fafafa 40%,
              #f0f0f0 60%,
              #fafafa 100%
            )
          `;
        case 'modern':
          return `
            radial-gradient(circle at 30% 40%, rgba(102, 126, 234, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(118, 75, 162, 0.06) 0%, transparent 50%),
            linear-gradient(135deg,
              #f8f9fa 0%,
              #f0f2f5 25%,
              #e8eef5 50%,
              #f0f2f5 75%,
              #f8f9fa 100%
            )
          `;
        case 'future':
          return `
            radial-gradient(circle at 50% 0%, rgba(0, 180, 216, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(144, 19, 254, 0.06) 0%, transparent 60%),
            linear-gradient(135deg,
              #f5f7fa 0%,
              #e8f0f8 20%,
              #dce8f5 40%,
              #e8f0f8 60%,
              #f5f7fa 100%
            )
          `;
        case 'ai':
          return `
            radial-gradient(ellipse at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 159, 0.03) 0%, transparent 70%),
            linear-gradient(160deg,
              #f8f9fc 0%,
              #f0f3f9 25%,
              #e8eef8 50%,
              #f0f3f9 75%,
              #f8f9fc 100%
            )
          `;
        default:
          return `linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)`;
      }
    }
  }};

  /* Animated subtle gradient shift */
  background-size: 200% 200%;
  animation: gradientShift 20s ease infinite;

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
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
    opacity: ${props => props.$intensity === 'light' ? '0.4' : props.$intensity === 'strong' ? '0.7' : '0.55'};
    animation: glowPulse 4s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { opacity: ${props => props.$intensity === 'light' ? '0.3' : props.$intensity === 'strong' ? '0.6' : '0.45'}; }
    50% { opacity: ${props => props.$intensity === 'light' ? '0.5' : props.$intensity === 'strong' ? '0.8' : '0.65'}; }
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

export const GridSectionWrapper: React.FC<GridSectionWrapperProps> = ({ 
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
};

export default GridSectionWrapper;
