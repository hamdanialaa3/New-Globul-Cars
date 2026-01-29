/**
 * GlassButton Component
 * Modern glassmorphism button with variants
 *
 * Features:
 * - Frosted glass effect with backdrop blur
 * - Multiple variants (primary, secondary, premium)
 * - Icon support
 * - Smooth animations
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface GlassButtonProps {
  variant?: 'primary' | 'secondary' | 'premium';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  // Additional props for compatibility
  title?: string;
  'aria-label'?: string;
  type?: 'button' | 'submit' | 'reset';
}

const StyledButton = styled(motion.button)<{
  $variant: 'primary' | 'secondary' | 'premium';
  $fullWidth?: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  position: relative;
  overflow: hidden;
  border: none;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-family: inherit;

  /* Size variants */
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          padding: 0.5rem 1.5rem;
          font-size: 0.875rem;
          border-radius: 1rem;
        `;
      case 'large':
        return `
          padding: 1rem 2.5rem;
          font-size: 1.125rem;
          border-radius: 1.5rem;
        `;
      default:
        return `
          padding: 0.75rem 2rem;
          font-size: 1rem;
          border-radius: 1.25rem;
        `;
    }
  }}

  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  /* Variant styles */
  ${({ $variant, theme }) => {
    const isDark = theme.mode === 'dark';

    switch ($variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%);
          color: white;
          box-shadow:
            0 8px 32px rgba(59, 130, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%);
            box-shadow:
              0 12px 48px rgba(59, 130, 246, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      case 'secondary':
        return `
          background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
          color: ${isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)'};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
          box-shadow: 0 4px 16px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};

          &:hover:not(:disabled) {
            background: ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
            border-color: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)'};
            transform: translateY(-2px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      case 'premium':
        return `
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.8) 0%, rgba(249, 115, 22, 0.8) 100%);
          color: white;
          box-shadow:
            0 8px 32px rgba(251, 191, 36, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%);
            box-shadow:
              0 12px 48px rgba(251, 191, 36, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Shine effect overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover:not(:disabled)::before {
    opacity: 1;
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 1.25em;
    height: 1.25em;
  }
`;

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  icon,
  iconPosition = 'left',
  children,
  onClick,
  disabled = false,
  className,
  fullWidth = false,
  size = 'medium',
  title,
  'aria-label': ariaLabel,
  type = 'button'
}) => {
  return (
    <StyledButton
      $variant={variant}
      $fullWidth={fullWidth}
      $size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={title}
      aria-label={ariaLabel}
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
    >
      {icon && iconPosition === 'left' && <IconWrapper>{icon}</IconWrapper>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <IconWrapper>{icon}</IconWrapper>}
    </StyledButton>
  );
};

export default GlassButton;
