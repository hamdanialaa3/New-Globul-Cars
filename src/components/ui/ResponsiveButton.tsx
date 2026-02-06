import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  fullWidthOnMobile?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const StyledButton = styled.button<{
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
  $fullWidth?: boolean;
  $fullWidthOnMobile?: boolean;
  $hasIcon?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Martica', 'Arial', sans-serif;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  border: none;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
  
  min-height: 44px;
  min-width: ${props => props.$hasIcon && !props.children ? '44px' : 'auto'};
  
  ${props => {
    switch (props.$size) {
      case 'sm':
        return `padding: 8px 16px; font-size: 14px; @media (max-width: 640px) { padding: 10px 20px; font-size: 15px; }`;
      case 'lg':
        return `padding: 14px 28px; font-size: 18px; @media (max-width: 640px) { padding: 16px 32px; font-size: 16px; }`;
      case 'xl':
        return `padding: 16px 32px; font-size: 20px; @media (max-width: 640px) { padding: 18px 36px; font-size: 18px; }`;
      default:
        return `padding: 10px 20px; font-size: 16px; @media (max-width: 640px) { padding: 12px 24px; }`;
    }
  }}
  
  ${props => {
    const theme = props.theme;
    switch (props.$variant) {
      case 'secondary':
        return `background: ${theme.colors.secondary?.main || '#6c757d'}; color: white; &:hover:not(:disabled) { background: ${theme.colors.secondary?.dark || '#5a6268'}; transform: translateY(-1px); }`;
      case 'outline':
        return `background: transparent; color: ${theme.colors.primary?.main || '#007bff'}; border: 2px solid ${theme.colors.primary?.main || '#007bff'}; &:hover:not(:disabled) { background: ${theme.colors.primary?.main || '#007bff'}; color: white; transform: translateY(-1px); }`;
      case 'ghost':
        return `background: transparent; color: ${theme.colors.text?.primary || '#333'}; &:hover:not(:disabled) { background: rgba(0, 0, 0, 0.05); }`;
      case 'danger':
        return `background: ${theme.colors.error?.main || '#dc3545'}; color: white; &:hover:not(:disabled) { background: ${theme.colors.error?.dark || '#c82333'}; transform: translateY(-1px); }`;
      default:
        return `background: ${theme.colors.primary?.main || '#007bff'}; color: white; &:hover:not(:disabled) { background: ${theme.colors.primary?.dark || '#0056b3'}; transform: translateY(-1px); }`;
    }
  }}
  
  ${props => props.$fullWidth && 'width: 100%;'}
  ${props => props.$fullWidthOnMobile && `@media (max-width: 640px) { width: 100%; }`}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary?.main || '#007bff'};
    outline-offset: 2px;
  }
`;

export const ResponsiveButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  fullWidthOnMobile = false,
  children,
  icon,
  loading = false,
  disabled = false,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $fullWidthOnMobile={fullWidthOnMobile}
      $hasIcon={!!icon}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : icon}
      {children}
    </StyledButton>
  );
};
