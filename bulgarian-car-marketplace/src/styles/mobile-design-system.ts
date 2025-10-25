// Mobile Design System - Inspired by mobile.de
// Professional mobile-first design tokens for Bulgarian Car Marketplace
// Focus: Portrait tablets and mobile devices only

import { css } from 'styled-components';

// BREAKPOINTS - Mobile & Tablet Portrait Only
export const mobileBreakpoints = {
  xs: 375,      // Small phones (iPhone SE, Galaxy S)
  sm: 414,      // Standard phones (iPhone Pro, Pixel)
  md: 768,      // Portrait tablets (iPad Mini, Galaxy Tab)
  lg: 820,      // Large portrait tablets (iPad Air)
  max: 1024     // Maximum supported width for mobile view
} as const;

// SPACING SYSTEM - Touch-optimized
export const mobileSpacing = {
  // Micro spacing
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  
  // Standard spacing
  md: '16px',
  lg: '20px',
  xl: '24px',
  
  // Large spacing
  xxl: '32px',
  xxxl: '40px',
  
  // Touch targets (minimum 44px per Apple/Android guidelines)
  touchMin: '44px',
  touchComfortable: '48px',
  touchLarge: '56px',
  
  // Container padding
  containerPadding: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '28px'
  }
} as const;

// TYPOGRAPHY - Mobile optimized (16px minimum to prevent iOS zoom)
export const mobileTypography = {
  // Display text (Hero sections)
  display: {
    xs: {
      fontSize: '28px',
      lineHeight: '34px',
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    sm: {
      fontSize: '32px',
      lineHeight: '38px',
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    md: {
      fontSize: '36px',
      lineHeight: '42px',
      fontWeight: 700,
      letterSpacing: '-0.5px'
    }
  },
  
  // Headings
  h1: {
    fontSize: '24px',
    lineHeight: '30px',
    fontWeight: 700,
    letterSpacing: '-0.3px'
  },
  h2: {
    fontSize: '20px',
    lineHeight: '26px',
    fontWeight: 700,
    letterSpacing: '-0.2px'
  },
  h3: {
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 600,
    letterSpacing: '0px'
  },
  h4: {
    fontSize: '16px',
    lineHeight: '22px',
    fontWeight: 600,
    letterSpacing: '0px'
  },
  
  // Body text
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0px'
  },
  bodyMedium: {
    fontSize: '16px',
    lineHeight: '22px',
    fontWeight: 400,
    letterSpacing: '0px'
  },
  bodySmall: {
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0px'
  },
  
  // Caption & labels
  caption: {
    fontSize: '14px',
    lineHeight: '18px',
    fontWeight: 400,
    letterSpacing: '0px'
  },
  label: {
    fontSize: '14px',
    lineHeight: '18px',
    fontWeight: 500,
    letterSpacing: '0.1px'
  },
  
  // Interactive elements
  button: {
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: 600,
    letterSpacing: '0.3px'
  },
  input: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0px'
  }
} as const;

// COLORS - Mobile.de inspired palette
export const mobileColors = {
  // Primary actions
  primary: {
    main: '#FF7900',
    dark: '#E56D00',
    light: '#FF9433',
    pale: '#FFF4EB'
  },
  
  // Secondary actions
  secondary: {
    main: '#003366',
    dark: '#002244',
    light: '#0066CC',
    pale: '#E6F2FF'
  },
  
  // Interactive states
  interactive: {
    link: '#0066CC',
    linkHover: '#004499',
    linkVisited: '#551A8B'
  },
  
  // Feedback colors
  success: {
    main: '#28A745',
    light: '#D4EDDA',
    dark: '#1E7E34'
  },
  error: {
    main: '#DC3545',
    light: '#F8D7DA',
    dark: '#C82333'
  },
  warning: {
    main: '#FFC107',
    light: '#FFF3CD',
    dark: '#D39E00'
  },
  info: {
    main: '#17A2B8',
    light: '#D1ECF1',
    dark: '#117A8B'
  },
  
  // Neutral palette
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F8F9FA',
    gray100: '#F1F3F5',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    gray600: '#6C757D',
    gray700: '#495057',
    gray800: '#343A40',
    gray900: '#212529'
  },
  
  // Surface colors
  surface: {
    background: '#FFFFFF',
    backgroundAlt: '#F8F9FA',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    border: '#DEE2E6',
    divider: '#E9ECEF'
  }
} as const;

// SHADOWS - Mobile optimized
export const mobileShadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.15)',
  
  // Interactive shadows
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.12)',
  button: '0 2px 4px rgba(0, 0, 0, 0.1)',
  buttonActive: '0 1px 2px rgba(0, 0, 0, 0.15)',
  
  // Elevated elements
  modal: '0 12px 32px rgba(0, 0, 0, 0.2)',
  dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
  sticky: '0 2px 8px rgba(0, 0, 0, 0.1)'
} as const;

// BORDER RADIUS
export const mobileBorderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  full: '9999px'
} as const;

// Z-INDEX LAYERS
export const mobileZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  max: 9999
} as const;

// ANIMATIONS & TRANSITIONS
export const mobileAnimations = {
  // Duration
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
    slower: '600ms'
  },
  
  // Easing
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  
  // Common transitions
  transitions: {
    default: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// RESPONSIVE MIXINS
export const mobileMediaQueries = {
  xs: `@media (min-width: ${mobileBreakpoints.xs}px)`,
  sm: `@media (min-width: ${mobileBreakpoints.sm}px)`,
  md: `@media (min-width: ${mobileBreakpoints.md}px)`,
  lg: `@media (min-width: ${mobileBreakpoints.lg}px)`,
  
  // Max-width queries
  maxXs: `@media (max-width: ${mobileBreakpoints.xs - 1}px)`,
  maxSm: `@media (max-width: ${mobileBreakpoints.sm - 1}px)`,
  maxMd: `@media (max-width: ${mobileBreakpoints.md - 1}px)`,
  maxLg: `@media (max-width: ${mobileBreakpoints.lg - 1}px)`,
  maxMobile: `@media (max-width: ${mobileBreakpoints.max - 1}px)`,
  
  // Range queries
  phoneOnly: `@media (max-width: ${mobileBreakpoints.md - 1}px)`,
  tabletOnly: `@media (min-width: ${mobileBreakpoints.md}px) and (max-width: ${mobileBreakpoints.max - 1}px)`,
  mobileAndTablet: `@media (max-width: ${mobileBreakpoints.max - 1}px)`
} as const;

// UTILITY CSS MIXINS
export const mobileMixins = {
  // Flexbox utilities
  flexCenter: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  
  flexBetween: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  
  flexColumn: css`
    display: flex;
    flex-direction: column;
  `,
  
  // Touch target
  touchTarget: css`
    min-height: ${mobileSpacing.touchMin};
    min-width: ${mobileSpacing.touchMin};
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `,
  
  // Text truncation
  truncate: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  
  lineClamp: (lines: number) => css`
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `,
  
  // Safe area (notch support)
  safeAreaPadding: css`
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  `,
  
  // Prevent iOS zoom on input focus
  preventZoom: css`
    font-size: 16px;
    @supports (-webkit-touch-callout: none) {
      font-size: max(16px, 1rem);
    }
  `,
  
  // Smooth scrolling
  smoothScroll: css`
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  `,
  
  // Hide scrollbar
  hideScrollbar: css`
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  `
};

// COMPONENT PATTERNS
export const mobilePatterns = {
  // Card pattern
  card: css`
    background: ${mobileColors.surface.card};
    border-radius: ${mobileBorderRadius.lg};
    box-shadow: ${mobileShadows.card};
    padding: ${mobileSpacing.lg};
    transition: ${mobileAnimations.transitions.default};
    
    &:active {
      box-shadow: ${mobileShadows.cardHover};
    }
  `,
  
  // Input pattern
  input: css`
    ${mobileMixins.preventZoom}
    min-height: ${mobileSpacing.touchMin};
    padding: ${mobileSpacing.sm} ${mobileSpacing.md};
    border: 1px solid ${mobileColors.surface.border};
    border-radius: ${mobileBorderRadius.md};
    background: ${mobileColors.surface.background};
    transition: ${mobileAnimations.transitions.default};
    
    &:focus {
      outline: none;
      border-color: ${mobileColors.primary.main};
      box-shadow: 0 0 0 3px ${mobileColors.primary.pale};
    }
  `,
  
  // Button pattern
  button: css`
    ${mobileMixins.touchTarget}
    ${mobileMixins.preventZoom}
    padding: ${mobileSpacing.sm} ${mobileSpacing.lg};
    border-radius: ${mobileBorderRadius.md};
    font-weight: 600;
    cursor: pointer;
    transition: ${mobileAnimations.transitions.default};
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    
    &:active {
      transform: scale(0.98);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `
};

export type MobileBreakpoint = keyof typeof mobileBreakpoints;
export type MobileSpacing = keyof typeof mobileSpacing;
export type MobileColor = keyof typeof mobileColors;
