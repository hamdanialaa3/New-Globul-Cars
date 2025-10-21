// src/styles/theme.ts
// Bulgarian Theme Configuration for Car Marketplace

import { createGlobalStyle, DefaultTheme } from 'styled-components';

// Bulgarian Color Palette - ???? ????? mobile.de ?????? ?? ??????? ????????
export const bulgarianColors = {
  // (Comment removed - was in Arabic)
  primary: {
    main: '#003366',        // أزرق داكن للهيدر (mobile.de style)
    light: '#0066CC',       // أزرق فاتح للروابط
    dark: '#002244',        // أزرق أغمق
    contrastText: '#FFFFFF' // نص أبيض على الأزرق
  },
  secondary: {
    main: '#CC0000',        // أحمر للأزرار الرئيسية (mobile.de style)
    light: '#FF3333',       // أحمر فاتح
    dark: '#990000',        // أحمر داكن
    contrastText: '#FFFFFF'
  },
  accent: {
    main: '#0066CC',        // أزرق للروابط والتأكيدات
    light: '#3399FF',       // أزرق أفتح
    dark: '#004499',        // أزرق أغمق
    contrastText: '#FFFFFF'
  },

  // (Comment removed - was in Arabic)
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

  // (Comment removed - was in Arabic)
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

  // (Comment removed - was in Arabic)
  success: {
    main: '#28A745',    // أخضر للنجاح
    light: '#51CF66',   // أخضر فاتح
    dark: '#1E7E34',    // أخضر داكن
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#FFC107',    // أصفر للتحذير
    light: '#FFCA2C',   // أصفر فاتح
    dark: '#D39E00',    // أصفر داكن
    contrastText: '#000000'
  },
  error: {
    main: '#CC0000',    // أحمر للخطأ (mobile.de style)
    light: '#FF3333',   // أحمر فاتح
    dark: '#990000',    // أحمر داكن
    contrastText: '#FFFFFF'
  },
  info: {
    main: '#0066CC',    // أزرق للمعلومات
    light: '#3399FF',   // أزرق فاتح
    dark: '#004499',    // أزرق داكن
    contrastText: '#FFFFFF'
  },

  // (Comment removed - was in Arabic)
  background: {
    default: '#FFFFFF',     // أبيض نقي (mobile.de style)
    paper: '#F8F9FA',       // رمادي فاتح جداً للبطاقات
    dark: '#F5F5F5',        // رمادي فاتح للعناصر الثانوية
    semiDark: 'rgba(0, 51, 102, 0.85)', // أزرق داكن شبه شفاف
    lightOverlay: 'rgba(255, 255, 255, 0.95)', // تراكب أبيض
    darkOverlay: 'rgba(0, 51, 102, 0.7)' // تراكب أزرق داكن
  },

  // (Comment removed - was in Arabic)
  text: {
    primary: '#333333',     // رمادي داكن (mobile.de style)
    secondary: '#666666',   // رمادي متوسط
    onDark: '#FFFFFF',      // أبيض على الخلفيات الداكنة
    onLight: '#333333',     // رمادي داكن على الخلفيات الفاتحة
    disabled: '#999999',    // رمادي فاتح للعناصر المعطلة
    hint: '#CCCCCC'         // رمادي باهت للتلميحات
  }
};

// Bulgarian Typography - ???? mobile.de (????? ????????)
export const bulgarianTypography = {
  fontFamily: {
    primary: "'Martica', 'Arial', sans-serif",
    secondary: "'Martica', 'Arial', sans-serif",
    accent: "'Martica', 'Arial', sans-serif"
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

// Bulgarian Shadows - ???? ???? ?????
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

  // Component specific styles - ?????? mobile.de
  components: {
    button: {
      borderRadius: bulgarianBorderRadius.sm,  // حواف أقل دائرية (mobile.de style)
      fontWeight: bulgarianTypography.fontWeight.bold,
      transition: 'all 0.2s ease-in-out',
      backgroundColor: bulgarianColors.secondary.main,  // أحمر للأزرار الرئيسية
      color: bulgarianColors.secondary.contrastText,
      border: `2px solid ${bulgarianColors.secondary.main}`,
      '&:hover': {
        backgroundColor: bulgarianColors.secondary.dark,
        borderColor: bulgarianColors.secondary.dark
      }
    },
    input: {
      borderRadius: bulgarianBorderRadius.sm,  // حواف بسيطة
      border: `1px solid #CCCCCC`,  // حدود رمادية (mobile.de style)
      padding: `${bulgarianSpacing.sm} ${bulgarianSpacing.md}`,
      fontSize: bulgarianTypography.fontSize.base,
      backgroundColor: bulgarianColors.background.paper,
      color: bulgarianColors.text.primary,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:focus': {
        borderColor: bulgarianColors.primary.main,
        boxShadow: `0 0 0 2px rgba(0, 102, 204, 0.2)`  // ظل أزرق فاتح
      }
    },
    card: {
      borderRadius: bulgarianBorderRadius.sm,  // حواف بسيطة
      boxShadow: bulgarianShadows.sm,  // ظل بسيط
      border: `1px solid #E0E0E0`,  // حدود رمادية فاتحة
      backgroundColor: bulgarianColors.background.paper,
      color: bulgarianColors.text.primary
    }
  }
};

// Global Styles - ????? ?????? ??????
export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.cdnfonts.com/css/martica');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Martica', 'Arial', sans-serif;
  }

  html {
    font-size: 16px;
    line-height: ${bulgarianTypography.lineHeight.normal};
  }

  body {
    font-family: 'Martica', 'Arial', sans-serif;
    color: ${bulgarianColors.text.primary};
    background-color: ${bulgarianColors.background.default};  // أبيض (mobile.de style)
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }



  h1, h2, h3, h4, h5, h6 {
    font-family: 'Martica', 'Arial', sans-serif;
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
    font-family: 'Martica', 'Arial', sans-serif;

    &:hover {
      color: ${bulgarianColors.secondary.main};
      text-decoration: underline;
    }
  }

  li, ul, ol, label, input, select, textarea, button, small, strong, em, span, div {
    font-family: 'Martica', 'Arial', sans-serif;
  }

  .leaflet-tooltip {
    font-family: 'Martica', 'Arial', sans-serif !important;
  }

  /* (Comment removed - was in Arabic)
  button {
    font-family: inherit;
    border: 1px solid ${bulgarianColors.secondary.main};  // حدود حمراء
    cursor: pointer;
    font-weight: ${bulgarianTypography.fontWeight.bold};
    padding: ${bulgarianSpacing.sm} ${bulgarianSpacing.md};
    border-radius: ${bulgarianBorderRadius.sm};  // حواف بسيطة
    transition: all 0.2s ease-in-out;
    background: ${bulgarianColors.secondary.main};  // خلفية حمراء
    color: ${bulgarianColors.secondary.contrastText};

    &:hover {
      background: ${bulgarianColors.secondary.dark};  // أحمر أغمق عند التمرير
      border-color: ${bulgarianColors.secondary.dark};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(204, 0, 0, 0.3);  // ظل أحمر
    }
  }

  /* (Comment removed - was in Arabic)
  .card, .container, .paper {
    background: ${bulgarianColors.background.paper};
    border: 1px solid #E0E0E0;  // حدود رمادية فاتحة
    border-radius: ${bulgarianBorderRadius.sm};  // حواف بسيطة
    box-shadow: ${bulgarianShadows.sm};  // ظل بسيط
    padding: ${bulgarianSpacing.lg};
    margin-bottom: ${bulgarianSpacing.lg};
    color: ${bulgarianColors.text.primary};
  }

  /* (Comment removed - was in Arabic)
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

  /* (Comment removed - was in Arabic)
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

  /* (Comment removed - was in Arabic)
  header, .header {
    background: ${bulgarianColors.primary.main};  // أزرق داكن للهيدر
    border-bottom: 1px solid ${bulgarianColors.primary.dark};
    box-shadow: ${bulgarianShadows.sm};
    padding: ${bulgarianSpacing.md} ${bulgarianSpacing.lg};
    color: ${bulgarianColors.primary.contrastText};  // نص أبيض
  }

  footer, .footer {
    background: ${bulgarianColors.background.paper};  // أبيض للفوتر
    border-top: 1px solid #E0E0E0;
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

  /* Container styles for mobile.de-like layout */
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    width: 100%;
    box-sizing: border-box;
  }

  /* Responsive container adjustments */
  @media (max-width: 768px) {
    .page-container {
      padding: 0 0.5rem;
      max-width: 100%;
    }
  }

  @media (max-width: 480px) {
    .page-container {
      padding: 0 0.25rem;
    }
  }

  /* Main content area styling */
  main {
    background: ${bulgarianColors.background.default};
    flex: 1;
  }

  /* Ensure header and footer take full width */
  header, footer {
    width: 100%;
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

  /* (?? ????? ??????? ???????? ????? ??????? ????? ????? ????? mobile.de) */

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