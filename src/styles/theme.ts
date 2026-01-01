// src/styles/theme.ts
// Bulgarian Theme Configuration for Car Marketplace

import { createGlobalStyle, DefaultTheme } from 'styled-components';

// Bulgarian Color Palette - Inspired by mobile.de
export const bulgarianColors = {
  primary: {
    main: '#003366',        // Dark Blue (header)
    light: '#0066CC',       // Light Blue (links)
    dark: '#002244',        // Darker Blue
    contrastText: '#ffffff' // White text
  },
  secondary: {
    main: '#CC0000',        // Red (main buttons)
    light: '#FF3333',       // Light Red
    dark: '#990000',        // Dark Red
    contrastText: '#ffffff'
  },
  accent: {
    main: '#0066CC',        // Blue for links/accents
    light: '#3399FF',       // Lighter Blue
    dark: '#004499',        // Darker Blue
    contrastText: '#ffffff'
  },

  grey: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A'
  },

  success: {
    main: '#28A745',
    light: '#51CF66',
    dark: '#1E7E34',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#FFC107',
    light: '#FFCA2C',
    dark: '#D39E00',
    contrastText: '#000000'
  },
  error: {
    main: '#CC0000',
    light: '#FF3333',
    dark: '#990000',
    contrastText: '#ffffff'
  },
  info: {
    main: '#0066CC',
    light: '#3399FF',
    dark: '#004499',
    contrastText: '#ffffff'
  },

  background: {
    default: '#f4f4f4',       // Light Grey/Beige
    paper: '#ffffff',         // White for cards
    dark: '#f0f0f0',          // Light grey for secondary items
    semiDark: 'rgba(0, 51, 102, 0.85)',
    lightOverlay: 'rgba(255, 255, 255, 0.95)',
    darkOverlay: 'rgba(0, 51, 102, 0.7)'
  },

  text: {
    primary: '#333333',     // Dark Grey
    secondary: '#666666',   // Medium Grey
    onDark: '#ffffff',      // White
    onLight: '#333333',     // Dark Grey
    disabled: '#999999',
    hint: '#CCCCCC'
  }
};

// Bulgarian Typography - Enhanced for Readability
export const bulgarianTypography = {
  fontFamily: {
    primary: "'Martica', 'Arial', sans-serif",
    secondary: "'Martica', 'Arial', sans-serif",
    accent: "'Martica', 'Arial', sans-serif",
    mono: "'Courier New', 'Courier', monospace"
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    md: '1.0625rem',    // 17px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px

    button: {
      sm: '0.8125rem',
      md: '0.875rem',
      lg: '1rem',
    },

    input: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    },

    label: {
      sm: '0.75rem',
      md: '0.875rem',
    }
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },

  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// Bulgarian Spacing Scale
export const bulgarianSpacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem'    // 128px
};

// Bulgarian Breakpoints
export const bulgarianBreakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px'
};

// Bulgarian Shadows
export const bulgarianShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 51, 102, 0.05)',
  base: '0 1px 3px 0 rgba(0, 51, 102, 0.1), 0 1px 2px 0 rgba(0, 51, 102, 0.06)',
  md: '0 4px 6px -1px rgba(0, 51, 102, 0.1), 0 2px 4px -1px rgba(0, 51, 102, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 51, 102, 0.1), 0 4px 6px -2px rgba(0, 51, 102, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 51, 102, 0.1), 0 10px 10px -5px rgba(0, 51, 102, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 51, 102, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 51, 102, 0.06)',
  outline: '0 0 0 3px rgba(0, 102, 204, 0.5)'
};

// Bulgarian Border Radius
export const bulgarianBorderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px'
};

// Bulgarian Theme
export const bulgarianTheme: DefaultTheme = {
  colors: bulgarianColors,
  typography: bulgarianTypography,
  spacing: bulgarianSpacing,
  breakpoints: bulgarianBreakpoints,
  shadows: bulgarianShadows,
  borderRadius: bulgarianBorderRadius,
  mode: 'light', // Default mode, will be overridden by ThemeContext

  // Component specific styles
  components: {
    button: {
      borderRadius: bulgarianBorderRadius.sm,
      fontWeight: bulgarianTypography.fontWeight.bold,
      transition: 'all 0.2s ease-in-out',
      backgroundColor: bulgarianColors.secondary.main,
      color: bulgarianColors.secondary.contrastText,
      border: `2px solid ${bulgarianColors.secondary.main}`,
      '&:hover': {
        backgroundColor: bulgarianColors.secondary.dark,
        borderColor: bulgarianColors.secondary.dark
      }
    },
    input: {
      borderRadius: bulgarianBorderRadius.sm,
      border: `1px solid #CCCCCC`,
      padding: `${bulgarianSpacing.sm} ${bulgarianSpacing.md}`,
      fontSize: bulgarianTypography.fontSize.base,
      backgroundColor: bulgarianColors.background.paper,
      color: bulgarianColors.text.primary,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:focus': {
        borderColor: bulgarianColors.primary.main,
        boxShadow: `0 0 0 2px rgba(0, 102, 204, 0.2)`
      }
    },
    card: {
      borderRadius: bulgarianBorderRadius.sm,
      boxShadow: bulgarianShadows.sm,
      border: `1px solid #E0E0E0`,
      backgroundColor: bulgarianColors.background.paper,
      color: bulgarianColors.text.primary
    }
  }
};

// Global Styles
export const GlobalStyles = createGlobalStyle`
  /* ═══════════════════════════════════════════════════════════════════
     All Color Variables now in: unified-theme.css
     ═══════════════════════════════════════════════════════════════════ */

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  html {
    font-size: 16px;
    line-height: ${bulgarianTypography.lineHeight.normal};
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--text-primary);
    background-color: var(--bg-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-weight: ${bulgarianTypography.fontWeight.bold};
    line-height: ${bulgarianTypography.lineHeight.tight};
    margin-bottom: ${bulgarianSpacing.md};
    color: var(--text-primary);
    transition: color 0.3s ease;
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
    color: var(--text-primary);
    transition: color 0.3s ease;
  }

  a {
    color: ${bulgarianColors.primary.dark};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    font-weight: ${bulgarianTypography.fontWeight.medium};
    font-family: 'Inter', system-ui, -apple-system, sans-serif;

    &:hover {
      color: ${bulgarianColors.secondary.main};
      text-decoration: underline;
    }
  }

  li, ul, ol, label, input, select, textarea, button, small, strong, em, span, div {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .leaflet-tooltip {
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
  }

  /* Separators */
  hr, .divider, .section-divider, .border-top, .border-bottom {
    border-color: var(--border-primary) !important;
    background-color: var(--border-primary);
    opacity: 1;
    transition: border-color 0.3s ease;
  }

  /* Key Containers */
  section, .section, .container, .paper, .card {
    background-color: var(--bg-card);
    color: var(--text-primary);
    border-color: var(--border-primary);
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  .card-primary {
    border-color: ${bulgarianColors.primary.main};
    background-color: rgba(240, 248, 252, 0.98) !important;
  }

  .card-secondary {
    border-color: ${bulgarianColors.secondary.main};
    background-color: rgba(241, 245, 249, 0.98) !important;
  }

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--bg-primary);
    transition: background-color 0.3s ease;
  }

  @media (max-width: 768px) {
    .page-container {
      padding: 0;
      max-width: 100%;
    }
  }

  main {
    background: var(--bg-primary);
    flex: 1;
    transition: background-color 0.3s ease;
  }

  header, footer {
    width: 100%;
  }

  .modal, .overlay, .popup, .dialog {
    background-color: rgba(255, 255, 240, 0.98) !important;
    backdrop-filter: blur(15px);
    border: 3px solid ${bulgarianColors.primary.main};
    border-radius: ${bulgarianBorderRadius.xl};
    box-shadow: ${bulgarianShadows['2xl']};
    color: ${bulgarianColors.text.primary};
  }

  .modal-backdrop, .overlay-backdrop {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
  }

  @media print {
    body {
      background-color: white !important;
      background-image: none !important;
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

  /* Semantic Element Styling */
  #main-content,
  #main-content main,
  #main-content main > div,
  #main-content main > section {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  #main-content main div[class*="Section"],
  #main-content main div[class*="Container"],
  #main-content main div[class*="Card"],
  #main-content main section {
    background-color: var(--bg-card);
    border-color: var(--border-primary);
  }

  html[data-theme="dark"] #main-content main * {
    border-color: var(--border-primary) !important;
  }

  html[data-theme="light"] #main-content main button:not([data-keep-bg]),
  html[data-theme="dark"] #main-content main button:not([data-keep-bg]) {
    background-color: var(--accent-primary);
    color: var(--text-inverse);
    border: 1px solid var(--accent-primary);
  }
  html[data-theme="light"] #main-content main button:not([data-keep-bg]):hover,
  html[data-theme="dark"] #main-content main button:not([data-keep-bg]):hover {
    background-color: var(--accent-hover);
    border-color: var(--accent-hover);
  }
`;

// Type augmentation for styled-components
declare module 'styled-components' {
  export interface DefaultTheme {
    mode?: 'light' | 'dark';
    colors: typeof bulgarianColors;
    typography: typeof bulgarianTypography;
    spacing: typeof bulgarianSpacing;
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    shadows: typeof bulgarianShadows;
    borderRadius: typeof bulgarianBorderRadius;
    components: {
      button: any;
      input: any;
      card: any;
    };
  }
}