// src/components/ProgressBar.tsx
// Sleek Loading Bar - Copper Orange with shimmer (mobile-friendly)
// Shows top-left progress bar on page transitions

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLocation } from 'react-router-dom';

interface ProgressBarProps {
  duration?: number; // Duration in milliseconds (default: 2000ms)
  color?: string;
  size?: number; // Size of the circle in pixels
}

const shimmer = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 0.9; }
  100% { transform: translateX(200%); opacity: 0; }
`;

const ProgressBar: React.FC<ProgressBarProps> = ({
  duration = 2000,
  color = '#FF8F10', // Orange theme color
  size = 50,
}) => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start progress bar on route change
    setIsVisible(true);
    setProgress(0);

    // Simulate realistic progress from 0 to 100%
    const interval = 30; // Update every 30ms for smooth animation
    const totalSteps = duration / interval;
    let step = 0;

    // Realistic loading curve: fast at start, slow at end
    const getProgress = (step: number, total: number): number => {
      // Ease-out curve for realistic loading
      const t = step / total;
      return 100 * (1 - Math.pow(1 - t, 3)); // Cubic ease-out
    };

    const timer = setInterval(() => {
      step++;
      const calculatedProgress = getProgress(step, totalSteps);
      
      if (calculatedProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        // Hide after reaching 100%
        setTimeout(() => {
          setIsVisible(false);
        }, 200);
      } else {
        setProgress(Math.min(calculatedProgress, 99.9));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [location.pathname, duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <BarContainer>
      <BarTrack>
        <BarFill
          $progress={progress}
          $color={color}
          aria-hidden
        />
      </BarTrack>
    </BarContainer>
  );
};

export default ProgressBar;

// Styled Components

const BarContainer = styled.div`
  position: fixed;
  top: 8px;
  left: 12px;
  z-index: 1100;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  @media (max-width: 768px) {
    top: 6px;
    left: 8px;
  }
`;

const BarTrack = styled.div`
  width: 170px;
  height: 6px;
  background: rgba(15, 23, 42, 0.25);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(6px);

  @media (max-width: 768px) {
    width: 140px;
    height: 5px;
  }
`;

const BarFill = styled.div<{ $progress: number; $color: string }>`
  height: 100%;
  width: ${({ $progress }) => `${Math.max(3, $progress)}%`};
  background: linear-gradient(90deg, #C8741A 0%, #FF8F10 45%, #FFB35C 100%);
  box-shadow: 0 0 10px rgba(255, 143, 16, 0.55), 0 0 20px rgba(255, 143, 16, 0.35);
  border-radius: 999px;
  position: relative;
  transition: width 220ms ease-out;

  &::after {
    content: '';
    position: absolute;
    top: -6px;
    left: 0;
    width: 40px;
    height: 16px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
    transform: translateX(-100%);
    animation: ${shimmer} 1.4s ease-in-out infinite;
    filter: blur(2px);
  }
`;

