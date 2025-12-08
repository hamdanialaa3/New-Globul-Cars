/**
 * Subscription Theme Configuration
 * 🎨 ملف إعدادات الألوان والتصميم لصفحة الاشتراكات
 * 
 * ✅ الحل: استخدام CSS Variables بدلاً من القيم المباشرة
 * هذا يضمن أن الألوان تتغير مع نظام Theme (الداكن/الفاتح)
 * 
 * لتغيير الألوان بسهولة، عدّل القيم في هذا الملف فقط!
 * 
 * ⚠️ مهم: بعد تغيير الألوان، أعد تحميل الصفحة (F5) أو أعد تشغيل Dev Server
 */

// ==================== PRIMARY COLORS ====================
// ✅ عدّل هذه القيم لتغيير جميع الألوان
// 🔴 تجريب: تم التغيير إلى الأخضر
export const subscriptionTheme = {
  // ✅ الألوان الأساسية - عدّل هنا لتغيير جميع الألوان
  // 🔴 تجريب: تم التغيير إلى الأخضر
  primary: {
    main: '#16a34a',      // الأخضر الرئيسي (كان:rgb(74, 12, 139))
    light: '#22c55e',     // الأخضر الفاتح (كان:rgb(60, 89, 251))
    dark: '#15803d',      // الأخضر الداكن (كان:rgb(0, 179, 229))
    gradient: 'linear-gradient(135deg,rgb(76, 22, 163) 0%,rgb(34, 37, 197) 100%)',
    gradientWithMiddle: 'linear-gradient(135deg,rgb(11, 3, 236) 0%,rgb(50, 34, 197) 50%,rgb(22, 48, 163) 100%)',
  },

  // ✅ الألوان الثانوية
  secondary: {
    main: '#16a34a',      // الأخضر
    light: '#22c55e',     // الأخضر الفاتح
    dark: '#15803d',      // الأخضر الداكن
  },

  // ✅ ألوان الظلال
  // 🔴 تجريب: تم التغيير إلى الأخضر
  shadows: {
    small: 'rgba(22, 163, 74, 0.35)',
    medium: 'rgba(22, 163, 74, 0.45)',
    large: 'rgba(22, 163, 74, 0.5)',
    hover: 'rgba(22, 163, 74, 0.6)',
  },

  // ✅ ألوان الحدود
  // 🔴 تجريب: تم التغيير إلى الأخضر
  borders: {
    primary: 'rgba(255, 255, 255, 0.3)',
    secondary: 'rgba(22, 163, 74, 0.2)',
    highlight: '#16a34a',
  },

  // ✅ ألوان الخلفيات
  // 🔴 تجريب: تم التغيير إلى الأخضر
  backgrounds: {
    overlay: 'rgba(22, 163, 74, 0.1)',
    hover: 'rgba(22, 163, 74, 0.08)',
    active: 'rgba(22, 163, 74, 0.05)',
  },
} as const;

// ==================== HELPER FUNCTIONS ====================
// ✅ هذه الدوال تقرأ القيم مباشرة من subscriptionTheme في كل مرة

/**
 * Get primary gradient - يقرأ القيمة مباشرة
 */
export function getPrimaryGradient(): string {
  return subscriptionTheme.primary.gradient;
}

/**
 * Get primary gradient with middle color - يقرأ القيمة مباشرة
 */
export function getPrimaryGradientWithMiddle(): string {
  return subscriptionTheme.primary.gradientWithMiddle;
}

/**
 * Get shadow color with opacity - يقرأ القيمة مباشرة
 */
export function getShadowColor(opacity: number = 0.35): string {
  // 🔴 تجريب: تم التغيير إلى الأخضر
  return `rgba(22, 163, 74, ${opacity})`;
}

/**
 * Get border color - يقرأ القيمة مباشرة
 */
export function getBorderColor(type: 'primary' | 'secondary' | 'highlight' = 'primary'): string {
  return subscriptionTheme.borders[type];
}

// ==================== IMPORTANT NOTE ====================
/**
 * ⚠️ ملاحظة مهمة:
 * 
 * إذا كانت الألوان لا تتغير، قد يكون السبب:
 * 1. CSS Variables في unified-theme.css تتجاوز الألوان
 * 2. ProfileTypeContext يحدد الألوان حسب نوع البروفايل
 * 3. styled-components لا يعيد التقييم تلقائياً
 * 
 * الحل:
 * - أعد تحميل الصفحة بعد تغيير الألوان (F5)
 * - أو أعد تشغيل Dev Server
 */

// ==================== EXPORT ====================
export default subscriptionTheme;
