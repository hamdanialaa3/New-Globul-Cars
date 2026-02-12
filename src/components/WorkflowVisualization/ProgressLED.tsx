// LED Progress Bar Component

import React from 'react';
import styled from 'styled-components';

interface ProgressLEDProps {
  progress: number; // 0-100
  totalSteps: number;
  currentStep: number;
}

const LEDContainer = styled.div`
  width: 100%;
  padding: 1.5rem;
  background: transparent; /* transparent background */
  border-radius: 15px;
  border: 2px solid rgba(255, 143, 16, 0.15); /* light border */
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #ff8f10, #005ca9);
  }
`;

const LEDTitle = styled.div`
  color: #495057; /* dark color instead of light */
  font-size: 0.875rem; /* 14px */
  font-weight: 600;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressPercentage = styled.span`
  color: #ff8f10;
  font-size: 1.25rem; /* 20px */
  font-weight: 700;
  line-height: 1.2;
  font-feature-settings: 'tnum';
  text-shadow: 0 0 10px rgba(255, 143, 16, 0.3);
`;

const LEDStrip = styled.div`
  display: flex;
  gap: 0.3rem;
  padding: 0.75rem;
  background: rgba(255, 143, 16, 0.03); /* very light orange background */
  border-radius: 10px;
  border: 1px solid rgba(255, 143, 16, 0.15); /* light border */
  box-shadow: none; /* remove inner shadow */
`;

const LEDSegment = styled.div<{ $isActive: boolean; $index: number }>`
  flex: 1;
  height: 12px;
  border-radius: 6px;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, #ff8f10, #ffb347)' 
    : 'rgba(200, 200, 200, 0.25)' /* light gray instead of white */
  };
  
  ${props => props.$isActive && `
    box-shadow: 
      0 0 10px rgba(255, 143, 16, 0.8),
      0 0 20px rgba(255, 143, 16, 0.4),
      inset 0 1px 3px rgba(255, 255, 255, 0.5);
    animation: glow 1.5s ease-in-out infinite;
    animation-delay: ${props.$index * 0.05}s;
  `}

  transition: all 0.3s ease;

  @keyframes glow {
    0%, 100% {
      box-shadow: 
        0 0 10px rgba(255, 143, 16, 0.8),
        0 0 20px rgba(255, 143, 16, 0.4),
        inset 0 1px 3px rgba(255, 255, 255, 0.5);
    }
    50% {
      box-shadow: 
        0 0 15px rgba(255, 143, 16, 1),
        0 0 30px rgba(255, 143, 16, 0.6),
        inset 0 1px 3px rgba(255, 255, 255, 0.7);
    }
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  color: #6c757d; /* darker color for clarity */
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  line-height: 1.4;
`;

const ProgressLED: React.FC<ProgressLEDProps> = ({ progress, totalSteps, currentStep }) => {
  const segments = 20; // number of LED segments
  const activeSegments = Math.ceil((progress / 100) * segments);

  return (
    <LEDContainer>
      <LEDTitle>
        <span>Progress</span>
        <ProgressPercentage>{progress}%</ProgressPercentage>
      </LEDTitle>
      
      <LEDStrip>
        {Array.from({ length: segments }).map((_, index) => (
          <LEDSegment 
            key={index} 
            $isActive={index < activeSegments}
            $index={index}
          />
        ))}
      </LEDStrip>

      <StepIndicator>
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{totalSteps - currentStep} remaining</span>
      </StepIndicator>
    </LEDContainer>
  );
};

export default ProgressLED;

