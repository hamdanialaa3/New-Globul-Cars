/**
 * Globul Car Logo Component
 * Professional car logo icon to replace emoji 🚗
 */

import React from 'react';
import styled from 'styled-components';

interface GlobulCarLogoProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const LogoContainer = styled.div<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  flex-shrink: 0;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const GlobulCarLogo: React.FC<GlobulCarLogoProps> = ({
  size = 48,
  color,
  className,
  style
}) => {
  return (
    <LogoContainer $size={size} className={className} style={style}>
      <LogoImage
        src={process.env.PUBLIC_URL + "/assets/images/icons/LOGOS/Copilot_20251025_020446.png"}
        alt="Globul Car Logo"
        onError={(e) => {
          // Fallback to a simple car SVG if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.innerHTML = '🚗';
          fallback.style.fontSize = `${size}px`;
          fallback.style.display = 'flex';
          fallback.style.alignItems = 'center';
          fallback.style.justifyContent = 'center';
          target.parentElement?.appendChild(fallback);
        }}
      />
    </LogoContainer>
  );
};

export default GlobulCarLogo;

