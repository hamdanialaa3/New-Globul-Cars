/**
 * RealisticPaperclipBadge.tsx
 * Simple red ribbon badge - Clean and natural
 * شريط أحمر بسيط - نظيف وطبيعي
 */

import React from 'react';
import styled from 'styled-components';

interface RealisticPaperclipBadgeProps {
  text: string;
  language?: 'bg' | 'en';
  variant?: 'red' | 'yellow';
}

// Container - positioned in center of image
const RibbonContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  z-index: 20;
  pointer-events: none;
`;

// Dynamic ribbon - wider and thinner for longer text
const Ribbon = styled.div<{ $variant: 'red' | 'yellow' }>`
  background: ${p => p.$variant === 'yellow' ? '#EAB308' : '#dc2626'};
  color: ${p => p.$variant === 'yellow' ? '#000000' : 'white'};
  padding: 8px 80px;
  font-weight: 900;
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  min-width: 320px;
  text-align: center;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 6px 60px;
    font-size: 2rem;
    letter-spacing: 2px;
    min-width: 280px;
  }
  
  @media (max-width: 480px) {
    padding: 5px 48px;
    font-size: 1.6rem;
    letter-spacing: 1.5px;
    min-width: 240px;
  }
`;

const RealisticPaperclipBadge: React.FC<RealisticPaperclipBadgeProps> = ({
  text,
  language = 'en',
  variant = 'red'
}) => {
  return (
    <RibbonContainer>
      <Ribbon $variant={variant}>
        {text}
      </Ribbon>
    </RibbonContainer>
  );
};

export default RealisticPaperclipBadge;

