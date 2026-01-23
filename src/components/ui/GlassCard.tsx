/**
 * GlassCard Component
 * Modern glassmorphism card container
 *
 * Features:
 * - Frosted glass effect with backdrop blur
 * - Subtle border and shadow
 * - Responsive padding
 * - Theme-aware colors
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'elevated' | 'outlined';
  onClick?: () => void;
  hoverable?: boolean;
}

const StyledCard = styled(motion.div)<{
  $padding: 'small' | 'medium' | 'large';
  $variant: 'default' | 'elevated' | 'outlined';
  $hoverable: boolean;
}>`
  position: relative;
  border-radius: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Padding variants */
  ${({ $padding }) => {
    switch ($padding) {
      case 'small':
        return 'padding: 1rem;';
      case 'large':
        return 'padding: 2rem;';
      default:
        return 'padding: 1.5rem;';
    }
  }}

  /* Variant styles */
  ${({ $variant, theme }) => {
    const isDark = theme.mode === 'dark';

    switch ($variant) {
      case 'elevated':
        return `
          background: ${isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.9)'
          };
          backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid ${isDark
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(255, 255, 255, 0.6)'
          };
          box-shadow:
            0 8px 32px ${isDark
              ? 'rgba(0, 0, 0, 0.4)'
              : 'rgba(31, 38, 135, 0.15)'
            },
            inset 0 1px 0 ${isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.8)'
            };
        `;

      case 'outlined':
        return `
          background: ${isDark
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(255, 255, 255, 0.5)'
          };
          backdrop-filter: blur(20px);
          border: 2px solid ${isDark
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(0, 0, 0, 0.1)'
          };
          box-shadow: 0 4px 16px ${isDark
            ? 'rgba(0, 0, 0, 0.3)'
            : 'rgba(0, 0, 0, 0.08)'
          };
        `;

      default:
        return `
          background: ${isDark
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.7)'
          };
          backdrop-filter: blur(24px);
          border: 1px solid ${isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.4)'
          };
          box-shadow: 0 6px 24px ${isDark
            ? 'rgba(0, 0, 0, 0.3)'
            : 'rgba(31, 38, 135, 0.12)'
          };
        `;
    }
  }}

  /* Hoverable effect */
  ${({ $hoverable, theme }) => {
    if (!$hoverable) return '';

    const isDark = theme.mode === 'dark';
    return `
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow:
          0 12px 40px ${isDark
            ? 'rgba(0, 0, 0, 0.5)'
            : 'rgba(31, 38, 135, 0.2)'
          },
          inset 0 1px 0 ${isDark
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(255, 255, 255, 0.9)'
          };
        border-color: ${isDark
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(255, 255, 255, 0.6)'
        };
      }

      &:active {
        transform: translateY(-2px);
      }
    `;
  }}

  @media (max-width: 768px) {
    border-radius: 1.25rem;

    ${({ $padding }) => {
      switch ($padding) {
        case 'small':
          return 'padding: 0.75rem;';
        case 'large':
          return 'padding: 1.5rem;';
        default:
          return 'padding: 1.25rem;';
      }
    }}
  }
`;

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  padding = 'medium',
  variant = 'default',
  onClick,
  hoverable = false
}) => {
  return (
    <StyledCard
      $padding={padding}
      $variant={variant}
      $hoverable={hoverable || !!onClick}
      onClick={onClick}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </StyledCard>
  );
};

export default GlassCard;
