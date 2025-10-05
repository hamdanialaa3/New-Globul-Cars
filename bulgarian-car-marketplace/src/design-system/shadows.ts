/**
 * 🌟 Globul Cars Design System - Shadows
 * نظام الظلال والتأثيرات البصرية
 */

export const shadows = {
  // Basic shadows
  basic: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Colored shadows
  colored: {
    primary: {
      sm: '0 1px 2px 0 rgba(255, 121, 0, 0.1)',
      md: '0 4px 6px -1px rgba(255, 121, 0, 0.2), 0 2px 4px -1px rgba(255, 121, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(255, 121, 0, 0.3), 0 4px 6px -2px rgba(255, 121, 0, 0.2)',
      xl: '0 20px 25px -5px rgba(255, 121, 0, 0.4), 0 10px 10px -5px rgba(255, 121, 0, 0.3)',
    },

    secondary: {
      sm: '0 1px 2px 0 rgba(44, 62, 80, 0.1)',
      md: '0 4px 6px -1px rgba(44, 62, 80, 0.2), 0 2px 4px -1px rgba(44, 62, 80, 0.1)',
      lg: '0 10px 15px -3px rgba(44, 62, 80, 0.3), 0 4px 6px -2px rgba(44, 62, 80, 0.2)',
      xl: '0 20px 25px -5px rgba(44, 62, 80, 0.4), 0 10px 10px -5px rgba(44, 62, 80, 0.3)',
    },

    success: {
      sm: '0 1px 2px 0 rgba(16, 185, 129, 0.1)',
      md: '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)',
      lg: '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)',
    },

    error: {
      sm: '0 1px 2px 0 rgba(239, 68, 68, 0.1)',
      md: '0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1)',
      lg: '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)',
    },
  },

  // Glassmorphism shadows
  glass: {
    light: '0 8px 32px rgba(31, 38, 135, 0.37)',
    medium: '0 8px 32px rgba(31, 38, 135, 0.5)',
    dark: '0 8px 32px rgba(31, 38, 135, 0.7)',
    colored: '0 8px 32px rgba(255, 121, 0, 0.4)',
  },

  // Car-specific shadows
  automotive: {
    // Car card shadows
    card: {
      default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      hover: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      selected: '0 0 0 3px rgba(255, 121, 0, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.15)',
    },

    // Car image shadows
    image: {
      default: '0 4px 8px rgba(0, 0, 0, 0.1)',
      hover: '0 8px 16px rgba(0, 0, 0, 0.15)',
      loading: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },

    // Car gallery shadows
    gallery: {
      thumb: '0 2px 4px rgba(0, 0, 0, 0.1)',
      thumbActive: '0 4px 8px rgba(255, 121, 0, 0.3)',
      main: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
  },

  // Component-specific shadows
  components: {
    // Button shadows
    button: {
      default: '0 1px 2px rgba(0, 0, 0, 0.05)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      active: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      primary: '0 4px 6px -1px rgba(255, 121, 0, 0.2), 0 2px 4px -1px rgba(255, 121, 0, 0.1)',
    },

    // Input shadows
    input: {
      default: '0 1px 2px rgba(0, 0, 0, 0.05)',
      focus: '0 0 0 3px rgba(255, 121, 0, 0.1)',
      error: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    },

    // Card shadows
    card: {
      default: '0 1px 3px rgba(0, 0, 0, 0.1)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },

    // Modal shadows
    modal: {
      backdrop: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      content: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },

    // Dropdown shadows
    dropdown: {
      default: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },

    // Tooltip shadows
    tooltip: {
      default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
  },

  // Interactive shadows
  interactive: {
    // Hover effects
    hover: {
      lift: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      glow: '0 0 20px rgba(255, 121, 0, 0.4)',
      glowSecondary: '0 0 20px rgba(44, 62, 80, 0.4)',
    },

    // Focus effects
    focus: {
      ring: '0 0 0 3px rgba(255, 121, 0, 0.2)',
      ringError: '0 0 0 3px rgba(239, 68, 68, 0.2)',
      ringSuccess: '0 0 0 3px rgba(16, 185, 129, 0.2)',
    },

    // Active effects
    active: {
      press: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      pressPrimary: 'inset 0 2px 4px 0 rgba(255, 121, 0, 0.2)',
    },
  },

  // Special effects
  effects: {
    // Floating elements
    floating: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    
    // Depth layers
    depth1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    depth2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    depth3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    depth4: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
    depth5: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',

    // Neon effects
    neon: '0 0 5px rgba(255, 121, 0, 0.5), 0 0 10px rgba(255, 121, 0, 0.3), 0 0 15px rgba(255, 121, 0, 0.2)',
    
    // Subtle glow
    glow: '0 0 20px rgba(255, 121, 0, 0.2)',
    glowStrong: '0 0 30px rgba(255, 121, 0, 0.4)',
  },
} as const;

export type ShadowConfig = typeof shadows;
export default shadows;
