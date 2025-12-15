/**
 * Simple Loading Overlay - Percentage Counter Only
 * No animations, no logos, no AI - just clean numbers
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface LightweightLoadingOverlayProps {
  isVisible: boolean;
}

// ============================================
// Styled Components
// ============================================

const LoaderContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${props => (props.isVisible ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  background: #000000;
  z-index: 1000;
`;

const LoaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Percentage = styled.div`
  font-size: 4rem;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Arial', sans-serif;
`;

const Label = styled.div`
  font-size: 1rem;
  font-weight: 400;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

// ============================================
// Component
// ============================================

const LightweightLoadingOverlay: React.FC<LightweightLoadingOverlayProps> = ({ 
  isVisible
}) => {
  const [percent, setPercent] = useState(0);

  // Simple percentage counter 0-100%
  useEffect(() => {
    if (!isVisible) {
      setPercent(0);
      return;
    }

    let currentPercent = 0;
    const loadInterval = setInterval(() => {
      currentPercent = Math.min(currentPercent + Math.random() * 15, 100);
      setPercent(Math.floor(currentPercent));

      if (currentPercent >= 100) {
        clearInterval(loadInterval);
      }
    }, 200);

    return () => clearInterval(loadInterval);
  }, [isVisible]);

  return (
    <LoaderContainer isVisible={isVisible}>
      <LoaderContent>
        <Percentage>{percent}%</Percentage>
        <Label>Loading...</Label>
      </LoaderContent>
    </LoaderContainer>
  );
};

export default LightweightLoadingOverlay;
