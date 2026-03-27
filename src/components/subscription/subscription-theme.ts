/**
 * Subscription Theme Configuration
 * 🎨 "Royal Night" Theme - World Class Design
 *
 * DESIGN SYSTEM:
 * - Background: Deep Midnight Blue (#0f172a -> #1e1b4b)
 * - Glassmorphism: Heavy blurs, thin white borders
 * - Accents:
 *    - Primary: Electric Purple/Pink (Dealer)
 *    - Secondary: Cyan/Blue (Company)
 *    - Tertiary: Slate/Grey (Free)
 */

export const subscriptionTheme = {
  // Core Colors
  colors: {
    bg: {
      primary: '#0f172a', // Slate 900
      secondary: '#1e1b4b', // Indigo 950
      card: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
    },
    text: {
      primary: '#f8fafc', // Slate 50
      secondary: '#94a3b8', // Slate 400
      accent: '#c084fc', // Purple 400
    },
    primary: {
      main: '#2563EB',
      light: '#c084fc',
      dark: '#7e22ce',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      highlight: 'rgba(255, 255, 255, 0.2)',
    },
  },

  // Gradients for Plans & UI
  gradients: {
    // 🟣 Dealer: Purple to Pink
    dealer: 'linear-gradient(135deg, #2563EB 0%, #ec4899 100%)',
    dealerHover: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',

    // 🔵 Company: Blue to Cyan
    company: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    companyHover: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',

    // ⚪ Free: Slate
    free: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',

    // 🌌 Aurora Background
    aurora:
      'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 0) 50%), radial-gradient(circle at 80% 10%, rgba(236, 72, 153, 0.1) 0%, rgba(15, 23, 42, 0) 40%)',
  },

  // Shadows
  shadows: {
    card: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(37, 99, 235, 0.4)',
    button:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },

  // Glassmorphism Utils
  glass: {
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdrop: 'blur(16px)',
  },
} as const;

// Compatible Exports for Existing Code (Legacy Support)
// These map the new theme to the old structure to prevent immediate breakages
// while we refactor the components.

export const legacyTheme = {
  primary: {
    main: '#2563EB',
    light: '#c084fc',
    dark: '#7e22ce',
    gradient: subscriptionTheme.gradients.dealer,
    gradientWithMiddle:
      'linear-gradient(135deg, #2563EB 0%, #d946ef 50%, #ec4899 100%)',
  },
  secondary: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
  },
  shadows: {
    small: 'rgba(37, 99, 235, 0.2)',
    medium: 'rgba(37, 99, 235, 0.3)',
    large: 'rgba(37, 99, 235, 0.4)',
    hover: 'rgba(37, 99, 235, 0.5)',
  },
  borders: {
    primary: subscriptionTheme.colors.border.subtle,
    secondary: subscriptionTheme.colors.border.highlight,
    highlight: '#2563EB',
  },
  backgrounds: {
    overlay: 'rgba(37, 99, 235, 0.1)',
    hover: 'rgba(255, 255, 255, 0.05)',
    active: 'rgba(255, 255, 255, 0.1)',
  },
};

export default legacyTheme;

// Helper Functions (Modified to use new theme)
export function getPrimaryGradient(): string {
  return legacyTheme.primary.gradient;
}

export function getPrimaryGradientWithMiddle(): string {
  return legacyTheme.primary.gradientWithMiddle;
}

export function getShadowColor(opacity: number = 0.35): string {
  return `rgba(99, 102, 241, ${opacity})`;
}

export function getBorderColor(
  type: 'primary' | 'secondary' | 'highlight' = 'primary'
): string {
  return legacyTheme.borders[type];
}
