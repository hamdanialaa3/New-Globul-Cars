/**
 * Glassmorphism Button Styles
 * أنماط الأزرار الزجاجية - تصميم عصري من الخيال العلمي
 * 
 * يطبق تصميم زجاجي بدون حدود على جميع الأزرار في التطبيق
 * Applied to all buttons throughout the application
 */

import { css } from 'styled-components';

/**
 * Base Glassmorphism Effect
 * التأثير الزجاجي الأساسي
 */
export const glassmorphismBase = css`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

/**
 * Primary Glass Button
 * الزر الزجاجي الأساسي - برتقالي
 */
export const glassPrimaryButton = css`
  ${glassmorphismBase}
    background: linear-gradient(
      135deg,
      rgba(255, 143, 16, 0.3) 0%,
      rgba(255, 143, 16, 0.15) 100%
    );
  
    /* Smart color system - نظام ألوان ذكي */
    color: #1a1a1a; /* Dark text for light mode */
  
    /* Dark mode - وضع ليلي */
    html[data-theme="dark"] & {
      color: #ffffff;
    }
  
    border: 1px solid rgba(255, 143, 16, 0.3);
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Glow effect / تأثير التوهج */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 143, 16, 0.5) 0%,
      rgba(255, 143, 16, 0.25) 100%
    );
    border-color: rgba(255, 143, 16, 0.5);
    box-shadow: 
      0 8px 32px 0 rgba(255, 143, 16, 0.4),
      0 0 20px rgba(255, 143, 16, 0.3);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 16px 0 rgba(255, 143, 16, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Secondary Glass Button
 * الزر الزجاجي الثانوي - أخضر
 */
export const glassSecondaryButton = css`
  ${glassmorphismBase}
    background: linear-gradient(
      135deg,
      rgba(22, 163, 74, 0.3) 0%,
      rgba(22, 163, 74, 0.15) 100%
    );
  
    /* Smart color system - نظام ألوان ذكي */
    color: #1a1a1a; /* Dark text for light mode */
  
    /* Dark mode - وضع ليلي */
    html[data-theme="dark"] & {
      color: #ffffff;
    }
  
    border: 1px solid rgba(22, 163, 74, 0.3);
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(
      135deg,
      rgba(22, 163, 74, 0.5) 0%,
      rgba(22, 163, 74, 0.25) 100%
    );
    border-color: rgba(22, 163, 74, 0.5);
    box-shadow: 
      0 8px 32px 0 rgba(22, 163, 74, 0.4),
      0 0 20px rgba(22, 163, 74, 0.3);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 16px 0 rgba(22, 163, 74, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Tertiary Glass Button (Blue)
 * الزر الزجاجي الثالثي - أزرق
 */
export const glassTertiaryButton = css`
  ${glassmorphismBase}
    background: linear-gradient(
      135deg,
      rgba(29, 78, 216, 0.3) 0%,
      rgba(29, 78, 216, 0.15) 100%
    );
  
    /* Smart color system - نظام ألوان ذكي */
    color: #1a1a1a; /* Dark text for light mode */
  
    /* Dark mode - وضع ليلي */
    html[data-theme="dark"] & {
      color: #ffffff;
    }
  
    border: 1px solid rgba(29, 78, 216, 0.3);
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(
      135deg,
      rgba(29, 78, 216, 0.5) 0%,
      rgba(29, 78, 216, 0.25) 100%
    );
    border-color: rgba(29, 78, 216, 0.5);
    box-shadow: 
      0 8px 32px 0 rgba(29, 78, 216, 0.4),
      0 0 20px rgba(29, 78, 216, 0.3);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 16px 0 rgba(29, 78, 216, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Neutral Glass Button (White/Gray)
 * الزر الزجاجي المحايد - أبيض/رمادي
 */
export const glassNeutralButton = css`
  ${glassmorphismBase}
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
  
    /* Smart color system - نظام ألوان ذكي */
    color: #1a1a1a; /* Dark text for light mode */
  
    /* Dark mode - وضع ليلي */
    html[data-theme="dark"] & {
      color: #ffffff;
    }
  
    border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.15) 100%
    );
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 
      0 8px 32px 0 rgba(255, 255, 255, 0.2),
      0 0 20px rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 16px 0 rgba(255, 255, 255, 0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Small Glass Button
 * زر زجاجي صغير
 */
export const glassSmallButton = css`
  ${glassmorphismBase}
    background: rgba(255, 255, 255, 0.15);
  
    /* Smart color system - نظام ألوان ذكي */
    color: #1a1a1a; /* Dark text for light mode */
  
    /* Dark mode - وضع ليلي */
    html[data-theme="dark"] & {
      color: #ffffff;
    }
  
    border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 4px 16px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/**
 * Icon Glass Button (Circular)
 * زر أيقونة زجاجي (دائري)
 */
export const glassIconButton = css`
  ${glassmorphismBase}
    background: rgba(255, 255, 255, 0.15);
  
    /* Smart color system - نظام ألوان ذكي */
    color: #1a1a1a; /* Dark text for light mode */
  
    /* Dark mode - وضع ليلي */
    html[data-theme="dark"] & {
      color: #ffffff;
    }
  
    border: 1px solid rgba(255, 255, 255, 0.2);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 4px 16px 0 rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

/**
 * Link Glass Button (Text button with glass effect)
 * زر رابط زجاجي
 */
export const glassLinkButton = css`
  background: transparent;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  
  /* Smart color system - نظام ألوان ذكي */
  color: #1a1a1a; /* Dark text for light mode */
  
  /* Dark mode - وضع ليلي */
  html[data-theme="dark"] & {
    color: #ffffff;
  }
  
  border: 1px solid transparent;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 8px 0 rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.05);
  }
`;

/**
 * Card Glass Button (For use in cards)
 * زر بطاقة زجاجي
 */
export const glassCardButton = css`
  ${glassmorphismBase}
    background: rgba(255, 255, 255, 0.08);
  
    /* Smart color system - نظام ألوان ذكي */
    color: #1a1a1a; /* Dark text for light mode */
  
    /* Dark mode - وضع ليلي */
    html[data-theme="dark"] & {
      color: #ffffff;
    }
  
    border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 6px 24px 0 rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/**
 * Danger Glass Button (Red)
 * زر زجاجي خطر - أحمر
 */
export const glassDangerButton = css`
  ${glassmorphismBase}
    background: linear-gradient(
      135deg,
      rgba(220, 38, 38, 0.3) 0%,
      rgba(220, 38, 38, 0.15) 100%
    );
  
    /* Smart color system - نظام ألوان ذكي */
    color: #1a1a1a; /* Dark text for light mode */
  
    /* Dark mode - وضع ليلي */
    html[data-theme="dark"] & {
      color: #ffffff;
    }
  
    border: 1px solid rgba(220, 38, 38, 0.3);
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(
      135deg,
      rgba(220, 38, 38, 0.5) 0%,
      rgba(220, 38, 38, 0.25) 100%
    );
    border-color: rgba(220, 38, 38, 0.5);
    box-shadow: 
      0 8px 32px 0 rgba(220, 38, 38, 0.4),
      0 0 20px rgba(220, 38, 38, 0.3);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;
