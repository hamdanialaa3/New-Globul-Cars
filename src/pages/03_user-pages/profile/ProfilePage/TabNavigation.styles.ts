// src/pages/ProfilePage/TabNavigation.styles.ts
// Premium Tab Navigation with Glassmorphism & Metallic Effects
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';

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

  /* ✅ SIMPLIFIED: استخدام CSS Variables من unified-theme.css */
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;

  /* Dark Mode Support */
  html[data-theme='dark'] & {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(148, 163, 184, 0.15);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Light Mode Support */
  html[data-theme='light'] & {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      0 1px 4px rgba(0, 0, 0, 0.04);
  }

  /* TABLET & MOBILE: 2 rows × 3 columns layout (LinkedIn inspired) */
  @media (max-width: 1024px) {
    flex-wrap: wrap;
    min-height: auto;
    gap: 10px;
    padding: 14px;
    justify-content: space-between;
  }

  /* MOBILE: Optimized spacing (Facebook/Instagram pattern) */
  @media (max-width: 768px) {
    gap: 8px;
    padding: 12px;
    border-radius: 16px;

    /* Sticky behavior like Instagram */
    position: sticky;
    top: 56px; /* Below mobile header */
    z-index: 9;

    /* Better shadow for elevation */
    box-shadow: var(--shadow-md);
  }

  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: var(--accent-primary) transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 4px;

    &:hover {
      background: var(--accent-secondary);
    }
  }

  /* 📱 في الموبايل: إخفاء scrollbar (لأننا نستخدم صفين) */
  @media (max-width: 1024px) {
    overflow-x: visible;
    overflow-y: visible;
  }

  /* 🎨 Simplified: Accent Stripe at Bottom */
  &::after {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 8px;
    height: 3px;
    border-radius: 3px;
    background: var(--accent-primary);
    pointer-events: none;
    z-index: 1;
    opacity: 0.6;
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 768px) {
    gap: 6px;
    padding: 8px;
    border-radius: 14px;
  }
`;

// ==================== TAB BUTTON ====================

export const TabButton = styled.button<{
  $active: boolean;
  $themeColor?: string;
}>`
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
  text-overflow: ellipsis;
  
  /* 📱 Tablet & Mobile: 3 أزرار في كل صف */
  @media (max-width: 1024px) {
    flex: 0 0 calc(33.333% - 7px);
    min-width: 0;
    max-width: calc(33.333% - 7px);
  }
  
  /* 🎨 DYNAMIC: ACTIVE STATE with Theme Color */
  ${({ $active, $themeColor }) =>
    $active
      ? css`
          background: ${$themeColor
            ? `linear-gradient(135deg,
          ${$themeColor}FA 0%,
          ${$themeColor} 30%,
          ${$themeColor} 60%,
          ${$themeColor}FA 100%
        )`
            : `linear-gradient(135deg,
          rgba(255, 159, 42, 0.98) 0%,
          rgba(139, 92, 246, 1) 30%,
          rgba(99, 102, 241, 1) 60%,
          rgba(255, 102, 0, 0.98) 100%
        )`};
          background-size: 200% auto;
          color: white;
          border: 2px solid
            ${$themeColor ? `${$themeColor}B3` : 'rgba(255, 215, 0, 0.7)'};

          /* 🎨 DYNAMIC: Multi-layer Shadow System with Theme Color */
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.4) inset,
            0 -1px 0 rgba(0, 0, 0, 0.1) inset,
            ${$themeColor
              ? `0 8px 24px ${$themeColor}59`
              : '0 8px 24px rgba(139, 92, 246, 0.35)'},
            ${$themeColor
              ? `0 3px 8px ${$themeColor}40`
              : '0 3px 8px rgba(99, 102, 241, 0.25)'},
            ${$themeColor
              ? `0 0 0 1px ${$themeColor}4D`
              : '0 0 0 1px rgba(255, 215, 0, 0.3)'};

          /* Shimmer Animation */
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
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
          )`};
            box-shadow: ${$themeColor
              ? `0 0 8px ${$themeColor}CC`
              : '0 0 8px rgba(255, 235, 59, 0.8)'};
            border-radius: 2px 2px 0 0;
          }
        `
      : css`
          /* INACTIVE STATE - Subtle Glass */
          background: linear-gradient(
            135deg,
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
    ${({ $active, $themeColor }) =>
      $active
        ? `
      background: ${
        $themeColor
          ? `linear-gradient(135deg,
            ${$themeColor}FF 0%,
            ${$themeColor}FA 30%,
            ${$themeColor} 60%,
            ${$themeColor}FA 100%
          )`
          : `linear-gradient(135deg,
            rgba(255, 175, 64, 1) 0%,
            rgba(255, 159, 42, 1) 30%,
            rgba(139, 92, 246, 1) 60%,
            rgba(99, 102, 241, 1) 100%
          )`
      };
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.5) inset,
        0 -1px 0 rgba(0, 0, 0, 0.15) inset,
        ${$themeColor ? `0 12px 32px ${$themeColor}73` : '0 12px 32px rgba(139, 92, 246, 0.45)'},
        ${$themeColor ? `0 4px 12px ${$themeColor}4D` : '0 4px 12px rgba(99, 102, 241, 0.3)'},
        ${$themeColor ? `0 0 0 1px ${$themeColor}80` : '0 0 0 1px rgba(255, 215, 0, 0.5)'};
    `
        : `
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(255, 248, 240, 0.6) 100%
      );
      border-color: ${$themeColor ? `${$themeColor}59` : 'rgba(139, 92, 246, 0.35)'};
      color: #495057;
      transform: translateY(-1px);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.8) inset,
        ${$themeColor ? `0 6px 16px ${$themeColor}1A` : '0 6px 16px rgba(139, 92, 246, 0.1)'},
        0 2px 6px rgba(0, 0, 0, 0.06);
  `}
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* FOCUS STATE */
  &:focus-visible {
    outline: none;
    box-shadow: 
      0 0 0 4px rgba(255, 215, 0, 0.4),
      0 8px 24px rgba(139, 92, 246, 0.3);
  }
  
  /* ACTIVE (PRESSED) STATE */
  &:active {
    transform: ${({ $active }) => ($active ? 'translateY(-1px) scale(1.01)' : 'translateY(0)')};
  }
  
  /* SVG Icon Styling */
  svg {
    width: 20px;
    height: 20px;
    filter: ${({ $active }) =>
      $active
        ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
        : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'};
    transition: all 0.3s ease;
    will-change: transform;  /* ⚡ GPU acceleration */
    /* ⚡ OPTIMIZED: No infinite float, only hover */
  }
  
  &:hover svg {
    transform: translateY(-2px);
  }
  
  /* MOBILE OPTIMIZATION - Inspired by Facebook & Instagram */
  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.8125rem;  /* 13px - readable */
    gap: 6px;
    min-height: 48px;  /* Touch-friendly (Facebook standard) */
    border-radius: 10px;
    
    /* Better tap feedback */
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  
    svg {
      width: 18px;  /* Instagram size */
      height: 18px;
    }
    
    /* Optimize text for mobile */
    span {
      display: block;
      line-height: 1.2;
    }
  }
  
  @media (max-width: 480px) {
    padding: 10px 8px;
    font-size: 0.75rem;  /* 12px */
    gap: 4px;
    min-height: 46px;  /* Still touch-friendly */
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  /* Small phones only */
  @media (max-width: 380px) {
    padding: 9px 6px;
    font-size: 0.6875rem;  /* 11px - minimum readable */
    gap: 3px;
    min-height: 44px;  /* Minimum touch target (Apple HIG) */
    
    svg {
      width: 14px;
      height: 14px;
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
  background: linear-gradient(
    135deg,
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
    background: linear-gradient(
      90deg,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.7) 50%,
      rgba(255, 215, 0, 0) 100%
    );
    border-radius: 0 0 12px 12px;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      rgba(255, 248, 240, 0.8) 0%,
      rgba(255, 243, 224, 0.7) 100%
    );
    border-color: rgba(139, 92, 246, 0.4);
    color: #212529;
    transform: translateY(-2px);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.9) inset,
      0 6px 18px rgba(139, 92, 246, 0.15),
      0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    .spinning {
      animation: spin 1s linear; /* ⚡ OPTIMIZED: Spins once, not infinite */
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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
  ${({ $following }) =>
    $following
      ? `
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
  `
      : `
    /* Not Following State (Orange Glass) */
    background: linear-gradient(135deg,
      rgba(255, 159, 42, 0.95) 0%,
      rgba(139, 92, 246, 1) 30%,
      rgba(99, 102, 241, 1) 70%,
      rgba(255, 102, 0, 0.98) 100%
    );
    background-size: 200% auto;
    backdrop-filter: blur(8px);
    color: white;
    border: 2px solid rgba(255, 215, 0, 0.7);
    
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 -1px 0 rgba(0, 0, 0, 0.1) inset,
      0 6px 20px rgba(139, 92, 246, 0.4),
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
    ${({ $following }) =>
      $following
        ? `
      background: linear-gradient(135deg,
        rgba(129, 138, 146, 0.9) 0%,
        rgba(111, 120, 128, 0.95) 100%
      );
      transform: translateY(-2px);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.4) inset,
        0 6px 16px rgba(108, 117, 125, 0.3),
        0 2px 6px rgba(0, 0, 0, 0.12);
    `
        : `
      background: linear-gradient(135deg,
        rgba(255, 175, 64, 1) 0%,
        rgba(255, 159, 42, 1) 30%,
        rgba(139, 92, 246, 1) 70%,
        rgba(99, 102, 241, 1) 100%
      );
      transform: translateY(-3px) scale(1.02);
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.5) inset,
        0 -1px 0 rgba(0, 0, 0, 0.15) inset,
        0 10px 28px rgba(139, 92, 246, 0.5),
        0 4px 10px rgba(99, 102, 241, 0.3);
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
  text-overflow: ellipsis;
  text-decoration: none;
  color: inherit;

  /* 📱 Tablet & Mobile: 3 أزرار في كل صف */
  @media (max-width: 1024px) {
    flex: 0 0 calc(33.333% - 7px);
    min-width: 0;
    max-width: calc(33.333% - 7px);
  }

  /* MOBILE OPTIMIZATION - Professional UX (Airbnb/LinkedIn inspired) */
  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.8125rem; /* 13px - optimal readability */
    gap: 6px;
    min-height: 48px; /* Touch target standard */
    flex-shrink: 0;
    border-radius: 10px;

    /* Enhanced tap feedback (iOS/Android native feel) */
    -webkit-tap-highlight-color: transparent;
    user-select: none;

    /* Smoother transitions */
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
  }

  @media (max-width: 480px) {
    padding: 10px 8px;
    font-size: 0.75rem; /* 12px */
    gap: 4px;
    min-height: 46px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  /* Small screens - maintain usability */
  @media (max-width: 380px) {
    padding: 9px 6px;
    font-size: 0.6875rem; /* 11px - minimum readable */
    gap: 3px;
    min-height: 44px; /* Apple HIG minimum */

    svg {
      width: 14px;
      height: 14px;
    }
  }

  /* Inactive state (default) - Light Mode */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 252, 0.85) 100%
  );
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.8),
    inset 0 -2px 4px rgba(0, 0, 0, 0.05),
    0 2px 8px rgba(0, 0, 0, 0.03);
  color: #4a5568;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Dark Mode - Inactive state */
  html[data-theme='dark'] & {
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.9) 0%,
      rgba(15, 23, 42, 0.85) 100%
    );
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.05),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
    color: #cbd5e1;
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  /* Active state - Light Mode */
  &.active {
    background: ${props =>
      props.$themeColor
        ? `linear-gradient(135deg, ${props.$themeColor}20 0%, ${props.$themeColor}10 100%)`
        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(255, 185, 0, 0.06) 100%)'};
    box-shadow:
      inset 0 2px 6px
        ${props =>
          props.$themeColor
            ? `${props.$themeColor}15`
            : 'rgba(139, 92, 246, 0.08)'},
      inset 0 -2px 4px rgba(255, 255, 255, 0.6),
      0 0 0 2px
        ${props =>
          props.$themeColor
            ? `${props.$themeColor}40`
            : 'rgba(139, 92, 246, 0.25)'},
      0 4px 12px
        ${props =>
          props.$themeColor
            ? `${props.$themeColor}20`
            : 'rgba(139, 92, 246, 0.12)'};
    color: ${props => props.$themeColor || '#FF7A2D'};
    font-weight: 600;
    transform: translateY(-1px);
  }

  /* Active state - Dark Mode */
  html[data-theme='dark'] &.active {
    background: ${props =>
      props.$themeColor
        ? `linear-gradient(135deg, ${props.$themeColor}30 0%, ${props.$themeColor}20 100%)`
        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(255, 185, 0, 0.15) 100%)'};
    box-shadow:
      inset 0 2px 6px
        ${props =>
          props.$themeColor
            ? `${props.$themeColor}25`
            : 'rgba(139, 92, 246, 0.15)'},
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      0 0 0 2px
        ${props =>
          props.$themeColor
            ? `${props.$themeColor}60`
            : 'rgba(139, 92, 246, 0.4)'},
      0 4px 12px
        ${props =>
          props.$themeColor
            ? `${props.$themeColor}30`
            : 'rgba(139, 92, 246, 0.2)'},
      0 0 20px
        ${props =>
          props.$themeColor
            ? `${props.$themeColor}20`
            : 'rgba(139, 92, 246, 0.1)'};
    color: ${props => props.$themeColor || '#FF7A2D'};
    border-color: ${props =>
      props.$themeColor ? `${props.$themeColor}50` : 'rgba(139, 92, 246, 0.3)'};
  }

  /* Hover - Light Mode */
  &:hover:not(.active) {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(252, 254, 255, 0.9) 100%
    );
    box-shadow:
      inset 0 2px 5px rgba(255, 255, 255, 0.9),
      inset 0 -2px 4px rgba(0, 0, 0, 0.03),
      0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  /* Hover - Dark Mode */
  html[data-theme='dark'] &:hover:not(.active) {
    background: linear-gradient(
      135deg,
      rgba(51, 65, 85, 0.95) 0%,
      rgba(30, 41, 59, 0.9) 100%
    );
    box-shadow:
      inset 0 2px 5px rgba(255, 255, 255, 0.05),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.3);
    color: #e2e8f0;
    border-color: rgba(148, 163, 184, 0.2);
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

  /* MOBILE: Active state enhancement */
  @media (max-width: 768px) {
    &.active {
      /* Stronger active indicator (Facebook pattern) - Light Mode */
      box-shadow:
        inset 0 3px 8px
          ${props =>
            props.$themeColor
              ? `${props.$themeColor}20`
              : 'rgba(139, 92, 246, 0.12)'},
        inset 0 -2px 4px rgba(255, 255, 255, 0.7),
        0 0 0 2.5px
          ${props =>
            props.$themeColor
              ? `${props.$themeColor}50`
              : 'rgba(139, 92, 246, 0.3)'},
        0 6px 16px
          ${props =>
            props.$themeColor
              ? `${props.$themeColor}25`
              : 'rgba(139, 92, 246, 0.15)'};

      transform: translateY(-2px);

      /* Active state icon animation */
      svg {
        transform: scale(1.05);
      }
    }

    /* Dark Mode - Mobile Active */
    html[data-theme='dark'] &.active {
      box-shadow:
        inset 0 3px 8px
          ${props =>
            props.$themeColor
              ? `${props.$themeColor}30`
              : 'rgba(139, 92, 246, 0.2)'},
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        0 0 0 2.5px
          ${props =>
            props.$themeColor
              ? `${props.$themeColor}70`
              : 'rgba(139, 92, 246, 0.5)'},
        0 6px 16px
          ${props =>
            props.$themeColor
              ? `${props.$themeColor}35`
              : 'rgba(139, 92, 246, 0.25)'},
        0 0 24px
          ${props =>
            props.$themeColor
              ? `${props.$themeColor}25`
              : 'rgba(139, 92, 246, 0.15)'};
    }

    /* Hover on touch devices (light touch) - Light Mode */
    &:active:not(.active) {
      transform: scale(0.97);
      background: rgba(0, 0, 0, 0.02);
    }

    /* Hover on touch devices - Dark Mode */
    html[data-theme='dark'] &:active:not(.active) {
      background: rgba(255, 255, 255, 0.05);
    }
  }
`;
