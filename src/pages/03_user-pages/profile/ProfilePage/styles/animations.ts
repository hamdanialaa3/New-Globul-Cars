import { css, keyframes } from 'styled-components';

// ==================== KEYFRAMES & ANIMATIONS ====================

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ✅ LED border sweep (modern, subtle, realistic)
export const ledSweep = keyframes`
  0% { transform: translateX(-60%); opacity: 0; }
  10% { opacity: 1; }
  50% { opacity: 1; }
  90% { opacity: 0.9; }
  100% { transform: translateX(160%); opacity: 0; }
`;

export const ledBreath = keyframes`
  0%, 100% { opacity: 0.55; filter: blur(0px); }
  50% { opacity: 0.95; filter: blur(0.2px); }
`;

export const pulse = (color: string) => keyframes`
  0% { box-shadow: 0 0 0 0 ${color}; }
  70% { box-shadow: 0 0 0 10px rgba(204,169,44, 0); }
  100% { box-shadow: 0 0 0 0 rgba(204,169,44, 0); }
`;

// ==================== CSS MIXINS ====================

export const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Martica', 'Arial', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 50px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.3s ease;
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    svg {
      transform: scale(1.1);
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

// ✅ Reusable LED frame (applies only for dealer/company)
export const ledFrame = css`
  position: relative;
  overflow: hidden;

  /* Thin LED strip */
  &::before {
    content: '';
    position: absolute;
    left: 10px;
    right: 10px;
    top: 0;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--led-color) 20%,
      rgba(255, 255, 255, 0.85) 50%,
      var(--led-color) 80%,
      transparent 100%
    );
    opacity: 0;
    pointer-events: none;
  }

  /* Moving highlight sweep (realistic LED shimmer) */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -60%;
    width: 60%;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.0) 10%,
      rgba(255, 255, 255, 0.95) 50%,
      rgba(255, 255, 255, 0.0) 90%,
      transparent 100%
    );
    opacity: 0;
    pointer-events: none;
  }

  /* Enable LED only for dealer/company */
  &::before {
    animation: ${ledBreath} 2.4s ease-in-out infinite;
    box-shadow:
      0 0 10px var(--led-glow),
      0 0 18px var(--led-glow);
    opacity: 0.85; 
  }
  &::after {
    animation: ${ledSweep} 1.9s ease-in-out infinite;
    opacity: 0.85;
    box-shadow: 0 0 16px var(--led-glow);
  }
`;
