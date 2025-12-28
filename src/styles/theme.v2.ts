// ═══════════════════════════════════════════════════════════════════════════
// 🚗 Bulgarian Car Marketplace - Modern Design System v2.0
// نظام التصميم الحديث للسوق البلغاري للسيارات
// 
// Philosophy: Semantic, Scalable, Human-Centric Design Tokens
// المبدأ: رموز تصميم دلالية، قابلة للتوسع، متمحورة حول الإنسان
// 
// Created: December 7, 2025
// Replaces: 656-line theme.ts (88% unused colors removed)
// Compatible with: unified-theme.css CSS Variables
// ═══════════════════════════════════════════════════════════════════════════

import { DefaultTheme } from 'styled-components';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS - Semantic Color System
// رموز التصميم - نظام ألوان دلالي
// 
// WHY: Named by PURPOSE not by COLOR
// لماذا: تسمية حسب الهدف وليس اللون
// Example: "interactive.primary" not "blue.500"
// مثال: "interactive.primary" وليس "blue.500"
// ═══════════════════════════════════════════════════════════════════════════

export const colorTokens = {
  // ─────────────────────────────────────────────────────────────────────────
  // 🏢 Brand Colors - ألوان العلامة التجارية
  // Bulgarian Market Identity (Mobile.de-inspired)
  // ─────────────────────────────────────────────────────────────────────────
  brand: {
    primary: '#FF8F10',      // Bulgarian Orange - Private Sellers (الأفراد)
    secondary: '#16a34a',    // Dealer Green - Professional Dealers (التجار)
    tertiary: '#1d4ed8',     // Company Blue - Corporate Fleet (الشركات)
    dark: '#003366',         // Professional Navy - Headers (الهيدر)
    light: '#FFF8F5',        // Soft Cream - Backgrounds (الخلفيات)
    // Bulgarian National Colors - الألوان الوطنية البلغارية
    bulgarian: {
      white: '#FFFFFF',      // Бяло - White
      green: '#00966E',      // Зелено - Green (Bulgarian flag green)
      red: '#D62612',        // Червено - Red (Bulgarian flag red)
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 🎯 Interactive Colors - ألوان التفاعل
  // User Actions: Buttons, Links, Forms
  // ─────────────────────────────────────────────────────────────────────────
  interactive: {
    primary: '#FF6B35',      // CTA Buttons - دافع للعمل
    primaryHover: '#FF8C61', // Hover State - حالة التحويم
    primaryActive: '#E85A28',// Active/Pressed - حالة الضغط
    
    secondary: '#2C5F8D',    // Secondary Actions - إجراءات ثانوية
    secondaryHover: '#4A90E2',
    
    link: '#FF6B35',         // Text Links - روابط نصية
    linkHover: '#E85A28',    // Link Hover - روابط عند التحويم
    linkVisited: '#CC4A1F',  // Visited Links - روابط مزارة
    
    disabled: '#CBD5E0',     // Disabled State - حالة التعطيل
    disabledText: '#A0AEC0', // Disabled Text - نص معطل
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 📝 Content Colors - ألوان المحتوى
  // Typography & Text Hierarchy
  // ─────────────────────────────────────────────────────────────────────────
  content: {
    heading: '#1A1D2E',      // Headings (H1-H6) - العناوين
    primary: '#333333',      // Body Text - نص أساسي
    secondary: '#666666',    // Supporting Text - نص داعم
    tertiary: '#999999',     // Muted Text - نص خافت
    placeholder: '#CCCCCC',  // Placeholder Text - نص نموذجي
    inverse: '#FFFFFF',      // Text on Dark - نص على داكن
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 🎭 Surface Colors - ألوان الأسطح
  // Backgrounds, Cards, Containers
  // ─────────────────────────────────────────────────────────────────────────
  surface: {
    page: '#FAFBFC',         // Page Background - خلفية الصفحة
    card: '#FFFFFF',         // Card Background - خلفية البطاقات
    elevated: '#FFFFFF',     // Elevated Cards - بطاقات مرتفعة
    overlay: 'rgba(255, 255, 255, 0.95)', // Modals - نوافذ منبثقة
    hover: '#F5F7FA',        // Hover Background - خلفية التحويم
    selected: '#FFF8F5',     // Selected State - حالة الاختيار
    
    header: '#1A1D2E',       // Header (Dark) - هيدر داكن
    footer: '#2D3142',       // Footer - فوتر
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 🔲 Border Colors - ألوان الحدود
  // Dividers, Input Borders, Card Outlines
  // ─────────────────────────────────────────────────────────────────────────
  border: {
    default: '#E2E8F0',      // Default Border - حدود افتراضية
    light: '#F7FAFC',        // Light Border - حدود خفيفة
    medium: '#CBD5E0',       // Medium Border - حدود متوسطة
    dark: '#94A3B8',         // Dark Border - حدود داكنة
    focus: '#FF6B35',        // Focus Ring - حلقة التركيز
    error: '#EF4444',        // Error Border - حدود خطأ
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ Feedback Colors - ألوان التغذية الراجعة
  // Success, Warning, Error, Info States
  // ─────────────────────────────────────────────────────────────────────────
  feedback: {
    success: {
      main: '#10B981',       // Success Green - أخضر نجاح
      light: '#D1FAE5',      // Light Background - خلفية فاتحة
      dark: '#047857',       // Dark Shade - ظل داكن
    },
    warning: {
      main: '#F59E0B',       // Warning Amber - كهرماني تحذير
      light: '#FEF3C7',      // Light Background - خلفية فاتحة
      dark: '#D97706',       // Dark Shade - ظل داكن
    },
    error: {
      main: '#EF4444',       // Error Red - أحمر خطأ
      light: '#FEE2E2',      // Light Background - خلفية فاتحة
      dark: '#DC2626',       // Dark Shade - ظل داكن
    },
    info: {
      main: '#3B82F6',       // Info Blue - أزرق معلومات
      light: '#DBEAFE',      // Light Background - خلفية فاتحة
      dark: '#1D4ED8',       // Dark Shade - ظل داكن
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 🌈 Neutral Grays - تدرجات الرمادي المحايدة
  // 9-Step Gray Scale (Tailwind-inspired)
  // ─────────────────────────────────────────────────────────────────────────
  neutral: {
    50: '#F8FAFC',   // Almost White - شبه أبيض
    100: '#F1F5F9',  // Very Light - فاتح جداً
    200: '#E2E8F0',  // Light - فاتح
    300: '#CBD5E1',  // Medium Light - متوسط فاتح
    400: '#94A3B8',  // Medium - متوسط
    500: '#64748B',  // Base Gray - رمادي أساسي
    600: '#475569',  // Medium Dark - متوسط داكن
    700: '#334155',  // Dark - داكن
    800: '#1E293B',  // Very Dark - داكن جداً
    900: '#0F172A',  // Almost Black - شبه أسود
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ✏️ TYPOGRAPHY SYSTEM - نظام الطباعة
// 
// Font Stack: Martica (Bulgarian), Arial, Sans-serif
// Optimized for readability across Bulgarian and English content
// محسّن للقراءة عبر المحتوى البلغاري والإنجليزي
// ═══════════════════════════════════════════════════════════════════════════

export const typography = {
  // ─────────────────────────────────────────────────────────────────────────
  // Font Families - عائلات الخطوط
  // ─────────────────────────────────────────────────────────────────────────
  fontFamily: {
    base: "'Martica', 'Arial', sans-serif",      // Body Text - نص أساسي
    heading: "'Martica', 'Arial', sans-serif",   // Headings - عناوين
    mono: "'Courier New', 'Courier', monospace", // Code - أكواد
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Font Sizes - أحجام الخطوط
  // Type Scale: 1.200 (Major Third) - Perfect for UI
  // ─────────────────────────────────────────────────────────────────────────
  fontSize: {
    // Micro Text
    xs: '0.75rem',      // 12px - Captions, Legal
    sm: '0.875rem',     // 14px - Meta, Secondary
    
    // Body Sizes (WCAG AAA Optimized)
    base: '1rem',       // 16px - Default Body (prevents iOS zoom)
    md: '1.0625rem',    // 17px - Enhanced Readability
    lg: '1.125rem',     // 18px - Featured Text
    
    // Heading Sizes
    xl: '1.25rem',      // 20px - H5, Card Titles
    '2xl': '1.5rem',    // 24px - H4, Section Titles
    '3xl': '1.875rem',  // 30px - H3, Major Sections
    '4xl': '2.25rem',   // 36px - H2, Page Subtitles
    '5xl': '3rem',      // 48px - H1, Page Titles
    '6xl': '3.75rem',   // 60px - Hero Titles
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Font Weights - أوزان الخطوط
  // ─────────────────────────────────────────────────────────────────────────
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Line Heights - ارتفاع الأسطر
  // Optimized for comfortable reading
  // ─────────────────────────────────────────────────────────────────────────
  lineHeight: {
    tight: 1.2,      // Headings, Buttons
    snug: 1.375,     // Card Titles
    normal: 1.5,     // Body Text (WCAG Recommended)
    relaxed: 1.75,   // Long-form Content
    loose: 2,        // Extra Spacious
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Letter Spacing - تباعد الأحرف
  // ─────────────────────────────────────────────────────────────────────────
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 📏 SPACING SYSTEM - نظام المسافات
// 
// 8px Base Unit Grid (Industry Standard)
// Perfect for pixel-perfect layouts
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  xs: '0.25rem',   // 4px  - Tight spacing
  sm: '0.5rem',    // 8px  - Small spacing
  md: '1rem',      // 16px - Base spacing
  lg: '1.5rem',    // 24px - Large spacing
  xl: '2rem',      // 32px - Extra large
  '2xl': '3rem',   // 48px - Section spacing
  '3xl': '4rem',   // 64px - Major sections
  '4xl': '6rem',   // 96px - Hero spacing
  '5xl': '8rem',   // 128px - Extreme spacing
};

// ═══════════════════════════════════════════════════════════════════════════
// 📱 BREAKPOINTS - نقاط التحويل
// 
// Mobile-First Responsive Design
// ═══════════════════════════════════════════════════════════════════════════

export const breakpoints = {
  xs: '0px',       // Extra Small (Mobile Portrait)
  sm: '600px',     // Small (Mobile Landscape)
  md: '960px',     // Medium (Tablet)
  lg: '1280px',    // Large (Desktop)
  xl: '1920px',    // Extra Large (Wide Desktop)
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎭 SHADOWS - الظلال
// 
// Layered Shadow System (Material Design 3.0 inspired)
// Soft, natural shadows for depth perception
// ═══════════════════════════════════════════════════════════════════════════

export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
  base: '0 2px 8px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 30px rgba(0, 0, 0, 0.12)',
  xl: '0 20px 50px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 60px rgba(0, 0, 0, 0.2)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  
  // Specialized Shadows
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  button: '0 2px 6px rgba(255, 107, 53, 0.25)',
  hover: '0 4px 16px rgba(0, 0, 0, 0.12)',
  focus: '0 0 0 3px rgba(255, 107, 53, 0.3)',
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔘 BORDER RADIUS - نصف قطر الحدود
// 
// Rounded corners for modern, friendly UI
// ═══════════════════════════════════════════════════════════════════════════

export const borderRadius = {
  none: '0',
  sm: '0.5rem',     // 8px  - Buttons, Inputs
  base: '0.75rem',  // 12px - Cards
  md: '1rem',       // 16px - Containers
  lg: '1.25rem',    // 20px - Large Cards
  xl: '1.5rem',     // 24px - Hero Cards
  '2xl': '2rem',    // 32px - Modals
  '3xl': '3rem',    // 48px - Special Elements
  full: '9999px',   // Perfect Circle
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 COMPONENT PRESETS - إعدادات المكونات المسبقة
// 
// Ready-to-use component styles
// جاهزة للاستخدام
// ═══════════════════════════════════════════════════════════════════════════

export const componentPresets = {
  // ─────────────────────────────────────────────────────────────────────────
  // Button Styles
  // ─────────────────────────────────────────────────────────────────────────
  button: {
    // Primary Button (CTA)
    primary: {
      background: colorTokens.interactive.primary,
      color: colorTokens.content.inverse,
      borderRadius: borderRadius.sm,
      fontWeight: typography.fontWeight.bold,
      padding: `${spacing.sm} ${spacing.md}`,
      boxShadow: shadows.button,
      transition: 'all 0.2s ease-in-out',
      
      hover: {
        background: colorTokens.interactive.primaryHover,
        boxShadow: shadows.hover,
      },
      
      active: {
        background: colorTokens.interactive.primaryActive,
        boxShadow: shadows.sm,
      },
    },
    
    // Secondary Button
    secondary: {
      background: colorTokens.surface.card,
      color: colorTokens.content.primary,
      border: `2px solid ${colorTokens.border.medium}`,
      borderRadius: borderRadius.sm,
      fontWeight: typography.fontWeight.semibold,
      padding: `${spacing.sm} ${spacing.md}`,
      transition: 'all 0.2s ease-in-out',
      
      hover: {
        background: colorTokens.surface.hover,
        borderColor: colorTokens.border.dark,
      },
    },
    
    // Outline Button
    outline: {
      background: 'transparent',
      color: colorTokens.interactive.primary,
      border: `2px solid ${colorTokens.interactive.primary}`,
      borderRadius: borderRadius.sm,
      fontWeight: typography.fontWeight.semibold,
      padding: `${spacing.sm} ${spacing.md}`,
      transition: 'all 0.2s ease-in-out',
      
      hover: {
        background: colorTokens.brand.light,
        borderColor: colorTokens.interactive.primaryHover,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Input Styles
  // ─────────────────────────────────────────────────────────────────────────
  input: {
    default: {
      background: colorTokens.surface.card,
      color: colorTokens.content.primary,
      border: `1px solid ${colorTokens.border.default}`,
      borderRadius: borderRadius.sm,
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.base,
      transition: 'border-color 0.2s ease-in-out',
      
      focus: {
        borderColor: colorTokens.border.focus,
        boxShadow: shadows.focus,
        outline: 'none',
      },
      
      error: {
        borderColor: colorTokens.border.error,
        boxShadow: `0 0 0 3px ${colorTokens.feedback.error.light}`,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Card Styles
  // ─────────────────────────────────────────────────────────────────────────
  card: {
    default: {
      background: colorTokens.surface.card,
      border: `1px solid ${colorTokens.border.light}`,
      borderRadius: borderRadius.base,
      boxShadow: shadows.card,
      padding: spacing.lg,
      transition: 'box-shadow 0.2s ease-in-out',
      
      hover: {
        boxShadow: shadows.hover,
      },
    },
    
    elevated: {
      background: colorTokens.surface.elevated,
      border: 'none',
      borderRadius: borderRadius.md,
      boxShadow: shadows.md,
      padding: spacing.xl,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 THEME OBJECT - كائن الثيم الرئيسي
// 
// Main theme export for styled-components
// التصدير الرئيسي لـ styled-components
// ═══════════════════════════════════════════════════════════════════════════

export const theme: DefaultTheme = {
  colors: colorTokens,
  typography,
  spacing,
  breakpoints,
  shadows,
  borderRadius,
  components: componentPresets,
};

// ═══════════════════════════════════════════════════════════════════════════
// 📦 TYPE AUGMENTATION - توسيع الأنواع
// 
// TypeScript support for styled-components
// ═══════════════════════════════════════════════════════════════════════════

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof colorTokens;
    typography: typeof typography;
    spacing: typeof spacing;
    breakpoints: typeof breakpoints;
    shadows: typeof shadows;
    borderRadius: typeof borderRadius;
    components: typeof componentPresets;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📋 USAGE EXAMPLES - أمثلة الاستخدام
// ═══════════════════════════════════════════════════════════════════════════
/*

1️⃣ STYLED COMPONENTS USAGE:
────────────────────────────
import styled from 'styled-components';

const Button = styled.button`
  background: ${({ theme }) => theme.colors.interactive.primary};
  color: ${({ theme }) => theme.colors.content.inverse};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: ${({ theme }) => theme.shadows.button};
  
  &:hover {
    background: ${({ theme }) => theme.colors.interactive.primaryHover};
  }
`;


2️⃣ CSS VARIABLES COMPATIBILITY:
────────────────────────────────
// theme.v2.ts colors map to unified-theme.css variables:

colorTokens.interactive.primary    → var(--accent-primary)
colorTokens.surface.card           → var(--bg-card)
colorTokens.content.primary        → var(--text-primary)
colorTokens.border.default         → var(--border-primary)


3️⃣ MIGRATION PATH:
────────────────────
Old:  background: ${({ theme }) => theme.colors.primary.main};
New:  background: ${({ theme }) => theme.colors.interactive.primary};

Old:  color: ${({ theme }) => theme.colors.text.primary};
New:  color: ${({ theme }) => theme.colors.content.primary};

Old:  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
New:  border: 1px solid ${({ theme }) => theme.colors.border.default};


4️⃣ COMPONENT PRESETS:
────────────────────────
const StyledButton = styled.button(({ theme }) => ({
  ...theme.components.button.primary,
}));

*/

// ═══════════════════════════════════════════════════════════════════════════
// ✅ BENEFITS OF THIS SYSTEM:
// فوائد هذا النظام:
// 
// 1. Semantic Naming: Colors named by purpose, not appearance
//    تسمية دلالية: الألوان تُسمى حسب الغرض وليس المظهر
// 
// 2. Scalability: Easy to add new colors/variants without chaos
//    قابلية التوسع: سهولة إضافة ألوان جديدة بدون فوضى
// 
// 3. Consistency: Single source of truth for all design decisions
//    اتساق: مصدر واحد للحقيقة لجميع قرارات التصميم
// 
// 4. Maintainability: Changes in one place affect entire app
//    سهولة الصيانة: التغييرات في مكان واحد تؤثر على التطبيق بأكمله
// 
// 5. Type Safety: Full TypeScript support with autocomplete
//    أمان الأنواع: دعم كامل لـ TypeScript مع الإكمال التلقائي
// 
// 6. CSS Variables Compatible: Works alongside existing CSS vars
//    متوافق مع CSS Variables: يعمل جنباً إلى جنب مع المتغيرات الموجودة
// 
// 7. Human-Centric: Design tokens reflect real-world use cases
//    متمحور حول الإنسان: رموز التصميم تعكس حالات الاستخدام الواقعية
// ═══════════════════════════════════════════════════════════════════════════
