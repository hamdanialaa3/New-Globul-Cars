export const MobileBGTheme = {
    // Brand Colors
    brand: {
        primary: '#FF7900',      // Signature Orange
        secondary: '#00D4AA',    // Tech Green
        accent: '#7B61FF',       // Modern Purple
        dark: '#1A1D29',         // Premium Dark Background
        light: '#F8F9FA',        // Clean Light Background
        glass: 'rgba(255, 255, 255, 0.1)',
    },

    // Glassmorphism Effects
    glassmorphism: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },

    // Animations
    animations: {
        smooth: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    // Typography & Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
    },

    breakpoints: {
        mobile: '576px',
        tablet: '768px',
        desktop: '992px',
        wide: '1200px',
    }
};
