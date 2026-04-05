// ═══════════════════════════════════════════════════════════════════════════
// 📝 Design System - Input Component
// نظام التصميم - مكون الإدخال
// 
// Philosophy: Accessible, User-Friendly, Error-Handling Input
// المبدأ: إدخال يمكن الوصول إليه، سهل الاستخدام، يعالج الأخطاء
// 
// Created: December 7, 2025
// Based on: WCAG 2.1 AA Standards + Material Design 3.0
// ═══════════════════════════════════════════════════════════════════════════

import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 TYPE DEFINITIONS - تعريفات الأنواع
// ═══════════════════════════════════════════════════════════════════════════

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'outline';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: InputSize;
  
  /** Visual variant */
  variant?: InputVariant;
  
  /** Label text */
  label?: string;
  
  /** Helper text below input */
  helperText?: string;
  
  /** Error message (shows error state) */
  error?: string;
  
  /** Success state */
  success?: boolean;
  
  /** Icon before input */
  iconBefore?: React.ReactNode;
  
  /** Icon after input */
  iconAfter?: React.ReactNode;
  
  /** Full width input */
  fullWidth?: boolean;
  
  /** Required field indicator */
  required?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 STYLED COMPONENTS - مكونات منمقة
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// Container - حاوية
// ─────────────────────────────────────────────────────────────────────────
const InputContainer = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
`;

// ─────────────────────────────────────────────────────────────────────────
// Label - تسمية
// ─────────────────────────────────────────────────────────────────────────
const Label = styled.label`
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.content.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  
  .required {
    color: ${({ theme }) => theme.colors.feedback.error.main};
    margin-left: 2px;
  }
`;

// ─────────────────────────────────────────────────────────────────────────
// Input Wrapper - غلاف الإدخال
// ─────────────────────────────────────────────────────────────────────────
const InputWrapper = styled.div<{
  $hasError: boolean;
  $hasSuccess: boolean;
  $isFocused: boolean;
  $variant: InputVariant;
}>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  background: ${({ theme, $variant }) => 
    $variant === 'filled' ? theme.colors.surface.hover : theme.colors.surface.card
  };
  
  border: 2px solid ${({ theme, $hasError, $hasSuccess, $isFocused, $variant }) => {
    if ($hasError) return theme.colors.border.error;
    if ($hasSuccess) return theme.colors.feedback.success.main;
    if ($isFocused) return theme.colors.border.focus;
    if ($variant === 'outline') return theme.colors.border.medium;
    return theme.colors.border.default;
  }};
  
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  
  transition: all 0.2s ease-in-out;
  
  /* Hover state */
  &:hover:not(:has(input:disabled)) {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.border.error : theme.colors.border.dark
    };
  }
  
  /* Focus state */
  ${({ $isFocused, theme }) => $isFocused && css`
    box-shadow: 0 0 0 3px ${
      theme.colors.border.focus.replace(')', ', 0.1)')
    };
  `}
  
  /* Error state */
  ${({ $hasError, theme }) => $hasError && css`
    box-shadow: 0 0 0 3px ${theme.colors.feedback.error.light};
  `}
  
  /* Success state */
  ${({ $hasSuccess, theme }) => $hasSuccess && css`
    box-shadow: 0 0 0 3px ${theme.colors.feedback.success.light};
  `}
`;

// ─────────────────────────────────────────────────────────────────────────
// Size Styles - أنماط الأحجام
// ─────────────────────────────────────────────────────────────────────────
const sizeStyles = {
  sm: css`
    padding: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    min-height: 32px;
  `,
  
  md: css`
    padding: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    min-height: 40px;
  `,
  
  lg: css`
    padding: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    min-height: 48px;
  `,
};

// ─────────────────────────────────────────────────────────────────────────
// Styled Input - إدخال منمق
// ─────────────────────────────────────────────────────────────────────────
const StyledInput = styled.input<{ $size: InputSize }>`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  color: ${({ theme }) => theme.colors.content.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  
  ${({ $size }) => sizeStyles[$size]}
  
  /* Placeholder */
  &::placeholder {
    color: ${({ theme }) => theme.colors.content.placeholder};
    opacity: 0.7;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Autofill styles */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px ${({ theme }) => theme.colors.surface.card} inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.content.primary};
  }
`;

// ─────────────────────────────────────────────────────────────────────────
// Icon Wrapper - غلاف الأيقونة
// ─────────────────────────────────────────────────────────────────────────
const IconWrapper = styled.span<{ $position: 'before' | 'after' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.content.tertiary};
  flex-shrink: 0;
  
  ${({ $position }) => $position === 'before' && css`
    padding-left: ${({ theme }) => theme.spacing.xs};
  `}
  
  ${({ $position }) => $position === 'after' && css`
    padding-right: ${({ theme }) => theme.spacing.xs};
  `}
`;

// ─────────────────────────────────────────────────────────────────────────
// Helper/Error Text - نص مساعد/خطأ
// ─────────────────────────────────────────────────────────────────────────
const HelperText = styled.span<{ $isError: boolean; $isSuccess: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, $isError, $isSuccess }) => {
    if ($isError) return theme.colors.feedback.error.main;
    if ($isSuccess) return theme.colors.feedback.success.main;
    return theme.colors.content.tertiary;
  }};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 INPUT COMPONENT - مكون الإدخال
// ═══════════════════════════════════════════════════════════════════════════

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success = false,
      iconBefore,
      iconAfter,
      size = 'md',
      variant = 'default',
      fullWidth = false,
      required = false,
      id,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const hasError = !!error;
    const hasSuccess = success && !hasError;
    
    return (
      <InputContainer $fullWidth={fullWidth}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {required && <span className="required">*</span>}
          </Label>
        )}
        
        <InputWrapper
          $hasError={hasError}
          $hasSuccess={hasSuccess}
          $isFocused={isFocused}
          $variant={variant}
        >
          {iconBefore && (
            <IconWrapper $position="before">{iconBefore}</IconWrapper>
          )}
          
          <StyledInput
            ref={ref}
            id={inputId}
            $size={size}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={hasError}
            aria-describedby={
              hasError || helperText ? `${inputId}-helper` : undefined
            }
            required={required}
            {...rest}
          />
          
          {iconAfter && (
            <IconWrapper $position="after">{iconAfter}</IconWrapper>
          )}
        </InputWrapper>
        
        {(error || helperText) && (
          <HelperText
            id={`${inputId}-helper`}
            $isError={hasError}
            $isSuccess={hasSuccess}
            role={hasError ? 'alert' : undefined}
          >
            {error || helperText}
          </HelperText>
        )}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 USAGE EXAMPLES - أمثلة الاستخدام
// ═══════════════════════════════════════════════════════════════════════════
/*

1️⃣ BASIC USAGE:
────────────────
import { Input } from '@/components/design-system/Input';

<Input 
  label="Email"
  placeholder="Enter your email"
  type="email"
/>


2️⃣ WITH ICONS:
────────────────
import { FiMail, FiLock } from 'react-icons/fi';

<Input 
  label="Email"
  iconBefore={<FiMail />}
  placeholder="your@email.com"
/>

<Input 
  label="Password"
  iconBefore={<FiLock />}
  type="password"
/>


3️⃣ ERROR STATE:
─────────────────
<Input 
  label="Username"
  error="Username is already taken"
/>


4️⃣ SUCCESS STATE:
───────────────────
<Input 
  label="Email"
  success
  helperText="Email is available!"
/>


5️⃣ REQUIRED FIELD:
────────────────────
<Input 
  label="Full Name"
  required
  placeholder="John Doe"
/>


6️⃣ VARIANTS:
──────────────
<Input variant="default" />
<Input variant="filled" />
<Input variant="outline" />


7️⃣ SIZES:
──────────
<Input size="sm" />
<Input size="md" />
<Input size="lg" />


8️⃣ FULL WIDTH:
────────────────
<Input fullWidth />


9️⃣ FORM INTEGRATION:
──────────────────────
const [email, setEmail] = useState('');

<Input 
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

*/

// ═══════════════════════════════════════════════════════════════════════════
// ✅ ACCESSIBILITY FEATURES:
// ميزات إمكانية الوصول:
// 
// 1. Label Association - ربط التسمية بالإدخال (htmlFor)
// 2. ARIA Attributes - سمات ARIA (aria-invalid, aria-describedby)
// 3. Error Announcements - إعلانات الأخطاء (role="alert")
// 4. Focus States - حالات التركيز الواضحة
// 5. Color Contrast - تباين ألوان عالي (WCAG AA)
// 6. Keyboard Navigation - دعم كامل للوحة المفاتيح
// 7. Required Indicator - مؤشر الحقل المطلوب (*)
// ═══════════════════════════════════════════════════════════════════════════
