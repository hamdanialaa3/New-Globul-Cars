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
  opacity: 0.88;
  
  /* ✅ Precise positioning behind profile image - perfectly centered */
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
    margin: 0;
    padding: 0;
    object-fit: contain;
  }
  
  /* Hide on mobile */
  @media (max-width: 960px) {
    display: none;
  }
`;
