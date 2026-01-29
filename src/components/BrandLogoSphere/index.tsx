/**
 * Brand Logo Sphere Component
 * 3D Glass sphere displaying car brand logo
 * 
 * Used in:
 * - BrandModelMarkdownDropdown
 * - Equipment pages
 * - Any page that needs to display brand logo with glass effect
 */

import React from 'react';
import styled from 'styled-components';
import CarBrandLogo from '../../components/CarBrandLogo';

const SphereContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GlassSphere = styled.div`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.02) 100%),
              linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 20px 45px rgba(255,255,255,0.06), 
              inset 0 -25px 45px rgba(0,0,0,0.25), 
              0 18px 45px rgba(0,0,0,0.25);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: inset 0 20px 45px rgba(255,255,255,0.08), 
                inset 0 -25px 45px rgba(0,0,0,0.3), 
                0 24px 60px rgba(0,0,0,0.35);
  }

  /* Glass reflection highlight */
  &:after {
    content: '';
    position: absolute;
    top: 12%;
    left: 22%;
    width: 56%;
    height: 24%;
    border-radius: 50%;
    background: radial-gradient(50% 50% at 50% 50%, 
                rgba(255,255,255,0.55) 0%, 
                rgba(255,255,255,0.15) 70%, 
                rgba(255,255,255,0.0) 100%);
    filter: blur(2px);
    pointer-events: none;
  }
`;

const SphereInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Override CarBrandLogo styles to fit inside sphere */
  & > div {
    width: auto !important;
    
    & > div:first-child {
      /* Logo container */
      width: 96px !important;
      height: 96px !important;
      background: transparent !important;
      box-shadow: none !important;
      margin: 0 !important;
      border-radius: 0 !important;

      img {
        width: 96px !important;
        height: 96px !important;
        object-fit: contain;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
      }
    }
  }
`;

interface BrandLogoSphereProps {
  make?: string;
  ariaLabel?: string;
  size?: number;
}

/**
 * BrandLogoSphere Component
 * Displays car brand logo inside a 3D glass sphere
 * 
 * @param make - Brand name (e.g., "BMW", "Mercedes-Benz")
 * @param ariaLabel - Accessibility label
 * @param size - Logo size (default: 96)
 */
export const BrandLogoSphere: React.FC<BrandLogoSphereProps> = ({ 
  make, 
  ariaLabel = 'Brand logo',
  size = 96
}) => {
  if (!make) {
    return null;
  }

  return (
    <SphereContainer>
      <GlassSphere aria-label={ariaLabel}>
        <SphereInner>
          <CarBrandLogo make={make} size={size} showName={false} />
        </SphereInner>
      </GlassSphere>
    </SphereContainer>
  );
};

export default BrandLogoSphere;
