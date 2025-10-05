/**
 * 📝 Globul Cars Design System - Typography
 * نظام الخطوط والنصوص الموحد
 */

export const typography = {
  // Font Families
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Monaco', 'Consolas', monospace",
    automotive: "'Orbitron', 'Inter', sans-serif", // For car-related headings
  },

  // Font Sizes
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },

  // Font Weights
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text Styles
  styles: {
    // Display styles for hero sections
    display1: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '4.5rem', // 72px
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    
    display2: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '3.75rem', // 60px
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },

    // Heading styles
    h1: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '2.25rem', // 36px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },

    h2: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1.875rem', // 30px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },

    h3: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.4,
    },

    h4: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },

    h5: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.4,
    },

    h6: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.4,
    },

    // Body text styles
    bodyLarge: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1.125rem', // 18px
      fontWeight: 400,
      lineHeight: 1.6,
    },

    body: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.6,
    },

    bodySmall: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.5,
    },

    // Caption and small text
    caption: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.4,
    },

    // Button text
    button: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.01em',
    },

    buttonSmall: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.2,
    },

    // Car-specific text styles
    carMake: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '1.25rem', // 20px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.05em',
    },

    carModel: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.3,
    },

    carPrice: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1.5rem', // 24px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.01em',
    },

    carSpec: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.4,
    },

    // Form text
    label: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.4,
    },

    input: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },

    placeholder: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      opacity: 0.6,
    },

    // Navigation text
    nav: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.2,
    },

    // Error and success messages
    error: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.4,
    },

    success: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.4,
    },

    // Code text
    code: {
      fontFamily: "'Fira Code', monospace",
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.5,
    },

    // Quote text
    quote: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '1.125rem', // 18px
      fontWeight: 400,
      lineHeight: 1.6,
      fontStyle: 'italic',
    },
  }
} as const;

export type TypographyConfig = typeof typography;
export default typography;
