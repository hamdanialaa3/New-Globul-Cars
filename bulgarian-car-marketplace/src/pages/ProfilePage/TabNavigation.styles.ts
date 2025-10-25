// src/pages/ProfilePage/TabNavigation.styles.ts
// 🎨 Premium Tab Navigation with Glassmorphism & Metallic Effects
import styled, { keyframes, css } from 'styled-components';
import { NavLink } from 'react-router-dom';

// 🎨 NEW: Theme Color Prop Interface
interface ThemedProps {
  $themeColor?: string;
}

// ==================== ANIMATIONS ====================
// ⚡ OPTIMIZED: Removed all infinite animations
// Using only CSS transitions for better performance

// ==================== TAB NAVIGATION ====================

export const TabNavigation = styled.div<{ $themeColor?: string }>`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px;
  position: relative;
  border-radius: 18px;
  min-height: 70px;
  flex-wrap: nowrap;
  
  /* 📱 Mobile: صفين (3+3) */
  @media (max-width: 1024px) {
    flex-wrap: wrap;
    min-height: auto;
    gap: 10px;
    padding: 14px;
  }
  
  /* 🎨 Premium Metallic Aluminum Base */
  background: linear-gradient(135deg,
    rgba(245, 247, 250, 0.95) 0%,
    rgba(233, 237, 242, 0.9) 50%,
    rgba(245, 247, 250, 0.95) 100%
  );
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  
  /* 🎨 DYNAMIC: Metallic Border with Theme Color Gradient */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(245, 247, 250, 0.95), rgba(233, 237, 242, 0.9)),
    linear-gradient(135deg,
      rgba(192, 192, 192, 0.4) 0%,
      ${props => props.$themeColor ? `${props.$themeColor}80` : 'rgba(255, 143, 16, 0.5)'} 25%,
      ${props => props.$themeColor ? `${props.$themeColor}CC` : 'rgba(255, 215, 0, 0.8)'} 50%,
      ${props => props.$themeColor ? `${props.$themeColor}80` : 'rgba(255, 143, 16, 0.5)'} 75%,
      rgba(192, 192, 192, 0.4) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* 🎨 DYNAMIC: Premium Layered Shadows with Theme Color */
  box-shadow:
    0 2px 0 rgba(255, 255, 255, 0.8) inset,
    0 -1px 0 rgba(0, 0, 0, 0.05) inset,
    ${props => props.$themeColor ? `0 8px 32px ${props.$themeColor}14` : '0 8px 32px rgba(255, 143, 16, 0.08)'},
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  
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
    background: ${props => props.$themeColor 
      ? `linear-gradient(90deg, ${props.$themeColor} 0%, ${props.$themeColor}CC 100%)` 
      : 'linear-gradient(90deg, #FF8F10 0%, #FFDF00 100%)'};
    border-radius: 4px;
  }
  
  /* 📱 في الموبايل: إخفاء scrollbar (لأننا نستخدم صفين) */
  @media (max-width: 1024px) {
    overflow-x: visible;
    overflow-y: visible;
  }

  /* 🎨 DYNAMIC: Animated Accent Stripe at Bottom with Theme Color */
  &::after {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 8px;
    height: 3px;
    border-radius: 3px;
    background: ${props => {
      const color = props.$themeColor || '#FFD700';
      return `linear-gradient(90deg, 
        ${color}00 0%, 
        ${color}80 10%,
        ${color}E6 30%,
        ${color} 50%, 
        ${color}E6 70%,
        ${color}80 90%,
        ${color}00 100%
      )`;
    }};
    pointer-events: none;
    z-index: 1;
    /* ⚡ OPTIMIZED: Static glow instead of pulse animation */
    opacity: 0.8;
    box-shadow: ${props => props.$themeColor 
      ? `0 0 12px ${props.$themeColor}B3` 
      : '0 0 12px rgba(255, 215, 0, 0.7)'};
  }
  
  @media (max-width: 768px) {
    gap: 6px;
    padding: 8px;
    border-radius: 14px;
  }
`;

// ==================== TAB BUTTON ====================

export const TabButton = styled.button<{ $active: boolean; $themeColor?: string }>`
  flex: 1;
  min-width: 90px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  white-space: nowrap;
  
  /* 📱 Tablet & Mobile: 3 أزرار في كل صف */
  @media (max-width: 1024px) {
    flex: 0 0 calc(33.333% - 7px);
    min-width: 0;
    max-width: calc(33.333% - 7px);
  }
  
  /* 🎨 DYNAMIC: ACTIVE STATE with Theme Color */
  ${({ $active, $themeColor }) => $active ? css`
    background: ${$themeColor 
      ? `linear-gradient(135deg,
          ${$themeColor}FA 0%,
          ${$themeColor} 30%,
          ${$themeColor} 60%,
          ${$themeColor}FA 100%
        )`
      : `linear-gradient(135deg,
          rgba(255, 159, 42, 0.98) 0%,
          rgba(255, 143, 16, 1) 30%,
          rgba(255, 121, 0, 1) 60%,
          rgba(255, 102, 0, 0.98) 100%
        )`
    };
    background-size: 200% auto;
    color: white;
    border: 2px solid ${$themeColor ? `${$themeColor}B3` : 'rgba(255, 215, 0, 0.7)'};
    
    /* 🎨 DYNAMIC: Multi-layer Shadow System with Theme Color */
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 -1px 0 rgba(0, 0, 0, 0.1) inset,
      ${$themeColor ? `0 8px 24px ${$themeColor}59` : '0 8px 24px rgba(255, 143, 16, 0.35)'},
      ${$themeColor ? `0 3px 8px ${$themeColor}40` : '0 3px 8px rgba(255, 121, 0, 0.25)'},
      ${$themeColor ? `0 0 0 1px ${$themeColor}4D` : '0 0 0 1px rgba(255, 215, 0, 0.3)'};
    
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
      /* ⚡ OPTIMIZED: Static shimmer effect */
      background-size: 200% 100%;
      background-position: 0% 0%;
    }
    
    &:hover::before {
      background-position: 100% 0%;
      transition: background-position 0.6s ease;
    }
    
    /* 🎨 DYNAMIC: Glow Border Top with Theme Color */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 20%;
      right: 20%;
      height: 2px;
      background: ${$themeColor 
        ? `linear-gradient(90deg,
            ${$themeColor}00 0%,
            ${$themeColor} 50%,
            ${$themeColor}00 100%
          )`
        : `linear-gradient(90deg,
            rgba(255, 235, 59, 0) 0%,
            rgba(255, 235, 59, 1) 50%,
            rgba(255, 235, 59, 0) 100%
          )`
      };
      box-shadow: ${$themeColor ? `0 0 8px ${$themeColor}CC` : '0 0 8px rgba(255, 235, 59, 0.8)'};
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
  
  /* 🎨 DYNAMIC: HOVER STATE with Theme Color */
  &:hover {
    ${({ $active, $themeColor }) => $active ? `
      background: ${$themeColor 
        ? `linear-gradient(135deg,
            ${$themeColor}FF 0%,
            ${$themeColor}FA 30%,
            ${$themeColor} 60%,
            ${$themeColor}FA 100%
          )`
        : `linear-gradient(135deg,
            rgba(255, 175, 64, 1) 0%,
            rgba(255, 159, 42, 1) 30%,
            rgba(255, 143, 16, 1) 60%,
            rgba(255, 121, 0, 1) 100%
          )`
      };
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.5) inset,
        0 -1px 0 rgba(0, 0, 0, 0.15) inset,
        ${$themeColor ? `0 12px 32px ${$themeColor}73` : '0 12px 32px rgba(255, 143, 16, 0.45)'},
        ${$themeColor ? `0 4px 12px ${$themeColor}4D` : '0 4px 12px rgba(255, 121, 0, 0.3)'},
        ${$themeColor ? `0 0 0 1px ${$themeColor}80` : '0 0 0 1px rgba(255, 215, 0, 0.5)'};
    ` : `
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(255, 248, 240, 0.6) 100%
      );
      border-color: ${$themeColor ? `${$themeColor}59` : 'rgba(255, 143, 16, 0.35)'};
      color: #495057;
      transform: translateY(-1px);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.8) inset,
        ${$themeColor ? `0 6px 16px ${$themeColor}1A` : '0 6px 16px rgba(255, 143, 16, 0.1)'},
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
    will-change: transform;  /* ⚡ GPU acceleration */
    /* ⚡ OPTIMIZED: No infinite float, only hover */
  }
  
  &:hover svg {
    transform: translateY(-2px);
  }
  
  /* 📱 تحسينات للموبايل - الأزرار في صفين */
  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 0.75rem;
    gap: 4px;
    min-height: 44px;
  
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 8px 6px;
    font-size: 0.7rem;
    gap: 3px;
    min-height: 40px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  @media (max-width: 380px) {
    padding: 6px 4px;
    font-size: 0.65rem;
    gap: 2px;
    min-height: 36px;
    
    svg {
      width: 12px;
      height: 12px;
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
      animation: spin 1s linear;  /* ⚡ OPTIMIZED: Spins once, not infinite */
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
    /* ⚡ OPTIMIZED: Simple transform instead of infinite animation */
    transform: translateY(-2px) scale(1.05);
    transition: transform 0.3s ease;
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
      /* ⚡ OPTIMIZED: Static shimmer gradient */
      background-size: 200% 100%;
      background-position: 0% 0%;
    }
    
    &:hover::before {
      background-position: 100% 0%;
      transition: background-position 0.8s ease;
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
    /* ⚡ OPTIMIZED: Simple transform instead of infinite float */
    transform: translateY(-2px);
    transition: transform 0.3s ease;
  }
`;

// ==================== TAB NAV LINK (for React Router) ====================
export const TabNavLink = styled(NavLink)<{ $themeColor?: string }>`
  flex: 1;
  min-width: 90px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  text-decoration: none;
  color: inherit;
  
  /* 📱 Tablet & Mobile: 3 أزرار في كل صف */
  @media (max-width: 1024px) {
    flex: 0 0 calc(33.333% - 7px);
    min-width: 0;
    max-width: calc(33.333% - 7px);
  }
  
  /* 📱 تحسينات للموبايل - الأزرار في صفين */
  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 0.75rem;
    gap: 4px;
    min-height: 44px;
    flex-shrink: 0;
  }
  
  @media (max-width: 480px) {
    padding: 9px 6px;
    font-size: 0.7rem;
    gap: 3px;
    min-height: 42px;
  }
  
  @media (max-width: 380px) {
    padding: 8px 4px;
    font-size: 0.65rem;
    gap: 2px;
    min-height: 40px;
  }
  
  /* Inactive state (default) */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 252, 0.85) 100%
  );
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.8),
    inset 0 -2px 4px rgba(0, 0, 0, 0.05),
    0 2px 8px rgba(0, 0, 0, 0.03);
  color: #4a5568;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Active state */
  &.active {
    background: ${props => props.$themeColor ? 
      `linear-gradient(135deg, ${props.$themeColor}20 0%, ${props.$themeColor}10 100%)` :
      'linear-gradient(135deg, rgba(255, 143, 16, 0.12) 0%, rgba(255, 185, 0, 0.06) 100%)'
    };
    box-shadow: 
      inset 0 2px 6px ${props => props.$themeColor ? `${props.$themeColor}15` : 'rgba(255, 143, 16, 0.08)'},
      inset 0 -2px 4px rgba(255, 255, 255, 0.6),
      0 0 0 2px ${props => props.$themeColor ? `${props.$themeColor}40` : 'rgba(255, 143, 16, 0.25)'},
      0 4px 12px ${props => props.$themeColor ? `${props.$themeColor}20` : 'rgba(255, 143, 16, 0.12)'};
    color: ${props => props.$themeColor || '#FF8F10'};
    font-weight: 600;
    transform: translateY(-1px);
  }
  
  /* Hover */
  &:hover:not(.active) {
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(252, 254, 255, 0.9) 100%
    );
    box-shadow: 
      inset 0 2px 5px rgba(255, 255, 255, 0.9),
      inset 0 -2px 4px rgba(0, 0, 0, 0.03),
      0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
  
  /* Touch & Click */
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }
`;
