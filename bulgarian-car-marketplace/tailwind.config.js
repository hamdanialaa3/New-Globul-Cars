/** @type {import('tailwindcss').Config} */
// ═══════════════════════════════════════════════════════════════════════════
// 🚗 Tailwind CSS Configuration - Bulgarian Car Marketplace
// تكوين Tailwind CSS - السوق البلغاري للسيارات
// 
// Philosophy: Extend Tailwind with custom design tokens from theme.v2.ts
// المبدأ: توسيع Tailwind برموز التصميم المخصصة من theme.v2.ts
// 
// Created: December 7, 2025
// Integration: Works alongside styled-components (gradual migration)
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // ───────────────────────────────────────────────────────────────────────
  // Content Sources - مصادر المحتوى
  // Files to scan for Tailwind class usage
  // ───────────────────────────────────────────────────────────────────────
  content: [
    './src/**/*.{js,jsx,ts,tsx}',       // All React components
    './src/pages/**/*.{js,jsx,ts,tsx}', // All pages
    './src/components/**/*.{js,jsx,ts,tsx}', // All components
    './public/index.html',              // HTML template
  ],

  // ───────────────────────────────────────────────────────────────────────
  // Dark Mode Configuration - تكوين الوضع الداكن
  // ───────────────────────────────────────────────────────────────────────
  darkMode: 'class', // Use 'class' strategy (controlled via <html data-theme="dark">)

  // ───────────────────────────────────────────────────────────────────────
  // Theme Customization - تخصيص الثيم
  // Maps to theme.v2.ts design tokens
  // ───────────────────────────────────────────────────────────────────────
  theme: {
    extend: {
      // ─────────────────────────────────────────────────────────────────
      // 🎨 Colors - الألوان
      // Semantic color tokens from theme.v2.ts
      // ─────────────────────────────────────────────────────────────────
      colors: {
        // Brand Colors
        brand: {
          primary: '#FF8F10',      // Bulgarian Orange
          secondary: '#16a34a',    // Dealer Green
          tertiary: '#1d4ed8',     // Company Blue
          dark: '#003366',         // Navy
          light: '#FFF8F5',        // Cream
        },

        // Interactive Colors
        interactive: {
          primary: '#FF6B35',
          hover: '#FF8C61',
          active: '#E85A28',
          secondary: '#2C5F8D',
          'secondary-hover': '#4A90E2',
          link: '#FF6B35',
          'link-hover': '#E85A28',
          disabled: '#CBD5E0',
        },

        // Content/Text Colors
        content: {
          heading: '#1A1D2E',
          primary: '#333333',
          secondary: '#666666',
          tertiary: '#999999',
          placeholder: '#CCCCCC',
          inverse: '#FFFFFF',
        },

        // Surface Colors
        surface: {
          page: '#FAFBFC',
          card: '#FFFFFF',
          elevated: '#FFFFFF',
          hover: '#F5F7FA',
          selected: '#FFF8F5',
          header: '#1A1D2E',
          footer: '#2D3142',
        },

        // Border Colors
        border: {
          DEFAULT: '#E2E8F0',
          light: '#F7FAFC',
          medium: '#CBD5E0',
          dark: '#94A3B8',
          focus: '#FF6B35',
          error: '#EF4444',
        },

        // Feedback Colors
        feedback: {
          success: '#10B981',
          'success-light': '#D1FAE5',
          'success-dark': '#047857',
          warning: '#F59E0B',
          'warning-light': '#FEF3C7',
          'warning-dark': '#D97706',
          error: '#EF4444',
          'error-light': '#FEE2E2',
          'error-dark': '#DC2626',
          info: '#3B82F6',
          'info-light': '#DBEAFE',
          'info-dark': '#1D4ED8',
        },

        // Extended Neutral Grays (9-step scale)
        neutral: {
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
      },

      // ─────────────────────────────────────────────────────────────────
      // ✏️ Typography - الطباعة
      // ─────────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["'Martica'", "'Arial'", 'sans-serif'],
        mono: ["'Courier New'", "'Courier'", 'monospace'],
      },

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
      },

      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      lineHeight: {
        tight: '1.2',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },

      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },

      // ─────────────────────────────────────────────────────────────────
      // 📏 Spacing - المسافات
      // 8px base unit grid
      // ─────────────────────────────────────────────────────────────────
      spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
        '4xl': '6rem',   // 96px
        '5xl': '8rem',   // 128px
      },

      // ─────────────────────────────────────────────────────────────────
      // 📱 Breakpoints - نقاط التحويل
      // Mobile-first responsive
      // ─────────────────────────────────────────────────────────────────
      screens: {
        xs: '0px',
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1920px',
      },

      // ─────────────────────────────────────────────────────────────────
      // 🎭 Shadows - الظلال
      // ─────────────────────────────────────────────────────────────────
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
        DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.06)',
        md: '0 4px 12px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 30px rgba(0, 0, 0, 0.12)',
        xl: '0 20px 50px rgba(0, 0, 0, 0.15)',
        '2xl': '0 25px 60px rgba(0, 0, 0, 0.2)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        button: '0 2px 6px rgba(255, 107, 53, 0.25)',
        hover: '0 4px 16px rgba(0, 0, 0, 0.12)',
        focus: '0 0 0 3px rgba(255, 107, 53, 0.3)',
        none: 'none',
      },

      // ─────────────────────────────────────────────────────────────────
      // 🔘 Border Radius - نصف قطر الحدود
      // ─────────────────────────────────────────────────────────────────
      borderRadius: {
        none: '0',
        sm: '0.5rem',     // 8px
        DEFAULT: '0.75rem', // 12px
        md: '1rem',       // 16px
        lg: '1.25rem',    // 20px
        xl: '1.5rem',     // 24px
        '2xl': '2rem',    // 32px
        '3xl': '3rem',    // 48px
        full: '9999px',
      },

      // ─────────────────────────────────────────────────────────────────
      // 🎬 Animations - الحركات
      // Custom animations for smooth UX
      // ─────────────────────────────────────────────────────────────────
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },

  // ───────────────────────────────────────────────────────────────────────
  // Plugins - الإضافات
  // Official Tailwind plugins for extended functionality
  // ───────────────────────────────────────────────────────────────────────
  plugins: [
    // You can add plugins here later:
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],

  // ───────────────────────────────────────────────────────────────────────
  // Important Prefix - البادئة المهمة
  // Use '!important' on all Tailwind utilities (for CSS specificity)
  // Optional: Enable if you have conflicts with styled-components
  // ───────────────────────────────────────────────────────────────────────
  // important: true, // Uncomment if you need !important on all utilities

  // ───────────────────────────────────────────────────────────────────────
  // Prefix - البادئة
  // Add prefix to all Tailwind classes (e.g., tw-bg-red-500)
  // Optional: Enable for gradual migration
  // ───────────────────────────────────────────────────────────────────────
  // prefix: 'tw-', // Uncomment for prefixed classes

  // ───────────────────────────────────────────────────────────────────────
  // Core Plugins - الإضافات الأساسية
  // Disable unused Tailwind features to reduce bundle size
  // ───────────────────────────────────────────────────────────────────────
  corePlugins: {
    // Enable all by default, disable specific ones if needed:
    // preflight: false, // Disable if you want to keep your existing CSS reset
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 📋 USAGE EXAMPLES - أمثلة الاستخدام
// ═══════════════════════════════════════════════════════════════════════════
/*

1️⃣ BASIC USAGE:
────────────────
<button className="bg-interactive-primary text-content-inverse px-md py-sm rounded-sm shadow-button hover:bg-interactive-hover transition-all">
  Submit
</button>


2️⃣ RESPONSIVE DESIGN:
───────────────────────
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div className="bg-surface-card p-lg rounded-md shadow-card">Card 1</div>
  <div className="bg-surface-card p-lg rounded-md shadow-card">Card 2</div>
  <div className="bg-surface-card p-lg rounded-md shadow-card">Card 3</div>
</div>


3️⃣ DARK MODE:
───────────────
<div className="bg-surface-page dark:bg-neutral-900 text-content-primary dark:text-neutral-50">
  This text changes color in dark mode
</div>


4️⃣ CUSTOM ANIMATIONS:
───────────────────────
<div className="animate-fade-in">Fades in smoothly</div>
<div className="animate-slide-up">Slides up from bottom</div>


5️⃣ COMBINING WITH STYLED-COMPONENTS:
──────────────────────────────────────
import styled from 'styled-components';

const Card = styled.div.attrs({
  className: 'bg-surface-card p-lg rounded-md shadow-card hover:shadow-hover transition-all'
})`
  // Additional styled-components styles if needed
  &:hover {
    transform: translateY(-2px);
  }
`;

*/

// ═══════════════════════════════════════════════════════════════════════════
// ✅ NEXT STEPS:
// الخطوات التالية:
// 
// 1. Create postcss.config.js
//    إنشاء ملف postcss.config.js
// 
// 2. Import Tailwind in index.css
//    استيراد Tailwind في index.css
// 
// 3. Start using Tailwind classes in components
//    البدء في استخدام فئات Tailwind في المكونات
// 
// 4. Gradually migrate from styled-components
//    الانتقال التدريجي من styled-components
// ═══════════════════════════════════════════════════════════════════════════
