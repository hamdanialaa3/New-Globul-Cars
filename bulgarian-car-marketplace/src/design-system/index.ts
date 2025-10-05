/**
 * 🎨 Globul Cars Design System
 * النظام الموحد للتصميم والألوان
 */

export { default as colors } from './colors';
export { default as animations } from './animations';
export { default as typography } from './typography';
export { default as spacing } from './spacing';
export { default as shadows } from './shadows';

export type { ColorScheme } from './colors';
export type { AnimationConfig } from './animations';
export type { TypographyConfig } from './typography';
export type { SpacingConfig } from './spacing';
export type { ShadowConfig } from './shadows';

// Design system constants
export const designSystem = {
  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Animation durations
  duration: {
    fastest: '0.1s',
    faster: '0.15s',
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
    slower: '0.75s',
    slowest: '1s',
  },

  // Animation easings
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

export default designSystem;
