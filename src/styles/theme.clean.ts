// Cleaned Theme - 80 lines vs 656 lines
import { createGlobalStyle, DefaultTheme } from 'styled-components';

export const colors = {
  primary: { main: '#003366', light: '#0066CC', dark: '#002244' },
  secondary: { main: '#CC0000', light: '#FF3333', dark: '#990000' },
  success: { main: '#28A745' },
  warning: { main: '#FFC107' },
  error: { main: '#CC0000' },
  grey: { 100: '#F1F5F9', 300: '#CBD5E1', 500: '#64748B', 700: '#334155', 900: '#0F172A' },
  text: { primary: '#333333', secondary: '#666666', disabled: '#999999' },
  background: { default: '#FFFFFF', paper: '#F8F9FA' }
};

export const typography = {
  fontFamily: "'Martica', 'Arial', sans-serif",
  fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' },
  fontWeight: { normal: 400, medium: 500, bold: 700 },
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75 }
};

export const spacing = {
  xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem'
};

export const breakpoints = {
  sm: '600px', md: '960px', lg: '1280px', xl: '1920px'
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
};

export const borderRadius = {
  sm: '0.5rem', md: '1rem', lg: '1.25rem', full: '9999px'
};

export const theme: DefaultTheme = {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  borderRadius,
  components: {
    button: { borderRadius: borderRadius.sm },
    input: { borderRadius: borderRadius.sm },
    card: { borderRadius: borderRadius.sm }
  }
};

export const GlobalStyles = createGlobalStyle`
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${typography.fontFamily};
    color: ${colors.text.primary};
    background: ${colors.background.default};
    line-height: ${typography.lineHeight.normal};
  }
  h1 { font-size: ${typography.fontSize['2xl']}; font-weight: ${typography.fontWeight.bold}; }
  h2 { font-size: ${typography.fontSize.xl}; font-weight: ${typography.fontWeight.bold}; }
  h3 { font-size: ${typography.fontSize.lg}; font-weight: ${typography.fontWeight.bold}; }
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${borderRadius.sm};
    background: ${colors.primary.main};
    color: white;
    transition: all 0.2s;
    &:hover { background: ${colors.primary.dark}; }
  }
`;

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof colors;
    typography: typeof typography;
    spacing: typeof spacing;
    breakpoints: typeof breakpoints;
    shadows: typeof shadows;
    borderRadius: typeof borderRadius;
    components: { button: any; input: any; card: any };
  }
}
