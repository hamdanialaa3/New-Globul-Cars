// Unified Design System - Mobile & Desktop
// Koli One

import { css } from 'styled-components';

// BREAKPOINTS - Unified
export const breakpoints = {
  xs: 375,
  sm: 414,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1920
} as const;

// MEDIA QUERIES
export const media = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  xxl: `@media (min-width: ${breakpoints.xxl}px)`,
  maxMobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  maxTablet: `@media (max-width: ${breakpoints.lg - 1}px)`
} as const;

// SPACING
export const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  xxl: '32px',
  xxxl: '40px',
  touchMin: '44px',
  touchComfortable: '48px',
  touchLarge: '56px'
} as const;

// COLORS
export const colors = {
  primary: {
    main: '#FF7900',
    dark: '#E56D00',
    light: '#FF9433',
    pale: '#FFF4EB'
  },
  secondary: {
    main: '#003366',
    dark: '#002244',
    light: '#0066CC',
    pale: '#E6F2FF'
  },
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
  surface: {
    background: '#FFFFFF',
    backgroundAlt: '#F8F9FA',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    border: '#DEE2E6',
    divider: '#E9ECEF'
  }
} as const;

// TYPOGRAPHY
export const typography = {
  fontFamily: "'Martica', 'Arial', sans-serif",
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    md: '17px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  }
} as const;

// SHADOWS
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.15)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.12)',
  sticky: '0 2px 8px rgba(0, 0, 0, 0.1)',
  modal: '0 12px 32px rgba(0, 0, 0, 0.2)'
} as const;

// BORDER RADIUS
export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  full: '9999px'
} as const;

// Z-INDEX
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080
} as const;

// ANIMATIONS
export const animations = {
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '400ms'
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  transitions: {
    default: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// MIXINS
export const mixins = {
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
  touchTarget: css`
    min-height: ${spacing.touchMin};
    min-width: ${spacing.touchMin};
  `,
  truncate: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  preventZoom: css`
    font-size: 16px;
  `,
  hideScrollbar: css`
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  `
};

export type Breakpoint = keyof typeof breakpoints;
export type Spacing = keyof typeof spacing;
export type Color = keyof typeof colors;
