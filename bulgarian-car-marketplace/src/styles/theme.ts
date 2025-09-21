// src/styles/theme.ts
// Bulgarian Theme Configuration for Car Marketplace

import { createGlobalStyle, DefaultTheme } from 'styled-components';

// Bulgarian Color Palette - نظام أزرق متدرج احترافي
export const bulgarianColors = {
  // الألوان الأساسية - نظام أزرق متدرج
  primary: {
    main: '#007BFF',        // أزرق أساسي احترافي
    light: '#4DA6FF',       // أزرق فاتح
    dark: '#0056CC',        // أزرق غامق
    contrastText: '#FFFFFF' // نص أبيض على الأزرق
  },
  secondary: {
    main: '#6C757D',        // أزرق رمادي
    light: '#ADB5BD',       // أزرق رمادي فاتح
    dark: '#495057',        // أزرق رمادي داكن
    contrastText: '#FFFFFF'
  },
  accent: {
    main: '#4169E1',        // أزرق ملكي (أزرق أحمر)
    light: '#6495ED',       // أزرق ملكي فاتح
    dark: '#1E3A8A',        // أزرق ملكي داكن
    contrastText: '#FFFFFF'
  },

  // ألوان إضافية للتحكم الدقيق - نظام أزرق متدرج
  blue: {
    pure: '#007BFF',        // أزرق نقي
    bright: '#00BFFF',      // أزرق لامع
    sky: '#87CEEB',         // أزرق سماوي
    dark: '#000080',        // أزرق بحري داكن
    light: '#ADD8E6',       // أزرق فاتح
    pale: '#E0F6FF',        // أزرق باهت
    powder: '#B0E0E6',      // أزرق بودرة
    steel: '#4682B4',       // أزرق فولاذي
    royal: '#4169E1',       // أزرق ملكي
    navy: '#000080',        // أزرق بحري
    midnight: '#191970',    // أزرق منتصف الليل
    dodger: '#1E90FF',      // أزرق دوجر
    cornflower: '#6495ED',  // أزرق قرنفل
    alice: '#F0F8FF',       // أزرق أليس
    cadet: '#5F9EA0',       // أزرق كاديت
    teal: '#008080',        // أزرق مخضر
    cyan: '#00FFFF',        // سماوي
    aqua: '#00FFFF',        // أكوا
    turquoise: '#40E0D0',   // تركواز
    aquamarine: '#7FFFD4',  // أكوامارين
    mediumBlue: '#0000CD',  // أزرق متوسط
    darkBlue: '#00008B',    // أزرق داكن
    deepSky: '#00BFFF',     // سماوي عميق
    lightSky: '#87CEFA',    // سماوي فاتح
    lightSteel: '#B0C4DE',  // فولاذي فاتح
    slate: '#708090',       // أزرق لوحي
    lightSlate: '#778899',  // لوحي فاتح
    darkSlate: '#2F4F4F'    // لوحي داكن
  },

  // ألوان محايدة - نظام أزرق رمادي
  grey: {
    50: '#F8FAFC',   // أزرق رمادي فاتح جداً
    100: '#F1F5F9',  // أزرق رمادي فاتح
    200: '#E2E8F0',  // أزرق رمادي متوسط فاتح
    300: '#CBD5E1',  // أزرق رمادي متوسط
    400: '#94A3B8',  // أزرق رمادي متوسط داكن
    500: '#64748B',  // أزرق رمادي داكن
    600: '#475569',  // أزرق رمادي أكثر ظلاماً
    700: '#334155',  // أزرق رمادي داكن جداً
    800: '#1E293B',  // أزرق رمادي مظلم
    900: '#0F172A'   // أزرق رمادي أسود تقريباً
  },

  // ألوان الحالة - نظام أزرق
  success: {
    main: '#20B2AA',    // أزرق مخضر
    light: '#7FFFD4',   // أكوامارين
    dark: '#008080',    // أزرق مخضر داكن
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#00CED1',    // تركواز (أزرق أصفر)
    light: '#40E0D0',   // تركواز فاتح
    dark: '#008B8B',    // تركواز داكن
    contrastText: '#000000'
  },
  error: {
    main: '#DC143C',    // قرمزي (أحمر مع لمسة زرقاء)
    light: '#FF6347',   // طماطم
    dark: '#8B0000',    // أحمر داكن
    contrastText: '#FFFFFF'
  },
  info: {
    main: '#1E90FF',    // أزرق دوجر
    light: '#87CEFA',   // سماوي فاتح
    dark: '#0000CD',    // أزرق متوسط
    contrastText: '#FFFFFF'
  },

  // ألوان الخلفية - نظام أزرق احترافي
  background: {
    default: '#F8FAFC',     // أزرق رمادي فاتح جداً
    paper: '#FFFFFF',       // أبيض نقي
    dark: '#0F172A',        // أزرق رمادي داكن
    semiDark: 'rgba(15, 23, 42, 0.85)', // أزرق رمادي شبه داكن
    lightOverlay: 'rgba(248, 250, 252, 0.95)', // تراكب أزرق فاتح
    darkOverlay: 'rgba(15, 23, 42, 0.7)' // تراكب أزرق داكن
  },

  // ألوان النصوص - مع تباين مثالي للقراءة
  text: {
    primary: '#0F172A',     // أزرق رمادي داكن جداً (على خلفيات فاتحة)
    secondary: '#475569',   // أزرق رمادي متوسط (على خلفيات فاتحة)
    onDark: '#F8FAFC',      // أزرق رمادي فاتح (على خلفيات داكنة)
    onLight: '#0F172A',     // أزرق رمادي داكن (على خلفيات فاتحة)
    disabled: '#94A3B8',    // أزرق رمادي متوسط داكن
    hint: '#CBD5E1'         // أزرق رمادي فاتح
  }
};

// Bulgarian Typography
export const bulgarianTypography = {
  fontFamily: {
    primary: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    secondary: "'Open Sans', 'Helvetica', 'Arial', sans-serif",
    accent: "'Montserrat', 'Helvetica', 'Arial', sans-serif"
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem'  // 60px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  }
};

// Bulgarian Spacing Scale
export const bulgarianSpacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem'    // 128px
};

// Bulgarian Breakpoints
export const bulgarianBreakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px'
};

// Bulgarian Shadows - نظام أزرق متدرج
export const bulgarianShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 123, 255, 0.05)',
  base: '0 1px 3px 0 rgba(0, 123, 255, 0.1), 0 1px 2px 0 rgba(0, 123, 255, 0.06)',
  md: '0 4px 6px -1px rgba(0, 123, 255, 0.1), 0 2px 4px -1px rgba(0, 123, 255, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 123, 255, 0.1), 0 4px 6px -2px rgba(0, 123, 255, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 123, 255, 0.1), 0 10px 10px -5px rgba(0, 123, 255, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 123, 255, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 123, 255, 0.06)',
  outline: '0 0 0 3px rgba(0, 123, 255, 0.5)'
};

// Bulgarian Border Radius
export const bulgarianBorderRadius = {
  none: '0',
  sm: '0.5rem',     // 8px (زيادة من 2px)
  base: '0.75rem',  // 12px (زيادة من 4px)
  md: '1rem',       // 16px (زيادة من 6px)
  lg: '1.25rem',    // 20px (زيادة من 8px)
  xl: '1.5rem',     // 24px (زيادة من 12px)
  '2xl': '2rem',    // 32px (زيادة من 16px)
  '3xl': '3rem',    // 48px (زيادة من 24px)
  full: '9999px'
};

// Bulgarian Theme
export const bulgarianTheme: DefaultTheme = {
  colors: bulgarianColors,
  typography: bulgarianTypography,
  spacing: bulgarianSpacing,
  breakpoints: bulgarianBreakpoints,
  shadows: bulgarianShadows,
  borderRadius: bulgarianBorderRadius,

  // Component specific styles
  components: {
    button: {
      borderRadius: bulgarianBorderRadius.base,
      fontWeight: bulgarianTypography.fontWeight.medium,
      transition: 'all 0.2s ease-in-out',
      backgroundColor: bulgarianColors.primary.main,
      color: bulgarianColors.primary.contrastText,
      border: `2px solid ${bulgarianColors.primary.main}`,
      '&:hover': {
        backgroundColor: bulgarianColors.primary.dark,
        borderColor: bulgarianColors.primary.dark
      }
    },
    input: {
      borderRadius: bulgarianBorderRadius.base,
      border: `2px solid ${bulgarianColors.primary.main}`,
      padding: `${bulgarianSpacing.sm} ${bulgarianSpacing.md}`,
      fontSize: bulgarianTypography.fontSize.base,
      backgroundColor: bulgarianColors.background.paper,
      color: bulgarianColors.text.primary,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:focus': {
        borderColor: bulgarianColors.secondary.main,
        boxShadow: `0 0 0 3px rgba(0, 123, 255, 0.3)`
      }
    },
    card: {
      borderRadius: bulgarianBorderRadius.lg,
      boxShadow: bulgarianShadows.base,
      border: `2px solid ${bulgarianColors.primary.main}`,
      backgroundColor: bulgarianColors.background.paper,
      color: bulgarianColors.text.primary
    }
  }
};

// Global Styles - تبسيط لسهولة التحكم
export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: ${bulgarianTypography.lineHeight.normal};
  }

  body {
    font-family: ${bulgarianTypography.fontFamily.primary};
    color: ${bulgarianColors.text.primary};
    background-color: ${bulgarianColors.background.default};
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }



  h1, h2, h3, h4, h5, h6 {
    font-family: ${bulgarianTypography.fontFamily.accent};
    font-weight: ${bulgarianTypography.fontWeight.bold};
    line-height: ${bulgarianTypography.lineHeight.tight};
    margin-bottom: ${bulgarianSpacing.md};
    color: ${bulgarianColors.text.primary};
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
    color: ${bulgarianColors.text.primary};
  }

  a {
    color: ${bulgarianColors.primary.dark};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    font-weight: ${bulgarianTypography.fontWeight.medium};

    &:hover {
      color: ${bulgarianColors.secondary.main};
      text-decoration: underline;
    }
  }

  /* تبسيط الأزرار */
  button {
    font-family: inherit;
    border: 2px solid ${bulgarianColors.primary.main};
    cursor: pointer;
    font-weight: ${bulgarianTypography.fontWeight.medium};
    padding: ${bulgarianSpacing.sm} ${bulgarianSpacing.md};
    border-radius: ${bulgarianBorderRadius.md};
    transition: all 0.2s ease-in-out;
    background: ${bulgarianColors.primary.main};
    color: ${bulgarianColors.primary.contrastText};

    &:hover {
      background: ${bulgarianColors.primary.dark};
      border-color: ${bulgarianColors.primary.dark};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
    }
  }

  /* تبسيط البطاقات */
  .card, .container, .paper {
    background: ${bulgarianColors.background.paper};
    border: 1px solid ${bulgarianColors.grey[200]};
    border-radius: ${bulgarianBorderRadius.lg};
    box-shadow: ${bulgarianShadows.sm};
    padding: ${bulgarianSpacing.lg};
    margin-bottom: ${bulgarianSpacing.lg};
    color: ${bulgarianColors.text.primary};
  }

  /* تبسيط حقول الإدخال */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    padding: ${bulgarianSpacing.sm};
    border: 1px solid ${bulgarianColors.grey[300]};
    border-radius: ${bulgarianBorderRadius.md};
    background: ${bulgarianColors.background.paper};
    color: ${bulgarianColors.text.primary};
    transition: border-color 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: ${bulgarianColors.primary.main};
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
  }

  /* تبسيط الروابط في التنقل */
  nav a, .nav-link {
    color: ${bulgarianColors.text.primary};
    text-decoration: none;
    padding: ${bulgarianSpacing.sm} ${bulgarianSpacing.md};
    border-radius: ${bulgarianBorderRadius.md};
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: ${bulgarianColors.grey[100]};
    }
  }

  /* تبسيط الهيدر والفوتر */
  header, .header {
    background: ${bulgarianColors.background.paper};
    border-bottom: 1px solid ${bulgarianColors.grey[200]};
    box-shadow: ${bulgarianShadows.sm};
    padding: ${bulgarianSpacing.md} ${bulgarianSpacing.lg};
    color: ${bulgarianColors.text.primary};
  }

  footer, .footer {
    background: ${bulgarianColors.grey[50]};
    border-top: 1px solid ${bulgarianColors.grey[200]};
    padding: ${bulgarianSpacing.lg};
    color: ${bulgarianColors.text.primary};
  }

  /* Specific card variants */
  .card-primary {
    border-color: ${bulgarianColors.primary.main};
    background-color: rgba(240, 248, 252, 0.98) !important;
  }

  .card-secondary {
    border-color: ${bulgarianColors.secondary.main};
    background-color: rgba(241, 245, 249, 0.98) !important;
  }

  /* Modal and overlay styles */
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

  /* Header specific styles */
  header {
    background-color: rgba(9, 9, 9, 0.95) !important;
    backdrop-filter: blur(10px);
    border-bottom: 3px solid ${bulgarianColors.primary.dark};
    box-shadow: ${bulgarianShadows.md};
    position: relative;
    z-index: 1000;
  }

  header * {
    color: ${bulgarianColors.primary.contrastText} !important;
  }

  header a {
    color: ${bulgarianColors.primary.contrastText} !important;
    font-weight: ${bulgarianTypography.fontWeight.bold};

    &:hover {
      color: ${bulgarianColors.secondary.main} !important;
    }
  }

  /* Footer specific styles */
  footer {
    background-color: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: blur(10px);
    border-top: 3px solid ${bulgarianColors.primary.main};
    box-shadow: ${bulgarianShadows.md};
    color: ${bulgarianColors.text.onDark} !important;
    margin-top: auto;
  }

  footer *,
  footer a {
    color: ${bulgarianColors.primary.contrastText} !important;
  }

  footer a:hover {
    color: ${bulgarianColors.secondary.light} !important;
  }

  /* Navigation styles */
  nav, .navbar, .menu {
    background-color: rgba(6, 6, 5, 0.95) !important;
    backdrop-filter: blur(10px);
    border-bottom: 2px solid ${bulgarianColors.primary.dark};
  }

  nav a, .navbar a, .menu a {
    color: ${bulgarianColors.primary.contrastText} !important;
    font-weight: ${bulgarianTypography.fontWeight.medium};

    &:hover {
      color: ${bulgarianColors.secondary.main} !important;
      background-color: rgba(0, 123, 255, 0.2);
    }
  }

  /* Dropdown menus */
  .dropdown, .dropdown-menu {
    background-color: rgba(248, 250, 252, 0.98) !important;
    backdrop-filter: blur(10px);
    border: 2px solid ${bulgarianColors.primary.main};
    box-shadow: ${bulgarianShadows.lg};
  }

  .dropdown a, .dropdown-menu a {
    color: ${bulgarianColors.text.primary} !important;

    &:hover {
      background-color: ${bulgarianColors.primary.light};
      color: ${bulgarianColors.primary.contrastText} !important;
    }
  }

  /* Form elements with blue theme */
  input, textarea, select {
    background-color: rgba(248, 250, 252, 0.9) !important;
    border: 2px solid ${bulgarianColors.primary.main};
    color: ${bulgarianColors.text.primary};
    font-size: ${bulgarianTypography.fontSize.base};
    padding: ${bulgarianSpacing.sm} ${bulgarianSpacing.md};
    border-radius: ${bulgarianBorderRadius.base};
    transition: all 0.2s ease-in-out;

    &:focus {
      border-color: ${bulgarianColors.secondary.main};
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
      outline: none;
    }

    &::placeholder {
      color: ${bulgarianColors.text.hint};
    }
  }

  /* Labels */
  label {
    color: ${bulgarianColors.text.primary};
    font-weight: ${bulgarianTypography.fontWeight.medium};
    margin-bottom: ${bulgarianSpacing.xs};
    display: block;
  }

  /* Checkboxes and radio buttons */
  input[type="checkbox"], input[type="radio"] {
    accent-color: ${bulgarianColors.primary.main};
  }

  /* Links with better contrast */
  a {
    color: ${bulgarianColors.primary.dark};
    text-decoration: none;
    font-weight: ${bulgarianTypography.fontWeight.medium};
    transition: all 0.2s ease-in-out;
    position: relative;

    &:hover {
      color: ${bulgarianColors.secondary.main};
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid ${bulgarianColors.primary.main};
      outline-offset: 2px;
    }
  }

  /* Alert and notification styles */
  .alert, .notification, .message {
    border-radius: ${bulgarianBorderRadius.base};
    padding: ${bulgarianSpacing.md};
    margin-bottom: ${bulgarianSpacing.md};
    font-weight: ${bulgarianTypography.fontWeight.medium};
  }

  .alert-success {
    background-color: rgba(154, 205, 50, 0.9);
    border: 2px solid ${bulgarianColors.success.main};
    color: ${bulgarianColors.success.contrastText};
  }

  .alert-warning {
    background-color: rgba(0, 0, 0, 0.9);
    border: 2px solid ${bulgarianColors.warning.main};
    color: ${bulgarianColors.warning.contrastText};
  }

  .alert-error {
    background-color: rgba(220, 20, 60, 0.9);
    border: 2px solid ${bulgarianColors.error.main};
    color: ${bulgarianColors.error.contrastText};
  }

  .alert-info {
    background-color: rgba(0, 206, 209, 0.9);
    border: 2px solid ${bulgarianColors.info.main};
    color: ${bulgarianColors.info.contrastText};
  }

  /* Loading and progress indicators */
  .loading-spinner {
    border: 3px solid ${bulgarianColors.grey[300]};
    border-top: 3px solid ${bulgarianColors.primary.main};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Badge and tag styles */
  .badge, .tag {
    background-color: ${bulgarianColors.primary.main};
    color: ${bulgarianColors.primary.contrastText};
    padding: ${bulgarianSpacing.xs} ${bulgarianSpacing.sm};
    border-radius: ${bulgarianBorderRadius.sm};
    font-size: ${bulgarianTypography.fontSize.sm};
    font-weight: ${bulgarianTypography.fontWeight.medium};
  }

  .badge-secondary {
    background-color: ${bulgarianColors.secondary.main};
    color: ${bulgarianColors.secondary.contrastText};
  }

  /* Responsive utilities */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${bulgarianSpacing.md};
  }

  @media (min-width: ${bulgarianBreakpoints.sm}) {
    .container {
      padding: 0 ${bulgarianSpacing.lg};
    }
  }

  @media (min-width: ${bulgarianBreakpoints.md}) {
    .container {
      padding: 0 ${bulgarianSpacing.xl};
    }
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Focus styles with yellow theme */
  *:focus {
    outline: 2px solid ${bulgarianColors.primary.main};
    outline-offset: 2px;
  }

  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid ${bulgarianColors.secondary.main};
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
  }

  /* Print styles */
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
`;

// Type augmentation for styled-components
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof bulgarianColors;
    typography: typeof bulgarianTypography;
    spacing: typeof bulgarianSpacing;
    breakpoints: typeof bulgarianBreakpoints;
    shadows: typeof bulgarianShadows;
    borderRadius: typeof bulgarianBorderRadius;
    components: {
      button: any;
      input: any;
      card: any;
    };
  }
}