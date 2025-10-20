import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// ==================== TYPES ====================

interface SmartTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  theme: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
  };
  children: React.ReactNode;
}

// ==================== ANIMATIONS ====================

const tooltipFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// ==================== HELPER FUNCTIONS ====================

const getPositionStyles = (position: string) => {
  switch (position) {
    case 'top':
      return `
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
      `;
    case 'bottom':
      return `
        top: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
      `;
    case 'left':
      return `
        right: calc(100% + 8px);
        top: 50%;
        transform: translateY(-50%);
      `;
    case 'right':
      return `
        left: calc(100% + 8px);
        top: 50%;
        transform: translateY(-50%);
      `;
    default:
      return `
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
      `;
  }
};

const getArrowStyles = (position: string, theme: { primary: string }) => {
  const arrowSize = 6;
  const borderColor = `${theme.primary}40`;
  
  switch (position) {
    case 'top':
      return `
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-left: ${arrowSize}px solid transparent;
        border-right: ${arrowSize}px solid transparent;
        border-top: ${arrowSize}px solid ${borderColor};
      `;
    case 'bottom':
      return `
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-left: ${arrowSize}px solid transparent;
        border-right: ${arrowSize}px solid transparent;
        border-bottom: ${arrowSize}px solid ${borderColor};
      `;
    case 'left':
      return `
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-top: ${arrowSize}px solid transparent;
        border-bottom: ${arrowSize}px solid transparent;
        border-left: ${arrowSize}px solid ${borderColor};
      `;
    case 'right':
      return `
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-top: ${arrowSize}px solid transparent;
        border-bottom: ${arrowSize}px solid transparent;
        border-right: ${arrowSize}px solid ${borderColor};
      `;
    default:
      return `
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-left: ${arrowSize}px solid transparent;
        border-right: ${arrowSize}px solid transparent;
        border-top: ${arrowSize}px solid ${borderColor};
      `;
  }
};

// ==================== STYLED COMPONENTS ====================

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

const TooltipBubble = styled.div<{
  $position: string;
  $theme: { primary: string; primaryDark: string; primaryLight: string };
}>`
  position: absolute;
  ${props => getPositionStyles(props.$position)}
  
  background: linear-gradient(
    135deg,
    rgba(62, 62, 62, 0.98),
    rgba(50, 50, 50, 0.98)
  );
  backdrop-filter: blur(10px);
  
  padding: 10px 14px;
  border-radius: 8px;
  
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.6),
    0 0 0 1px ${props => props.$theme.primary}40,
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  animation: ${tooltipFadeIn} 0.2s ease-out;
  
  z-index: 10000;
  pointer-events: none;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    white-space: normal;
    max-width: 200px;
  }
`;

const TooltipArrow = styled.div<{
  $position: string;
  $theme: { primary: string };
}>`
  position: absolute;
  ${props => getArrowStyles(props.$position, props.$theme)}
  width: 0;
  height: 0;
`;

const TooltipContent = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.4;
  
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

// ==================== COMPONENT ====================

const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  position = 'top',
  theme,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <TooltipContainer
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && content && (
        <TooltipBubble
          $position={position}
          $theme={theme}
        >
          <TooltipArrow $position={position} $theme={theme} />
          <TooltipContent>{content}</TooltipContent>
        </TooltipBubble>
      )}
    </TooltipContainer>
  );
};

export default SmartTooltip;
