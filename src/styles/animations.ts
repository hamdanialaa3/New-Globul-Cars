// src/styles/animations.ts
// Animation Styles - أنماط الحركة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { keyframes, css } from 'styled-components';

// ==================== KEYFRAME ANIMATIONS ====================

/**
 * Fade in animation
 * حركة الظهور التدريجي
 */
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Slide up animation
 * حركة الانزلاق للأعلى
 */
export const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Slide down animation
 * حركة الانزلاق للأسفل
 */
export const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Scale in animation
 * حركة التكبير
 */
export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * Pulse animation
 * حركة النبض
 */
export const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

/**
 * Spin animation
 * حركة الدوران
 */
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Shimmer animation (for loading skeletons)
 * حركة التلميع (للتحميل)
 */
export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

/**
 * Bounce animation
 * حركة الارتداد
 */
export const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// ==================== ANIMATION MIXINS ====================

/**
 * Fade in mixin
 * دمج حركة الظهور
 */
export const fadeInAnimation = css`
  animation: ${fadeIn} 0.3s ease-out;
`;

/**
 * Slide up mixin
 * دمج حركة الانزلاق
 */
export const slideUpAnimation = css`
  animation: ${slideUp} 0.4s ease-out;
`;

/**
 * Scale in mixin with delay
 * دمج حركة التكبير مع تأخير
 */
export const scaleInAnimation = (delay = 0) => css`
  animation: ${scaleIn} 0.3s ease-out ${delay}s;
  animation-fill-mode: both;
`;

/**
 * Shimmer effect for loading
 * تأثير التلميع للتحميل
 */
export const shimmerEffect = css`
  background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

// ==================== TRANSITION HELPERS ====================

/**
 * Smooth transition mixin
 * انتقال سلس
 */
export const smoothTransition = (properties: string[] = ['all']) => css`
  transition: ${properties.join(', ')} 0.3s ease;
`;

/**
 * Hover lift effect
 * تأثير الرفع عند المرور
 */
export const hoverLift = css`
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

// ==================== ACCESSIBILITY: REDUCED MOTION ====================

/**
 * Wraps animation CSS so it only applies when the user has NOT requested reduced motion.
 * Usage: ${safeAnimation(css`animation: ${fadeIn} 0.3s ease-out;`)}
 */
export const safeAnimation = (animationCss: ReturnType<typeof css>) => css`
  @media (prefers-reduced-motion: no-preference) {
    ${animationCss}
  }
`;

/**
 * Reduced-motion-safe global wrapper.
 * Apply to GlobalStyles or parent containers.
 */
export const reducedMotionStyles = css`
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// ==================== EXPORT ALL ====================

export const animations = {
  fadeIn,
  slideUp,
  slideDown,
  scaleIn,
  pulse,
  spin,
  shimmer,
  bounce,
};

export const mixins = {
  fadeInAnimation,
  slideUpAnimation,
  scaleInAnimation,
  shimmerEffect,
  smoothTransition,
  hoverLift,
};

export default {
  animations,
  mixins,
};
