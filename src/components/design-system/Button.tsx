// ═══════════════════════════════════════════════════════════════════════════
// 🎨 Design System - Button Component
// نظام التصميم - مكون الزر
// 
// Philosophy: Accessible, Semantic, Human-Centric Button
// المبدأ: زر يمكن الوصول إليه، دلالي، متمحور حول الإنسان
// 
// Created: December 7, 2025
// Based on: WCAG 2.1 AA Standards + Material Design 3.0
// ═══════════════════════════════════════════════════════════════════════════

import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 TYPE DEFINITIONS - تعريفات الأنواع
// ═══════════════════════════════════════════════════════════════════════════

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual style variant */
  variant?: ButtonVariant;
  
  /** Button size */
  size?: ButtonSize;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Loading state (shows spinner) */
  loading?: boolean;
  
  /** Icon before text */
  iconBefore?: React.ReactNode;
  
  /** Icon after text */
  iconAfter?: React.ReactNode;
  
  /** Accessible label (overrides children for screen readers) */
  'aria-label'?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 STYLED COMPONENTS - مكونات منمقة
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// Variant Styles - أنماط المتغيرات
// ─────────────────────────────────────────────────────────────────────────
const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.interactive.primary};
    color: ${({ theme }) => theme.colors.content.inverse};
    border: 2px solid ${({ theme }) => theme.colors.interactive.primary};
    box-shadow: ${({ theme }) => theme.shadows.button};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.interactive.primaryHover};
      border-color: ${({ theme }) => theme.colors.interactive.primaryHover};
      box-shadow: ${({ theme }) => theme.shadows.hover};
      transform: translateY(-1px);
    }
    
    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.interactive.primaryActive};
      border-color: ${({ theme }) => theme.colors.interactive.primaryActive};
      box-shadow: ${({ theme }) => theme.shadows.sm};
      transform: translateY(0);
    }
  `,
  
  secondary: css`
    background: ${({ theme }) => theme.colors.surface.card};
    color: ${({ theme }) => theme.colors.content.primary};
    border: 2px solid ${({ theme }) => theme.colors.border.medium};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.surface.hover};
      border-color: ${({ theme }) => theme.colors.border.dark};
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
    
    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.surface.selected};
      border-color: ${({ theme }) => theme.colors.interactive.primary};
    }
  `,
  
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.interactive.primary};
    border: 2px solid ${({ theme }) => theme.colors.interactive.primary};
    box-shadow: none;
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.brand.light};
      border-color: ${({ theme }) => theme.colors.interactive.primaryHover};
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
    
    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.surface.selected};
      border-color: ${({ theme }) => theme.colors.interactive.primaryActive};
    }
  `,
  
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.content.primary};
    border: 2px solid transparent;
    box-shadow: none;
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.surface.hover};
      border-color: ${({ theme }) => theme.colors.border.light};
    }
    
    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.surface.selected};
      border-color: ${({ theme }) => theme.colors.border.default};
    }
  `,
  
  danger: css`
    background: ${({ theme }) => theme.colors.feedback.error.main};
    color: ${({ theme }) => theme.colors.content.inverse};
    border: 2px solid ${({ theme }) => theme.colors.feedback.error.main};
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.feedback.error.dark};
      border-color: ${({ theme }) => theme.colors.feedback.error.dark};
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
      transform: translateY(-1px);
    }
    
    &:active:not(:disabled) {
      background: #B91C1C;
      border-color: #B91C1C;
      box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
      transform: translateY(0);
    }
  `,
};

// ─────────────────────────────────────────────────────────────────────────
// Size Styles - أنماط الأحجام
// ─────────────────────────────────────────────────────────────────────────
const sizeStyles = {
  sm: css`
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    min-height: 32px;
  `,
  
  md: css`
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    min-height: 40px;
  `,
  
  lg: css`
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    min-height: 48px;
  `,
};

// ─────────────────────────────────────────────────────────────────────────
// Main Button Component - مكون الزر الرئيسي
// ─────────────────────────────────────────────────────────────────────────
const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $loading: boolean;
}>`
  /* Base Styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  cursor: pointer;
  user-select: none;
  
  transition: all 0.2s ease-in-out;
  
  /* Apply variant styles */
  ${({ $variant }) => variantStyles[$variant]}
  
  /* Apply size styles */
  ${({ $size }) => sizeStyles[$size]}
  
  /* Full width */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Loading state */
  ${({ $loading }) => $loading && css`
    position: relative;
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  /* Focus state (WCAG 2.1 AA) */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 BUTTON COMPONENT - مكون الزر
// ═══════════════════════════════════════════════════════════════════════════

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      iconBefore,
      iconAfter,
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        $loading={loading}
        disabled={disabled || loading}
        type={type}
        {...rest}
      >
        {iconBefore && !loading && <IconWrapper>{iconBefore}</IconWrapper>}
        {children}
        {iconAfter && !loading && <IconWrapper>{iconAfter}</IconWrapper>}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 USAGE EXAMPLES - أمثلة الاستخدام
// ═══════════════════════════════════════════════════════════════════════════
/*

1️⃣ BASIC USAGE:
────────────────
import { Button } from '@/components/design-system/Button';

<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline">Learn More</Button>


2️⃣ WITH ICONS:
────────────────
import { FiSave, FiArrowRight } from 'react-icons/fi';

<Button iconBefore={<FiSave />}>Save</Button>
<Button iconAfter={<FiArrowRight />}>Next</Button>


3️⃣ LOADING STATE:
───────────────────
<Button loading>Processing...</Button>


4️⃣ SIZES:
──────────
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>


5️⃣ FULL WIDTH:
────────────────
<Button fullWidth>Full Width Button</Button>


6️⃣ ACCESSIBILITY:
───────────────────
<Button aria-label="Save changes">
  <FiSave />
</Button>

*/

// ═══════════════════════════════════════════════════════════════════════════
// ✅ ACCESSIBILITY FEATURES:
// ميزات إمكانية الوصول:
// 
// 1. Focus Visible - حلقة تركيز واضحة (WCAG 2.1 AA)
// 2. Keyboard Navigation - دعم كامل للوحة المفاتيح
// 3. Screen Reader Support - دعم قارئات الشاشة (aria-label)
// 4. Color Contrast - تباين ألوان عالي (4.5:1 minimum)
// 5. Disabled State - حالة معطلة واضحة
// 6. Loading State - حالة تحميل مرئية ومسموعة
// ═══════════════════════════════════════════════════════════════════════════
