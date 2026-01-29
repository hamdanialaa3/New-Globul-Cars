// Mobile Button Component
// Professional touch-optimized buttons for mobile and tablets
// Inspired by mobile.de interaction patterns

import React from 'react';
import styled, { css } from 'styled-components';
import { 
  mobileColors, 
  mobileSpacing, 
  mobileTypography,
  mobileBorderRadius,
  mobileAnimations,
  mobileMixins
} from '../../styles/mobile-design-system';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface MobileButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantStyles = {
  primary: css`
    background: ${mobileColors.primary.main};
    color: #FFFFFF;
    border: 2px solid ${mobileColors.primary.main};
    
    &:active:not(:disabled) {
      background: ${mobileColors.primary.dark};
      border-color: ${mobileColors.primary.dark};
    }
    
    &:disabled {
      background: ${mobileColors.neutral.gray300};
      border-color: ${mobileColors.neutral.gray300};
      color: ${mobileColors.neutral.gray500};
    }
  `,
  
  secondary: css`
    background: ${mobileColors.secondary.main};
    color: #FFFFFF;
    border: 2px solid ${mobileColors.secondary.main};
    
    &:active:not(:disabled) {
      background: ${mobileColors.secondary.dark};
      border-color: ${mobileColors.secondary.dark};
    }
    
    &:disabled {
      background: ${mobileColors.neutral.gray300};
      border-color: ${mobileColors.neutral.gray300};
      color: ${mobileColors.neutral.gray500};
    }
  `,
  
  outline: css`
    background: transparent;
    color: ${mobileColors.primary.main};
    border: 2px solid ${mobileColors.primary.main};
    
    &:active:not(:disabled) {
      background: ${mobileColors.primary.pale};
      border-color: ${mobileColors.primary.dark};
      color: ${mobileColors.primary.dark};
    }
    
    &:disabled {
      border-color: ${mobileColors.neutral.gray300};
      color: ${mobileColors.neutral.gray400};
    }
  `,
  
  ghost: css`
    background: transparent;
    color: ${mobileColors.primary.main};
    border: 2px solid transparent;
    
    &:active:not(:disabled) {
      background: ${mobileColors.primary.pale};
      color: ${mobileColors.primary.dark};
    }
    
    &:disabled {
      color: ${mobileColors.neutral.gray400};
    }
  `,
  
  danger: css`
    background: ${mobileColors.error.main};
    color: #FFFFFF;
    border: 2px solid ${mobileColors.error.main};
    
    &:active:not(:disabled) {
      background: ${mobileColors.error.dark};
      border-color: ${mobileColors.error.dark};
    }
    
    &:disabled {
      background: ${mobileColors.neutral.gray300};
      border-color: ${mobileColors.neutral.gray300};
      color: ${mobileColors.neutral.gray500};
    }
  `,
  
  success: css`
    background: ${mobileColors.success.main};
    color: #FFFFFF;
    border: 2px solid ${mobileColors.success.main};
    
    &:active:not(:disabled) {
      background: ${mobileColors.success.dark};
      border-color: ${mobileColors.success.dark};
    }
    
    &:disabled {
      background: ${mobileColors.neutral.gray300};
      border-color: ${mobileColors.neutral.gray300};
      color: ${mobileColors.neutral.gray500};
    }
  `
};

const sizeStyles = {
  sm: css`
    min-height: ${mobileSpacing.touchMin};
    padding: ${mobileSpacing.xs} ${mobileSpacing.md};
    font-size: 14px;
    line-height: 18px;
  `,
  
  md: css`
    min-height: ${mobileSpacing.touchComfortable};
    padding: ${mobileSpacing.sm} ${mobileSpacing.lg};
    font-size: ${mobileTypography.button.fontSize};
    line-height: ${mobileTypography.button.lineHeight};
  `,
  
  lg: css`
    min-height: ${mobileSpacing.touchLarge};
    padding: ${mobileSpacing.md} ${mobileSpacing.xl};
    font-size: 18px;
    line-height: 22px;
  `,
  
  xl: css`
    min-height: 60px;
    padding: ${mobileSpacing.lg} ${mobileSpacing.xxl};
    font-size: 20px;
    line-height: 24px;
  `
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
}>`
  ${mobileMixins.touchTarget}
  ${mobileMixins.preventZoom}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${mobileSpacing.sm};
  
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  
  font-family: 'Martica', 'Arial', sans-serif;
  font-weight: ${mobileTypography.button.fontWeight};
  letter-spacing: ${mobileTypography.button.letterSpacing};
  text-align: center;
  text-decoration: none;
  
  border-radius: ${mobileBorderRadius.md};
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  transition: ${mobileAnimations.transitions.default};
  
  ${props => variantStyles[props.$variant]}
  ${props => sizeStyles[props.$size]}
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${props => props.$hasIcon && props.$iconPosition === 'right' && css`
    flex-direction: row-reverse;
  `}
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };
  
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $hasIcon={!!icon}
      $iconPosition={iconPosition}
      disabled={disabled || loading}
      onClick={handleClick}
      type={type}
      className={className}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <span>{children}</span>
        </>
      )}
    </StyledButton>
  );
};

// Button Group Component
interface MobileButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const StyledButtonGroup = styled.div<{
  $orientation: 'horizontal' | 'vertical';
  $spacing: string;
}>`
  display: flex;
  flex-direction: ${props => props.$orientation === 'horizontal' ? 'row' : 'column'};
  gap: ${props => props.$spacing};
  
  ${props => props.$orientation === 'horizontal' && css`
    flex-wrap: wrap;
  `}
`;

export const MobileButtonGroup: React.FC<MobileButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'sm',
  className
}) => {
  const spacingMap = {
    xs: mobileSpacing.xs,
    sm: mobileSpacing.sm,
    md: mobileSpacing.md,
    lg: mobileSpacing.lg
  };
  
  return (
    <StyledButtonGroup
      $orientation={orientation}
      $spacing={spacingMap[spacing]}
      className={className}
    >
      {children}
    </StyledButtonGroup>
  );
};
