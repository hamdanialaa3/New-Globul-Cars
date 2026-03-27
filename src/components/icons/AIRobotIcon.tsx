/**
 * AIRobotIcon.tsx
 * Custom AI Robot Icon for all AI-related features
 * 
 * Based on: C:\Users\hamda\Desktop\Koli_One_Root\Copilot_20260203_032031.png
 * Features a modern robot head design perfect for AI branding
 * 
 * @version 1.0.0
 */

import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import aiUnifiedIcon from '@/assets/icons/ai/koli_one_ai_Icon2.webp';

interface AIRobotIconProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const IconWrapper = styled.span<{ $animate?: boolean; $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  overflow: hidden;
  border-radius: 4px;
  
  ${p => p.$animate && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`;

const IconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const AIRobotIcon: React.FC<AIRobotIconProps> = ({ 
  size = 48, 
  animate = false,
  className 
}) => {
  return (
    <IconWrapper $size={size} $animate={animate} className={className}>
      <IconImage src={aiUnifiedIcon} alt="AI" />
    </IconWrapper>
  );
};

export default AIRobotIcon;
