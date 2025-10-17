// src/pages/ProfilePage/TabNavigation.styles.ts
// 🎨 Premium Tab Navigation with Glassmorphism & Metallic Effects
import styled, { keyframes, css } from 'styled-components';

// ==================== ANIMATIONS ====================

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulseYellow = keyframes`
  0%, 100% { opacity: 0.6; box-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }
  50% { opacity: 1; box-shadow: 0 0 16px rgba(255, 215, 0, 0.9); }
`;

const iconFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
`;

// ==================== TAB NAVIGATION ====================

export const TabNavigation = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
  padding: 12px;
  position: relative;
  border-radius: 18px;
  
  /* 🎨 Premium Metallic Aluminum Base */
  background: linear-gradient(135deg,
    rgba(245, 247, 250, 0.95) 0%,
    rgba(233, 237, 242, 0.9) 50%,
    rgba(245, 247, 250, 0.95) 100%
  );
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  
  /* Metallic Border with Orange-Yellow Gradient */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(245, 247, 250, 0.95), rgba(233, 237, 242, 0.9)),
    linear-gradient(135deg,
      rgba(192, 192, 192, 0.4) 0%,
      rgba(255, 143, 16, 0.5) 25%,
      rgba(255, 215, 0, 0.8) 50%,
      rgba(255, 143, 16, 0.5) 75%,
      rgba(192, 192, 192, 0.4) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* Premium Layered Shadows */
  box-shadow:
    0 2px 0 rgba(255, 255, 255, 0.8) inset,
    0 -1px 0 rgba(0, 0, 0, 0.05) inset,
    0 8px 32px rgba(255, 143, 16, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  
  overflow-x: auto;
  overflow-y: hidden;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 143, 16, 0.3) transparent;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #FF8F10 0%, #FFDF00 100%);
    border-radius: 4px;
  }

  /* Animated Yellow Accent Stripe at Bottom */
  &::after {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 8px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, 
      rgba(255, 215, 0, 0) 0%, 
      rgba(255, 215, 0, 0.5) 10%,
      rgba(255, 235, 59, 0.9) 30%,
      rgba(255, 215, 0, 1) 50%, 
      rgba(255, 235, 59, 0.9) 70%,
      rgba(255, 215, 0, 0.5) 90%,
      rgba(255, 215, 0, 0) 100%
    );
    pointer-events: none;
    z-index: 1;
    ${css`animation: ${pulseYellow} 3s ease-in-out infinite;`}
  }
  
  @media (max-width: 768px) {
    gap: 6px;
    padding: 8px;
    border-radius: 14px;
  }
`;

// ==================== TAB BUTTON ====================

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 120px;
  padding: 14px 20px;
  font-weight: 700;
  letter-spacing: 0.3px;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  
  /* 🎨 ACTIVE STATE - Premium Orange Gradient */
  ${({ $active }) => $active ? css`
    background: linear-gradient(135deg,
      rgba(255, 159, 42, 0.98) 0%,
      rgba(255, 143, 16, 1) 30%,
      rgba(255, 121, 0, 1) 60%,
      rgba(255, 102, 0, 0.98) 100%
    );
    background-size: 200% auto;
    color: white;
    border: 2px solid rgba(255, 215, 0, 0.7);
    
    /* Multi-layer Shadow System */
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 -1px 0 rgba(0, 0, 0, 0.1) inset,
      0 8px 24px rgba(255, 143, 16, 0.35),
      0 3px 8px rgba(255, 121, 0, 0.25),
      0 0 0 1px rgba(255, 215, 0, 0.3);
    
    /* Shimmer Animation */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      animation: ${shimmer} 2.5s infinite;
    }
    
    /* Yellow Glow Border Top */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 20%;
      right: 20%;
      height: 2px;
      background: linear-gradient(90deg,
        rgba(255, 235, 59, 0) 0%,
        rgba(255, 235, 59, 1) 50%,
        rgba(255, 235, 59, 0) 100%
      );
      box-shadow: 0 0 8px rgba(255, 235, 59, 0.8);
      border-radius: 2px 2px 0 0;
    }
  ` : css`
    /* INACTIVE STATE - Subtle Glass */
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(248, 249, 250, 0.4) 100%
    );
    backdrop-filter: blur(10px) saturate(140%);
    -webkit-backdrop-filter: blur(10px) saturate(140%);
    color: #6c757d;
    border: 2px solid rgba(200, 200, 200, 0.25);
    
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 4px 12px rgba(0, 0, 0, 0.05),
      0 1px 3px rgba(0, 0, 0, 0.03);
  `}
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* HOVER STATE */
  &:hover {
    ${({ $active }) => $active ? `
      background: linear-gradient(135deg,
        rgba(255, 175, 64, 1) 0%,
        rgba(255, 159, 42, 1) 30%,
        rgba(255, 143, 16, 1) 60%,
        rgba(255, 121, 0, 1) 100%
      );
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.5) inset,
        0 -1px 0 rgba(0, 0, 0, 0.15) inset,
        0 12px 32px rgba(255, 143, 16, 0.45),
        0 4px 12px rgba(255, 121, 0, 0.3),
        0 0 0 1px rgba(255, 215, 0, 0.5);
    ` : `
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(255, 248, 240, 0.6) 100%
      );
      border-color: rgba(255, 143, 16, 0.35);
      color: #495057;
      transform: translateY(-1px);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.8) inset,
        0 6px 16px rgba(255, 143, 16, 0.1),
        0 2px 6px rgba(0, 0, 0, 0.06);
  `}
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* FOCUS STATE */
  &:focus-visible {
    outline: none;
    box-shadow: 
      0 0 0 4px rgba(255, 215, 0, 0.4),
      0 8px 24px rgba(255, 143, 16, 0.3);
  }
  
  /* ACTIVE (PRESSED) STATE */
  &:active {
    transform: ${({ $active }) => $active ? 'translateY(-1px) scale(1.01)' : 'translateY(0)'};
  }
  
  /* SVG Icon Styling */
  svg {
    width: 20px;
    height: 20px;
    filter: ${({ $active }) => $active 
      ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' 
      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'};
    transition: all 0.3s ease;
    ${({ $active }) => $active ? css`animation: ${iconFloat} 2s ease-in-out infinite;` : ''}
  }
  
  @media (max-width: 768px) {
    min-width: 100px;
    padding: 12px 16px;
    font-size: 0.85rem;
    gap: 8px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 480px) {
    min-width: auto;
    padding: 10px 12px;
    font-size: 0.8rem;
    gap: 6px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

// ==================== SYNC BUTTON ====================

export const SyncButton = styled.button`
  width: 100%;
  padding: 12px 18px;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
  
  /* Glassmorphic Light Style */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(248, 249, 250, 0.5) 100%
  );
  backdrop-filter: blur(12px) saturate(150%);
  color: #495057;
  border: 2px solid rgba(200, 200, 200, 0.3);
  
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.7) inset,
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.03);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  /* Yellow Bottom Accent */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.7) 50%,
      rgba(255, 215, 0, 0) 100%
    );
    border-radius: 0 0 12px 12px;
  }
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg,
      rgba(255, 248, 240, 0.8) 0%,
      rgba(255, 243, 224, 0.7) 100%
    );
    border-color: rgba(255, 143, 16, 0.4);
    color: #212529;
    transform: translateY(-2px);
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.9) inset,
      0 6px 18px rgba(255, 143, 16, 0.15),
      0 2px 6px rgba(0, 0, 0, 0.08);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    .spinning {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover:not(:disabled) svg {
    ${css`animation: ${iconFloat} 1s ease-in-out infinite;`}
  }
`;

// ==================== FOLLOW BUTTON ====================

export const FollowButton = styled.button<{ $following: boolean }>`
  padding: 12px 24px;
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  
  /* Following State (Gray Glass) */
  ${({ $following }) => $following ? `
    background: linear-gradient(135deg,
      rgba(108, 117, 125, 0.85) 0%,
      rgba(95, 107, 118, 0.9) 100%
    );
    backdrop-filter: blur(10px);
    color: white;
    border: 2px solid rgba(200, 200, 200, 0.5);
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.3) inset,
      0 4px 12px rgba(108, 117, 125, 0.25),
      0 1px 3px rgba(0, 0, 0, 0.1);
  ` : `
    /* Not Following State (Orange Glass) */
    background: linear-gradient(135deg,
      rgba(255, 159, 42, 0.95) 0%,
      rgba(255, 143, 16, 1) 30%,
      rgba(255, 121, 0, 1) 70%,
      rgba(255, 102, 0, 0.98) 100%
    );
    background-size: 200% auto;
    backdrop-filter: blur(8px);
    color: white;
    border: 2px solid rgba(255, 215, 0, 0.7);
    
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 -1px 0 rgba(0, 0, 0, 0.1) inset,
      0 6px 20px rgba(255, 143, 16, 0.4),
      0 2px 6px rgba(0, 0, 0, 0.1);
    
    /* Shimmer Effect */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      animation: ${shimmer} 3s infinite;
    }
  `}
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    ${({ $following }) => $following ? `
      background: linear-gradient(135deg,
        rgba(129, 138, 146, 0.9) 0%,
        rgba(111, 120, 128, 0.95) 100%
      );
      transform: translateY(-2px);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.4) inset,
        0 6px 16px rgba(108, 117, 125, 0.3),
        0 2px 6px rgba(0, 0, 0, 0.12);
    ` : `
      background: linear-gradient(135deg,
        rgba(255, 175, 64, 1) 0%,
        rgba(255, 159, 42, 1) 30%,
        rgba(255, 143, 16, 1) 70%,
        rgba(255, 121, 0, 1) 100%
      );
      transform: translateY(-3px) scale(1.02);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.5) inset,
        0 -1px 0 rgba(0, 0, 0, 0.15) inset,
        0 10px 28px rgba(255, 143, 16, 0.5),
        0 4px 10px rgba(255, 121, 0, 0.3);
    `}
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    ${css`animation: ${iconFloat} 1.5s ease-in-out infinite;`}
  }
`;
