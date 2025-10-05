/**
 * 🎨 Globul Cars Design System - Colors
 * نظام الألوان الموحد للمشروع
 */

export const colors = {
  // Primary Colors - Orange Theme
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#FF7900', // Main Orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Secondary Colors - Dark Blue
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Car-specific Colors
  automotive: {
    // Car Body Colors
    bodyColors: {
      white: '#ffffff',
      black: '#1a1a1a',
      silver: '#c0c0c0',
      gray: '#808080',
      red: '#dc2626',
      blue: '#2563eb',
      green: '#16a34a',
      yellow: '#eab308',
      orange: '#ea580c',
      brown: '#92400e',
    },
    
    // Premium Colors
    premium: {
      metallic: '#b8860b',
      pearl: '#f0f8ff',
      chrome: '#e5e7eb',
      carbon: '#374151',
    }
  },

  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Glassmorphism Colors
  glass: {
    light: 'rgba(255, 255, 255, 0.25)',
    medium: 'rgba(255, 255, 255, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
    primary: 'rgba(255, 121, 0, 0.25)',
    secondary: 'rgba(44, 62, 80, 0.25)',
  },

  // Background Colors
  background: {
    primary: '#f8fafc',
    secondary: '#ffffff',
    dark: '#0f172a',
    glass: 'rgba(255, 255, 255, 0.1)',
  },

  // Text Colors
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    light: '#94a3b8',
    white: '#ffffff',
    inverse: '#f8fafc',
  },

  // Border Colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
    primary: '#FF7900',
    glass: 'rgba(255, 255, 255, 0.18)',
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
    colored: 'rgba(255, 121, 0, 0.4)',
    glass: 'rgba(31, 38, 135, 0.37)',
  },
} as const;

export type ColorScheme = typeof colors;
export default colors;
