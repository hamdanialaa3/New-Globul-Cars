import React from 'react';
import styled, { css } from 'styled-components';
import { spacing, colors, borderRadius, animations, mixins } from '../../styles/design-system';

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
  user-select: none;
  transition: ${animations.transitions.default};
  
  ${props => variantStyles[props.$variant]}
  ${props => sizeStyles[props.$size]}
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const Button: React.FC<ButtonProps> = ({
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
      onClick={onClick}
      type={type}
      className={className}
    >
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
    </StyledButton>
  );
};
