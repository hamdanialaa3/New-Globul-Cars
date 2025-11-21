// GlassButton.tsx - Premium Glass Morphism Button System
// Unified button component for all project pages

import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Loader } from 'lucide-react';

// Animations
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
`;

// Button Variants
export type ButtonVariant = 
  | 'primary'           // White solid button (main actions)
  | 'glass'             // Transparent glass button (secondary)
  | 'glassOutline'      // Glass with outline (tertiary)
  | 'glassDark'         // Dark glass (on light backgrounds)
  | 'gradient'          // Gradient glass (premium)
  | 'social'            // Social login buttons
  | 'ghost'             // Minimal glass (subtle)
  | 'danger'            // Red glass (delete, cancel)
  | 'success'           // Green glass (confirm, save)
  ;

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Styled Button Component
const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $loading?: boolean;
  $fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 50px;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  user-select: none;
  
  /* Size variations */
  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          padding: 8px 20px;
          font-size: 13px;
          height: 36px;
          min-width: 80px;
        `;
      case 'md':
        return css`
          padding: 12px 24px;
          font-size: 15px;
          height: 44px;
          min-width: 100px;
        `;
      case 'lg':
        return css`
          padding: 14px 28px;
          font-size: 16px;
          height: 52px;
          min-width: 120px;
        `;
      case 'xl':
        return css`
          padding: 16px 32px;
          font-size: 18px;
          height: 60px;
          min-width: 140px;
        `;
    }
  }}

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background: #fff;
          color: #1a202c;
          box-shadow: 
            0 4px 15px rgba(255, 255, 255, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 
              0 8px 25px rgba(255, 255, 255, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset;
            background: #f8f9fa;
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      case 'glass':
        return css`
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 15px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;

          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 
              0 8px 25px rgba(0, 0, 0, 0.15),
              0 0 20px rgba(255, 255, 255, 0.1);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      case 'glassOutline':
        return css`
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(5px);

          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.6);
            transform: translateY(-2px);
          }
        `;

      case 'glassDark':
        return css`
          background: rgba(0, 0, 0, 0.2);
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

          &:hover:not(:disabled) {
            background: rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        `;

      case 'gradient':
        return css`
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.8) 0%,
            rgba(118, 75, 162, 0.8) 100%
          );
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 15px rgba(102, 126, 234, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          
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

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 
              0 8px 25px rgba(102, 126, 234, 0.6),
              0 0 0 1px rgba(255, 255, 255, 0.3) inset;

            &::before {
              left: 100%;
            }
          }
        `;

      case 'social':
        return css`
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(8px);

          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px) scale(1.02);
          }
        `;

      case 'ghost':
        return css`
          background: transparent;
          color: rgba(255, 255, 255, 0.9);
          border: 2px solid transparent;

          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
          }
        `;

      case 'danger':
        return css`
          background: rgba(239, 68, 68, 0.2);
          color: #fff;
          border: 2px solid rgba(239, 68, 68, 0.5);
          backdrop-filter: blur(10px);

          &:hover:not(:disabled) {
            background: rgba(239, 68, 68, 0.3);
            border-color: rgba(239, 68, 68, 0.7);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
          }
        `;

      case 'success':
        return css`
          background: rgba(34, 197, 94, 0.2);
          color: #fff;
          border: 2px solid rgba(34, 197, 94, 0.5);
          backdrop-filter: blur(10px);

          &:hover:not(:disabled) {
            background: rgba(34, 197, 94, 0.3);
            border-color: rgba(34, 197, 94, 0.7);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
          }
        `;
    }
  }}

  /* Full width option */
  ${props => props.$fullWidth && css`
    width: 100%;
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Loading state */
  ${props => props.$loading && css`
    cursor: wait;
    
    .spin-icon {
      animation: ${spin} 1s linear infinite;
    }
  `}

  /* Focus state for accessibility */
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${props => {
      switch (props.$size) {
        case 'sm':
          return css`
            padding: 7px 16px;
            font-size: 12px;
            height: 32px;
          `;
        case 'md':
          return css`
            padding: 10px 20px;
            font-size: 14px;
            height: 40px;
          `;
        case 'lg':
          return css`
            padding: 12px 24px;
            font-size: 15px;
            height: 48px;
          `;
        case 'xl':
          return css`
            padding: 14px 28px;
            font-size: 16px;
            height: 54px;
          `;
      }
    }}
  }
`;

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  order: ${props => props.$position === 'left' ? -1 : 1};
`;

// Main Component
const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'glass',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $loading={loading}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="spin-icon" />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <IconWrapper $position="left">{icon}</IconWrapper>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <IconWrapper $position="right">{icon}</IconWrapper>
          )}
        </>
      )}
    </StyledButton>
  );
};

export default GlassButton;

// Export additional button components for specific use cases
export const GlassPrimaryButton = (props: Omit<GlassButtonProps, 'variant'>) => (
  <GlassButton variant="primary" {...props} />
);

export const GlassSecondaryButton = (props: Omit<GlassButtonProps, 'variant'>) => (
  <GlassButton variant="glass" {...props} />
);

export const GlassOutlineButton = (props: Omit<GlassButtonProps, 'variant'>) => (
  <GlassButton variant="glassOutline" {...props} />
);

export const GlassGradientButton = (props: Omit<GlassButtonProps, 'variant'>) => (
  <GlassButton variant="gradient" {...props} />
);

export const GlassDangerButton = (props: Omit<GlassButtonProps, 'variant'>) => (
  <GlassButton variant="danger" {...props} />
);

export const GlassSuccessButton = (props: Omit<GlassButtonProps, 'variant'>) => (
  <GlassButton variant="success" {...props} />
);

