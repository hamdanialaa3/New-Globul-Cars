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
  xxl: 1920,
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
  maxTablet: `@media (max-width: ${breakpoints.lg - 1}px)`,
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
  touchLarge: '56px',
} as const;

// ═══════════════════════════════════════════════════════════════════
// COLORS — THE SINGLE SOURCE OF TRUTH
// Inspired by AutoScout24 (clean German engineering) + Bulgarian identity
// ═══════════════════════════════════════════════════════════════════
export const colors = {
  primary: {
    main: '#2563EB', // Warm automotive orange — matches mobile
    dark: '#8B5CF6',
    light: '#6366F1',
    pale: '#FFF3E0',
  },
  secondary: {
    main: '#1A237E', // Deep indigo — European premium
    dark: '#0D1452',
    light: '#3949AB',
    pale: '#E8EAF6',
  },
  success: {
    main: '#00C853',
    light: '#B9F6CA',
    dark: '#009624',
  },
  error: {
    main: '#FF1744',
    light: '#FF8A80',
    dark: '#D50000',
  },
  warning: {
    main: '#FFD600',
    light: '#FFF9C4',
    dark: '#F9A825',
  },
  info: {
    main: '#2979FF',
    light: '#BBDEFB',
    dark: '#1565C0',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#FAFBFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
  },
  surface: {
    background: '#FAFBFC',
    backgroundAlt: '#F1F5F9',
    card: '#FFFFFF',
    cardDark: 'rgba(22, 28, 40, 0.85)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    border: '#E2E8F0',
    divider: '#F1F5F9',
  },
} as const;

// TYPOGRAPHY — Unified: Inter (body) + Exo 2 (headings)
export const typography = {
  fontFamily:
    "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  fontFamilyHeading: "'Exo 2', 'Inter', system-ui, sans-serif",
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
    '5xl': '48px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
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
  modal: '0 12px 32px rgba(0, 0, 0, 0.2)',
} as const;

// BORDER RADIUS
export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  full: '9999px',
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
  toast: 1080,
} as const;

// ANIMATIONS
export const animations = {
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  transitions: {
    default: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
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
  `,
};

export type Breakpoint = keyof typeof breakpoints;
export type Spacing = keyof typeof spacing;
export type Color = keyof typeof colors;

