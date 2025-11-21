// Mobile Input Component - Moved to @globul-cars/ui package
// Professional touch-optimized form inputs for mobile and tablets
// Prevents iOS zoom with 16px minimum font size

import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
// Mobile Design System - Now in UI package
import { 
  mobileColors, 
  mobileSpacing, 
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileMixins
} from '../styles/mobile-design-system';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'search' | 'url';

interface MobileInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  type?: InputType;
  size?: InputSize;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
  maxLength?: number;
}

const InputWrapper = styled.div`
  ${mobileMixins.flexColumn}
  gap: ${mobileSpacing.xs};
  width: 100%;
`;

const Label = styled.label<{ $required: boolean }>`
  font-size: ${mobileTypography.label.fontSize};
  font-weight: ${mobileTypography.label.fontWeight};
  line-height: ${mobileTypography.label.lineHeight};
  color: ${mobileColors.neutral.gray700};
  
  ${props => props.$required && css`
    &::after {
      content: ' *';
      color: ${mobileColors.error.main};
    }
  `}
`;

const InputContainer = styled.div<{ 
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
  $error: boolean;
}>`
  position: relative;
  width: 100%;
  
  ${props => props.$hasIcon && props.$iconPosition === 'left' && css`
    input {
      padding-left: ${mobileSpacing.xxxl};
    }
  `}
  
  ${props => props.$hasIcon && props.$iconPosition === 'right' && css`
    input {
      padding-right: ${mobileSpacing.xxxl};
    }
  `}
`;

const sizeStyles = {
  sm: css`
    min-height: ${mobileSpacing.touchMin};
    padding: ${mobileSpacing.xs} ${mobileSpacing.sm};
    font-size: 14px;
  `,
  
  md: css`
    min-height: ${mobileSpacing.touchComfortable};
    padding: ${mobileSpacing.sm} ${mobileSpacing.md};
    font-size: ${mobileTypography.input.fontSize};
  `,
  
  lg: css`
    min-height: ${mobileSpacing.touchLarge};
    padding: ${mobileSpacing.md} ${mobileSpacing.lg};
    font-size: 18px;
  `
};

const StyledInput = styled.input<{
  $size: InputSize;
  $error: boolean;
}>`
  ${mobileMixins.preventZoom}
  
  width: 100%;
  border: 2px solid ${props => props.$error ? mobileColors.error.main : mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  background: ${mobileColors.surface.background};
  
  font-family: 'Martica', 'Arial', sans-serif;
  font-weight: ${mobileTypography.input.fontWeight};
  line-height: ${mobileTypography.input.lineHeight};
  color: ${mobileColors.neutral.gray900};
  
  transition: ${mobileAnimations.transitions.default};
  
  ${props => sizeStyles[props.$size]}
  
  &::placeholder {
    color: ${mobileColors.neutral.gray400};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? mobileColors.error.main : mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.$error ? mobileColors.error.light : mobileColors.primary.pale};
  }
  
  &:disabled {
    background: ${mobileColors.neutral.gray100};
    color: ${mobileColors.neutral.gray500};
    cursor: not-allowed;
  }
  
  &[type="number"] {
    -moz-appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
  
  &[type="search"] {
    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
    }
  }
`;

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$position}: ${mobileSpacing.md};
  transform: translateY(-50%);
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: ${mobileColors.neutral.gray500};
  pointer-events: none;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const HelperText = styled.span<{ $error: boolean }>`
  font-size: ${mobileTypography.caption.fontSize};
  line-height: ${mobileTypography.caption.lineHeight};
  color: ${props => props.$error ? mobileColors.error.main : mobileColors.neutral.gray600};
`;

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(({
  label,
  placeholder,
  value,
  defaultValue,
  type = 'text',
  size = 'md',
  error,
  helperText,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  onChange,
  onFocus,
  onBlur,
  className,
  name,
  id,
  autoComplete,
  maxLength
}, ref) => {
  const inputId = id || name;
  const hasError = !!error;
  
  return (
    <InputWrapper className={className}>
      {label && (
        <Label htmlFor={inputId} $required={required}>
          {label}
        </Label>
      )}
      
      <InputContainer
        $hasIcon={!!icon}
        $iconPosition={iconPosition}
        $error={hasError}
      >
        {icon && (
          <IconWrapper $position={iconPosition}>
            {icon}
          </IconWrapper>
        )}
        
        <StyledInput
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete={autoComplete}
          maxLength={maxLength}
          $size={size}
          $error={hasError}
        />
      </InputContainer>
      
      {(error || helperText) && (
        <HelperText $error={hasError}>
          {error || helperText}
        </HelperText>
      )}
    </InputWrapper>
  );
});

MobileInput.displayName = 'MobileInput';

// Textarea Component
interface MobileTextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  rows?: number;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  className?: string;
  name?: string;
  id?: string;
  maxLength?: number;
}

const StyledTextarea = styled.textarea<{ $error: boolean }>`
  ${mobileMixins.preventZoom}
  
  width: 100%;
  min-height: 120px;
  padding: ${mobileSpacing.sm} ${mobileSpacing.md};
  
  border: 2px solid ${props => props.$error ? mobileColors.error.main : mobileColors.surface.border};
  border-radius: ${mobileBorderRadius.md};
  background: ${mobileColors.surface.background};
  
  font-family: 'Martica', 'Arial', sans-serif;
  font-size: ${mobileTypography.input.fontSize};
  font-weight: ${mobileTypography.input.fontWeight};
  line-height: ${mobileTypography.input.lineHeight};
  color: ${mobileColors.neutral.gray900};
  
  resize: vertical;
  transition: ${mobileAnimations.transitions.default};
  
  &::placeholder {
    color: ${mobileColors.neutral.gray400};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? mobileColors.error.main : mobileColors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.$error ? mobileColors.error.light : mobileColors.primary.pale};
  }
  
  &:disabled {
    background: ${mobileColors.neutral.gray100};
    color: ${mobileColors.neutral.gray500};
    cursor: not-allowed;
    resize: none;
  }
`;

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(({
  label,
  placeholder,
  value,
  defaultValue,
  rows = 4,
  error,
  helperText,
  disabled = false,
  required = false,
  onChange,
  onFocus,
  onBlur,
  className,
  name,
  id,
  maxLength
}, ref) => {
  const textareaId = id || name;
  const hasError = !!error;
  
  return (
    <InputWrapper className={className}>
      {label && (
        <Label htmlFor={textareaId} $required={required}>
          {label}
        </Label>
      )}
      
      <StyledTextarea
        ref={ref}
        id={textareaId}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        rows={rows}
        disabled={disabled}
        required={required}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        maxLength={maxLength}
        $error={hasError}
      />
      
      {(error || helperText) && (
        <HelperText $error={hasError}>
          {error || helperText}
        </HelperText>
      )}
    </InputWrapper>
  );
});

MobileTextarea.displayName = 'MobileTextarea';

