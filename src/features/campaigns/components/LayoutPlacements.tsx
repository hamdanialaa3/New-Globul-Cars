import React, { useState } from 'react';
import styled from 'styled-components';
import { AdSlot } from './PlacementSlot';

interface StickyProps {
  $position: 'left' | 'right';
  $top?: string;
  $zIndex?: number;
}

const StickyWrapper = styled.div<StickyProps>`
  position: fixed;
  top: ${props => props.$top || '100px'};
  ${props => props.$position}: 20px;
  width: 160px; 
  z-index: ${props => props.$zIndex || 1050};
  
  /* Mobile First: Hidden */
  display: none;

  /* Show only on large screens */
  @media (min-width: 1440px) {
    display: block; 
  }

  transition: opacity 0.3s ease;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -24px;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6b7280;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  
  &:hover {
    background: #f9fafb;
    color: #111;
  }
`;

export const StickyAd: React.FC<{ placementId: string, position: 'left' | 'right', top?: string, zIndex?: number }> = ({ placementId, position, top, zIndex }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <StickyWrapper $position={position} $top={top} $zIndex={zIndex}>
      <CloseButton onClick={() => setVisible(false)} title="Close">&times;</CloseButton>
      <AdSlot placementId={placementId} />
    </StickyWrapper>
  );
};

export const AdContainer = styled.div`
  width: 100%;
  margin: 1.5rem auto;
  max-width: 1200px;
  padding: 0 1rem;
  display: flex;
  justify-content: center;
  
  &.in-content {
    margin: 2rem 0;
    max-width: 100%;
  }
`;
