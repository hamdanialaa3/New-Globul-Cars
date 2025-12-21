// Accessibility Helpers
// مساعدات إمكانية الوصول

/**
 * Trap focus within a modal/dialog
 * حصر التركيز داخل نافذة منبثقة
 */
export const trapFocus = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Announce message to screen readers
 * إعلان رسالة لقارئات الشاشة
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if reduced motion is preferred
 * التحقق من تفضيل الحركة المخفضة
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get ARIA label for current language
 * الحصول على تسمية ARIA حسب اللغة
 */
export const getAriaLabel = (
  labels: { bg: string; en: string; ar?: string },
  language: 'bg' | 'en' | 'ar' = 'bg'
): string => {
  return labels[language] || labels.en;
};

/**
 * Generate unique ID for ARIA relationships
 * إنشاء معرّف فريد لعلاقات ARIA
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Skip to main content helper
 * مساعد للانتقال إلى المحتوى الرئيسي
 */
export const skipToMainContent = () => {
  const main = document.getElementById('main-content') || document.querySelector('main');
  if (main) {
    main.setAttribute('tabindex', '-1');
    main.focus();
  }
};

/**
 * Keyboard navigation helper
 * مساعد التنقل بلوحة المفاتيح
 */
export const handleArrowNavigation = (
  event: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onNavigate: (index: number) => void
) => {
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      newIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = items.length - 1;
      break;
    default:
      return;
  }
  
  onNavigate(newIndex);
  items[newIndex]?.focus();
};

/**
 * Check color contrast ratio
 * فحص نسبة تباين الألوان
 */
export const getContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (rgb: number[]): number => {
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const hexToRgb = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : [0, 0, 0];
  };
  
  const l1 = getLuminance(hexToRgb(foreground));
  const l2 = getLuminance(hexToRgb(background));
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Validate WCAG compliance
 * التحقق من الامتثال لـ WCAG
 */
export const isWCAGCompliant = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  fontSize: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return fontSize === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return fontSize === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
};

/**
 * Add screen reader only CSS class
 * إضافة فئة CSS لقارئات الشاشة فقط
 */
export const srOnlyStyles = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

/**
 * Focus visible utility
 * أداة التركيز المرئي
 */
export const addFocusVisiblePolyfill = () => {
  // Add focus-visible class when keyboard navigation is detected
  let hadKeyboardEvent = false;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      hadKeyboardEvent = true;
    }
  };
  
  const handleMouseDown = () => {
    hadKeyboardEvent = false;
  };
  
  const handleFocus = (e: FocusEvent) => {
    if (hadKeyboardEvent && e.target instanceof HTMLElement) {
      e.target.classList.add('focus-visible');
    }
  };
  
  const handleBlur = (e: FocusEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('focus-visible');
    }
  };
  
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('mousedown', handleMouseDown, true);
  document.addEventListener('focus', handleFocus, true);
  document.addEventListener('blur', handleBlur, true);
};

