// Typography System - Koli One
// نظام الطباعة الموحد - سوق السيارات البلغاري

export const typography = {
  // Font Family
  fontFamily: {
    primary: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    secondary: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'Courier New', 'Courier', monospace",
  },

  // Font Sizes - Perfect Hierarchy
  fontSize: {
    // Headings
    h1: {
      desktop: '2rem',      // 32px - Page Titles
      tablet: '1.75rem',    // 28px
      mobile: '1.5rem',     // 24px
    },
    h2: {
      desktop: '1.75rem',   // 28px - Section Titles
      tablet: '1.5rem',     // 24px
      mobile: '1.375rem',   // 22px
    },
    h3: {
      desktop: '1.5rem',    // 24px - Subsection Titles
      tablet: '1.375rem',   // 22px
      mobile: '1.25rem',    // 20px
    },
    h4: {
      desktop: '1.25rem',   // 20px - Card Titles
      tablet: '1.125rem',   // 18px
      mobile: '1.125rem',   // 18px
    },
    h5: {
      desktop: '1.125rem',  // 18px - Small Headings
      tablet: '1rem',       // 16px
      mobile: '1rem',       // 16px
    },
    h6: {
      desktop: '1rem',      // 16px - Micro Headings
      tablet: '0.9375rem',  // 15px
      mobile: '0.9375rem',  // 15px
    },

    // Body Text
    body: {
      large: '1.125rem',    // 18px - Feature Text
      normal: '1rem',       // 16px - Default Body
      small: '0.875rem',    // 14px - Secondary Text
      tiny: '0.75rem',      // 12px - Captions
    },

    // UI Elements
    button: {
      large: '1rem',        // 16px
      normal: '0.875rem',   // 14px
      small: '0.75rem',     // 12px
    },

    // Form Elements
    input: {
      large: '1.125rem',    // 18px
      normal: '1rem',       // 16px
      small: '0.875rem',    // 14px
    },

    label: {
      normal: '0.875rem',   // 14px
      small: '0.75rem',     // 12px
    },
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  // Line Heights - Optimal Readability
  lineHeight: {
    tight: 1.2,      // Headings
    normal: 1.5,     // Body Text
    relaxed: 1.75,   // Long-form Content
    loose: 2,        // Spacious Content
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Typography Mixins for styled-components
export const typographyMixins = {
  // Headings
  h1: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.h1.desktop};
    font-weight: ${typography.fontWeight.bold};
    line-height: ${typography.lineHeight.tight};
    letter-spacing: ${typography.letterSpacing.tight};
    
    @media (max-width: 768px) {
      font-size: ${typography.fontSize.h1.tablet};
    }
    
    @media (max-width: 480px) {
      font-size: ${typography.fontSize.h1.mobile};
    }
  `,

  h2: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.h2.desktop};
    font-weight: ${typography.fontWeight.bold};
    line-height: ${typography.lineHeight.tight};
    letter-spacing: ${typography.letterSpacing.tight};
    
    @media (max-width: 768px) {
      font-size: ${typography.fontSize.h2.tablet};
    }
    
    @media (max-width: 480px) {
      font-size: ${typography.fontSize.h2.mobile};
    }
  `,

  h3: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.h3.desktop};
    font-weight: ${typography.fontWeight.semibold};
    line-height: ${typography.lineHeight.tight};
    
    @media (max-width: 768px) {
      font-size: ${typography.fontSize.h3.tablet};
    }
    
    @media (max-width: 480px) {
      font-size: ${typography.fontSize.h3.mobile};
    }
  `,

  h4: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.h4.desktop};
    font-weight: ${typography.fontWeight.semibold};
    line-height: ${typography.lineHeight.normal};
    
    @media (max-width: 768px) {
      font-size: ${typography.fontSize.h4.tablet};
    }
    
    @media (max-width: 480px) {
      font-size: ${typography.fontSize.h4.mobile};
    }
  `,

  h5: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.h5.desktop};
    font-weight: ${typography.fontWeight.medium};
    line-height: ${typography.lineHeight.normal};
    
    @media (max-width: 768px) {
      font-size: ${typography.fontSize.h5.tablet};
    }
    
    @media (max-width: 480px) {
      font-size: ${typography.fontSize.h5.mobile};
    }
  `,

  h6: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.h6.desktop};
    font-weight: ${typography.fontWeight.medium};
    line-height: ${typography.lineHeight.normal};
    
    @media (max-width: 768px) {
      font-size: ${typography.fontSize.h6.tablet};
    }
    
    @media (max-width: 480px) {
      font-size: ${typography.fontSize.h6.mobile};
    }
  `,

  // Body Text
  bodyLarge: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.body.large};
    font-weight: ${typography.fontWeight.normal};
    line-height: ${typography.lineHeight.normal};
  `,

  bodyNormal: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.body.normal};
    font-weight: ${typography.fontWeight.normal};
    line-height: ${typography.lineHeight.normal};
  `,

  bodySmall: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.body.small};
    font-weight: ${typography.fontWeight.normal};
    line-height: ${typography.lineHeight.normal};
  `,

  bodyTiny: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.body.tiny};
    font-weight: ${typography.fontWeight.normal};
    line-height: ${typography.lineHeight.normal};
  `,

  // Buttons
  buttonLarge: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.button.large};
    font-weight: ${typography.fontWeight.semibold};
    line-height: 1;
    letter-spacing: ${typography.letterSpacing.wide};
  `,

  buttonNormal: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.button.normal};
    font-weight: ${typography.fontWeight.semibold};
    line-height: 1;
    letter-spacing: ${typography.letterSpacing.wide};
  `,

  buttonSmall: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.button.small};
    font-weight: ${typography.fontWeight.medium};
    line-height: 1;
    letter-spacing: ${typography.letterSpacing.wide};
  `,

  // Form Inputs
  inputLarge: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.input.large};
    font-weight: ${typography.fontWeight.normal};
    line-height: ${typography.lineHeight.normal};
  `,

  inputNormal: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.input.normal};
    font-weight: ${typography.fontWeight.normal};
    line-height: ${typography.lineHeight.normal};
  `,

  inputSmall: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.input.small};
    font-weight: ${typography.fontWeight.normal};
    line-height: ${typography.lineHeight.normal};
  `,

  // Labels
  labelNormal: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.label.normal};
    font-weight: ${typography.fontWeight.medium};
    line-height: ${typography.lineHeight.normal};
    letter-spacing: ${typography.letterSpacing.wide};
  `,

  labelSmall: `
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.label.small};
    font-weight: ${typography.fontWeight.medium};
    line-height: ${typography.lineHeight.normal};
    letter-spacing: ${typography.letterSpacing.wider};
    text-transform: uppercase;
  `,
};

// Helper function for responsive font sizes
export const responsiveFontSize = (
  desktop: string,
  tablet?: string,
  mobile?: string
) => `
  font-size: ${desktop};
  
  ${tablet ? `
    @media (max-width: 768px) {
      font-size: ${tablet};
    }
  ` : ''}
  
  ${mobile ? `
    @media (max-width: 480px) {
      font-size: ${mobile};
    }
  ` : ''}
`;

export default typography;
