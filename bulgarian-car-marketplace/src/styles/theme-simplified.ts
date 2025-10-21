// src/styles/theme-simplified.ts
// Simplified Bulgarian Theme Configuration for Car Marketplace

import { createGlobalStyle } from 'styled-components';

// Simplified Bulgarian Color Palette
export const bulgarianColors = {
  primary: {
    main: '#FFD700', // Bright yellow
    light: '#FFFF99',
    dark: '#B8860B',
    contrastText: '#000000'
  },
  secondary: {
    main: '#FFA500', // Orange
    light: '#FFCC80',
    dark: '#E65100',
    contrastText: '#000000'
  },
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    dark: '#1a1a1a'
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    onDark: '#FFFFFF'
  },
  success: {
    main: '#4CAF50',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#F44336',
    contrastText: '#FFFFFF'
  }
};

// Simplified Typography
export const bulgarianTypography = {
  fontFamily: {
    primary: "'Martica', 'Arial', sans-serif",
    accent: "'Martica', 'Arial', sans-serif"
  },
  fontSize: {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    bold: 700
  },
  lineHeight: {
    normal: 1.5,
    relaxed: 1.75
  }
};

// Simplified Spacing
export const bulgarianSpacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem'
};

// Simplified Border Radius
export const bulgarianBorderRadius = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem'
};

// Simplified Shadows
export const bulgarianShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
};

// Simplified Global Styles - Clean and Maintainable
export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.cdnfonts.com/css/martica');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Martica', 'Arial', sans-serif;
  }

  html {
    font-size: 16px;
    line-height: ${bulgarianTypography.lineHeight.normal};
  }

  body {
    font-family: 'Martica', 'Arial', sans-serif;
    color: ${bulgarianColors.text.primary};
    background-color: ${bulgarianColors.background.default};
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Martica', 'Arial', sans-serif;
    font-weight: ${bulgarianTypography.fontWeight.bold};
    line-height: ${bulgarianTypography.lineHeight.normal};
    margin-bottom: ${bulgarianSpacing.md};
    color: ${bulgarianColors.text.primary};
  }

  h1 { font-size: ${bulgarianTypography.fontSize['4xl']}; }
  h2 { font-size: ${bulgarianTypography.fontSize['3xl']}; }
  h3 { font-size: ${bulgarianTypography.fontSize['2xl']}; }
  h4 { font-size: ${bulgarianTypography.fontSize.xl}; }
  h5 { font-size: ${bulgarianTypography.fontSize.lg}; }
  h6 { font-size: ${bulgarianTypography.fontSize.base}; }

  p {
    margin-bottom: ${bulgarianSpacing.md};
    line-height: ${bulgarianTypography.lineHeight.relaxed};
    color: ${bulgarianColors.text.primary};
  }

  a {
    color: ${bulgarianColors.primary.main};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    font-weight: ${bulgarianTypography.fontWeight.medium};
    font-family: 'Martica', 'Arial', sans-serif;

    &:hover {
      color: ${bulgarianColors.primary.dark};
      text-decoration: underline;
    }
  }

  li, ul, ol, label, input, select, textarea, button, small, strong, em, span, div {
    font-family: 'Martica', 'Arial', sans-serif;
  }

  .leaflet-tooltip {
    font-family: 'Martica', 'Arial', sans-serif !important;
  }

  /* Clean Button Styles */
  button {
    font-family: inherit;
    cursor: pointer;
    font-weight: ${bulgarianTypography.fontWeight.medium};
    padding: ${bulgarianSpacing.sm} ${bulgarianSpacing.md};
    border-radius: ${bulgarianBorderRadius.md};
    transition: all 0.2s ease-in-out;
    background: ${bulgarianColors.primary.main};
    color: ${bulgarianColors.primary.contrastText};
    border: 2px solid ${bulgarianColors.primary.main};

    &:hover {
      background: ${bulgarianColors.primary.dark};
      border-color: ${bulgarianColors.primary.dark};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
    }
  }

  /* Clean Card Styles */
  .card, .container, .paper {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: ${bulgarianBorderRadius.lg};
    box-shadow: ${bulgarianShadows.sm};
    padding: ${bulgarianSpacing.lg};
    margin-bottom: ${bulgarianSpacing.lg};
    color: ${bulgarianColors.text.primary};
  }

  /* Clean Input Styles */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    padding: ${bulgarianSpacing.sm};
    border: 1px solid #d1d5db;
    border-radius: ${bulgarianBorderRadius.md};
    background: #ffffff;
    color: ${bulgarianColors.text.primary};
    transition: border-color 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: ${bulgarianColors.primary.main};
      box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
    }
  }

  /* Clean Navigation */
  nav a, .nav-link {
    color: ${bulgarianColors.text.primary};
    text-decoration: none;
    padding: ${bulgarianSpacing.sm} ${bulgarianSpacing.md};
    border-radius: ${bulgarianBorderRadius.md};
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: #f3f4f6;
    }
  }

  /* Alert Styles */
  .alert-success {
    background-color: #d1fae5;
    border: 1px solid #10b981;
    color: #065f46;
    border-radius: ${bulgarianBorderRadius.md};
    padding: ${bulgarianSpacing.md};
    margin-bottom: ${bulgarianSpacing.md};
  }

  .alert-error {
    background-color: #fee2e2;
    border: 1px solid #ef4444;
    color: #991b1b;
    border-radius: ${bulgarianBorderRadius.md};
    padding: ${bulgarianSpacing.md};
    margin-bottom: ${bulgarianSpacing.md};
  }

  /* Badge Styles */
  .badge {
    background-color: ${bulgarianColors.primary.main};
    color: ${bulgarianColors.primary.contrastText};
    padding: ${bulgarianSpacing.xs} ${bulgarianSpacing.sm};
    border-radius: ${bulgarianBorderRadius.sm};
    font-size: ${bulgarianTypography.fontSize.sm};
    font-weight: ${bulgarianTypography.fontWeight.medium};
  }

  /* Container */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${bulgarianSpacing.md};
  }

  @media (min-width: 768px) {
    .container {
      padding: 0 ${bulgarianSpacing.xl};
    }
  }

  /* Screen Reader Only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Focus Styles */
  *:focus {
    outline: 2px solid ${bulgarianColors.primary.main};
    outline-offset: 2px;
  }

  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid ${bulgarianColors.primary.main};
    outline-offset: 2px;
  }

  /* Print Styles */
  @media print {
    body {
      background-color: white !important;
      color: black !important;
    }

    .card, .container, .paper {
      background-color: white !important;
      box-shadow: none !important;
    }

    a {
      color: black !important;
      text-decoration: underline !important;
    }
  }
`;

// Simplified Breakpoints
export const bulgarianBreakpoints = {
  sm: '768px',
  md: '960px',
  lg: '1280px'
};

// Simplified Theme Interface
export interface BulgarianTheme {
  colors: typeof bulgarianColors;
  typography: typeof bulgarianTypography;
  spacing: typeof bulgarianSpacing;
  borderRadius: typeof bulgarianBorderRadius;
  shadows: typeof bulgarianShadows;
  breakpoints: typeof bulgarianBreakpoints;
}

// Create the theme object
export const bulgarianTheme: BulgarianTheme = {
  colors: bulgarianColors,
  typography: bulgarianTypography,
  spacing: bulgarianSpacing,
  borderRadius: bulgarianBorderRadius,
  shadows: bulgarianShadows,
  breakpoints: bulgarianBreakpoints
};