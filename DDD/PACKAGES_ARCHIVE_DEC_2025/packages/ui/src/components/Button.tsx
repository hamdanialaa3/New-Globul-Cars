// Button Component - Moved to @globul-cars/ui package
// Updated imports to use package aliases

import React from 'react';
import styled, { css } from 'styled-components';
import { spacing, colors, borderRadius, animations, mixins } from '@globul-cars/ui/styles/design-system';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantStyles = {
  primary: css`
    background: ${colors.primary.main};
    color: white;
    border: 2px solid ${colors.primary.main};
    &:hover:not(:disabled) {
      background: ${colors.primary.dark};
      border-color: ${colors.primary.dark};
    }
  `,
  secondary: css`
    background: ${colors.secondary.main};
    color: white;
    border: 2px solid ${colors.secondary.main};
    &:hover:not(:disabled) {
      background: ${colors.secondary.dark};
      border-color: ${colors.secondary.dark};
    }
  `,
  outline: css`
    background: transparent;
    color: ${colors.primary.main};
    border: 2px solid ${colors.primary.main};
    &:hover:not(:disabled) {
      background: ${colors.primary.pale};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${colors.primary.main};
    border: 2px solid transparent;
    &:hover:not(:disabled) {
      background: ${colors.primary.pale};
    }
  `,
  danger: css`
    background: ${colors.error.main};
    color: white;
    border: 2px solid ${colors.error.main};
    &:hover:not(:disabled) {
      background: ${colors.error.dark};
      border-color: ${colors.error.dark};
    }
  `
};

const sizeStyles = {
  sm: css`
    min-height: ${spacing.touchMin};
    padding: ${spacing.xs} ${spacing.md};
    font-size: 14px;
  `,
  md: css`
    min-height: ${spacing.touchComfortable};
    padding: ${spacing.sm} ${spacing.lg};
    font-size: 16px;
  `,
  lg: css`
    min-height: ${spacing.touchLarge};
    padding: ${spacing.md} ${spacing.xl};
    font-size: 18px;
  `
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  ${mixins.touchTarget}
  ${mixins.preventZoom}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  font-weight: 600;
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: ${animations.transition};
  position: relative;
  overflow: hidden;

  ${props => variantStyles[props.$variant]}
  ${props => sizeStyles[props.$size]}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${props => props.loading && css`
    pointer-events: none;
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
  `}
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  className
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      loading={loading}
      onClick={onClick}
      type={type}
      className={className}
    >
      {!loading && icon && <span>{icon}</span>}
      {!loading && children}
      {loading && <span>Loading...</span>}
    </StyledButton>
  );
};

export default Button;
export type { ButtonProps, ButtonVariant, ButtonSize };

