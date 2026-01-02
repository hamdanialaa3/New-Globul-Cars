import { keyframes } from 'styled-components';

export const borderGlow = keyframes`
  0%, 100% {
    stroke-opacity: 0.9;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
  50% {
    stroke-opacity: 0.6;
    filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8));
  }
`;

export const borderPulse = keyframes`
  0%, 100% {
    stroke-width: 3;
    stroke-dasharray: 8, 4;
  }
  50% {
    stroke-width: 4;
    stroke-dasharray: 12, 6;
  }
`;

export const markerPulse = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
    border-width: 3px;
  }
  50% {
    opacity: 0.6;
    border-width: 2px;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
    border-width: 1px;
  }
`;

export const legendDotPulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;
