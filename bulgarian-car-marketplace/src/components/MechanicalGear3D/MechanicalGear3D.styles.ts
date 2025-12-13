import styled from 'styled-components';

export const GearContainer = styled.div<{ $size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  z-index: 99;
  pointer-events: none;
  opacity: 0.85;
  
  /* ✅ Precise positioning behind profile image */
  margin: 0;
  padding: 0;
  
  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
    margin: 0;
    padding: 0;
  }
  
  /* Hide on mobile */
  @media (max-width: 960px) {
    display: none;
  }
`;
