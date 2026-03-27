// src/components/KoliSphereLoader/KoliSphereLoader.tsx
// Unified Glass Sphere Loader - Koli One
// Glass sphere with logo and LED progress ring

import React, { memo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import aiIcon from '../../assets/icons/koli_one_ai_Icon2.webp';

export interface KoliSphereLoaderProps {
  size?: 'small' | 'medium' | 'large';
  progress?: number; // 0-100, undefined = auto orbit
  message?: string;
  showPercentage?: boolean;
  fullscreen?: boolean;
}

// LED glow pulse animation
const ledPulse = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.6));
  }
`;

// LED orbit animation for indeterminate state
const ledOrbit = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Sphere entrance animation
const sphereEntrance = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// LED complete flash
const ledComplete = keyframes`
  0% {
    filter: drop-shadow(0 0 24px rgba(139, 92, 246, 1));
  }
  50% {
    filter: drop-shadow(0 0 32px rgba(139, 92, 246, 1));
  }
  100% {
    filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
  }
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: opacity 0.2s ease-out;
`;

const InlineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const SphereContainer = styled.div<{ $size: 'small' | 'medium' | 'large'; $complete: boolean }>`
  position: relative;
  width: ${props => props.$size === 'small' ? '48px' : props.$size === 'medium' ? '80px' : '120px'};
  height: ${props => props.$size === 'small' ? '48px' : props.$size === 'medium' ? '80px' : '120px'};
  animation: ${sphereEntrance} 0.3s ease-out;
  
  ${props => props.$complete && css`
    animation: ${ledComplete} 0.4s ease-out;
  `}
`;

const GlassSphere = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.08) 30%,
    rgba(20, 20, 30, 0.6) 70%,
    rgba(10, 10, 20, 0.8) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    inset 0 0 ${props => props.$size === 'small' ? '12px' : props.$size === 'medium' ? '20px' : '30px'} rgba(255, 255, 255, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 2;
`;

const LogoImage = styled.img<{ $size: 'small' | 'medium' | 'large' }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.$size === 'small' ? '32px' : props.$size === 'medium' ? '56px' : '84px'};
  height: ${props => props.$size === 'small' ? '32px' : props.$size === 'medium' ? '56px' : '84px'};
  object-fit: contain;
  z-index: 3;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
`;

const LEDRing = styled.div<{ 
  $size: 'small' | 'medium' | 'large'; 
  $progress: number; 
  $autoOrbit: boolean;
  $complete: boolean;
}>`
  position: absolute;
  inset: ${props => props.$size === 'small' ? '-3px' : props.$size === 'medium' ? '-4px' : '-5px'};
  border-radius: 50%;
  z-index: 1;
  animation: ${ledPulse} 2s ease-in-out infinite;

  ${props => props.$complete && css`
    animation: ${ledComplete} 0.4s ease-out;
  `}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: ${props => {
      if (props.$autoOrbit) {
        // Auto orbit mode: 100-degree arc
        return `conic-gradient(
          from 0deg,
          transparent 0deg,
          #3B82F6 30deg,
          #A78BFA 60deg,
          #3B82F6 90deg,
          transparent 100deg,
          transparent 360deg
        )`;
      } else {
        // Progress mode: fill from 0 to progress degree
        const progressDeg = (props.$progress / 100) * 360;
        return `conic-gradient(
          from -90deg,
          #3B82F6 0deg,
          #A78BFA ${progressDeg / 2}deg,
          #3B82F6 ${progressDeg}deg,
          transparent ${progressDeg}deg
        )`;
      }
    }};
    mask: radial-gradient(
      circle,
      transparent calc(50% - ${props => props.$size === 'small' ? '2px' : props.$size === 'medium' ? '3px' : '4px'}),
      black calc(50% - ${props => props.$size === 'small' ? '2px' : props.$size === 'medium' ? '3px' : '4px'}),
      black 50%,
      transparent 50%
    );
    -webkit-mask: radial-gradient(
      circle,
      transparent calc(50% - ${props => props.$size === 'small' ? '2px' : props.$size === 'medium' ? '3px' : '4px'}),
      black calc(50% - ${props => props.$size === 'small' ? '2px' : props.$size === 'medium' ? '3px' : '4px'}),
      black 50%,
      transparent 50%
    );
    
    ${props => props.$autoOrbit && css`
      animation: ${ledOrbit} 1.2s linear infinite;
    `}
  }
`;

const Message = styled.p`
  color: #ffffff;
  text-align: center;
  padding: 0 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const Percentage = styled.span`
  color: #ffffff;
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const ProgressBar = styled.div`
  width: 12rem;
  height: 0.25rem;
  background-color: rgba(55, 65, 81, 0.5);
  border-radius: 9999px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(to right, #3B82F6, #A78BFA);
  transition: width 200ms ease-out;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
  width: ${props => props.$progress}%;
`;

export const KoliSphereLoader: React.FC<KoliSphereLoaderProps> = memo(({
  size = 'medium',
  progress,
  message,
  showPercentage = false,
  fullscreen = false
}) => {
  const isAutoOrbit = progress === undefined;
  const normalizedProgress = Math.min(100, Math.max(0, progress || 0));
  const isComplete = normalizedProgress >= 100;

  const content = (
    <>
      <SphereContainer $size={size} $complete={isComplete}>
        <LEDRing 
          $size={size} 
          $progress={normalizedProgress} 
          $autoOrbit={isAutoOrbit}
          $complete={isComplete}
        />
        <GlassSphere $size={size} />
        <LogoImage src={aiIcon} alt="Koli One" $size={size} />
      </SphereContainer>
      
      {message && <Message>{message}</Message>}
      
      {showPercentage && !isAutoOrbit && (
        <>
          <Percentage aria-label={`${Math.round(normalizedProgress)}%`}>
            {Math.round(normalizedProgress)}%
          </Percentage>
          <ProgressBar>
            <ProgressBarFill $progress={normalizedProgress} />
          </ProgressBar>
        </>
      )}
    </>
  );

  if (fullscreen) {
    return (
      <FullscreenOverlay role="status" aria-live="polite" aria-label="Loading">
        {content}
      </FullscreenOverlay>
    );
  }

  return (
    <InlineContainer role="status" aria-live="polite" aria-label="Loading">
      {content}
    </InlineContainer>
  );
});

KoliSphereLoader.displayName = 'KoliSphereLoader';


