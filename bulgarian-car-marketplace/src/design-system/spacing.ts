/**
 * 📏 Globul Cars Design System - Spacing
 * نظام المسافات والحشو الموحد
 */

export const spacing = {
  // Base spacing units (4px system)
  base: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    7: '1.75rem',  // 28px
    8: '2rem',     // 32px
    9: '2.25rem',  // 36px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    14: '3.5rem',  // 56px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    28: '7rem',    // 112px
    32: '8rem',    // 128px
    36: '9rem',    // 144px
    40: '10rem',   // 160px
    44: '11rem',   // 176px
    48: '12rem',   // 192px
    52: '13rem',   // 208px
    56: '14rem',   // 224px
    60: '15rem',   // 240px
    64: '16rem',   // 256px
    72: '18rem',   // 288px
    80: '20rem',   // 320px
    96: '24rem',   // 384px
  },

  // Semantic spacing for different contexts
  semantic: {
    // Component spacing
    component: {
      xs: '0.5rem',   // 8px
      sm: '0.75rem',  // 12px
      md: '1rem',     // 16px
      lg: '1.5rem',   // 24px
      xl: '2rem',     // 32px
    },

    // Layout spacing
    layout: {
      xs: '1rem',     // 16px
      sm: '1.5rem',   // 24px
      md: '2rem',     // 32px
      lg: '3rem',     // 48px
      xl: '4rem',     // 64px
      '2xl': '6rem',  // 96px
    },

    // Section spacing
    section: {
      xs: '2rem',     // 32px
      sm: '3rem',     // 48px
      md: '4rem',     // 64px
      lg: '6rem',     // 96px
      xl: '8rem',     // 128px
    },

    // Page spacing
    page: {
      xs: '1rem',     // 16px
      sm: '1.5rem',   // 24px
      md: '2rem',     // 32px
      lg: '2.5rem',   // 40px
      xl: '3rem',     // 48px
    },
  },

  // Car-specific spacing
  automotive: {
    // Car card spacing
    card: {
      padding: '1.5rem',    // 24px
      margin: '1rem',       // 16px
      gap: '1rem',          // 16px
      borderRadius: '1rem', // 16px
    },

    // Car gallery spacing
    gallery: {
      gap: '0.5rem',        // 8px
      padding: '0.5rem',    // 8px
    },

    // Car details spacing
    details: {
      padding: '2rem',      // 32px
      gap: '1.5rem',        // 24px
    },

    // Car specs spacing
    specs: {
      gap: '0.75rem',       // 12px
      padding: '1rem',      // 16px
    },
  },

  // Grid spacing
  grid: {
    gap: {
      xs: '0.5rem',   // 8px
      sm: '0.75rem',  // 12px
      md: '1rem',     // 16px
      lg: '1.5rem',   // 24px
      xl: '2rem',     // 32px
    },

    // Grid columns spacing
    columns: {
      1: '1rem',      // 16px
      2: '1.5rem',    // 24px
      3: '2rem',      // 32px
      4: '2.5rem',    // 40px
    },
  },

  // Form spacing
  form: {
    field: {
      gap: '0.75rem',       // 12px
      padding: '1rem',      // 16px
    },

    group: {
      gap: '1.5rem',        // 24px
      padding: '2rem',      // 32px
    },

    section: {
      gap: '2rem',          // 32px
      padding: '2rem',      // 32px
    },
  },

  // Button spacing
  button: {
    padding: {
      sm: '0.5rem 1rem',    // 8px 16px
      md: '0.75rem 1.5rem', // 12px 24px
      lg: '1rem 2rem',      // 16px 32px
    },

    gap: '0.5rem',          // 8px (between icon and text)
  },

  // Navigation spacing
  navigation: {
    item: {
      padding: '0.75rem 1rem', // 12px 16px
      gap: '0.5rem',           // 8px
    },

    container: {
      padding: '1rem 2rem',    // 16px 32px
    },
  },

  // Modal spacing
  modal: {
    padding: '2rem',        // 32px
    gap: '1.5rem',          // 24px
    margin: '2rem',         // 32px
  },

  // Sidebar spacing
  sidebar: {
    padding: '1.5rem',      // 24px
    gap: '1rem',            // 16px
  },

  // Header spacing
  header: {
    padding: '1rem 2rem',   // 16px 32px
    height: '4rem',         // 64px
  },

  // Footer spacing
  footer: {
    padding: '3rem 2rem',   // 48px 32px
    gap: '2rem',            // 32px
  },
} as const;

export type SpacingConfig = typeof spacing;
export default spacing;
