// src/components/ProgressBar.tsx
// Circular Loading Spinner with Percentage - Replaces Loading Spinner

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface ProgressBarProps {
  duration?: number; // Duration in milliseconds (default: 2000ms)
  color?: string;
  size?: number; // Size of the circle in pixels
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ProgressBar: React.FC<ProgressBarProps> = ({
  duration = 2000,
  color = '#FF8F10', // Orange theme color
  size = 50,
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Reset on mount
    setProgress(0);
    setIsVisible(true);

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
        }, 400);
      } else {
        setProgress(Math.min(calculatedProgress, 99.9));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  if (!isVisible) {
    return null;
  }

  // Calculate stroke-dasharray and stroke-dashoffset for circular progress
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <SpinnerContainer>
      <SpinnerWrapper size={size}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0, 0, 0, 0.1)"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-out',
            }}
          />
        </svg>
        <PercentageText color={color} size={size}>
          {Math.round(progress)}%
        </PercentageText>
      </SpinnerWrapper>
    </SpinnerContainer>
  );
};

export default ProgressBar;

// Styled Components

const SpinnerContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* لا يتداخل مع النقرات */
`;

const SpinnerWrapper = styled.div<{ size: number }>`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6; /* شفافية 60% */
`;

const PercentageText = styled.span<{ color: string; size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${({ size }) => size * 0.24}px;
  font-weight: 700;
  color: ${({ color }) => color};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: ${({ size }) => size * 0.22}px;
  }
`;

