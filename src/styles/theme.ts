// src/styles/theme.ts
// Bulgarian Theme Configuration for Car Marketplace

import { createGlobalStyle, DefaultTheme } from 'styled-components';

// Color Palette — Aligned with design-system.ts (THE source of truth)
// Inspired by AutoScout24 + Bulgarian automotive identity
export const bulgarianColors = {
  primary: {
    main: '#2563EB', // Warm automotive orange
    light: '#6366F1', // Light orange
    dark: '#8B5CF6', // Darker orange
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1A237E', // Deep indigo — European premium
    light: '#3949AB', // Light indigo
    dark: '#0D1452', // Dark indigo
    contrastText: '#ffffff',
  },
  accent: {
    main: '#1A237E', // Indigo accent
    light: '#3949AB', // Light indigo
    dark: '#0D1452', // Dark indigo
    contrastText: '#ffffff',
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
    900: '#0F172A',
  },

  success: {
    main: '#2E7D32', // WCAG AA compliant (5.9:1 on white)
    light: '#B9F6CA',
    dark: '#1B5E20',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#FFD600',
    light: '#FFF9C4',
    dark: '#F9A825',
    contrastText: '#000000',
  },
  error: {
    main: '#D32F2F', // WCAG AA compliant (5.6:1 on white)
    light: '#FF8A80',
    dark: '#B71C1C',
    contrastText: '#ffffff',
  },
  info: {
    main: '#2979FF',
    light: '#BBDEFB',
    dark: '#1565C0',
    contrastText: '#ffffff',
  },

  background: {
    default: '#FAFBFC', // Clean light background
    paper: '#ffffff', // White for cards
    dark: '#F1F5F9', // Light grey for secondary items
    semiDark: 'rgba(26, 35, 126, 0.85)',
    lightOverlay: 'rgba(255, 255, 255, 0.95)',
    darkOverlay: 'rgba(26, 35, 126, 0.7)',
  },

  text: {
    primary: '#333333', // Dark Grey
    secondary: '#666666', // Medium Grey
    onDark: '#ffffff', // White
    onLight: '#333333', // Dark Grey
    disabled: '#717171', // WCAG AA compliant (4.6:1 on #FAFBFC)
    hint: '#767676', // WCAG AA compliant (4.5:1 on white)
  },

  border: {
    default: '#E2E8F0', // Light grey border
    muted: '#CBD5E1', // Softer border
    strong: '#94A3B8', // Stronger border
    focus: '#0066CC', // Focus state
    // Aliases for design-system components
    light: '#E2E8F0', // alias of default
    medium: '#CBD5E1', // alias of muted
    dark: '#94A3B8', // alias of strong
    error: '#CC0000', // error border
    success: '#28A745', // success border
  },

  // Derived groups to support design-system components
  interactive: {
    primary: '#2563EB', // maps to primary.main
    primaryHover: '#6366F1', // maps to primary.light
    primaryActive: '#8B5CF6', // maps to primary.dark
  },

  content: {
    primary: '#333333', // maps to text.primary
    inverse: '#ffffff', // maps to text.onDark
    heading: '#333333', // maps to text.primary
    placeholder: '#717171', // WCAG AA for input placeholders
    tertiary: '#666666', // for secondary text
  },

  surface: {
    card: '#ffffff', // maps to background.paper
    hover: '#f4f4f4', // maps to background.default
    selected: '#f0f0f0', // maps to background.dark
    elevated: '#ffffff', // alias for elevated surfaces
  },

  brand: {
    main: '#2563EB', // maps to primary.main
    light: '#6366F1', // maps to primary.light
    dark: '#8B5CF6', // maps to primary.dark
  },

  feedback: {
    error: {
      main: '#D32F2F', // maps to error.main
      dark: '#B71C1C', // maps to error.dark
      light: '#FF8A80', // maps to error.light
    },
    success: {
      main: '#2E7D32', // maps to success.main
      light: '#B9F6CA', // maps to success.light
    },
  },
};

// Typography — Inter (body) + Exo 2 (headings)
export const bulgarianTypography = {
  fontFamily: {
    primary:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    secondary: "'Exo 2', 'Inter', system-ui, sans-serif",
    accent: "'Exo 2', 'Inter', system-ui, sans-serif",
    mono: "'Courier New', 'Courier', monospace",
    base: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    md: '1.0625rem', // 17px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px

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
    },
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Bulgarian Spacing Scale
export const bulgarianSpacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
  '5xl': '8rem', // 128px
};

// Bulgarian Breakpoints
export const bulgarianBreakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px',
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
  outline: '0 0 0 3px rgba(0, 102, 204, 0.5)',
  // Aliases for design-system components
  button:
    '0 4px 6px -1px rgba(0, 51, 102, 0.1), 0 2px 4px -1px rgba(0, 51, 102, 0.06)', // md
  hover:
    '0 10px 15px -3px rgba(0, 51, 102, 0.1), 0 4px 6px -2px rgba(0, 51, 102, 0.05)', // lg
  card: '0 1px 2px 0 rgba(0, 51, 102, 0.05)',
};

// Bulgarian Border Radius
export const bulgarianBorderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  base: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px',
};

// Bulgarian Theme
export const bulgarianTheme: DefaultTheme = {
  colors: bulgarianColors,
  // Root-level text mirror for components expecting theme.text
  text: bulgarianColors.text,
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
        borderColor: bulgarianColors.secondary.dark,
      },
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
        boxShadow: `0 0 0 2px rgba(0, 102, 204, 0.2)`,
      },
    },
    card: {
      borderRadius: bulgarianBorderRadius.sm,
      boxShadow: bulgarianShadows.sm,
      border: `1px solid #E0E0E0`,
      backgroundColor: bulgarianColors.background.paper,
      color: bulgarianColors.text.primary,
    },
  },
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
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--text-primary);
    background-color: var(--bg-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  :root {
    --text-min: 12px;
    --text-max: 16px;
    --text-clamp: clamp(var(--text-min), 2.5vw, var(--text-max));
  }

  @media (max-width: 480px) {
    :root {
      --text-min: 11px;
      --text-max: 15px;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Exo 2', 'Inter', system-ui, -apple-system, sans-serif;
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

  /* Global smart text handling for long words (e.g., Bulgarian) */
  .text-smart {
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  .text-responsive {
    font-size: var(--text-clamp);
  }

  .text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .text-icon-fallback {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  :where(h1, h2, h3, h4, h5, h6, p, span, label, button, a, li) {
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  :where(button, [role='button'], [role='tab'], .btn, .button, .tab) {
    min-width: 0;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    :where(button, [role='button'], [role='tab'], .btn, .button, .tab) {
      font-size: var(--text-clamp);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :where(h1) { font-size: clamp(1.5rem, 5vw, 2.25rem); }
    :where(h2) { font-size: clamp(1.25rem, 4vw, 1.875rem); }
    :where(h3) { font-size: clamp(1.1rem, 3.5vw, 1.5rem); }
    :where(h4) { font-size: clamp(1rem, 3vw, 1.25rem); }
  }

  @media (max-width: 480px) {
    :where(button, [role='button'], [role='tab'], .btn, .button, .tab) {
      font-size: clamp(11px, 3vw, 14px);
    }
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

