/**
 * 🔘 Professional Button Component
 * مكون الأزرار الاحترافي الموحد
 */

import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { colors, shadows, spacing, typography } from '../../design-system';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const ButtonContainer = styled(motion.button)<{
  $variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  $size: 'sm' | 'md' | 'lg';
  $fullWidth: boolean;
  $disabled: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]};
  border: none;
  border-radius: ${props => {
    switch (props.$size) {
      case 'sm': return spacing[2];
      case 'md': return spacing[3];
      case 'lg': return spacing[4];
      default: return spacing[3];
    }
  }};
  font-family: ${typography.fonts.primary};
  font-weight: ${typography.weights.medium};
  text-decoration: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  ${props => {
    switch (props.$size) {
      case 'sm':
        return `
          padding: ${spacing[2]} ${spacing[3]};
          font-size: ${typography.sizes.sm};
          min-height: 32px;
        `;
      case 'md':
        return `
          padding: ${spacing[3]} ${spacing[4]};
          font-size: ${typography.sizes.base};
          min-height: 40px;
        `;
      case 'lg':
        return `
          padding: ${spacing[4]} ${spacing[6]};
          font-size: ${typography.sizes.lg};
          min-height: 48px;
        `;
      default:
        return `
          padding: ${spacing[3]} ${spacing[4]};
          font-size: ${typography.sizes.base};
          min-height: 40px;
        `;
    }
  }}

  ${props => props.$fullWidth && `
    width: 100%;
  `}

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]});
          color: white;
          box-shadow: ${shadows.colored.primary.sm};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]});
            box-shadow: ${shadows.colored.primary.md};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.colored.primary.sm};
          }
        `;
      
      case 'secondary':
        return `
          background: ${colors.background.secondary};
          color: ${colors.text.primary};
          border: 1px solid ${colors.border.medium};
          box-shadow: ${shadows.basic.sm};
          
          &:hover:not(:disabled) {
            background: ${colors.background.primary};
            border-color: ${colors.border.dark};
            box-shadow: ${shadows.basic.md};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.basic.sm};
          }
        `;
      
      case 'ghost':
        return `
          background: transparent;
          color: ${colors.text.primary};
          
          &:hover:not(:disabled) {
            background: ${colors.background.primary};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      
      case 'danger':
        return `
          background: linear-gradient(135deg, ${colors.status.error}, #dc2626);
          color: white;
          box-shadow: ${shadows.colored.error.sm};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            box-shadow: ${shadows.colored.error.md};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.colored.error.sm};
          }
        `;
      
      case 'success':
        return `
          background: linear-gradient(135deg, ${colors.status.success}, #059669);
          color: white;
          box-shadow: ${shadows.colored.success.sm};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #059669, #047857);
            box-shadow: ${shadows.colored.success.md};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${shadows.colored.success.sm};
          }
        `;
      
      default:
        return '';
    }
  }}

  ${props => props.$disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  `}

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${colors.primary[200]};
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className,
  type = 'button',
}) => {
  const isDisabled = disabled || loading;

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <ButtonContainer
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $disabled={isDisabled}
      className={className}
      onClick={onClick}
      type={type}
      variants={buttonVariants}
      initial="initial"
      whileHover={!isDisabled ? "hover" : "initial"}
      whileTap={!isDisabled ? "tap" : "initial"}
      disabled={isDisabled}
    >
      {loading && (
        <LoadingSpinner
          variants={spinnerVariants}
          animate="animate"
        />
      )}
      
      {!loading && icon && (
        <IconContainer>
          {icon}
        </IconContainer>
      )}
      
      {children}
    </ButtonContainer>
  );
};

export default Button;
